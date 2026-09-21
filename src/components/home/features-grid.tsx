"use client";

import React from "react";
import {
  ShieldCheck,
  Zap,
  FileCode,
  Users2,
  CheckCircle2,
  Lock,
  DownloadCloud,
  BadgeCheck,
} from "lucide-react";

export function FeaturesGrid() {
  const features = [
    {
      title: "Cryptographically Verified",
      tag: "100% Malware-Free",
      description:
        "Every binary, APK package, and software utility undergoes rigorous SHA-256 checksum verification against official developer source releases. Never repackaged with adware.",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Direct Edge Mirror Nodes",
      tag: "Uncapped Bandwidth",
      description:
        "High-performance CDN edge storage ensures your connection hits maximum theoretical download speeds with zero deceptive ad traps, forced popups, or countdown timers.",
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      title: "Licensing Transparency",
      tag: "Open-Source & Freeware",
      description:
        "Clean attribution directly linking back to developer repositories (GitHub, GitLab, Official sites). We respect creative commons, MIT, GPL, and freeware licensing.",
      icon: <FileCode className="w-6 h-6 text-blue-400" />,
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      title: "Community Request Pipeline",
      tag: "User-Driven Catalog",
      description:
        "Can't find the exact developer utility, APK, or 4K cinema master release you need? Submit a community request directly to our lead architect for rapid verification.",
      icon: <Users2 className="w-6 h-6 text-purple-400" />,
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 text-xs font-bold uppercase tracking-wider mb-3">
          <BadgeCheck className="w-3.5 h-3.5" />
          <span>The NammaTech Standard</span>
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--foreground)] tracking-tight max-w-2xl">
          Engineering Trust, Speed, & Verification Into Every Release
        </h2>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-2 max-w-xl">
          We built NammaTech to replace shady third-party download mirrors with a mature, respectable, and verified platform.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {features.map((feat, idx) => (
          <div
            key={idx}
            className="group relative flex flex-col p-6 sm:p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-xl shadow-sm hover:shadow-xl hover:border-[var(--primary)]/40 transition-all duration-300 card-hover-lift"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {feat.icon}
              </div>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${feat.badgeColor}`}
              >
                {feat.tag}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-tight mb-2 group-hover:text-[var(--primary)] transition-colors">
              {feat.title}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              {feat.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
