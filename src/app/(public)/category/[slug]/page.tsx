import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ChevronRight, Layers, Filter } from "lucide-react";
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
    : "https://nammatech.in";

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

  // 1. Fetch Category
  const { data: categoryData, error: catError } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (catError || !categoryData) {
    notFound();
  }

  const category = categoryData as Category;

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mb-6">
        <Link href="/" className="hover:text-[var(--foreground)]">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/categories" className="hover:text-[var(--foreground)]">
          Categories
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[var(--foreground)] font-medium truncate">
          {category.name}
        </span>
      </nav>

      {/* Category Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[var(--border)] bg-gradient-to-r from-[var(--secondary)]/60 to-[var(--card)] mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)] mb-2">
          <Layers className="w-4 h-4" />
          <span>Category Directory</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-2">
          {category.name}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-2xl leading-relaxed">
          {category.description || `Browse verified releases and files in ${category.name}.`}
        </p>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
          <Filter className="w-3.5 h-3.5" />
          <span>Sort by:</span>
          <Link
            href={`/category/${slug}?sort=newest`}
            className={`font-medium ${currentSort === "newest" ? "text-[var(--primary)] underline font-semibold" : "hover:text-[var(--foreground)]"}`}
          >
            Newest
          </Link>
          <span>•</span>
          <Link
            href={`/category/${slug}?sort=updated`}
            className={`font-medium ${currentSort === "updated" ? "text-[var(--primary)] underline font-semibold" : "hover:text-[var(--foreground)]"}`}
          >
            Recently Updated
          </Link>
          <span>•</span>
          <Link
            href={`/category/${slug}?sort=price_low`}
            className={`font-medium ${currentSort === "price_low" ? "text-[var(--primary)] underline font-semibold" : "hover:text-[var(--foreground)]"}`}
          >
            Price: Low to High
          </Link>
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
