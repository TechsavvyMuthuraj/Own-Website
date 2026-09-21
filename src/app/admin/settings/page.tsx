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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Infrastructure &amp; Operations Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <Settings className="w-6 h-6" />
            </div>
            <span>Platform Settings &amp; Configuration</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Global platform parameters, instant maintenance toggling, currency standards, and contact routing protocols.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300 flex items-center gap-2">
            <Server className="w-4 h-4 text-violet-400" />
            <span>DB Health:</span>{" "}
            <span className="text-emerald-400 font-bold">100% Operational</span>
          </div>
        </div>
      </div>

      <SettingsClient initialSettings={initialSettings} />
    </div>
  );
}
