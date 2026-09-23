"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useStyleOptional } from "@/components/theme/style-context";

export function ThemeToggle() {
  const { setTheme, resolvedTheme, theme: nextThemeValue } = useTheme();
  const style = useStyleOptional();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = style ? style.theme === "nordic-light" : resolvedTheme === "light" || nextThemeValue === "light";

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (style) {
      style.toggleDarkLight();
    } else {
      setTheme(isLight ? "dark" : "light");
    }
  };

  if (!mounted) {
    return (
      <div
        className="h-9 px-1 rounded-full border border-neutral-700/50 bg-neutral-900/50 flex items-center justify-between gap-1 opacity-50 select-none pointer-events-none"
        style={{ width: "68px" }}
      >
        <span className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-400">
          <Sun className="w-3.5 h-3.5" />
        </span>
        <span className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-400">
          <Moon className="w-3.5 h-3.5" />
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      id="theme-toggle-btn"
      onClick={handleToggle}
      role="switch"
      aria-checked={!isLight}
      aria-label={isLight ? "Light theme active. Click to switch to Dark theme." : "Dark theme active. Click to switch to Light theme."}
      title={isLight ? "Switch to Dark Theme" : "Switch to Light Theme"}
      className="group relative h-9 p-1 rounded-full border transition-all duration-300 select-none cursor-pointer flex items-center justify-between gap-1 shadow-sm hover:shadow-md active:scale-95 border-neutral-300/80 bg-slate-100/90 hover:bg-slate-200/80 dark:border-neutral-800 dark:bg-neutral-950/80 dark:hover:bg-neutral-900/90 backdrop-blur-xl"
      style={{ width: "68px" }}
    >
      {/* Sliding Active Pill Capsule */}
      <span
        aria-hidden="true"
        className={`absolute top-1 bottom-1 w-6 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isLight
            ? "left-1 bg-white text-amber-500 shadow-sm shadow-amber-500/20 border border-amber-200/50"
            : "left-[36px] bg-neutral-800 text-sky-400 shadow-sm shadow-sky-500/20 border border-neutral-700/60"
        }`}
      />

      {/* Sun Icon (Light) */}
      <span
        className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
          isLight
            ? "text-amber-500 rotate-0 scale-100"
            : "text-neutral-400 dark:text-neutral-500 rotate-45 scale-90 hover:text-neutral-300"
        }`}
      >
        <Sun className={`w-3.5 h-3.5 transition-transform duration-500 ${isLight ? "rotate-90 text-amber-500" : ""}`} />
      </span>

      {/* Moon Icon (Dark) */}
      <span
        className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
          !isLight
            ? "text-sky-400 rotate-0 scale-100"
            : "text-neutral-400 rotate-[-30deg] scale-90 hover:text-neutral-600"
        }`}
      >
        <Moon className={`w-3.5 h-3.5 transition-transform duration-500 ${!isLight ? "rotate-[-15deg] text-sky-400" : ""}`} />
      </span>
    </button>
  );
}
