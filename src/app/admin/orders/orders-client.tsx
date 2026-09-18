"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

export function OrdersTableClient({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const handleManualVerify = async (orderId: string) => {
    if (!confirm("Confirm receipt of payment and unlock digital entitlements for this user?")) return;
    setVerifyingId(orderId);
    try {
      const res = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          paymentId: `manual_admin_${Date.now()}`,
          signature: "admin_verified",
        }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Verification failed.");
      }
    } catch {
      alert("Error contacting verification endpoint.");
    } finally {
      setVerifyingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            PAID
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            PENDING
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
            {status}
          </span>
        );
    }
  };

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
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--secondary)]/60 text-[var(--muted-foreground)] uppercase font-semibold border-b border-[var(--border)]">
            <tr>
              <th className="px-5 py-3.5">Order</th>
              <th className="px-4 py-3.5">Customer</th>
              <th className="px-4 py-3.5">Items</th>
              <th className="px-4 py-3.5">Amount</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Date</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {initialOrders.map((order) => (
              <tr key={order.id} className="hover:bg-[var(--secondary)]/30 transition-colors">
                <td className="px-5 py-3.5 font-mono font-bold text-[var(--foreground)]">
                  #{order.order_number}
                </td>
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-[var(--foreground)]">
                    {order.user?.full_name || "User"}
                  </div>
                  <div className="text-[11px] text-[var(--muted-foreground)] truncate max-w-[150px]">
                    {order.user?.email || "—"}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-[var(--muted-foreground)]">
                  {order.items?.length || 0} items
                </td>
                <td className="px-4 py-3.5 font-bold text-[var(--foreground)]">
                  {formatCurrency(order.total, order.currency)}
                </td>
                <td className="px-4 py-3.5">{getStatusBadge(order.status)}</td>
                <td className="px-4 py-3.5 text-[var(--muted-foreground)] whitespace-nowrap">
                  {formatDate(order.created_at)}
                </td>
                <td className="px-5 py-3.5 text-right">
                  {order.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={() => handleManualVerify(order.id)}
                      disabled={verifyingId === order.id}
                      className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all text-[11px] disabled:opacity-50"
                    >
                      {verifyingId === order.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "Verify Payment"
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
