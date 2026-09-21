import React from "react";
import Link from "next/link";
import { Layers, Plus, ExternalLink, ArrowUpDown } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Category } from "@/types/database";
import { CategoriesClient } from "./categories-client";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const supabase = createAdminClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  const cats = (categories || []) as Category[];
  const activeCount = cats.filter((c) => c.is_active).length;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── SaaS Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Taxonomy Architecture Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-indigo-400" />
            <span>Category Taxonomy</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Organize catalog hierarchy, drag-and-drop navigation ordering, slug routing, and visibility statuses.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300">
            <span className="text-neutral-400">Active Nodes:</span>{" "}
            <strong className="text-indigo-400 font-mono">{activeCount} / {cats.length}</strong>
          </div>
        </div>
      </div>

      <CategoriesClient initialCategories={cats} />
    </div>
  );
}
