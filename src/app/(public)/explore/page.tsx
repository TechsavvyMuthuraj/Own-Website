import React from "react";
import Link from "next/link";
import { Filter, Layers, Compass } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Resource, Category } from "@/types/database";
import { ResourceGrid } from "@/components/resources/resource-grid";

interface ExplorePageProps {
  searchParams: Promise<{
    category?: string;
    access?: string;
    platform?: string;
    sort?: string;
  }>;
}

export const revalidate = 60;

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
      categories = catData as Category[];
    }

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
      resources = (resData as unknown[]).map((item: any) => ({
        ...item,
        category: Array.isArray(item.category) ? item.category[0] : item.category,
      })) as Resource[];
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)] mb-1">
          <Compass className="w-4 h-4" />
          <span>Directory</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
          Explore Digital Resources
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Browse verified open-source software, developer tools, templates, and digital assets.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] mb-8 shadow-sm">
        {/* Category Pills Scrollable */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Link
            href={`/explore?category=all&access=${currentAccess}&platform=${currentPlatform}&sort=${currentSort}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              currentCategory === "all"
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--secondary)]/80"
            }`}
          >
            All Categories
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/explore?category=${cat.slug}&access=${currentAccess}&platform=${currentPlatform}&sort=${currentSort}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                currentCategory === cat.slug
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--secondary)]/80"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Secondary Filters: Access, Platform, Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)] text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Access Filter */}
            <div className="flex items-center gap-1 bg-[var(--secondary)] p-1 rounded-xl">
              <Link
                href={`/explore?category=${currentCategory}&access=all&platform=${currentPlatform}&sort=${currentSort}`}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  currentAccess === "all" ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs" : "text-[var(--muted-foreground)]"
                }`}
              >
                All Access
              </Link>
              <Link
                href={`/explore?category=${currentCategory}&access=free&platform=${currentPlatform}&sort=${currentSort}`}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  currentAccess === "free" ? "bg-[var(--card)] text-emerald-600 dark:text-emerald-400 shadow-xs" : "text-[var(--muted-foreground)]"
                }`}
              >
                Free Only
              </Link>
              <Link
                href={`/explore?category=${currentCategory}&access=paid&platform=${currentPlatform}&sort=${currentSort}`}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  currentAccess === "paid" ? "bg-[var(--card)] text-amber-600 dark:text-amber-400 shadow-xs" : "text-[var(--muted-foreground)]"
                }`}
              >
                Premium Only
              </Link>
            </div>

            {/* Platform Filter */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {platforms.map((p) => (
                <Link
                  key={p.value}
                  href={`/explore?category=${currentCategory}&access=${currentAccess}&platform=${p.value}&sort=${currentSort}`}
                  className={`px-2.5 py-1 rounded-lg border border-[var(--border)] transition-colors ${
                    currentPlatform === p.value
                      ? "bg-[var(--secondary)] text-[var(--foreground)] font-semibold"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Sort Dropdown / Selector */}
          <div className="flex items-center gap-1.5 ml-auto text-[var(--muted-foreground)]">
            <Filter className="w-3.5 h-3.5" />
            <span>Sort:</span>
            <Link
              href={`/explore?category=${currentCategory}&access=${currentAccess}&platform=${currentPlatform}&sort=newest`}
              className={`font-medium ${currentSort === "newest" ? "text-[var(--primary)] underline" : "hover:text-[var(--foreground)]"}`}
            >
              Newest
            </Link>
            <span>•</span>
            <Link
              href={`/explore?category=${currentCategory}&access=${currentAccess}&platform=${currentPlatform}&sort=updated`}
              className={`font-medium ${currentSort === "updated" ? "text-[var(--primary)] underline" : "hover:text-[var(--foreground)]"}`}
            >
              Recently Updated
            </Link>
          </div>
        </div>
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
