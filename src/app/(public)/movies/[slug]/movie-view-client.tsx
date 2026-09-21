"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Film,
  Download,
  Crown,
  ChevronRight,
  HardDrive,
  Sparkles,
  Play,
  Clock,
  ShieldCheck,
  X,
  Zap,
  Star,
  ExternalLink,
  Camera,
  ArrowLeft,
  CheckCircle2,
  Share2,
  Copy,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { UpiQrCard } from "@/components/payments/upi-qr-card";
import { AdSlot } from "@/components/ads/ad-slot";
import type { MovieDownloadLink, MovieItem } from "../movies-client";
import { getYoutubeEmbedUrl } from "../movies-client";
import type { AdPlacement } from "@/types/database";

interface MovieViewClientProps {
  movie: MovieItem;
  relatedMovies: MovieItem[];
  isLoggedIn?: boolean;
  hasVipAccess?: boolean;
  hasPendingOrder?: boolean;
  movieSlug?: string;
  resourceAd?: AdPlacement | null;
  inFeedAd?: AdPlacement | null;
}

export function MovieViewClient({
  movie,
  relatedMovies,
  isLoggedIn = false,
  hasVipAccess = false,
  hasPendingOrder = false,
  movieSlug = "",
  resourceAd,
  inFeedAd,
}: MovieViewClientProps) {
  const { showToast } = useToast();

  // State for normal free download countdown
  const [activeNormalLink, setActiveNormalLink] = useState<MovieDownloadLink | null>(null);
  const [normalCountdown, setNormalCountdown] = useState(5);
  const [isNormalReady, setIsNormalReady] = useState(false);

  // State for VIP download modal
  const [showVipModal, setShowVipModal] = useState(false);
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);

  // UTR submission state
  const [utrValue, setUtrValue] = useState("");
  const [utrSubmitted, setUtrSubmitted] = useState(hasPendingOrder);

  // Lightbox zoom for screenshot frames
  const [activeZoomImage, setActiveZoomImage] = useState<string | null>(null);

  // 1-Tap Copy state for links and details
  const [copiedItemKey, setCopiedItemKey] = useState<string | null>(null);

  const trailerEmbedUrl = getYoutubeEmbedUrl(movie.trailerUrl);

  const handleCopyLink = async (url: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedItemKey(key);
      setTimeout(() => setCopiedItemKey(null), 2000);
      showToast({
        type: "success",
        title: "Link Copied! 📋",
        message: `${label} link copied to clipboard.`,
      });
    } catch {
      showToast({
        type: "info",
        title: "Copy Notice",
        message: "Please select and copy the link manually.",
      });
    }
  };

  const handleCopyDetails = async () => {
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";
    const lines = [
      `🎬 ${movie.title} (${movie.year})`,
      `⭐ Quality: ${movie.quality}`,
      movie.audio ? `🔊 Audio: ${movie.audio}` : null,
      movie.cast ? `👥 Cast & Director: ${movie.cast}` : null,
      movie.sizeNormal ? `📦 Free Sizes: ${movie.sizeNormal}` : null,
      movie.sizePremium ? `👑 4K VIP Sizes: ${movie.sizePremium}` : null,
      pageUrl ? `🔗 Watch & Download: ${pageUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(lines);
      setCopiedItemKey("details");
      setTimeout(() => setCopiedItemKey(null), 2500);
      showToast({
        type: "success",
        title: "Details Copied! 📋",
        message: "Movie specifications copied to clipboard.",
      });
    } catch {
      // Fallback
    }
  };

  const handleStartNormalDownload = (link: MovieDownloadLink) => {
    setActiveNormalLink(link);
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${movie.title} - Free & 4K VIP Download`,
          text: `Download ${movie.title} in pristine 4K UHD and 1080p on NammaTech!`,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink(window.location.href, "share-nav", "Movie");
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* ── Breadcrumb Navigation ── */}
      <nav className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-[var(--foreground)] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/movies" className="hover:text-[var(--foreground)] transition-colors">
            Movies
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[var(--foreground)] font-semibold truncate max-w-[200px] sm:max-w-md">
            {movie.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCopyLink(window.location.href, "top-page-url", "Movie page")}
            className="p-2 sm:px-3 rounded-xl bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--foreground)] transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Copy movie page link"
          >
            {copiedItemKey === "top-page-url" ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy Link</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="p-2 sm:px-3 rounded-xl bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--foreground)] transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Share movie"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <Link
            href="/movies"
            className="p-2 sm:px-3 rounded-xl bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--foreground)] transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Hub</span>
          </Link>
        </div>
      </nav>

      {/* ── Cinematic Hero & Trailer Showcase ── */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 p-4 sm:p-8 text-white shadow-2xl space-y-6">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Badges & Title */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-neutral-950 shadow-md">
                {movie.quality}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-800 text-neutral-200 border border-neutral-700">
                {movie.year}
              </span>
              {movie.audio && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span>{movie.audio}</span>
                </span>
              )}
              {movie.hasDiscount && movie.discountPct && movie.discountPct > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-600 text-white shadow-sm uppercase tracking-wide animate-pulse">
                  {movie.discountPct}% OFF VIP DEAL
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              {movie.title}
            </h1>
            {movie.cast && (
              <p className="text-xs sm:text-sm text-neutral-300 mt-1 font-medium">
                {movie.cast}
              </p>
            )}
          </div>

          {/* Quick CTA to Download Section */}
          <div className="flex items-center gap-2.5 self-start md:self-auto flex-shrink-0">
            <a
              href="#downloads-section"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 text-xs font-black hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Options</span>
            </a>
          </div>
        </div>

        {/* ── 16:9 YouTube Video Trailer Player or Artwork ── */}
        <div className="relative z-10">
          {trailerEmbedUrl ? (
            <div className="space-y-2">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-amber-500/40 shadow-2xl">
                <iframe
                  src={trailerEmbedUrl}
                  title={`${movie.title} Official Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Official Cinema Trailer (4K/1080p Master)</span>
                </span>
                {movie.trailerUrl && (
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:text-yellow-300 transition-colors flex items-center gap-1 font-medium"
                  >
                    <span>Watch directly on YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl flex items-center justify-center">
              {movie.posterUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Film className="w-16 h-16 text-neutral-700" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-6">
                <span className="px-4 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-neutral-300 text-xs font-semibold flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-500" />
                  <span>Official Movie Artwork • Trailer Coming Soon</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Movie Metadata Grid & Storyline ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details & Quality Proof Screenshots */}
        <div className="lg:col-span-2 space-y-8">
          {/* Storyline / Synopsis */}
          <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-500" />
              <span>Storyline &amp; Synopsis</span>
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
              {movie.description ||
                "Pristine verified cinema release featuring full cast multi-language dubs and ultra high definition audio channels."}
            </p>

            {/* Genre Chips */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)]"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 4K Quality Proof Screenshots Gallery */}
          {movie.screenshots && movie.screenshots.length > 0 && (
            <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-500" />
                  <span>Movie Quality Proof Screenshots (Sample 4K Frames)</span>
                </h2>
                <span className="text-xs font-mono font-bold text-amber-500">
                  {movie.screenshots.length} Frame{movie.screenshots.length === 1 ? "" : "s"}
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Inspect sample 4K master frames to verify color grading, audio bitrate, and pristine encoding quality.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {movie.screenshots.map((screen, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveZoomImage(screen)}
                    className="group relative aspect-video rounded-xl overflow-hidden border border-[var(--border)] bg-black hover:border-amber-500 transition-all shadow-xs cursor-pointer text-left"
                    title="Click to zoom frame in high definition"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={screen}
                      alt={`Quality Proof ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-2">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/80 text-white">
                        Frame #{idx + 1}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Movie Specifications Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                Specifications
              </h2>
              <button
                type="button"
                onClick={handleCopyDetails}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-[var(--secondary)] hover:bg-amber-500/15 hover:text-amber-500 border border-[var(--border)] text-[var(--muted-foreground)] transition-all cursor-pointer"
                title="Copy full movie details & link"
              >
                {copiedItemKey === "details" ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-500 font-bold">Info Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Info</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[var(--border)]">
                <span className="text-[var(--muted-foreground)]">Release Year:</span>
                <span className="font-bold text-[var(--foreground)]">{movie.year}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-[var(--border)]">
                <span className="text-[var(--muted-foreground)]">Video Quality:</span>
                <span className="font-extrabold text-amber-500 font-mono">{movie.quality}</span>
              </div>

              {movie.audio && (
                <div className="flex flex-col gap-1 py-1 border-b border-[var(--border)]">
                  <span className="text-[var(--muted-foreground)]">Audio &amp; Dubs:</span>
                  <span className="font-semibold text-[var(--foreground)]">{movie.audio}</span>
                </div>
              )}

              {movie.cast && (
                <div className="flex flex-col gap-1 py-1 border-b border-[var(--border)]">
                  <span className="text-[var(--muted-foreground)]">Star Cast &amp; Crew:</span>
                  <span className="font-semibold text-[var(--foreground)] leading-relaxed">
                    {movie.cast}
                  </span>
                </div>
              )}

              {movie.sizeNormal && (
                <div className="flex items-center justify-between py-1 border-b border-[var(--border)]">
                  <span className="text-[var(--muted-foreground)]">Free Sizes:</span>
                  <span className="font-mono font-bold text-emerald-500">{movie.sizeNormal}</span>
                </div>
              )}

              {movie.sizePremium && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-[var(--muted-foreground)]">VIP 4K Sizes:</span>
                  <span className="font-mono font-bold text-amber-500">{movie.sizePremium}</span>
                </div>
              )}
            </div>
          </div>

          {/* Guarantee Box */}
          <div className="p-5 rounded-3xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Direct Mirror</span>
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
              Every mirror is scanned for malware and tested for high-speed direct downloads across mobile and desktop.
            </p>
          </div>
        </div>
      </div>

      {/* ── Ad Banner between specs and downloads (only rendered if active in admin) ── */}
      {resourceAd && (
        <AdSlot ad={resourceAd} location="RESOURCE_PAGE" format="auto" showLabel={false} />
      )}

      {/* ── DOWNLOADS SECTION (TWO CATEGORIES) ── */}
      <div id="downloads-section" className="space-y-6 pt-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold uppercase tracking-wider">
            <Download className="w-3.5 h-3.5" />
            <span>Download Mirrors</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">
            Select Your Preferred Download Release
          </h2>
          <p className="text-xs text-[var(--muted-foreground)]">
            Choose between Standard Free Download resolutions or upgrade to 4K VIP Premium for ultra-high speeds and uncompressed Dolby Atmos audio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start max-w-5xl mx-auto">
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* CATEGORY 1: STANDARD FREE DOWNLOADS */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="p-6 rounded-3xl border-2 border-emerald-500/30 bg-emerald-500/5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-wide">
                <Download className="w-5 h-5" />
                <span>Category 1: Standard Free Downloads</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                FREE
              </span>
            </div>

            <p className="text-xs text-[var(--muted-foreground)]">
              Verified normal resolution releases (480p, 720p, 1080p) with standard download speeds.
            </p>

            {/* List of Free Links */}
            <div className="space-y-2.5">
              {movie.freeLinks && movie.freeLinks.length > 0 ? (
                movie.freeLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl bg-[var(--card)] border border-emerald-500/30 hover:border-emerald-500 transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => handleStartNormalDownload(link)}
                      className="flex-1 flex items-center justify-between p-1.5 sm:p-2 rounded-xl hover:bg-emerald-500/10 transition-colors group cursor-pointer text-left min-w-0"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors flex-shrink-0">
                          <Download className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[var(--foreground)] group-hover:text-emerald-500 transition-colors truncate">
                            {link.title}
                          </h4>
                          <span className="text-[10px] text-[var(--muted-foreground)] block truncate">
                            Free Direct Speed Mirror
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-emerald-600 text-white shadow-xs ml-2 flex-shrink-0">
                        {link.size}
                      </span>
                    </button>

                    {/* Dedicated 1-Tap Copy Link Button */}
                    {link.url && link.url !== "#" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLink(link.url, `free-${idx}`, link.title);
                        }}
                        className={`p-2.5 rounded-xl border transition-all flex-shrink-0 cursor-pointer ${
                          copiedItemKey === `free-${idx}`
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                            : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-emerald-500 hover:border-emerald-500/50 border-[var(--border)]"
                        }`}
                        title="Copy direct download link"
                        aria-label={`Copy link for ${link.title}`}
                      >
                        {copiedItemKey === `free-${idx}` ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                ))
              ) : movie.normalDownloadUrl && movie.normalDownloadUrl !== "#" ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleStartNormalDownload({
                        title: "Standard Download",
                        size: movie.sizeNormal || "1.4 GB",
                        url: movie.normalDownloadUrl,
                        isVip: false,
                      })
                    }
                    className="flex-1 flex items-center justify-between p-4 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 font-bold text-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      <span>Download {movie.title}</span>
                    </div>
                    <span className="font-mono">{movie.sizeNormal || "1.4 GB"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(movie.normalDownloadUrl, "free-fallback", movie.title)}
                    className={`p-4 rounded-2xl border transition-all flex-shrink-0 cursor-pointer ${
                      copiedItemKey === "free-fallback"
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-[var(--secondary)] text-[var(--foreground)] border-[var(--border)] hover:border-emerald-500/50"
                    }`}
                    title="Copy direct download link"
                  >
                    {copiedItemKey === "free-fallback" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/5 text-center space-y-1.5">
                  <Clock className="w-5 h-5 text-emerald-500 mx-auto" />
                  <h4 className="text-xs font-bold text-[var(--foreground)]">
                    No Free Download Links Available Yet
                  </h4>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Verified standard mirrors are being configured. Please check back shortly!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* CATEGORY 2: 4K VIP PREMIUM DOWNLOADS */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="p-6 rounded-3xl border-2 border-amber-500/40 bg-amber-500/5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-500 font-black text-xs uppercase tracking-wide">
                <Crown className="w-5 h-5" />
                <span>Category 2: 4K VIP Premium Downloads</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-neutral-950">
                VIP ACCESS
              </span>
            </div>

            {/* VIP Pricing Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-red-500/20 border border-amber-500/40 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  VIP Cinema Access
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-amber-500 font-mono">
                    {movie.premiumPrice <= 0 ? "FREE" : `₹${movie.premiumPrice}`}
                  </span>
                  {movie.hasDiscount && movie.regularPrice && (
                    <span className="line-through text-xs font-semibold text-[var(--muted-foreground)]">
                      MRP ₹{movie.regularPrice}
                    </span>
                  )}
                </div>
              </div>
              {movie.hasDiscount && movie.discountPct && movie.discountPct > 0 && (
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-sm uppercase">
                    {movie.discountPct}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* VIP Included Sizes */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[var(--foreground)] block">
                Included 4K VIP Releases:
              </span>
              {movie.vipLinks && movie.vipLinks.length > 0 ? (
                <div className="space-y-2">
                  {movie.vipLinks.map((link, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-[var(--card)] border border-amber-500/30 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-[var(--foreground)] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        {link.title}
                      </span>
                      <span className="font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                        {link.size}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-[var(--card)] border border-amber-500/20 text-xs text-[var(--muted-foreground)] text-center">
                  Includes 4K UHD Master release ({movie.sizePremium || "6.5 GB"})
                </div>
              )}
            </div>

            {/* VIP Action — Auth Gate */}
            {hasVipAccess ? (
              // UNLOCKED: Show VIP links directly
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-500">VIP Access Unlocked!</p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">Your 4K VIP downloads are ready below.</p>
                  </div>
                </div>
                {movie.vipLinks && movie.vipLinks.length > 0 && (
                  <div className="space-y-2">
                    {movie.vipLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/15 border border-amber-500/40 text-xs font-bold hover:brightness-110 transition-all"
                        onClick={() => showToast({ type: "success", title: "Download Started", message: `${link.title} (${link.size})` })}
                      >
                        <span className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-[var(--foreground)]">{link.title}</span>
                        </span>
                        <span className="font-mono text-amber-500">{link.size}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : !isLoggedIn ? (
              // NOT LOGGED IN: Show Sign-In Gate
              <div className="space-y-3 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[var(--foreground)]">Sign In to Access VIP Downloads</h4>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Create a free account or sign in to unlock 4K VIP cinema downloads.
                  </p>
                </div>
                <a
                  href={`/auth/login?next=/movies/${movieSlug}`}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-neutral-950 font-black text-xs hover:brightness-110 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4 fill-neutral-950" />
                  <span>Sign In to Unlock VIP Access</span>
                </a>
                <p className="text-[10px] text-[var(--muted-foreground)]">Free standard downloads don&apos;t require sign-in.</p>
              </div>
            ) : utrSubmitted ? (
              // UTR SUBMITTED: Show Pending state
              <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <h4 className="text-sm font-bold text-[var(--foreground)]">Payment Under Review</h4>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Your UTR/transaction ID has been submitted. Our team will verify and unlock your 4K VIP access shortly (usually within 30 minutes).
                </p>
                <div className="px-3 py-2 rounded-xl bg-[var(--secondary)] text-xs font-mono text-[var(--muted-foreground)] text-left">
                  🔄 Verification in Progress...
                </div>
              </div>
            ) : (
              // LOGGED IN, NO ACCESS: Show Payment Button
              <button
                type="button"
                onClick={() => setShowVipModal(true)}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-neutral-950 font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown className="w-4 h-4 fill-neutral-950" />
                <span>
                  {movie.premiumPrice <= 0
                    ? "Download 4K VIP Releases Now (100% Free)"
                    : `Unlock 4K VIP Access for ₹${movie.premiumPrice}`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Ad Banner above related movies (only rendered if active in admin) ── */}
      {inFeedAd && (
        <AdSlot ad={inFeedAd} location="IN_FEED" format="auto" showLabel={false} />
      )}

      {/* ── Related Blockbuster Movies ── */}
      {relatedMovies.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[var(--foreground)]">
                More Blockbuster Cinema
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Explore verified regional releases and top-trending cinema.
              </p>
            </div>
            <Link
              href="/movies"
              className="text-xs font-semibold text-amber-500 hover:underline flex items-center gap-1"
            >
              <span>View All Movies</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedMovies.map((m) => (
              <Link
                key={m.id}
                href={`/movies/${m.slug || m.id}`}
                className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-amber-500/40 hover:shadow-lg transition-all"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                  {m.posterUrl ? (
                    <Image
                      src={m.posterUrl}
                      alt={m.title}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Film className="w-10 h-10 text-neutral-700" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500 text-neutral-950">
                    {m.quality}
                  </div>
                </div>
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[var(--foreground)] group-hover:text-amber-500 transition-colors line-clamp-1">
                      {m.title}
                    </h3>
                    <span className="text-[10px] text-[var(--muted-foreground)] mt-0.5 block">
                      {m.year} • {m.audio || "Multi-Audio"}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-500 mt-2 flex items-center gap-1">
                    <Play className="w-3 h-3 fill-amber-500" />
                    <span>Watch &amp; Download</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Normal Free Download Modal with 5s Timer ── */}
      {activeNormalLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 my-auto">
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
                    {activeNormalLink.title} ({activeNormalLink.size})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveNormalLink(null)}
                className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
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
                      Mirror Ready!
                    </h5>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      Click below to start your high-speed direct download.
                    </p>
                  </div>

                  {activeNormalLink.url && activeNormalLink.url !== "#" ? (
                    <div className="space-y-2">
                      <a
                        href={activeNormalLink.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                        onClick={() => {
                          if (movie.id) {
                            fetch("/api/downloads/record", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ resourceId: movie.id }),
                            }).catch(() => {});
                          }
                          showToast({
                            type: "success",
                            title: "Download Started",
                            message: `Downloading ${movie.title} (${activeNormalLink.size})!`,
                          });
                          setTimeout(() => setActiveNormalLink(null), 1500);
                        }}
                      >
                        <Download className="w-4 h-4" />
                        <span>Click to Download Now ({activeNormalLink.size})</span>
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyLink(
                            activeNormalLink.url,
                            "modal-free-link",
                            `${activeNormalLink.title}`
                          )
                        }
                        className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--secondary)] text-[var(--foreground)] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {copiedItemKey === "modal-free-link" ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500 font-bold">Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Direct Download Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 text-xs text-amber-500">
                      File link is currently processing. Please check back shortly!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Premium VIP Modal ── */}
      {showVipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[var(--card)] border border-amber-500/40 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 my-auto max-h-[92vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-[var(--foreground)]">
                    4K Ultra HD VIP Access
                  </h4>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    {movie.title} • {movie.sizePremium || "6.5 GB"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVipModal(false)}
                className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If ₹0 / Free VIP */}
            {movie.premiumPrice <= 0 ? (
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500 text-neutral-950 font-black text-[10px] uppercase">
                    🎉 100% Free VIP Access
                  </span>
                  <p className="text-xs text-[var(--foreground)] font-bold">
                    Special offer active: Download 4K VIP releases directly!
                  </p>
                </div>

                <div className="space-y-2">
                  {movie.vipLinks && movie.vipLinks.length > 0 ? (
                    movie.vipLinks.map((link, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/15 border border-amber-500/40 shadow-xs"
                      >
                        <a
                          href={link.url || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-between p-1.5 font-bold text-xs cursor-pointer min-w-0"
                          onClick={() => {
                            showToast({
                              type: "success",
                              title: "Download Started",
                              message: `Starting ${link.title} (${link.size})!`,
                            });
                          }}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <Crown className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                            <span className="truncate">{link.title}</span>
                          </span>
                          <span className="font-mono text-amber-500 ml-2 flex-shrink-0">{link.size}</span>
                        </a>

                        {link.url && link.url !== "#" && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyLink(link.url, `vip-modal-${idx}`, link.title);
                            }}
                            className={`p-2 rounded-xl border transition-all flex-shrink-0 cursor-pointer ${
                              copiedItemKey === `vip-modal-${idx}`
                                ? "bg-amber-500 text-neutral-950 border-amber-500 shadow-sm"
                                : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-amber-500 hover:border-amber-500/50 border-[var(--border)]"
                            }`}
                            title="Copy VIP cloud download link"
                          >
                            {copiedItemKey === `vip-modal-${idx}` ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-amber-500/40 text-center text-xs text-[var(--muted-foreground)]">
                      VIP 4K mirror being refreshed. Please check back shortly!
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Regular Paid VIP Flow with UPI QR */
              <div className="border-t border-[var(--border)] pt-3">
                <UpiQrCard
                  amount={movie.premiumPrice}
                  orderNumber={`MOV-${Date.now().toString().slice(-6)}`}
                  upiId="muthurajc@slc"
                  isProcessing={isSubmittingUtr}
                  onConfirmPayment={async (utr) => {
                    setIsSubmittingUtr(true);
                    try {
                      const res = await fetch("/api/payments/submit-utr", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          movie_id: movie.id,
                          movie_title: movie.title,
                          utr_number: utr,
                          amount: movie.premiumPrice,
                          payment_provider: "UPI",
                        }),
                      });

                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || "Submission failed");

                      setUtrSubmitted(true);
                      setUtrValue(utr);
                      showToast({
                        type: "success",
                        title: "Payment Submitted! 🚀",
                        message: `UTR ${utr} recorded for ${movie.title}. Verification usually takes 30 minutes.`,
                        duration: 8000,
                      });
                      setShowVipModal(false);
                    } catch (err: any) {
                      showToast({
                        type: "error",
                        title: "Submission Error",
                        message: err?.message || "Failed to submit payment details. Please try again.",
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
