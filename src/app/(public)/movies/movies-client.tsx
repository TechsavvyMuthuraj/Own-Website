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
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth/auth-context";
import { UpiQrCard } from "@/components/payments/upi-qr-card";

export interface MovieItem {
  id: string;
  title: string;
  year: number;
  genres: string[];
  quality: "4K UHD" | "1080p FHD" | "720p HD";
  posterUrl: string;
  rating: string;
  sizeNormal: string;
  sizePremium: string;
  audio: string;
  normalDownloadUrl: string;
  premiumPrice: number;
  description: string;
  duration?: string;
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
        <div className="text-center py-20 p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)]">
          <Film className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-[var(--foreground)]">No movies found</h3>
          <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or switching quality filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedQuality("ALL");
              setSelectedGenre("ALL");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[var(--secondary)] text-xs font-semibold hover:bg-[var(--border)] transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all duration-300"
            >
              {/* Poster Image Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Floating Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500 text-neutral-950 shadow-md">
                    {movie.quality}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm border border-white/10">
                    {movie.year}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-black/70 text-amber-400 backdrop-blur-sm border border-amber-500/20">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{movie.rating}</span>
                </div>

                {/* Audio Badge at bottom of poster */}
                <div className="absolute bottom-2 left-2.5 right-2.5 text-[10px] text-neutral-300 font-medium truncate flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{movie.audio}</span>
                </div>
              </div>

              {/* Movie Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)] line-clamp-1 group-hover:text-amber-500 transition-colors">
                    {movie.title}
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

                {/* Sizes breakdown */}
                <div className="pt-2 border-t border-[var(--border)] grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Free: <strong className="text-[var(--foreground)] font-mono">{movie.sizeNormal}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span>VIP: <strong className="text-[var(--foreground)] font-mono">{movie.sizePremium}</strong></span>
                  </div>
                </div>

                {/* Two Distinct Download Action Buttons */}
                <div className="space-y-2 pt-1">
                  {/* Normal Free Download Button */}
                  <button
                    type="button"
                    onClick={() => handleStartNormalDownload(movie)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[var(--border)] bg-[var(--secondary)] hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Normal Download (Free)</span>
                  </button>

                  {/* Premium VIP Download Button */}
                  <button
                    type="button"
                    onClick={() => setActivePremiumMovie(movie)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-neutral-950 text-xs font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <Crown className="w-4 h-4 text-neutral-950 fill-neutral-950" />
                    <span>👑 Premium VIP Download (₹{movie.premiumPrice})</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Normal Free Download Modal ── */}
      {activeNormalMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
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
                      Download Link Ready!
                    </h5>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      Standard speed mirror (720p / 1080p, Verified Safe).
                    </p>
                  </div>
                  <a
                    href={activeNormalMovie.normalDownloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20"
                    onClick={() => {
                      showToast({
                        type: "success",
                        title: "Download Started",
                        message: `Enjoy ${activeNormalMovie.title}!`,
                      });
                      setTimeout(() => setActiveNormalMovie(null), 1500);
                    }}
                  >
                    <Download className="w-4 h-4" />
                    <span>Click Here to Download Now ({activeNormalMovie.sizeNormal})</span>
                  </a>
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
                className="px-2.5 py-1 rounded-lg bg-amber-500 text-neutral-950 font-bold text-[11px] hover:brightness-110"
              >
                Go VIP (₹{activeNormalMovie.premiumPrice})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Premium VIP Download Modal ── */}
      {activePremiumMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[var(--card)] border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-[var(--foreground)]">
                      4K Ultra HD VIP Access
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-neutral-950">
                      VIP LINK
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {activePremiumMovie.title} • {activePremiumMovie.sizePremium}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePremiumMovie(null)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* VIP Perks */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/60">
                <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <span className="font-bold text-[var(--foreground)] block">1000 Mbps</span>
                <span className="text-[var(--muted-foreground)]">No Wait Time</span>
              </div>
              <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/60">
                <Sparkles className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <span className="font-bold text-[var(--foreground)] block">4K HDR</span>
                <span className="text-[var(--muted-foreground)]">Dolby Atmos</span>
              </div>
              <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/60">
                <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <span className="font-bold text-[var(--foreground)] block">Lifetime</span>
                <span className="text-[var(--muted-foreground)]">Cloud Access</span>
              </div>
            </div>

            {/* UPI QR & Direct Pay */}
            <div className="border-t border-[var(--border)] pt-4">
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
          </div>
        </div>
      )}
    </div>
  );
}
