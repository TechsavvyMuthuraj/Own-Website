import React from "react";
import { Layout, Sparkles, DollarSign, Radio, Layers } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdPlacement } from "@/types/database";
import { AdsClient } from "./ads-client";

export const revalidate = 0;

export default async function AdminAdsPage() {
  const supabase = createAdminClient();

  const [{ data: ads }, { data: settingsData }] = await Promise.all([
    supabase.from("ad_placements").select("*").order("priority", { ascending: false }),
    supabase.from("site_settings").select("key,value").in("key", ["ads_enabled", "adsense_auto_ads"]),
  ]);

  const globalSettings: Record<string, any> = {
    ads_enabled: true,
    adsense_auto_ads: true,
    adsense_client_id: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-1960459798233871",
  };

  (settingsData || []).forEach((item: any) => {
    try {
      globalSettings[item.key] = typeof item.value === "string" ? JSON.parse(item.value) : item.value;
    } catch {
      globalSettings[item.key] = item.value;
    }
  });

  const allAds = (ads || []) as AdPlacement[];
  const activeAdCount = allAds.filter((a) => a.is_active).length;

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* ── SaaS Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-gradient-to-br from-white via-slate-50/80 to-white dark:from-neutral-950 dark:via-neutral-900/90 dark:to-neutral-950 shadow-xs relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            AdSense Monetization &amp; Yield Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400">
              <Layers className="w-6 h-6" />
            </div>
            <span>Ad Monetization &amp; Placements</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl">
            Manage Google AdSense integration, high-CTR download page units, in-feed banners, and publisher compliance rules.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 flex items-center gap-2 shadow-xs">
            <Radio className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Active Units:</span>{" "}
            <strong className="text-neutral-900 dark:text-white font-mono text-sm">{activeAdCount} / {allAds.length}</strong>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            Auto-Ads Active
          </div>
        </div>
      </div>

      <AdsClient
        initialAds={allAds}
        initialSettings={globalSettings}
      />
    </div>
  );
}
