"use client";

import React from "react";
import Link from "next/link";
import {
  Monitor,
  Smartphone,
  Laptop,
  Terminal,
  Globe,
  Cpu,
  Film,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export function InteractivePlatformStrip() {
  const platforms = [
    {
      label: "Windows",
      href: "/explore?platform=windows",
      icon: <Monitor className="w-4 h-4 text-blue-400" />,
      tag: "PC Softwares & Tools",
    },
    {
      label: "Android",
      href: "/explore?platform=android",
      icon: <Smartphone className="w-4 h-4 text-emerald-400" />,
      tag: "Clean Verified APKs",
    },
    {
      label: "macOS",
      href: "/explore?platform=mac",
      icon: <Laptop className="w-4 h-4 text-indigo-400" />,
      tag: "Apple Silicon & Intel",
    },
    {
      label: "Linux",
      href: "/explore?platform=linux",
      icon: <Terminal className="w-4 h-4 text-amber-400" />,
      tag: "Deb, AppImage & Shell",
    },
    {
      label: "Web Tools",
      href: "/explore?platform=web",
      icon: <Globe className="w-4 h-4 text-cyan-400" />,
      tag: "Browser Utilities",
    },
    {
      label: "AI Systems",
      href: "/explore?category=ai-tools",
      icon: <Cpu className="w-4 h-4 text-pink-400" />,
      tag: "Models & Prompts",
    },
    {
      label: "4K Cinema",
      href: "/movies",
      icon: <Film className="w-4 h-4 text-rose-400" />,
      tag: "Ultra HD VIP Hub",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="p-4 sm:p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--primary)]">
              Ecosystem Navigator
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-[var(--foreground)] tracking-tight">
              Filter By Platform & Environment
            </h3>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline"
          >
            <span>Explore full catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Horizontal Scroll Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {platforms.map((p) => (
            <Link
              key={p.label}
              href={p.href}
              className="group flex flex-col p-3 rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/40 hover:bg-[var(--secondary)] hover:border-[var(--primary)]/50 transition-all duration-200 card-hover-lift"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  {p.icon}
                </div>
                <ArrowRight className="w-3 h-3 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
              </div>
              <span className="text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                {p.label}
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)] truncate mt-0.5">
                {p.tag}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
