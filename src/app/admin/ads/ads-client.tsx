"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Sliders, AlertCircle } from "lucide-react";
import type { AdPlacement } from "@/types/database";
import { EmptyState } from "@/components/ui/empty-state";

export function AdsClient({ initialAds }: { initialAds: AdPlacement[] }) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState<any>("HEADER");
  const [provider, setProvider] = useState("CUSTOM");
  const [adCode, setAdCode] = useState("");
  const [priority, setPriority] = useState("0");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !adCode.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          location,
          provider,
          ad_code: adCode.trim(),
          priority: Number(priority) || 0,
          is_active: true,
        }),
      });

      if (res.ok) {
        setTitle("");
        setAdCode("");
        setShowAddForm(false);
        router.refresh();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to create ad placement.");
      }
    } catch {
      setErrorMsg("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this ad placement?")) return;
    try {
      const res = await fetch("/api/admin/ads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) router.refresh();
    } catch {
      alert("Error deleting ad placement.");
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
          <span>{showAddForm ? "Cancel" : "Add Ad Placement"}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
            Configure Ad Slot
          </h3>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Placement Label *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Top Header Banner"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Display Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs"
              >
                <option value="HEADER">Header Banner</option>
                <option value="HOMEPAGE">Homepage Feature</option>
                <option value="IN_FEED">In-Feed Grid</option>
                <option value="SIDEBAR">Detail Page Sidebar</option>
                <option value="RESOURCE_PAGE">Resource Page Bottom</option>
                <option value="FOOTER">Footer Banner</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
              Ad HTML / Embed Code *
            </label>
            <textarea
              rows={4}
              required
              value={adCode}
              onChange={(e) => setAdCode(e.target.value)}
              placeholder="<!-- Script or iframe code -->"
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Ad Placement"}
          </button>
        </form>
      )}

      {initialAds.length > 0 ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--secondary)]/60 text-[var(--muted-foreground)] uppercase font-semibold border-b border-[var(--border)]">
              <tr>
                <th className="px-5 py-3.5">Title</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Provider</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {initialAds.map((ad) => (
                <tr key={ad.id} className="hover:bg-[var(--secondary)]/30 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-[var(--foreground)]">
                    {ad.title}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[var(--muted-foreground)]">
                    {ad.location}
                  </td>
                  <td className="px-4 py-3.5">{ad.provider}</td>
                  <td className="px-4 py-3.5">
                    {ad.is_active ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-500">
                        OFF
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(ad.id)}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg"
                      title="Delete ad slot"
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
          icon={Sliders}
          title="No ad placements configured"
          description="Monetization slots can be safely added here. Ads remain clearly distinguished from content and download buttons."
          actionText="Add First Ad Slot"
          onAction={() => setShowAddForm(true)}
        />
      )}
    </div>
  );
}
