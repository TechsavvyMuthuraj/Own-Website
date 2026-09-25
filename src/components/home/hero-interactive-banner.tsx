"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { GridDistortion } from "@/components/ui/grid-distortion";
import { VoiceSearchButton } from "@/components/search/voice-search-button";

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
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleVoiceTranscript = (transcript: string) => {
    setSearchValue(transcript);
    router.push(`/search?q=${encodeURIComponent(transcript)}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <div className="double-bezel rounded-[2rem]">
      {/* Specular hairline top edge highlight */}
      <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none z-30" />
      <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] border border-amber-500/30 bg-neutral-950 shadow-2xl">
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
                width: "42%",
              }}
            >
              <form
                onSubmit={handleFormSubmit}
                className="relative flex items-center w-full"
              >
                <div className="relative w-full flex items-center shadow-2xl">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder={searchPlaceholder}
                    aria-label="Search resources"
                    className="w-full py-3.5 pl-11 pr-36 rounded-full bg-black/80 hover:bg-black/95 focus:bg-neutral-950 text-white placeholder-neutral-300 text-xs sm:text-sm font-medium border-2 border-amber-500/50 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/30 transition-all backdrop-blur-md"
                  />
                  <Search className="absolute left-4 w-4 h-4 text-amber-400 pointer-events-none" />

                  {/* Desktop Integrated Voice Search & Submit */}
                  <div className="absolute right-1.5 flex items-center gap-1">
                    <VoiceSearchButton onTranscript={handleVoiceTranscript} />
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-neutral-950 text-xs font-black transition-all shadow-lg shadow-amber-500/30 active:scale-95 cursor-pointer"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Mobile-Friendly Search Bar Below Graphic with Voice Search */}
        {showSearchBar && (
          <div className="md:hidden p-3.5 bg-neutral-900/90 border-t border-neutral-800">
            <form onSubmit={handleFormSubmit} className="relative flex items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-24 py-2.5 rounded-2xl border border-amber-500/30 bg-neutral-950 text-xs text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 shadow-inner"
                />
                <div className="absolute right-2 flex items-center">
                  <VoiceSearchButton onTranscript={handleVoiceTranscript} />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-2xl bg-amber-400 text-neutral-950 text-xs font-bold hover:bg-amber-300 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
