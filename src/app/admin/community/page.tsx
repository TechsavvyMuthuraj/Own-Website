import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { CommunityMessageRow } from "@/types/database";
import { CommunityManager } from "./community-manager";
import { MessageSquare, Users, ShieldAlert, Sparkles, Volume2 } from "lucide-react";

export const revalidate = 0;

export default async function AdminCommunityPage() {
  const supabase = createAdminClient();

  // Fetch recent messages
  const { data: messages } = await supabase
    .from("community_messages")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(100);

  // Calculate live stats
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const todayTimestamp = todayMidnight.getTime();

  const [
    { count: totalCount },
    { count: todayCount },
    { count: voiceCount },
    { count: pinnedCount },
  ] = await Promise.all([
    supabase.from("community_messages").select("*", { count: "exact", head: true }),
    supabase.from("community_messages").select("*", { count: "exact", head: true }).gte("timestamp", todayTimestamp),
    supabase.from("community_messages").select("*", { count: "exact", head: true }).eq("message_type", "voice"),
    supabase.from("community_messages").select("*", { count: "exact", head: true }).eq("is_pinned", true),
  ]);

  const initialStats = {
    totalMessages: totalCount || 0,
    messagesToday: todayCount || 0,
    voiceNotesCount: voiceCount || 0,
    pinnedCount: pinnedCount || 0,
  };

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* ── SaaS Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-gradient-to-br from-white via-slate-50/80 to-white dark:from-neutral-950 dark:via-neutral-900/90 dark:to-neutral-950 shadow-xs relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Live Moderation &amp; Communications
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span>Community Hub Chat Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
            Audit and moderate live chat messages, edit content, manage voice notes, pin official announcements, and inspect user activity across all channels.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 flex items-center gap-2 shadow-xs">
            <MessageSquare className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>Total Stored:</span>{" "}
            <strong className="text-neutral-900 dark:text-white font-mono text-sm">
              {totalCount || 0}
            </strong>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/20 text-xs text-cyan-700 dark:text-cyan-400 font-bold flex items-center gap-1.5 shadow-xs">
            <Volume2 className="w-3.5 h-3.5 text-cyan-500" />
            <span>{voiceCount || 0} Voice Notes</span>
          </div>
        </div>
      </div>

      <CommunityManager
        initialMessages={(messages || []) as CommunityMessageRow[]}
        initialStats={initialStats}
      />
    </div>
  );
}
