"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, Zap, Film, Cpu, HardDrive, Headphones, Download } from "lucide-react";

const MARQUEE_ITEMS = [
  { label: "Direct Drive Mirrors", tag: "10 Gbps", icon: Zap, href: "/explore?platform=windows" },
  { label: "4K UHD IMAX Remuxes", tag: "Lossless Audio", icon: Film, href: "/movies" },
  { label: "DirectX & VC++ 2015-2022", tag: "Verified", icon: HardDrive, href: "/explore?platform=pc-software" },
  { label: "Windows 11 24H2 Clean Repacks", tag: "Zero Bloat", icon: ShieldCheck, href: "/explore?platform=windows" },
  { label: "Technical Support Console", tag: "Live Triage", icon: Headphones, href: "/contact" },
  { label: "Top AI & Developer Tools", tag: "Productivity", icon: Cpu, href: "/explore?category=developer-tools" },
  { label: "SHA-256 VirusTotal Verified", tag: "100% Clean", icon: ShieldCheck, href: "/disclaimer" },
  { label: "VIP High-Speed Downloads", tag: "Priority", icon: Download, href: "/premium" },
];

export function InfiniteMarqueeTicker() {
  return (
    <div className="relative w-full overflow-hidden py-3 border-y border-[var(--border)] bg-[var(--card)]/40 backdrop-blur-md select-none group">
      {/* Edge Vignette Masks for seamless fading */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[var(--background)] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[var(--background)] to-transparent z-10" />

      {/* Marquee Track */}
      <div className="flex w-max animate-marquee space-x-4 hover:[animation-play-state:paused]">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] hover:border-cyan-500/50 hover:bg-[var(--secondary)] transition-all duration-200 text-xs font-medium text-[var(--foreground)] shadow-xs flex-shrink-0"
            >
              <Icon className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span>{item.label}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-mono">
                {item.tag}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default InfiniteMarqueeTicker;
