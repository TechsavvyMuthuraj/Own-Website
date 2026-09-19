import React from "react";
import Link from "next/link";
import {
  Filter,
  Layers,
  Compass,
  Smartphone,
  Monitor,
  Code,
  Cpu,
  FileText,
  Shapes,
  GraduationCap,
  Globe,
  Film,
  Sparkles,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Resource, Category } from "@/types/database";
import { ResourceGrid } from "@/components/resources/resource-grid";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Digital Resources, Software & Tools",
  description:
    "Explore our complete catalog of verified open-source software, freeware utilities, Android APKs, developer tools, and templates. Filter by category, platform, or price.",
  openGraph: {
    title: "Explore Digital Resources, Software & Tools | NammaTech",
    description:
      "Explore verified open-source software, freeware utilities, Android APKs, and developer tools on NammaTech.",
  },
};

interface ExplorePageProps {
  searchParams: Promise<{
    category?: string;
    access?: string;
    platform?: string;
    sort?: string;
  }>;
}

export const revalidate = 60;

const getCategoryIcon = (slug: string) => {
  switch (slug) {
    case "apk":
      return <Smartphone className="w-3.5 h-3.5 text-emerald-500" />;
    case "pc-software":
      return <Monitor className="w-3.5 h-3.5 text-blue-500" />;
    case "developer-tools":
      return <Code className="w-3.5 h-3.5 text-purple-500" />;
    case "ai-tools":
      return <Cpu className="w-3.5 h-3.5 text-cyan-500" />;
    case "templates":
      return <FileText className="w-3.5 h-3.5 text-amber-500" />;
    case "icons":
      return <Shapes className="w-3.5 h-3.5 text-rose-500" />;
    case "education":
      return <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />;
    case "useful-websites":
      return <Globe className="w-3.5 h-3.5 text-teal-500" />;
    case "media":
      return <Film className="w-3.5 h-3.5 text-pink-500" />;
    default:
      return <Layers className="w-3.5 h-3.5 text-[var(--primary)]" />;
  }
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const currentCategory = params.category || "all";
  const currentAccess = params.access || "all";
  const currentPlatform = params.platform || "all";
  const currentSort = params.sort || "newest";

  const supabase = await createClient();

  let categories: Category[] = [];
  let resources: Resource[] = [];

  try {
    // 1. Fetch Categories for filter pills
    const { data: catData } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (catData) {
      // Exclude Movies & Cinema from software explore categories
      categories = (catData as Category[]).filter((c) => c.slug !== "movies");
    }

    const movieCat = (catData as Category[] | undefined)?.find((c) => c.slug === "movies");

    // 2. Build filtered resource query
    let query = supabase
      .from("resources")
      .select("*, category:categories(*)")
      .eq("status", "PUBLISHED");

    // Category filter
    if (currentCategory !== "all") {
      const selectedCat = categories.find((c) => c.slug === currentCategory);
      if (selectedCat) {
        query = query.eq("category_id", selectedCat.id);
      }
    } else if (movieCat?.id) {
      // Isolate software: exclude movies in all-category view
      query = query.neq("category_id", movieCat.id);
    }

    // Access type filter
    if (currentAccess === "free") {
      query = query.eq("access_type", "FREE");
    } else if (currentAccess === "paid") {
      query = query.eq("access_type", "PAID");
    }

    // Platform filter
    if (currentPlatform !== "all") {
      query = query.ilike("platform", `%${currentPlatform}%`);
    }

    // Sorting
    if (currentSort === "updated") {
      query = query.order("updated_at", { ascending: false });
    } else if (currentSort === "price_low") {
      query = query.order("price", { ascending: true });
    } else if (currentSort === "price_high") {
      query = query.order("price", { ascending: false });
    } else {
      // Default: newest
      query = query.order("published_at", { ascending: false });
    }

    const { data: resData } = await query.limit(48);

    if (resData) {
      resources = (resData as unknown[])
        .map((item: any) => ({
          ...item,
          category: Array.isArray(item.category) ? item.category[0] : item.category,
        }))
        .filter((r: any) => {
          if (movieCat && r.category_id === movieCat.id) return false;
          if (r.category?.slug === "movies") return false;
          const tags = Array.isArray(r.tags) ? r.tags.map((t: string) => String(t).toLowerCase()) : [];
          if (tags.includes("movie") || tags.includes("movies") || tags.includes("cinema")) {
            return false;
          }
          return true;
        }) as Resource[];
    }
  } catch (error) {
    console.error("Error fetching explore resources:", error);
  }

  const platforms = [
    { label: "All Platforms", value: "all" },
    { label: "Windows", value: "windows" },
    { label: "Android", value: "android" },
    { label: "macOS", value: "mac" },
    { label: "Linux", value: "linux" },
    { label: "Web", value: "web" },
  ];

  const activeCategory = categories.find((c) => c.slug === currentCategory);
  const hasActiveFilters =
    currentCategory !== "all" ||
    currentAccess !== "all" ||
    currentPlatform !== "all" ||
    currentSort !== "newest";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)] mb-1">
          <Compass className="w-4 h-4" />
          <span>Directory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
          Explore Digital Resources
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1 max-w-2xl">
          Browse verified open-source software, developer tools, APKs, templates, and digital assets.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col gap-3.5 sm:gap-4 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-[var(--border)] bg-[var(--card)] mb-6 sm:mb-8 shadow-xs">
        {/* Category Header & Horizontal Scrollable Pills */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Explore Categories</span>
            </span>
            {currentCategory !== "all" && (
              <Link
                href={`/explore?category=all&access=${currentAccess}&platform=${currentPlatform}&sort=${currentSort}`}
                className="text-[11px] font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                <span>All categories</span>
                <X className="w-3 h-3" />
              </Link>
            )}
          </div>

          {/* Category Pills Strip */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none overscroll-x-contain touch-pan-x -mx-1 px-1">
            <Link
              href={`/explore?category=all&access=${currentAccess}&platform=${currentPlatform}&sort=${currentSort}`}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none ${currentCategory === "all"
                  ? "bg-[var(--primary)] text-white shadow-md shadow-[#FD1843]/20 ring-1 ring-[var(--primary)]"
                  : "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--secondary)]/80 border border-[var(--border)]/70"
                }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>All Categories</span>
            </Link>
            {categories.map((cat) => {
              const isSelected = currentCategory === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/explore?category=${cat.slug}&access=${currentAccess}&platform=${currentPlatform}&sort=${currentSort}`}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none ${isSelected
                      ? "bg-[var(--primary)] text-white shadow-md shadow-[#FD1843]/20 ring-1 ring-[var(--primary)]"
                      : "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--secondary)]/80 border border-[var(--border)]/70"
                    }`}
                >
                  {getCategoryIcon(cat.slug)}
                  <span>{cat.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Secondary Filters Section: Access, Platform, Sort */}
        <div className="pt-3.5 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
            {/* Access Filter: Full-width segmented buttons on mobile */}
            <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-[var(--secondary)]/80 p-1 rounded-xl w-full sm:w-auto">
              <Link
                href={`/explore?category=${currentCategory}&access=all&platform=${currentPlatform}&sort=${currentSort}`}
                className={`flex items-center justify-center px-3 py-1.5 rounded-lg font-medium text-center transition-all ${currentAccess === "all"
                    ? "bg-[var(--card)] text-[var(--foreground)] font-semibold shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
              >
                All Access
              </Link>
              <Link
                href={`/explore?category=${currentCategory}&access=free&platform=${currentPlatform}&sort=${currentSort}`}
                className={`flex items-center justify-center px-3 py-1.5 rounded-lg font-medium text-center transition-all ${currentAccess === "free"
                    ? "bg-[var(--card)] text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
              >
                Free
              </Link>
              <Link
                href={`/explore?category=${currentCategory}&access=paid&platform=${currentPlatform}&sort=${currentSort}`}
                className={`flex items-center justify-center px-3 py-1.5 rounded-lg font-medium text-center transition-all ${currentAccess === "paid"
                    ? "bg-[var(--card)] text-amber-600 dark:text-amber-400 font-semibold shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
              >
                Premium
              </Link>
            </div>

            {/* Platform Filter: Horizontal scroll strip with shrink-0 */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none overscroll-x-contain -mx-1 px-1">
              <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider shrink-0 sm:hidden mr-0.5">
                OS:
              </span>
              {platforms.map((p) => {
                const isSelected = currentPlatform === p.value;
                return (
                  <Link
                    key={p.value}
                    href={`/explore?category=${currentCategory}&access=${currentAccess}&platform=${p.value}&sort=${currentSort}`}
                    className={`shrink-0 px-2.5 py-1 rounded-lg border text-xs whitespace-nowrap transition-colors ${isSelected
                        ? "bg-[var(--secondary)] text-[var(--foreground)] font-semibold border-[var(--primary)]/60 shadow-xs"
                        : "border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]/50"
                      }`}
                  >
                    {p.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sort Controls: Clean alignment on mobile and desktop */}
          <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]/60 text-[var(--muted-foreground)]">
            <div className="flex items-center gap-1 text-[11px] font-medium shrink-0">
              <Filter className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Sort:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Link
                href={`/explore?category=${currentCategory}&access=${currentAccess}&platform=${currentPlatform}&sort=newest`}
                className={`px-2 py-0.5 rounded-md font-medium text-xs transition-colors ${currentSort === "newest"
                    ? "text-[var(--primary)] bg-[var(--primary)]/10 font-bold"
                    : "hover:text-[var(--foreground)]"
                  }`}
              >
                Newest
              </Link>
              <span className="text-[var(--border)]">•</span>
              <Link
                href={`/explore?category=${currentCategory}&access=${currentAccess}&platform=${currentPlatform}&sort=updated`}
                className={`px-2 py-0.5 rounded-md font-medium text-xs transition-colors ${currentSort === "updated"
                    ? "text-[var(--primary)] bg-[var(--primary)]/10 font-bold"
                    : "hover:text-[var(--foreground)]"
                  }`}
              >
                Updated
              </Link>
              <span className="text-[var(--border)]">•</span>
              <Link
                href={`/explore?category=${currentCategory}&access=${currentAccess}&platform=${currentPlatform}&sort=price_low`}
                className={`px-2 py-0.5 rounded-md font-medium text-xs transition-colors ${currentSort === "price_low"
                    ? "text-[var(--primary)] bg-[var(--primary)]/10 font-bold"
                    : "hover:text-[var(--foreground)]"
                  }`}
              >
                Price
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Status & Quick Clear Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[var(--muted-foreground)]">
          <span>Showing</span>
          <span className="font-semibold text-[var(--foreground)] font-mono">{resources.length}</span>
          <span>{resources.length === 1 ? "resource" : "resources"}</span>
          {activeCategory && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] font-semibold text-[11px]">
              {getCategoryIcon(activeCategory.slug)}
              <span>{activeCategory.name}</span>
            </span>
          )}
          {currentAccess !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--secondary)] text-[var(--foreground)] font-medium text-[11px]">
              {currentAccess === "free" ? "Free Only" : "Premium Only"}
            </span>
          )}
          {currentPlatform !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--secondary)] text-[var(--foreground)] font-medium text-[11px] uppercase">
              {currentPlatform}
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <Link
            href="/explore"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear all filters</span>
          </Link>
        )}
      </div>

      {/* Resource Grid with Clean Empty State */}
      <ResourceGrid
        resources={resources}
        emptyTitle="No matching resources found"
        emptyDescription="There are currently no published resources matching your active filters. Try resetting your filter criteria or exploring another category."
        emptyActionText="Clear All Filters"
        emptyActionHref="/explore"
      />
    </div>
  );
}
