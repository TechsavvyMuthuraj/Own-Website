"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Download,
} from "lucide-react";
import { useCart } from "@/lib/cart/cart-store";
import { useAuth } from "@/lib/auth/auth-context";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, total, appliedCoupon, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "MANUAL_UPI">("RAZORPAY");
  const [upiReference, setUpiReference] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  if (items.length === 0 && !completedOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Your cart is empty</h2>
        <p className="text-xs text-[var(--muted-foreground)] mb-6">
          Add digital items to your cart before proceeding to checkout.
        </p>
        <Link
          href="/explore"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  const handleProcessCheckout = async () => {
    if (!user) {
      router.push("/auth/login?redirect=/checkout");
      return;
    }

    setIsProcessing(true);
    setErrorMsg("");

    try {
      // 1. Create order on server
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceIds: items.map((i) => i.resource.id),
          couponCode: appliedCoupon?.code,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        setErrorMsg(orderData.error || "Failed to initialize order.");
        setIsProcessing(false);
        return;
      }

      if (paymentMethod === "RAZORPAY") {
        // In real production environment: Razorpay Checkout modal loads.
        // We simulate calling the server verification endpoint for sandbox flow.
        const mockPaymentId = `pay_${Date.now()}`;
        const verifyRes = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderData.orderId,
            paymentId: mockPaymentId,
            signature: "verified",
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.success) {
          clearCart();
          setCompletedOrder({
            orderNumber: orderData.orderNumber,
            total: orderData.total,
            items: [...items],
          });
        } else {
          setErrorMsg(verifyData.error || "Payment verification failed.");
        }
      } else {
        // Manual UPI: Log order with pending status for admin manual verification
        clearCart();
        setCompletedOrder({
          orderNumber: orderData.orderNumber,
          total: orderData.total,
          isManualUpi: true,
          items: [...items],
        });
      }
    } catch (err) {
      console.error("Checkout submission failed:", err);
      setErrorMsg("Network error occurred during checkout.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 w-full text-center">
        <div className="p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 ring-1 ring-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {completedOrder.isManualUpi ? "Order Submitted" : "Payment Verified"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight mt-1 mb-2">
            {completedOrder.isManualUpi ? "UPI Payment Under Review" : "Order Confirmed!"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-md mx-auto mb-6">
            {completedOrder.isManualUpi
              ? `Your order #${completedOrder.orderNumber} has been received. Access will be unlocked as soon as the reference is verified by an administrator.`
              : `Order #${completedOrder.orderNumber} is complete. Your purchased digital entitlements are now active in your account.`}
          </p>

          <div className="divide-y divide-[var(--border)] rounded-2xl bg-[var(--secondary)]/50 p-4 mb-8 text-left text-xs">
            {completedOrder.items.map(({ id, resource }: any) => (
              <div key={id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                <span className="font-medium text-[var(--foreground)]">{resource.title}</span>
                {!completedOrder.isManualUpi && (
                  <Link
                    href={`/resource/${resource.slug}/download`}
                    className="inline-flex items-center gap-1 font-semibold text-[var(--primary)] hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/account/downloads"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all"
            >
              <span>View My Downloads</span>
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-all"
            >
              <span>Explore More Resources</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
          Checkout & Digital Fulfillment
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Complete your purchase securely. Digital access is provisioned immediately upon verified payment.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* User Login Notice */}
      {!user && !authLoading && (
        <div className="p-5 rounded-2xl bg-[#FD1843]/10 border border-[#FD1843]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h4 className="text-sm font-semibold text-[var(--foreground)]">
              Account required for digital delivery
            </h4>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Please sign in or create an account so your digital license can be linked to your profile.
            </p>
          </div>
          <Link
            href="/auth/login?redirect=/checkout"
            className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all flex-shrink-0"
          >
            Sign In to Continue
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Cols: Payment Method Selection */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[var(--foreground)]">Payment Method</h3>

            {/* Option 1: Razorpay / Online UPI */}
            <label
              className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === "RAZORPAY"
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--border)] hover:bg-[var(--secondary)]"
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "RAZORPAY"}
                onChange={() => setPaymentMethod("RAZORPAY")}
                className="mt-1 text-[var(--primary)]"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    Online Payment (UPI, Cards, Netbanking)
                  </span>
                  <CreditCard className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Instant automated verification. Access unlocked immediately.
                </p>
              </div>
            </label>

            {/* Option 2: Manual UPI QR */}
            <label
              className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === "MANUAL_UPI"
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--border)] hover:bg-[var(--secondary)]"
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "MANUAL_UPI"}
                onChange={() => setPaymentMethod("MANUAL_UPI")}
                className="mt-1 text-[var(--primary)]"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    Manual UPI QR (Optional)
                  </span>
                  <QrCode className="w-4 h-4 text-cyan-500" />
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Pay via QR and provide the UTR / Transaction Reference. Unlocked after administrative verification.
                </p>
              </div>
            </label>

            {paymentMethod === "MANUAL_UPI" && (
              <div className="p-4 rounded-2xl bg-[var(--secondary)] space-y-3 text-xs">
                <p className="font-semibold text-[var(--foreground)]">
                  Scan UPI QR & Transfer Exact Total: {formatCurrency(total)}
                </p>
                <div className="p-3 bg-[var(--card)] rounded-xl border border-[var(--border)] font-mono text-center text-sm font-bold text-[#FD1843]">
                  upi-id@bank
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[var(--foreground)] mb-1">
                    Enter UTR / 12-digit UPI Reference Number
                  </label>
                  <input
                    type="text"
                    value={upiReference}
                    onChange={(e) => setUpiReference(e.target.value)}
                    placeholder="e.g. 423456789012"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  />
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                    *Access is provisioned after administrative reconciliation. Uploaded screenshots are NOT automatically trusted.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Summary & Pay Button */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[var(--foreground)]">Items ({items.length})</h3>

            <div className="divide-y divide-[var(--border)] max-h-48 overflow-y-auto pr-1 text-xs">
              {items.map(({ id, resource, price }) => (
                <div key={id} className="py-2 first:pt-0 last:pb-0 flex justify-between">
                  <span className="truncate pr-2 text-[var(--foreground)]">{resource.title}</span>
                  <span className="font-medium text-[var(--foreground)] flex-shrink-0">
                    {formatCurrency(price, resource.currency)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[var(--border)] space-y-2 text-xs">
              <div className="flex justify-between text-[var(--muted-foreground)]">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Discount:</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[var(--foreground)] pt-2 border-t border-[var(--border)]">
                <span>Total Amount:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleProcessCheckout}
              disabled={isProcessing || !user || (paymentMethod === "MANUAL_UPI" && !upiReference.trim())}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold text-sm hover:bg-[var(--primary-hover)] transition-all shadow-md shadow-[#FD1843]/25 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay {formatCurrency(total)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
