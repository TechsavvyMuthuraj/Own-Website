"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Trash2, CheckCircle2, Archive, MessageSquare } from "lucide-react";
import type { ContactMessage } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

export function MessagesClient({ initialMessages }: { initialMessages: ContactMessage[] }) {
  const router = useRouter();
  const { showToast, confirm } = useToast();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        showToast({ message: "Status updated", type: "success" });
        router.refresh();
      }
    } catch {
      showToast({ message: "Failed to update status", type: "error" });
    }
  };

  const handleDelete = (id: string) => {
    confirm({
      title: "Delete Message",
      message: "Are you sure you want to permanently delete this contact message?",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/messages", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          if (res.ok) {
            if (selectedMessage?.id === id) setSelectedMessage(null);
            showToast({ message: "Message deleted", type: "success" });
            router.refresh();
          }
        } catch {
          showToast({ message: "Failed to delete message", type: "error" });
        }
      },
    });
  };

  const unreadCount = initialMessages.filter((m) => m.status === "UNREAD").length;
  const readCount = initialMessages.filter((m) => m.status === "READ").length;

  const filteredMessages = initialMessages.filter((msg) => {
    if (activeTab === "UNREAD" && msg.status !== "UNREAD") return false;
    if (activeTab === "READ" && msg.status !== "READ") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        msg.name?.toLowerCase().includes(q) ||
        msg.email?.toLowerCase().includes(q) ||
        msg.subject?.toLowerCase().includes(q) ||
        msg.message?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── Filter & Search Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Inquiries", count: initialMessages.length },
            { id: "UNREAD", label: "Unread", count: unreadCount },
            { id: "READ", label: "Read / Resolved", count: readCount },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-sky-500 text-neutral-950 shadow-md shadow-sky-500/20"
                    : "bg-neutral-900/60 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? "bg-neutral-950 text-sky-400"
                      : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sender, email, subject..."
            className="w-full pl-4 pr-10 py-2 rounded-xl border border-neutral-800 bg-neutral-900/60 text-xs text-white placeholder-neutral-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
          />
        </div>
      </div>

      {initialMessages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List of Messages */}
          <div className="md:col-span-1 rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl divide-y divide-neutral-800/60 overflow-hidden shadow-xl max-h-[700px] overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                No inquiries matched your filter.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                const isUnread = msg.status === "UNREAD";
                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessage(msg);
                      if (msg.status === "UNREAD") updateStatus(msg.id, "READ");
                    }}
                    className={`p-4 cursor-pointer transition-all text-xs relative ${
                      isSelected
                        ? "bg-sky-500/10 border-l-4 border-l-sky-400"
                        : "hover:bg-neutral-800/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse flex-shrink-0" />
                        )}
                        <span className={`font-semibold truncate ${isUnread ? "text-white font-bold" : "text-neutral-300"}`}>
                          {msg.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500 flex-shrink-0 ml-2">
                        {formatDate(msg.created_at)}
                      </span>
                    </div>
                    <p className={`truncate mb-1 text-xs ${isUnread ? "text-sky-300 font-semibold" : "text-neutral-300"}`}>
                      {msg.subject}
                    </p>
                    <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Message Viewer */}
          <div className="md:col-span-2 rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl p-6 shadow-xl relative">
            {selectedMessage ? (
              <div className="space-y-6 text-xs">
                <div className="flex items-start justify-between border-b border-neutral-800 pb-5">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1.5 tracking-tight">
                      {selectedMessage.subject}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-neutral-400 text-xs">
                      <span>From: <strong className="text-white">{selectedMessage.name}</strong></span>
                      <span>&bull;</span>
                      <span className="font-mono text-neutral-400">{selectedMessage.email}</span>
                      <span>&bull;</span>
                      <span>{formatDate(selectedMessage.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors border border-rose-500/20"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 text-sm text-neutral-200 leading-relaxed whitespace-pre-line font-sans shadow-inner">
                  {selectedMessage.message}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-neutral-950 font-bold hover:bg-sky-400 shadow-md shadow-sky-500/20 transition-all text-xs"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Reply via Email</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => updateStatus(selectedMessage.id, selectedMessage.status === "READ" ? "UNREAD" : "READ")}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:text-white hover:border-neutral-700 text-xs font-semibold transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Mark as {selectedMessage.status === "READ" ? "Unread" : "Read"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center text-xs text-neutral-500 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800/50 flex items-center justify-center text-neutral-400 mb-3 border border-neutral-700/50">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="font-semibold text-neutral-300 mb-1">No inquiry selected</p>
                <p className="text-neutral-500 max-w-xs">Select any submission on the left panel to inspect details and respond.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Mail}
          title="Inbox is empty"
          description="Zero customer inquiries received so far. When visitors submit inquiries on the public contact form, they will appear here."
        />
      )}
    </div>
  );
}
