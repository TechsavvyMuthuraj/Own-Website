import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const { orderId, paymentId, upiReference } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing required order ID" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Fetch order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. If already PAID, return idempotent success
    if (order.status === "PAID") {
      return NextResponse.json({ success: true, message: "Order is already verified as paid" });
    }

    const recordedUpiRef = upiReference || paymentId || `UPI_TXN_${Date.now()}`;

    // 3. Update order to PAID with UPI payment provider
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "PAID",
        payment_id: recordedUpiRef,
        payment_provider: "UPI",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Order update error:", updateError);
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
    }

    // 4. Update coupon times_used if applied
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

    // 5. Grant Entitlements for all items in order
    if (order.items && order.items.length > 0) {
      const entitlementsToInsert = order.items.map((item: any) => ({
        user_id: order.user_id,
        resource_id: item.resource_id,
        order_id: order.id,
        status: "ACTIVE",
      }));

      // Upsert to prevent duplicate entitlement violations
      await supabaseAdmin
        .from("entitlements")
        .upsert(entitlementsToInsert, { onConflict: "user_id,resource_id" });
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err) {
    console.error("Payment verification error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
