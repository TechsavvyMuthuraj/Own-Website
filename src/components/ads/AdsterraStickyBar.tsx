"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Zap, Sparkles, ExternalLink, X } from "lucide-react";
import { useAds } from "@/components/providers/ads-provider";
import {
  isAdsterraAllowedPath,
  DEFAULT_ADSTERRA_CONFIG,
  ADSTERRA_ASSETS,
} from "@/config/adsterra";

/**
 * AdsterraStickyBar Component
 * 
 * High-CTR Floating Sticky Bottom Ad Bar:
 * - Stays visible as users scroll down pages.
 * - Drives multiple user clicks to Adsterra Smartlink ($5-$20+ CPM).
 * - Styled cleanly with glassmorphism so it looks premium and trustworthy.
 * - Dismissible with a clean close button.
 * - Automatically hidden on /admin, /auth, /checkout, etc.
 */
export function AdsterraStickyBar() {
  const pathname = usePathname();
  const { adsEnabled, adsterraSettings } = useAds();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isGlobalActive = adsEnabled && (adsterraSettings?.enabled ?? DEFAULT_ADSTERRA_CONFIG.enabled);
  const isAllowedPath = isAdsterraAllowedPath(pathname);

  useEffect(() => {
    // Show after 2 seconds on page entry
    if (isGlobalActive && isAllowedPath && !dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [pathname, isGlobalActive, isAllowedPath, dismissed]);

  if (!isVisible || dismissed || !isGlobalActive || !isAllowedPath) {
    return null;
  }

  const smartlinkUrl = adsterraSettings?.smartlink2 || ADSTERRA_ASSETS.smartlink2;

  const handleClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-adsterra-popup"));
    }
  };

  return (
    <aside
      aria-label="Sponsored Partner Bar"
      className="fixed bottom-0 inset-x-0 z-40 p-2.5 sm:p-3 bg-neutral-950/90 backdrop-blur-xl border-t border-amber-500/40 shadow-2xl animate-in slide-in-from-bottom duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-4">
        {/* Left: Indicator & Headline */}
        <div className="flex items-center gap-3 text-center sm:text-left">
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-extrabold text-[10px] uppercase tracking-wider border border-amber-500/30">
              Verified Partner Offer
            </span>
            <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
              ⚡ High-Speed Direct Cloud Access, Developer Tools &amp; Productivity Packs
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={smartlinkUrl}
            target="_blank"
            rel="nofollow sponsored noopener"
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-neutral-950" />
            <span>Direct Access ↗</span>
          </a>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Dismiss ad"
            aria-label="Dismiss ad"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
