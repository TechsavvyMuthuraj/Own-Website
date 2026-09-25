import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Resource, Article } from "@/types/database";
import { SearchPageInput } from "@/components/search/search-page-input";
import { SearchResultsView } from "@/components/search/search-results-view";
import type { Metadata } from "next";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = (q || "").trim();
  return {
    title: query ? `Search results for "${query}" | NammaTech` : "Universal Voice & Text Search | NammaTech",
    description: `Search verified software tools, 4K cinema releases, and technical articles for "${query || "NammaTech"}".`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const searchQuery = (q || "").trim();
  const supabase = await createClient();

  let softwareResults: Resource[] = [];
  let movieResults: Resource[] = [];
  let articleResults: Article[] = [];

  if (searchQuery) {
    try {
      const CARD_FIELDS =
        "id, title, slug, short_description, thumbnail_url, icon_url, resource_type, access_type, price, sale_price, currency, platform, version, status, featured, tags, created_at, updated_at, published_at, category_id, category:categories(id, name, slug, icon)";

      const safeQuery = `%${searchQuery}%`;

      // Parallel queries across resources and articles
      const [resourcesRes, articlesRes] = await Promise.all([
        supabase
          .from("resources")
          .select(CARD_FIELDS)
          .eq("status", "PUBLISHED")
          .or(`title.ilike.${safeQuery},short_description.ilike.${safeQuery},developer.ilike.${safeQuery},platform.ilike.${safeQuery}`)
          .order("published_at", { ascending: false })
          .limit(30),
        supabase
          .from("articles")
          .select("id, title, slug, excerpt, thumbnail_url, published_at, author_id")
          .eq("status", "PUBLISHED")
          .or(`title.ilike.${safeQuery},excerpt.ilike.${safeQuery}`)
          .order("published_at", { ascending: false })
          .limit(12),
      ]);

      if (resourcesRes.data) {
        const rawResources = (resourcesRes.data as unknown[]).map((item: any) => ({
          ...item,
          category: Array.isArray(item.category) ? item.category[0] : item.category,
        })) as Resource[];

        rawResources.forEach((item) => {
          const isMovie =
            item.category?.slug === "movies" ||
            item.category?.name?.toLowerCase().includes("movie") ||
            (Array.isArray(item.tags) && item.tags.some((t: string) => String(t).toLowerCase().includes("movie")));

          if (isMovie) {
            movieResults.push(item);
          } else {
            softwareResults.push(item);
          }
        });
      }

      if (articlesRes.data) {
        articleResults = articlesRes.data as unknown as Article[];
      }
    } catch (err) {
      console.error("Search query execution error:", err);
    }
  }

  const totalFound = softwareResults.length + movieResults.length + articleResults.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
      {/* Top Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to directory</span>
        </Link>
        <span className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Unified Real-time Search
        </span>
      </div>

      {/* Main Page Title */}
      <div className="text-center max-w-xl mx-auto space-y-2 mb-2">
        <h1 className="text-2xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">
          {searchQuery ? `Results for "${searchQuery}"` : "Universal Voice & Text Search"}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
          {searchQuery
            ? `Found ${totalFound} matching ${totalFound === 1 ? "result" : "results"} across software, cinema & articles.`
            : "Search through verified software, tools, 4K movies, and technical articles."}
        </p>
      </div>

      {/* Search Bar with integrated Voice Search button */}
      <SearchPageInput initialQuery={searchQuery} />

      {/* Results View */}
      {searchQuery ? (
        <SearchResultsView
          query={searchQuery}
          resources={softwareResults}
          movies={movieResults}
          articles={articleResults}
        />
      ) : (
        <div className="p-12 text-center rounded-3xl border border-black/10 dark:border-white/10 bg-[var(--card)]/60 backdrop-blur-xl max-w-lg mx-auto space-y-2">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Ready to explore?
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Type keywords or tap the mic icon to voice search in English or Tamil.
          </p>
        </div>
      )}
    </div>
  );
}
