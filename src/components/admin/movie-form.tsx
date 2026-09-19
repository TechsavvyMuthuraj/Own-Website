"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Film,
  ArrowLeft,
  Crown,
  Download,
  Star,
  Sparkles,
  Zap,
  ShieldCheck,
  Check,
  X,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  Trash2,
  ExternalLink,
  Plus,
  Layers,
  Tag,
  Percent,
  Wand2,
  Camera,
  Link2,
  Copy,
  ClipboardPaste,
} from "lucide-react";
import type { Resource } from "@/types/database";

// Universal image sanitizer to support all types of copied image addresses
export function sanitizeImageUrl(input: string): string {
  if (!input) return "";
  let clean = input.trim();

  // If BBCode: [img]url[/img]
  const bbMatch = clean.match(/\[img\](.*?)\[\/img\]/i);
  if (bbMatch) clean = bbMatch[1].trim();

  // If HTML img tag: <img ... src="url" ...>
  const imgTagMatch = clean.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgTagMatch) clean = imgTagMatch[1].trim();

  // If Markdown image: ![alt](url)
  const mdMatch = clean.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/i);
  if (mdMatch) clean = mdMatch[1].trim();

  // If Google Image redirect link: https://www.google.com/imgres?imgurl=...
  if (clean.includes("google.") && clean.includes("imgurl=")) {
    try {
      const urlObj = new URL(clean);
      const extracted = urlObj.searchParams.get("imgurl");
      if (extracted) clean = decodeURIComponent(extracted);
    } catch {
      const match = clean.match(/[?&]imgurl=([^&]+)/i);
      if (match) clean = decodeURIComponent(match[1]);
    }
  }

  // Google Drive preview link: https://drive.google.com/file/d/FILE_ID/view...
  const gDriveMatch = clean.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gDriveMatch && gDriveMatch[1]) {
    clean = `https://drive.google.com/uc?export=view&id=${gDriveMatch[1]}`;
  }

  // Strip leading or trailing quotes, brackets or whitespace
  clean = clean.replace(/^[<"'`]|["'`>]$/g, "").trim();
  return clean;
}

// Universal YouTube embed URL extractor (supports watch, embed, shorts, youtu.be)
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


interface MovieFormProps {
  initialData?: Resource;
  isEdit?: boolean;
  movieCategoryId?: string;
}

export interface SizeLinkItem {
  id?: string;
  label: string; // e.g. "720p HD", "1080p FHD", "4K UHD HDR"
  size: string;  // e.g. "700 MB", "1.4 GB", "6.5 GB"
  url: string;   // e.g. "https://..."
}

const POPULAR_GENRES = [
  "Action",
  "Thriller",
  "Sci-Fi",
  "Drama",
  "Comedy",
  "Crime",
  "Romance",
  "Adventure",
  "Horror",
  "Fantasy",
  "Mystery",
  "Feature",
];

const QUALITIES = ["4K UHD", "1080p FHD", "720p HD", "4K HDR Dolby"];

export function MovieForm({
  initialData,
  isEdit = false,
  movieCategoryId = "50e82476-24c6-498c-a703-49bbb96b0dcf",
}: MovieFormProps) {
  const router = useRouter();

  // Parse existing fields if editing
  const existingYear = initialData?.version
    ? parseInt(initialData.version, 10) || new Date(initialData.created_at || Date.now()).getFullYear()
    : new Date().getFullYear();

  const existingGenres = Array.isArray(initialData?.tags)
    ? initialData.tags.filter(
        (t) =>
          !["movie", "movies", "cinema", "4k uhd", "1080p fhd", "720p hd", "4k hdr dolby"].includes(
            t.toLowerCase()
          )
      )
    : ["Action", "Thriller"];

  const existingQuality =
    (initialData?.tags || []).find((t) =>
      ["4K UHD", "1080p FHD", "720p HD", "4K HDR Dolby"].includes(t)
    ) || (initialData?.price && initialData.price > 0 ? "4K UHD" : "1080p FHD");

  // Parse download links into Free and VIP categories based on size
  const parsedFreeLinks: SizeLinkItem[] = [];
  const parsedVipLinks: SizeLinkItem[] = [];

  if (initialData?.download_links && initialData.download_links.length > 0) {
    for (const link of initialData.download_links) {
      const isVip = link.link_type === "MIRROR";
      let label = link.title
        .replace(/^👑\s*/, "")
        .replace(/^Standard Free Download\s*/i, "")
        .trim();
      let size = "";
      const match = label.match(/\(([^)]+)\)$/);
      if (match) {
        size = match[1];
        label = label.replace(/\s*\([^)]+\)$/, "").trim();
      } else if (link.size_bytes) {
        size = `${(link.size_bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
      }

      if (isVip) {
        parsedVipLinks.push({
          label: label || "4K VIP Master",
          size: size || "3.9 GB",
          url: link.url || "",
        });
      } else {
        parsedFreeLinks.push({
          label: label || "1080p FHD",
          size: size || "1.4 GB",
          url: link.url || "",
        });
      }
    }
  }

  // Defaults if completely fresh (empty if no links exist in database)
  const initialFreeLinks: SizeLinkItem[] = parsedFreeLinks;
  const initialVipLinks: SizeLinkItem[] = parsedVipLinks;

  // ── Form State (All clean, no fake placeholder data) ──
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [year, setYear] = useState<number>(existingYear);
  const [quality, setQuality] = useState<string>(existingQuality);
  const [rating, setRating] = useState<string>(initialData?.license || "");
  const [starCast, setStarCast] = useState(initialData?.developer || "");
  const [audio, setAudio] = useState(initialData?.platform || "");
  const [genres, setGenres] = useState<string[]>(
    existingGenres.length > 0 && isEdit ? existingGenres : []
  );
  const [posterUrl, setPosterUrl] = useState(initialData?.thumbnail_url || "");
  const [trailerUrl, setTrailerUrl] = useState(initialData?.changelog || "");

  // Two Categories of Size-Based Download Links
  const [freeLinks, setFreeLinks] = useState<SizeLinkItem[]>(initialFreeLinks);
  const [vipLinks, setVipLinks] = useState<SizeLinkItem[]>(initialVipLinks);

  // VIP Pricing & Discount State
  const initialHasDiscount = Boolean(
    initialData?.sale_price !== null &&
      initialData?.sale_price !== undefined &&
      initialData.sale_price < (initialData?.price || 0)
  );

  const [hasVipDiscount, setHasVipDiscount] = useState<boolean>(initialHasDiscount);
  const [vipRegularPrice, setVipRegularPrice] = useState<number>(
    initialData?.price !== undefined && initialData.price > 0
      ? initialData.price
      : 99
  );
  const [vipOfferPrice, setVipOfferPrice] = useState<number>(
    initialData?.sale_price !== null && initialData?.sale_price !== undefined
      ? initialData.sale_price
      : 0
  );

  const discountPct =
    hasVipDiscount && vipRegularPrice > vipOfferPrice
      ? Math.round(((vipRegularPrice - vipOfferPrice) / vipRegularPrice) * 100)
      : 0;

  const [shortDescription, setShortDescription] = useState(
    initialData?.short_description || ""
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT">(
    (initialData?.status as any) === "DRAFT" ? "DRAFT" : "PUBLISHED"
  );
  const [featured, setFeatured] = useState(initialData?.featured ?? true);

  // Quality Proof Screenshots State
  const [screenshots, setScreenshots] = useState<string[]>(
    Array.isArray(initialData?.features) ? initialData.features : []
  );
  const [newScreenshotText, setNewScreenshotText] = useState("");
  const [posterError, setPosterError] = useState(false);

  // One-tap Clipboard Helpers for Desktop & Mobile
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const pasteTo = async (setter: (val: string) => void) => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setter(text.trim());
      }
    } catch {
      // Browser permission prompt or unsupported
    }
  };

  const copyVal = async (text: string, key?: string) => {
    try {
      if (text) {
        await navigator.clipboard.writeText(text);
        if (key) {
          setCopiedKey(key);
          setTimeout(() => setCopiedKey(null), 2000);
        }
      }
    } catch {
      // Fallback
    }
  };

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  const toggleGenre = (genre: string) => {
    if (genres.includes(genre)) {
      setGenres(genres.filter((g) => g !== genre));
    } else {
      setGenres([...genres, genre]);
    }
  };

  const handleAddScreenshots = () => {
    if (!newScreenshotText.trim()) return;
    const urls = newScreenshotText
      .split(/[\r\n,]+/)
      .map((l) => sanitizeImageUrl(l.trim()))
      .filter((l) => l && (l.startsWith("http://") || l.startsWith("https://")));
    setScreenshots((prev) => Array.from(new Set([...prev, ...urls])));
    setNewScreenshotText("");
  };

  const handleRemoveScreenshot = (idx: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== idx));
  };

  // Convert size strings (e.g. "700 MB", "1.4 GB") to bytes
  const parseSizeToBytes = (sizeStr: string): number => {
    const num = parseFloat(sizeStr);
    if (isNaN(num)) return 1500000000;
    if (sizeStr.toLowerCase().includes("gb")) return Math.round(num * 1024 * 1024 * 1024);
    if (sizeStr.toLowerCase().includes("mb")) return Math.round(num * 1024 * 1024);
    return Math.round(num);
  };

  // Category 1 Helper Functions (Free Links)
  const addFreeLink = () => {
    setFreeLinks((prev) => [
      ...prev,
      { label: `1080p FHD Option ${prev.length + 1}`, size: "2.0 GB", url: "" },
    ]);
  };
  const updateFreeLink = (index: number, field: keyof SizeLinkItem, val: string) => {
    setFreeLinks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };
  const removeFreeLink = (index: number) => {
    setFreeLinks((prev) => prev.filter((_, i) => i !== index));
  };

  // Category 2 Helper Functions (VIP Links)
  const addVipLink = () => {
    setVipLinks((prev) => [
      ...prev,
      { label: `4K UHD Master Option ${prev.length + 1}`, size: "8.5 GB", url: "" },
    ]);
  };
  const updateVipLink = (index: number, field: keyof SizeLinkItem, val: string) => {
    setVipLinks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };
  const removeVipLink = (index: number) => {
    setVipLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setErrorMsg("Movie title and URL slug are required.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    // Build consolidated tags
    const finalTags = Array.from(
      new Set(["movie", "movies", "Cinema", quality, ...genres])
    );

    // Prepare download_links array for database
    const downloadLinksPayload: any[] = [];
    let sortIdx = 1;

    // Category 1: Free Normal Links
    freeLinks.forEach((l) => {
      const sizeBytes = parseSizeToBytes(l.size);
      downloadLinksPayload.push({
        title: `${l.label || "Standard Download"} (${l.size || "1.4 GB"})`,
        link_type: "PRIMARY",
        url: (l.url || "").trim(),
        size_bytes: sizeBytes,
        sort_order: sortIdx++,
      });
    });

    // Category 2: 4K VIP Premium Links
    vipLinks.forEach((l) => {
      const sizeBytes = parseSizeToBytes(l.size);
      downloadLinksPayload.push({
        title: `👑 ${l.label || "VIP Master"} (${l.size || "4.2 GB"})`,
        link_type: "MIRROR",
        url: (l.url || "").trim(),
        size_bytes: sizeBytes,
        sort_order: sortIdx++,
      });
    });

    // Determine primary normal link for official_url
    const primaryNormalLink =
      freeLinks.find((l) => l.url && l.url.trim())?.url.trim() || null;

    // Approximate size_bytes for resource row
    const firstSizeBytes =
      freeLinks.length > 0 ? parseSizeToBytes(freeLinks[0].size) : 1500000000;

    const finalPrice = hasVipDiscount ? Number(vipRegularPrice) || 0 : Number(vipOfferPrice) || 0;
    const finalSalePrice =
      hasVipDiscount && Number(vipOfferPrice) < Number(vipRegularPrice)
        ? Number(vipOfferPrice)
        : null;
    const finalEffectivePrice = finalSalePrice !== null ? finalSalePrice : finalPrice;

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      category_id: movieCategoryId,
      resource_type: "MEDIA",
      access_type: finalEffectivePrice > 0 ? "PAID" : "FREE",
      price: finalPrice,
      sale_price: finalSalePrice,
      currency: "INR",
      platform: audio.trim(), // Audio specs in platform
      version: year.toString(), // Year in version
      developer: starCast.trim(), // Cast & Director in developer
      size_bytes: firstSizeBytes,
      official_url: primaryNormalLink,
      thumbnail_url: sanitizeImageUrl(posterUrl),
      icon_url: sanitizeImageUrl(posterUrl),
      short_description: shortDescription.trim(),
      description: description.trim(),
      changelog: trailerUrl.trim() || null, // YouTube Trailer URL stored in changelog
      license: rating.trim() || null, // Optional rating in license
      tags: finalTags,
      status,
      featured,
      features: screenshots.map((s) => sanitizeImageUrl(s)).filter(Boolean),
      download_links: downloadLinksPayload,
    };

    try {
      const endpoint = isEdit
        ? `/api/admin/resources/${initialData?.id}`
        : "/api/admin/resources";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to save movie details.");
      } else {
        router.push("/admin/movies");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error submitting movie details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/resources/${initialData.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/movies");
        router.refresh();
      } else {
        const d = await res.json();
        setErrorMsg(d.error || "Failed to delete movie.");
        setShowDeleteModal(false);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error deleting movie.");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/movies"
            className="p-2 rounded-xl bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[var(--foreground)] flex items-center gap-2">
              <Film className="w-5 h-5 text-amber-500" />
              <span>{isEdit ? "Edit Movie Release" : "Publish New Movie"}</span>
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              {isEdit ? `Modifying ${initialData?.title}` : "Add movie with multiple size-based Free and VIP download links"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {isEdit && (
            <>
              <a
                href="/movies"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)] text-xs font-semibold hover:bg-[var(--border)] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Live</span>
              </a>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-yellow-400 text-neutral-950 text-xs font-extrabold transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Movie...</span>
              </>
            ) : (
              <>
                <Film className="w-4 h-4" />
                <span>{isEdit ? "Update Movie" : "Publish Movie Now"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg("")}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}



      {/* Section 1: Basic Cinema Information */}
      <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-5">
        <div className="border-b border-[var(--border)] pb-3">
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-500" />
            <span>1. Movie Details & Star Cast</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[var(--foreground)]">
                Movie Title <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => pasteTo(handleTitleChange)}
                  className="px-2 py-0.5 rounded-md bg-[var(--secondary)] hover:bg-amber-500/20 text-amber-500 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Paste from clipboard"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  <span>Paste</span>
                </button>
                {title && (
                  <button
                    type="button"
                    onClick={() => copyVal(title, "title")}
                    className="px-2 py-0.5 rounded-md bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    title="Copy title"
                  >
                    {copiedKey === "title" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "title" ? "Copied" : "Copy"}</span>
                  </button>
                )}
              </div>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Leo: Bloody Sweet (2023)"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Slug */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[var(--foreground)]">
                Slug / URL Identifier <span className="text-red-500">*</span>
              </label>
              {slug && (
                <button
                  type="button"
                  onClick={() => copyVal(slug, "slug")}
                  className="px-2 py-0.5 rounded-md bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  title="Copy slug"
                >
                  {copiedKey === "slug" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "slug" ? "Copied" : "Copy"}</span>
                </button>
              )}
            </div>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="leo-bloody-sweet-2023"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Year & Quality & Rating */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--foreground)]">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10) || 2024)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--foreground)]">Quality</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              >
                {QUALITIES.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--foreground)]">IMDb Rating</label>
              <input
                type="text"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="8.5"
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          </div>

          {/* Star Cast & Director */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[var(--foreground)]">
                Star Cast & Director
              </label>
              <button
                type="button"
                onClick={() => pasteTo(setStarCast)}
                className="px-2 py-0.5 rounded-md bg-[var(--secondary)] hover:bg-amber-500/20 text-amber-500 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Paste from clipboard"
              >
                <ClipboardPaste className="w-3 h-3" />
                <span>Paste</span>
              </button>
            </div>
            <input
              type="text"
              value={starCast}
              onChange={(e) => setStarCast(e.target.value)}
              placeholder="e.g. Thalapathy Vijay, Sanjay Dutt • Directed by Lokesh Kanagaraj"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Audio Tracks & Dubs */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[var(--foreground)]">
                Audio Tracks & Sound Channels
              </label>
              <button
                type="button"
                onClick={() => pasteTo(setAudio)}
                className="px-2 py-0.5 rounded-md bg-[var(--secondary)] hover:bg-amber-500/20 text-amber-500 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Paste from clipboard"
              >
                <ClipboardPaste className="w-3 h-3" />
                <span>Paste</span>
              </button>
            </div>
            <input
              type="text"
              value={audio}
              onChange={(e) => setAudio(e.target.value)}
              placeholder="e.g. Tamil, Telugu, Hindi, Malayalam • 5.1 Dolby Atmos Clean Audio"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Genre Chips */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-xs font-semibold text-[var(--foreground)]">
              Genres (Click to select/deselect)
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_GENRES.map((g) => {
                const isSelected = genres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-amber-500 text-neutral-950 font-bold shadow-xs"
                        : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{g}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Poster Artwork & Visual Preview */}
      <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-5">
        <div className="border-b border-[var(--border)] pb-3">
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-500" />
            <span>2. Poster Artwork</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
          {/* Poster Preview Box */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/50 text-center">
            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-md flex items-center justify-center">
              {posterUrl && !posterError ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={posterUrl}
                  alt="Poster preview"
                  onError={() => setPosterError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-[var(--muted-foreground)]">
                  <Film className="w-8 h-8 mb-1 opacity-40" />
                  <span className="text-[10px]">
                    {posterError ? "Image load error (Check link)" : "No Poster"}
                  </span>
                </div>
              )}
            </div>
            <span className="text-[10px] text-[var(--muted-foreground)] mt-2">
              Live Card Preview
            </span>
          </div>

          {/* Poster URL input with universal sanitizer */}
          <div className="sm:col-span-2 space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[var(--foreground)]">
                  Movie Poster Image URL (Any Image Link Address)
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      pasteTo((val) => {
                        const cleaned = sanitizeImageUrl(val);
                        setPosterUrl(cleaned);
                        setPosterError(false);
                      })
                    }
                    className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500 hover:text-neutral-950 text-amber-500 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-amber-500/30"
                    title="Paste image link from clipboard"
                  >
                    <ClipboardPaste className="w-3 h-3" />
                    <span>Paste Link</span>
                  </button>
                  {posterUrl && (
                    <button
                      type="button"
                      onClick={() => copyVal(posterUrl, "poster")}
                      className="px-2.5 py-1 rounded-md bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      title="Copy poster link"
                    >
                      {copiedKey === "poster" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === "poster" ? "Copied" : "Copy"}</span>
                    </button>
                  )}
                </div>
              </div>
              <input
                type="text"
                value={posterUrl}
                onChange={(e) => {
                  const cleaned = sanitizeImageUrl(e.target.value);
                  setPosterUrl(cleaned);
                  setPosterError(false);
                }}
                placeholder="Paste any copied image address or direct URL..."
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Supports right-click &quot;Copy image address&quot; from anywhere on the web. Google image redirects and HTML tags are automatically sanitized!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 2B: Movie Quality Proof Screenshots ── */}
      <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-5">
        <div className="border-b border-[var(--border)] pb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-500" />
            <span>2B. Movie Quality Proof Screenshots (Sample 4K Frames)</span>
          </h3>
          <span className="text-xs font-bold text-amber-500 font-mono">
            {screenshots.length} Screenshot{screenshots.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="space-y-4">
          {/* Add Screenshots Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[var(--foreground)]">
                Paste Screenshot URLs (One per line or comma separated)
              </label>
              <button
                type="button"
                onClick={() =>
                  pasteTo((val) => {
                    setNewScreenshotText((prev) => (prev ? `${prev}\n${val}` : val));
                  })
                }
                className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500 hover:text-neutral-950 text-amber-500 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-amber-500/30"
                title="Paste URLs from clipboard"
              >
                <ClipboardPaste className="w-3 h-3" />
                <span>Paste Screenshots</span>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <textarea
                rows={2}
                value={newScreenshotText}
                onChange={(e) => setNewScreenshotText(e.target.value)}
                placeholder="https://www.pixelbb.com/images/.../screen1.jpg&#10;https://www.pixelbb.com/images/.../screen2.jpg"
                className="flex-1 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/40 scrollbar-thin"
              />
              <button
                type="button"
                onClick={handleAddScreenshots}
                className="px-4 py-2.5 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold hover:brightness-110 shadow-xs transition-all flex items-center justify-center gap-1.5 self-stretch sm:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Frames</span>
              </button>
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              These proof frames will be displayed on the public movie page and VIP modal to prove pristine 4K video resolution and audio clarity!
            </p>
          </div>

          {/* Screenshot Preview Gallery */}
          {screenshots.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {screenshots.map((url, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-video rounded-xl overflow-hidden border border-[var(--border)] bg-neutral-950 shadow-xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Quality frame ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/80 text-white">
                      Frame #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveScreenshot(idx)}
                      className="p-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                      title="Remove frame"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Section 2C: YouTube Video Trailer (Watch & Play Support) ── */}
      <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-5">
        <div className="border-b border-[var(--border)] pb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-500" />
            <span>2C. YouTube Video Trailer (Watch &amp; Play Support)</span>
          </h3>
          {trailerUrl && getYoutubeEmbedUrl(trailerUrl) && (
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Trailer Ready ✓</span>
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[var(--foreground)]">
                YouTube Trailer Link (Watch, Shorts, Embed or youtu.be)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => pasteTo(setTrailerUrl)}
                  className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500 hover:text-neutral-950 text-amber-500 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border border-amber-500/30"
                  title="Paste YouTube link from clipboard"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  <span>Paste Trailer URL</span>
                </button>
                {trailerUrl && (
                  <button
                    type="button"
                    onClick={() => copyVal(trailerUrl, "trailer")}
                    className="px-2.5 py-1 rounded-md bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    title="Copy trailer link"
                  >
                    {copiedKey === "trailer" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "trailer" ? "Copied" : "Copy"}</span>
                  </button>
                )}
              </div>
            </div>
            <input
              type="url"
              value={trailerUrl}
              onChange={(e) => setTrailerUrl(e.target.value.trim())}
              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/..."
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Users can click the movie card or the Play button to watch this trailer directly in an embedded player.
            </p>
          </div>

          {/* Live Trailer Player Preview */}
          {trailerUrl && getYoutubeEmbedUrl(trailerUrl) ? (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--foreground)]">
                <span>Live Embedded Player Preview:</span>
                <a
                  href={trailerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-amber-500 hover:underline flex items-center gap-1"
                >
                  <span>Open on YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative aspect-video max-w-lg rounded-2xl overflow-hidden bg-black border border-amber-500/30 shadow-md">
                <iframe
                  src={getYoutubeEmbedUrl(trailerUrl)!}
                  title="Trailer Preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : trailerUrl ? (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs">
              ⚠️ Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)
            </div>
          ) : null}
        </div>
      </div>

      {/* Section 3: TWO CATEGORIES OF SIZE-BASED DOWNLOAD MIRRORS */}
      <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-6">
        <div className="border-b border-[var(--border)] pb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>3. Two Download Categories (Multiple Links Based on File Size)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* CATEGORY 1: STANDARD FREE DOWNLOADS (SIZE-BASED) */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-wide">
                <Download className="w-4 h-4" />
                <span>Category 1: Standard Free Downloads</span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-white">
                FREE
              </span>
            </div>

            <p className="text-[11px] text-[var(--muted-foreground)]">
              Users can select between multiple standard resolution file sizes (e.g. 720p, 1080p).
            </p>

            {/* List of Free Size Links */}
            <div className="space-y-3">
              {freeLinks.length === 0 && (
                <div className="p-3 text-center rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5 text-xs text-[var(--muted-foreground)]">
                  No free download links added yet. Click below to add one.
                </div>
              )}
              {freeLinks.map((link, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-emerald-500/20 bg-[var(--card)] space-y-2 relative shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span>Free Option #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeFreeLink(idx)}
                      className="text-red-500 hover:text-red-700 text-[11px] flex items-center gap-1 font-semibold cursor-pointer"
                      title="Remove this option"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--muted-foreground)] mb-0.5">
                        Resolution / Label
                      </label>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateFreeLink(idx, "label", e.target.value)}
                        placeholder="e.g. 720p HD or 1080p FHD"
                        className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--muted-foreground)] mb-0.5">
                        File Size Display
                      </label>
                      <input
                        type="text"
                        value={link.size}
                        onChange={(e) => updateFreeLink(idx, "size", e.target.value)}
                        placeholder="e.g. 700 MB or 1.4 GB"
                        className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] focus:ring-1 focus:ring-emerald-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block text-[10px] font-semibold text-[var(--muted-foreground)]">
                        Direct Download URL
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => pasteTo((val) => updateFreeLink(idx, "url", val))}
                          className="text-[10px] text-emerald-500 hover:text-emerald-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <ClipboardPaste className="w-3 h-3" /> Paste
                        </button>
                        {link.url && (
                          <button
                            type="button"
                            onClick={() => copyVal(link.url, `free-${idx}`)}
                            className="text-[10px] text-[var(--muted-foreground)] hover:text-emerald-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <Copy className="w-3 h-3" /> {copiedKey === `free-${idx}` ? "Copied!" : "Copy"}
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateFreeLink(idx, "url", e.target.value)}
                      placeholder="https://archive.org/... or https://..."
                      className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:ring-1 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add Free Option Button */}
            <button
              type="button"
              onClick={addFreeLink}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Another Free Size Link</span>
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* CATEGORY 2: 4K VIP PREMIUM DOWNLOADS (SIZE-BASED) */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-500 font-black text-xs uppercase tracking-wide">
                <Crown className="w-4 h-4" />
                <span>Category 2: 4K VIP Premium Downloads</span>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-neutral-950">
                VIP ACCESS
              </span>
            </div>

            {/* VIP Pricing & Discount Settings Card */}
            <div className="p-4 rounded-xl bg-[var(--card)] border border-amber-500/30 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-[var(--foreground)]">
                    VIP Download Pricing
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)]">
                    Configure standard price & optional VIP discount
                  </span>
                </div>
                {/* Discount Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (!hasVipDiscount) {
                      setHasVipDiscount(true);
                      if (vipOfferPrice >= vipRegularPrice) {
                        setVipOfferPrice(1);
                      }
                    } else {
                      setHasVipDiscount(false);
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    hasVipDiscount
                      ? "bg-amber-500 text-neutral-950 shadow-sm ring-2 ring-amber-400/40"
                      : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>{hasVipDiscount ? "VIP Discount Active ✓" : "+ Enable VIP Discount"}</span>
                </button>
              </div>

              {hasVipDiscount ? (
                <div className="space-y-3 pt-2.5 border-t border-[var(--border)]">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--muted-foreground)] mb-1">
                        Regular Price (₹ MRP)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--muted-foreground)]">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={1}
                          value={vipRegularPrice}
                          onChange={(e) => setVipRegularPrice(parseFloat(e.target.value) || 0)}
                          placeholder="99"
                          className="w-full pl-7 pr-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-bold text-[var(--foreground)] focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-amber-500 mb-1">
                        VIP Offer Price (₹ Sale)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-500">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={0}
                          value={vipOfferPrice}
                          onChange={(e) => setVipOfferPrice(parseFloat(e.target.value) || 0)}
                          placeholder="1"
                          className="w-full pl-7 pr-3 py-2 rounded-xl border border-amber-500/50 bg-[var(--background)] text-xs font-mono font-bold text-amber-500 focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Discount Calculation Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-500">
                      <Percent className="w-3.5 h-3.5" />
                      {discountPct > 0 ? (
                        <span>
                          Customer saves ₹{Math.max(0, vipRegularPrice - vipOfferPrice)} ({discountPct}% OFF)
                        </span>
                      ) : (
                        <span className="text-[var(--muted-foreground)] font-normal">
                          Set VIP offer price lower than regular price to activate savings badge
                        </span>
                      )}
                    </div>
                    {discountPct > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-neutral-950 uppercase">
                        {discountPct}% OFF Deal
                      </span>
                    )}
                  </div>

                  {/* Quick Discount Presets */}
                  <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-0.5">
                    <span className="text-[10px] font-semibold text-[var(--muted-foreground)] mr-1 whitespace-nowrap">
                      Presets:
                    </span>
                    {[
                      { label: "100% Free (₹0)", price: 0 },
                      { label: "₹1 Deal", price: 1 },
                      { label: "₹49 Deal", price: 49 },
                      { label: "50% OFF", price: Math.max(1, Math.round(vipRegularPrice * 0.5)) },
                      { label: "70% OFF", price: Math.max(1, Math.round(vipRegularPrice * 0.3)) },
                      { label: "90% OFF", price: Math.max(1, Math.round(vipRegularPrice * 0.1)) },
                    ].map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setVipOfferPrice(p.price)}
                        className="px-2.5 py-1 rounded-lg bg-[var(--secondary)] hover:bg-amber-500/20 hover:text-amber-500 border border-[var(--border)] text-[10px] font-bold transition-colors whitespace-nowrap cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[var(--border)]">
                  <div>
                    <span className="block text-xs font-bold text-[var(--foreground)]">
                      Fixed VIP Price (₹ INR)
                    </span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">
                      One-time payment unlocks all VIP sizes
                    </span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-black text-base text-amber-500">
                    <span>₹</span>
                    <input
                      type="number"
                      min={0}
                      value={vipOfferPrice}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value) || 0;
                        setVipOfferPrice(v);
                        setVipRegularPrice(v);
                      }}
                      className="w-20 px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs text-center font-bold text-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* List of VIP Size Links */}
            <div className="space-y-3">
              {vipLinks.length === 0 && (
                <div className="p-3 text-center rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 text-xs text-[var(--muted-foreground)]">
                  No 4K VIP download links added yet. Click below to add one.
                </div>
              )}
              {vipLinks.map((link, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-amber-500/30 bg-[var(--card)] space-y-2 relative shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-amber-500">
                    <span>VIP Option #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeVipLink(idx)}
                      className="text-red-500 hover:text-red-700 text-[11px] flex items-center gap-1 font-semibold cursor-pointer"
                      title="Remove this option"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--muted-foreground)] mb-0.5">
                        Tier / Label
                      </label>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateVipLink(idx, "label", e.target.value)}
                        placeholder="e.g. 1080p 60fps or 4K HDR"
                        className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:ring-1 focus:ring-amber-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--muted-foreground)] mb-0.5">
                        File Size Display
                      </label>
                      <input
                        type="text"
                        value={link.size}
                        onChange={(e) => updateVipLink(idx, "size", e.target.value)}
                        placeholder="e.g. 3.9 GB or 6.5 GB"
                        className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] focus:ring-1 focus:ring-amber-500/50"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block text-[10px] font-semibold text-[var(--muted-foreground)]">
                        VIP Cloud Download URL
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => pasteTo((val) => updateVipLink(idx, "url", val))}
                          className="text-[10px] text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <ClipboardPaste className="w-3 h-3" /> Paste
                        </button>
                        {link.url && (
                          <button
                            type="button"
                            onClick={() => copyVal(link.url, `vip-${idx}`)}
                            className="text-[10px] text-[var(--muted-foreground)] hover:text-amber-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <Copy className="w-3 h-3" /> {copiedKey === `vip-${idx}` ? "Copied!" : "Copy"}
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => updateVipLink(idx, "url", e.target.value)}
                      placeholder="https://fastcloud.net/... or private link"
                      className="w-full px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:ring-1 focus:ring-amber-500/50"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add VIP Option Button */}
            <button
              type="button"
              onClick={addVipLink}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-amber-500/50 text-amber-500 hover:bg-amber-500/10 text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Another VIP Size Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: Synopsis & Storyline */}
      <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
        <div className="border-b border-[var(--border)] pb-3">
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
            4. Plot Synopsis & Description
          </h3>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[var(--foreground)]">
            Short Tagline / Brief Synopsis
          </label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="A veteran special agent and bomb specialist retires after a tragic mission..."
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[var(--foreground)]">
            Full Movie Description / Audio Notes
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/40 leading-relaxed"
          />
        </div>
      </div>

      {/* Section 5: Publishing Status & Visibility */}
      <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-4">
        <div className="border-b border-[var(--border)] pb-3">
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
            5. Publishing Controls
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--foreground)]">
              Release Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            >
              <option value="PUBLISHED">Published (Visible on site)</option>
              <option value="DRAFT">Draft (Hidden from public)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="featured-toggle"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 border-[var(--border)] focus:ring-amber-500/40"
            />
            <label htmlFor="featured-toggle" className="text-xs font-semibold text-[var(--foreground)] cursor-pointer">
              Feature in Cinema Spotlight / Trending
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/admin/movies"
          className="px-5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--secondary)] text-xs font-semibold hover:bg-[var(--border)] transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-yellow-400 text-neutral-950 text-xs font-extrabold transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 active:scale-95 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Movie...</span>
            </>
          ) : (
            <>
              <Film className="w-4 h-4" />
              <span>{isEdit ? "Save Changes" : "Publish Movie"}</span>
            </>
          )}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-[var(--card)] border border-red-500/40 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto ring-1 ring-red-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[var(--foreground)]">
              Delete This Movie?
            </h4>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-[var(--foreground)]">{title}</strong>? This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 px-4 rounded-xl border border-[var(--border)] bg-[var(--secondary)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--border)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
