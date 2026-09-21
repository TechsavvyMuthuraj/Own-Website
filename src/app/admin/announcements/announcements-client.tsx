"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Edit2, Megaphone, Loader2, AlertCircle, Check, X } from "lucide-react";
import type { Announcement } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

export function AnnouncementsClient({ initialAnnouncements }: { initialAnnouncements: Announcement[] }) {
  const router = useRouter();
  const { showToast, confirm } = useToast();
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit Announcement Modal state
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCtaText, setEditCtaText] = useState("");
  const [editCtaUrl, setEditCtaUrl] = useState("");
  const [editPriority, setEditPriority] = useState("0");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [editErrorMsg, setEditErrorMsg] = useState("");

  const openEditModal = (a: Announcement) => {
    setEditingAnnouncement(a);
    setEditTitle(a.title);
    setEditContent(a.content || "");
    setEditCtaText(a.cta_text || "");
    setEditCtaUrl(a.cta_url || "");
    setEditPriority(String(a.priority ?? 0));
    setEditStartDate(a.start_date ? a.start_date.split("T")[0] : "");
    setEditEndDate(a.end_date ? a.end_date.split("T")[0] : "");
    setEditIsActive(a.is_active ?? true);
    setEditErrorMsg("");
  };

  const closeEditModal = () => {
    setEditingAnnouncement(null);
    setEditErrorMsg("");
  };

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
        showToast({
          type: "error",
          title: "Create Failed",
          message: data.error || "Failed to create announcement.",
        });
      } else {
        showToast({
          type: "success",
          title: "Announcement Published 📢",
          message: `"${title}" has been published.`,
        });
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement || !editTitle.trim()) return;

    setEditLoading(true);
    setEditErrorMsg("");

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAnnouncement.id,
          title: editTitle.trim(),
          content: editContent.trim() || null,
          cta_text: editCtaText.trim() || null,
          cta_url: editCtaUrl.trim() || null,
          priority: Number(editPriority) || 0,
          start_date: editStartDate ? new Date(editStartDate).toISOString() : null,
          end_date: editEndDate ? new Date(editEndDate).toISOString() : null,
          is_active: editIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditErrorMsg(data.error || "Failed to update announcement.");
      } else {
        showToast({
          type: "success",
          title: "Announcement Updated ✏️",
          message: `"${editTitle}" updated successfully.`,
        });
        closeEditModal();
        router.refresh();
      }
    } catch {
      setEditErrorMsg("Network error occurred.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (id: string, annTitle?: string) => {
    confirm({
      title: "Delete Announcement?",
      message: "Are you sure you want to permanently delete this announcement?",
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        setDeletingId(id);
        try {
          const res = await fetch("/api/admin/announcements", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          const data = await res.json();
          if (res.ok) {
            showToast({
              type: "success",
              title: "Announcement Removed",
              message: "The announcement has been deleted.",
            });
            router.refresh();
          } else {
            showToast({
              type: "error",
              title: "Deletion Failed",
              message: data.error || "Failed to delete announcement.",
            });
          }
        } catch {
          showToast({
            type: "error",
            title: "Network Error",
            message: "Error deleting announcement.",
          });
        } finally {
          setDeletingId(null);
        }
      },
    });
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
          <span>{showAddForm ? "Cancel" : "Add Announcement"}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
            Broadcast Announcement
          </h3>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
              Headline Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 🚀 Summer Release: 50+ new open-source templates added!"
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
              Details / Content (optional)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={2}
              placeholder="Further context or instructions..."
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
                placeholder="e.g. Explore Now"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                CTA URL
              </label>
              <input
                type="url"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://... or /resources"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
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
        <div className="rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-neutral-950/80 text-neutral-400 uppercase font-semibold border-b border-neutral-800 tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Headline</th>
                  <th className="px-4 py-4">CTA Link</th>
                  <th className="px-4 py-4">Priority</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {initialAnnouncements.map((a) => (
                  <tr key={a.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <Megaphone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span>{a.title}</span>
                      </div>
                      {a.content && (
                        <div className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                          {a.content}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 font-mono text-neutral-400">
                      {a.cta_url ? (
                        <span className="truncate max-w-[150px] inline-block text-sky-400">{a.cta_url}</span>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-neutral-300">
                      <span className="px-2 py-0.5 rounded-lg bg-neutral-800 text-neutral-300">
                        P-{a.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {a.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-500">
                          INACTIVE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(a)}
                          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors border border-neutral-800"
                          title="Edit announcement"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id)}
                          disabled={deletingId === a.id}
                          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors border border-rose-500/20"
                          title="Delete announcement"
                        >
                          {deletingId === a.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      {/* Edit Announcement Modal */}
      {editingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[var(--primary)]" />
                <h3 className="font-bold text-sm text-[var(--foreground)]">Edit Announcement</h3>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editErrorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{editErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Headline Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Details / Content (optional)
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={2}
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
                    value={editCtaText}
                    onChange={(e) => setEditCtaText(e.target.value)}
                    placeholder="e.g. Explore Now"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                    CTA URL
                  </label>
                  <input
                    type="text"
                    value={editCtaUrl}
                    onChange={(e) => setEditCtaUrl(e.target.value)}
                    placeholder="https://... or /resources"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
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
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                    End / Expiry Date
                  </label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="rounded text-[var(--primary)]"
                  />
                  <span>Active (Broadcasting)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-medium hover:bg-[var(--secondary)] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all disabled:opacity-50 shadow-sm"
                >
                  {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editLoading ? "Updating..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
