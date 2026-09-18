"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Download,
  ShoppingBag,
  ArrowLeft,
  AlertCircle,
  Tag,
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
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Generate temporary client order ref for prefilling QR note
  const [tempOrderNumber] = useState(
    () => `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`
  );

  if (items.length === 0 && !completedOrder) {
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

  // Handle UPI Confirmation
  const handleConfirmUpiPayment = async (utr: string) => {
    if (!user) {
      router.push("/auth/login?redirect=/checkout");
      return;
    }

    setIsProcessing(true);
    setErrorMsg("");

    try {
      // 1. Create order on server
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
        setErrorMsg(orderData.error || "Failed to initialize order.");
        setIsProcessing(false);
        return;
      }

      // 2. Verify and grant instant digital entitlements
      const verifyRes = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.orderId,
          upiReference: utr || `UPI_${Date.now()}`,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        clearCart();
        setCompletedOrder({
          orderNumber: orderData.orderNumber,
          total: orderData.total,
          items: [...items],
          utr: utr || "Verified via UPI",
        });
      } else {
        setErrorMsg(verifyData.error || "Payment verification could not be completed.");
      }
    } catch (err) {
      console.error("Checkout payment confirmation error:", err);
      setErrorMsg("Network error occurred during payment verification.");
    } finally {
      setIsProcessing(false);
    }
  };

  // SUCCESS STATE
  if (completedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 w-full flex flex-col items-center justify-center text-center">
        <div className="p-8 sm:p-10 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl shadow-emerald-500/10 w-full space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-2">
              Payment Confirmed • Digital Access Ready
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
              Order Confirmed!
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
              Order <strong className="font-mono text-[var(--foreground)]">#{completedOrder.orderNumber}</strong> has been processed. Your digital licenses are unlocked!
            </p>
          </div>

          {/* Purchased Items List with Direct Download Links */}
          <div className="divide-y divide-[var(--border)] rounded-2xl bg-[var(--secondary)]/60 border border-[var(--border)] p-4 text-left text-xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Your Unlocked Products
            </span>
            {completedOrder.items.map(({ id, resource }: any) => (
              <div key={id} className="pt-3 first:pt-2 flex items-center justify-between gap-3">
                <div className="truncate">
                  <p className="font-bold text-[var(--foreground)] truncate">{resource.title}</p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">License: {resource.license || "Full Access"}</p>
                </div>

                <Link
                  href={`/resource/${resource.slug}/download`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--primary)] text-white font-semibold text-xs hover:bg-[var(--primary-hover)] transition-all shadow-sm flex-shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </Link>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/account/downloads"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/25"
            >
              <span>Go to My Downloads</span>
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] text-xs font-semibold text-[var(--foreground)] transition-all"
            >
              <span>Explore More Resources</span>
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
          Checkout &amp; Instant UPI Payment
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-md mx-auto">
          Scan the dynamic QR code with any UPI app. The exact total is prefilled automatically!
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
        <div className="w-full max-w-md p-4 rounded-2xl bg-[#FD1843]/10 border border-[#FD1843]/20 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 text-left">
          <div>
            <p className="text-xs font-bold text-[var(--foreground)]">Sign in to save downloads</p>
            <p className="text-[11px] text-[var(--muted-foreground)]">Your digital licenses will be tied to your account.</p>
          </div>
          <Link
            href="/auth/login?redirect=/checkout"
            className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all flex-shrink-0"
          >
            Sign In
          </Link>
        </div>
      )}

      {/* Center Card Container */}
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl space-y-6">
        {/* Order Items Collapsible Summary */}
        <div className="p-4 rounded-2xl bg-[var(--secondary)]/60 border border-[var(--border)] text-left space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--foreground)]">
            <span>Order Summary ({items.length} {items.length === 1 ? "item" : "items"})</span>
            <span className="text-[#FD1843] font-bold">{formatCurrency(total)}</span>
          </div>

          <div className="divide-y divide-[var(--border)]/60 max-h-36 overflow-y-auto pr-1 text-xs">
            {items.map(({ id, resource, price }) => (
              <div key={id} className="py-1.5 first:pt-0 last:pb-0 flex justify-between items-center text-[11px]">
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

        {/* Dynamic UPI QR Card Component */}
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
        <span>Direct UPI Payment • Zero Extra Fees • Instant Digital Delivery</span>
      </div>
    </div>
  );
}
