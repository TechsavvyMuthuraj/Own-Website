import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";

export async function POST(request: Request) {
  try {
    // 1. Authenticate — must be a signed-in admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    const isDesignatedAdmin = user.email && adminEmails.includes(user.email.toLowerCase());

    if (!isDesignatedAdmin) {
      const supabaseAdmin = createAdminClient();
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPER_ADMIN")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const { orderId, utrNumber } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // Validate admin UTR — must be non-empty
    const adminUtr = (utrNumber || "").trim();
    if (!adminUtr) {
      return NextResponse.json(
        { error: "UTR/reference number is required to verify the payment" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 2. Fetch order with items
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "PAID") {
      return NextResponse.json({ success: true, message: "Already verified" });
    }

    // 3. UTR MATCH CHECK
    const userUtr = (order.payment_id || "").trim();

    if (!userUtr) {
      return NextResponse.json(
        {
          error: "User has not submitted a UTR number yet. Ask the user to add their UTR first.",
          code: "NO_USER_UTR",
        },
        { status: 422 }
      );
    }

    if (adminUtr !== userUtr) {
      return NextResponse.json(
        {
          error: `UTR mismatch. You entered ${adminUtr} but user submitted ${userUtr}. Enter the exact same UTR to verify.`,
          code: "UTR_MISMATCH",
          userUtr,
          adminUtr,
        },
        { status: 409 }
      );
    }

    // 4. UTRs match — mark order as PAID
    await supabaseAdmin
      .from("orders")
      .update({
        status: "PAID",
        payment_id: adminUtr,
        payment_provider: "UPI",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    // 5. Update coupon usage
    if (order.coupon_code) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("times_used")
        .eq("code", order.coupon_code)
        .single();
      if (coupon) {
        await supabaseAdmin
          .from("coupons")
          .update({ times_used: (coupon.times_used || 0) + 1 })
          .eq("code", order.coupon_code);
      }
    }

    // 6. Grant entitlements for all items
    let accessToken: string | null = null;
    const isGuestOrder = !order.user_id;

    if (order.items && order.items.length > 0) {
      if (isGuestOrder) {
        // Guest order: generate one secure access_token per entitlement
        // (For simplicity, one token covers all items in this order)
        const entitlements = await Promise.all(
          order.items.map(async (item: any) => {
            const token = randomBytes(24).toString("hex");
            if (!accessToken) accessToken = token; // return first token for the link
            return {
              user_id: null,
              resource_id: item.resource_id,
              order_id: order.id,
              status: "ACTIVE",
              access_token: token,
              customer_name: order.customer_name || null,
              whatsapp_number: order.whatsapp_number || null,
              verified_at: new Date().toISOString(),
              verified_by: user.email || user.id,
            };
          })
        );
        await supabaseAdmin.from("entitlements").insert(entitlements);
      } else {
        // Authenticated user: standard entitlement (no token needed)
        const entitlements = order.items.map((item: any) => ({
          user_id: order.user_id,
          resource_id: item.resource_id,
          order_id: order.id,
          status: "ACTIVE",
          verified_at: new Date().toISOString(),
          verified_by: user.email || user.id,
        }));
        await supabaseAdmin
          .from("entitlements")
          .upsert(entitlements, { onConflict: "user_id,resource_id" });
      }
    }

    // 7. Build access link for guest orders
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://techsavvymuthuraj.dev";
    const accessLink = isGuestOrder && accessToken ? `${baseUrl}/access/${accessToken}` : null;

    return NextResponse.json({
      success: true,
      orderId: order.id,
      matchedUtr: adminUtr,
      isGuestOrder,
      accessLink,
      accessToken,
      customerName: order.customer_name,
      whatsappNumber: order.whatsapp_number,
    });
  } catch (err) {
    console.error("Admin order verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
