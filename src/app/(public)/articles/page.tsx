import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/types/database";
import { Newspaper, Sparkles, ArrowRight, Tag, Calendar, Clock } from "lucide-react";
import type { Metadata } from "next";
import { AdSlot } from "@/components/ads/ad-slot";

export const metadata: Metadata = {
  title: "Articles & News | NammaTech",
  description:
    "Read the latest articles, tech news, cinema updates, and tutorials from NammaTech. Stay informed with curated content from the NammaTech team.",
  openGraph: {
    title: "Articles & News | NammaTech",
    description:
      "Latest articles, tech news, cinema updates, and tutorials from NammaTech.",
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

  try {
    const { data: featuredData } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "PUBLISHED")
      .eq("featured", true)
      .order("published_at", { ascending: false })
      .limit(3);

    if (featuredData) featuredArticles = featuredData as Article[];

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
  } catch (err) {
    console.error("Failed to load articles:", err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
          <Newspaper className="w-3.5 h-3.5" />
          <span>Articles & News</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">
          NammaTech Journal
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-xl mx-auto">
          Tech tutorials, cinema news, software deep-dives, and curated content from the NammaTech team.
        </p>
        {tag && (
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)]">Filtered by:</span>
            <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-bold border border-blue-500/30">
              #{tag}
            </span>
            <Link href="/articles" className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline">
              Clear filter
            </Link>
          </div>
        )}
      </section>

      {!tag && featuredArticles.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-lg font-bold text-[var(--foreground)]">Featured</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredArticles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-amber-500/40 hover:shadow-xl transition-all"
              >
                {article.thumbnail_url ? (
                  <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                    <img
                      src={article.thumbnail_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-black uppercase">
                        Featured
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <Newspaper className="w-12 h-12 text-blue-400/50" />
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags?.slice(0, 2).map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[10px] font-semibold text-[var(--muted-foreground)]">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-sm font-bold text-[var(--foreground)] group-hover:text-amber-500 transition-colors line-clamp-2 flex-1">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">{article.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-[var(--muted-foreground)] pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(article.published_at || article.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {estimateReadTime(article.content)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <AdSlot location="HOMEPAGE" format="auto" slotId="6779758190" />

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            {tag ? `Articles tagged #${tag}` : "Latest Articles"}
          </h2>
        </div>
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-blue-500/30 hover:shadow-lg transition-all"
              >
                {article.thumbnail_url ? (
                  <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                    <img
                      src={article.thumbnail_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-[var(--secondary)] to-[var(--border)] flex items-center justify-center">
                    <Newspaper className="w-10 h-10 text-[var(--muted-foreground)]/40" />
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col gap-2">
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {article.tags.slice(0, 2).map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-semibold border border-blue-500/20">
                          <Tag className="w-2.5 h-2.5 inline mr-0.5" />{t}
                        </span>
                      ))}
                    </div>
                  )}
                  <h3 className="text-sm font-bold text-[var(--foreground)] group-hover:text-blue-400 transition-colors line-clamp-2 flex-1">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">{article.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)] pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(article.published_at || article.created_at)}
                    </span>
                    <span className="flex items-center gap-1 text-blue-400 font-semibold">
                      <span>Read article</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-16 rounded-2xl border border-dashed border-[var(--border)] text-center space-y-3">
            <Newspaper className="w-12 h-12 text-[var(--muted-foreground)]/40 mx-auto" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              {tag ? `No articles tagged #${tag} yet` : "No Articles Published Yet"}
            </h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Check back soon — the NammaTech team is working on great content!
            </p>
          </div>
        )}
      </section>

      <AdSlot location="FOOTER" format="auto" slotId="2029994396" />
    </div>
  );
}
