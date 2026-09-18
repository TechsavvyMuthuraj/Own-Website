"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  XCircle,
  Hash,
  Edit2,
  Save,
  X,
  AlertTriangle,
  Loader2,
  Package,
  ChevronDown,
  ChevronUp,
  Download,
  BadgeCheck,
  IndianRupee,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

function StatusBadge({ status }: { status: string }) {
  if (status === "PAID")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <BadgeCheck className="w-3 h-3" />
        Paid · Verified
      </span>
    );
  if (status === "PENDING")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <Clock className="w-3 h-3" />
        Pending Verification
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
      <XCircle className="w-3 h-3" />
      {status}
    </span>
  );
}

function OrderCard({ order }: { order: any }) {
  const [expanded, setExpanded] = useState(order.status === "PENDING");
  const [editing, setEditing] = useState(false);
  const [utrInput, setUtrInput] = useState(
    order.payment_id?.match(/^\d{12}$/) ? order.payment_id : ""
  );
  const [savedUtr, setSavedUtr] = useState(
    order.payment_id?.match(/^\d{12}$/) ? order.payment_id : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isPending = order.status === "PENDING";

  const handleSaveUtr = async () => {
    const trimmed = utrInput.trim();

    if (!trimmed) {
      setError("UTR number is required.");
      return;
    }
    if (!/^\d{12}$/.test(trimmed)) {
      setError("Must be exactly 12 digits.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/user/orders/${order.id}/utr`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utrNumber: trimmed }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSavedUtr(trimmed);
        setSaveSuccess(true);
        setEditing(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(data.error || "Failed to save UTR. Try again.");
      }
    } catch {
      setError("Network error. Check connection and retry.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setUtrInput(savedUtr);
    setEditing(false);
    setError("");
  };

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
      {/* Order Header — always visible */}
      <div
        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-[var(--secondary)]/20 transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-[var(--secondary)] flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-[var(--muted-foreground)]" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-[var(--foreground)]">
                #{order.order_number}
              </span>
              <StatusBadge status={order.status} />
              {saveSuccess && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-3 h-3" />
                  UTR saved!
                </span>
              )}
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
              {formatDate(order.created_at)} · {order.items?.length || 0} item
              {(order.items?.length || 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-base font-extrabold text-[var(--foreground)]">
            {formatCurrency(order.total, order.currency)}
          </span>
          <span className="text-[var(--muted-foreground)]">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-[var(--border)] p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Items List */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Items Ordered
            </p>
            {order.items?.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--secondary)]/50 border border-[var(--border)]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Package className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
                  <span className="text-xs font-semibold text-[var(--foreground)] truncate">
                    {item.resource?.title || "Digital Resource"}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-bold text-[var(--foreground)]">
                    {formatCurrency(item.price, order.currency)}
                  </span>
                  {order.status === "PAID" && item.resource?.slug && (
                    <Link
                      href={`/resource/${item.resource.slug}/download`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--primary)] text-white text-[10px] font-bold hover:bg-[var(--primary-hover)] transition-all"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* UTR Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                UPI / UTR Reference
              </p>
              {isPending && !editing && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing(true);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--primary)] hover:opacity-80 transition-opacity"
                >
                  <Edit2 className="w-3 h-3" />
                  {savedUtr ? "Edit UTR" : "Add UTR"}
                </button>
              )}
            </div>

            {/* PAID — just show the UTR  */}
            {order.status === "PAID" && (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Payment Verified — Downloads Unlocked
                  </p>
                  <p className="text-[10px] text-[var(--muted-foreground)] font-mono">
                    UTR: {savedUtr || order.payment_id || "—"}
                  </p>
                </div>
              </div>
            )}

            {/* PENDING — editable UTR */}
            {isPending && (
              <>
                {!editing ? (
                  <div
                    className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 cursor-pointer group"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing(true);
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Hash className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-[var(--foreground)]">
                          {savedUtr ? (
                            <span className="font-mono">{savedUtr}</span>
                          ) : (
                            <span className="text-[var(--muted-foreground)]">No UTR added yet</span>
                          )}
                        </p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">
                          {savedUtr
                            ? "Tap to edit your 12-digit UTR"
                            : "Tap to add your 12-digit UTR number"}
                        </p>
                      </div>
                    </div>
                    <Edit2 className="w-3.5 h-3.5 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors" />
                  </div>
                ) : (
                  <div
                    className="space-y-2.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                      <input
                        type="text"
                        inputMode="numeric"
                        autoFocus
                        maxLength={12}
                        value={utrInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                          setUtrInput(val);
                          setError("");
                        }}
                        placeholder="Enter 12-digit UTR number"
                        className="w-full pl-8 pr-14 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                      />
                      <span
                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${
                          utrInput.length === 12 ? "text-emerald-500" : "text-amber-500"
                        }`}
                      >
                        {utrInput.length}/12
                      </span>
                    </div>

                    {error && (
                      <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {error}
                      </div>
                    )}

                    <p className="text-[10px] text-[var(--muted-foreground)]">
                      Find your 12-digit UTR in PhonePe, GPay, or Paytm → Payment History → Transaction details.
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveUtr}
                        disabled={saving || utrInput.length !== 12}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            Save UTR
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] text-xs font-semibold text-[var(--foreground)] transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Pending notice */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-[var(--secondary)]/50 border border-[var(--border)]">
                  <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[var(--muted-foreground)]">
                    Admin is reviewing your UTR. Your downloads will unlock once payment is verified. This usually takes a few minutes.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Payment summary row */}
          <div className="flex flex-wrap gap-3 pt-1 border-t border-[var(--border)]/60 text-[11px] text-[var(--muted-foreground)]">
            <span>
              Subtotal:{" "}
              <strong className="text-[var(--foreground)]">
                {formatCurrency(order.subtotal, order.currency)}
              </strong>
            </span>
            {order.discount > 0 && (
              <span>
                Discount:{" "}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  -{formatCurrency(order.discount, order.currency)}
                </strong>
              </span>
            )}
            <span>
              Total:{" "}
              <strong className="text-[var(--foreground)]">
                {formatCurrency(order.total, order.currency)}
              </strong>
            </span>
            {order.coupon_code && (
              <span>
                Coupon: <strong className="text-[var(--foreground)]">{order.coupon_code}</strong>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function OrderHistoryClient({ orders }: { orders: any[] }) {
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--secondary)] flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-[var(--muted-foreground)]" />
        </div>
        <h3 className="text-base font-bold text-[var(--foreground)] mb-1">No orders yet</h3>
        <p className="text-xs text-[var(--muted-foreground)] mb-6 max-w-xs">
          You haven't made any digital purchases yet. Explore the catalog to get started.
        </p>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all shadow-md shadow-[#FD1843]/25"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            <strong>{pendingCount}</strong> order{pendingCount > 1 ? "s" : ""} pending admin
            verification. Make sure your UTR is entered below — admin will unlock your downloads
            shortly.
          </p>
        </div>
      )}

      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
