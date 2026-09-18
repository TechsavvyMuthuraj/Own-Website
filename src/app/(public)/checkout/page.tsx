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

  const [tempOrderNumber] = useState(
    () => `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`
  );

  if (items.length === 0 && !pendingOrder) {
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

  // PENDING SUCCESS STATE — waiting for admin verification
  if (pendingOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 sm:py-16 w-full flex flex-col items-center justify-center text-center">
        <div className="p-6 sm:p-10 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl shadow-amber-500/10 w-full space-y-6 animate-in zoom-in-95 duration-300">
          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/10">
            <Clock className="w-10 h-10" />
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

            <div className="divide-y divide-[var(--border)]/60">
              {pendingOrder.items.map(({ id, resource }: any) => (
                <div key={id} className="py-2 first:pt-0 last:pb-0">
                  <p className="font-semibold text-xs text-[var(--foreground)] truncate">{resource.title}</p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    License: {resource.license || "Full Access"}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[var(--border)]/60 flex justify-between items-center">
              <span className="text-xs text-[var(--muted-foreground)]">Total Paid</span>
              <span className="font-bold text-sm text-[#FD1843]">
                {formatCurrency(pendingOrder.total)}
              </span>
            </div>

            {pendingOrder.utr && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--muted-foreground)]">UTR Number</span>
                <span className="font-mono font-bold text-[var(--foreground)] bg-[var(--secondary)] px-2 py-0.5 rounded-lg">
                  {pendingOrder.utr}
                </span>
              </div>
            )}
          </div>

          {/* Info Notice */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/15 text-left">
            <Bell className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--muted-foreground)]">
              Admin will verify your payment shortly. Once approved, your products will
              automatically appear in{" "}
              <strong className="text-[var(--foreground)]">My Downloads</strong>. This usually takes
              a few minutes.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
            <Link
              href="/account/downloads"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold transition-all shadow-md shadow-[#FD1843]/25"
            >
              <Download className="w-4 h-4" />
              <span>Check My Downloads</span>
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] text-xs font-semibold text-[var(--foreground)] transition-all"
            >
              <span>Explore More</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 w-full flex flex-col items-center justify-center text-center">
      {/* Top Header */}
      <div className="mb-6 space-y-2">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Cart</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
          Checkout &amp; UPI Payment
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-md mx-auto">
          Scan the QR or open your UPI app. Enter your 12-digit UTR after paying and click confirm.
        </p>
      </div>

      {errorMsg && (
        <div className="w-full max-w-md p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 mb-6 text-left">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Account Check Notice */}
      {!user && !authLoading && (
        <div className="w-full max-w-md p-4 rounded-2xl bg-[#FD1843]/10 border border-[#FD1843]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 text-left">
          <div>
            <p className="text-xs font-bold text-[var(--foreground)]">Sign in to save downloads</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Your digital licenses will be tied to your account.
            </p>
          </div>
          <Link
            href="/auth/login?redirect=/checkout"
            className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all flex-shrink-0"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Admin Verification Notice */}
      <div className="w-full max-w-md p-3.5 rounded-2xl bg-amber-500/8 border border-amber-500/20 flex items-start gap-2.5 mb-5 text-left">
        <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--muted-foreground)]">
          <strong className="text-[var(--foreground)]">Manual verification:</strong> After paying, enter your
          12-digit UTR number. Admin will verify and unlock your download within minutes.
        </p>
      </div>

      {/* Center Card Container */}
      <div className="w-full max-w-md p-5 sm:p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl space-y-6">
        {/* Order Summary */}
        <div className="p-4 rounded-2xl bg-[var(--secondary)]/60 border border-[var(--border)] text-left space-y-2.5">
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

        {/* Dynamic UPI QR Card */}
        <UpiQrCard
          amount={total}
          orderNumber={tempOrderNumber}
          upiId="muthurajc@slc"
          payeeName="Techsavvy Muthuraj"
          onConfirmPayment={handleConfirmUpiPayment}
          isProcessing={isProcessing}
        />
      </div>

      {/* Security note */}
      <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[var(--muted-foreground)]">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Direct UPI Payment • Zero Extra Fees • Admin Verified Delivery</span>
      </div>
    </div>
  );
}
