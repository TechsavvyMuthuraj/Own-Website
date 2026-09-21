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

  // Compute live KPI aggregates
  const totalCount = resources.length;
  const publishedCount = resources.filter((r) => r.status === "PUBLISHED").length;
  const paidCount = resources.filter((r) => r.access_type === "PAID" || (r.price && r.price > 0)).length;
  const freeCount = totalCount - paidCount;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── SaaS Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Catalog Infrastructure Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
            Digital Resource Management
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1 max-w-xl">
            Create, configure, duplicate, and publish verified freeware, software suites, tools, and digital assets.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            href="/resource"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-700/80 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
            <span>Live Catalog</span>
          </Link>

          <Link
            href="/admin/resources/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Resource</span>
          </Link>
        </div>
      </div>

      {/* ── Interactive SaaS Table with Live Stats & Fast Search ── */}
      <ResourceTableClient
        initialResources={resources}
        categories={categories}
        currentQuery={q || ""}
        currentCategory={category || "ALL"}
        currentStatus={status || "ALL"}
        stats={{
          total: totalCount,
          published: publishedCount,
          paid: paidCount,
          free: freeCount,
        }}
      />
    </div>
  );
}
