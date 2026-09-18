import React from "react";
import Link from "next/link";
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

export const revalidate = 60; // Cache revalidation every 60s

export default async function HomePage() {
  const supabase = await createClient();

  let featuredResources: Resource[] = [];
  let latestResources: Resource[] = [];
  let categories: Category[] = [];

  try {
    // 1. Fetch Featured Resources
    const { data: featuredData } = await supabase
      .from("resources")
      .select("*, category:categories(*)")
      .eq("status", "PUBLISHED")
      .eq("featured", true)
      .order("published_at", { ascending: false })
      .limit(4);

    if (featuredData) {
      featuredResources = (featuredData as unknown[]).map((item: any) => ({
        ...item,
        category: Array.isArray(item.category) ? item.category[0] : item.category,
      })) as Resource[];
    }

    // 2. Fetch Latest Published Resources
    const { data: latestData } = await supabase
      .from("resources")
      .select("*, category:categories(*)")
      .eq("status", "PUBLISHED")
      .order("published_at", { ascending: false })
      .limit(8);

    if (latestData) {
      latestResources = (latestData as unknown[]).map((item: any) => ({
        ...item,
        category: Array.isArray(item.category) ? item.category[0] : item.category,
      })) as Resource[];
    }

    // 3. Fetch Active Categories
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(8);

    if (categoriesData) {
      categories = categoriesData as Category[];
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
      {/* 1. HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-gradient-to-b from-[var(--secondary)]/50 via-[var(--card)] to-[var(--card)] p-8 sm:p-14 text-center">
          {/* Subtle background decorative aura */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] text-xs font-medium text-[var(--muted-foreground)] mb-6 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
            <span>NammaTech • Explore • Download • Upgrade • Together</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--foreground)] tracking-tight max-w-4xl mx-auto mb-6 leading-tight">
            Discover trusted digital resources on{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500">
              NammaTech
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto mb-8 leading-relaxed">
            All you need. One place. Verified open-source software, developer tools, authorized APKs, templates, and digital files in one fast, reliable platform.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-10">
            <Link
              href="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:bg-[var(--primary-hover)] transition-all shadow-md shadow-indigo-500/20"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Resources</span>
            </Link>

            <Link
              href="/categories"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--secondary)] text-[var(--foreground)] font-semibold text-sm transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Browse Categories</span>
            </Link>
          </div>

          {/* Quick Search Redirect Input */}
          <div className="max-w-xl mx-auto">
            <form action="/search" method="GET" className="relative flex items-center">
              <Search className="absolute left-4 w-4 h-4 text-[var(--muted-foreground)]" />
              <input
                type="text"
                name="q"
                placeholder="Search apps, utilities, tools, templates..."
                className="w-full pl-11 pr-24 py-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 px-3.5 py-1.5 rounded-xl bg-[var(--secondary)] hover:bg-[var(--primary)] hover:text-white text-xs font-semibold text-[var(--foreground)] transition-all"
              >
                Search
              </button>
            </form>
          </div>
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
    </div>
  );
}
