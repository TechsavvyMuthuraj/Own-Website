"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Film, Sparkles, ArrowRight, Play, Star, Download } from "lucide-react";
import type { Resource } from "@/types/database";

interface CinemaShowcaseProps {
  movies: Resource[];
}

export function CinemaShowcase({ movies }: CinemaShowcaseProps) {
  if (!movies || movies.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="eyebrow-pill bg-rose-500/10 text-rose-500 border-rose-500/30 mb-2">
            <Film className="w-3.5 h-3.5 text-rose-500" />
            <span>Theatrical Cinema Zone</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
            Cinema Releases & 4K VIP Prints
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1 max-w-xl leading-relaxed">
            Direct high-speed downloads across 480p, 720p, 1080p Full HD, and VIP 4K UHD Master editions with theater-quality audio.
          </p>
        </div>

        <Link
          href="/movies"
          className="inline-flex items-center gap-2 pl-4 pr-2 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-400 transition-all group self-start sm:self-auto shadow-xs active:scale-95"
        >
          <span>Explore All Movies</span>
          <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

      {/* Grid of Movie Posters */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {movies.map((movie) => {
          const tags = Array.isArray(movie.tags) ? movie.tags : [];
          return (
            <Link
              key={movie.id}
              href={`/movies/${movie.slug}`}
              className="group relative flex flex-col rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 bg-[var(--card)]/90 dark:bg-[#0a0a0f]/90 hover:border-amber-500/40 dark:hover:border-amber-500/40 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              {/* Poster 2:3 container */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
                {movie.thumbnail_url ? (
                  <Image
                    src={movie.thumbnail_url}
                    alt={movie.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                    <Film className="w-12 h-12 mb-2 text-rose-500/40" />
                    <span className="text-xs">Cinema Release</span>
                  </div>
                )}

                {/* Subtle gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-md">
                    4K UHD
                  </span>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-black/80 text-amber-400 border border-amber-400/30 backdrop-blur-md">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>9.6</span>
                  </div>
                </div>

                {/* Bottom Poster Overlay */}
                <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-white text-[11px] font-medium">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Download className="w-3 h-3" />
                    Free Mirrors
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    VIP 4K
                  </span>
                </div>
              </div>

              {/* Title & Info */}
              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                    {movie.title}
                  </h3>
                  <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-1 mt-0.5">
                    {movie.short_description || "High-bitrate cinema release with multi-audio."}
                  </p>
                </div>

                {/* Available Formats Chips */}
                <div className="flex items-center gap-1 flex-wrap pt-1 text-[9px] font-semibold text-zinc-400">
                  <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                    480p
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                    720p
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                    1080p
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    4K VIP
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
