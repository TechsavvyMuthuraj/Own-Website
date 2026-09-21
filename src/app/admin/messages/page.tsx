import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ContactMessage } from "@/types/database";
import { MessagesClient } from "./messages-client";

import { MessageSquare, Mail, Inbox, Clock } from "lucide-react";

export const revalidate = 0;

export default async function AdminMessagesPage() {
  const supabase = createAdminClient();
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  const allMessages = (messages || []) as ContactMessage[];
  const unreadCount = allMessages.filter((m) => m.status === "UNREAD").length;

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* ── SaaS Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            Support Communications &amp; Triage
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span>Contact Submissions &amp; Inbox</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Review incoming user inquiries, support tickets, bug reports, and copyright requests with real-time status syncing.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300 flex items-center gap-2">
            <Inbox className="w-4 h-4 text-sky-400" />
            <span>Total Messages:</span>{" "}
            <strong className="text-white font-mono text-sm">{allMessages.length}</strong>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping inline-block" />
            {unreadCount} Unread
          </div>
        </div>
      </div>

      <MessagesClient initialMessages={allMessages} />
    </div>
  );
}
