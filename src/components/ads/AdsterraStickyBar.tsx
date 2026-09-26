"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Zap, Sparkles, Star, ChevronDown, ChevronUp, ShieldCheck, X, Flame } from "lucide-react";
import { useAds } from "@/components/providers/ads-provider";
import {
  isAdsterraAllowedPath,
  DEFAULT_ADSTERRA_CONFIG,
  ADSTERRA_ASSETS,
} from "@/config/adsterra";

/**
 * AdsterraStickyBar Component (Floating Side Widget)
 * 
 * Upgraded from a bottom-docked bar to an interactive Floating Side Widget:
 * - Positioned on the Left or Right side (e.g. Floating Bottom-Right or Bottom-Left)
 * - Zero collision with the scroll-to-top button or chat widgets
 * - Highly engaging card format that drives clicks to Adsterra Smartlink ($5-$20+ CPM)
 * - Minimizable into a sleek floating badge or dismissible
 */
export function AdsterraStickyBar() {
  const pathname = usePathname();
  const { adsEnabled, adsterraSettings } = useAds();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const isGlobalActive = adsEnabled && (adsterraSettings?.enabled ?? DEFAULT_ADSTERRA_CONFIG.enabled);
  const stickyActive = isGlobalActive && (adsterraSettings?.stickyBarEnabled !== false);
  const isAllowedPath = isAdsterraAllowedPath(pathname);

  // Position preference: 'bottom-right' (default) | 'bottom-left' | 'right-edge' | 'left-edge'
  const position = adsterraSettings?.stickyBarPosition || "bottom-right";

  useEffect(() => {
    // On mobile viewports (< 640px) or on /community page, default to minimized floating pill so it doesn't block interactions!
    if (typeof window !== "undefined" && (window.innerWidth < 640 || pathname === "/community")) {
      setMinimized(true);
    }
  }, [pathname]);

  useEffect(() => {
    // Show after 1.5 seconds on page entry
    if (stickyActive && isAllowedPath && !dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [pathname, stickyActive, isAllowedPath, dismissed]);

  if (!isVisible || dismissed || !stickyActive || !isAllowedPath) {
    return null;
  }

  const smartlinkUrl = adsterraSettings?.smartlink2 || ADSTERRA_ASSETS.smartlink2;

  const handleClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-adsterra-popup"));
    }
  };

  // Position CSS mapping
  const positionClasses = {
    "bottom-right": "bottom-24 right-3 sm:right-6",
    "bottom-left": "bottom-24 left-3 sm:left-6",
    "right-edge": "top-1/2 -translate-y-1/2 right-3 sm:right-4",
    "left-edge": "top-1/2 -translate-y-1/2 left-3 sm:left-4",
  }[position] || "bottom-24 right-3 sm:right-6";

  const isLeft = position === "bottom-left" || position === "left-edge";

  // Minimized Compact Floating Pill
  if (minimized) {
    return (
      <aside
        aria-label="Sponsored Partner Quick Access"
        className={`fixed z-50 ${positionClasses} animate-in fade-in zoom-in-95 duration-200`}
      >
        <div className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-neutral-950/95 border border-amber-500/50 shadow-2xl backdrop-blur-xl text-neutral-100 group">
          <a
            href={smartlinkUrl}
            target="_blank"
            rel="nofollow sponsored noopener"
            onClick={handleClick}
            className="flex items-center gap-2 text-xs font-black text-amber-400 hover:text-amber-300 transition-colors pl-2"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Partner Offer (4.9★)</span>
          </a>

          <button
            onClick={() => setMinimized(false)}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Expand Offer"
            aria-label="Expand Offer"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Dismiss Offer"
            aria-label="Dismiss Offer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    );
  }

  // Expanded High-CTR Floating Side Card
  return (
    <aside
      aria-label="Sponsored Partner Floating Offer"
      className={`fixed z-50 ${positionClasses} w-[calc(100vw-2rem)] max-w-[340px] animate-in fade-in slide-in-from-bottom-4 duration-300`}
    >
      <div className="relative rounded-3xl border border-amber-500/40 bg-neutral-950/95 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl text-neutral-100 overflow-hidden group">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Flame className="w-2.5 h-2.5 text-amber-400" />
              <span>Special Partner Deal</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMinimized(true)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Minimize to side"
              aria-label="Minimize to side"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Close Offer"
              aria-label="Close Offer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-2 mb-4">
          <h4 className="text-xs sm:text-sm font-black text-white tracking-tight flex items-start gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
            </span>
            <span>High-Speed Cloud Access & Verified Developer Utilities</span>
          </h4>

          <p className="text-[11px] text-neutral-400 leading-relaxed pl-8">
            Deploy fast VPN tunnels, developer utilities, & VIP CDN hosting packs. Tested and verified for the community.
          </p>

          <div className="flex items-center gap-3 pt-1 pl-8 text-[10px] text-neutral-400">
            <span className="flex items-center gap-1 font-bold text-amber-400">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>4.9 / 5.0</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Instant Access</span>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <a
          href={smartlinkUrl}
          target="_blank"
          rel="nofollow sponsored noopener"
          onClick={handleClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs transition-all shadow-md shadow-amber-500/25 active:scale-98 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-neutral-950" />
          <span>Claim Direct Access ↗</span>
        </a>
      </div>
    </aside>
  );
}
