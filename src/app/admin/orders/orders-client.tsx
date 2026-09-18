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
  Package,
  AlertTriangle,
  BadgeCheck,
  IndianRupee,
  ShieldCheck,
  ShieldX,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

function OrderStatusBadge({ status }: { status: string }) {
  if (status === "PAID")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <BadgeCheck className="w-3 h-3" /> PAID
      </span>
    );
  if (status === "PENDING")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
        <Clock className="w-3 h-3" /> PENDING
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
      <XCircle className="w-3 h-3" /> {status}
    </span>
  );
}

function UtrMatchIndicator({
  userUtr,
  adminUtr,
}: {
  userUtr: string;
  adminUtr: string;
}) {
  if (!adminUtr || adminUtr.length < 12) return null;
  const matched = adminUtr === userUtr;
  return matched ? (
    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-200">
      <ShieldCheck className="w-4 h-4" />
      UTR Matched ✓ — Safe to verify
    </div>
  ) : (
    <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 animate-in fade-in duration-200">
      <ShieldX className="w-4 h-4" />
      UTR Mismatch — Does not match user&apos;s submitted UTR
    </div>
  );
}

function OrderRow({ order }: { order: any }) {
  const router = useRouter();
  const { showToast, confirm } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [adminUtr, setAdminUtr] = useState("");
  const [showUserUtr, setShowUserUtr] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const userUtr: string = (order.payment_id || "").match(/^\d{12}$/)
    ? order.payment_id
    : "";
  const isPending = order.status === "PENDING";
  const utrMatched = adminUtr.length === 12 && adminUtr === userUtr;
  const canVerify = utrMatched && !verifying;

  const handleVerify = () => {
    if (!utrMatched) {
      setError("Admin UTR must match user-submitted UTR exactly before verifying.");
      return;
    }

    confirm({
      title: `Verify Payment for Order #${order.order_number}?`,
      message: `UTR: ${adminUtr}\nUser: ${order.user?.email || "unknown"}\n\nThis will mark the order as PAID and unlock digital downloads for this user.`,
      confirmText: "Verify & Unlock",
      variant: "primary",
      onConfirm: async () => {
        setVerifying(true);
        setError("");

        try {
          const res = await fetch("/api/admin/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: order.id, utrNumber: adminUtr }),
          });

          const data = await res.json();
          if (res.ok && data.success) {
            setSuccess(true);
            showToast({
              type: "success",
              title: "Payment Verified! 🎉",
              message: `Order #${order.order_number} has been verified and products unlocked.`,
            });
            setTimeout(() => router.refresh(), 1200);
          } else {
            setError(data.error || "Verification failed.");
            showToast({
              type: "error",
              title: "Verification Failed",
              message: data.error || "Verification failed.",
            });
          }
        } catch {
          setError("Network error. Check connection and retry.");
        } finally {
          setVerifying(false);
        }
      },
    });
  };

  const handleDeleteOrder = () => {
    confirm({
      title: `Delete Order #${order.order_number}?`,
      message: "This will permanently remove this order and all payment/UTR details. This cannot be undone.",
      confirmText: "Delete Order",
      variant: "danger",
      onConfirm: async () => {
        setDeleting(true);
        try {
          const res = await fetch(`/api/admin/orders/${order.id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (res.ok) {
            showToast({
              type: "success",
              title: "Order Deleted",
              message: `Order #${order.order_number} has been permanently deleted.`,
            });
            router.refresh();
          } else {
            showToast({
              type: "error",
              title: "Failed to Delete",
              message: data.error || "Could not delete order.",
            });
          }
        } catch {
          showToast({
            type: "error",
            title: "Network Error",
            message: "Failed to reach server.",
          });
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  return (
    <div className="border-b border-[var(--border)] last:border-0">
      {/* Summary Row */}
      <div
        className="grid grid-cols-[1fr_1.4fr_auto_auto_auto_auto] gap-3 px-5 py-4 items-center hover:bg-[var(--secondary)]/20 transition-colors cursor-pointer select-none"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="min-w-0">
          <span className="font-mono font-bold text-xs text-[var(--foreground)]">
            #{order.order_number}
          </span>
          <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
            {formatDate(order.created_at)}
          </div>
        </div>

        <div className="min-w-0">
          <div className="font-semibold text-xs text-[var(--foreground)] truncate">
            {order.user?.full_name || "User"}
          </div>
          <div className="text-[10px] text-[var(--muted-foreground)] truncate">
            {order.user?.email || "—"}
          </div>
        </div>

        <div className="text-xs font-bold text-[var(--foreground)] whitespace-nowrap">
          {formatCurrency(order.total, order.currency)}
        </div>

        {/* User UTR preview */}
        <div className="hidden sm:block">
          {userUtr ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <Hash className="w-3 h-3" />
              UTR ✓
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-[10px] text-amber-600 border border-amber-500/20">
              No UTR
            </span>
          )}
        </div>

        <OrderStatusBadge status={order.status} />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteOrder();
            }}
            disabled={deleting}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
            title="Delete Order & Payment"
          >
            {deleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>

          <span className="text-[var(--muted-foreground)]">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </div>

      {/* Detail Panel */}
      {expanded && (
        <div className="px-5 pb-6 animate-in slide-in-from-top-2 duration-200">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/30 p-4 sm:p-5 space-y-5">

            {/* Customer + Items grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Customer
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--foreground)]">
                      {order.user?.full_name || "Unknown"}
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">Full Name</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-bold text-[var(--foreground)] truncate">
                      {order.user?.email || "—"}
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">Email</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--foreground)]">
                      {formatCurrency(order.total, order.currency)}
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">Order Total</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Products ({order.items?.length || 0})
                </p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {(order.items || []).map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 rounded-xl bg-[var(--card)] border border-[var(--border)]"
                    >
                      <Package className="w-3.5 h-3.5 text-[var(--muted-foreground)] flex-shrink-0" />
                      <span className="text-xs font-medium text-[var(--foreground)] truncate">
                        {item.resource?.title || `Resource #${item.resource_id?.slice(0, 8)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── UTR Matching Section ── */}
            {isPending && !success && (
              <div className="space-y-3 pt-1 border-t border-[var(--border)]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  UTR Verification — Both Must Match
                </p>

                {/* User-submitted UTR (reference) */}
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted-foreground)]">
                      User&apos;s Submitted UTR
                    </span>
                    {userUtr && (
                      <button
                        type="button"
                        onClick={() => setShowUserUtr((p) => !p)}
                        className="text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 transition-colors"
                      >
                        {showUserUtr ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showUserUtr ? "Hide" : "Reveal"}
                      </button>
                    )}
                  </div>

                  {userUtr ? (
                    <div className="font-mono text-sm font-bold tracking-widest text-[var(--foreground)]">
                      {showUserUtr
                        ? userUtr
                        : `${userUtr.slice(0, 3)}${"•".repeat(6)}${userUtr.slice(-3)}`}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      User has not submitted a UTR yet. Ask them to add it from their Order History.
                    </div>
                  )}
                </div>

                {/* Admin UTR input */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[var(--foreground)]">
                    Your UTR (from payment proof){" "}
                    <span className="text-[#FD1843]">*</span>
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={12}
                      value={adminUtr}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                        setAdminUtr(val);
                        setError("");
                      }}
                      placeholder="Enter the 12-digit UTR to cross-verify"
                      className={`w-full pl-8 pr-16 py-2.5 rounded-xl border text-xs font-mono text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 transition-colors ${
                        adminUtr.length === 12
                          ? utrMatched
                            ? "border-emerald-500 bg-emerald-500/5 focus:ring-emerald-500/30"
                            : "border-red-400 bg-red-500/5 focus:ring-red-500/30"
                          : "border-[var(--border)] bg-[var(--background)] focus:ring-[var(--ring)]"
                      }`}
                    />
                    {adminUtr.length > 0 && (
                      <span
                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${
                          adminUtr.length === 12
                            ? utrMatched
                              ? "text-emerald-500"
                              : "text-red-500"
                            : "text-amber-500"
                        }`}
                      >
                        {adminUtr.length}/12
                      </span>
                    )}
                  </div>

                  {/* Live match indicator */}
                  {userUtr && (
                    <UtrMatchIndicator userUtr={userUtr} adminUtr={adminUtr} />
                  )}

                  {error && (
                    <div className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      {error}
                    </div>
                  )}
                </div>

                {/* Verify button */}
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={!canVerify}
                  className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white text-xs font-bold transition-all ${
                    canVerify
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25"
                      : "bg-[var(--secondary)] text-[var(--muted-foreground)] cursor-not-allowed"
                  }`}
                >
                  {verifying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Verifying…
                    </>
                  ) : canVerify ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      UTR Matched — Verify &amp; Unlock Downloads
                    </>
                  ) : (
                    <>
                      <ShieldX className="w-3.5 h-3.5" />
                      {!userUtr
                        ? "Waiting for user to submit UTR"
                        : adminUtr.length < 12
                        ? "Enter 12-digit UTR to continue"
                        : "UTR mismatch — cannot verify"}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Already PAID */}
            {order.status === "PAID" && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Payment Verified — Downloads Unlocked
                  </p>
                  <p className="text-[10px] text-[var(--muted-foreground)] font-mono">
                    Verified UTR: {order.payment_id || "—"}
                  </p>
                </div>
              </div>
            )}

            {/* Success flash */}
            {success && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 animate-in fade-in duration-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-bounce flex-shrink-0" />
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ✓ UTR matched and verified! User downloads are now unlocked. Refreshing…
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
  const noUtrCount = initialOrders.filter(
    (o) => o.status === "PENDING" && !o.payment_id?.match(/^\d{12}$/)
  ).length;

  if (initialOrders.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No orders found"
        description="No orders have been placed yet. Orders will appear here as customers purchase products."
      />
    );
  }

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
              {pendingCount} order{pendingCount > 1 ? "s" : ""} pending verification
            </p>
            {noUtrCount > 0 && (
              <p className="text-[11px] text-[var(--muted-foreground)]">
                {noUtrCount} of them have no UTR yet — user needs to add it from their order history first.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-[1fr_1.4fr_auto_auto_auto_auto] gap-3 px-5 py-3.5 bg-[var(--secondary)]/60 border-b border-[var(--border)] text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
          <span>Order</span>
          <span>Customer</span>
          <span>Amount</span>
          <span className="hidden sm:block">User UTR</span>
          <span>Status</span>
          <span />
        </div>

        <div>
          {initialOrders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}
