"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Palette, Sparkles } from "lucide-react";
import { useStyleOptional, THEME_OPTIONS } from "@/components/theme/style-context";

export function ThemeToggle() {
  const { setTheme, resolvedTheme, theme: nextThemeValue } = useTheme();
  const style = useStyleOptional();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        id="theme-toggle-btn"
        aria-label="Theme toggle"
        className="w-9 h-9 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] opacity-50 cursor-default"
      >
        <Palette className="w-4 h-4" />
      </button>
    );
  }

  const currentOption = style?.currentThemeOption || THEME_OPTIONS[0];
  const currentIndex = THEME_OPTIONS.findIndex((t) => t.id === currentOption.id);
  const isLight = currentOption.category === "light";

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (style) {
      style.cycleNextTheme();
    } else {
      const isDark = resolvedTheme ? resolvedTheme === "dark" : nextThemeValue === "dark";
      setTheme(isDark ? "light" : "dark");
    }
  };

  return (
    <button
      type="button"
      id="theme-toggle-btn"
      onClick={handleToggle}
      aria-label={`Theme: ${currentOption.name}. Click to cycle to next theme.`}
      title={`Theme: ${currentOption.name} (${currentIndex + 1}/10) — Click to cycle to next theme`}
      className="group relative w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] flex items-center justify-center text-[var(--foreground)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] shadow-xs cursor-pointer active:scale-90"
    >
      {/* Dynamic Theme Icon */}
      {isLight ? (
        <Sun className="w-4 h-4 text-amber-500 group-hover:rotate-90 group-hover:scale-110 transition-transform duration-300" />
      ) : currentOption.id === "amoled" ? (
        <Moon className="w-4 h-4 text-white group-hover:-rotate-45 group-hover:scale-110 transition-transform duration-300" />
      ) : (
        <Palette
          className="w-4 h-4 group-hover:rotate-45 group-hover:scale-110 transition-transform duration-300"
          style={{ color: currentOption.accent }}
        />
      )}

      {/* Mini Color Swatch Pip */}
      <span
        className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full ring-1 ring-black/40 group-hover:scale-125 transition-transform"
        style={{ backgroundColor: currentOption.accent }}
      />

      {/* Theme Index Step Badge (1..10) */}
      <span
        className="absolute -top-1 -right-1 px-1 min-w-[15px] h-[15px] rounded-full text-[9px] font-black bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center shadow-xs select-none pointer-events-none"
      >
        {currentIndex + 1}
      </span>
    </button>
  );
}

