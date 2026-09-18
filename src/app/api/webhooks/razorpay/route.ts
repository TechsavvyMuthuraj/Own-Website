import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
    }

    // Verify webhook signature if secret is configured
    if (process.env.PAYMENT_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    const supabaseAdmin = createAdminClient();

    // Check event type
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const payment = event.payload.payment?.entity;
      const orderNumber = payment?.notes?.orderNumber || payment?.order_id;
      const paymentId = payment?.id;

      if (orderNumber) {
        // Find order
        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("*, items:order_items(*)")
          .or(`order_number.eq.${orderNumber},payment_id.eq.${payment?.order_id}`)
          .maybeSingle();

        if (order && order.status !== "PAID") {
          // Idempotently update order to PAID
          await supabaseAdmin
            .from("orders")
            .update({
              status: "PAID",
              payment_id: paymentId,
              payment_provider: "RAZORPAY",
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id);

          // Grant Entitlements
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
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
