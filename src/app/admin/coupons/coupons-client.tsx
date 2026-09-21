"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit2, Tag, Loader2, AlertCircle, Check, X } from "lucide-react";
import type { Coupon } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

export function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const router = useRouter();
  const { showToast, confirm } = useToast();
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit Coupon Modal state
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editDiscountType, setEditDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [editDiscountValue, setEditDiscountValue] = useState("");
  const [editMinOrder, setEditMinOrder] = useState("0");
  const [editMaxDiscount, setEditMaxDiscount] = useState("");
  const [editUsageLimit, setEditUsageLimit] = useState("");
  const [editExpiresAt, setEditExpiresAt] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [editErrorMsg, setEditErrorMsg] = useState("");

  const openEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setEditCode(c.code);
    setEditDiscountType(c.discount_type as "PERCENTAGE" | "FIXED");
    setEditDiscountValue(String(c.discount_value));
    setEditMinOrder(String(c.min_order ?? 0));
    setEditMaxDiscount(c.max_discount ? String(c.max_discount) : "");
    setEditUsageLimit(c.usage_limit ? String(c.usage_limit) : "");
    setEditExpiresAt(c.expires_at ? c.expires_at.split("T")[0] : "");
    setEditIsActive(c.is_active ?? true);
    setEditErrorMsg("");
  };

  const closeEditModal = () => {
    setEditingCoupon(null);
    setEditErrorMsg("");
  };

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
        showToast({
          type: "error",
          title: "Create Failed",
          message: data.error || "Failed to create coupon.",
        });
      } else {
        showToast({
          type: "success",
          title: "Coupon Created 🏷️",
          message: `Code "${code.toUpperCase()}" created successfully.`,
        });
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon || !editCode.trim() || !editDiscountValue) return;

    setEditLoading(true);
    setEditErrorMsg("");

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCoupon.id,
          code: editCode.trim(),
          discount_type: editDiscountType,
          discount_value: Number(editDiscountValue),
          min_order: Number(editMinOrder) || 0,
          max_discount: editMaxDiscount ? Number(editMaxDiscount) : null,
          usage_limit: editUsageLimit ? Number(editUsageLimit) : null,
          expires_at: editExpiresAt ? new Date(editExpiresAt).toISOString() : null,
          is_active: editIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditErrorMsg(data.error || "Failed to update coupon.");
      } else {
        showToast({
          type: "success",
          title: "Coupon Updated ✏️",
          message: `Code "${editCode}" updated successfully.`,
        });
        closeEditModal();
        router.refresh();
      }
    } catch {
      setEditErrorMsg("Network error occurred.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (id: string, couponCode: string) => {
    confirm({
      title: `Delete Coupon "${couponCode}"?`,
      message: "Are you sure you want to permanently delete this discount coupon?",
      confirmText: "Delete Coupon",
      variant: "danger",
      onConfirm: async () => {
        setDeletingId(id);
        try {
          const res = await fetch("/api/admin/coupons", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          const data = await res.json();
          if (res.ok) {
            showToast({
              type: "success",
              title: "Coupon Deleted",
              message: `Coupon "${couponCode}" has been removed.`,
            });
            router.refresh();
          } else {
            showToast({
              type: "error",
              title: "Deletion Failed",
              message: data.error || "Failed to delete coupon.",
            });
          }
        } catch {
          showToast({
            type: "error",
            title: "Network Error",
            message: "Error deleting coupon.",
          });
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Cancel" : "+ Create Coupon Code"}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-3xl border border-neutral-800/80 bg-neutral-900/50 backdrop-blur-xl shadow-2xl space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Create Promotional Voucher
          </h3>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
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
                placeholder="e.g. NAMMATECH50"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono font-bold uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "PERCENTAGE" | "FIXED")}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Flat Amount (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Discount Value *
              </label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "PERCENTAGE" ? "e.g. 20 (for 20%)" : "e.g. 100 (for ₹100)"}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Minimum Order Amount (₹)
              </label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Max Discount (₹, for %)
              </label>
              <input
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="Optional cap"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Usage Limit
              </label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Total redemptions"
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
        <div className="rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-950/70 text-neutral-400 uppercase font-semibold border-b border-neutral-800 text-[10px]">
                <tr>
                  <th className="px-6 py-4">Voucher Code</th>
                  <th className="px-4 py-4">Discount Value</th>
                  <th className="px-4 py-4">Min Spend</th>
                  <th className="px-4 py-4">Redemptions</th>
                  <th className="px-4 py-4">Validity</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {initialCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-800/30 transition-colors group">
                    <td className="px-6 py-4 font-mono font-black text-white text-sm">
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-purple-300">
                        {c.code}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-bold text-emerald-400 font-mono">
                      {c.discount_type === "PERCENTAGE"
                        ? `${c.discount_value}% OFF`
                        : `₹${c.discount_value} FLAT`}
                    </td>
                    <td className="px-4 py-4 font-mono text-neutral-300">₹{c.min_order}</td>
                    <td className="px-4 py-4 font-mono text-neutral-400">
                      <span className="text-white font-bold">{c.times_used}</span> / {c.usage_limit ?? "∞"}
                    </td>
                    <td className="px-4 py-4 text-neutral-400 text-[11px] font-mono">
                      {c.expires_at ? formatDate(c.expires_at) : "Never Expires"}
                    </td>
                    <td className="px-4 py-4">
                      {c.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                          DISABLED
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          className="p-2 rounded-xl border border-neutral-700/80 bg-neutral-800/60 hover:bg-purple-500/15 text-neutral-300 hover:text-purple-400 hover:border-purple-500/30 transition-all shadow-xs"
                          title="Edit coupon"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id, c.code)}
                          disabled={deletingId === c.id}
                          className="p-2 rounded-xl border border-neutral-700/80 bg-neutral-800/60 hover:bg-red-500/15 text-neutral-400 hover:text-red-400 hover:border-red-500/30 transition-all shadow-xs cursor-pointer"
                          title="Delete coupon"
                        >
                          {deletingId === c.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3.5 bg-neutral-950/80 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>Total <strong className="text-white">{initialCoupons.length}</strong> promotion vouchers logged</span>
            </div>
            <div className="font-mono text-[10px] text-neutral-400">
              COMMERCE ENGINE ACTIVE
            </div>
          </div>
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

      {/* Edit Coupon Modal */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[var(--primary)]" />
                <h3 className="font-bold text-sm text-[var(--foreground)]">Edit Coupon</h3>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editErrorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{editErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                    Discount Type
                  </label>
                  <select
                    value={editDiscountType}
                    onChange={(e) => setEditDiscountType(e.target.value as "PERCENTAGE" | "FIXED")}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    value={editDiscountValue}
                    onChange={(e) => setEditDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                    Minimum Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={editMinOrder}
                    onChange={(e) => setEditMinOrder(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                    Max Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={editMaxDiscount}
                    onChange={(e) => setEditMaxDiscount(e.target.value)}
                    placeholder="Optional cap"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={editUsageLimit}
                    onChange={(e) => setEditUsageLimit(e.target.value)}
                    placeholder="Total uses"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    value={editExpiresAt}
                    onChange={(e) => setEditExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="rounded text-[var(--primary)]"
                  />
                  <span>Active (Redeemable)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-medium hover:bg-[var(--secondary)] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all disabled:opacity-50 shadow-sm"
                >
                  {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editLoading ? "Updating..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
