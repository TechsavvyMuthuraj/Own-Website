"use client";

import React, { useState } from "react";
import {
  Image as ImageIcon,
  Download,
  Eye,
  Sparkles,
  X,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import type { Wallpaper } from "@/types/database";

interface HomepageWallpapersProps {
  wallpapers: Wallpaper[];
}

export function HomepageWallpapers({ wallpapers }: HomepageWallpapersProps) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [activeLightbox, setActiveLightbox] = useState<Wallpaper | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!wallpapers || wallpapers.length === 0) {
    return null;
  }

  // Extract unique categories
  const categories = [
    "ALL",
    ...Array.from(new Set(wallpapers.map((w) => w.category).filter(Boolean))),
  ] as string[];

  const filtered = wallpapers.filter((w) => {
    if (selectedCategory === "ALL") return true;
    return w.category === selectedCategory;
  });

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <ImageIcon className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Exclusive Visuals
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
            4K & Ultra HD Wallpapers
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1 max-w-xl">
            Verified, watermark-free high-resolution wallpapers for desktop and mobile. Right-click any preview to save directly or download original 4K/8K.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20"
                  : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]"
              }`}
            >
              {cat === "ALL" ? "All Wallpapers" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Wallpapers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((wp) => (
          <div
            key={wp.id}
            className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all duration-300"
          >
            {/* Image Preview Container - Natural Right-Click Enabled */}
            <div className="relative aspect-video w-full overflow-hidden bg-neutral-900 group">
              <img
                src={wp.preview_url}
                alt={wp.name}
                loading="lazy"
                onContextMenu={(e) => e.stopPropagation()} // Preserves native right-click "Save image as..."
                onClick={() => setActiveLightbox(wp)}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                title="Click for full preview, or right-click to save image"
              />

              {/* Tags overlay */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-black/75 backdrop-blur-md text-amber-400 border border-amber-500/30">
                  {wp.resolution || "4K UHD"}
                </span>
                {wp.is_featured && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-neutral-950 shadow-sm">
                    ★ FEATURED
                  </span>
                )}
              </div>

              {/* Quick View Button on Hover */}
              <button
                type="button"
                onClick={() => setActiveLightbox(wp)}
                className="absolute bottom-2.5 right-2.5 p-2 rounded-xl bg-black/60 hover:bg-black/90 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                title="Open Preview Lightbox"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {/* Details & Actions */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)] mb-1">
                  <span className="font-semibold text-amber-500/90">{wp.category}</span>
                  <span className="font-mono text-[10px]">Watermark-Free</span>
                </div>
                <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight line-clamp-1 mb-2">
                  {wp.name}
                </h3>
              </div>

              {/* Right-Click Hint & Download Button */}
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2 mt-2">
                <span className="text-[10px] text-[var(--muted-foreground)] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Right-click to save
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveLightbox(wp)}
                    className="p-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                    title="Quick Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={wp.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold shadow-sm transition-all cursor-pointer"
                    title="Download original 4K file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download 4K</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LIGHTBOX MODAL */}
      {activeLightbox && (
        <div
          onClick={() => setActiveLightbox(null)}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full flex flex-col items-center cursor-default"
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between pb-3 text-white">
              <div>
                <h3 className="text-lg font-black tracking-tight">{activeLightbox.name}</h3>
                <p className="text-xs text-neutral-400">
                  {activeLightbox.category} • {activeLightbox.resolution || "4K Ultra HD"} — Right-click image to save directly
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveLightbox(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Unobstructed Native Image Element for Right-Click Save */}
            <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black flex items-center justify-center">
              <img
                src={activeLightbox.preview_url}
                alt={activeLightbox.name}
                onContextMenu={(e) => e.stopPropagation()}
                className="max-h-[75vh] w-auto object-contain select-auto"
                title="Right-click and select 'Save image as...' to download directly"
              />
            </div>

            {/* Footer Buttons */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <a
                href={activeLightbox.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Original ({activeLightbox.resolution || "4K"})</span>
              </a>

              <button
                type="button"
                onClick={() => handleCopy(activeLightbox.download_url, "lightbox-copy")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors cursor-pointer"
              >
                {copiedId === "lightbox-copy" ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Download URL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
