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

  return (
    <div className="space-y-6">
      {initialMessages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List of Messages */}
          <div className="md:col-span-1 rounded-3xl border border-[var(--border)] bg-[var(--card)] divide-y divide-[var(--border)] overflow-hidden shadow-sm">
            {initialMessages.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (msg.status === "UNREAD") updateStatus(msg.id, "READ");
                  }}
                  className={`p-4 cursor-pointer transition-colors text-xs ${
                    isSelected
                      ? "bg-[var(--primary)]/10 border-l-4 border-l-[var(--primary)]"
                      : "hover:bg-[var(--secondary)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[var(--foreground)] truncate">
                      {msg.name}
                    </span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                  <p className="font-medium text-[var(--foreground)] truncate mb-1">
                    {msg.subject}
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-1">
                    {msg.message}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Selected Message Viewer */}
          <div className="md:col-span-2 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            {selectedMessage ? (
              <div className="space-y-6 text-xs">
                <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
                  <div>
                    <h3 className="text-base font-bold text-[var(--foreground)] mb-1">
                      {selectedMessage.subject}
                    </h3>
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                      <span>From: {selectedMessage.name} ({selectedMessage.email})</span>
                      <span>•</span>
                      <span>{formatDate(selectedMessage.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedMessage.id)}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"
                      title="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--secondary)]/40 border border-[var(--border)] text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line">
                  {selectedMessage.message}
                </div>

                <div>
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-all"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Reply via Email</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-[var(--muted-foreground)]">
                Select a message on the left to read details and reply.
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
