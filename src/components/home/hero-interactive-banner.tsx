"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, Sparkles } from "lucide-react";
import { GridDistortion } from "@/components/ui/grid-distortion";

interface HeroInteractiveBannerProps {
  heroImageUrl: string;
  showSearchBar?: boolean;
  searchPlaceholder?: string;
}

export function HeroInteractiveBanner({
  heroImageUrl,
  showSearchBar = true,
  searchPlaceholder = "Search software, movies, tools, APKs, templates...",
}: HeroInteractiveBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-neutral-950 shadow-2xl">
      {/* Full resolution graphic banner with WebGL GridDistortion permanently active */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[1983/793] min-h-[220px] sm:min-h-[260px] md:min-h-0 overflow-hidden group">
        <div className="absolute inset-0 w-full h-full">
          <GridDistortion
            imageSrc={heroImageUrl}
            grid={16}
            mouse={0.12}
            strength={0.16}
            relaxation={0.92}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Desktop Interactive Search Overlay positioned at reference x: 17.2%, y: 89.5% */}
        {showSearchBar && (
          <div
            className="hidden md:flex flex-col justify-center absolute z-20 pointer-events-auto"
            style={{
              left: "17.2%",
              top: "89.5%",
              transform: "translateY(-50%)",
              width: "36%",
            }}
          >
            <form
              action="/search"
              method="GET"
              className="relative flex items-center w-full"
            >
              <div className="relative w-full flex items-center shadow-2xl">
                <input
                  type="text"
                  name="q"
                  placeholder={searchPlaceholder}
                  aria-label="Search resources"
                  className="w-full py-3.5 pl-12 pr-28 rounded-full bg-black/75 hover:bg-black/90 focus:bg-neutral-950 text-white placeholder-neutral-300 text-xs sm:text-sm font-medium border-2 border-amber-500/50 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/30 transition-all backdrop-blur-md"
                />
                <Search className="absolute left-4 w-4 h-4 text-amber-400 pointer-events-none" />
                <button
                  type="submit"
                  className="absolute right-1.5 px-6 py-2 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-neutral-950 text-xs font-black transition-all shadow-lg shadow-amber-500/30 active:scale-95 cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Mobile-Friendly Search Bar Below Graphic */}
      {showSearchBar && (
        <div className="md:hidden p-4 bg-neutral-900/90 border-t border-neutral-800">
          <form action="/search" method="GET" className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              name="q"
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-24 py-2.5 rounded-2xl border border-amber-500/30 bg-neutral-950 text-xs text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 text-neutral-950 text-xs font-bold hover:bg-amber-300 transition-all cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
