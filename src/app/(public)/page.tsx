import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  Search,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Cpu,
  Smartphone,
  Monitor,
  Code,
  FileText,
  Shapes,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Resource, Category } from "@/types/database";
import { ResourceGrid } from "@/components/resources/resource-grid";
import { AdSlot } from "@/components/ads/ad-slot";
import { getActiveAd } from "@/lib/ads";
import { FounderProfile } from "@/components/home/founder-profile";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "NammaTech - Movies, APKs, Software, AI Tools & Downloads",
  },
};

export const revalidate = 3600; // Cache at edge for 1 hour — dramatically reduces TTFB

export default async function HomePage() {
  const supabase = await createClient();

  let featuredResources: Resource[] = [];
  let latestResources: Resource[] = [];
  let categories: Category[] = [];
  let homepageAd: any = null;
  let inFeedAd: any = null;
  let hpSettings: Record<string, any> = {};

  try {
    const CARD_FIELDS =
      "id, title, slug, short_description, thumbnail_url, icon_url, resource_type, access_type, price, sale_price, currency, platform, version, status, featured, tags, created_at, updated_at, published_at, category_id, category:categories(id, name, slug, icon)";

    // Concurrent queries in parallel for ultra-fast rendering speed
    const [adResult, inFeedAdResult, featuredResult, latestResult, categoriesResult, hpSettingsResult] = await Promise.all([
      getActiveAd("HOMEPAGE"),
      getActiveAd("IN_FEED"),
      supabase
        .from("resources")
        .select(CARD_FIELDS)
        .eq("status", "PUBLISHED")
        .eq("featured", true)
        .order("published_at", { ascending: false })
        .limit(4),
      supabase
        .from("resources")
        .select(CARD_FIELDS)
        .eq("status", "PUBLISHED")
        .order("published_at", { ascending: false })
        .limit(8),
      supabase
        .from("categories")
        .select("id, name, slug, icon, description, sort_order, is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(8),
      supabase
        .from("site_settings")
        .select("value")
        .eq("key", "homepage_settings")
        .maybeSingle(),
    ]);

    if (hpSettingsResult?.data?.value) {
      try {
        hpSettings =
          typeof hpSettingsResult.data.value === "string"
            ? JSON.parse(hpSettingsResult.data.value)
            : hpSettingsResult.data.value;
      } catch {
        hpSettings = {};
      }
    }

    homepageAd = hpSettings.show_homepage_ad !== false ? adResult : null;
    inFeedAd = hpSettings.show_in_feed_ad !== false ? inFeedAdResult : null;

    const isMovie = (item: any) => {
      if (item.category?.slug === "movies") return true;
      const tags = Array.isArray(item.tags) ? item.tags.map((t: string) => String(t).toLowerCase()) : [];
      return tags.includes("movie") || tags.includes("movies") || tags.includes("cinema");
    };

    if (featuredResult.data) {
      featuredResources = (featuredResult.data as unknown[])
        .map((item: any) => ({
          ...item,
          category: Array.isArray(item.category) ? item.category[0] : item.category,
        }))
        .filter((item: any) => !isMovie(item)) as Resource[];
    }

    if (latestResult.data) {
      latestResources = (latestResult.data as unknown[])
        .map((item: any) => ({
          ...item,
          category: Array.isArray(item.category) ? item.category[0] : item.category,
        }))
        .filter((item: any) => !isMovie(item)) as Resource[];
    }

    if (categoriesResult.data) {
      categories = (categoriesResult.data as Category[]).filter(
        (cat) => cat.slug !== "movies"
      );
    }
  } catch (error) {
    console.error("Failed to load homepage resources from database:", error);
  }

  const categoryIcons: Record<string, React.ReactNode> = {
    apk: <Smartphone className="w-5 h-5 text-emerald-500" />,
    "pc-software": <Monitor className="w-5 h-5 text-blue-500" />,
    "developer-tools": <Code className="w-5 h-5 text-purple-500" />,
    "ai-tools": <Cpu className="w-5 h-5 text-cyan-500" />,
    templates: <FileText className="w-5 h-5 text-amber-500" />,
    icons: <Shapes className="w-5 h-5 text-rose-500" />,
  };

  const heroImageUrl = hpSettings.hero_image_url || "/images/hero-clean.png";
  const showSearchBar = hpSettings.show_search_bar !== false;
  const searchPlaceholder =
    hpSettings.search_placeholder ||
    "Search software, movies, tools, APKs, templates...";
  const showTrending = hpSettings.show_trending !== false;
  const trendingLabel = hpSettings.trending_label || "Trending:";
  const showCategories = hpSettings.show_categories !== false;
  const categoriesTitle = hpSettings.categories_title || "Browse by Category";
  const categoriesSubtitle =
    hpSettings.categories_subtitle ||
    "Find exactly what you need across organized classifications.";
  const showFeatured = hpSettings.show_featured !== false;
  const featuredTitle = hpSettings.featured_title || "Featured Resources";
  const featuredSubtitle =
    hpSettings.featured_subtitle ||
    "Hand-picked, high quality digital assets and software.";
  const showLatest = hpSettings.show_latest !== false;
  const latestTitle = hpSettings.latest_title || "Latest Additions";
  const latestSubtitle =
    hpSettings.latest_subtitle ||
    "Recently verified releases, updates, and open-source packages.";

  return (
    <div className="flex flex-col gap-16 py-8 sm:py-12">
      {/* 1. HERO SECTION WITH FOUNDER GRAPHIC */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-neutral-950 shadow-2xl">
          {/* Full resolution graphic banner */}
          <div className="relative w-full aspect-[1983/793]">
            <Image
              src={heroImageUrl}
              alt="NammaTech - Everything You Need In One Place. Founder Muthuraj"
              fill
              priority
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 1200px, 1280px"
              className="object-cover object-center select-none"
            />

            {/* Desktop Interactive Search Overlay positioned at reference x: 17.2%, y: 89.5% */}
            {showSearchBar && (
              <div
                className="hidden md:flex flex-col justify-center absolute z-10"
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
                      className="w-full py-3.5 pl-12 pr-28 rounded-full bg-black/70 hover:bg-black/85 focus:bg-neutral-950 text-white placeholder-neutral-300 text-xs sm:text-sm font-medium border-2 border-amber-500/50 focus:border-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/30 transition-all backdrop-blur-md"
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

        {/* Quick Trending / Quick-Access Pills */}
        {showTrending && (
          <div className="flex items-center gap-2 overflow-x-auto py-3 px-1 text-xs font-semibold text-neutral-300">
            <span className="text-[var(--muted-foreground)] text-xs flex-shrink-0 font-medium">
              {trendingLabel}
            </span>
            <Link
              href="/movies"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 whitespace-nowrap transition-all shadow-sm"
            >
              <span>🎬 Movies (Free & 4K VIP)</span>
            </Link>
            <Link
              href="/free"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 whitespace-nowrap transition-all"
            >
              <span>⚡ Free Downloads</span>
            </Link>
            <Link
              href="/premium"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 whitespace-nowrap transition-all"
            >
              <span>👑 VIP Premium</span>
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--foreground)] border border-[var(--border)] whitespace-nowrap transition-all"
            >
              <span>📱 APKs & Software</span>
            </Link>
          </div>
        )}
      </section>

      {/* 2. CATEGORIES PREVIEW */}
      {showCategories && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
                {categoriesTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                {categoriesSubtitle}
              </p>
            </div>
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group flex flex-col p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--ring)]/50 hover:bg-[var(--secondary)]/40 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    {categoryIcons[cat.slug] || <Layers className="w-5 h-5 text-[var(--primary)]" />}
                  </div>
                  <h3 className="font-semibold text-sm text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mt-0.5">
                    {cat.description || "Verified resources"}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-center">
              <p className="text-sm text-[var(--muted-foreground)]">
                No categories published yet. Check back soon or visit the admin console.
              </p>
            </div>
          )}
        </section>
      )}

      {/* HOMEPAGE FEATURE AD BANNER */}
      {homepageAd && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AdSlot ad={homepageAd} location="HOMEPAGE" format="auto" />
        </section>
      )}

      {/* 3. FEATURED RESOURCES (IF ANY PUBLISHED) */}
      {showFeatured && featuredResources.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
                  {featuredTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                  {featuredSubtitle}
                </p>
              </div>
            </div>
          </div>
          <ResourceGrid resources={featuredResources} />
        </section>
      )}

      {/* 4. LATEST RELEASES */}
      {showLatest && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
                {latestTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                {latestSubtitle}
              </p>
            </div>
            <Link
              href="/new-and-updated"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              <span>See new & updated</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <ResourceGrid
            resources={latestResources}
            emptyTitle="Welcome to NammaTech"
            emptyDescription="Verified resources are currently being prepared and curated. Explore categories or check back soon."
            emptyActionText="Explore Categories"
            emptyActionHref="/categories"
          />
        </section>
      )}

      {/* IN-FEED AD BANNER */}
      {inFeedAd && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AdSlot ad={inFeedAd} location="IN_FEED" format="auto" showLabel={false} />
        </section>
      )}

      {/* 5. FOUNDER & LEAD DEVELOPER PROFILE */}
      <FounderProfile settings={hpSettings} />
    </div>
  );
}
