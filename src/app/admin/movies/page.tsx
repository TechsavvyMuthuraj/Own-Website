import React from "react";
import Link from "next/link";
import { Plus, Film, Crown, Sparkles, Download, ShieldCheck } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Resource } from "@/types/database";
import { MovieTableClient } from "./table-client";

export const revalidate = 0; // Always fresh movie data in admin

export default async function AdminMoviesPage() {
  const supabase = createAdminClient();

  // 1. Find Movies category if exists
  const { data: movieCat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "movies")
    .maybeSingle();

  // 2. Query all movie resources
  let query = supabase
    .from("resources")
    .select("*, download_links(*)")
    .order("created_at", { ascending: false });

  if (movieCat?.id) {
    query = query.or(
      `category_id.eq.${movieCat.id},tags.cs.{movie},tags.cs.{movies},tags.cs.{Cinema}`
    );
  } else {
    query = query.or(`tags.cs.{movie},tags.cs.{movies},tags.cs.{Cinema}`);
  }

  const { data: moviesData } = await query;
  const movies = (moviesData || []) as Resource[];

  // 3. Compute Metrics
  const totalCount = movies.length;
  const count4k = movies.filter(
    (m) =>
      (m.tags && m.tags.some((t) => t.toLowerCase().includes("4k"))) ||
      (m.price && m.price > 0)
  ).length;
  const countVip = movies.filter((m) => m.price && m.price > 0).length;
  const totalDownloads = movies.reduce((acc, m) => acc + (m.downloads_count || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight flex items-center gap-2.5">
            <Film className="w-7 h-7 text-amber-500" />
            <span>Movies & Cinema Hub Management</span>
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Publish, edit, configure 4K VIP pricing, and manage free mirrors for movies.
          </p>
        </div>

        <Link
          href="/admin/movies/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-yellow-400 text-neutral-950 font-extrabold text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Movie</span>
        </Link>
      </div>

      {/* ── Metrics Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block">
              Total Movies
            </span>
            <span className="text-xl font-black text-[var(--foreground)]">
              {totalCount}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block">
              4K Ultra HD
            </span>
            <span className="text-xl font-black text-[var(--foreground)]">
              {count4k}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block">
              VIP Releases
            </span>
            <span className="text-xl font-black text-[var(--foreground)]">
              {countVip}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block">
              Downloads
            </span>
            <span className="text-xl font-black text-[var(--foreground)]">
              {totalDownloads}
            </span>
          </div>
        </div>
      </div>

      {/* ── Table & Interactive View ── */}
      <MovieTableClient initialMovies={movies} />
    </div>
  );
}
