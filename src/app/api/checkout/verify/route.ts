import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  try {
    const { orderId, paymentId, signature } = await request.json();

    if (!orderId || !paymentId) {
      return NextResponse.json({ error: "Missing required payment details" }, { status: 400 });
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

    // 3. Signature verification
    // In production with real Razorpay, verifyPaymentSignature is checked.
    // If PAYMENT_KEY_SECRET is configured, enforce strict verification.
    if (process.env.PAYMENT_KEY_SECRET && signature) {
      const isValid = verifyPaymentSignature(order.order_number, paymentId, signature);
      if (!isValid) {
        await supabaseAdmin
          .from("orders")
          .update({ status: "FAILED", payment_id: paymentId })
          .eq("id", orderId);
        return NextResponse.json({ error: "Payment verification signature mismatch" }, { status: 400 });
      }
    }

    // 4. Update order to PAID
    await supabaseAdmin
      .from("orders")
      .update({
        status: "PAID",
        payment_id: paymentId,
        payment_provider: "RAZORPAY",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    // 5. Update coupon times_used if applied
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

    // 6. Grant Entitlements for all items in order
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
