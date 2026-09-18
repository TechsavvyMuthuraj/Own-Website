import crypto from "crypto";

export interface PaymentOrderParams {
  amount: number; // in minor units (e.g. paise for INR)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret?: string
): boolean {
  const keySecret = secret || process.env.PAYMENT_KEY_SECRET;
  if (!keySecret) {
    console.error("Payment secret key is not configured.");
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(generatedSignature, "utf-8"),
    Buffer.from(signature, "utf-8")
  );
}

export function verifyWebhookSignature(
  payloadBody: string,
  webhookSignature: string,
  webhookSecret?: string
): boolean {
  const secret = webhookSecret || process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Payment webhook secret is not configured.");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadBody)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, "utf-8"),
    Buffer.from(webhookSignature, "utf-8")
  );
}
