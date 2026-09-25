import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Announcement } from "@/types/database";
import { AnnouncementsClient } from "./announcements-client";

import { Megaphone, Radio, Bell } from "lucide-react";

export const revalidate = 0;

export default async function AdminAnnouncementsPage() {
  const supabase = createAdminClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("priority", { ascending: false });

  const allAnnouncements = (announcements || []) as Announcement[];
  const activeCount = allAnnouncements.filter((a) => a.is_active).length;

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* ── SaaS Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-gradient-to-br from-white via-slate-50/80 to-white dark:from-neutral-950 dark:via-neutral-900/90 dark:to-neutral-950 shadow-xs relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Global Broadcast &amp; Alerts Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <Megaphone className="w-6 h-6" />
            </div>
            <span>Announcement Bar Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl">
            Configure real-time banner announcements, priority order, expiration dates, and CTA buttons across the public website.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 flex items-center gap-2 shadow-xs">
            <Bell className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Total Broadcasts:</span>{" "}
            <strong className="text-neutral-900 dark:text-white font-mono text-sm">{allAnnouncements.length}</strong>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            {activeCount} Active Live
          </div>
        </div>
      </div>

      <AnnouncementsClient initialAnnouncements={allAnnouncements} />
    </div>
  );
}
