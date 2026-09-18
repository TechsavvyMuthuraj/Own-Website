import React from "react";
import { Download, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Resource } from "@/types/database";
import { ResourceGrid } from "@/components/resources/resource-grid";

export const revalidate = 60;

export default async function FreeResourcesPage() {
  const supabase = await createClient();
  let resources: Resource[] = [];

  try {
    const { data } = await supabase
      .from("resources")
      .select("*, category:categories(*)")
      .eq("status", "PUBLISHED")
      .eq("access_type", "FREE")
      .order("published_at", { ascending: false })
      .limit(36);

    if (data) {
      resources = (data as unknown[]).map((item: any) => ({
        ...item,
        category: Array.isArray(item.category) ? item.category[0] : item.category,
      })) as Resource[];
    }
  } catch (err) {
    console.error("Error loading free resources:", err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
          <Download className="w-4 h-4" />
          <span>Open & Free</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
          Free Digital Resources
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Completely free, open-source software, public domain assets, and tools. Zero charges, no hidden fees.
        </p>
      </div>

      <ResourceGrid
        resources={resources}
        emptyTitle="No free resources available yet"
        emptyDescription="There are currently no free resources published in the catalog. Check back soon as new open-source resources are curated."
        emptyActionText="Browse All Categories"
        emptyActionHref="/categories"
      />
    </div>
  );
}
