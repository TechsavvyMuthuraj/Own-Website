"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2, ArrowRight, Film, Newspaper, Layers, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { ResourceVisual } from "@/components/resources/resource-visual";
import { VoiceSearchButton } from "@/components/search/voice-search-button";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVoiceActive?: boolean;
}

export type UnifiedSearchResult = {
  id: string;
  type: "resource" | "movie" | "article";
  title: string;
  slug: string;
  subtitle?: string | null;
  thumbnail_url?: string | null;
  badge?: string;
  href: string;
  extraMeta?: string;
};

export function SearchModal({ isOpen, onClose, initialVoiceActive = false }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "resource" | "movie" | "article">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const [isClosing, setIsClosing] = useState(false);

  const handleAnimatedClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 190);
  };

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setTimeout(() => inputRef.current?.focus(), 60);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setDebouncedQuery("");
      setActiveTab("all");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, initialVoiceActive]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) handleAnimatedClose();
      }
      if (e.key === "Escape" && isOpen) {
        handleAnimatedClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Debounce user input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 200);
    return () => clearTimeout(handler);
  }, [query]);

  // TanStack Query for Universal Search (Resources, Movies, Articles)
  const { data: searchData = { all: [], resources: [], movies: [], articles: [] }, isFetching: loading } =
    useQuery({
      queryKey: ["universal-search-modal", debouncedQuery],
      queryFn: async () => {
        if (!debouncedQuery) {
          return { all: [], resources: [], movies: [], articles: [] };
        }

        const safeQuery = `%${debouncedQuery}%`;

        // 1. Query resources (Software, APKs, Tools, and Movies)
        const resourcesPromise = supabase
          .from("resources")
          .select(
            "id, title, slug, short_description, thumbnail_url, icon_url, access_type, price, platform, category:categories(name, slug)"
          )
          .eq("status", "PUBLISHED")
          .ilike("title", safeQuery)
          .limit(10);

        // 2. Query articles (Journal, Guides, Tutorials)
        const articlesPromise = supabase
          .from("articles")
          .select("id, title, slug, excerpt, thumbnail_url, published_at")
          .eq("status", "PUBLISHED")
          .ilike("title", safeQuery)
          .limit(6);

        const [resResults, artResults] = await Promise.all([resourcesPromise, articlesPromise]);

        const rawResources = resResults.data || [];
        const rawArticles = artResults.data || [];

        const formattedResources: UnifiedSearchResult[] = [];
        const formattedMovies: UnifiedSearchResult[] = [];

        rawResources.forEach((item: any) => {
          const categoryObj = Array.isArray(item.category) ? item.category[0] : item.category;
          const isMovie = categoryObj?.slug === "movies" || categoryObj?.name?.toLowerCase().includes("movie");

          if (isMovie) {
            formattedMovies.push({
              id: item.id,
              type: "movie",
              title: item.title,
              slug: item.slug,
              subtitle: item.short_description || "Blockbuster Cinema • Multiple Quality Links",
              thumbnail_url: item.thumbnail_url,
              badge: "CINEMA 4K",
              href: `/movies/${item.slug}`,
              extraMeta: item.platform || "480p / 720p / 1080p / 4K",
            });
          } else {
            formattedResources.push({
              id: item.id,
              type: "resource",
              title: item.title,
              slug: item.slug,
              subtitle: item.short_description || categoryObj?.name || "Software & Tools",
              thumbnail_url: item.thumbnail_url || item.icon_url,
              badge: item.access_type === "PAID" ? "VIP" : "FREE",
              href: `/resource/${item.slug}`,
              extraMeta: item.platform || categoryObj?.name,
            });
          }
        });

        const formattedArticles: UnifiedSearchResult[] = rawArticles.map((art: any) => ({
          id: art.id,
          type: "article",
          title: art.title,
          slug: art.slug,
          subtitle: art.excerpt || "Tech Journal & Guide",
          thumbnail_url: art.thumbnail_url,
          badge: "ARTICLE",
          href: `/articles/${art.slug}`,
          extraMeta: art.published_at ? new Date(art.published_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Journal",
        }));

        const allCombined: UnifiedSearchResult[] = [
          ...formattedResources,
          ...formattedMovies,
          ...formattedArticles,
        ];

        return {
          all: allCombined,
          resources: formattedResources,
          movies: formattedMovies,
          articles: formattedArticles,
        };
      },
      enabled: debouncedQuery.length > 0,
      staleTime: 3 * 60 * 1000,
    });

  const displayedResults =
    activeTab === "all"
      ? searchData.all
      : activeTab === "resource"
      ? searchData.resources
      : activeTab === "movie"
      ? searchData.movies
      : searchData.articles;

  if (!isOpen) return null;

  return (
    <div
      onClick={handleAnimatedClose}
      className={`fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-4 bg-black/75 backdrop-blur-md transition-opacity duration-200 ${
        isClosing ? "opacity-0" : "animate-in fade-in duration-200"
      }`}
    >
      <div
        className={`relative w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--card)]/95 dark:bg-[#0b0b10]/95 shadow-[0_24px_64px_rgba(0,0,0,0.6)] backdrop-blur-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all duration-200 ${
          isClosing ? "animate-popup-exit" : "animate-popup-enter"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar with Integrated Voice Search */}
        <div className="flex items-center px-3.5 sm:px-4 py-3 border-b border-[var(--border)] gap-2.5 bg-black/[0.02] dark:bg-white/[0.02]">
          <Search className="w-5 h-5 text-[var(--muted-foreground)] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            id="global-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search software, tools, 4K movies, articles, guides..."
            className="flex-1 bg-transparent text-sm sm:text-base text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none"
          />

          {loading && <Loader2 className="w-4 h-4 text-[var(--primary)] animate-spin flex-shrink-0" />}

          {/* Voice Search Button */}
          <VoiceSearchButton
            onTranscript={(transcript) => {
              setQuery(transcript);
              setDebouncedQuery(transcript);
            }}
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[var(--muted-foreground)] bg-[var(--secondary)] rounded border border-[var(--border)]">
            ESC
          </kbd>
        </div>

        {/* Filter Category Tabs (Visible when query is present) */}
        {query.trim() !== "" && (
          <div className="flex items-center gap-1.5 px-3.5 py-2 border-b border-[var(--border)]/60 bg-[var(--secondary)]/30 overflow-x-auto no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-2.5 py-1 rounded-full font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-amber-500 text-black shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              All ({searchData.all.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("resource")}
              className={`px-2.5 py-1 rounded-full font-semibold transition-all flex items-center gap-1 ${
                activeTab === "resource"
                  ? "bg-amber-500 text-black shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Layers className="w-3 h-3" />
              Apps & Tools ({searchData.resources.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("movie")}
              className={`px-2.5 py-1 rounded-full font-semibold transition-all flex items-center gap-1 ${
                activeTab === "movie"
                  ? "bg-amber-500 text-black shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Film className="w-3 h-3" />
              Cinema ({searchData.movies.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("article")}
              className={`px-2.5 py-1 rounded-full font-semibold transition-all flex items-center gap-1 ${
                activeTab === "article"
                  ? "bg-amber-500 text-black shadow-xs"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Newspaper className="w-3 h-3" />
              Articles ({searchData.articles.length})
            </button>
          </div>
        )}

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 divide-y divide-[var(--border)]/30">
          {query.trim() === "" ? (
            <div className="p-8 text-center space-y-3">
              <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Universal Instant Search
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-sm mx-auto">
                  Type or tap the mic icon to voice search in English or Tamil. Searches software tools, 4K movies, and journal tutorials.
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="p-8 text-center text-xs text-[var(--muted-foreground)] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              Searching real-time database across software, cinema & articles...
            </div>
          ) : displayedResults.length > 0 ? (
            <div className="space-y-1">
              {displayedResults.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 group border border-transparent hover:border-black/5 dark:hover:border-white/10"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Visual Icon / Poster Thumbnail */}
                    <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 flex-shrink-0 flex items-center justify-center">
                      {item.thumbnail_url ? (
                        <Image
                          src={item.thumbnail_url}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="44px"
                        />
                      ) : item.type === "movie" ? (
                        <Film className="w-5 h-5 text-amber-500" />
                      ) : item.type === "article" ? (
                        <Newspaper className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Layers className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-[var(--foreground)] group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors truncate">
                          {item.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--muted-foreground)] mt-0.5 truncate">
                        {item.extraMeta && <span>{item.extraMeta}</span>}
                        {item.subtitle && (
                          <>
                            <span>•</span>
                            <span className="truncate">{item.subtitle}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badge & Arrow */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                          item.badge === "CINEMA 4K"
                            ? "bg-rose-500/15 text-rose-500 border-rose-500/30"
                            : item.badge === "ARTICLE"
                            ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                            : item.badge === "VIP"
                            ? "bg-amber-500/15 text-amber-500 border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-[var(--foreground)] mb-1">
                No matching results found for &quot;{query}&quot;
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Try checking for typos or searching by broader keywords.
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Voice & Text Live Search</span>
          </div>
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={onClose}
            className="text-amber-500 dark:text-amber-400 hover:underline font-medium"
          >
            Explore all matching content
          </Link>
        </div>
      </div>
    </div>
  );
}
