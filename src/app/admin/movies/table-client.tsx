"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Film,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Crown,
  Download,
  Star,
  CheckCircle2,
  Clock,
  Eye,
  Zap,
  HardDrive,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { Resource } from "@/types/database";

interface MovieTableClientProps {
  initialMovies: Resource[];
}

export function MovieTableClient({ initialMovies }: MovieTableClientProps) {
  const router = useRouter();
  const [movies, setMovies] = useState<Resource[]>(initialMovies);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuality, setSelectedQuality] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [movieToDelete, setMovieToDelete] = useState<Resource | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter movies
  const filteredMovies = movies.filter((movie) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = movie.title.toLowerCase().includes(q);
      const castMatch = movie.developer?.toLowerCase().includes(q);
      const audioMatch = movie.platform?.toLowerCase().includes(q);
      const tagsMatch = movie.tags?.some((t) => t.toLowerCase().includes(q));
      if (!titleMatch && !castMatch && !audioMatch && !tagsMatch) return false;
    }

    // Quality match
    if (selectedQuality !== "ALL") {
      const qualityTag = (movie.tags || []).find((t) =>
        t.toLowerCase().includes(selectedQuality.toLowerCase())
      );
      const is4k = selectedQuality.includes("4K") && (movie.price > 0 || qualityTag);
      if (!qualityTag && !is4k) return false;
    }

    // Status match
    if (selectedStatus !== "ALL" && movie.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  const handleDeleteMovie = async () => {
    if (!movieToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/resources/${movieToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMovies((prev) => prev.filter((m) => m.id !== movieToDelete.id));
        setMovieToDelete(null);
        router.refresh();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to delete movie.");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to delete movie.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between p-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movie title, star cast, audio..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quality & Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--secondary)]/70 border border-[var(--border)]">
            {["ALL", "4K UHD", "1080p FHD"].map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQuality(q)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedQuality === q
                    ? "bg-amber-500 text-neutral-950 shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {q === "ALL" ? "All Quality" : q}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--secondary)]/70 border border-[var(--border)]">
            {["ALL", "PUBLISHED", "DRAFT"].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedStatus === s
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {s === "ALL" ? "All Status" : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Movies Grid / Table ── */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-4 shadow-xs">
          <Film className="w-12 h-12 text-amber-500/40 mx-auto" />
          <h3 className="text-base font-bold text-[var(--foreground)]">No Movies Found</h3>
          <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto leading-relaxed">
            {searchQuery
              ? `No movies matching "${searchQuery}". Try clearing filters.`
              : "There are no movies in the cinema catalog yet. Click below to add your first movie title."}
          </p>
          <Link
            href="/admin/movies/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-yellow-400 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Movie</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredMovies.map((movie) => {
            const year = movie.version || new Date(movie.created_at).getFullYear();
            const normalBytes = movie.size_bytes || 1500000000;
            const sizeNormalStr = `${(normalBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
            const sizeVipStr = `${((normalBytes * 2.8) / (1024 * 1024 * 1024)).toFixed(1)} GB`;

            const qualityBadge =
              (movie.tags || []).find((t) =>
                ["4K UHD", "1080p FHD", "720p HD", "4K HDR Dolby"].includes(t)
              ) || (movie.price > 0 ? "4K UHD" : "1080p FHD");

            return (
              <div
                key={movie.id}
                className="group flex flex-col rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-500/40 transition-all duration-300"
              >
                {/* Poster Artwork Header */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-950">
                  {movie.thumbnail_url ? (
                    <Image
                      src={movie.thumbnail_url}
                      alt={movie.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                      <Film className="w-10 h-10 opacity-30" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500 text-neutral-950 shadow-sm">
                      {qualityBadge}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm border border-white/10">
                      {year}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {movie.status === "PUBLISHED" ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/90 text-white shadow-sm flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Live
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/90 text-neutral-950 shadow-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Draft
                      </span>
                    )}
                  </div>

                  {/* Audio Specs at bottom of poster */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-[10px] text-neutral-300 font-medium truncate flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{movie.platform || "Multi-Audio 5.1 Dolby"}</span>
                  </div>
                </div>

                {/* Movie Information Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)] line-clamp-1 group-hover:text-amber-500 transition-colors">
                      {movie.title}
                    </h3>
                    {movie.developer && (
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 line-clamp-1 font-medium">
                        {movie.developer}
                      </p>
                    )}

                    {/* Genres */}
                    {Array.isArray(movie.tags) && movie.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {movie.tags
                          .filter((t) => !["movie", "movies", "cinema"].includes(t.toLowerCase()))
                          .slice(0, 3)
                          .map((g) => (
                            <span
                              key={g}
                              className="px-2 py-0.5 rounded text-[9px] font-medium bg-[var(--secondary)] text-[var(--muted-foreground)]"
                            >
                              {g}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Sizes & Pricing Breakdown */}
                  <div className="p-2.5 rounded-xl bg-[var(--secondary)]/60 border border-[var(--border)] grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
                      <Download className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>Free: <strong className="text-[var(--foreground)] font-mono">{sizeNormalStr}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
                      <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>VIP: <strong className="text-amber-500 font-mono">₹{movie.price || 49}</strong></span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between gap-2">
                    <a
                      href="/movies"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                      title="View live on website"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Live</span>
                    </a>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/movies/${movie.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--secondary)] hover:bg-[var(--border)] text-xs font-bold text-[var(--foreground)] transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5 text-amber-500" />
                        <span>Edit</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setMovieToDelete(movie)}
                        className="p-1.5 rounded-xl text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
                        title="Delete movie"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {movieToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[var(--card)] border border-red-500/40 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto ring-1 ring-red-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[var(--foreground)]">
              Delete Movie Release?
            </h4>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-[var(--foreground)]">{movieToDelete.title}</strong>? It will be removed from the public Movies catalog immediately.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMovieToDelete(null)}
                className="py-2.5 px-4 rounded-xl border border-[var(--border)] bg-[var(--secondary)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--border)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteMovie}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
