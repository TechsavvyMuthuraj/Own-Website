"use client";

import React, { useState, useEffect } from "react";
import { List, ChevronDown, ChevronUp, AlignLeft } from "lucide-react";
import type { TocItem } from "@/lib/articles/content-parser";

interface ArticleTocProps {
  items: TocItem[];
}

export function ArticleToc({ items }: ArticleTocProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0% -60% 0%",
        threshold: 0,
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
      setIsOpenMobile(false);
    }
  };

  return (
    <>
      {/* Mobile Collapsible TOC Strip */}
      <div className="lg:hidden mb-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setIsOpenMobile((prev) => !prev)}
          className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-[var(--foreground)]"
        >
          <div className="flex items-center gap-2">
            <List className="w-4 h-4 text-amber-500" />
            <span>Table of Contents ({items.length})</span>
          </div>
          {isOpenMobile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isOpenMobile && (
          <nav className="p-3 border-t border-[var(--border)] space-y-1 max-h-60 overflow-y-auto">
            {items.map((item) => {
              const isActive = activeId === item.id;
              const indent = item.level === 3 ? "pl-5" : item.level === 4 ? "pl-7" : "pl-2";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToHeading(item.id)}
                  className={`w-full text-left py-1.5 px-2 rounded-lg text-xs transition-colors flex items-center gap-2 ${indent} ${
                    isActive
                      ? "text-amber-500 font-bold bg-amber-500/10"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <span className={`w-1 h-1 rounded-full ${isActive ? "bg-amber-500" : "bg-neutral-600"}`} />
                  <span className="truncate">{item.text}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      {/* Desktop Sticky Table of Contents */}
      <div className="hidden lg:block sticky top-24 rounded-3xl border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-md p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)] text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
          <AlignLeft className="w-4 h-4 text-amber-500" />
          <span>Table of Contents</span>
        </div>

        <nav className="space-y-0.5 max-h-[calc(100vh-180px)] overflow-y-auto pr-1 text-xs">
          {items.map((item) => {
            const isActive = activeId === item.id;
            const indent = item.level === 3 ? "pl-6" : item.level === 4 ? "pl-8" : "pl-2";

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToHeading(item.id)}
                className={`w-full text-left py-1.5 px-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 group ${indent} ${
                  isActive
                    ? "text-amber-500 font-bold bg-amber-500/10 border-l-2 border-amber-500 shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]/60"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-transform ${
                    isActive ? "bg-amber-500 scale-125" : "bg-neutral-600 group-hover:bg-neutral-400"
                  }`}
                />
                <span className="truncate leading-snug">{item.text}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
