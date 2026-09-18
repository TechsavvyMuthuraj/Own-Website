"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Tag, Loader2, AlertCircle } from "lucide-react";
import type { Coupon } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

export function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("0");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          discount_type: discountType,
          discount_value: Number(discountValue),
          min_order: Number(minOrder) || 0,
          max_discount: maxDiscount ? Number(maxDiscount) : null,
          usage_limit: usageLimit ? Number(usageLimit) : null,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create coupon.");
      } else {
        setCode("");
        setDiscountValue("");
        setMaxDiscount("");
        setShowAddForm(false);
        router.refresh();
      }
    } catch {
      setErrorMsg("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (!confirm(`Delete coupon "${couponCode}"?`)) return;
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) router.refresh();
    } catch {
      alert("Error deleting coupon.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Cancel" : "Create Coupon"}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
            New Coupon Code
          </h3>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="WELCOME20"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Value ({discountType === "PERCENTAGE" ? "%" : "₹"}) *
              </label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="20"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Min Order (₹)
              </label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Max Discount (₹)
              </label>
              <input
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Usage Limit (Total uses)
              </label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Expiration Date
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Coupon"}
          </button>
        </form>
      )}

      {initialCoupons.length > 0 ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--secondary)]/60 text-[var(--muted-foreground)] uppercase font-semibold border-b border-[var(--border)]">
              <tr>
                <th className="px-5 py-3.5">Code</th>
                <th className="px-4 py-3.5">Discount</th>
                <th className="px-4 py-3.5">Min Order</th>
                <th className="px-4 py-3.5">Usage</th>
                <th className="px-4 py-3.5">Expires</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {initialCoupons.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--secondary)]/30 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-[var(--foreground)]">
                    {c.code}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-emerald-600">
                    {c.discount_type === "PERCENTAGE"
                      ? `${c.discount_value}%`
                      : `₹${c.discount_value}`}
                  </td>
                  <td className="px-4 py-3.5 font-mono">₹{c.min_order}</td>
                  <td className="px-4 py-3.5 font-mono">
                    {c.times_used} / {c.usage_limit ?? "∞"}
                  </td>
                  <td className="px-4 py-3.5 text-[var(--muted-foreground)]">
                    {c.expires_at ? formatDate(c.expires_at) : "Never"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id, c.code)}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"
                      title="Delete coupon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Tag}
          title="No promotional coupons active"
          description="Create discount codes to offer promotions for commercial digital products."
          actionText="Create First Coupon"
          onAction={() => setShowAddForm(true)}
        />
      )}
    </div>
  );
}
