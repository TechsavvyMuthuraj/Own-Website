"use client";

import React, { useState } from "react";
import Script from "next/script";
import { Sparkles, ShieldCheck, Zap, ExternalLink, Star, ArrowUpRight, Flame, Layers } from "lucide-react";
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

const CURATED_SPONSORED_OFFERS = [
  {
    id: "offer-1",
    tag: "High Demand",
    badgeColor: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    title: "High-Speed Secure VPN & Dev Tunnel",
    description: "Unlimited bandwidth, zero-lag WireGuard protocol, and worldwide secure nodes for developers.",
    rating: "4.9",
    reviews: "12.4k",
    cta: "Claim Free Trial ↗",
    linkKey: "smartlink1" as const,
    icon: ShieldCheck,
    accent: "from-amber-500/10 via-amber-500/5 to-transparent",
  },
  {
    id: "offer-2",
    tag: "Trending Utility",
    badgeColor: "bg-cyan-500/15 text-cyan-500 border-cyan-500/30",
    title: "Ultra-Fast Cloud VPS & Global CDN",
    description: "Deploy Linux/Windows instances in under 55 seconds with NVMe storage and DDoS shield.",
    rating: "4.8",
    reviews: "8.9k",
    cta: "Get $100 Credit ↗",
    linkKey: "smartlink2" as const,
    icon: Zap,
    accent: "from-cyan-500/10 via-cyan-500/5 to-transparent",
  },
  {
    id: "offer-3",
    tag: "Developer Pick",
    badgeColor: "bg-purple-500/15 text-purple-500 border-purple-500/30",
    title: "Pro Developer Utilities & API Toolkit",
    description: "50+ instant web inspection tools, regex tester, code optimizers, and automated formatters.",
    rating: "5.0",
    reviews: "15.1k",
    cta: "Explore Tools ↗",
    linkKey: "smartlink3" as const,
    icon: Layers,
    accent: "from-purple-500/10 via-purple-500/5 to-transparent",
  },
  {
    id: "offer-4",
    tag: "AI Powered",
    badgeColor: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    title: "AI Creative Studio & Media Enhancer",
    description: "Generate 4K assets, remove backgrounds instantly, and upscale media in real-time.",
    rating: "4.9",
    reviews: "9.3k",
    cta: "Start Free ↗",
    linkKey: "smartlink1" as const,
    icon: Sparkles,
    accent: "from-emerald-500/10 via-emerald-500/5 to-transparent",
  },
];

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

  const handleCardClick = (linkKey: "smartlink1" | "smartlink2" | "smartlink3") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-adsterra-popup"));
    }
  };

  const getSmartlinkUrl = (key: "smartlink1" | "smartlink2" | "smartlink3") => {
    return adsterraSettings?.[key] || ADSTERRA_ASSETS[key];
  };

  return (
    <AdsterraErrorBoundary slotName="AdsterraNativeWidget">
      <div className={`w-full flex flex-col gap-4 p-4 sm:p-6 rounded-3xl border border-amber-500/25 bg-[var(--card)]/80 backdrop-blur-md shadow-xs transition-all ${className}`}>
        {/* Header bar */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Sponsored Recommendations &amp; Verified Partner Offers</span>
            </h3>
          </div>
          <span className="text-[10px] font-bold text-amber-500/90 uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 self-start sm:self-auto">
            Monetized Partner Network
          </span>
        </div>

        {/* 1. Official Adsterra Native Container Widget with CSS hardening */}
        {nativeActive && (
          <div className="w-full">
            <style dangerouslySetInnerHTML={{ __html: `
              #${nativeData.containerId} {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 16px;
                width: 100% !important;
                margin: 0 auto;
              }
              #${nativeData.containerId} a {
                border-radius: 18px !important;
                overflow: hidden !important;
                transition: transform 0.2s ease, box-shadow 0.2s ease !important;
                text-decoration: none !important;
                background: rgba(255, 255, 255, 0.03) !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
              }
              #${nativeData.containerId} a:hover {
                transform: translateY(-3px) !important;
                box-shadow: 0 8px 24px rgba(253, 24, 67, 0.12) !important;
              }
              #${nativeData.containerId} img {
                border-radius: 14px !important;
                object-fit: cover !important;
                max-width: 100% !important;
              }
            ` }} />
            <div
              id={nativeData.containerId}
              className="w-full flex justify-center items-center overflow-hidden min-h-[100px]"
            />
            <Script
              id={`adsterra-native-script-${nativeData.containerId}`}
              async
              strategy="lazyOnload"
              src={nativeData.scriptUrl}
              onLoad={() => setNativeScriptLoaded(true)}
              onError={() => {}}
            />
          </div>
        )}

        {/* 2. High-Converting Influencing Native Card Grid (Guarantees visible, high-CTR ads always) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {CURATED_SPONSORED_OFFERS.map((offer) => {
            const IconComponent = offer.icon;
            const destUrl = getSmartlinkUrl(offer.linkKey);

            return (
              <a
                key={offer.id}
                href={destUrl}
                target="_blank"
                rel="nofollow sponsored noopener"
                onClick={() => handleCardClick(offer.linkKey)}
                className={`group relative flex flex-col justify-between p-4 rounded-2xl border border-[var(--border)] hover:border-amber-500/60 bg-gradient-to-b ${offer.accent} hover:bg-[var(--card)] transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer active:scale-98`}
              >
                <div>
                  {/* Badge & Rating */}
                  <div className="flex items-center justify-between gap-1 mb-2.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${offer.badgeColor}`}>
                      <Flame className="w-2.5 h-2.5" />
                      {offer.tag}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{offer.rating}</span>
                      <span className="text-[var(--muted-foreground)] opacity-60">({offer.reviews})</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] tracking-tight group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-2 mb-1.5 flex items-start gap-1.5">
                    <IconComponent className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span>{offer.title}</span>
                  </h4>

                  {/* Description */}
                  <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                {/* Footer CTA */}
                <div className="pt-3 mt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[var(--muted-foreground)] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    Verified Offer
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 group-hover:translate-x-0.5 transition-transform">
                    <span>{offer.cta}</span>
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </AdsterraErrorBoundary>
  );
}
