"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, Sparkles, ExternalLink, ShieldCheck, Zap } from "lucide-react";
import { useAds } from "@/components/providers/ads-provider";
import {
  isAdsterraAllowedPath,
  DEFAULT_ADSTERRA_CONFIG,
  ADSTERRA_ASSETS,
} from "@/config/adsterra";
import { AdsterraErrorBoundary } from "./AdsterraErrorBoundary";

/**
 * Creates an isolated HTML document string for the Adsterra iframe banner
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
 * AdsterraPopUpAd Component
 * 
 * Delivers full-website pop-up ads displaying real Adsterra banner advertisements.
 * 
 * Features:
 * 1. Shows actual Adsterra banner (300x250 Medium Rectangle or 320x50 on mobile).
 * 2. Auto-pops up gracefully across public pages after 3 seconds.
 * 3. Listens to custom event 'open-adsterra-popup' so any sponsored button/link can trigger it.
 * 4. Includes close countdown & instant close button.
 * 5. Strictly excluded from restricted paths (/admin, /auth, /checkout, /login, etc.).
 */
export function AdsterraPopUpAd() {
  const pathname = usePathname();
  const { adsEnabled, adsterraSettings } = useAds();
  const [isOpen, setIsOpen] = useState(false);
  const [canClose, setCanClose] = useState(true);
  const [dismissedCount, setDismissedCount] = useState(0);

  const isGlobalActive = adsEnabled && (adsterraSettings?.enabled ?? DEFAULT_ADSTERRA_CONFIG.enabled);
  const popupActive = isGlobalActive && (adsterraSettings?.popupAdEnabled !== false);
  const isAllowedPath = isAdsterraAllowedPath(pathname);

  // Auto-trigger pop-up ad on page visit
  useEffect(() => {
    if (!popupActive || !isAllowedPath) {
      setIsOpen(false);
      return;
    }

    const delayMs = ((adsterraSettings?.popupDelaySeconds ?? 3.5) || 3.5) * 1000;
    const timer = setTimeout(() => {
      // Auto show once per route change
      setIsOpen(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [pathname, popupActive, isAllowedPath, adsterraSettings?.popupDelaySeconds]);

  // Global listener for manual popup trigger (e.g. clicking sponsored download)
  useEffect(() => {
    const handleManualOpen = () => {
      if (isGlobalActive && isAllowedPath) {
        setIsOpen(true);
      }
    };

    window.addEventListener("open-adsterra-popup", handleManualOpen);
    return () => window.removeEventListener("open-adsterra-popup", handleManualOpen);
  }, [isGlobalActive, isAllowedPath]);

  if (!isOpen || !popupActive || !isAllowedPath) {
    return null;
  }

  const rectKey = ADSTERRA_ASSETS.bannerZones.rectangle_300x250.key;
  const mobileKey = ADSTERRA_ASSETS.bannerZones.mobile_320x50.key;
  const smartlinkUrl = adsterraSettings?.smartlink1 || ADSTERRA_ASSETS.smartlink1;

  const handleClose = () => {
    setIsOpen(false);
    setDismissedCount((prev) => prev + 1);
  };

  return (
    <AdsterraErrorBoundary slotName="AdsterraPopUpAd">
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="relative w-full max-w-[380px] rounded-3xl border border-amber-500/40 bg-neutral-950 p-5 shadow-2xl text-neutral-100 flex flex-col items-center overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Pop-up Ad Header */}
          <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Sponsored Advertisement</span>
              </span>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
              title="Close Ad"
              aria-label="Close Ad"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Actual Adsterra Banner Container (300x250 on desktop, 320x50 fallback) */}
          <div className="w-full flex flex-col items-center justify-center min-h-[250px] my-1 bg-neutral-900/60 rounded-2xl p-2 border border-neutral-800/80 overflow-hidden">
            {/* Desktop / Tablet: 300x250 Medium Rectangle */}
            <div className="hidden sm:block">
              <iframe
                title="Adsterra Pop-up Advertisement"
                src={`/api/ads/banner?key=${rectKey}&w=300&h=250&link=1`}
                width={300}
                height={250}
                className="border-0 overflow-hidden rounded-xl shadow-xs"
                loading="eager"
              />
            </div>

            {/* Mobile View: 320x50 Banner */}
            <div className="block sm:hidden">
              <iframe
                title="Adsterra Mobile Pop-up Advertisement"
                src={`/api/ads/banner?key=${mobileKey}&w=320&h=50&link=1`}
                width={320}
                height={50}
                className="border-0 overflow-hidden rounded-xl shadow-xs"
                loading="eager"
              />
            </div>
          </div>

          {/* Footer CTAs */}
          <div className="w-full flex items-center justify-between gap-3 pt-3 mt-1 border-t border-neutral-800/80">
            <a
              href={smartlinkUrl}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>Explore Partner Offer</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={handleClose}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
            >
              Skip / Continue
            </button>
          </div>
        </div>
      </div>
    </AdsterraErrorBoundary>
  );
}
