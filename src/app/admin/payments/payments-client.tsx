"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CreditCard,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Download,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  Eye,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Hash,
  User,
  Mail,
  Package,
  X,
  ArrowUpRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/ui/empty-state";
import { UpiQrCard } from "@/components/payments/upi-qr-card";

interface PaymentsClientProps {
  initialOrders: any[];
  availableResources: any[];
}

export function PaymentsClient({
  initialOrders,
  availableResources,
}: PaymentsClientProps) {
  const router = useRouter();
  const { showToast, confirm } = useToast();

  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState<"ALL" | "PAID" | "PENDING" | "FAILED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Modals
  const [showQrModal, setShowQrModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);

  // Manual payment state
  const [manualEmail, setManualEmail] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualUtr, setManualUtr] = useState("");
  const [manualProvider, setManualProvider] = useState("UPI");
  const [manualStatus, setManualStatus] = useState<"PAID" | "PENDING">("PAID");
  const [manualResourceId, setManualResourceId] = useState("");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Inline verification state
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);

  // ── Financial KPI Computations ──
  const kpis = useMemo(() => {
    let totalRevenue = 0;
    let todayRevenue = 0;
    let pendingAmount = 0;
    let paidCount = 0;
    let pendingCount = 0;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    orders.forEach((o) => {
      const amt = Number(o.total) || 0;
      const createdAt = new Date(o.created_at);

      if (o.status === "PAID") {
        totalRevenue += amt;
        paidCount += 1;
        if (createdAt >= startOfToday) {
          todayRevenue += amt;
        }
      } else if (o.status === "PENDING") {
        pendingAmount += amt;
        pendingCount += 1;
      }
    });

    const successRate = orders.length > 0 ? Math.round((paidCount / orders.length) * 100) : 100;

    return {
      totalRevenue,
      todayRevenue,
      pendingAmount,
      paidCount,
      pendingCount,
      successRate,
      totalCount: orders.length,
    };
  }, [orders]);

  // ── Filtered Transactions ──
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (activeTab !== "ALL" && o.status !== activeTab) {
        return false;
      }

      if (searchQuery.trim() === "") return true;

      const q = searchQuery.toLowerCase();
      const matchOrderNum = o.order_number?.toLowerCase().includes(q);
      const matchUtr = o.payment_id?.toLowerCase().includes(q);
      const matchEmail = o.user?.email?.toLowerCase().includes(q);
      const matchName = o.user?.full_name?.toLowerCase().includes(q);
      const matchItem = o.items?.some((i: any) =>
        i.resource?.title?.toLowerCase().includes(q)
      );

      return matchOrderNum || matchUtr || matchEmail || matchName || matchItem;
    });
  }, [orders, activeTab, searchQuery]);

  // Copy UPI ID
  const handleCopyUpi = () => {
    navigator.clipboard.writeText("muthurajc@slc");
    setCopiedUpi(true);
    showToast({
      type: "success",
      title: "UPI ID Copied",
      message: "muthurajc@slc copied to clipboard!",
    });
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (filteredOrders.length === 0) {
      showToast({
        type: "error",
        title: "Export Failed",
        message: "No transactions to export for the current filter.",
      });
      return;
    }

    const headers = [
      "Date",
      "Order Number",
      "Customer Email",
      "Customer Name",
      "Amount (INR)",
      "Status",
      "Payment Method",
      "UTR / Reference",
      "Items",
    ];

    const rows = filteredOrders.map((o) => [
      `"${formatDate(o.created_at)}"`,
      `"${o.order_number}"`,
      `"${o.user?.email || ""}"`,
      `"${o.user?.full_name || ""}"`,
      o.total,
      `"${o.status}"`,
      `"${o.payment_provider || "UPI"}"`,
      `"${o.payment_id || ""}"`,
      `"${(o.items || []).map((i: any) => i.resource?.title || "").join("; ")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `nammatech-payments-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: "success",
      title: "CSV Export Complete",
      message: `Exported ${filteredOrders.length} transactions.`,
    });
  };

  // Quick 1-click verify pending payment
  const handleVerifyPending = (order: any) => {
    const utr = order.payment_id?.trim() || "";

    if (!utr || !/^\d{12}$/.test(utr)) {
      showToast({
        type: "error",
        title: "Missing 12-Digit UTR",
        message: "Order has no valid 12-digit UTR submitted by the customer.",
      });
      return;
    }

    confirm({
      title: `Confirm Payment for Order #${order.order_number}?`,
      message: `UTR Number: ${utr}\nAmount: ${formatCurrency(order.total, order.currency)}\nCustomer: ${order.user?.email || "User"}\n\nThis will mark the payment as PAID and unlock digital downloads.`,
      confirmText: "Verify & Mark Paid",
      variant: "primary",
      onConfirm: async () => {
        setVerifyingOrderId(order.id);
        try {
          const res = await fetch("/api/admin/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: order.id, utrNumber: utr }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast({
              type: "success",
              title: "Payment Verified! 🎉",
              message: `Order #${order.order_number} marked as PAID.`,
            });
            setOrders((prev) =>
              prev.map((o) =>
                o.id === order.id ? { ...o, status: "PAID", payment_id: utr } : o
              )
            );
            router.refresh();
          } else {
            showToast({
              type: "error",
              title: "Verification Failed",
              message: data.error || "Could not verify payment.",
            });
          }
        } catch {
          showToast({
            type: "error",
            title: "Network Error",
            message: "Failed to connect to verification server.",
          });
        } finally {
          setVerifyingOrderId(null);
        }
      },
    });
  };

  // Submit Manual Payment
  const handleRecordManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAmount || Number(manualAmount) <= 0) {
      showToast({
        type: "error",
        title: "Invalid Amount",
        message: "Please enter a valid amount in INR.",
      });
      return;
    }

    setIsSubmittingManual(true);
    try {
      const res = await fetch("/api/admin/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: manualEmail,
          amount: parseFloat(manualAmount),
          utrNumber: manualUtr,
          paymentProvider: manualProvider,
          status: manualStatus,
          resourceId: manualResourceId || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast({
          type: "success",
          title: "Payment Recorded! 💰",
          message: `Recorded payment of ₹${manualAmount} successfully.`,
        });
        setShowManualModal(false);
        setManualEmail("");
        setManualAmount("");
        setManualUtr("");
        setManualResourceId("");
        router.refresh();
      } else {
        showToast({
          type: "error",
          title: "Failed to Record",
          message: data.error || "Could not record payment.",
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Failed to communicate with payment server.",
      });
    } finally {
      setIsSubmittingManual(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── KPI Metrics Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Total Net Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--foreground)] font-mono">
            ₹{kpis.totalRevenue.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            Lifetime collections from {kpis.paidCount} successful orders
          </p>
        </div>

        {/* Today's Collections */}
        <div className="p-5 rounded-3xl border border-blue-500/30 bg-blue-500/5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500">
              Today&apos;s Collections
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--foreground)] font-mono">
            ₹{kpis.todayRevenue.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            Gross collections since 12:00 AM today
          </p>
        </div>

        {/* Pending Verification */}
        <div className="p-5 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
              Pending Verification
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--foreground)] font-mono">
            ₹{kpis.pendingAmount.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            {kpis.pendingCount} order{kpis.pendingCount === 1 ? "" : "s"} awaiting UTR review
          </p>
        </div>

        {/* Transaction Success Rate */}
        <div className="p-5 rounded-3xl border border-purple-500/30 bg-purple-500/5 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
              Success Rate
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--foreground)] font-mono">
            {kpis.successRate}%
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            {kpis.paidCount} of {kpis.totalCount} transactions completed
          </p>
        </div>
      </div>

      {/* ── Active UPI Gateway Card ── */}
      <div className="p-5 sm:p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 flex-shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                Active UPI Payment Gateway
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                Active &bull; Instant UPI
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)] mt-1">
              <span>UPI ID: <strong className="text-[var(--foreground)] font-mono">muthurajc@slc</strong></span>
              <span>Merchant: <strong className="text-[var(--foreground)]">NammaTech Digital / Muthuraj C</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={handleCopyUpi}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)] hover:bg-[var(--border)] text-xs font-semibold text-[var(--foreground)] transition-colors cursor-pointer"
          >
            {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUpi ? "Copied!" : "Copy UPI ID"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold hover:brightness-110 shadow-sm transition-all cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>View UPI QR Code</span>
          </button>
        </div>
      </div>

      {/* ── Transaction Controls Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Payments", count: orders.length },
            { id: "PAID", label: "Paid / Received", count: kpis.paidCount },
            { id: "PENDING", label: "Pending UTR", count: kpis.pendingCount },
            {
              id: "FAILED",
              label: "Failed",
              count: orders.filter((o) => o.status === "FAILED" || o.status === "CANCELLED").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-amber-500 text-neutral-950 shadow-sm"
                  : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id
                    ? "bg-neutral-950 text-amber-400 font-black"
                    : "bg-[var(--secondary)] text-[var(--muted-foreground)] font-mono"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Action Buttons: Search, Export, Record */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search UTR, Order, Email..."
              className="w-full pl-8 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] text-xs font-semibold text-[var(--foreground)] transition-colors cursor-pointer"
            title="Export transactions to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* Record Manual Payment Button */}
          <button
            type="button"
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* ── Transactions Table ── */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payment records found"
          description={
            searchQuery
              ? `No transactions matched "${searchQuery}". Try clearing the search.`
              : "No payments recorded for this status filter yet."
          }
        />
      ) : (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-[1.4fr_1.5fr_1fr_1.4fr_1fr_1fr] gap-3 px-5 py-3.5 bg-[var(--secondary)]/60 border-b border-[var(--border)] text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] items-center">
            <span>Transaction / Ref</span>
            <span>Customer</span>
            <span>Amount</span>
            <span>Method &amp; UTR</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[var(--border)]">
            {filteredOrders.map((order) => {
              const isPending = order.status === "PENDING";
              const isPaid = order.status === "PAID";
              const hasUtr = Boolean(order.payment_id && order.payment_id.trim());

              return (
                <div
                  key={order.id}
                  className="grid grid-cols-[1.4fr_1.5fr_1fr_1.4fr_1fr_1fr] gap-3 px-5 py-4 items-center hover:bg-[var(--secondary)]/20 transition-colors text-xs"
                >
                  {/* Transaction Ref & Date */}
                  <div className="min-w-0">
                    <div className="font-mono font-bold text-[var(--foreground)] truncate">
                      #{order.order_number}
                    </div>
                    <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                      {formatDate(order.created_at)}
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="min-w-0">
                    <div className="font-semibold text-[var(--foreground)] truncate">
                      {order.user?.full_name || "Customer"}
                    </div>
                    <div className="text-[10px] text-[var(--muted-foreground)] font-mono truncate">
                      {order.user?.email || "—"}
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <span className="font-black text-sm font-mono text-[var(--foreground)]">
                      {formatCurrency(order.total, order.currency)}
                    </span>
                    {order.items && order.items.length > 0 && (
                      <span className="block text-[10px] text-[var(--muted-foreground)] truncate">
                        {order.items[0]?.resource?.title || `${order.items.length} item(s)`}
                      </span>
                    )}
                  </div>

                  {/* Method & UTR */}
                  <div className="min-w-0 space-y-1">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--secondary)] text-[10px] font-bold text-[var(--foreground)]">
                      <span>{order.payment_provider || "UPI"}</span>
                    </div>

                    {hasUtr ? (
                      <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--foreground)] truncate">
                        <Hash className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        <span className="font-bold truncate">{order.payment_id}</span>
                      </div>
                    ) : (
                      <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        No UTR recorded
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> PAID
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        <Clock className="w-3 h-3" /> PENDING
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                        <XCircle className="w-3 h-3" /> {order.status}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1.5">
                    {isPending && hasUtr && (
                      <button
                        type="button"
                        onClick={() => handleVerifyPending(order)}
                        disabled={verifyingOrderId === order.id}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                        title="Verify UTR and Unlock Products"
                      >
                        {verifyingOrderId === order.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <ShieldCheck className="w-3 h-3" />
                        )}
                        <span>Verify</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedOrderDetails(order)}
                      className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--secondary)]/60 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── View Order Details Modal ── */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                  Transaction #{selectedOrderDetails.order_number}
                </h4>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Recorded on {formatDate(selectedOrderDetails.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details Breakdown */}
            <div className="p-4 rounded-2xl bg-[var(--secondary)]/40 border border-[var(--border)] space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[var(--muted-foreground)]">Payment Status:</span>
                <span className="font-bold text-[var(--foreground)]">
                  {selectedOrderDetails.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--muted-foreground)]">Payment Method:</span>
                <span className="font-bold text-[var(--foreground)]">
                  {selectedOrderDetails.payment_provider || "UPI"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--muted-foreground)]">UTR / Txn ID:</span>
                <span className="font-mono font-bold text-amber-500">
                  {selectedOrderDetails.payment_id || "None submitted"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--muted-foreground)]">Total Amount:</span>
                <span className="font-mono font-black text-sm text-[var(--foreground)]">
                  {formatCurrency(selectedOrderDetails.total, selectedOrderDetails.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--muted-foreground)]">Customer Email:</span>
                <span className="font-mono text-[var(--foreground)]">
                  {selectedOrderDetails.user?.email || "—"}
                </span>
              </div>
            </div>

            {/* Items Included */}
            <div className="space-y-2">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Items In Transaction ({selectedOrderDetails.items?.length || 0})
              </h5>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {(selectedOrderDetails.items || []).map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Package className="w-3.5 h-3.5 text-[var(--muted-foreground)] flex-shrink-0" />
                      <span className="font-medium text-[var(--foreground)] truncate">
                        {item.resource?.title || `Item #${item.resource_id?.slice(0, 8)}`}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[var(--foreground)]">
                      {formatCurrency(item.price || selectedOrderDetails.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrderDetails(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--secondary)] hover:bg-[var(--border)] text-xs font-bold text-[var(--foreground)] transition-colors cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* ── Record Manual Offline Payment Modal ── */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <span>Record Direct / Offline Payment</span>
                </h4>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Log direct payments received via UPI, Cash, or Bank transfer.
                </p>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordManualPayment} className="space-y-3.5">
              {/* Customer Email */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">
                  Customer Email
                </label>
                <input
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="customer@gmail.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Amount & Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">
                    Amount (₹ INR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    placeholder="49"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono font-bold text-[var(--foreground)] focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">
                    Payment Method
                  </label>
                  <select
                    value={manualProvider}
                    onChange={(e) => setManualProvider(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="UPI">Direct UPI</option>
                    <option value="GPAY">Google Pay</option>
                    <option value="PHONEPE">PhonePe</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash / Offline</option>
                  </select>
                </div>
              </div>

              {/* UTR / Txn Number */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">
                  12-Digit UTR / Transaction Reference
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={manualUtr}
                  onChange={(e) => setManualUtr(e.target.value.replace(/\s+/g, ""))}
                  placeholder="e.g. 523456789012"
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Optional Product / Movie Link */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">
                  Link to Product / Movie (Optional)
                </label>
                <select
                  value={manualResourceId}
                  onChange={(e) => setManualResourceId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:ring-1 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">None (General VIP / Service)</option>
                  {availableResources.map((res) => (
                    <option key={res.id} value={res.id}>
                      {res.title} (₹{res.sale_price || res.price || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualStatus("PAID")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      manualStatus === "PAID"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    ✓ Mark as PAID
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualStatus("PENDING")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                      manualStatus === "PENDING"
                        ? "bg-amber-500 text-neutral-950 shadow-sm"
                        : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    ⏳ Keep PENDING
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--border)] bg-[var(--secondary)] hover:bg-[var(--border)] text-xs font-semibold text-[var(--foreground)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {isSubmittingManual ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── UPI QR Preview Modal ── */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[var(--card)] border border-amber-500/40 rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 my-auto">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-black text-[var(--foreground)]">
                  Live Merchant UPI QR Code
                </h4>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  Scan to test instant UPI payments to muthurajc@slc
                </p>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)]">
              <UpiQrCard
                amount={49}
                orderNumber={`TEST-${Date.now().toString().slice(-4)}`}
                upiId="muthurajc@slc"
                isProcessing={false}
                onConfirmPayment={async (utr) => {
                  showToast({
                    type: "success",
                    title: "Test UTR Captured",
                    message: `UTR ${utr} recorded in QR tester.`,
                  });
                  setShowQrModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
