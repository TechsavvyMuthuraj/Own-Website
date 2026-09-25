"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Sparkles, Crown, Zap, ShieldCheck, Film, Headphones, Search, X, CheckCircle2 } from "lucide-react";
import type { Resource } from "@/types/database";
import { ResourceGrid } from "@/components/resources/resource-grid";
import { VoiceSearchButton } from "@/components/search/voice-search-button";

interface PremiumClientProps {
  initialResources: Resource[];
}

export function PremiumClient({ initialResources }: PremiumClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const set = new Set<string>();
    initialResources.forEach((res) => {
      if (res.category?.name) set.add(res.category.name);
    });
    return Array.from(set);
  }, [initialResources]);

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
      {/* Gold VIP Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-[#0e0a05] backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1.5 shadow-xs">
              <Crown className="w-3.5 h-3.5" />
              NammaTech VIP Club
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/90">
              Verified Commercial & 4K VIP
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Premium Digital Resources & VIP Passes
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Authorized commercial tools, enterprise UI kits, VIP 4K UHD Master prints, and dedicated developer assistance. Direct high-speed mirrors with instant UPI QR & UTR verification.
          </p>

          {/* 4 VIP Pillars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px]">
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md space-y-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <p className="font-bold text-white">Cloud Mirrors</p>
              <p className="text-zinc-400 text-[10px]">Zero waiting time, 10Gbps fast lane</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md space-y-1">
              <Film className="w-4 h-4 text-rose-400" />
              <p className="font-bold text-white">4K VIP Cinema</p>
              <p className="text-zinc-400 text-[10px]">Dolby Atmos UHD Master prints</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md space-y-1">
              <Headphones className="w-4 h-4 text-cyan-400" />
              <p className="font-bold text-white">Direct Support</p>
              <p className="text-zinc-400 text-[10px]">WhatsApp & phone dev assistance</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <p className="font-bold text-white">Instant UTR Pay</p>
              <p className="text-zinc-400 text-[10px]">UPI QR code instant unlock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills & Live Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--foreground)]"
            }`}
          >
            All Premium ({initialResources.length})
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
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--foreground)]"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Live Filter Search with Voice Search */}
        <div className="relative flex items-center rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-1 pl-3 min-w-[260px] sm:min-w-[300px]">
          <Search className="w-4 h-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter VIP resources..."
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

      {/* Grid */}
      <ResourceGrid
        resources={filteredResources}
        emptyTitle="No premium resources listed yet"
        emptyDescription="There are currently no commercial or premium digital resources matching your filter. Explore our free releases or check back soon."
        emptyActionText="Explore Free Resources"
        emptyActionHref="/free"
      />
    </div>
  );
}
