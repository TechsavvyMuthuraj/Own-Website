"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAds } from "@/components/providers/ads-provider";
import { isAdsterraAllowedPath, DEFAULT_ADSTERRA_CONFIG } from "@/config/adsterra";
import { AdsterraErrorBoundary } from "./AdsterraErrorBoundary";

export type SmartLinkVariant = "primary" | "secondary" | "subtle" | "badge" | "card";

interface AdsterraSmartLinkProps {
  children?: React.ReactNode;
  variant?: SmartLinkVariant;
  linkType?: 1 | 2 | 3;
  href?: string;
  className?: string;
  showBadge?: boolean;
  badgeLabel?: string;
  ariaLabel?: string;
}

/**
 * AdsterraSmartLink Component
 * 
 * Compliant Sponsored Link component:
 * - Always uses rel="nofollow sponsored noopener"
 * - Always opens in target="_blank"
 * - Visually labeled with "Sponsored" badge/indicator
 * - Never disguised as an authentic download button
 * - Automatically excluded on restricted routes (/admin, /auth, /login, /register, etc.)
 */
export function AdsterraSmartLink({
  children,
  variant = "primary",
  linkType = 1,
  href,
  className = "",
  showBadge = true,
  badgeLabel = "Sponsored",
  ariaLabel,
}: AdsterraSmartLinkProps) {
  const pathname = usePathname();
  const { adsEnabled, adsterraSettings } = useAds();

  // 1. Strict Route Exclusion Check
  if (!isAdsterraAllowedPath(pathname)) {
    return null;
  }

  // 2. Global & Placement Toggles
  const isGlobalActive = adsEnabled && (adsterraSettings?.enabled ?? DEFAULT_ADSTERRA_CONFIG.enabled);
  const isSmartlinksActive = adsterraSettings?.placements?.smartlinks ?? DEFAULT_ADSTERRA_CONFIG.placements.smartlinks;

  if (!isGlobalActive || !isSmartlinksActive) {
    return null;
  }

  // 3. Link-specific toggle
  const isLink1Active = adsterraSettings?.smartlink1Enabled ?? DEFAULT_ADSTERRA_CONFIG.smartlink1Enabled;
  const isLink2Active = adsterraSettings?.smartlink2Enabled ?? DEFAULT_ADSTERRA_CONFIG.smartlink2Enabled;
  const isLink3Active = adsterraSettings?.smartlink3Enabled ?? DEFAULT_ADSTERRA_CONFIG.smartlink3Enabled;

  if (linkType === 1 && !isLink1Active) return null;
  if (linkType === 2 && !isLink2Active) return null;
  if (linkType === 3 && !isLink3Active) return null;

  // 4. Resolve Target Smartlink URL (strictly official assets)
  let defaultUrl = adsterraSettings?.smartlink1 || DEFAULT_ADSTERRA_CONFIG.smartlink1;
  if (linkType === 2) {
    defaultUrl = adsterraSettings?.smartlink2 || DEFAULT_ADSTERRA_CONFIG.smartlink2;
  } else if (linkType === 3) {
    defaultUrl = adsterraSettings?.smartlink3 || DEFAULT_ADSTERRA_CONFIG.smartlink3;
  }

  const destinationUrl = href || defaultUrl;

  // Styling Variants
  const variantStyles: Record<SmartLinkVariant, string> = {
    primary:
      "inline-flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800/90 dark:bg-neutral-950 dark:hover:bg-neutral-900 text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-500/50 shadow-sm transition-all group font-semibold text-xs sm:text-sm",
    secondary:
      "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700/60 text-xs font-medium transition-all group",
    subtle:
      "inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-amber-500 dark:text-neutral-400 dark:hover:text-amber-400 underline decoration-neutral-400/50 hover:decoration-amber-400 underline-offset-4 transition-colors font-medium",
    badge:
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all",
    card:
      "flex flex-col p-4 rounded-2xl bg-gradient-to-br from-amber-500/5 via-neutral-900/50 to-neutral-900/80 dark:from-amber-500/10 dark:via-neutral-950 dark:to-neutral-900/90 border border-amber-500/20 hover:border-amber-500/40 text-neutral-900 dark:text-neutral-100 transition-all shadow-sm group",
  };

  return (
    <AdsterraErrorBoundary slotName={`SmartLink-${linkType}`}>
      <a
        href={destinationUrl}
        target="_blank"
        rel="nofollow sponsored noopener"
        aria-label={ariaLabel || (typeof children === "string" ? children : "Sponsored Partner Content")}
        className={`${variantStyles[variant]} ${className}`}
      >
        <span className="flex items-center gap-2">
          {variant === "card" && (
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-500">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          )}
          <span>{children || "Explore Partner Content"}</span>
        </span>

        {showBadge && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/30">
            <span>{badgeLabel}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-80" />
          </span>
        )}

        {!showBadge && variant !== "subtle" && (
          <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-amber-400" />
        )}
      </a>
    </AdsterraErrorBoundary>
  );
}
