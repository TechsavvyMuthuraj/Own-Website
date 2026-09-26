"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

interface ArticleReadingControlsProps {
  readingTimeText?: string;
  fontSize?: "default" | "medium" | "large";
  onFontSizeChange?: (size: "default" | "medium" | "large") => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export function ArticleReadingControls({}: ArticleReadingControlsProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    let ticking = false;
    let lastProgress = 0;
    let lastShowTop = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const currentProgress = Math.round((window.scrollY / totalHeight) * 100);
            if (currentProgress !== lastProgress) {
              lastProgress = currentProgress;
              setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
            }
          }
          const nowShowTop = window.scrollY > 400;
          if (nowShowTop !== lastShowTop) {
            lastShowTop = nowShowTop;
            setShowBackToTop(nowShowTop);
          }
          ticking = false;
        });
        ticking = true;
      }
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
