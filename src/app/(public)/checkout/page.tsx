"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  User,
  Phone,
} from "lucide-react";
import { useCart } from "@/lib/cart/cart-store";
import { useAuth } from "@/lib/auth/auth-context";
import { formatCurrency } from "@/lib/utils";
import { UpiQrCard } from "@/components/payments/upi-qr-card";

export default function CheckoutPage() {
  const { items, subtotal, discount, total, appliedCoupon, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [completedFreeOrder, setCompletedFreeOrder] = useState<any>(null);

  // Guest contact info (only used when not signed in)
  const [guestName, setGuestName] = useState("");
  const [guestWhatsApp, setGuestWhatsApp] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

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

  const isGuest = !user && !authLoading;

  const validateGuestFields = (): boolean => {
    if (!isGuest) return true;
    const name = guestName.trim();
    const wa = guestWhatsApp.trim();
    if (!name) {
      setErrorMsg("Please enter your name to continue as a guest.");
      return false;
    }
    if (!wa || !/^[6-9]\d{9}$/.test(wa)) {
      setErrorMsg("Please enter a valid 10-digit Indian WhatsApp number.");
      return false;
    }
    return true;
  };

  // Handle Free Order Checkout (total === 0)
  const handleClaimFreeOrder = async () => {
    if (!validateGuestFields()) return;

    setIsProcessing(true);
    setErrorMsg("");

    try {
      const createRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceIds: items.map((i) => i.resource.id),
          couponCode: appliedCoupon?.code,
          ...(isGuest && {
            customerName: guestName.trim(),
            whatsappNumber: guestWhatsApp.trim(),
            customerEmail: guestEmail.trim() || undefined,
          }),
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
        isGuest,
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
    if (!validateGuestFields()) return;

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
      // Create a PENDING order
      const createRes = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceIds: items.map((i) => i.resource.id),
          couponCode: appliedCoupon?.code,
          upiReference: trimmedUtr || undefined,
          ...(isGuest && {
            customerName: guestName.trim(),
            whatsappNumber: guestWhatsApp.trim(),
            customerEmail: guestEmail.trim() || undefined,
          }),
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
            pendingOnly: true,
          }),
        });
      }

      clearCart();
      setPendingOrder({
        orderNumber: orderData.orderNumber,
        total: orderData.total,
        items: [...items],
        utr: trimmedUtr || null,
        isGuest,
        guestWhatsApp: isGuest ? guestWhatsApp.trim() : null,
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
              Order <strong className="font-mono text-[var(--foreground)]">#{completedFreeOrder.orderNumber}</strong>{" "}
              {completedFreeOrder.isGuest
                ? "is confirmed. All free items are ready to download directly."
                : "has been granted to your account. All items are now accessible in your Downloads section."}
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
            {!completedFreeOrder.isGuest ? (
              <Link
                href="/account/downloads"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Go to My Downloads</span>
              </Link>
            ) : (
              <Link
                href="/explore"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explore More Resources</span>
              </Link>
            )}
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

  // PENDING SUCCESS STATE
  if (pendingOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 sm:py-16 w-full flex flex-col items-center justify-center text-center">
        <div className="p-6 sm:p-10 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl shadow-amber-500/10 w-full space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/10">
            <Clock className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

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
              is placed.{" "}
              {pendingOrder.isGuest
                ? <>Once admin verifies your payment, your <strong>secure download link will be sent to your WhatsApp</strong> {pendingOrder.guestWhatsApp ? `(${pendingOrder.guestWhatsApp})` : ""}.</>
                : "Your download will unlock once admin verifies your UPI payment."}
            </p>
          </div>

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

          {pendingOrder.isGuest && (
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-left flex items-start gap-2.5">
              <Bell className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--foreground)]">
                Your secure download link will be sent via <strong>WhatsApp</strong> after payment is verified (typically within a few hours).{" "}
                <Link href="/auth/register" className="text-[var(--primary)] hover:underline font-semibold">
                  Create a free account
                </Link>{" "}
                to track orders and access downloads from your dashboard.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {!pendingOrder.isGuest && (
              <Link
                href="/account/orders"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-xs transition-all shadow-md shadow-[#FD1843]/25"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View Order in Account</span>
              </Link>
            )}
            <Link
              href="/explore"
              className="flex-1 inline-flex items-center justify-center py-3 px-5 rounded-2xl bg-[var(--secondary)] text-xs font-medium text-[var(--foreground)] hover:bg-[var(--border)] transition-all"
            >
              Continue Exploring
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

      {/* Optional Sign-In Hint (non-blocking) */}
      {!user && !authLoading && (
        <div className="w-full max-w-md p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs flex items-center justify-between gap-3 mb-5 text-left">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-[var(--foreground)]">
              Sign in to automatically link this purchase to your account for easy re-downloads.
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

      {/* Guest Contact Info (only when not signed in) */}
      {isGuest && (
        <div className="w-full max-w-md p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] mb-5 text-left space-y-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            Your Contact Details (Required for Guest Checkout)
          </p>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
              <span className="text-red-500">*</span> Your Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/30 transition-all"
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
              <span className="text-red-500">*</span> WhatsApp Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <input
                type="tel"
                value={guestWhatsApp}
                onChange={(e) => setGuestWhatsApp(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit number (e.g. 9876543210)"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/30 transition-all"
              />
            </div>
            <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
              After payment verification, your secure download link will be sent here via WhatsApp.
            </p>
          </div>

          {/* Email (optional) */}
          <div>
            <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
              Email Address <span className="text-[var(--muted-foreground)] font-normal">(optional)</span>
            </label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/30 transition-all"
            />
          </div>
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
                No payment needed. Click below to claim all free items immediately.
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
                  <span>Processing…</span>
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
