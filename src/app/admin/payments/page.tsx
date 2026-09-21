import React from "react";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { PaymentsClient } from "./payments-client";

export const metadata: Metadata = {
  title: "Payments & Financial Hub - NammaTech Admin",
  description: "Manage real-time revenue, UPI reconciliation, UTR checks, and transaction logs.",
};

export const revalidate = 0;

export default async function AdminPaymentsPage() {
  const supabase = createAdminClient();

  const [{ data: orders }, { data: resources }] = await Promise.all([
    supabase
      .from("orders")
      .select("*, user:profiles(full_name, email), items:order_items(*, resource:resources(id, title, thumbnail_url))")
      .order("created_at", { ascending: false }),
    supabase
      .from("resources")
      .select("id, title, price, sale_price")
      .eq("status", "PUBLISHED")
      .order("title"),
  ]);

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* ── SaaS Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            UPI Settlement &amp; Financial Ledger
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              ₹
            </span>
            <span>Payments &amp; Financial Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Real-time revenue metrics, UPI reconciliation, 12-digit UTR verification, and automated VIP unlock ledger.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300">
            <span className="text-neutral-400">Gateway Status:</span>{" "}
            <span className="text-emerald-400 font-bold ml-1 inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              UPI Direct Instant
            </span>
          </div>
        </div>
      </div>

      <PaymentsClient
        initialOrders={orders || []}
        availableResources={resources || []}
      />
    </div>
  );
}
