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
import { AdsterraBanner } from "@/components/ads/AdsterraBanner";
import { AdsterraNative } from "@/components/ads/AdsterraNative";
import { AdsterraSmartLink } from "@/components/ads/AdsterraSmartLink";
import { getActiveAd } from "@/lib/ads";
import { FounderProfile } from "@/components/home/founder-profile";
import { FeaturesGrid } from "@/components/home/features-grid";
import { YouTubeShowcase } from "@/components/home/youtube-showcase";
import { HeroInteractiveBanner } from "@/components/home/hero-interactive-banner";
import { CinemaShowcase } from "@/components/home/cinema-showcase";
import { ArticlesShowcase } from "@/components/home/articles-showcase";
import { CommunityBanner } from "@/components/home/community-banner";
import { ALL_SEO_KEYWORDS } from "@/config/seo-keywords";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "NammaTech | Movies, APKs, Software, Free Downloads & Community Hub",
  },
  description:
    "Welcome to NammaTech — Download verified open-source software, Android APKs, developer tools, 4K cinema releases, micro dramas, study notes, and join our tech community.",
  keywords: ALL_SEO_KEYWORDS,
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
        name: "What is NammaTech?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NammaTech is the premier digital platform founded by Muthuraj C (Techsavvy Muthuraj), delivering verified open-source software, free files download, Android APKs, 4K movies, micro dramas, technical study notes, and real-time community support.",
        },
      },
      {
        "@type": "Question",
        name: "How do I get NammaTech free files download and software?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can download verified software, tools, and free files directly through the NammaTech downloads center. All files undergo strict automated hash verification, sandbox testing, and malware scanning.",
        },
      },
      {
        "@type": "Question",
        name: "Where can I watch or download NammaTech Movies and Micro Dramas?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NammaTech features a dedicated Cinema & Micro Drama Hub offering high-definition 4K streaming and direct download links for movies, short films, and episodic micro drama series.",
        },
      },
      {
        "@type": "Question",
        name: "Does NammaTech offer study notes and developer interview guides?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, NammaTech provides comprehensive computer science study notes, engineering tutorials, DSA cheat sheets, and technical interview preparation notes for students and developers.",
        },
      },
      {
        "@type": "Question",
        name: "How do I contact NammaTech live support and join the community chat?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We offer real-time live chat assistance on our Technical Support page, along with WhatsApp and phone support at +91 99448 75726. You can also join our developer community to discuss projects and collaborate.",
        },
      },
      {
        "@type": "Question",
        name: "Who is the founder of NammaTech?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NammaTech was founded by Muthuraj C (popularly known as Techsavvy Muthuraj), a software developer, digital architect, and tech creator passionate about building transparent, secure digital infrastructure.",
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
      {homepageAd ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <AdSlot ad={homepageAd} location="HOMEPAGE" format="auto" />
        </section>
      ) : (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <AdsterraBanner placement="homepage" format="responsive" linkType={1} />
        </section>
      )}

      {/* 2. THEATRICAL CINEMA & 4K MASTER PRINTS */}
      {movieResources.length > 0 && (
        <div className="cv-auto">
          <CinemaShowcase movies={movieResources} />
        </div>
      )}

      {/* 3. NAMMATECH JOURNAL & TECH GUIDES */}
      {articleItems.length > 0 && (
        <div className="cv-auto">
          <ArticlesShowcase articles={articleItems} />
        </div>
      )}

      {/* 4. REAL-TIME COMMUNITY & LIVE WEBRTC STAGE */}
      <div className="cv-auto">
        <CommunityBanner />
      </div>

      {/* 5. FEATURED RESOURCES (IF ANY PUBLISHED) */}
      {showFeatured && featuredResources.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 cv-auto">
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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 cv-auto">
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

      {/* ADSTERRA NATIVE IN-FEED UNIT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 cv-auto">
        <AdsterraNative placement="homepage" linkType={2} />
      </section>

      {/* 7. WHY NAMMATECH - SECURITY & SPEED STANDARDS */}
      <div className="cv-auto">
        <FeaturesGrid />
      </div>

      {/* IN-FEED AD BANNER */}
      {inFeedAd && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 cv-auto">
          <AdSlot ad={inFeedAd} location="IN_FEED" format="auto" showLabel={false} />
        </section>
      )}

      {/* 8. YOUTUBE CHANNEL SHOWCASE */}
      <div className="cv-auto">
        <YouTubeShowcase settings={hpSettings} />
      </div>

      {/* 9. SPONSORED PARTNER DISCOVERY (CLEARLY IDENTIFIED) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 cv-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-neutral-900/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Sponsored
            </span>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">
              Discover verified developer resources &amp; cloud utilities from our monetization partners.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <AdsterraSmartLink linkType={1} variant="secondary">
              Recommended Utilities
            </AdsterraSmartLink>
            <AdsterraSmartLink linkType={2} variant="secondary">
              Developer Offers
            </AdsterraSmartLink>
            <AdsterraSmartLink linkType={3} variant="secondary">
              Partner Cloud Deals
            </AdsterraSmartLink>
          </div>
        </div>
      </section>

      {/* 10. FOUNDER & LEAD DEVELOPER PROFILE */}
      <div className="cv-auto">
        <FounderProfile settings={hpSettings} />
      </div>
    </div>
  );
}
