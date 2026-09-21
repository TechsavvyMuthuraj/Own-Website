import React from "react";
import { ShoppingBag, CheckCircle2, Clock, XCircle, IndianRupee, ShieldCheck, Zap } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";
import { OrdersTableClient } from "./orders-client";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, user:profiles(full_name, email), items:order_items(*, resource:resources(title))")
    .order("created_at", { ascending: false });

  const allOrders = orders || [];
  const paidOrders = allOrders.filter((o) => o.status === "PAID");
  const pendingOrders = allOrders.filter((o) => o.status === "PENDING");
  const totalRevenue = paidOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
  const conversionRate = allOrders.length > 0 ? Math.round((paidOrders.length / allOrders.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── SaaS Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Settlement & Fulfillment Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-emerald-400" />
            <span>Orders & Fulfillment Pipeline</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Cross-verify UPI UTR transaction numbers, instantly unlock digital download links, and monitor order pipelines.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300">
            <span className="text-neutral-400">Total Settled:</span>{" "}
            <strong className="text-emerald-400 font-mono text-sm font-black">
              {formatCurrency(totalRevenue, "INR")}
            </strong>
          </div>
        </div>
      </div>

      {/* ── SaaS Financial KPI Ribbon ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md shadow-sm flex items-center gap-3.5 hover:-translate-y-0.5 transition-transform">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Total Placed
            </span>
            <span className="text-xl font-black text-white">
              {allOrders.length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md shadow-sm flex items-center gap-3.5 hover:-translate-y-0.5 transition-transform">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Verified & Paid
            </span>
            <span className="text-xl font-black text-emerald-400">
              {paidOrders.length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md shadow-sm flex items-center gap-3.5 hover:-translate-y-0.5 transition-transform">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Pending Review
            </span>
            <span className="text-xl font-black text-amber-400">
              {pendingOrders.length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md shadow-sm flex items-center gap-3.5 hover:-translate-y-0.5 transition-transform">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Fulfillment Rate
            </span>
            <span className="text-xl font-black text-purple-400">
              {conversionRate}%
            </span>
          </div>
        </div>
      </div>

      <OrdersTableClient initialOrders={allOrders} />
    </div>
  );
}
