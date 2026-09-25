"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Search,
  Type,
  Sparkles,
  Check,
  ExternalLink,
  BookOpen,
  Laptop,
  Code,
  PenTool,
  Cpu,
} from "lucide-react";
import {
  GOOGLE_FONTS_CATALOG,
  FONT_CATEGORIES,
  FontCategory,
  FontDefinition,
  loadGoogleFont,
} from "@/lib/articles/font-catalog";

interface FontPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentArticleFont?: string | null;
  onSelectArticleFont: (fontName: string) => void;
  onInsertInlineFont: (fontName: string) => void;
}

export function FontPickerModal({
  isOpen,
  onClose,
  currentArticleFont,
  onSelectArticleFont,
  onInsertInlineFont,
}: FontPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FontCategory>("all");
  const [previewText, setPreviewText] = useState("NammaTech — Verified Digital Software 2026");

  // Calculate counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: GOOGLE_FONTS_CATALOG.length };
    GOOGLE_FONTS_CATALOG.forEach((f) => {
      counts[f.category] = (counts[f.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered fonts
  const filteredFonts = useMemo(() => {
    let result = GOOGLE_FONTS_CATALOG;
    if (selectedCategory !== "all") {
      result = result.filter((f) => f.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [selectedCategory, searchQuery]);

  // Pre-load visible fonts so preview works immediately
  useEffect(() => {
    if (!isOpen) return;
    // Load first 24 visible fonts immediately
    filteredFonts.slice(0, 30).forEach((f) => {
      loadGoogleFont(f.name);
    });
  }, [isOpen, filteredFonts]);

  if (!isOpen) return null;

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "serif":
        return <BookOpen className="w-3 h-3" />;
      case "mono":
        return <Code className="w-3 h-3" />;
      case "script":
        return <PenTool className="w-3 h-3" />;
      case "tech":
        return <Cpu className="w-3 h-3" />;
      default:
        return <Laptop className="w-3 h-3" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl border border-amber-500/30 bg-neutral-950 text-neutral-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-800 bg-gradient-to-r from-neutral-900/80 via-neutral-900/40 to-neutral-900/80 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Type className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Article Typography Studio</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {GOOGLE_FONTS_CATALOG.length}+ Fonts
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400">
              Choose from 200+ curated Google Fonts for the entire article or apply to specific highlighted text.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls: Search, Sample input & Category Filters */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-900/50 space-y-3 flex-shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by font name (e.g. Playfair, Inter, Orbitron)..."
                className="w-full pl-9 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>

            {/* Custom Sample Text Input */}
            <div className="sm:col-span-7 relative">
              <input
                type="text"
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Type custom text to preview typography in real-time..."
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {FONT_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    active
                      ? "bg-amber-500 text-neutral-950 shadow-md font-bold"
                      : "bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      active ? "bg-neutral-950/20 text-neutral-950" : "bg-neutral-900 text-neutral-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredFonts.map((font) => {
            const isCurrent =
              currentArticleFont?.toLowerCase() === font.name.toLowerCase();

            return (
              <div
                key={font.name}
                onMouseEnter={() => loadGoogleFont(font.name)}
                className={`group relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 ${
                  isCurrent
                    ? "border-amber-500 bg-amber-500/[0.07] ring-1 ring-amber-500/30 shadow-lg"
                    : "border-neutral-800/80 bg-neutral-900/40 hover:border-amber-500/40 hover:bg-neutral-900/80"
                }`}
              >
                {/* Top Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-sm text-neutral-200 group-hover:text-amber-400 transition-colors">
                      {font.name}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {font.popular && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Popular
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-400 px-2 py-0.5 rounded bg-neutral-800 flex items-center gap-1">
                        {getCategoryIcon(font.category)}
                        <span>{font.category}</span>
                      </span>
                    </div>
                  </div>

                  {/* Visual Typeface Sample Preview */}
                  <div className="py-3 px-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60 min-h-[72px] flex items-center overflow-hidden">
                    <p
                      style={{ fontFamily: `'${font.name}', ${font.fallback}` }}
                      className="text-lg sm:text-xl text-neutral-100 leading-snug truncate w-full"
                    >
                      {previewText || font.name}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-3 pt-2.5 border-t border-neutral-800/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      onInsertInlineFont(font.name);
                      onClose();
                    }}
                    className="flex-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                    title="Wrap selected text in [font:...] or insert sample"
                  >
                    Apply to Text
                  </button>

                  <button
                    onClick={() => {
                      onSelectArticleFont(font.name);
                      onClose();
                    }}
                    className={`flex-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                      isCurrent
                        ? "bg-emerald-500 text-neutral-950 cursor-default"
                        : "bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-sm"
                    }`}
                  >
                    {isCurrent ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Active Base</span>
                      </>
                    ) : (
                      <span>Set Article Font</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredFonts.length === 0 && (
            <div className="col-span-full py-16 text-center space-y-3">
              <Type className="w-10 h-10 text-neutral-600 mx-auto" />
              <p className="text-neutral-400 font-semibold text-sm">
                No fonts matching &ldquo;{searchQuery}&rdquo; in this category.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="text-xs text-amber-400 hover:underline"
              >
                Clear search and filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span>Current Article Base Font:</span>
            <span className="font-bold text-amber-400">
              {currentArticleFont || "Plus Jakarta Sans (Default)"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
