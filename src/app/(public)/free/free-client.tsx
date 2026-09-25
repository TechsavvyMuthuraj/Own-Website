"use client";

import React, { useState, useMemo } from "react";
import { Download, Sparkles, ShieldCheck, Zap, Search, X } from "lucide-react";
import type { Resource } from "@/types/database";
import { ResourceGrid } from "@/components/resources/resource-grid";
import { VoiceSearchButton } from "@/components/search/voice-search-button";

interface FreeClientProps {
  initialResources: Resource[];
}

export function FreeClient({ initialResources }: FreeClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Extract unique category names
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialResources.forEach((res) => {
      if (res.category?.name) set.add(res.category.name);
    });
    return Array.from(set);
  }, [initialResources]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return initialResources.filter((res) => {
      const matchesCat =
        selectedCategory === "all" ||
        res.category?.name?.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        res.title.toLowerCase().includes(q) ||
        (res.short_description && res.short_description.toLowerCase().includes(q)) ||
        (res.platform && res.platform.toLowerCase().includes(q));

      return matchesCat && matchesSearch;
    });
  }, [initialResources, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Hero Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 border border-black/10 dark:border-white/10 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
              <Download className="w-3.5 h-3.5" />
              100% Free Repository
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/5 dark:bg-white/10 text-[var(--muted-foreground)]">
              Direct Cloud Mirrors
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">
            Free Open-Source & Freeware Downloads
          </h1>

          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
            Clean, hash-verified open-source utilities, developer software, Android APKs, and tools. Zero paywalls, zero deceptive download timers, and zero malware.
          </p>

          {/* Trust Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-[11px]">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-[var(--foreground)]">SHA-256 Hash Verified</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold text-[var(--foreground)]">High-Speed Cloud CDNs</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="font-semibold text-[var(--foreground)]">Freeware & MIT License</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--foreground)]"
            }`}
          >
            All Free ({initialResources.length})
          </button>

          {categories.map((cat) => {
            const count = initialResources.filter(
              (r) => r.category?.name?.toLowerCase() === cat.toLowerCase()
            ).length;
            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                    : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--foreground)]"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Live Filter Search with Voice Search Button */}
        <div className="relative flex items-center rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-1 pl-3 min-w-[260px] sm:min-w-[300px]">
          <Search className="w-4 h-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter free software..."
            className="flex-1 bg-transparent px-2.5 py-1 text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <VoiceSearchButton
            onTranscript={(transcript) => setSearchQuery(transcript)}
          />
        </div>
      </div>

      {/* Grid of Filtered Resources */}
      <ResourceGrid
        resources={filteredResources}
        emptyTitle="No free resources found"
        emptyDescription={
          searchQuery
            ? `No free tools match "${searchQuery}". Try a different keyword.`
            : "No resources found in this category."
        }
        emptyActionText="Clear Filters"
        emptyActionHref="/free"
      />
    </div>
  );
}
