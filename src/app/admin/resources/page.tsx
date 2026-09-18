import React from "react";
import Link from "next/link";
import { Plus, Search, Filter, Package, Edit, Copy, Trash2, ExternalLink } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Resource, Category } from "@/types/database";
import { formatDate, formatCurrency } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { ResourceTableClient } from "./table-client";

interface AdminResourcesPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
  }>;
}

export const revalidate = 0;

export default async function AdminResourcesPage({ searchParams }: AdminResourcesPageProps) {
  const { q, category, status } = await searchParams;
  const supabase = createAdminClient();

  // 1. Fetch movie category to isolate movies exclusively to the Movies & Cinema hub
  const { data: movieCat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "movies")
    .maybeSingle();

  let query = supabase
    .from("resources")
    .select("*, category:categories(id, name, slug)")
    .order("created_at", { ascending: false });

  // Exclude movies from general resources query
  if (movieCat?.id) {
    query = query.neq("category_id", movieCat.id);
  }

  if (q) {
    query = query.ilike("title", `%${q.trim()}%`);
  }
  if (category && category !== "ALL") {
    query = query.eq("category_id", category);
  }
  if (status && status !== "ALL") {
    query = query.eq("status", status);
  }

  const { data: resourcesData } = await query;
  const resources = (resourcesData || [])
    .map((r: any) => ({
      ...r,
      category: Array.isArray(r.category) ? r.category[0] : r.category,
    }))
    .filter((r: any) => {
      // Strict filter: Do NOT show movies in general Resource Management
      if (movieCat?.id && r.category_id === movieCat.id) return false;
      if (r.category?.slug === "movies") return false;
      const tags = Array.isArray(r.tags) ? r.tags.map((t: string) => String(t).toLowerCase()) : [];
      if (tags.includes("movie") || tags.includes("movies") || tags.includes("cinema")) {
        return false;
      }
      return true;
    }) as Resource[];

  // Fetch software categories only (excluding Movies & Cinema) for filter dropdown
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");
  const categories = ((categoriesData || []) as (Category & { slug?: string })[])
    .filter((c) => c.slug !== "movies") as Category[];

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
            Resource Management
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Create, edit, duplicate, and publish verified digital resources.
          </p>
        </div>

        <Link
          href="/admin/resources/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Resource</span>
        </Link>
      </div>

      {/* Interactive Table with Filters and Bulk/Row Actions */}
      <ResourceTableClient
        initialResources={resources}
        categories={categories}
        currentQuery={q || ""}
        currentCategory={category || "ALL"}
        currentStatus={status || "ALL"}
      />
    </div>
  );
}
