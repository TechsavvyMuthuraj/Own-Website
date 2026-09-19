import React from "react";

export default function PublicLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 animate-pulse w-full">
      {/* Hero skeleton */}
      <div className="w-full aspect-[1983/793] rounded-3xl bg-neutral-900/60 border border-neutral-800/80 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3"
          >
            <div className="aspect-video w-full rounded-xl bg-neutral-800/60" />
            <div className="h-4 w-3/4 rounded bg-neutral-800/80" />
            <div className="h-3 w-1/2 rounded bg-neutral-800/50" />
            <div className="flex justify-between pt-2 border-t border-neutral-800">
              <div className="h-4 w-16 rounded bg-neutral-800/60" />
              <div className="h-6 w-20 rounded bg-amber-500/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
