import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  Cpu,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Resource, Article } from "@/types/database";
import { ResourceGrid } from "@/components/resources/resource-grid";
import { AdSlot } from "@/components/ads/ad-slot";
import { getActiveAd } from "@/lib/ads";
import { FounderProfile } from "@/components/home/founder-profile";
import { FeaturesGrid } from "@/components/home/features-grid";
import { YouTubeShowcase } from "@/components/home/youtube-showcase";
import { HeroInteractiveBanner } from "@/components/home/hero-interactive-banner";
import { CinemaShowcase } from "@/components/home/cinema-showcase";
import { ArticlesShowcase } from "@/components/home/articles-showcase";
import { CommunityBanner } from "@/components/home/community-banner";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "NammaTech - Techsavvy Muthuraj | Movies, APKs, Software, AI Tools & Free Downloads",
  },
  description:
    "Official technology platform by Techsavvy Muthuraj (Muthuraj C). Download verified open-source software, Android APKs, developer tools, AI utilities, and 4K cinema releases. 100% safe, fast, and malware-free.",
  keywords: [
    "Techsavvy Muthuraj",
    "techsavvymuthuraj",
    "NammaTech",
    "Muthuraj C",
    "Tamil tech website",
    "Free software download",
    "Android APK downloads safe",
    "Tamil movies 4K download",
    "Developer tools free",
    "Open-source software",
    "Freeware utilities download",
    "Safe software downloads malware free",
    "Tech support online live chat",
  ],
  alternates: {
    canonical: "https://www.techsavvymuthuraj.dev",
  },
};

export const revalidate = 3600; // Cache at edge for 1 hour — dramatically reduces TTFB

export default async function HomePage() {
  const supabase = createAdminClient();

  let featuredResources: Resource[] = [];
  let latestResources: Resource[] = [];
  let movieResources: Resource[] = [];
  let articleItems: Article[] = [];
  let homepageAd: any = null;
  let inFeedAd: any = null;
  let hpSettings: Record<string, any> = {};

  try {
    const CARD_FIELDS =
      "id, title, slug, short_description, thumbnail_url, icon_url, resource_type, access_type, price, sale_price, currency, platform, version, status, featured, tags, created_at, updated_at, published_at, category_id, category:categories(id, name, slug, icon)";

    // Concurrent queries in parallel for ultra-fast rendering speed
    const [
      adResult,
      inFeedAdResult,
      featuredResult,
      latestResult,
      movieCatResult,
      articlesResult,
      hpSettingsResult,
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
        .limit(16),
      supabase
        .from("categories")
        .select("id")
        .eq("slug", "movies")
        .maybeSingle(),
      supabase
        .from("articles")
        .select("id, title, slug, excerpt, thumbnail_url, published_at, author_id")
        .eq("status", "PUBLISHED")
        .order("published_at", { ascending: false })
        .limit(3),
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

    const movieCatId = movieCatResult?.data?.id;

    const isMovie = (item: any) => {
      if (movieCatId && item.category_id === movieCatId) return true;
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
      const allItems = (latestResult.data as unknown[]).map((item: any) => ({
        ...item,
        category: Array.isArray(item.category) ? item.category[0] : item.category,
      })) as Resource[];

      movieResources = allItems.filter((item: any) => isMovie(item)).slice(0, 4);
      latestResources = allItems.filter((item: any) => !isMovie(item)).slice(0, 8);
    }

    if (articlesResult?.data) {
      articleItems = articlesResult.data as unknown as Article[];
    }
  } catch (error) {
    console.error("Failed to load homepage resources from database:", error);
  }


  const heroImageUrl = hpSettings.hero_image_url || "/images/hero-clean.webp";
  const showSearchBar = hpSettings.show_search_bar !== false;
  const searchPlaceholder =
    hpSettings.search_placeholder ||
    "Search software, movies, tools, APKs, templates...";
  const showTrending = hpSettings.show_trending !== false;
  const trendingLabel = hpSettings.trending_label || "Trending:";

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

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is NammaTech by Techsavvy Muthuraj?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NammaTech is a premier digital technology platform founded by Techsavvy Muthuraj (Muthuraj C), providing verified open-source software, freeware utilities, Android APKs, developer tools, and high-definition 4K cinema releases.",
        },
      },
      {
        "@type": "Question",
        name: "Are downloads on NammaTech safe and virus-free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, 100%. Every single software package, tool, and APK hosted on NammaTech undergoes strict automated hash verification, sandbox testing, and malware scanning before being published.",
        },
      },
      {
        "@type": "Question",
        name: "Can I request custom software, games, or movies?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can submit software, game, and movie requests directly through the Request portal or connect with our engineering team via Live Technical Support.",
        },
      },
      {
        "@type": "Question",
        name: "How can I contact technical support for installation issues?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We offer real-time live chat assistance on our Technical Support page, along with WhatsApp and phone support at +91 99448 75726.",
        },
      },
      {
        "@type": "Question",
        name: "Is NammaTech free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, the vast majority of resources, software, open-source utilities, and articles on NammaTech are 100% free with direct high-speed download links.",
        },
      },
    ],
  };

  return (
    <div className="relative flex flex-col gap-16 py-8 sm:py-12 overflow-hidden">
      {/* FAQ Schema.org JSON-LD for rich Google Search results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

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

      {/* HOMEPAGE FEATURE AD BANNER */}
      {homepageAd && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <AdSlot ad={homepageAd} location="HOMEPAGE" format="auto" />
        </section>
      )}

      {/* 2. THEATRICAL CINEMA & 4K MASTER PRINTS */}
      {movieResources.length > 0 && (
        <CinemaShowcase movies={movieResources} />
      )}

      {/* 3. NAMMATECH JOURNAL & TECH GUIDES */}
      {articleItems.length > 0 && (
        <ArticlesShowcase articles={articleItems} />
      )}

      {/* 4. REAL-TIME COMMUNITY & LIVE WEBRTC STAGE */}
      <CommunityBanner />

      {/* 5. FEATURED RESOURCES (IF ANY PUBLISHED) */}
      {showFeatured && featuredResources.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="flex items-center justify-between mb-7">
            <div>
              <div className="eyebrow-pill bg-amber-500/10 text-amber-500 border-amber-500/30 mb-2">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Curated Selection</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
                {featuredTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1 max-w-lg leading-relaxed">
                {featuredSubtitle}
              </p>
            </div>
          </div>
          <ResourceGrid resources={featuredResources} />
        </section>
      )}

      {/* 6. LATEST RELEASES */}
      {showLatest && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
            <div>
              <div className="eyebrow-pill bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                <span>Recent Releases</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
                {latestTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1 max-w-lg leading-relaxed">
                {latestSubtitle}
              </p>
            </div>
            <Link
              href="/new-and-updated"
              className="inline-flex items-center gap-2 pl-3.5 pr-1.5 py-1.5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-bold text-[var(--foreground)] transition-all group self-start sm:self-auto shadow-xs active:scale-95"
            >
              <span>See All Updates</span>
              <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-neutral-950 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
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

      {/* 8. YOUTUBE CHANNEL SHOWCASE */}
      <YouTubeShowcase settings={hpSettings} />

      {/* 10. FOUNDER & LEAD DEVELOPER PROFILE */}
      <FounderProfile settings={hpSettings} />
    </div>
  );
}
