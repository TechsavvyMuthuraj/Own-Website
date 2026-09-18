import React from "react";
import Link from "next/link";
import { Sparkles, Clock, Compass } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Resource } from "@/types/database";
import { ResourceGrid } from "@/components/resources/resource-grid";

interface NewUpdatedPageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export const revalidate = 60;

export default async function NewAndUpdatedPage({ searchParams }: NewUpdatedPageProps) {
  const { tab } = await searchParams;
  const currentTab = tab || "all";
  const supabase = await createClient();

  let resources: Resource[] = [];

  try {
    let query = supabase
      .from("resources")
      .select("*, category:categories(*)")
      .eq("status", "PUBLISHED");

    if (currentTab === "new") {
      // Sort strictly by published_at
      query = query.order("published_at", { ascending: false });
    } else if (currentTab === "updated") {
      // Sort strictly by updated_at
      query = query.order("updated_at", { ascending: false });
    } else {
      // All recent updates and additions
      query = query.order("updated_at", { ascending: false });
    }

    const { data } = await query.limit(36);

    if (data) {
      resources = (data as unknown[]).map((item: any) => ({
        ...item,
        category: Array.isArray(item.category) ? item.category[0] : item.category,
      })) as Resource[];
    }
  } catch (err) {
    console.error("Error fetching new and updated resources:", err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--primary)] mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Fresh Releases</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
          New & Recently Updated Resources
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Track newly added open-source software, updated tool releases, and revised assets.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] max-w-fit mb-8 shadow-xs">
        <Link
          href="/new-and-updated?tab=all"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentTab === "all"
              ? "bg-[var(--primary)] text-white shadow-sm"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>All Recent</span>
        </Link>
        <Link
          href="/new-and-updated?tab=new"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentTab === "new"
              ? "bg-[var(--primary)] text-white shadow-sm"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Additions</span>
        </Link>
        <Link
          href="/new-and-updated?tab=updated"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentTab === "updated"
              ? "bg-[var(--primary)] text-white shadow-sm"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Recently Updated</span>
        </Link>
      </div>

      {/* Grid with Clean Empty State */}
      <ResourceGrid
        resources={resources}
        emptyTitle="No recent releases found"
        emptyDescription="There are currently no new additions or recent updates recorded. New releases will show up here automatically when published by administrators."
        emptyActionText="Explore All Categories"
        emptyActionHref="/categories"
      />
    </div>
  );
}
