"use client";

import React from "react";
import { Sparkles, ShieldCheck } from "lucide-react";
import { AdsterraSlot } from "./AdsterraSlot";
import { AdsterraSmartLink } from "./AdsterraSmartLink";
import { useAds } from "@/components/providers/ads-provider";
import { ADSTERRA_ASSETS, type AdsterraPlacements } from "@/config/adsterra";

export type BannerFormat =
  | "horizontal"
  | "rectangle"
  | "responsive"
  | "728x90"
  | "300x250"
  | "320x50"
  | "468x60"
  | "160x300"
  | "160x600";

interface AdsterraBannerProps {
  placement: keyof AdsterraPlacements;
  format?: BannerFormat;
  linkType?: 1 | 2 | 3;
  title?: string;
  description?: string;
  ctaText?: string;
  className?: string;
}

/**
 * Adsterra Isolated Iframe Generator
 * Generates an isolated DOM document context so atOptions does not pollute window or conflict.
 */
function createAdsterraIframeDoc(key: string, width: number, height: number): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin:0; padding:0; overflow:hidden; background:transparent; display:flex; justify-content:center; align-items:center; }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '${key}',
      'format' : 'iframe',
      'height' : ${height},
      'width' : ${width},
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://demolishwrestconclusions.com/${key}/invoke.js"></script>
</body>
</html>`;
}

/**
 * AdsterraBanner Component
 * 
 * Supports both Official Adsterra Iframe Banner Zones (728x90, 300x250, 320x50, 468x60, 160x300, 160x600)
 * and High-CTR Verified Smartlink Banners.
 */
export function AdsterraBanner({
  placement,
  format = "horizontal",
  linkType = 1,
  title,
  description,
  ctaText = "Discover Offer",
  className = "",
}: AdsterraBannerProps) {
  const { adsterraSettings } = useAds();

  // 1. If admin provided a custom raw HTML snippet, render it
  const customCode = adsterraSettings?.customBannerCode;
  if (customCode && customCode.trim().length > 0) {
    return (
      <AdsterraSlot placement={placement} className={className} label="Sponsored Display">
        <div
          className="w-full flex items-center justify-center overflow-hidden"
          dangerouslySetInnerHTML={{ __html: customCode }}
        />
      </AdsterraSlot>
    );
  }

  const zonesActive = adsterraSettings?.bannerZonesEnabled !== false;

  // 2. Render Official Adsterra Iframe Banner Zones
  if (zonesActive) {
    const zones = ADSTERRA_ASSETS.bannerZones;

    // A. 300x250 Medium Rectangle (Sidebar & In-Feed)
    if (format === "rectangle" || format === "300x250") {
      const z = zones.rectangle_300x250;
      return (
        <AdsterraSlot placement={placement} className={`max-w-[340px] mx-auto ${className}`} label="Sponsored Partner">
          <div className="w-full flex justify-center items-center overflow-hidden min-h-[250px]">
            <iframe
              title={`Adsterra 300x250 Ad - ${placement}`}
              srcDoc={createAdsterraIframeDoc(z.key, z.width, z.height)}
              width={z.width}
              height={z.height}
              className="border-0 overflow-hidden max-w-full"
              scrolling="no"
              loading="lazy"
            />
          </div>
        </AdsterraSlot>
      );
    }

    // B. 160x600 Skyscraper
    if (format === "160x600") {
      const z = zones.skyscraper_160x600;
      return (
        <AdsterraSlot placement={placement} className={`w-[180px] mx-auto ${className}`} label="Sponsored">
          <div className="w-full flex justify-center items-center overflow-hidden min-h-[600px]">
            <iframe
              title={`Adsterra 160x600 Ad - ${placement}`}
              srcDoc={createAdsterraIframeDoc(z.key, z.width, z.height)}
              width={z.width}
              height={z.height}
              className="border-0 overflow-hidden"
              scrolling="no"
              loading="lazy"
            />
          </div>
        </AdsterraSlot>
      );
    }

    // C. 160x300 Vertical Mini
    if (format === "160x300") {
      const z = zones.vertical_160x300;
      return (
        <AdsterraSlot placement={placement} className={`w-[180px] mx-auto ${className}`} label="Sponsored">
          <div className="w-full flex justify-center items-center overflow-hidden min-h-[300px]">
            <iframe
              title={`Adsterra 160x300 Ad - ${placement}`}
              srcDoc={createAdsterraIframeDoc(z.key, z.width, z.height)}
              width={z.width}
              height={z.height}
              className="border-0 overflow-hidden"
              scrolling="no"
              loading="lazy"
            />
          </div>
        </AdsterraSlot>
      );
    }

    // D. 468x60 Banner
    if (format === "468x60") {
      const z = zones.banner_468x60;
      return (
        <AdsterraSlot placement={placement} className={className} label="Sponsored Spotlight">
          <div className="w-full flex justify-center items-center overflow-hidden min-h-[60px]">
            <iframe
              title={`Adsterra 468x60 Ad - ${placement}`}
              srcDoc={createAdsterraIframeDoc(z.key, z.width, z.height)}
              width={z.width}
              height={z.height}
              className="border-0 overflow-hidden max-w-full"
              scrolling="no"
              loading="lazy"
            />
          </div>
        </AdsterraSlot>
      );
    }

    // E. 320x50 Mobile Specific Banner
    if (format === "320x50") {
      const z = zones.mobile_320x50;
      return (
        <AdsterraSlot placement={placement} className={className} label="Sponsored Mobile">
          <div className="w-full flex justify-center items-center overflow-hidden min-h-[50px]">
            <iframe
              title={`Adsterra 320x50 Ad - ${placement}`}
              srcDoc={createAdsterraIframeDoc(z.key, z.width, z.height)}
              width={z.width}
              height={z.height}
              className="border-0 overflow-hidden max-w-full"
              scrolling="no"
              loading="lazy"
            />
          </div>
        </AdsterraSlot>
      );
    }

    // F. Responsive / Horizontal Layout
    // On Desktop: Renders 728x90 Leaderboard
    // On Mobile: Renders 320x50 Mobile Banner (Zero horizontal overflow)
    const zDesktop = zones.leaderboard_728x90;
    const zMobile = zones.mobile_320x50;

    return (
      <AdsterraSlot placement={placement} className={className} label="Sponsored Spotlight">
        {/* Desktop 728x90 Display */}
        <div className="hidden md:flex w-full justify-center items-center overflow-hidden min-h-[90px]">
          <iframe
            title={`Adsterra 728x90 Leaderboard - ${placement}`}
            srcDoc={createAdsterraIframeDoc(zDesktop.key, zDesktop.width, zDesktop.height)}
            width={zDesktop.width}
            height={zDesktop.height}
            className="border-0 overflow-hidden max-w-full"
            scrolling="no"
            loading="lazy"
          />
        </div>

        {/* Mobile 320x50 Display */}
        <div className="flex md:hidden w-full justify-center items-center overflow-hidden min-h-[50px]">
          <iframe
            title={`Adsterra 320x50 Mobile - ${placement}`}
            srcDoc={createAdsterraIframeDoc(zMobile.key, zMobile.width, zMobile.height)}
            width={zMobile.width}
            height={zMobile.height}
            className="border-0 overflow-hidden max-w-full"
            scrolling="no"
            loading="lazy"
          />
        </div>
      </AdsterraSlot>
    );
  }

  // 3. Fallback: High-CTR Verified Smartlink Banner
  const defaultTitle =
    linkType === 1
      ? "Recommended Tech & Software Utilities"
      : linkType === 2
      ? "Featured Developer & Cloud Resources"
      : "Verified Premium Digital Tools";

  const defaultDescription =
    linkType === 1
      ? "Explore hand-picked digital utilities, verified web tools, and partner promotions curated for the NammaTech community."
      : "Access high-performance developer deals, software utilities, and high-speed resources.";

  const bannerTitle = title || defaultTitle;
  const bannerDescription = description || defaultDescription;

  return (
    <AdsterraSlot placement={placement} className={className} label="Sponsored Spotlight">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 py-1">
        <div className="flex items-center gap-3.5 text-left">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight">
                {bannerTitle}
              </h4>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-2.5 h-2.5" />
                Verified
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1 max-w-xl mt-0.5">
              {bannerDescription}
            </p>
          </div>
        </div>

        <div className="shrink-0 w-full md:w-auto">
          <AdsterraSmartLink
            linkType={linkType}
            variant="primary"
            className="w-full md:w-auto justify-center"
            showBadge={true}
            badgeLabel="Ad"
          >
            <span>{ctaText}</span>
          </AdsterraSmartLink>
        </div>
      </div>
    </AdsterraSlot>
  );
}
