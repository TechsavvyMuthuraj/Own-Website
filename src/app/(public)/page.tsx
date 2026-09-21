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
import { createAdminClient } from "@/lib/supabase/admin";
import type { Resource, Category, Wallpaper } from "@/types/database";
import { ResourceGrid } from "@/components/resources/resource-grid";
import { AdSlot } from "@/components/ads/ad-slot";
import { getActiveAd } from "@/lib/ads";
import { FounderProfile } from "@/components/home/founder-profile";
import { HomepageWallpapers } from "@/components/wallpapers/homepage-wallpapers";
import { LiveStatsBar } from "@/components/home/live-stats-bar";
import { InteractivePlatformStrip } from "@/components/home/interactive-platform-strip";
import { FeaturesGrid } from "@/components/home/features-grid";
import { HomepageFaq } from "@/components/home/homepage-faq";
import { ThemeCustomizer } from "@/components/theme/theme-customizer";
import { HeroInteractiveBanner } from "@/components/home/hero-interactive-banner";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "NammaTech - Movies, APKs, Software, AI Tools & Downloads",
  },
};

export const revalidate = 3600; // Cache at edge for 1 hour — dramatically reduces TTFB

export default async function HomePage() {
  const supabase = createAdminClient();

  let featuredResources: Resource[] = [];
  let latestResources: Resource[] = [];
  let categories: Category[] = [];
  let homepageAd: any = null;
  let inFeedAd: any = null;
  let hpSettings: Record<string, any> = {};
  let wallpapers: Wallpaper[] = [];
  let totalResourcesCount = 0;
  let totalCategoriesCount = 0;
  let totalWallpapersCount = 0;
  let totalMoviesCount = 0;

  try {
    const CARD_FIELDS =
      "id, title, slug, short_description, thumbnail_url, icon_url, resource_type, access_type, price, sale_price, currency, platform, version, status, featured, tags, created_at, updated_at, published_at, category_id, category:categories(id, name, slug, icon)";

    // Concurrent queries in parallel for ultra-fast rendering speed
    const [
      adResult,
      inFeedAdResult,
      featuredResult,
      latestResult,
      categoriesResult,
      hpSettingsResult,
      wallpapersResult,
      resCountResult,
      catCountResult,
      wpCountResult,
    ] = await Promise.all([
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
      supabase
        .from("wallpapers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(9),
      supabase
        .from("resources")
        .select("*", { count: "exact", head: true })
        .eq("status", "PUBLISHED"),
      supabase
        .from("categories")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("wallpapers")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
    ]);

    totalResourcesCount = resCountResult?.count ?? 0;
    totalCategoriesCount = catCountResult?.count ?? 0;
    totalWallpapersCount = wpCountResult?.count ?? 0;

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

    if (wallpapersResult.data) {
      wallpapers = wallpapersResult.data as Wallpaper[];
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
    <div className="relative flex flex-col gap-16 py-8 sm:py-12 overflow-hidden">
      {/* Background Ambient Mesh Light */}
      <div className="namma-ambient-mesh" />

      {/* 1. HERO SECTION WITH FOUNDER GRAPHIC */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <HeroInteractiveBanner
          heroImageUrl={heroImageUrl}
          showSearchBar={showSearchBar}
          searchPlaceholder={searchPlaceholder}
        />

        {/* Quick Trending / Quick-Access Pills */}
        {showTrending && (
          <div className="flex items-center gap-2 overflow-x-auto py-3 px-1 text-xs font-semibold text-[var(--foreground)]">
            <span className="text-[var(--muted-foreground)] text-xs flex-shrink-0 font-medium">
              {trendingLabel}
            </span>
            <Link
              href="/movies"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 dark:text-amber-400 whitespace-nowrap transition-all shadow-sm"
            >
              <span>🎬 Movies (Free & 4K VIP)</span>
            </Link>
            <Link
              href="/free"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 whitespace-nowrap transition-all"
            >
              <span>⚡ Free Downloads</span>
            </Link>
            <Link
              href="/premium"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-300 whitespace-nowrap transition-all"
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

      {/* 2. REAL-TIME PLATFORM METRICS COUNTER */}
      <LiveStatsBar
        totalResources={totalResourcesCount}
        totalCategories={totalCategoriesCount}
        totalWallpapers={totalWallpapersCount}
        totalMovies={totalMoviesCount}
      />

      {/* 3. INTERACTIVE ECOSYSTEM & OS NAVIGATOR */}
      <InteractivePlatformStrip />

      {/* 4. CATEGORIES PREVIEW */}
      {showCategories && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
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
                  className="group flex flex-col p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--ring)]/50 hover:bg-[var(--secondary)]/40 transition-all shadow-sm card-hover-lift"
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <AdSlot ad={homepageAd} location="HOMEPAGE" format="auto" />
        </section>
      )}

      {/* 5. FEATURED RESOURCES (IF ANY PUBLISHED) */}
      {showFeatured && featuredResources.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
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

      {/* 6. LATEST RELEASES */}
      {showLatest && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
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

      {/* 7. WHY NAMMATECH - SECURITY & SPEED STANDARDS */}
      <FeaturesGrid />

      {/* IN-FEED AD BANNER */}
      {inFeedAd && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <AdSlot ad={inFeedAd} location="IN_FEED" format="auto" showLabel={false} />
        </section>
      )}

      {/* 8. 4K & ULTRA HD WALLPAPERS SHOWCASE */}
      <HomepageWallpapers wallpapers={wallpapers} />

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <HomepageFaq />

      {/* 10. FOUNDER & LEAD DEVELOPER PROFILE */}
      <FounderProfile settings={hpSettings} />

      {/* 11. FLOATING THEME & FONT CUSTOMIZER */}
      <ThemeCustomizer />
    </div>
  );
}
