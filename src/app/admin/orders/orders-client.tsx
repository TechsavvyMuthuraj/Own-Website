"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  Hash,
  CreditCard,
  Package,
  AlertTriangle,
  BadgeCheck,
  IndianRupee,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

function OrderStatusBadge({ status }: { status: string }) {
  if (status === "PAID") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <BadgeCheck className="w-3 h-3" />
        PAID
      </span>
    );
  }
  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
        <Clock className="w-3 h-3" />
        PENDING
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
      <XCircle className="w-3 h-3" />
      {status}
    </span>
  );
}

function OrderRow({ order }: { order: any }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [utrInput, setUtrInput] = useState(order.payment_id?.match(/^\d{12}$/) ? order.payment_id : "");
  const [verifying, setVerifying] = useState(false);
  const [utrError, setUtrError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState(false);

  const isPending = order.status === "PENDING";

  const handleVerify = async () => {
    const trimmed = utrInput.trim();

    // Validate UTR — must be exactly 12 digits
    if (trimmed && !/^\d{12}$/.test(trimmed)) {
      setUtrError("UTR must be exactly 12 digits (numbers only).");
      return;
    }

    if (!confirm(`Verify payment for order #${order.order_number}?\n\nUTR: ${trimmed || "(no UTR — manual confirm)"}\nUser: ${order.user?.email || "unknown"}\n\nThis will unlock digital downloads for this user.`)) return;

    setVerifying(true);
    setUtrError("");

    try {
      const res = await fetch("/api/admin/orders/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, utrNumber: trimmed || undefined }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setVerifySuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 1200);
      } else {
        setUtrError(data.error || "Verification failed. Try again.");
      }
    } catch {
      setUtrError("Network error. Check connection and retry.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="border-b border-[var(--border)] last:border-0">
      {/* Main Row */}
      <div
        className="grid grid-cols-[1fr_1.5fr_auto_auto_auto_auto] gap-3 px-5 py-4 items-center hover:bg-[var(--secondary)]/20 transition-colors cursor-pointer"
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Order # */}
        <div className="min-w-0">
          <span className="font-mono font-bold text-xs text-[var(--foreground)]">
            #{order.order_number}
          </span>
          <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
            {formatDate(order.created_at)}
          </div>
        </div>

        {/* Customer */}
        <div className="min-w-0">
          <div className="font-semibold text-xs text-[var(--foreground)] truncate">
            {order.user?.full_name || "User"}
          </div>
          <div className="text-[10px] text-[var(--muted-foreground)] truncate">
            {order.user?.email || "—"}
          </div>
        </div>

        {/* Amount */}
        <div className="text-xs font-bold text-[var(--foreground)] whitespace-nowrap">
          {formatCurrency(order.total, order.currency)}
        </div>

        {/* UTR badge */}
        <div className="hidden sm:block">
          {order.payment_id ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--secondary)] text-[10px] font-mono text-[var(--foreground)] border border-[var(--border)]">
              <Hash className="w-3 h-3 text-[#FD1843]" />
              {order.payment_id.length > 14 ? `${order.payment_id.slice(0, 14)}…` : order.payment_id}
            </span>
          ) : (
            <span className="text-[10px] text-[var(--muted-foreground)]">No UTR</span>
          )}
        </div>

        {/* Status */}
        <OrderStatusBadge status={order.status} />

        {/* Expand toggle */}
        <div className="text-[var(--muted-foreground)]">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Detail Panel */}
      {expanded && (
        <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-200">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/40 p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* User Details */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Customer Details
                </p>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--foreground)]">
                      {order.user?.full_name || "Unknown User"}
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">Full Name</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-bold text-[var(--foreground)] truncate">
                      {order.user?.email || "—"}
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">Email Address</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <IndianRupee className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--foreground)]">
                      {formatCurrency(order.total, order.currency)}
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">
                      Order Total · {order.currency || "INR"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items Ordered */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Products Ordered ({order.items?.length || 0})
                </p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {(order.items || []).map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 rounded-xl bg-[var(--card)] border border-[var(--border)]"
                    >
                      <Package className="w-3.5 h-3.5 text-[var(--muted-foreground)] flex-shrink-0" />
                      <span className="text-xs text-[var(--foreground)] truncate font-medium">
                        {item.resource?.title || `Resource #${item.resource_id?.slice(0, 8)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* UTR Verification Section — only for PENDING orders */}
            {isPending && !verifySuccess && (
              <div className="pt-3 border-t border-[var(--border)]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
                  Verify UPI Payment
                </p>

                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                      12-Digit UTR Number
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={12}
                        value={utrInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                          setUtrInput(val);
                          setUtrError("");
                        }}
                        placeholder="e.g. 423456789012"
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                      />
                      {utrInput.length > 0 && (
                        <span
                          className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${
                            utrInput.length === 12 ? "text-emerald-500" : "text-amber-500"
                          }`}
                        >
                          {utrInput.length}/12
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                      Find this in PhonePe / GPay / Paytm transaction details. Leave blank to manually confirm without UTR.
                    </p>

                    {utrError && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {utrError}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={verifying}
                    className="sm:mt-6 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/25 disabled:opacity-60 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verify &amp; Unlock
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Already PAID notice */}
            {order.status === "PAID" && (
              <div className="pt-3 border-t border-[var(--border)] flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/5 border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Payment Verified — Downloads Unlocked
                  </p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">
                    UTR / Ref: <span className="font-mono">{order.payment_id || "—"}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Verify success flash */}
            {verifySuccess && (
              <div className="pt-3 border-t border-[var(--border)] flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 animate-in fade-in duration-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 animate-bounce" />
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ✓ Payment verified! User downloads are unlocked. Refreshing…
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function OrdersTableClient({ initialOrders }: { initialOrders: any[] }) {
  const pendingCount = initialOrders.filter((o) => o.status === "PENDING").length;

  if (initialOrders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No orders found in database"
        description="Zero orders have been placed yet. As customers purchase digital products, order records will appear here in real time."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Pending alert banner */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <p className="text-xs font-semibold">
            {pendingCount} order{pendingCount > 1 ? "s" : ""} pending verification — expand each row to review UTR and verify payment.
          </p>
        </div>
      )}

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_1.5fr_auto_auto_auto_auto] gap-3 px-5 py-3.5 bg-[var(--secondary)]/60 border-b border-[var(--border)] text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
          <span>Order</span>
          <span>Customer</span>
          <span>Amount</span>
          <span className="hidden sm:block">UTR</span>
          <span>Status</span>
          <span />
        </div>

        {/* Rows */}
        <div>
          {initialOrders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}
