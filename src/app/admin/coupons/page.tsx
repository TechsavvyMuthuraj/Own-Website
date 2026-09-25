import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Coupon } from "@/types/database";
import { CouponsClient } from "./coupons-client";

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const supabase = createAdminClient();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  const allCoupons = (coupons || []) as Coupon[];
  const activeCoupons = allCoupons.filter((c) => c.is_active).length;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── SaaS Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-gradient-to-br from-white via-slate-50/80 to-white dark:from-neutral-950 dark:via-neutral-900/90 dark:to-neutral-950 shadow-xs relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400 animate-pulse" />
            Promotional Engine • Live Checkout Sync
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
            Coupons & Promotional Vouchers
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl">
            Configure percentage or fixed promotional vouchers, minimum order thresholds, and expiry safeguards.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-neutral-100/90 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 shadow-xs">
            <span className="text-neutral-500 dark:text-neutral-400">Active Codes:</span>{" "}
            <strong className="text-purple-600 dark:text-purple-400 font-mono text-sm font-bold">
              {activeCoupons} / {allCoupons.length}
            </strong>
          </div>
        </div>
      </div>

      <CouponsClient initialCoupons={allCoupons} />
    </div>
  );
}
