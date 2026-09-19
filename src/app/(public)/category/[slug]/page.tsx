import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ChevronRight, Layers, Filter, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Resource, Category } from "@/types/database";
import { ResourceGrid } from "@/components/resources/resource-grid";

import type { Metadata } from "next";

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: CategoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "movies") {
    return {
      title: "Movies Cinema Hub | NammaTech",
    };
  }

  const supabase = await createClient();
  const { data: cat } = await supabase
    .from("categories")
    .select("name, description, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!cat) {
    return {
      title: "Category Not Found | NammaTech",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://www.techsavvymuthuraj.dev";

  const title = `${cat.name} - Free & Verified Digital Resources | NammaTech`;
  const description =
    cat.description ||
    `Browse verified ${cat.name} tools, software downloads, and digital assets on NammaTech.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/category/${cat.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/category/${cat.slug}`,
      type: "website",
      images: [
        {
          url: `${siteUrl}/images/hero-clean.png`,
          width: 1200,
          height: 630,
          alt: cat.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CategoryDetailPage({
  params,
  searchParams,
}: CategoryDetailPageProps) {
  const { slug } = await params;

  // Movies have a dedicated VIP cinema hub
  if (slug === "movies") {
    redirect("/movies");
  }

  const { sort } = await searchParams;
  const currentSort = sort || "newest";

  const supabase = await createClient();

  // 1. Fetch current Category and all sibling categories
  const [catRes, allCatsRes] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single(),
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .neq("slug", "movies")
      .order("sort_order", { ascending: true }),
  ]);

  if (catRes.error || !catRes.data) {
    notFound();
  }

  const category = catRes.data as Category;
  const siblingCategories = (allCatsRes.data || []) as Category[];

  // 2. Fetch Resources in this category
  let query = supabase
    .from("resources")
    .select("*, category:categories(*)")
    .eq("category_id", category.id)
    .eq("status", "PUBLISHED");

  if (currentSort === "updated") {
    query = query.order("updated_at", { ascending: false });
  } else if (currentSort === "price_low") {
    query = query.order("price", { ascending: true });
  } else if (currentSort === "price_high") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("published_at", { ascending: false });
  }

  const { data: resourcesData } = await query.limit(36);

  const resources = (resourcesData || []).map((item: any) => ({
    ...item,
    category: Array.isArray(item.category) ? item.category[0] : item.category,
  })) as Resource[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mb-5 overflow-x-auto scrollbar-none">
        <Link href="/" className="hover:text-[var(--foreground)] shrink-0">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <Link href="/categories" className="hover:text-[var(--foreground)] shrink-0">
          Categories
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <span className="text-[var(--foreground)] font-medium truncate">
          {category.name}
        </span>
      </nav>

      {/* Category Header Banner */}
      <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-[var(--border)] bg-gradient-to-r from-[var(--secondary)]/60 to-[var(--card)] mb-6 sm:mb-8 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)] mb-2">
          <Layers className="w-4 h-4" />
          <span>Category Directory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-2">
          {category.name}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
          {category.description || `Browse verified releases, tools, and files in ${category.name}.`}
        </p>

        {/* Quick Sibling Category Switcher on Mobile & Desktop */}
        {siblingCategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-3.5 mt-4 border-t border-[var(--border)]/70 scrollbar-none overscroll-x-contain -mx-1 px-1">
            <Link
              href="/explore"
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 text-[var(--foreground)] border border-[var(--border)] transition-colors"
            >
              <Sparkles className="w-3 h-3 text-[var(--primary)]" />
              <span>All Catalog</span>
            </Link>
            {siblingCategories.map((c) => {
              const isCurrent = c.slug === slug;
              return (
                <Link
                  key={c.id}
                  href={`/category/${c.slug}`}
                  className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isCurrent
                      ? "bg-[var(--primary)] text-white shadow-xs"
                      : "bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]"
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* Sort Controls: Mobile-Friendly Flex Wrap */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3.5 border-t border-[var(--border)]/70 text-xs text-[var(--muted-foreground)]">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span className="font-medium">Sort by:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              href={`/category/${slug}?sort=newest`}
              className={`shrink-0 px-2.5 py-1 rounded-lg font-medium transition-colors ${
                currentSort === "newest"
                  ? "bg-[var(--primary)] text-white font-semibold shadow-xs"
                  : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Newest
            </Link>
            <Link
              href={`/category/${slug}?sort=updated`}
              className={`shrink-0 px-2.5 py-1 rounded-lg font-medium transition-colors ${
                currentSort === "updated"
                  ? "bg-[var(--primary)] text-white font-semibold shadow-xs"
                  : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Updated
            </Link>
            <Link
              href={`/category/${slug}?sort=price_low`}
              className={`shrink-0 px-2.5 py-1 rounded-lg font-medium transition-colors ${
                currentSort === "price_low"
                  ? "bg-[var(--primary)] text-white font-semibold shadow-xs"
                  : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Price
            </Link>
          </div>
        </div>
      </div>

      {/* Resource Grid with Clean Empty State */}
      <ResourceGrid
        resources={resources}
        emptyTitle={`No resources in ${category.name} yet`}
        emptyDescription="There are currently no published resources in this category. New items are added after being thoroughly reviewed and verified."
        emptyActionText="Browse Other Categories"
        emptyActionHref="/categories"
      />
    </div>
  );
}
