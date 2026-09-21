import React from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export default function PublicLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 w-full min-h-[60vh] flex flex-col justify-center">
      {/* Central High-Tech Glowing Spinner */}
      <div className="flex flex-col items-center justify-center py-10">
        <div className="relative mb-6 flex items-center justify-center">
          {/* Outer Glowing Arc */}
          <div className="w-20 h-20 rounded-full border-2 border-transparent border-t-amber-400 border-r-amber-500/50 animate-spin" />
          {/* Inner Counter Arc */}
          <div className="absolute w-14 h-14 rounded-full border-2 border-transparent border-b-yellow-400 border-l-amber-300/60 animate-[spin_1.5s_linear_infinite_reverse]" />
          {/* Central Pulsing Dot */}
          <div className="absolute w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.9)] animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-semibold tracking-wider uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Loading NammaTech...</span>
        </div>
        <p className="text-xs text-neutral-400 font-medium">Syncing verified digital resources</p>
      </div>

      {/* Cards Shimmer Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 opacity-60">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-neutral-800/80 bg-neutral-900/40 p-4 space-y-3 relative overflow-hidden"
          >
            <div className="aspect-video w-full rounded-2xl bg-neutral-800/50 animate-pulse" />
            <div className="h-4 w-3/4 rounded-lg bg-neutral-800/70 animate-pulse" />
            <div className="h-3 w-1/2 rounded-lg bg-neutral-800/40 animate-pulse" />
            <div className="flex justify-between pt-2 border-t border-neutral-800/60">
              <div className="h-4 w-16 rounded-md bg-neutral-800/50 animate-pulse" />
              <div className="h-5 w-20 rounded-full bg-amber-500/10 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
