"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Newspaper, ArrowRight, Clock, Calendar, Sparkles } from "lucide-react";
import type { Article } from "@/types/database";

interface ArticlesShowcaseProps {
  articles: Article[];
}

export function ArticlesShowcase({ articles }: ArticlesShowcaseProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="eyebrow-pill bg-cyan-500/10 text-cyan-500 border-cyan-500/30 mb-2">
            <Newspaper className="w-3.5 h-3.5 text-cyan-400" />
            <span>NammaTech Journal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
            Latest Articles & Tech Guides
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1 max-w-xl leading-relaxed">
            In-depth tutorials, software architecture, AI advancements, and tech tutorials written by Muthuraj.
          </p>
        </div>

        <Link
          href="/articles"
          className="inline-flex items-center gap-2 pl-4 pr-2 py-2 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-xs font-bold text-cyan-400 transition-all group self-start sm:self-auto shadow-xs active:scale-95"
        >
          <span>View All Articles</span>
          <span className="w-6 h-6 rounded-full bg-cyan-500 text-black flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {articles.map((art) => {
          const dateStr = art.published_at
            ? new Date(art.published_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Recent";

          return (
            <Link
              key={art.id}
              href={`/articles/${art.slug}`}
              className="group relative flex flex-col rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 bg-[var(--card)]/90 dark:bg-[#09090e]/90 hover:border-cyan-500/40 dark:hover:border-cyan-500/40 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              {/* Thumbnail 16:9 */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-900">
                {art.thumbnail_url ? (
                  <Image
                    src={art.thumbnail_url}
                    alt={art.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                    <Newspaper className="w-10 h-10 mb-1 text-cyan-500/40" />
                    <span className="text-xs">Journal Guide</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute bottom-2.5 left-3 flex items-center gap-2 text-[10px] text-white/90">
                  <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                    <Calendar className="w-2.5 h-2.5 text-cyan-400" />
                    {dateStr}
                  </span>
                  <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                    <Clock className="w-2.5 h-2.5 text-amber-400" />
                    3 min read
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                    {art.excerpt || "Read this complete technical guide and breakdown from NammaTech."}
                  </p>
                </div>

                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative w-5 h-5 rounded-full overflow-hidden ring-1 ring-amber-500/50">
                      <Image
                        src="/images/founder-muthuraj.webp"
                        alt="Muthuraj C"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-[var(--foreground)]">
                      Muthuraj C
                    </span>
                  </div>

                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Read</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
