"use client";

import React, { useEffect, useRef, useState } from "react";
import type { AdPlacement } from "@/types/database";
import { useAds } from "@/components/providers/ads-provider";

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

interface AdSlotProps {
  ad?: AdPlacement | null;
  location: "HEADER" | "HOMEPAGE" | "IN_FEED" | "SIDEBAR" | "RESOURCE_PAGE" | "DOWNLOAD_PAGE" | "FOOTER";
  format?: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";
  slotId?: string;
  className?: string;
  showLabel?: boolean;
}

export function AdSlot({
  ad,
  location,
  format = "auto",
  slotId,
  className = "",
  showLabel = true,
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);
  const [isMounted, setIsMounted] = useState(false);
  const { adsEnabled } = useAds();

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-1960459798233871";
  const formattedClientId = clientId.startsWith("ca-") ? clientId : `ca-${clientId}`;

  // Track client mounting to prevent SSR hydration mismatch with external scripts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Push AdSense unit once mounted and visible
  useEffect(() => {
    if (!adsEnabled || !isMounted) return;
    if (pushedRef.current) return;

    if (typeof window !== "undefined" && adRef.current) {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushedRef.current = true;
      } catch (err) {
        // Suppress AdSense duplicate push or blocker errors
      }
    }
  }, [ad, adsEnabled, isMounted]);

  // 1. If ads are globally disabled from admin console, render absolutely nothing
  if (!adsEnabled) {
    return null;
  }

  // 2. If ad prop is explicitly null (e.g. getActiveAd returned null or placement inactive), render nothing
  if (ad === null) {
    return null;
  }

  // 3. If ad is explicitly provided and inactive, render nothing
  if (ad && !ad.is_active) {
    return null;
  }

  // Dimension presets to prevent Layout Shift (CLS)
  const minHeightClass = {
    HEADER: "min-h-[90px] sm:min-h-[100px]",
    HOMEPAGE: "min-h-[90px] sm:min-h-[120px]",
    IN_FEED: "min-h-[260px]",
    SIDEBAR: "min-h-[250px] sm:min-h-[300px]",
    RESOURCE_PAGE: "min-h-[100px] sm:min-h-[140px]",
    DOWNLOAD_PAGE: "min-h-[100px] sm:min-h-[120px]",
    FOOTER: "min-h-[90px]",
  }[location] || "min-h-[90px]";

  // Case 1: Custom HTML / Provider
  if (ad?.provider === "CUSTOM" && ad.ad_code) {
    return (
      <aside
        aria-label="Advertisement"
        suppressHydrationWarning
        className={`w-full flex flex-col items-center justify-center p-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 text-center overflow-hidden transition-all ${minHeightClass} ${className}`}
      >
        {showLabel && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5 opacity-60">
            Sponsored / Ad
          </span>
        )}
        {isMounted ? (
          <div
            className="w-full flex justify-center items-center"
            dangerouslySetInnerHTML={{ __html: ad.ad_code }}
          />
        ) : (
          <div className="w-full h-8" />
        )}
      </aside>
    );
  }

  // Case 2: Google AdSense (Standard or via placement)
  return (
    <aside
      aria-label="Advertisement"
      suppressHydrationWarning
      className={`w-full flex flex-col items-center justify-center p-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 text-center overflow-hidden transition-all ${minHeightClass} ${className}`}
    >
      {showLabel && (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5 opacity-60">
          Advertisement
        </span>
      )}

      <div
        className="w-full flex items-center justify-center overflow-hidden"
        suppressHydrationWarning
      >
        {isMounted ? (
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block", width: "100%" }}
            data-ad-client={formattedClientId}
            data-ad-slot={slotId || "auto"}
            data-ad-format={format}
            data-full-width-responsive="true"
            suppressHydrationWarning
          />
        ) : (
          <div className="w-full h-8" />
        )}
      </div>
    </aside>
  );
}
