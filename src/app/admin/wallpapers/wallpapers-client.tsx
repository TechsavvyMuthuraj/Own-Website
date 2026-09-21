"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Plus,
  Search,
  Download,
  ExternalLink,
  Edit2,
  Trash2,
  Sparkles,
  Eye,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Database,
  RefreshCw,
  Layers,
  Monitor,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import type { Wallpaper } from "@/types/database";

interface WallpapersClientProps {
  initialWallpapers: Wallpaper[];
}

const CATEGORY_OPTIONS = [
  "Cosmic & Space",
  "Cyberpunk & Tech",
  "Minimal & Dark",
  "Anime & Art",
  "Abstract & 3D",
  "Nature & Cinema",
  "Gaming & 4K",
  "Amoled Black",
];

const RESOLUTION_OPTIONS = [
  "4K Ultra HD (3840x2160)",
  "8K Ultra HD (7680x4320)",
  "2K QHD (2560x1440)",
  "Ultrawide 21:9",
  "Mobile 4K (Portrait)",
];

export function WallpapersClient({
  initialWallpapers,
}: WallpapersClientProps) {
  const { showToast, confirm } = useToast();
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(initialWallpapers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallpaper, setEditingWallpaper] = useState<Wallpaper | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState<Wallpaper | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [category, setCategory] = useState("Cosmic & Space");
  const [resolution, setResolution] = useState("4K Ultra HD (3840x2160)");
  const [isFeatured, setIsFeatured] = useState(true);
  const [isActive, setIsActive] = useState(true);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingWallpaper(null);
    setName("");
    setPreviewUrl("");
    setDownloadUrl("");
    setCategory("Cosmic & Space");
    setResolution("4K Ultra HD (3840x2160)");
    setIsFeatured(true);
    setIsActive(true);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (wp: Wallpaper) => {
    setEditingWallpaper(wp);
    setName(wp.name);
    setPreviewUrl(wp.preview_url);
    setDownloadUrl(wp.download_url);
    setCategory(wp.category || "4K Wallpapers");
    setResolution(wp.resolution || "4K Ultra HD (3840x2160)");
    setIsFeatured(wp.is_featured ?? true);
    setIsActive(wp.is_active ?? true);
    setIsModalOpen(true);
  };

  // Handle Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !previewUrl.trim() || !downloadUrl.trim()) {
      showToast({ message: "Please provide Name, Preview Link, and Download Link", type: "error" });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(),
        preview_url: previewUrl.trim(),
        download_url: downloadUrl.trim(),
        category,
        resolution,
        is_featured: isFeatured,
        is_active: isActive,
      };

      if (editingWallpaper) {
        const res = await fetch(`/api/wallpapers/${editingWallpaper.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update wallpaper");

        setWallpapers((prev) =>
          prev.map((w) => (w.id === editingWallpaper.id ? { ...w, ...payload } : w))
        );
        showToast({ message: "Wallpaper updated successfully", type: "success" });
      } else {
        const res = await fetch("/api/wallpapers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create wallpaper");

        const newWp: Wallpaper = data.wallpaper || {
          id: `wp-${Date.now()}`,
          ...payload,
          downloads_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setWallpapers((prev) => [newWp, ...prev]);
        showToast({ message: "Wallpaper added successfully", type: "success" });
      }

      setIsModalOpen(false);
    } catch (err: any) {
      showToast({ message: err.message || "Failed to save wallpaper", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete with Custom Modal
  const handleDelete = (id: string, wpName: string) => {
    confirm({
      title: "Delete Wallpaper",
      message: `Are you sure you want to permanently delete "${wpName}"? This action cannot be undone.`,
      confirmText: "Delete Wallpaper",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/wallpapers/${id}`, { method: "DELETE" });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to delete");
          }
          setWallpapers((prev) => prev.filter((w) => w.id !== id));
          showToast({ message: "Wallpaper deleted successfully", type: "success" });
        } catch (err: any) {
          // If table is not yet in db, delete from local state
          setWallpapers((prev) => prev.filter((w) => w.id !== id));
          showToast({ message: "Wallpaper removed from current view", type: "info" });
        }
      },
    });
  };

  // Copy URL
  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast({ message: "Download link copied to clipboard", type: "success" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter Wallpapers
  const filteredWallpapers = wallpapers.filter((wp) => {
    const matchesSearch =
      wp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wp.category && wp.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === "ALL" || wp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── SaaS Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            4K UHD Visual Engine • S3 Presigned Node
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ImageIcon className="w-7 h-7 text-amber-400" />
            <span>4K Wallpapers Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Curate, configure resolution tags, and distribute watermark-free Ultra HD desktop and mobile backgrounds.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-neutral-950 font-black text-xs transition-all shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add 4K Wallpaper</span>
          </button>
        </div>
      </div>

      {/* ── SaaS Search & Categories Bar ── */}
      <div className="p-4 rounded-3xl border border-neutral-800/80 bg-neutral-900/50 backdrop-blur-xl shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search wallpapers by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all shadow-inner"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === "ALL"
                ? "bg-amber-500 text-neutral-950 shadow-sm"
                : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            All Wallpapers ({wallpapers.length})
          </button>
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-sm"
                  : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Wallpapers Cards Grid */}
      {filteredWallpapers.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[var(--border)] rounded-2xl bg-[var(--card)]">
          <ImageIcon className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-[var(--foreground)]">No Wallpapers Found</h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Try adjusting your search criteria or create your first 4K wallpaper.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWallpapers.map((wp) => (
            <div
              key={wp.id}
              className="group relative rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all flex flex-col"
            >
              {/* Wallpaper Preview Area - Natural Right-Click Enabled */}
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-900 group">
                <img
                  src={wp.preview_url}
                  alt={wp.name}
                  loading="lazy"
                  onContextMenu={(e) => e.stopPropagation()} // Allows native right-click "Save image as..."
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                  onClick={() => setPreviewModalImage(wp)}
                  title="Click to view full preview, or right-click to save image"
                />

                {/* Badge tags overlay */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/30">
                    {wp.resolution || "4K UHD"}
                  </span>
                  {wp.is_featured && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-neutral-950 shadow-sm">
                      ★ FEATURED
                    </span>
                  )}
                </div>

                {/* Fullscreen Preview Trigger */}
                <button
                  type="button"
                  onClick={() => setPreviewModalImage(wp)}
                  className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Open Preview Lightbox"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Wallpaper Details */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-1">
                  <span className="font-semibold text-amber-500/90">{wp.category}</span>
                  <span className="text-[11px] font-mono">
                    {wp.downloads_count || 0} downloads
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight line-clamp-1 mb-3">
                  {wp.name}
                </h3>

                {/* Direct Right-Click Notice */}
                <div className="p-2 rounded-lg bg-[var(--secondary)] border border-[var(--border)] text-[11px] text-[var(--muted-foreground)] mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">Right-click preview image to save directly</span>
                </div>

                {/* Action Footer */}
                <div className="mt-auto pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Direct High-Res Download link */}
                    <a
                      href={wp.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-neutral-950 text-xs font-bold transition-all cursor-pointer"
                      title="Open full high-resolution original"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>

                    {/* Copy Link Button */}
                    <button
                      type="button"
                      onClick={() => handleCopy(wp.download_url, wp.id)}
                      className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                      title="Copy Download URL"
                    >
                      {copiedId === wp.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(wp)}
                      className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                      title="Edit Wallpaper"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(wp.id, wp.name)}
                      className="p-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                      title="Delete Wallpaper"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT WALLPAPER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight mb-1">
              {editingWallpaper ? "Edit 4K Wallpaper" : "Add New 4K Wallpaper"}
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] mb-6">
              Fill in the wallpaper name, preview image URL, and high-res download link.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Wallpaper Name */}
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                  Wallpaper Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk Neo Tokyo Night"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Preview Link (Thumbnail/Display URL) */}
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                  Preview Image Link (URL) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-...?w=1200&q=80"
                  value={previewUrl}
                  onChange={(e) => setPreviewUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <span className="text-[10px] text-[var(--muted-foreground)] mt-1 block">
                  Link to the image shown in the gallery. Users can right-click this preview to download directly.
                </span>
              </div>

              {/* Live Preview Box */}
              {previewUrl.trim() && (
                <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-neutral-900 p-2">
                  <span className="text-[10px] font-bold text-amber-400 block mb-1.5 px-1">
                    Live Preview (Right-click to test save):
                  </span>
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black/40">
                    <img
                      src={previewUrl}
                      alt="Preview Test"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                      onContextMenu={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}

              {/* Download Link (Full Original Resolution) */}
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                  High-Resolution Download Link *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-...?w=3840&q=100"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <span className="text-[10px] text-[var(--muted-foreground)] mt-1 block">
                  The primary button download link for 4K / 8K uncompressed original file.
                </span>
              </div>

              {/* Category & Resolution Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                    Resolution Badge
                  </label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    {RESOLUTION_OPTIONS.map((res) => (
                      <option key={res} value={res}>
                        {res}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Switches */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-[var(--border)] text-amber-500 focus:ring-amber-500"
                  />
                  <span>Featured on Homepage</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-[var(--foreground)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded border-[var(--border)] text-amber-500 focus:ring-amber-500"
                  />
                  <span>Active / Published</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-sm font-bold shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Saving..." : editingWallpaper ? "Update Wallpaper" : "Publish Wallpaper"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN PREVIEW LIGHTBOX */}
      {previewModalImage && (
        <div
          onClick={() => setPreviewModalImage(null)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full flex flex-col items-center cursor-default"
          >
            {/* Direct Right-Click Notice Banner */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <div>
                <h3 className="text-lg font-black tracking-tight">{previewModalImage.name}</h3>
                <p className="text-xs text-neutral-400">
                  {previewModalImage.category} • {previewModalImage.resolution} — Right-click image to save directly
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                Close (ESC)
              </button>
            </div>

            {/* Unobstructed Native Image Element for Natural Right-Click */}
            <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black flex items-center justify-center">
              <img
                src={previewModalImage.preview_url}
                alt={previewModalImage.name}
                onContextMenu={(e) => e.stopPropagation()}
                className="max-h-[75vh] w-auto object-contain select-auto"
                title="Right-click and select 'Save image as...' to download directly"
              />
            </div>

            {/* Lightbox Footer Actions */}
            <div className="mt-4 flex items-center gap-3">
              <a
                href={previewModalImage.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res ({previewModalImage.resolution || "4K"})</span>
              </a>
              <button
                type="button"
                onClick={() => handleCopy(previewModalImage.download_url, "modal-copy")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Download Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
