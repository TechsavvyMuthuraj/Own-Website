"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Layers,
  Film,
  Newspaper,
  Star,
  Download,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { Resource, Article } from "@/types/database";
import { ResourceGrid } from "@/components/resources/resource-grid";

interface SearchResultsViewProps {
  query: string;
  resources: Resource[];
  movies: Resource[];
  articles: Article[];
}

export function SearchResultsView({
  query,
  resources,
  movies,
  articles,
}: SearchResultsViewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "apps" | "movies" | "articles">("all");

  const totalCount = resources.length + movies.length + articles.length;

  if (totalCount === 0) {
    return (
      <div className="p-12 text-center rounded-3xl border border-black/10 dark:border-white/10 bg-[var(--card)]/60 backdrop-blur-xl space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-500">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[var(--foreground)]">
          No matches found for &quot;{query}&quot;
        </h3>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed">
          We couldn&apos;t find any software, movies, or articles matching your query. Try speaking or searching broader keywords like &quot;Android&quot;, &quot;VLC&quot;, or &quot;Cinema&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-full font-bold transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
              : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--foreground)]"
          }`}
        >
          All Results ({totalCount})
        </button>

        {resources.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("apps")}
            className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "apps"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--foreground)]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Apps & Tools ({resources.length})</span>
          </button>
        )}

        {movies.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("movies")}
            className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "movies"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--foreground)]"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Cinema Releases ({movies.length})</span>
          </button>
        )}

        {articles.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab("articles")}
            className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "articles"
                ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--foreground)]"
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Articles & Guides ({articles.length})</span>
          </button>
        )}
      </div>

      {/* 1. CINEMA & MOVIES RESULTS */}
      {(activeTab === "all" || activeTab === "movies") && movies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-sm uppercase tracking-wider">
            <Film className="w-4 h-4" />
            <span>Movies & 4K Cinema ({movies.length})</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {movies.map((movie) => (
              <Link
                key={movie.id}
                href={`/movies/${movie.slug}`}
                className="group relative flex flex-col rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 bg-[var(--card)] hover:border-amber-500/40 shadow-lg hover:shadow-2xl transition-all"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
                  {movie.thumbnail_url ? (
                    <Image
                      src={movie.thumbnail_url}
                      alt={movie.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                      <Film className="w-10 h-10 mb-1 text-rose-500" />
                      <span className="text-xs">Cinema</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-600 text-white">
                      4K UHD
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-black/80 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      9.6
                    </span>
                  </div>
                </div>

                <div className="p-3 space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] group-hover:text-amber-500 transition-colors line-clamp-1">
                    {movie.title}
                  </h4>
                  <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-1">
                    {movie.short_description || "480p / 720p / 1080p / 4K VIP Prints"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 2. ARTICLES & GUIDES RESULTS */}
      {(activeTab === "all" || activeTab === "articles") && articles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm uppercase tracking-wider">
            <Newspaper className="w-4 h-4" />
            <span>Articles & Technical Tutorials ({articles.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((art) => (
              <Link
                key={art.id}
                href={`/articles/${art.slug}`}
                className="group relative flex flex-col rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 bg-[var(--card)] hover:border-cyan-500/40 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-900">
                  {art.thumbnail_url ? (
                    <Image
                      src={art.thumbnail_url}
                      alt={art.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                      <Newspaper className="w-8 h-8 text-cyan-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)] group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {art.title}
                  </h4>
                  <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2">
                    {art.excerpt || "Read full article guide."}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 3. SOFTWARE APPS & TOOLS RESULTS */}
      {(activeTab === "all" || activeTab === "apps") && resources.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Software, Tools & APKs ({resources.length})</span>
          </div>

          <ResourceGrid resources={resources} />
        </div>
      )}
    </div>
  );
}
