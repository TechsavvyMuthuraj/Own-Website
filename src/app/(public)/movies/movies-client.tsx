"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Film,
  Download,
  Crown,
  Search,
  CheckCircle2,
  HardDrive,
  Sparkles,
  Play,
  Clock,
  ShieldCheck,
  X,
  Copy,
  Check,
  Zap,
  Star,
  Layers,
  ArrowRight,
  ExternalLink,
  Camera,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth/auth-context";
import { UpiQrCard } from "@/components/payments/upi-qr-card";

export interface MovieDownloadLink {
  id?: string;
  title: string;
  size: string;
  url: string;
  isVip: boolean;
}

export interface MovieItem {
  id: string;
  title: string;
  slug?: string;
  year: number;
  genres: string[];
  quality: string;
  posterUrl: string;
  rating?: string;
  sizeNormal: string;
  sizePremium: string;
  audio: string;
  cast?: string;
  trailerUrl?: string;
  normalDownloadUrl: string;
  premiumPrice: number;
  regularPrice?: number;
  hasDiscount?: boolean;
  discountPct?: number;
  description: string;
  shortDescription?: string;
  duration?: string;
  screenshots?: string[];
  freeLinks?: MovieDownloadLink[];
  vipLinks?: MovieDownloadLink[];
}

export function getYoutubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const clean = url.trim();
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = clean.match(regExp);
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=0&rel=0`;
  }
  return null;
}

interface MoviesClientProps {
  movies: MovieItem[];
}

export function MoviesClient({ movies }: MoviesClientProps) {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuality, setSelectedQuality] = useState<string>("ALL");
  const [selectedGenre, setSelectedGenre] = useState<string>("ALL");

  // Details Modal and Lightbox states
  const [activeDetailMovie, setActiveDetailMovie] = useState<MovieItem | null>(null);
  const [activeZoomImage, setActiveZoomImage] = useState<string | null>(null);

  // Download Modals state
  const [activeNormalMovie, setActiveNormalMovie] = useState<MovieItem | null>(null);
  const [normalCountdown, setNormalCountdown] = useState(5);
  const [isNormalReady, setIsNormalReady] = useState(false);

  const [activePremiumMovie, setActivePremiumMovie] = useState<MovieItem | null>(null);
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);

  // Extract unique genres
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => m.genres.forEach((g) => set.add(g)));
    return Array.from(set);
  }, [movies]);

  // Filtered movies
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.genres.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase())) ||
        movie.audio.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesQuality =
        selectedQuality === "ALL" || movie.quality === selectedQuality;

      const matchesGenre =
        selectedGenre === "ALL" || movie.genres.includes(selectedGenre);

      return matchesSearch && matchesQuality && matchesGenre;
    });
  }, [movies, searchQuery, selectedQuality, selectedGenre]);

  // Handle Free / Normal Download initiation
  const handleStartNormalDownload = (movie: MovieItem) => {
    setActiveNormalMovie(movie);
    setNormalCountdown(5);
    setIsNormalReady(false);

    let current = 5;
    const interval = setInterval(() => {
      current -= 1;
      setNormalCountdown(current);
      if (current <= 0) {
        clearInterval(interval);
        setIsNormalReady(true);
      }
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* ── Movies Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 p-6 sm:p-10 text-white shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Film className="w-3.5 h-3.5" />
            <span>NammaTech Cinema Zone</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
            Blockbuster Movies & Cinema Downloads
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl mb-6">
            Download your favorite regional & global blockbusters in pristine clarity. Choose between <strong className="text-emerald-400">Normal Free Download</strong> (standard speed) or upgrade to <strong className="text-amber-400">👑 VIP Premium 4K</strong> for blazing 1000 Mbps ultra-speed and Dolby Atmos audio.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-300">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>4K Ultra HD & 1080p</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Direct Links</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>Multi-Audio Dolby 5.1</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movie title, actor, or language..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
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

          {/* Quality Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
            <span className="text-xs font-semibold text-[var(--muted-foreground)] mr-1 hidden sm:inline">
              Quality:
            </span>
            {["ALL", "4K UHD", "1080p FHD", "720p HD"].map((q) => (
              <button
                key={q}
                onClick={() => setSelectedQuality(q)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedQuality === q
                    ? "bg-amber-500 text-neutral-950 shadow-sm"
                    : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {q === "ALL" ? "All Qualities" : q}
              </button>
            ))}
          </div>
        </div>

        {/* Genre Tags Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          <span className="text-[var(--muted-foreground)] font-medium flex-shrink-0">
            Genre:
          </span>
          <button
            onClick={() => setSelectedGenre("ALL")}
            className={`px-3 py-1 rounded-lg font-medium transition-colors flex-shrink-0 ${
              selectedGenre === "ALL"
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            All Genres
          </button>
          {allGenres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex-shrink-0 ${
                selectedGenre === g
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* ── Movie Results Grid ── */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-3">
          <Film className="w-12 h-12 text-amber-500/50 mx-auto mb-2" />
          <h3 className="text-base font-bold text-[var(--foreground)]">No Movies Published Yet</h3>
          <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto leading-relaxed">
            There are currently no cinema resources available in the catalog. Please check back soon or explore our other verified software and utility categories.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/categories"
              className="px-4 py-2 rounded-xl bg-[var(--secondary)] text-xs font-semibold hover:bg-[var(--border)] text-[var(--foreground)] transition-all"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all duration-300"
            >
              {/* Poster Image Container */}
              <Link
                href={`/movies/${movie.slug || movie.id}`}
                className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900 cursor-pointer block"
              >
                {movie.posterUrl ? (
                  <Image
                    src={movie.posterUrl}
                    alt={movie.title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority={false}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Film className="w-16 h-16 text-neutral-700" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Hover Play / View Details Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3 text-center">
                  <div className="w-11 h-11 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-neutral-950 ml-0.5" />
                  </div>
                  <span className="text-[11px] font-black text-white bg-black/70 px-3 py-1 rounded-full backdrop-blur-xs border border-white/20">
                    {movie.trailerUrl ? "Play Trailer & View Details" : "View Movie Details"}
                  </span>
                </div>

                {/* Floating Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap max-w-[80%] pointer-events-none">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500 text-neutral-950 shadow-md">
                    {movie.quality}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm border border-white/10">
                    {movie.year}
                  </span>
                  {movie.hasDiscount && movie.discountPct && movie.discountPct > 0 && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md animate-pulse">
                      {movie.discountPct}% OFF
                    </span>
                  )}
                </div>

                {/* Rating badge — only if real rating exists */}
                {movie.rating && (
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/70 text-amber-400 backdrop-blur-sm border border-amber-500/20 pointer-events-none">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{movie.rating}</span>
                  </div>
                )}

                {/* Audio Badge — only if real audio info exists */}
                {movie.audio && (
                  <div className="absolute bottom-2 left-2.5 right-2.5 text-[10px] text-neutral-300 font-medium truncate flex items-center gap-1 pointer-events-none">
                    <Zap className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{movie.audio}</span>
                  </div>
                )}
              </Link>

              {/* Movie Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3>
                    <Link
                      href={`/movies/${movie.slug || movie.id}`}
                      className="text-sm font-bold text-[var(--foreground)] line-clamp-1 group-hover:text-amber-500 transition-colors cursor-pointer"
                    >
                      {movie.title}
                    </Link>
                  </h3>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-1 line-clamp-2 leading-relaxed">
                    {movie.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {movie.genres.map((g) => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--secondary)] text-[var(--muted-foreground)]"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sizes breakdown — only show rows that have real data */}
                {(movie.sizeNormal || movie.sizePremium) && (
                  <div className="pt-2 border-t border-[var(--border)] grid grid-cols-2 gap-2 text-[11px]">
                    {movie.sizeNormal && (
                      <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                        <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Free: <strong className="text-[var(--foreground)] font-mono">{movie.sizeNormal}</strong></span>
                      </div>
                    )}
                    {movie.sizePremium && (
                      <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                        <span>VIP: <strong className="text-[var(--foreground)] font-mono">{movie.sizePremium}</strong></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons: Details/Trailer + Free Download + VIP Download */}
                <div className="space-y-2 pt-1">
                  {/* View Details & Watch Trailer Button */}
                  <Link
                    href={`/movies/${movie.slug || movie.id}`}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500 hover:text-neutral-950 text-amber-500 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{movie.trailerUrl ? "Watch Trailer & Details" : "View Details & Frames"}</span>
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Normal Free Download Button */}
                    <button
                      type="button"
                      onClick={() => handleStartNormalDownload(movie)}
                      className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)] hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 text-[11px] font-semibold transition-all cursor-pointer truncate"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="truncate">Free</span>
                    </button>

                    {/* Premium VIP Download Button */}
                    <button
                      type="button"
                      onClick={() => setActivePremiumMovie(movie)}
                      className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-neutral-950 text-[11px] font-extrabold hover:brightness-110 active:scale-[0.98] transition-all shadow-sm shadow-amber-500/20 cursor-pointer truncate"
                    >
                      <Crown className="w-3.5 h-3.5 fill-neutral-950 flex-shrink-0" />
                      <span className="truncate">VIP ({movie.premiumPrice <= 0 ? "FREE" : `₹${movie.premiumPrice}`})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Normal Free Download Modal ── */}
      {activeNormalMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--foreground)]">
                    Free Standard Download
                  </h4>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {activeNormalMovie.title} ({activeNormalMovie.sizeNormal})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveNormalMovie(null)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/60 text-center space-y-3">
              {!isNormalReady ? (
                <div className="py-4 space-y-2">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-[var(--foreground)]">
                    Generating secure download mirror...
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Link ready in <span className="font-bold text-emerald-500 font-mono text-sm">{normalCountdown}s</span>
                  </p>
                </div>
              ) : (
                <div className="py-2 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[var(--foreground)]">
                      Download Options Ready!
                    </h5>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      Select your preferred resolution and file size below (Verified Safe).
                    </p>
                  </div>

                  <div className="space-y-2 pt-1 w-full text-left">
                    {activeNormalMovie.freeLinks && activeNormalMovie.freeLinks.length > 0 ? (
                      activeNormalMovie.freeLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl bg-[var(--card)] border border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all shadow-xs group cursor-pointer"
                          onClick={() => {
                            if (activeNormalMovie.id) {
                              fetch("/api/downloads/record", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ resourceId: activeNormalMovie.id }),
                              }).catch(() => {});
                            }
                            showToast({
                              type: "success",
                              title: "Download Started",
                              message: `Starting ${link.title} (${link.size})!`,
                            });
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                              <Download className="w-4 h-4" />
                            </div>
                            <div>
                              <h6 className="text-xs font-bold text-[var(--foreground)] group-hover:text-emerald-500 transition-colors">
                                {link.title}
                              </h6>
                              <span className="text-[10px] text-[var(--muted-foreground)]">
                                Free Direct Speed Mirror
                              </span>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-600 text-white shadow-xs flex-shrink-0">
                            {link.size}
                          </span>
                        </a>
                      ))
                    ) : activeNormalMovie.normalDownloadUrl && activeNormalMovie.normalDownloadUrl !== "#" ? (
                      <a
                        href={activeNormalMovie.normalDownloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
                        onClick={() => {
                          if (activeNormalMovie.id) {
                            fetch("/api/downloads/record", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ resourceId: activeNormalMovie.id }),
                            }).catch(() => {});
                          }
                          showToast({
                            type: "success",
                            title: "Download Started",
                            message: `Enjoy ${activeNormalMovie.title}!`,
                          });
                          setTimeout(() => setActiveNormalMovie(null), 1500);
                        }}
                      >
                        <Download className="w-4 h-4" />
                        <span>Click Here to Download Now ({activeNormalMovie.sizeNormal || "Standard"})</span>
                      </a>
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 text-center space-y-1.5">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                          <Clock className="w-4 h-4" />
                        </div>
                        <h6 className="text-xs font-bold text-[var(--foreground)]">
                          No Download Link Available Yet
                        </h6>
                        <p className="text-[11px] text-[var(--muted-foreground)]">
                          Verified file mirrors for this title are currently being uploaded or processed. Please check back shortly!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Upgrade banner inside normal download */}
            <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-500">
                <Crown className="w-4 h-4 flex-shrink-0" />
                <span className="text-[11px] text-[var(--foreground)]">
                  Want instant 1000 Mbps & 4K UHD?
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const m = activeNormalMovie;
                  setActiveNormalMovie(null);
                  setActivePremiumMovie(m);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500 text-neutral-950 font-bold text-[11px] hover:brightness-110 cursor-pointer whitespace-nowrap"
              >
                Go VIP (₹{activeNormalMovie.premiumPrice})
                {activeNormalMovie.hasDiscount && ` • ${activeNormalMovie.discountPct}% OFF`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Premium VIP Download Modal ── */}
      {activePremiumMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[var(--card)] border border-amber-500/40 rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl space-y-3 sm:space-y-4 my-auto max-h-[92vh] overflow-y-auto scrollbar-thin">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm sm:text-base font-black text-[var(--foreground)]">
                      4K Ultra HD VIP Access
                    </h4>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500 text-neutral-950">
                      VIP LINK
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    {activePremiumMovie.title} • {activePremiumMovie.sizePremium}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePremiumMovie(null)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* VIP Discount Banner */}
            {activePremiumMovie.hasDiscount && activePremiumMovie.regularPrice && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-red-500/20 border border-amber-500/40 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-amber-500 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Special VIP Discount Deal
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-black text-amber-500 font-mono">
                      ₹{activePremiumMovie.premiumPrice}
                    </span>
                    <span className="line-through text-xs font-semibold text-[var(--muted-foreground)]">
                      MRP ₹{activePremiumMovie.regularPrice}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-sm uppercase tracking-wide">
                    {activePremiumMovie.discountPct}% OFF
                  </span>
                  <span className="block text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold mt-0.5">
                    Save ₹{activePremiumMovie.regularPrice - activePremiumMovie.premiumPrice}
                  </span>
                </div>
              </div>
            )}

            {/* VIP Perks */}
            <div className="grid grid-cols-3 gap-1.5 text-center text-[9px] sm:text-[10px]">
              <div className="p-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/60">
                <Zap className="w-3.5 h-3.5 text-amber-500 mx-auto mb-0.5" />
                <span className="font-bold text-[var(--foreground)] block">1000 Mbps</span>
                <span className="text-[var(--muted-foreground)]">Zero Waiting</span>
              </div>
              <div className="p-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/60">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 mx-auto mb-0.5" />
                <span className="font-bold text-[var(--foreground)] block">4K HDR</span>
                <span className="text-[var(--muted-foreground)]">Dolby 5.1</span>
              </div>
              <div className="p-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-0.5" />
                <span className="font-bold text-[var(--foreground)] block">Lifetime</span>
                <span className="text-[var(--muted-foreground)]">Cloud Access</span>
              </div>
            </div>

            {/* Quality Proof Screenshots Gallery */}
            {activePremiumMovie.screenshots && activePremiumMovie.screenshots.length > 0 && (
              <div className="p-3 rounded-2xl bg-[var(--secondary)]/60 border border-[var(--border)] text-left space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--foreground)]">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quality Proof &amp; 4K Sample Frames:</span>
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                    {activePremiumMovie.screenshots.length} Verified Frame{activePremiumMovie.screenshots.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
                  {activePremiumMovie.screenshots.map((screen, idx) => (
                    <a
                      key={idx}
                      href={screen}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative aspect-video rounded-lg overflow-hidden border border-[var(--border)] bg-black hover:border-amber-500 transition-all shadow-xs"
                      title="Click to inspect pristine 4K video frame"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={screen}
                        alt={`Quality Proof ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink className="w-3 h-3 text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Included VIP Tiers List Based on Size */}
            {activePremiumMovie.vipLinks && activePremiumMovie.vipLinks.length > 0 && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-1.5">
                <div className="flex items-center justify-between text-amber-500 font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Included 4K VIP Sizes:</span>
                  </span>
                  <span className="text-[9px] font-mono uppercase bg-amber-500 text-neutral-950 px-1.5 py-0.5 rounded font-black">
                    All Included in ₹{activePremiumMovie.premiumPrice}
                  </span>
                </div>
                <div className="divide-y divide-amber-500/20 text-xs">
                  {activePremiumMovie.vipLinks.map((v, i) => (
                    <div key={i} className="py-1 flex items-center justify-between">
                      <span className="font-semibold text-[var(--foreground)] text-[11px] flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        {v.title}
                      </span>
                      <span className="font-mono font-bold text-amber-500 text-[11px] bg-amber-500/10 px-2 py-0.5 rounded">
                        {v.size}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* If 100% Discount / Free VIP (₹0): Direct Instant Downloads (NO Payment Verification Needed) */}
            {activePremiumMovie.premiumPrice <= 0 ? (
              <div className="space-y-3 border-t border-[var(--border)] pt-3">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-neutral-950 font-black text-[10px] uppercase">
                    🎉 100% Free VIP Unlocked
                  </div>
                  <h5 className="text-sm font-bold text-[var(--foreground)]">
                    No Payment Needed — Download Instantly!
                  </h5>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Special 100% discount offer active. Click your preferred 4K master size below to start your high-speed download directly.
                  </p>
                </div>

                <div className="space-y-2">
                  {activePremiumMovie.vipLinks && activePremiumMovie.vipLinks.length > 0 ? (
                    activePremiumMovie.vipLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/40 hover:border-amber-500 hover:bg-amber-500/25 transition-all shadow-sm group cursor-pointer"
                        onClick={() => {
                          if (activePremiumMovie.id) {
                            fetch("/api/downloads/record", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ resourceId: activePremiumMovie.id }),
                            }).catch(() => {});
                          }
                          showToast({
                            type: "success",
                            title: "Download Started! 🚀",
                            message: `Starting 4K VIP download: ${link.title} (${link.size})!`,
                          });
                        }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-amber-500 text-neutral-950 shadow-xs group-hover:scale-105 transition-transform">
                            <Download className="w-4 h-4" />
                          </div>
                          <div>
                            <h6 className="text-xs font-bold text-[var(--foreground)] group-hover:text-amber-500 transition-colors flex items-center gap-1">
                              <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              {link.title}
                            </h6>
                            <span className="text-[10px] text-emerald-500 font-semibold">
                              Direct 4K VIP High Speed Mirror (Free)
                            </span>
                          </div>
                        </div>
                        <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-black bg-amber-500 text-neutral-950 shadow-sm flex-shrink-0">
                          {link.size}
                        </span>
                      </a>
                    ))
                  ) : activePremiumMovie.normalDownloadUrl && activePremiumMovie.normalDownloadUrl !== "#" ? (
                    <a
                      href={activePremiumMovie.normalDownloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 text-xs font-bold hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                      onClick={() => {
                        if (activePremiumMovie.id) {
                          fetch("/api/downloads/record", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ resourceId: activePremiumMovie.id }),
                          }).catch(() => {});
                        }
                        showToast({
                          type: "success",
                          title: "Download Started! 🚀",
                          message: `Downloading ${activePremiumMovie.title}!`,
                        });
                      }}
                    >
                      <Download className="w-4 h-4" />
                      <span>Click to Download VIP 4K ({activePremiumMovie.sizePremium || "Direct Link"})</span>
                    </a>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 text-center space-y-1.5">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                        <Clock className="w-4 h-4" />
                      </div>
                      <h6 className="text-xs font-bold text-[var(--foreground)]">
                        No Download Link Available Yet
                      </h6>
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        The VIP 4K file mirrors for this title are currently being uploaded or processed. Please check back shortly!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Regular Paid VIP Flow with UPI QR */
              <div className="border-t border-[var(--border)] pt-3">
                <UpiQrCard
                  amount={activePremiumMovie.premiumPrice}
                  orderNumber={`MOV-${Date.now().toString().slice(-6)}`}
                  upiId="muthurajc@slc"
                  isProcessing={isSubmittingUtr}
                  onConfirmPayment={async (utr) => {
                    setIsSubmittingUtr(true);
                    try {
                      const res = await fetch("/api/checkout/verify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          utr_number: utr,
                          order_number: `MOV-${Date.now().toString().slice(-6)}`,
                          amount: activePremiumMovie.premiumPrice,
                          items: [
                            {
                              title: activePremiumMovie.title,
                              price: activePremiumMovie.premiumPrice,
                              type: "MOVIE_VIP",
                            },
                          ],
                        }),
                      });

                      showToast({
                        type: "success",
                        title: "Payment Submitted! 🚀",
                        message: `UTR ${utr} recorded for ${activePremiumMovie.title}. Admin will verify and activate your 4K link immediately!`,
                        duration: 8000,
                      });
                      setActivePremiumMovie(null);
                    } catch (err: any) {
                      showToast({
                        type: "error",
                        title: "Submission Error",
                        message: err?.message || "Failed to submit payment details",
                      });
                    } finally {
                      setIsSubmittingUtr(false);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Interactive Movie Details & Trailer Modal ── */}
      {activeDetailMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[var(--card)] border border-amber-500/30 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto scrollbar-thin">
            {/* Modal Top Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-[var(--foreground)]">
                      {activeDetailMovie.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500 text-neutral-950">
                      {activeDetailMovie.quality}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--secondary)] text-[var(--muted-foreground)]">
                      {activeDetailMovie.year}
                    </span>
                  </div>
                  {activeDetailMovie.audio && (
                    <p className="text-xs text-amber-500 flex items-center gap-1 mt-0.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>{activeDetailMovie.audio}</span>
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setActiveDetailMovie(null)}
                className="p-1.5 rounded-xl bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* YouTube Trailer Video Player or Artwork Banner */}
            {activeDetailMovie.trailerUrl && getYoutubeEmbedUrl(activeDetailMovie.trailerUrl) ? (
              <div className="space-y-1.5">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-amber-500/40 shadow-xl">
                  <iframe
                    src={getYoutubeEmbedUrl(activeDetailMovie.trailerUrl)!}
                    title={`${activeDetailMovie.title} Official Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)] px-1">
                  <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Official Trailer &amp; Promo</span>
                  </span>
                  <a
                    href={activeDetailMovie.trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-500 transition-colors flex items-center gap-1 font-medium"
                  >
                    <span>Open on YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-neutral-900 border border-[var(--border)] shadow-md flex items-center justify-center">
                {activeDetailMovie.posterUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={activeDetailMovie.posterUrl}
                    alt={activeDetailMovie.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Film className="w-12 h-12 text-neutral-700" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-4">
                  <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 text-neutral-300 text-xs font-semibold">
                    🎬 Official Trailer Coming Soon
                  </span>
                </div>
              </div>
            )}

            {/* Cast & Director */}
            {activeDetailMovie.cast && (
              <div className="p-3 rounded-2xl bg-[var(--secondary)]/60 border border-[var(--border)] text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] block mb-0.5">
                  Star Cast &amp; Crew
                </span>
                <span className="font-semibold text-[var(--foreground)] leading-relaxed">
                  {activeDetailMovie.cast}
                </span>
              </div>
            )}

            {/* Story Synopsis */}
            {activeDetailMovie.description && (
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] block">
                  Plot Synopsis &amp; Release Notes
                </span>
                <p className="text-[var(--foreground)] text-xs leading-relaxed">
                  {activeDetailMovie.description}
                </p>
              </div>
            )}

            {/* Genre Tags */}
            {activeDetailMovie.genres && activeDetailMovie.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {activeDetailMovie.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)]"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* 4K Quality Proof Screenshots Gallery */}
            {activeDetailMovie.screenshots && activeDetailMovie.screenshots.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--foreground)]">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-500" />
                    <span>Quality Proof &amp; 4K Sample Frames:</span>
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                    {activeDetailMovie.screenshots.length} Screenshot{activeDetailMovie.screenshots.length === 1 ? "" : "s"} (Click to zoom)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  {activeDetailMovie.screenshots.map((screen, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveZoomImage(screen)}
                      className="group relative aspect-video rounded-xl overflow-hidden border border-[var(--border)] bg-black hover:border-amber-500 transition-all shadow-xs cursor-pointer text-left"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={screen}
                        alt={`Quality Proof ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink className="w-3.5 h-3.5 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Download Action Section inside Details Modal */}
            <div className="pt-3 border-t border-[var(--border)] space-y-2.5">
              <span className="text-xs font-bold text-[var(--foreground)] block">
                Choose Download Release:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const m = activeDetailMovie;
                    setActiveDetailMovie(null);
                    handleStartNormalDownload(m);
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Free Download ({activeDetailMovie.sizeNormal || "Standard"})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const m = activeDetailMovie;
                    setActiveDetailMovie(null);
                    setActivePremiumMovie(m);
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-neutral-950 text-xs font-black hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Crown className="w-4 h-4 fill-neutral-950" />
                  <span>
                    VIP 4K Access ({activeDetailMovie.premiumPrice <= 0 ? "FREE" : `₹${activeDetailMovie.premiumPrice}`})
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Image Lightbox / Zoom Modal ── */}
      {activeZoomImage && (
        <div
          onClick={() => setActiveZoomImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-150 cursor-zoom-out"
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeZoomImage}
              alt="Zoomed Screenshot"
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain border border-neutral-700 shadow-2xl"
            />
            <button
              onClick={() => setActiveZoomImage(null)}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/70 text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
