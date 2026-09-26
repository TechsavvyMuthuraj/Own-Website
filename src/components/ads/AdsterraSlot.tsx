"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAds } from "@/components/providers/ads-provider";
import { isAdsterraAllowedPath, DEFAULT_ADSTERRA_CONFIG, type AdsterraPlacements } from "@/config/adsterra";
import { AdsterraErrorBoundary } from "./AdsterraErrorBoundary";

interface AdsterraSlotProps {
  placement: keyof AdsterraPlacements;
  children: React.ReactNode;
  className?: string;
  minHeightClass?: string;
  showLabel?: boolean;
  label?: string;
}

/**
 * AdsterraSlot Container
 * 
 * Performance & UX Guarantees:
 * 1. Zero Cumulative Layout Shift (CLS) via calibrated min-heights.
 * 2. Mobile / Desktop granular device visibility matching admin preferences.
 * 3. Strict route security (silently dissolves on admin, auth, and API paths).
 * 4. Error Boundary protected.
 */
export function AdsterraSlot({
  placement,
  children,
  className = "",
  minHeightClass,
  showLabel = true,
  label = "Sponsored Recommendation",
}: AdsterraSlotProps) {
  const pathname = usePathname();
  const { adsEnabled, adsterraSettings } = useAds();

  // 1. Strict Path Safety Check
  if (!isAdsterraAllowedPath(pathname)) {
    return null;
  }

  // 2. Global Ads & Placement Killswitches
  const isGlobalActive = adsEnabled && (adsterraSettings?.enabled ?? DEFAULT_ADSTERRA_CONFIG.enabled);
  if (!isGlobalActive) {
    return null;
  }

  const isPlacementActive =
    adsterraSettings?.placements?.[placement] ??
    DEFAULT_ADSTERRA_CONFIG.placements[placement];

  if (!isPlacementActive) {
    return null;
  }

  // 3. Responsive Device Flags
  const isMobileActive =
    adsterraSettings?.placements?.mobile ?? DEFAULT_ADSTERRA_CONFIG.placements.mobile;
  const isDesktopActive =
    adsterraSettings?.placements?.desktop ?? DEFAULT_ADSTERRA_CONFIG.placements.desktop;

  if (!isMobileActive && !isDesktopActive) {
    return null;
  }

  // Class to handle device visibility
  let deviceVisibilityClass = "";
  if (!isMobileActive && isDesktopActive) {
    deviceVisibilityClass = "hidden md:flex";
  } else if (isMobileActive && !isDesktopActive) {
    deviceVisibilityClass = "flex md:hidden";
  }

  // Default min-height presets to eliminate CLS
  const defaultMinHeights: Record<string, string> = {
    homepage: "min-h-[110px] sm:min-h-[130px]",
    resourceList: "min-h-[180px] sm:min-h-[220px]",
    resourceDetails: "min-h-[100px] sm:min-h-[120px]",
    article: "min-h-[120px] sm:min-h-[140px]",
    desktop: "min-h-[90px]",
    mobile: "min-h-[90px]",
    smartlinks: "min-h-0",
  };

  const resolvedMinHeight = minHeightClass || defaultMinHeights[placement] || "min-h-[90px]";

  return (
    <AdsterraErrorBoundary slotName={`Slot-${String(placement)}`}>
      <aside
        aria-label="Advertising Placement"
        className={`w-full flex-col items-center justify-center rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-gradient-to-br from-neutral-50/70 via-white/40 to-neutral-50/70 dark:from-neutral-950/60 dark:via-neutral-900/40 dark:to-neutral-950/60 backdrop-blur-md p-4 sm:p-5 text-center transition-all overflow-hidden ${resolvedMinHeight} ${deviceVisibilityClass} ${className}`}
      >
        {showLabel && (
          <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-neutral-200/50 dark:border-neutral-800/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              {label}
            </span>
            <span className="text-[9px] font-medium text-amber-600/70 dark:text-amber-400/60 tracking-tight">
              Verified Partner
            </span>
          </div>
        )}
        <div className="w-full flex items-center justify-center">
          {children}
        </div>
      </aside>
    </AdsterraErrorBoundary>
  );
}
