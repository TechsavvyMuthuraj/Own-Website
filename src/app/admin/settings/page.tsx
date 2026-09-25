import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { SettingsClient } from "./settings-client";

import { Settings, ShieldCheck, Sliders, Server } from "lucide-react";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const supabase = createAdminClient();
  const { data: settingsData } = await supabase.from("site_settings").select("*");

  const initialSettings: Record<string, any> = {};
  (settingsData || []).forEach((item) => {
    try {
      initialSettings[item.key] =
        typeof item.value === "string" ? JSON.parse(item.value) : item.value;
    } catch {
      initialSettings[item.key] = item.value;
    }
  });

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* ── SaaS Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-gradient-to-br from-white via-slate-50/80 to-white dark:from-neutral-950 dark:via-neutral-900/90 dark:to-neutral-950 shadow-xs relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            Infrastructure &amp; Operations Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-400">
              <Settings className="w-6 h-6" />
            </div>
            <span>Platform Settings &amp; Configuration</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl">
            Global platform parameters, instant maintenance toggling, currency standards, and contact routing protocols.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 flex items-center gap-2 shadow-xs">
            <Server className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>DB Health:</span>{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Operational</span>
          </div>
        </div>
      </div>

      <SettingsClient initialSettings={initialSettings} />
    </div>
  );
}
