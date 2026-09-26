import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/types/database";
import { Newspaper, Sparkles, ArrowRight, Tag, Calendar, Clock, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { AdSlot } from "@/components/ads/ad-slot";
import { getActiveAd } from "@/lib/ads";

export const metadata: Metadata = {
  title: "Articles, Tech Guides & Study Notes",
  description:
    "Read technical articles, study notes, computer science tutorials, interview prep cheat sheets, and tech news from NammaTech.",
  keywords: [
    "Nammatech Articles",
    "nammatech articles",
    "NammaTech study notes",
    "nammatech study notes",
    "nammatech notes",
    "study notes",
    "technical interview notes",
    "computer science notes",
    "engineering study notes",
    "coding tutorials",
    "tech articles",
  ],
  alternates: {
    canonical: "https://www.techsavvymuthuraj.dev/articles",
  },
  openGraph: {
    title: "Articles, Tech Guides & Study Notes | NammaTech",
    description:
      "Latest technical articles, study notes, coding tutorials, and engineering guides from NammaTech.",
  },
};

export const revalidate = 120;

interface ArticlesPageProps {
  searchParams: Promise<{ tag?: string }>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function estimateReadTime(content: string | null) {
  if (!content) return "2 min";
  const words = content.split(/\s+/).length;
  const mins = Math.ceil(words / 200);
  return `${mins} min read`;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { tag } = await searchParams;
  const supabase = await createClient();

  let articles: Article[] = [];
  let featuredArticles: Article[] = [];
  let allTags: string[] = [];
  let topAd: any = null;
  let bottomAd: any = null;

  try {
    const [featuredResult, tagResult, topAdResult, bottomAdResult] = await Promise.all([
      supabase
        .from("articles")
        .select("*")
        .eq("status", "PUBLISHED")
        .eq("featured", true)
        .order("published_at", { ascending: false })
        .limit(3),
      supabase
        .from("articles")
        .select("tags")
        .eq("status", "PUBLISHED"),
      getActiveAd("HOMEPAGE"),
      getActiveAd("FOOTER"),
    ]);

    if (featuredResult.data) featuredArticles = featuredResult.data as Article[];
    topAd = topAdResult;
    bottomAd = bottomAdResult;

    let query = supabase
      .from("articles")
      .select("*")
      .eq("status", "PUBLISHED")
      .order("published_at", { ascending: false })
      .limit(24);

    if (tag) {
      query = query.contains("tags", [tag]);
    }

    const { data } = await query;
    if (data) articles = data as Article[];

    // Extract unique tags
    const tagData = tagResult.data;
    if (tagData) {
      const tagSet = new Set<string>();
      tagData.forEach((row: any) => {
        if (Array.isArray(row.tags)) {
          row.tags.forEach((t: string) => tagSet.add(t));
        }
      });
      allTags = Array.from(tagSet).slice(0, 10);
    }
  } catch (err) {
    console.error("Failed to load articles:", err);
  }

  return (
    <div className="relative min-h-screen py-8 sm:py-12 space-y-12 overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-yellow-500/8 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Top AdSlot (only rendered if active in admin) */}
      {topAd && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AdSlot ad={topAd} location="HOMEPAGE" format="auto" />
        </div>
      )}

      {/* Quick Tag Filter Bar */}
      {allTags.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-wrap items-center gap-2 py-1">
            <span className="text-xs text-[var(--muted-foreground)] font-medium mr-1">Topics:</span>
            <Link
              href="/articles"
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                !tag
                  ? "bg-amber-500 text-neutral-950 shadow-sm"
                  : "bg-[var(--card)] hover:bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)]"
              }`}
            >
              All Articles
            </Link>
            {allTags.map((t) => (
              <Link
                key={t}
                href={`/articles?tag=${encodeURIComponent(t)}`}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  tag === t
                    ? "bg-amber-500 text-neutral-950 shadow-sm"
                    : "bg-[var(--card)] hover:bg-[var(--secondary)] text-[var(--muted-foreground)] border border-[var(--border)] hover:text-[var(--foreground)]"
                }`}
              >
                #{t}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 2. FEATURED ARTICLES (IF NOT FILTERED) */}
      {!tag && featuredArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Featured Highlights</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredArticles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group flex flex-col rounded-2xl border border-amber-500/30 bg-[var(--card)] backdrop-blur-md overflow-hidden hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300"
              >
                {article.thumbnail_url ? (
                  <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                    <img
                      src={article.thumbnail_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                        Featured
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-amber-500/20 via-[var(--secondary)] to-[var(--card)] flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-amber-500/50" />
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col gap-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags?.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[10px] font-semibold text-[var(--foreground)] border border-[var(--border)]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-base font-bold text-[var(--foreground)] group-hover:text-amber-500 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>

                  {article.excerpt && (
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed flex-1">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)] mt-auto">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-amber-500" />
                      {formatDate(article.published_at || article.created_at)}
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-semibold group-hover:translate-x-0.5 transition-transform">
                      <span>Read Story</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. LATEST ARTICLES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
              {tag ? `Articles Tagged #${tag}` : "Latest Publications"}
            </h2>
          </div>

          {tag && (
            <Link
              href="/articles"
              className="text-xs text-amber-500 hover:text-amber-400 font-semibold underline"
            >
              Clear Filter
            </Link>
          )}
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] backdrop-blur-md overflow-hidden hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1 transition-all duration-300"
              >
                {article.thumbnail_url ? (
                  <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                    <img
                      src={article.thumbnail_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-[var(--secondary)] flex items-center justify-center">
                    <Newspaper className="w-10 h-10 text-[var(--muted-foreground)]" />
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col gap-2.5">
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {article.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-semibold border border-amber-500/20"
                        >
                          <Tag className="w-2.5 h-2.5 inline mr-0.5" />
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <h3 className="text-sm font-bold text-[var(--foreground)] group-hover:text-amber-500 transition-colors line-clamp-2 leading-snug flex-1">
                    {article.title}
                  </h3>

                  {article.excerpt && (
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)] mt-auto">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-[var(--muted-foreground)]" />
                      {formatDate(article.published_at || article.created_at)}
                    </span>
                    <span className="flex items-center gap-1 text-amber-500 font-semibold group-hover:translate-x-0.5 transition-transform">
                      <span>Read article</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-16 rounded-3xl border border-[var(--border)] bg-[var(--card)] backdrop-blur-md text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500">
              <Newspaper className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[var(--foreground)]">
              {tag ? `No articles tagged #${tag} yet` : "No Articles Published Yet"}
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed">
              New deep dives, tutorials, and cinema news are in development. Check back soon or visit our{" "}
              <Link href="/movies" className="text-amber-500 hover:underline">
                Cinema Zone
              </Link>{" "}
              or{" "}
              <Link href="/" className="text-amber-500 hover:underline">
                Software Hub
              </Link>
              .
            </p>
          </div>
        )}
      </section>

      {/* Bottom AdSlot (only rendered if active in admin) */}
      {bottomAd && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AdSlot ad={bottomAd} location="FOOTER" format="auto" />
        </div>
      )}
    </div>
  );
}
