"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Megaphone, Loader2, AlertCircle } from "lucide-react";
import type { Announcement } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

export function AnnouncementsClient({ initialAnnouncements }: { initialAnnouncements: Announcement[] }) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [priority, setPriority] = useState("0");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || null,
          cta_text: ctaText.trim() || null,
          cta_url: ctaUrl.trim() || null,
          priority: Number(priority) || 0,
          start_date: startDate ? new Date(startDate).toISOString() : null,
          end_date: endDate ? new Date(endDate).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create announcement.");
      } else {
        setTitle("");
        setContent("");
        setCtaText("");
        setCtaUrl("");
        setShowAddForm(false);
        router.refresh();
      }
    } catch {
      setErrorMsg("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) router.refresh();
    } catch {
      alert("Error deleting announcement.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Cancel" : "New Announcement"}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
            Create Announcement
          </h3>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
              Title / Primary Headline *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Major Software Update v2.0 Released!"
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
              Sub-content / Details (Optional)
            </label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="New tools for developers have been added today."
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Explore now"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                CTA Destination URL
              </label>
              <input
                type="text"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="/new-and-updated"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Priority
              </label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                End / Expiry Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Publish Announcement"}
          </button>
        </form>
      )}

      {initialAnnouncements.length > 0 ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--secondary)]/60 text-[var(--muted-foreground)] uppercase font-semibold border-b border-[var(--border)]">
              <tr>
                <th className="px-5 py-3.5">Headline</th>
                <th className="px-4 py-3.5">CTA Link</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {initialAnnouncements.map((a) => (
                <tr key={a.id} className="hover:bg-[var(--secondary)]/30 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-[var(--foreground)]">
                    {a.title}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[var(--muted-foreground)]">
                    {a.cta_url || "None"}
                  </td>
                  <td className="px-4 py-3.5 font-mono">{a.priority}</td>
                  <td className="px-4 py-3.5">
                    {a.is_active ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-500">
                        INACTIVE
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"
                      title="Delete announcement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={Megaphone}
          title="No active announcements"
          description="The top notification bar is cleanly hidden. Create an announcement to notify users of major updates or events."
          actionText="Create First Announcement"
          onAction={() => setShowAddForm(true)}
        />
      )}
    </div>
  );
}
