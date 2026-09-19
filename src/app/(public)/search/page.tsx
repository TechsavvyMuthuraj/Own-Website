import React from "react";
import Link from "next/link";
import { Search as SearchIcon, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Resource } from "@/types/database";
import { ResourceGrid } from "@/components/resources/resource-grid";

import type { Metadata } from "next";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = (q || "").trim();
  return {
    title: query ? `Search results for "${query}"` : "Search Digital Resources",
    description: `Browse verified software and digital resource search results for "${query || "NammaTech"}".`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const searchQuery = (q || "").trim();
  const supabase = await createClient();

  let results: Resource[] = [];

  if (searchQuery) {
    try {
      const CARD_FIELDS =
        "id, title, slug, short_description, thumbnail_url, icon_url, resource_type, access_type, price, sale_price, currency, platform, version, status, featured, tags, created_at, updated_at, published_at, category_id, category:categories(id, name, slug, icon)";

      const { data, error } = await supabase
        .from("resources")
        .select(CARD_FIELDS)
        .eq("status", "PUBLISHED")
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,developer.ilike.%${searchQuery}%,platform.ilike.%${searchQuery}%`)
        .order("published_at", { ascending: false })
        .limit(24);

      if (!error && data) {
        results = (data as unknown[]).map((item: any) => ({
          ...item,
          category: Array.isArray(item.category) ? item.category[0] : item.category,
        })) as Resource[];
      }
    } catch (err) {
      console.error("Search query execution error:", err);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-6 flex items-center gap-2">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to directory</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
          {searchQuery ? `Search results for "${searchQuery}"` : "Search Resources"}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
          {searchQuery
            ? `Found ${results.length} verified ${results.length === 1 ? "resource" : "resources"}.`
            : "Enter a query in the search bar above to look through verified resources."}
        </p>
      </div>

      {searchQuery ? (
        <ResourceGrid
          resources={results}
          emptyTitle={`No resources found for "${searchQuery}"`}
          emptyDescription="We couldn't find any resources matching your search keywords. Please try another term or browse our categories."
          emptyActionText="Explore Categories"
          emptyActionHref="/categories"
        />
      ) : (
        <div className="p-12 text-center rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <SearchIcon className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-3" />
          <p className="text-sm font-medium text-[var(--foreground)]">
            Please enter keywords to search.
          </p>
        </div>
      )}
    </div>
  );
}
