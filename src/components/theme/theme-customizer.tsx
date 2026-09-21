"use client";

import React, { useState } from "react";
import {
  Palette,
  Type,
  Check,
  RotateCcw,
  X,
  Sparkles,
  Sun,
  Moon,
  SlidersHorizontal,
} from "lucide-react";
import {
  useStyle,
  THEME_OPTIONS,
  ACCENT_OPTIONS,
  FONT_OPTIONS,
  type ThemePreset,
  type AccentPreset,
  type FontPreset,
} from "./style-context";

export function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"themes" | "accents" | "fonts">("themes");
  const { theme, accent, fontStyle, setTheme, setAccent, setFontStyle, resetDefaults } = useStyle();

  return (
    <>
      {/* Floating Trigger Pill */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Theme & Font Customizer"
          className="group flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[var(--card)]/90 hover:bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] shadow-xl shadow-black/25 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-[var(--primary)] active:scale-95 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <Palette className="w-4 h-4 text-[var(--primary)] group-hover:rotate-45 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--primary)] animate-ping opacity-75" />
          </div>
          <span className="text-xs font-semibold tracking-wide">Themes & Fonts</span>
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        />
      )}

      {/* Customizer Drawer / Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[460px] max-h-[88vh] flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-2xl shadow-black/40 overflow-hidden animate-in zoom-in-95 fade-in duration-250 backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--secondary)]/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center border border-[var(--primary)]/20">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)] tracking-tight">
                  Display & Style Engine
                </h3>
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  Personalize themes, color mixing, and typography
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close customizer"
              className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 p-2 gap-1.5 bg-[var(--secondary)]/20 border-b border-[var(--border)] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("themes")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === "themes"
                  ? "bg-[var(--primary)] text-white shadow-sm font-bold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Themes (10)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("accents")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === "accents"
                  ? "bg-[var(--primary)] text-white shadow-sm font-bold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Accents (8)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("fonts")}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === "fonts"
                  ? "bg-[var(--primary)] text-white shadow-sm font-bold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Fonts (7)</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[55vh] scrollbar-thin">
            {/* Tab 1: Themes */}
            {activeTab === "themes" && (
              <div className="space-y-4">
                <div className="text-[11px] font-medium text-[var(--muted-foreground)]">
                  Carefully engineered contrast & mature atmospheric palettes:
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {THEME_OPTIONS.map((item) => {
                    const isSelected = theme === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTheme(item.id)}
                        className={`group relative flex flex-col p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/30 bg-[var(--secondary)]/60 shadow-md"
                            : "border-[var(--border)] hover:border-[var(--border)]/80 hover:bg-[var(--secondary)]/30"
                        }`}
                      >
                        {/* Swatch Preview Bar */}
                        <div
                          className="w-full h-8 rounded-xl flex items-center justify-between px-2 mb-2 border shadow-xs"
                          style={{
                            backgroundColor: item.bg,
                            borderColor: item.border,
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: item.card }}
                            />
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: item.accent }}
                            />
                          </div>
                          {item.category === "light" ? (
                            <Sun className="w-3 h-3 text-amber-500" />
                          ) : (
                            <Moon className="w-3 h-3 text-neutral-400" />
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[var(--foreground)] truncate">
                            {item.name}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-[var(--primary)] shrink-0 ml-1" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Accents */}
            {activeTab === "accents" && (
              <div className="space-y-4">
                <div className="text-[11px] font-medium text-[var(--muted-foreground)]">
                  Mix any theme with your personal primary accent color:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {ACCENT_OPTIONS.map((item) => {
                    const isSelected = accent === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAccent(item.id)}
                        className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "border-[var(--primary)] bg-[var(--secondary)]/70 ring-2 ring-[var(--primary)]/30 shadow-md"
                            : "border-[var(--border)] hover:bg-[var(--secondary)]/40"
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-full mb-2 flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                          style={{ backgroundColor: item.color }}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                        </div>
                        <span className="text-xs font-semibold text-[var(--foreground)] line-clamp-1">
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Fonts */}
            {activeTab === "fonts" && (
              <div className="space-y-3">
                <div className="text-[11px] font-medium text-[var(--muted-foreground)]">
                  Choose your reading typography across the entire site:
                </div>
                <div className="space-y-2">
                  {FONT_OPTIONS.map((item) => {
                    const isSelected = fontStyle === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFontStyle(item.id)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-[var(--primary)] bg-[var(--secondary)]/70 ring-2 ring-[var(--primary)]/30 shadow-sm"
                            : "border-[var(--border)] hover:bg-[var(--secondary)]/40"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[var(--foreground)]">
                              {item.name}
                            </span>
                            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-[var(--secondary)] text-[var(--muted-foreground)]">
                              {item.styleDesc}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)] mt-1 font-medium italic">
                            "{item.sample}"
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-xs shrink-0 ml-3">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-[var(--border)] bg-[var(--secondary)]/30 text-xs">
            <button
              type="button"
              onClick={resetDefaults}
              className="inline-flex items-center gap-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold transition-all shadow-md shadow-[var(--primary)]/20 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
