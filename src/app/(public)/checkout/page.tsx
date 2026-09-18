"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Clock,
  Download,
  ShoppingBag,
  ArrowLeft,
  AlertCircle,
  Tag,
  CheckCircle2,
  Bell,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/lib/cart/cart-store";
import { useAuth } from "@/lib/auth/auth-context";
import { formatCurrency } from "@/lib/utils";
import { UpiQrCard } from "@/components/payments/upi-qr-card";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, total, appliedCoupon, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [completedFreeOrder, setCompletedFreeOrder] = useState<any>(null);

  const [tempOrderNumber] = useState(
    () => `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`
  );

  if (items.length === 0 && !pendingOrder && !completedFreeOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--secondary)] text-[var(--muted-foreground)] flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Your cart is empty</h2>
        <p className="text-xs text-[var(--muted-foreground)] mb-6 max-w-xs">
          Select digital software, tools, or resources before proceeding to checkout.
        </p>
        <Link
          href="/explore"
          className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all shadow-md shadow-[#FD1843]/25"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  // Handle Free Order Checkout (total === 0)
  const handleClaimFreeOrder = async () => {
    if (!user) {
      router.push("/auth/login?redirect=/checkout");
      return;
    }

    setIsProcessing(true);
    setErrorMsg("");

    try {
      const createRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceIds: items.map((i) => i.resource.id),
          couponCode: appliedCoupon?.code,
        }),
      });

      const orderData = await createRes.json();
      if (!createRes.ok) {
        setErrorMsg(orderData.error || "Failed to process free order. Please try again.");
        setIsProcessing(false);
        return;
      }

      const orderItemsCopy = [...items];
      clearCart();
      setCompletedFreeOrder({
        orderNumber: orderData.orderNumber,
        items: orderItemsCopy,
      });
    } catch (err) {
      console.error("Free order checkout error:", err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle UPI Submission — creates PENDING order and stores UTR for admin review
  const handleConfirmUpiPayment = async (utr: string) => {
    if (!user) {
      router.push("/auth/login?redirect=/checkout");
      return;
    }

    // UTR is mandatory and must be exactly 12 digits
    const trimmedUtr = utr.trim();
    if (!trimmedUtr) {
      setErrorMsg("UTR number is required. Enter the 12-digit transaction reference from your UPI app after paying.");
      return;
    }
    if (!/^\d{12}$/.test(trimmedUtr)) {
      setErrorMsg("UTR number must be exactly 12 digits (numbers only). Find it in PhonePe / GPay / Paytm transaction details.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg("");

    try {
      // Create a PENDING order — admin will verify and unlock entitlements
      const createRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceIds: items.map((i) => i.resource.id),
          couponCode: appliedCoupon?.code,
          upiReference: trimmedUtr || undefined,
        }),
      });

      const orderData = await createRes.json();
      if (!createRes.ok) {
        setErrorMsg(orderData.error || "Failed to place order. Please try again.");
        setIsProcessing(false);
        return;
      }

      // Store the UTR on the order record for admin to see
      if (trimmedUtr) {
        await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderData.orderId,
            upiReference: trimmedUtr,
            pendingOnly: true, // flag: only record UTR, don't grant entitlements yet
          }),
        });
      }

      clearCart();
      setPendingOrder({
        orderNumber: orderData.orderNumber,
        total: orderData.total,
        items: [...items],
        utr: trimmedUtr || null,
      });
    } catch (err) {
      console.error("Checkout error:", err);
      setErrorMsg("Network error. Please check your connection and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // FREE ORDER COMPLETED SUCCESS STATE
  if (completedFreeOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 sm:py-16 w-full flex flex-col items-center justify-center text-center">
        <div className="p-6 sm:p-10 rounded-3xl border border-emerald-500/30 bg-[var(--card)] shadow-2xl shadow-emerald-500/10 w-full space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
              100% Free Order • Instantly Unlocked
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
              Downloads Ready! 🚀
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1.5 max-w-sm mx-auto">
              Order <strong className="font-mono text-[var(--foreground)]">#{completedFreeOrder.orderNumber}</strong> has been granted to your account. All items are now accessible in your Downloads section.
            </p>
          </div>

          <div className="rounded-2xl bg-[var(--secondary)]/60 border border-[var(--border)] p-4 text-left space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Claimed Items ({completedFreeOrder.items.length})
            </p>
            <div className="divide-y divide-[var(--border)]/60 max-h-48 overflow-y-auto">
              {completedFreeOrder.items.map(({ id, resource }: any) => (
                <div key={id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                  <p className="font-semibold text-xs text-[var(--foreground)] truncate">{resource.title}</p>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded flex-shrink-0">
                    Free
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/account/downloads"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Go to My Downloads</span>
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center py-3 px-5 rounded-2xl bg-[var(--secondary)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--border)] transition-all"
            >
              Continue Exploring
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // PENDING SUCCESS STATE — waiting for admin verification (Paid Orders)
  if (pendingOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 sm:py-16 w-full flex flex-col items-center justify-center text-center">
        <div className="p-6 sm:p-10 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl shadow-amber-500/10 w-full space-y-6 animate-in zoom-in-95 duration-300">
          {/* Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/10">
            <Clock className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          {/* Status Badge */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-3">
              Payment Submitted • Pending Admin Verification
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
              Order Placed!
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1.5 max-w-sm mx-auto">
              Order{" "}
              <strong className="font-mono text-[var(--foreground)]">
                #{pendingOrder.orderNumber}
              </strong>{" "}
              is placed. Your download will unlock once admin verifies your UPI payment.
            </p>
          </div>

          {/* Order Details Box */}
          <div className="rounded-2xl bg-[var(--secondary)]/60 border border-[var(--border)] p-4 text-left space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Order Summary
            </p>

            <div className="divide-y divide-[var(--border)]/60 max-h-40 overflow-y-auto pr-1">
              {pendingOrder.items.map(({ id, resource }: any) => (
                <div key={id} className="py-2 first:pt-0 last:pb-0">
                  <p className="font-semibold text-xs text-[var(--foreground)] truncate">{resource.title}</p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    {formatCurrency(resource.sale_price !== null ? resource.sale_price : resource.price)}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[var(--border)] flex justify-between items-center text-xs font-bold text-[var(--foreground)]">
              <span>Total Paid</span>
              <span className="text-base text-[#FD1843]">{formatCurrency(pendingOrder.total)}</span>
            </div>

            {pendingOrder.utr && (
              <div className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs flex justify-between items-center">
                <span className="text-[var(--muted-foreground)]">UTR Submitted:</span>
                <span className="font-mono font-bold text-[var(--foreground)]">{pendingOrder.utr}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/account/orders"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-xs transition-all shadow-md shadow-[#FD1843]/25"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Order in Account</span>
            </Link>
            <Link
              href="/account/downloads"
              className="inline-flex items-center justify-center py-3 px-5 rounded-2xl bg-[var(--secondary)] text-xs font-medium text-[var(--foreground)] hover:bg-[var(--border)] transition-all"
            >
              My Downloads
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isFreeCheckout = total === 0;

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-6 sm:py-10 flex flex-col items-center text-center">
      {/* Back Button */}
      <div className="w-full flex items-center justify-between mb-5">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </Link>
        <span className="text-xs text-[var(--muted-foreground)] font-mono">
          Ref: #{tempOrderNumber}
        </span>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="w-full max-w-md p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5 mb-5 text-left animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {/* Guest Login Warning */}
      {!user && !authLoading && (
        <div className="w-full max-w-md p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-between gap-3 mb-5 text-left">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="text-[var(--foreground)]">
              Sign in to automatically link this purchase to your permanent account.
            </span>
          </div>
          <Link
            href="/auth/login?redirect=/checkout"
            className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all flex-shrink-0"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Center Card Container */}
      <div className="w-full max-w-md p-4 sm:p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl space-y-5">
        {/* Order Summary */}
        <div className="p-3.5 rounded-2xl bg-[var(--secondary)]/60 border border-[var(--border)] text-left space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--foreground)]">
            <span>
              Order Summary ({items.length} {items.length === 1 ? "item" : "items"})
            </span>
            <span className="text-[#FD1843] font-bold">{formatCurrency(total)}</span>
          </div>

          <div className="divide-y divide-[var(--border)]/60 max-h-36 overflow-y-auto pr-1 text-xs">
            {items.map(({ id, resource, price }) => (
              <div
                key={id}
                className="py-1.5 first:pt-0 last:pb-0 flex justify-between items-center text-[11px]"
              >
                <span className="truncate pr-2 text-[var(--foreground)]">{resource.title}</span>
                <span className="font-semibold text-[var(--foreground)] flex-shrink-0">
                  {formatCurrency(price, resource.currency)}
                </span>
              </div>
            ))}
          </div>

          {discount > 0 && (
            <div className="pt-2 border-t border-[var(--border)]/60 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Coupon Applied
              </span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
        </div>

        {/* Free Order vs UPI Payment QR Card */}
        {isFreeCheckout ? (
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-[var(--foreground)]">100% Free Order</h3>
              <p className="text-[11px] text-[var(--muted-foreground)] max-w-xs mx-auto">
                No payment needed. Click below to claim all free items into your downloads library immediately.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClaimFreeOrder}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/25 disabled:opacity-50 active:scale-[0.99]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Unlocking Downloads...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Claim & Download Free Now</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <UpiQrCard
            amount={total}
            orderNumber={tempOrderNumber}
            upiId="muthurajc@slc"
            payeeName="Techsavvy Muthuraj"
            onConfirmPayment={handleConfirmUpiPayment}
            isProcessing={isProcessing}
          />
        )}
      </div>

      {/* Security note */}
      <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[var(--muted-foreground)]">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Direct UPI Payment • Zero Extra Fees • Admin Verified Delivery</span>
      </div>
    </div>
  );
}
