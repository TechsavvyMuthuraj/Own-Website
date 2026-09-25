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

  const [{ data: orders }, { data: resources }, { data: paymentSettingsRow }] =
    await Promise.all([
      supabase
        .from("orders")
        .select(
          "*, user:profiles(full_name, email), items:order_items(*, resource:resources(id, title, thumbnail_url))"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("resources")
        .select("id, title, price, sale_price")
        .eq("status", "PUBLISHED")
        .order("title"),
      supabase
        .from("site_settings")
        .select("value")
        .eq("key", "payment_settings")
        .maybeSingle(),
    ]);

  let paymentSettings = {
    upi_id: "muthurajc@slc",
    merchant_name: "NammaTech Digital / Muthuraj C",
    receiver_phone: "+91 91764 43726",
  };

  if (paymentSettingsRow?.value) {
    try {
      const parsed =
        typeof paymentSettingsRow.value === "string"
          ? JSON.parse(paymentSettingsRow.value)
          : paymentSettingsRow.value;
      paymentSettings = { ...paymentSettings, ...parsed };
    } catch {}
  }

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* ── SaaS Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-gradient-to-br from-white via-slate-50/80 to-white dark:from-neutral-950 dark:via-neutral-900/90 dark:to-neutral-950 backdrop-blur-xl shadow-xs dark:shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            UPI Settlement &amp; Financial Ledger
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-mono font-bold">
              ₹
            </span>
            <span>Payments &amp; Financial Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl">
            Real-time revenue metrics, UPI reconciliation, 12-digit UTR verification, and automated VIP unlock ledger.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-800 dark:text-neutral-300">
            <span className="text-neutral-500 dark:text-neutral-400">Gateway Status:</span>{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1 inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              UPI Direct Instant
            </span>
          </div>
        </div>
      </div>

      <PaymentsClient
        initialOrders={orders || []}
        availableResources={resources || []}
        initialPaymentSettings={paymentSettings}
      />
    </div>
  );
}
