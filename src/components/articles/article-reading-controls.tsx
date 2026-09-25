"use client";

import React, { useState, useEffect } from "react";
import {
  Type,
  Maximize2,
  Minimize2,
  ArrowUp,
  Clock,
  BookOpen,
} from "lucide-react";

interface ArticleReadingControlsProps {
  readingTimeText: string;
  fontSize: "default" | "medium" | "large";
  onFontSizeChange: (size: "default" | "medium" | "large") => void;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
}

export function ArticleReadingControls({
  readingTimeText,
  fontSize,
  onFontSizeChange,
  isFocusMode,
  onToggleFocusMode,
}: ArticleReadingControlsProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* 1. Global Reading Progress Indicator Bar (Pinned to Top) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)] transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. Reading Controls Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 p-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md text-xs shadow-sm">
        <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
          <BookOpen className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-medium">Reading Mode:</span>
          <span className="flex items-center gap-1 font-mono text-[11px] text-[var(--foreground)]">
            <Clock className="w-3 h-3 text-amber-500" />
            {readingTimeText}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Font Size Selector */}
          <div className="flex items-center bg-[var(--secondary)] rounded-xl p-0.5 border border-[var(--border)]">
            <button
              type="button"
              onClick={() => onFontSizeChange("default")}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                fontSize === "default"
                  ? "bg-amber-500 text-neutral-950 shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
              title="Standard Font Size"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => onFontSizeChange("medium")}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                fontSize === "medium"
                  ? "bg-amber-500 text-neutral-950 shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
              title="Medium Font Size"
            >
              A+
            </button>
            <button
              type="button"
              onClick={() => onFontSizeChange("large")}
              className={`px-2 py-1 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                fontSize === "large"
                  ? "bg-amber-500 text-neutral-950 shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
              title="Large Font Size"
            >
              A++
            </button>
          </div>

          {/* Focus Mode Toggle */}
          <button
            type="button"
            onClick={onToggleFocusMode}
            className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isFocusMode
                ? "bg-amber-500 border-amber-500 text-neutral-950 shadow-xs"
                : "border-[var(--border)] bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
            title={isFocusMode ? "Exit Focus Mode" : "Distraction-Free Focus Mode"}
          >
            {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFocusMode ? "Exit Focus" : "Focus"}</span>
          </button>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-amber-500 text-neutral-950 hover:bg-amber-400 shadow-xl shadow-amber-500/20 transition-all hover:scale-110 active:scale-95 cursor-pointer animate-in fade-in"
          title="Back to Top"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-4 h-4 stroke-[3]" />
        </button>
      )}
    </>
  );
}
