"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FemaleMascotFigure } from "./female-mascot-figure";
import { useAuth } from "@/lib/auth/auth-context";
import { Sparkles, X, ArrowRight, Bot } from "lucide-react";
import "./namma-mascot.css";

function YouTubeIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={`${className} fill-current`} viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={`${className} fill-current`} viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export function GlobalSiteMascot() {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Derive user's display name if authenticated
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "";

  // Hide on /request, /community, or admin pages to keep interactive zones unobstructed
  if (pathname === "/request" || pathname === "/community" || isDismissed) {
    return null;
  }

  // Also hide on admin dashboard pages to keep admin workspace ultra-clean
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-3 sm:bottom-5 sm:left-5 z-40 flex items-end gap-3 pointer-events-auto select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Interactive Speech Bubble on Hover ── */}
      {isHovered && (
        <div className="mascot-speech-bubble mb-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative p-4 rounded-2xl bg-neutral-950/95 backdrop-blur-xl border border-cyan-500/40 text-white shadow-2xl shadow-cyan-950/50 max-w-[240px] space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>NammaTech AI Assistant</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDismissed(true);
                }}
                className="text-neutral-500 hover:text-white p-0.5 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <p className="text-[11px] text-neutral-300 leading-relaxed">
              {displayName
                ? `Hey ${displayName}! Need any games, PC tools, or APKs? Let me find it for you! ✨`
                : "Looking for games, software, or APK tools? Let me find it for you! ✨"}
            </p>

            <Link
              href="/request"
              className="inline-flex items-center gap-1.5 w-full justify-center px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-[11px] transition-all shadow-md shadow-cyan-500/25 active:scale-95"
            >
              <span>Request a Resource</span>
              <ArrowRight className="w-3 h-3" />
            </Link>

            {/* Social Links Bar */}
            <div className="pt-1 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400">
              <a
                href="https://www.youtube.com/channel/UCavl9VKjbVWJBsqlVaCiIsw"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                <YouTubeIcon className="w-3 h-3 text-red-500" />
                <span>YouTube</span>
              </a>
              <a
                href="https://www.instagram.com/techiemuthuraj/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-pink-400 flex items-center gap-1 transition-colors"
              >
                <InstagramIcon className="w-3 h-3 text-pink-500" />
                <span>Instagram</span>
              </a>
            </div>

            {/* Bubble Arrow Tail pointing down-left toward mascot */}
            <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-neutral-950 border-r border-b border-cyan-500/40 transform rotate-45" />
          </div>
        </div>
      )}

      {/* ── Female Animated Mascot Icon / Figure ── */}
      <Link
        href="/request"
        className="group relative flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95"
        title="AI Assistant - Click to request any resource!"
      >
        <FemaleMascotFigure
          expression={isHovered ? "wave" : "normal"}
          size="sm"
          className="transition-all"
        />

        {/* Ambient base shadow / hover glow */}
        <div className="w-12 h-2 rounded-full bg-cyan-500/25 blur-xs mt-1 transition-all group-hover:bg-cyan-500/50 group-hover:scale-125" />
      </Link>
    </div>
  );
}
