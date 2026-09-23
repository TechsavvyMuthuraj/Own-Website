"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";

export type ThemePreset =
  | "midnight"
  | "cyber-amber"
  | "emerald"
  | "sapphire"
  | "amethyst"
  | "crimson"
  | "titanium"
  | "amoled"
  | "nordic-light"
  | "warm-ivory";

export type AccentPreset =
  | "amber"
  | "blue"
  | "emerald"
  | "cyan"
  | "violet"
  | "rose"
  | "orange"
  | "fuchsia";

export type FontPreset =
  | "jakarta"
  | "inter"
  | "grotesk"
  | "dmsans"
  | "outfit"
  | "geist"
  | "mono";

export interface ThemeOption {
  id: ThemePreset;
  name: string;
  category: "dark" | "light";
  bg: string;
  card: string;
  accent: string;
  accentId: AccentPreset;
  border: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "midnight",
    name: "Dark Theme",
    category: "dark",
    bg: "#090a0f",
    card: "#11131c",
    accent: "#38bdf8",
    accentId: "cyan",
    border: "#1f2230",
  },
  {
    id: "nordic-light",
    name: "Light Theme",
    category: "light",
    bg: "#f8fafc",
    card: "#ffffff",
    accent: "#0284c7",
    accentId: "cyan",
    border: "#e2e8f0",
  },
];

export interface AccentOption {
  id: AccentPreset;
  name: string;
  color: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: "amber", name: "Amber Gold", color: "#f59e0b" },
  { id: "blue", name: "Sapphire Blue", color: "#3b82f6" },
  { id: "emerald", name: "Emerald Mint", color: "#10b981" },
  { id: "cyan", name: "Cyan Horizon", color: "#06b6d4" },
  { id: "violet", name: "Electric Violet", color: "#8b5cf6" },
  { id: "rose", name: "Ruby Rose", color: "#f43f5e" },
  { id: "orange", name: "Sunset Orange", color: "#f97316" },
  { id: "fuchsia", name: "Neon Fuchsia", color: "#d946ef" },
];

export interface FontOption {
  id: FontPreset;
  name: string;
  styleDesc: string;
  sample: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { id: "jakarta", name: "Plus Jakarta", styleDesc: "Modern, Decent & Readable", sample: "NammaTech Core v3.0" },
  { id: "inter", name: "Inter Display", styleDesc: "Clean, Ultra-Neutral UI", sample: "Verified Open-Source" },
  { id: "grotesk", name: "Space Grotesk", styleDesc: "Tech & Bold Geometric", sample: "4K UHD Cinema Hub" },
  { id: "dmsans", name: "DM Sans", styleDesc: "Gentle Contemporary", sample: "Secure Digital Downloads" },
  { id: "outfit", name: "Outfit Brand", styleDesc: "Luxury Rounded Curves", sample: "Everything in One Place" },
  { id: "geist", name: "Geist Precision", styleDesc: "High-Density Engineer", sample: "SHA-256 Verified" },
  { id: "mono", name: "Developer Code", styleDesc: "Terminal Monospace", sample: "git clone nammatech" },
];

interface StyleContextValue {
  theme: ThemePreset;
  accent: AccentPreset;
  fontStyle: FontPreset;
  isDark: boolean;
  currentThemeOption: ThemeOption;
  setTheme: (theme: ThemePreset) => void;
  setAccent: (accent: AccentPreset) => void;
  setFontStyle: (font: FontPreset) => void;
  cycleNextTheme: () => ThemeOption;
  toggleDarkLight: () => void;
  resetDefaults: () => void;
}

const StyleContext = createContext<StyleContextValue | undefined>(undefined);

const STORAGE_KEY = "nammatech_style_prefs_v1";

function applyDomTheme(themeId: ThemePreset, accentId: AccentPreset, fontId: FontPreset) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const isLight = (themeId as string) === "nordic-light" || (themeId as string) === "light";
  const normalizedTheme: ThemePreset = isLight ? "nordic-light" : "midnight";

  root.setAttribute("data-theme", normalizedTheme);
  root.setAttribute("data-accent", accentId);
  root.setAttribute("data-font", fontId);

  if (isLight) {
    root.classList.remove("dark");
    root.classList.add("light");
    root.style.colorScheme = "light";
  } else {
    root.classList.remove("light");
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  }
}

