"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { Sparkles, ShieldCheck } from "lucide-react";
import { AdsterraSlot } from "./AdsterraSlot";
import { AdsterraSmartLink } from "./AdsterraSmartLink";
import { useAds } from "@/components/providers/ads-provider";
import { ADSTERRA_ASSETS, type AdsterraPlacements } from "@/config/adsterra";
import { AdsterraErrorBoundary } from "./AdsterraErrorBoundary";

interface AdsterraNativeProps {
  placement?: keyof AdsterraPlacements;
  format?: "widget" | "card" | "auto";
  linkType?: 1 | 2 | 3;
  title?: string;
  description?: string;
  categoryTag?: string;
  className?: string;
}

/**
 * AdsterraNative Component
 * 
 * Supports both:
 * 1. Official Adsterra Native Container Widget (`container-d10157a3b2e5ea2ae26efcd419ed2db1`)
 * 2. In-feed High-CTR Native Partner Card
 */
export function AdsterraNative({
  placement = "resourceList",
  format = "auto",
  linkType = 1,
  title,
  description,
  categoryTag = "Partner Spotlight",
  className = "",
}: AdsterraNativeProps) {
  const { adsterraSettings } = useAds();
  const [nativeScriptLoaded, setNativeScriptLoaded] = useState(false);

  const nativeActive = adsterraSettings?.nativeBannerEnabled !== false;
  const nativeData = ADSTERRA_ASSETS.nativeBanner;

  // Render Official Native Container Widget
  if (nativeActive && (format === "widget" || format === "auto")) {
    return (
      <AdsterraErrorBoundary slotName="AdsterraNativeWidget">
        <div className={`w-full flex flex-col items-center justify-center p-3 sm:p-4 rounded-3xl border border-dashed border-amber-500/30 bg-neutral-50/50 dark:bg-neutral-900/30 backdrop-blur-xs transition-all ${className}`}>
          <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-neutral-200/40 dark:border-neutral-800/40">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Sponsored Recommendations
            </span>
            <span className="text-[9px] font-semibold text-amber-500 uppercase tracking-wider">
              Adsterra Native
            </span>
          </div>

          <div
            id={nativeData.containerId}
            className="w-full flex justify-center items-center overflow-hidden min-h-[140px]"
          />

          <Script
            id={`adsterra-native-script-${nativeData.containerId}`}
            async
            strategy="lazyOnload"
            src={nativeData.scriptUrl}
            onLoad={() => setNativeScriptLoaded(true)}
            onError={(e) => {
              if (process.env.NODE_ENV !== "production") {
                console.warn("[Adsterra] Native widget script blocked or unavailable:", e);
              }
            }}
          />
        </div>
      </AdsterraErrorBoundary>
    );
  }

  // Fallback: Hand-crafted in-feed recommendation card
  const nativeTitle =
    title ||
    (linkType === 1
      ? "High-Speed Cloud & Web Optimization Toolkit"
      : linkType === 2
      ? "Featured Developer Utilities & Platform Tools"
      : "Verified Open-Source Developer Deals");

  const nativeDescription =
    description ||
    (linkType === 1
      ? "Discover recommended online utilities and cloud productivity applications tested for developers and power users."
      : "Boost your workflow with cutting-edge tools and curated online resources from our verified partners.");

  return (
    <div
      className={`group relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl border border-dashed border-amber-500/40 hover:border-amber-500/70 bg-gradient-to-br from-amber-500/5 via-neutral-100/50 to-amber-500/10 dark:from-amber-500/10 dark:via-neutral-900/60 dark:to-neutral-950/80 backdrop-blur-md shadow-sm hover:shadow-md transition-all ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {categoryTag}
          </span>
          <span className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            Sponsored
          </span>
        </div>

        <h3 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
          {nativeTitle}
        </h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-3 leading-relaxed">
          {nativeDescription}
        </p>
      </div>

      <div className="pt-5 mt-4 border-t border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between">
        <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Partner Network
        </span>

        <AdsterraSmartLink
          linkType={linkType}
          variant="secondary"
          showBadge={false}
          className="!py-1 !px-3 font-semibold text-xs"
        >
          <span>Explore ↗</span>
        </AdsterraSmartLink>
      </div>
    </div>
  );
}
