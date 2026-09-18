"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck,
  Check,
  Loader2,
  Layers,
} from "lucide-react";
import { useCart } from "@/lib/cart/cart-store";
import { formatCurrency } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { ResourceVisual } from "@/components/resources/resource-visual";

export default function CartPage() {
  const {
    items,
    removeItem,
    clearCart,
    subtotal,
    discount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });

      const data = await res.json();
      if (res.ok && data.coupon) {
        applyCoupon(data.coupon);
        setCouponInput("");
      } else {
        setCouponError(data.error || "Invalid coupon code.");
      }
    } catch {
      setCouponError("Failed to validate coupon. Check connection.");
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-1 flex flex-col justify-center">
        <EmptyState
          icon={ShoppingCart}
          title="Your shopping cart is empty"
          description="Explore our curated catalog of verified developer tools, software, templates, and digital assets."
          actionText="Explore Resources"
          actionHref="/explore"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)] mb-1">
          <ShoppingCart className="w-4 h-4" />
          <span>Checkout Bag</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
          Shopping Cart ({items.length})
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="divide-y divide-[var(--border)] rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 shadow-sm">
            {items.map(({ id, resource, price }) => (
              <div
                key={id}
                className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <ResourceVisual resource={resource} variant="icon" size="md" showFormatTag={false} className="!w-14 !h-14" />

                  <div className="min-w-0">
                    <Link
                      href={`/resource/${resource.slug}`}
                      className="font-semibold text-sm sm:text-base text-[var(--foreground)] hover:text-[var(--primary)] transition-colors truncate block"
                    >
                      {resource.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mt-0.5">
                      <span>{resource.category?.name || "General"}</span>
                      {resource.platform && <span>• {resource.platform}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="font-bold text-sm sm:text-base text-[var(--foreground)]">
                    {formatCurrency(price, resource.currency)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(id)}
                    className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center px-2 text-xs">
            <button
              type="button"
              onClick={clearCart}
              className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
            >
              Clear entire cart
            </button>
            <Link href="/explore" className="text-[var(--primary)] hover:underline font-medium">
              Continue shopping
            </Link>
          </div>
        </div>

        {/* Right 1 Column: Order Summary & Coupons */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-[var(--foreground)]">Order Summary</h3>

            {/* Coupon input */}
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-2">
                Have a promotional code?
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Tag className="w-4 h-4" />
                    <span>{appliedCoupon.code} applied</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-[var(--muted-foreground)] hover:text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="ENTER COUPON"
                      className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] font-mono uppercase placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-3 py-2 rounded-xl bg-[var(--secondary)] hover:bg-[var(--primary)] hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-500">{couponError}</p>}
                </form>
              )}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-[var(--border)] text-xs">
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
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--primary)] text-white font-semibold text-sm hover:bg-[var(--primary-hover)] transition-all shadow-md shadow-indigo-500/20"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Trust badge */}
            <div className="pt-2 flex items-center gap-2 text-[11px] text-[var(--muted-foreground)]">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Direct access upon verified payment.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