export function StyleProvider({ children }: { children: React.ReactNode }) {
  const { setTheme: setNextTheme } = useTheme();
  const [theme, setThemeState] = useState<ThemePreset>("midnight");
  const [lastDarkTheme, setLastDarkTheme] = useState<ThemePreset>("midnight");
  const [accent, setAccentState] = useState<AccentPreset>("amber");
  const [fontStyle, setFontStyleState] = useState<FontPreset>("jakarta");
  const [mounted, setMounted] = useState(false);

  // Mutable ref so rapid sequential clicks ALWAYS read the freshest active theme with 0ms lag
  const currentThemeRef = React.useRef<ThemePreset>("midnight");

  // Load preferences on initial mount, strictly normalizing to Dark (midnight) or Light (nordic-light)
  useEffect(() => {
    let initialTheme: ThemePreset = "midnight";
    let initialAccent: AccentPreset = "amber";
    let initialFont: FontPreset = "jakarta";

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.theme === "nordic-light" || parsed.theme === "light") {
          initialTheme = "nordic-light";
        } else {
          initialTheme = "midnight";
        }
        if (parsed.accent) initialAccent = parsed.accent;
        if (parsed.fontStyle) initialFont = parsed.fontStyle;
      } else {
        const storedTheme = localStorage.getItem("theme");
        initialTheme = storedTheme === "light" ? "nordic-light" : "midnight";
      }
    } catch {
      // Ignore
    }

    currentThemeRef.current = initialTheme;
    setThemeState(initialTheme);
    setLastDarkTheme("midnight");
    setAccentState(initialAccent);
    setFontStyleState(initialFont);
    setMounted(true);

    // Apply immediately upon client hydration
    applyDomTheme(initialTheme, initialAccent, initialFont);

    const isLight = initialTheme === "nordic-light";
    setNextTheme(isLight ? "light" : "dark");
  }, [setNextTheme]);

  // Compute if currently dark mode
  const isDark = theme !== "nordic-light" && theme !== "warm-ivory";

  // Current active theme option metadata
  const currentThemeOption =
    THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  const setTheme = (newTheme: ThemePreset) => {
    currentThemeRef.current = newTheme;
    const option = THEME_OPTIONS.find((t) => t.id === newTheme) || THEME_OPTIONS[0];
    const newAccent = option.accentId;

    // 0ms synchronous DOM update
    applyDomTheme(newTheme, newAccent, fontStyle);

    const isNewLight = newTheme === "nordic-light" || newTheme === "warm-ivory";
    const nextDark = !isNewLight ? newTheme : lastDarkTheme;
    if (!isNewLight) {
      setLastDarkTheme(newTheme);
    }
    setThemeState(newTheme);
    setAccentState(newAccent);

    // Explicitly persist on user action
    setNextTheme(isNewLight ? "light" : "dark");
    try {
      localStorage.setItem("theme", isNewLight ? "light" : "dark");
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          theme: newTheme,
          accent: newAccent,
          fontStyle,
          lastDarkTheme: nextDark,
        })
      );
    } catch {}
  };

  // Cycle through all 10 themes one-by-one with zero dropped clicks and instant visual response
  const cycleNextTheme = (): ThemeOption => {
    const curTheme = currentThemeRef.current;
    const currentIndex = THEME_OPTIONS.findIndex((t) => t.id === curTheme);
    const nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
    const nextTheme = THEME_OPTIONS[nextIndex];

    // 1. Instantly advance mutable ref so rapid successive clicks never stall or repeat
    currentThemeRef.current = nextTheme.id;

    // 2. Instantly update DOM attributes directly for 0ms visual latency
    applyDomTheme(nextTheme.id, nextTheme.accentId, fontStyle);

    // 3. Update React state
    const isNewLight = nextTheme.category === "light";
    const nextDark = !isNewLight ? nextTheme.id : lastDarkTheme;
    if (!isNewLight) {
      setLastDarkTheme(nextTheme.id);
    }
    setThemeState(nextTheme.id);
    setAccentState(nextTheme.accentId);

    // 4. Update next-themes and local storage
    setNextTheme(isNewLight ? "light" : "dark");
    try {
      localStorage.setItem("theme", isNewLight ? "light" : "dark");
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          theme: nextTheme.id,
          accent: nextTheme.accentId,
          fontStyle,
          lastDarkTheme: nextDark,
        })
      );
    } catch {}

    return nextTheme;
  };

  const toggleDarkLight = () => {
    if (isDark) {
      setLastDarkTheme(theme);
      setTheme("nordic-light");
    } else {
      setTheme(lastDarkTheme || "midnight");
    }
  };

  const setAccent = (newAccent: AccentPreset) => {
    setAccentState(newAccent);
    applyDomTheme(currentThemeRef.current, newAccent, fontStyle);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          theme: currentThemeRef.current,
          accent: newAccent,
          fontStyle,
          lastDarkTheme,
        })
      );
    } catch {}
  };

  const setFontStyle = (newFont: FontPreset) => {
    setFontStyleState(newFont);
    applyDomTheme(currentThemeRef.current, accent, newFont);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          theme: currentThemeRef.current,
          accent,
          fontStyle: newFont,
          lastDarkTheme,
        })
      );
    } catch {}
  };

  const resetDefaults = () => {
    currentThemeRef.current = "midnight";
    setThemeState("midnight");
    setLastDarkTheme("midnight");
    setAccentState("amber");
    setFontStyleState("jakarta");
    applyDomTheme("midnight", "amber", "jakarta");
    setNextTheme("dark");
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem("theme", "dark");
    } catch {}
  };

  return (
    <StyleContext.Provider
      value={{
        theme,
        accent,
        fontStyle,
        isDark,
        currentThemeOption,
        setTheme,
        setAccent,
        setFontStyle,
        cycleNextTheme,
        toggleDarkLight,
        resetDefaults,
      }}
    >
      {children}
    </StyleContext.Provider>
  );
}

export function useStyle() {
  const context = useContext(StyleContext);
  if (!context) {
    throw new Error("useStyle must be used within a StyleProvider");
  }
  return context;
}

export function useStyleOptional() {
  return useContext(StyleContext);
}
