"use client";

import React, { useEffect, useRef, useState } from "react";
import type { AdPlacement } from "@/types/database";
import { useAds } from "@/components/providers/ads-provider";
import { AdsterraBanner, type BannerFormat } from "./AdsterraBanner";
import type { AdsterraPlacements } from "@/config/adsterra";

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Push AdSense unit if Google AdSense is explicitly chosen and mounted
  useEffect(() => {
    if (!adsEnabled || !isMounted) return;
    if (ad?.provider !== "ADSENSE" && ad?.provider !== "GOOGLE_ADSENSE") return;
    if (pushedRef.current) return;

    if (typeof window !== "undefined" && adRef.current) {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushedRef.current = true;
      } catch {
        // Suppress AdSense duplicate push or blocker errors
      }
    }
  }, [ad, adsEnabled, isMounted]);

  // 1. If ads are globally disabled or ad placement is null/inactive, render nothing
  if (!adsEnabled || !ad || !ad.is_active) {
    return null;
  }

  // Map location to Adsterra Placement and Format
  const placementMap: Record<string, keyof AdsterraPlacements> = {
    HEADER: "homepage",
    HOMEPAGE: "homepage",
    IN_FEED: "resourceList",
    SIDEBAR: "resourceDetails",
    RESOURCE_PAGE: "resourceDetails",
    DOWNLOAD_PAGE: "resourceDetails",
    FOOTER: "homepage",
  };

  const adsterraPlacement = placementMap[location] || "homepage";

  const adsterraFormat: BannerFormat =
    format === "rectangle" || location === "SIDEBAR" || location === "IN_FEED"
      ? "rectangle"
      : "responsive";

  const linkType = location === "DOWNLOAD_PAGE" ? 3 : location === "SIDEBAR" || location === "FOOTER" ? 2 : 1;

  // Case 1: Custom HTML / Raw Provider Code
  if (ad?.provider === "CUSTOM" && ad.ad_code) {
    return (
      <aside
        aria-label="Advertisement"
        suppressHydrationWarning
        className={`w-full flex flex-col items-center justify-center p-3 rounded-3xl border border-[var(--border)] bg-[var(--card)]/60 text-center overflow-hidden transition-all shadow-xs ${className}`}
      >
        {showLabel && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5 opacity-60">
            Sponsored / Partner
          </span>
        )}
        {isMounted ? (
          <div
            className="w-full flex justify-center items-center overflow-hidden"
            dangerouslySetInnerHTML={{ __html: ad.ad_code }}
          />
        ) : (
          <div className="w-full h-8" />
        )}
      </aside>
    );
  }

  // Case 2: Adsterra Provider (or default when provider is ADSTERRA)
  if (ad?.provider === "ADSTERRA" || !ad?.provider) {
    return (
      <div className={`w-full ${className}`}>
        <AdsterraBanner
          placement={adsterraPlacement}
          format={adsterraFormat}
          linkType={linkType}
        />
      </div>
    );
  }

  // Case 3: Google AdSense (Standard or via placement)
  // If in local dev or AdSense not active, gracefully render Adsterra banner to avoid empty white blank space
  const isLocalDev =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  if (isLocalDev && (!ad.ad_code || !ad.ad_code.includes("<iframe"))) {
    return (
      <div className={`w-full ${className}`}>
        <AdsterraBanner
          placement={adsterraPlacement}
          format={adsterraFormat}
          linkType={linkType}
        />
      </div>
    );
  }

  return (
    <aside
      aria-label="Advertisement"
      suppressHydrationWarning
      className={`w-full flex flex-col items-center justify-center p-3 rounded-3xl border border-[var(--border)] bg-[var(--card)]/60 text-center overflow-hidden transition-all shadow-xs ${className}`}
    >
      {showLabel && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5 opacity-60">
          Advertisement
        </span>
      )}

      <div
        className="w-full flex items-center justify-center overflow-hidden min-h-[90px]"
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
