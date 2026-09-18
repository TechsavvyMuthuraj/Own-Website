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
      // Check role in profiles table
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

    // Validate UTR: must be 12 digits if provided
    if (utrNumber && !/^\d{12}$/.test(utrNumber.trim())) {
      return NextResponse.json(
        { error: "UTR must be exactly 12 digits" },
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

    const paymentRef = utrNumber?.trim() || `ADMIN_VERIFIED_${Date.now()}`;

    // 3. Mark order as PAID
    await supabaseAdmin
      .from("orders")
      .update({
        status: "PAID",
        payment_id: paymentRef,
        payment_provider: "UPI",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    // 4. Update coupon usage
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

    // 5. Grant entitlements for all items
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

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err) {
    console.error("Admin order verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
