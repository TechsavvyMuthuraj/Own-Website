import React from "react";
import { Sparkles, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Resource } from "@/types/database";
import { ResourceGrid } from "@/components/resources/resource-grid";

export const revalidate = 60;

export default async function PremiumResourcesPage() {
  const supabase = await createClient();
  let resources: Resource[] = [];

  try {
    const { data } = await supabase
      .from("resources")
      .select("*, category:categories(*)")
      .eq("status", "PUBLISHED")
      .eq("access_type", "PAID")
      .order("published_at", { ascending: false })
      .limit(36);

    if (data) {
      resources = (data as unknown[]).map((item: any) => ({
        ...item,
        category: Array.isArray(item.category) ? item.category[0] : item.category,
      })) as Resource[];
    }
  } catch (err) {
    console.error("Error loading premium resources:", err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Verified Commercial & Premium</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
          Premium Digital Resources
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Authorized premium software, pro templates, and commercial assets with verified licensing and support.
        </p>
      </div>

      <ResourceGrid
        resources={resources}
        emptyTitle="No premium resources listed yet"
        emptyDescription="There are currently no commercial or premium digital resources available in the catalog. All available resources are currently free."
        emptyActionText="Explore Free Resources"
        emptyActionHref="/free"
      />
    </div>
  );
}
