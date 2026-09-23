"use client";

import React from "react";
import {
  ShieldCheck,
  Zap,
  FileCode,
  Users2,
  BadgeCheck,
  Cpu,
  ArrowUpRight,
  Headphones,
} from "lucide-react";
import Link from "next/link";
import { SpotlightCard } from "@/components/ui/spotlight-card";

export function FeaturesGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-10 sm:mb-14">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
          <BadgeCheck className="w-3.5 h-3.5" />
          <span>The NammaTech Engineering Standard</span>
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--foreground)] tracking-tight max-w-2xl">
          Engineered for Extreme Speed, Zero Malware &amp; Verifiable Trust
        </h2>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-2.5 max-w-xl">
          Replacing bloated third-party download traps with direct cloud mirrors, SHA-256 integrity audits, and real-time technical assistance.
        </p>
      </div>

      {/* Pro Developer Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Bento Card 1: 10Gbps Direct CDN Mirror (Spans 2 columns) */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.15)"
          className="md:col-span-2 p-6 sm:p-8 flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-mono">
                10 Gbps Edge Uncapped
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight mb-2 group-hover:text-amber-500 transition-colors">
              High-Velocity Direct Mirror Nodes
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed max-w-xl">
              Tier-1 edge storage networks (Google Drive, Terabox VIP, Fast CDN) ensure your browser hits maximum theoretical download bandwidth. Zero countdown timers, zero captcha loops, and zero deceptive adware popups.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-amber-500">
            <span>Verified 99.98% Mirror Uptime</span>
            <Link href="/explore" className="inline-flex items-center gap-1 hover:underline">
              <span>Browse Direct Links</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </SpotlightCard>

        {/* Bento Card 2: Cryptographic SHA-256 Audits (1 column) */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.15)"
          className="p-6 sm:p-8 flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono">
                100% Clean
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-[var(--foreground)] tracking-tight mb-2 group-hover:text-emerald-500 transition-colors">
              SHA-256 Checksums
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Every installer, binary, and archive is scanned with VirusTotal multi-engine diagnostics and verified before release.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)] text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            VirusTotal &amp; Defender Audited
          </div>
        </SpotlightCard>

        {/* Bento Card 3: Real-Time Specialist Triage (1 column) */}
        <SpotlightCard
          spotlightColor="rgba(6, 182, 212, 0.15)"
          className="p-6 sm:p-8 flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Headphones className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 font-mono">
                Live Console
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-[var(--foreground)] tracking-tight mb-2 group-hover:text-cyan-400 transition-colors">
              1-on-1 Specialist Support
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Facing missing DLLs, Windows Defender false positives, or installation crashes? Live technical specialists diagnose in real time.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)]">
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              <span>Connect with Specialist</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </SpotlightCard>

        {/* Bento Card 4: Open Source & Community Pipeline (Spans 2 columns) */}
        <SpotlightCard
          spotlightColor="rgba(168, 85, 247, 0.15)"
          className="md:col-span-2 p-6 sm:p-8 flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-500 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <FileCode className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-mono">
                Licensing Respect
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight mb-2 group-hover:text-purple-400 transition-colors">
              Developer Pipeline &amp; Transparent Attribution
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed max-w-xl">
              Full attribution directly linking back to official creator repositories (GitHub, GitLab, developer sites). Submit custom requests directly to our lead software architect for 24-hour verification.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
            <span>MIT, GPL, Freeware &amp; Creative Commons</span>
            <Link href="/requests" className="inline-flex items-center gap-1 hover:underline">
              <span>Submit Resource Request</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}

export default FeaturesGrid;
