import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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

    // Validate admin UTR — must be exactly 12 digits
    const adminUtr = (utrNumber || "").trim();
    if (!adminUtr) {
      return NextResponse.json(
        { error: "UTR number is required to verify the payment" },
        { status: 400 }
      );
    }
    if (!/^\d{12}$/.test(adminUtr)) {
      return NextResponse.json(
        { error: "UTR must be exactly 12 digits (numbers only)" },
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

    // 3. ── UTR MATCH CHECK ────────────────────────────────────────────────────
    // The user-submitted UTR is stored in payment_id (set during checkout).
    // Admin must enter the same UTR to confirm they verified the same transaction.
    const userUtr = (order.payment_id || "").trim();

    if (!userUtr) {
      // User hasn't submitted a UTR yet — admin cannot verify without it
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

    // 4. UTRs match — mark order as PAID ─────────────────────────────────────
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
    if (order.items && order.items.length > 0) {
      const entitlements = order.items.map((item: any) => ({
        user_id: order.user_id,
        resource_id: item.resource_id,
        order_id: order.id,
        status: "ACTIVE",
      }));
      await supabaseAdmin
        .from("entitlements")
        .upsert(entitlements, { onConflict: "user_id,resource_id" });
    }

    return NextResponse.json({ success: true, orderId: order.id, matchedUtr: adminUtr });
  } catch (err) {
    console.error("Admin order verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
