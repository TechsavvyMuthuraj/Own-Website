import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { HomepageClient } from "./homepage-client";

import { Sparkles, Eye, LayoutTemplate, Layers } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminHomepagePage() {
  const supabase = createAdminClient();
  const { data: settingsData } = await supabase
    .from("site_settings")
    .select("*")
    .eq("key", "homepage_settings")
    .maybeSingle();

  let initialSettings: Record<string, any> = {};
  if (settingsData?.value) {
    try {
      initialSettings =
        typeof settingsData.value === "string"
          ? JSON.parse(settingsData.value)
          : settingsData.value;
    } catch {
      initialSettings = {};
    }
  }

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* ── SaaS Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-gradient-to-br from-white via-slate-50/80 to-white dark:from-neutral-950 dark:via-neutral-900/90 dark:to-neutral-950 shadow-xs relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-50 dark:bg-fuchsia-500/10 border border-fuchsia-200 dark:border-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse" />
            Visual Experience &amp; Storefront Architecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-500/10 border border-fuchsia-200 dark:border-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-400">
              <LayoutTemplate className="w-6 h-6" />
            </div>
            <span>Homepage Experience &amp; Sections</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl">
            Customize and configure the 3D WebGL hero banner, section toggles, category displays, featured spotlight, and founder bio on the public homepage.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-all shadow-xs group"
          >
            <Eye className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400 group-hover:scale-110 transition-transform" />
            <span>Preview Storefront</span>
          </Link>
        </div>
      </div>

      <HomepageClient initialSettings={initialSettings} />
    </div>
  );
}
