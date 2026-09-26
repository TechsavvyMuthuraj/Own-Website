"use client";

import React from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useAds } from "@/components/providers/ads-provider";
import { isAdsterraAllowedPath, DEFAULT_ADSTERRA_CONFIG } from "@/config/adsterra";
import { AdsterraErrorBoundary } from "./AdsterraErrorBoundary";

declare global {
  interface Window {
    __adsterra_script_loaded__?: boolean;
    __adsterra_script2_loaded__?: boolean;
  }
}

/**
 * Adsterra Production Provider Script Injector
 * 
 * Safety Features:
 * 1. Strict route isolation: Bails out on /admin, /dashboard, /auth, /login, /register, /api, /account.
 * 2. Next.js lazyOnload: Never delays FCP, LCP, or hydration.
 * 3. Single-injection safeguard: Guaranteed duplicate prevention across SPA route transitions.
 * 4. Error Boundary wrapped: Protects the React application tree from third-party runtime faults.
 */
export function AdsterraScript() {
  const pathname = usePathname();
  const { adsEnabled, adsterraSettings } = useAds();

  // 1. Strict Route Defense: If path is restricted (admin, auth, api, etc.), do not inject
  if (!isAdsterraAllowedPath(pathname)) {
    return null;
  }

  // 2. Global Killswitch & Adsterra Script Toggles
  const isGlobalActive = adsEnabled && (adsterraSettings?.enabled ?? DEFAULT_ADSTERRA_CONFIG.enabled);
  if (!isGlobalActive) {
    return null;
  }

  const isScript1Active = adsterraSettings?.scriptEnabled ?? DEFAULT_ADSTERRA_CONFIG.scriptEnabled;
  const isScript2Active = adsterraSettings?.script2Enabled ?? DEFAULT_ADSTERRA_CONFIG.script2Enabled;

  const scriptSrc1 = adsterraSettings?.scriptUrl || DEFAULT_ADSTERRA_CONFIG.scriptUrl;
  const scriptSrc2 = adsterraSettings?.scriptUrl2 || DEFAULT_ADSTERRA_CONFIG.scriptUrl2;

  return (
    <AdsterraErrorBoundary slotName="AdsterraScript">
      {/* Script 1 (Social Bar / Global Delivery 1) */}
      {isScript1Active && (
        <Script
          id="adsterra-provider-script"
          src={scriptSrc1}
          strategy="lazyOnload"
          onLoad={() => {
            if (typeof window !== "undefined") {
              window.__adsterra_script_loaded__ = true;
            }
          }}
          onError={(err) => {
            if (process.env.NODE_ENV !== "production") {
              console.warn("[Adsterra Safe Container] Provider script 1 failed to load:", err);
            }
          }}
        />
      )}

      {/* Script 2 (Popunder / Global Delivery 2) */}
      {isScript2Active && (
        <Script
          id="adsterra-provider-script-2"
          src={scriptSrc2}
          strategy="lazyOnload"
          onLoad={() => {
            if (typeof window !== "undefined") {
              window.__adsterra_script2_loaded__ = true;
            }
          }}
          onError={(err) => {
            if (process.env.NODE_ENV !== "production") {
              console.warn("[Adsterra Safe Container] Provider script 2 failed to load:", err);
            }
          }}
        />
      )}
    </AdsterraErrorBoundary>
  );
}
