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

export const revalidate = 60; // Cache revalidation every 60s

export default async function HomePage() {
  const supabase = await createClient();

  let featuredResources: Resource[] = [];
  let latestResources: Resource[] = [];
  let categories: Category[] = [];
  let homepageAd: any = null;

  try {
    // Concurrent queries in parallel for ultra-fast rendering speed
    const [adResult, featuredResult, latestResult, categoriesResult] = await Promise.all([
      getActiveAd("HOMEPAGE"),
      supabase
        .from("resources")
        .select("*, category:categories(*)")
        .eq("status", "PUBLISHED")
        .eq("featured", true)
        .order("published_at", { ascending: false })
        .limit(4),
      supabase
        .from("resources")
        .select("*, category:categories(*)")
        .eq("status", "PUBLISHED")
        .order("published_at", { ascending: false })
        .limit(8),
      supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(8),
    ]);

    homepageAd = adResult;

    if (featuredResult.data) {
      featuredResources = (featuredResult.data as unknown[]).map((item: any) => ({
        ...item,
        category: Array.isArray(item.category) ? item.category[0] : item.category,
      })) as Resource[];
    }

    if (latestResult.data) {
      latestResources = (latestResult.data as unknown[]).map((item: any) => ({
        ...item,
        category: Array.isArray(item.category) ? item.category[0] : item.category,
      })) as Resource[];
    }

    if (categoriesResult.data) {
      categories = categoriesResult.data as Category[];
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

  return (
    <div className="flex flex-col gap-16 py-8 sm:py-12">
      {/* 1. HERO SECTION WITH FOUNDER GRAPHIC */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-neutral-950 shadow-2xl">
          {/* Full resolution graphic banner */}
          <div className="relative w-full aspect-[1024/286] min-h-[220px] sm:min-h-[280px]">
            <Image
              src="/images/hero-clean.png"
              alt="NammaTech - Everything You Need In One Place. Founder Muthuraj"
              fill
              priority
              quality={95}
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 1200px, 1280px"
              className="object-cover object-left sm:object-center select-none"
            />

            {/* Desktop Interactive Search Overlay perfectly mapped to the banner's search bar */}
            <form
              action="/search"
              method="GET"
              className="hidden md:flex items-center absolute"
              style={{
                left: "3.5%",
                top: "47%",
                width: "41%",
                height: "17%",
              }}
            >
              <div className="relative w-full h-full flex items-center">
                <input
                  type="text"
                  name="q"
                  placeholder="Search software, tools, games, templates..."
                  aria-label="Search resources"
                  className="w-full h-full pl-10 pr-24 rounded-full bg-black/40 hover:bg-black/60 focus:bg-neutral-900/95 text-white placeholder-neutral-400 text-xs font-medium border border-amber-500/30 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all shadow-inner backdrop-blur-sm"
                />
                <Search className="absolute left-3.5 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                <button
                  type="submit"
                  className="absolute right-1 px-4 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Mobile-Friendly Search Bar Below Graphic */}
          <div className="md:hidden p-4 bg-neutral-900/90 border-t border-neutral-800">
            <form action="/search" method="GET" className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                name="q"
                placeholder="Search software, movies, tools, APKs..."
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
        </div>

        {/* Quick Trending / Quick-Access Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 px-1 text-xs font-semibold text-neutral-300">
          <span className="text-[var(--muted-foreground)] text-xs flex-shrink-0 font-medium">Trending:</span>
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
      </section>

      {/* 2. CATEGORIES PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
              Browse by Category
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
              Find exactly what you need across organized classifications.
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

      {/* HOMEPAGE FEATURE AD BANNER */}
      {homepageAd && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AdSlot ad={homepageAd} location="HOMEPAGE" format="auto" />
        </section>
      )}

      {/* 3. FEATURED RESOURCES (IF ANY PUBLISHED) */}
      {featuredResources.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
                  Featured Resources
                </h2>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
                  Hand-picked, high quality digital assets and software.
                </p>
              </div>
            </div>
          </div>
          <ResourceGrid resources={featuredResources} />
        </section>
      )}

      {/* 4. LATEST RELEASES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
              Latest Additions
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
              Recently verified releases, updates, and open-source packages.
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

      {/* 5. FOUNDER & LEAD DEVELOPER PROFILE */}
      <FounderProfile />
    </div>
  );
}
