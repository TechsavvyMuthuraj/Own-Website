import React from "react";
import Image from "next/image";
import {
  Smartphone,
  Laptop,
  Terminal,
  Type,
  Palette,
  Film,
  Music,
  FileCode,
  Package,
  HardDrive,
  Globe,
  Sparkles,
  Layers,
  FileText,
  Boxes,
  Cpu,
} from "lucide-react";
import type { Resource } from "@/types/database";

interface ResourceVisualProps {
  resource: {
    title: string;
    resource_type?: string;
    platform?: string | null;
    category?: { name?: string; slug?: string } | null;
    thumbnail_url?: string | null;
    icon_url?: string | null;
  };
  variant?: "card" | "icon";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showFormatTag?: boolean;
}

interface VisualConfig {
  icon: React.ReactNode;
  formatTag: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
  borderColor: string;
  textColor: string;
  bgGlow: string;
  patternType: "dots" | "grid" | "radial";
}

/**
 * Derives visual styling tokens based on platform, category, resource type, or title.
 */
function getVisualConfig(
  platform?: string | null,
  categoryName?: string | null,
  resourceType?: string,
  title?: string
): VisualConfig {
  const p = (platform || "").toLowerCase();
  const c = (categoryName || "").toLowerCase();
  const t = (resourceType || "").toUpperCase();
  const titleLow = (title || "").toLowerCase();

  // 1. Android / APK / Mobile
  if (
    t === "APK" ||
    p.includes("android") ||
    p.includes("apk") ||
    c.includes("android") ||
    c.includes("apk") ||
    titleLow.includes("apk")
  ) {
    return {
      icon: <Smartphone className="w-full h-full" />,
      formatTag: "APK",
      gradientFrom: "#10B981",
      gradientTo: "#059669",
      accentColor: "#10B981",
      borderColor: "rgba(16, 185, 129, 0.35)",
      textColor: "#34D399",
      bgGlow: "rgba(16, 185, 129, 0.18)",
      patternType: "dots",
    };
  }

  // 2. Windows / PC Software
  if (
    p.includes("windows") ||
    p.includes("pc") ||
    p.includes("mac") ||
    p.includes("linux") ||
    c.includes("software") ||
    c.includes("pc") ||
    t === "SOFTWARE"
  ) {
    return {
      icon: <Laptop className="w-full h-full" />,
      formatTag: p.includes("mac") ? "DMG" : p.includes("linux") ? "APP" : "EXE",
      gradientFrom: "#3B82F6",
      gradientTo: "#1D4ED8",
      accentColor: "#3B82F6",
      borderColor: "rgba(59, 130, 246, 0.35)",
      textColor: "#60A5FA",
      bgGlow: "rgba(59, 130, 246, 0.18)",
      patternType: "grid",
    };
  }

  // 3. Developer Tools, Code, Scripts
  if (
    c.includes("developer") ||
    c.includes("code") ||
    c.includes("script") ||
    c.includes("tool") ||
    titleLow.includes("script") ||
    titleLow.includes("tool")
  ) {
    return {
      icon: <Terminal className="w-full h-full" />,
      formatTag: "DEV",
      gradientFrom: "#8B5CF6",
      gradientTo: "#6D28D9",
      accentColor: "#8B5CF6",
      borderColor: "rgba(139, 92, 246, 0.35)",
      textColor: "#A78BFA",
      bgGlow: "rgba(139, 92, 246, 0.18)",
      patternType: "radial",
    };
  }

  // 4. Fonts & Typography
  if (c.includes("font") || titleLow.includes("font") || titleLow.includes("typeface")) {
    return {
      icon: <Type className="w-full h-full" />,
      formatTag: "FONT",
      gradientFrom: "#F59E0B",
      gradientTo: "#D97706",
      accentColor: "#F59E0B",
      borderColor: "rgba(245, 158, 11, 0.35)",
      textColor: "#FBBF24",
      bgGlow: "rgba(245, 158, 11, 0.18)",
      patternType: "dots",
    };
  }

  // 5. Templates / Design / UI / Creative Assets
  if (
    c.includes("template") ||
    c.includes("design") ||
    c.includes("ui") ||
    titleLow.includes("template")
  ) {
    return {
      icon: <Palette className="w-full h-full" />,
      formatTag: "DESIGN",
      gradientFrom: "#FD1843",
      gradientTo: "#BE123C",
      accentColor: "#FD1843",
      borderColor: "rgba(253, 24, 67, 0.35)",
      textColor: "#FB7185",
      bgGlow: "rgba(253, 24, 67, 0.18)",
      patternType: "radial",
    };
  }

  // 6. Media / Music / Audio / Video
  if (t === "MEDIA" || c.includes("media") || c.includes("audio") || c.includes("movie")) {
    return {
      icon: <Film className="w-full h-full" />,
      formatTag: "MEDIA",
      gradientFrom: "#06B6D4",
      gradientTo: "#0891B2",
      accentColor: "#06B6D4",
      borderColor: "rgba(6, 182, 212, 0.35)",
      textColor: "#22D3EE",
      bgGlow: "rgba(6, 182, 212, 0.18)",
      patternType: "dots",
    };
  }

  // 7. External Website
  if (t === "WEBSITE" || t === "EXTERNAL_LINK" || p.includes("web") || p.includes("online")) {
    return {
      icon: <Globe className="w-full h-full" />,
      formatTag: "WEB",
      gradientFrom: "#0EA5E9",
      gradientTo: "#0284C7",
      accentColor: "#0EA5E9",
      borderColor: "rgba(14, 165, 233, 0.35)",
      textColor: "#38BDF8",
      bgGlow: "rgba(14, 165, 233, 0.18)",
      patternType: "grid",
    };
  }

  // 8. Default Digital Resource (True Pink Theme)
  return {
    icon: <Package className="w-full h-full" />,
    formatTag: "FILE",
    gradientFrom: "#FD1843",
    gradientTo: "#B30526",
    accentColor: "#FD1843",
    borderColor: "rgba(253, 24, 67, 0.35)",
    textColor: "#FDA4AF",
    bgGlow: "rgba(253, 24, 67, 0.18)",
    patternType: "radial",
  };
}

