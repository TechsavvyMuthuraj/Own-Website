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

    const body = await request.json();
    const {
      customerEmail,
      amount,
      utrNumber,
      paymentProvider = "UPI",
      status = "PAID",
      resourceId,
    } = body;

    if (!amount || isNaN(Number(amount)) || Number(amount) < 0) {
      return NextResponse.json({ error: "Valid payment amount is required" }, { status: 400 });
    }

    const parsedAmount = Number(amount);
    const cleanUtr = (utrNumber || "").trim();
    const cleanEmail = (customerEmail || "").trim().toLowerCase();

    const supabaseAdmin = createAdminClient();

    // 2. Identify target user
    let targetUserId = user.id;
    if (cleanEmail) {
      const { data: matchedProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", cleanEmail)
        .single();

      if (matchedProfile?.id) {
        targetUserId = matchedProfile.id;
      }
    }

    // 3. Generate unique order number
    const orderNumber = `PAY-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 4. Create order record
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: targetUserId,
        order_number: orderNumber,
        subtotal: parsedAmount,
        discount: 0,
        total: parsedAmount,
        currency: "INR",
        status: status === "PENDING" ? "PENDING" : "PAID",
        payment_provider: paymentProvider.toUpperCase(),
        payment_id: cleanUtr || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Manual payment insertion error:", orderError);
      return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
    }

    // 5. If resourceId provided, add order item and grant entitlement if PAID
    if (resourceId) {
      await supabaseAdmin.from("order_items").insert({
        order_id: order.id,
        resource_id: resourceId,
        price: parsedAmount,
      });

      if (order.status === "PAID") {
        await supabaseAdmin.from("entitlements").upsert(
          {
            user_id: targetUserId,
            resource_id: resourceId,
            order_id: order.id,
            status: "ACTIVE",
          },
          { onConflict: "user_id,resource_id" }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully recorded!",
      order,
    });
  } catch (err) {
    console.error("Manual payment error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
