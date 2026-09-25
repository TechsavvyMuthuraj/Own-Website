"use client";

import React from "react";
import {
  ShieldCheck,
  Zap,
  FolderGit2,
  HardDriveDownload,
  CheckCircle2,
  Lock,
  Cpu,
} from "lucide-react";

interface LiveStatsBarProps {
  totalResources: number;
  totalCategories: number;
  totalMovies: number;
}

export function LiveStatsBar({
  totalResources,
  totalCategories,
  totalMovies,
}: LiveStatsBarProps) {
  const stats = [
    {
      label: "Verified Resources",
      value: totalResources > 0 ? `${totalResources}+` : "100%",
      subtext: "Freeware, Tools & APKs",
      icon: <FolderGit2 className="w-5 h-5 text-[var(--primary)]" />,
    },
    {
      label: "Active Categories",
      value: totalCategories > 0 ? `${totalCategories}` : "12+",
      subtext: "Organized Classifications",
      icon: <Cpu className="w-5 h-5 text-emerald-500" />,
    },
    {
      label: "Direct Downloads",
      value: "100%",
      subtext: "Unthrottled Cloud Speed",
      icon: <HardDriveDownload className="w-5 h-5 text-amber-400" />,
    },
    {
      label: "Security Audit",
      value: "100%",
      subtext: "Malware & Adware Free",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="group relative flex flex-col p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-xl shadow-sm hover:shadow-xl hover:border-[var(--primary)]/40 transition-all duration-300 card-hover-lift"
          >
            {/* Top Accent Dot */}
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>Live</span>
              </span>
            </div>

            {/* Numbers & Labels */}
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight font-mono group-hover:text-[var(--primary)] transition-colors">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] mt-0.5">
                {stat.label}
              </span>
              <span className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                {stat.subtext}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