/**
 * Extracts a concise 1-3 letter monogram from the resource title.
 */
function getMonogram(title: string): string {
  if (!title) return "NT";
  const clean = title.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }
  if (words.length === 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
}

export function ResourceVisual({
  resource,
  variant = "card",
  size = "md",
  className = "",
  showFormatTag = true,
}: ResourceVisualProps) {
  const config = getVisualConfig(
    resource.platform,
    resource.category?.name,
    resource.resource_type,
    resource.title
  );
  const monogram = getMonogram(resource.title);

  // Icon sizing map
  const sizeClasses: Record<string, { box: string; icon: string; text: string }> = {
    xs: { box: "w-7 h-7 rounded-lg", icon: "w-3.5 h-3.5", text: "text-[9px]" },
    sm: { box: "w-9 h-9 rounded-xl", icon: "w-4 h-4", text: "text-[11px]" },
    md: { box: "w-12 h-12 rounded-2xl", icon: "w-6 h-6", text: "text-xs" },
    lg: { box: "w-16 h-16 rounded-2xl", icon: "w-8 h-8", text: "text-sm" },
    xl: { box: "w-20 h-20 sm:w-24 sm:h-24 rounded-3xl", icon: "w-10 h-10 sm:w-12 sm:h-12", text: "text-base sm:text-lg" },
  };

  // If variant === "icon", render a sleek app icon box
  if (variant === "icon") {
    const s = sizeClasses[size] || sizeClasses.md;

    return (
      <div
        className={`relative flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm transition-transform duration-300 ${s.box} ${className}`}
        style={{
          background: `linear-gradient(135deg, ${config.gradientFrom}1A 0%, ${config.gradientTo}2B 100%)`,
          border: `1px solid ${config.borderColor}`,
          boxShadow: `0 4px 12px ${config.bgGlow}`,
        }}
      >
        {/* Soft radial inner glow */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${config.accentColor} 0%, transparent 70%)`,
          }}
        />

        {resource.icon_url ? (
          <Image
            src={resource.icon_url}
            alt={resource.title}
            fill
            className="object-contain p-1.5"
          />
        ) : (
          <div
            className={`relative flex flex-col items-center justify-center font-bold tracking-tight text-white`}
          >
            <div className={`${s.icon}`} style={{ color: config.textColor }}>
              {config.icon}
            </div>
          </div>
        )}
      </div>
    );
  }

  // If user provided a thumbnail_url, show image
  if (resource.thumbnail_url) {
    return (
      <div className={`relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[var(--secondary)] ${className}`}>
        <Image
          src={resource.thumbnail_url}
          alt={resource.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    );
  }

  // DEFAULT APP & FILE ICON FORMAT (Modern App Store Showcase style)
  return (
    <div
      className={`relative aspect-[16/10] w-full overflow-hidden rounded-xl flex flex-col items-center justify-center select-none transition-all duration-300 group-hover:shadow-md ${className}`}
      style={{
        background: `radial-gradient(ellipse at 50% 30%, ${config.bgGlow} 0%, var(--card) 85%)`,
        border: `1px solid var(--border)`,
      }}
    >
      {/* Dynamic Background Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            config.patternType === "grid"
              ? `linear-gradient(to right, ${config.borderColor} 1px, transparent 1px), linear-gradient(to bottom, ${config.borderColor} 1px, transparent 1px)`
              : `radial-gradient(${config.accentColor} 1px, transparent 1px)`,
          backgroundSize: config.patternType === "grid" ? "20px 20px" : "14px 14px",
        }}
      />

      {/* Ambient center blur halo */}
      <div
        className="absolute w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-40 transition-transform duration-500 group-hover:scale-125"
        style={{ background: config.accentColor }}
      />

      {/* Centered Modern App Squircle Icon */}
      <div className="relative z-10 flex flex-col items-center">
        <div
          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-[22px] sm:rounded-[26px] p-0.5 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1"
          style={{
            background: `linear-gradient(135deg, ${config.gradientFrom} 0%, ${config.gradientTo} 100%)`,
            boxShadow: `0 10px 25px -5px ${config.bgGlow}, inset 0 1px 1px rgba(255,255,255,0.4)`,
          }}
        >
          {/* Inner card surface */}
          <div className="relative w-full h-full rounded-[20px] sm:rounded-[24px] bg-[#0B0C10]/80 backdrop-blur-md flex flex-col items-center justify-center p-3 overflow-hidden border border-white/15">
            {resource.icon_url ? (
              <Image
                src={resource.icon_url}
                alt={resource.title}
                fill
                className="object-contain p-2.5"
              />
            ) : (
              <>
                {/* Visual Icon */}
                <div
                  className="w-6 h-6 sm:w-7 sm:h-7 mb-1 transition-transform duration-300 group-hover:scale-110"
                  style={{ color: config.textColor }}
                >
                  {config.icon}
                </div>
                {/* Monogram tag */}
                <span className="font-extrabold text-[11px] sm:text-xs tracking-wider text-white/95 font-mono drop-shadow">
                  {monogram}
                </span>
              </>
            )}

            {/* Specular highlight diagonal glare */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-[20px]" />
          </div>
        </div>
      </div>

      {/* Floating Bottom Format Tag Chip */}
      {showFormatTag && (
        <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md border border-[var(--border)] bg-[var(--background)]/85 text-[var(--foreground)] shadow-xs">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: config.accentColor }}
          />
          <span className="tracking-wide">{config.formatTag}</span>
          {resource.platform && (
            <span className="opacity-70 font-normal border-l border-[var(--border)] pl-1.5">
              {resource.platform}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
