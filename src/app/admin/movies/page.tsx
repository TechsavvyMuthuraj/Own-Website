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
      {/* ── SaaS Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Cinema Catalog Engine • Realtime Sync
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Film className="w-7 h-7 text-amber-400" />
            <span>Movies & Cinema Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Publish cinematic titles, configure 4K Dolby VIP pricing tiers, and manage verified multi-mirror downloads.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            href="/movies"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-700/80 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <span>Live Cinema Hub</span>
          </Link>

          <Link
            href="/admin/movies/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-neutral-950 font-black text-xs transition-all shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Movie</span>
          </Link>
        </div>
      </div>

      {/* ── SaaS Glassmorphism Metrics Ribbon ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md shadow-sm flex items-center gap-3.5 hover:-translate-y-0.5 transition-transform">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Total Movies
            </span>
            <span className="text-xl font-black text-white">
              {totalCount}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md shadow-sm flex items-center gap-3.5 hover:-translate-y-0.5 transition-transform">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              4K Ultra HD
            </span>
            <span className="text-xl font-black text-purple-400">
              {count4k}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md shadow-sm flex items-center gap-3.5 hover:-translate-y-0.5 transition-transform">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center font-bold">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              VIP Releases
            </span>
            <span className="text-xl font-black text-yellow-400">
              {countVip}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md shadow-sm flex items-center gap-3.5 hover:-translate-y-0.5 transition-transform">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Downloads
            </span>
            <span className="text-xl font-black text-emerald-400">
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
