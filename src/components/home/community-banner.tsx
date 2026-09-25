"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, Video, Mic, Sparkles, Users, ArrowRight, Radio } from "lucide-react";

export function CommunityBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 border border-black/10 dark:border-white/10 bg-gradient-to-r from-neutral-900 via-neutral-950 to-[#0d0914] shadow-2xl">
        {/* Glow ambient background orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Tech & Cinema Lounge
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/80">
                WebRTC & Realtime
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Connect, Chat & Call with the Community
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
              Hang out in real-time developer channels, talk regional cinema and 4K UHD releases, or launch high-definition group voice and video calls with screen sharing — completely free in your browser.
            </p>

            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <Link
                href="/community"
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-neutral-950 text-xs font-black transition-all shadow-lg shadow-amber-500/30 active:scale-95 flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-neutral-950" />
                <span>Enter Community Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/community"
                className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-2"
              >
                <Video className="w-4 h-4 text-rose-400" />
                <span>Live Audio & Video Stage</span>
              </Link>
            </div>
          </div>

          {/* Right Highlights Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Radio className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Sub-50ms Chat</h3>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Real-time channels for software, tools, and cinema requests.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">WebRTC Lounge</h3>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Browser group voice, video, and screen sharing stage.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Voice Search</h3>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Search apps and 4K movies by speaking in Tamil or English.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white">Verified Badges</h3>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Founder, Admin, VIP, and Member roles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
