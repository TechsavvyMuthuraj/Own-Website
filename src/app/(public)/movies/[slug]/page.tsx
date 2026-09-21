import React, { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { MovieViewClient } from "./movie-view-client";
import type { MovieItem, MovieDownloadLink } from "../movies-client";
import { getActiveAd } from "@/lib/ads";

interface MoviePageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60; // Revalidate every 60 seconds

export async function generateStaticParams() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("resources")
    .select("slug, tags")
    .eq("status", "PUBLISHED")
    .limit(100);

  return (data || [])
    .filter((r) => {
      const tags = Array.isArray(r.tags) ? r.tags.map((t: string) => String(t).toLowerCase()) : [];
      return tags.includes("movie") || tags.includes("movies") || tags.includes("cinema");
    })
    .filter((r) => Boolean(r.slug))
    .map((r) => ({ slug: r.slug }));
}

const MOVIE_FIELDS =
  "id, title, slug, version, created_at, size_bytes, tags, price, sale_price, description, short_description, developer, features, platform, thumbnail_url, changelog, category_id, download_links(id, title, link_type, url, size_bytes, is_active)";

// Memoized resource fetcher
const getMovieBySlug = cache(async (slug: string) => {
  const supabase = createAdminClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  let query = supabase
    .from("resources")
    .select(MOVIE_FIELDS)
    .eq("status", "PUBLISHED");

  if (isUuid) {
    query = query.or(`slug.eq.${slug},id.eq.${slug}`);
  } else {
    query = query.eq("slug", slug);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return data;
});

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getMovieBySlug(slug);

  if (!item) {
    return {
      title: "Movie Not Found | NammaTech Cinema Hub",
      description: "The requested cinema release could not be found.",
    };
  }

  const year = item.version || new Date(item.created_at || Date.now()).getFullYear();
  const title = `${item.title} (${year}) - Free & 4K VIP Download | NammaTech`;
  const description =
    item.short_description ||
    item.description?.slice(0, 160) ||
    `Download ${item.title} in 4K UHD and 1080p with Dolby Atmos audio on NammaTech Cinema Hub.`;

  return {
    title,
    description,
    keywords: [
      item.title,
      `${item.title} download`,
      `${item.title} 4K UHD`,
      `${item.title} trailer`,
      "Tamil movies download",
      "VIP 4K Cinema",
      "NammaTech movies",
    ],
    openGraph: {
      title,
      description,
      type: "video.movie",
      images: item.thumbnail_url
        ? [{ url: item.thumbnail_url, width: 1200, height: 630, alt: item.title }]
        : [{ url: "/images/hero-clean.png", width: 1200, height: 630, alt: item.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: item.thumbnail_url ? [item.thumbnail_url] : ["/images/hero-clean.png"],
    },
  };
}

export default async function MovieDetailPage({ params }: MoviePageProps) {
  const { slug } = await params;
  const item = await getMovieBySlug(slug);

  if (!item) {
    notFound();
  }

  const supabase = await createClient();

  // 1. Map Movie Data
  const year = item.version
    ? parseInt(item.version, 10) || new Date(item.created_at || Date.now()).getFullYear()
    : new Date(item.created_at || Date.now()).getFullYear();

  const normalBytes = item.size_bytes || 0;
  let sizeNormalStr = normalBytes > 0
    ? (normalBytes >= 1073741824
      ? `${(normalBytes / 1073741824).toFixed(1)} GB`
      : `${Math.round(normalBytes / 1048576)} MB`)
    : "";
  let sizePremiumStr = "";

  const genres = Array.isArray(item.tags)
    ? item.tags.filter(
        (t: string) =>
          !["movie", "movies", "cinema", "4k uhd", "1080p fhd", "720p hd", "4k hdr dolby"].includes(
            t.toLowerCase()
          )
      )
    : [];

  const quality = item.price > 0 ? "4K UHD" : "1080p FHD";

  // Parse download links into two categories
  const rawLinks = (item.download_links || []) as any[];

  // Category 1: Free Normal Links
  const freeLinks: MovieDownloadLink[] = rawLinks
    .filter((l) => l.link_type === "PRIMARY" || l.link_type === "EXTERNAL")
    .map((l) => {
      let label = l.title.replace(/^Standard Free Download\s*/i, "").trim();
      let size = "";
      const match = label.match(/\(([^)]+)\)$/);
      if (match) {
        size = match[1];
        label = label.replace(/\s*\([^)]+\)$/, "").trim();
      } else if (l.size_bytes) {
        const gb = l.size_bytes / (1024 * 1024 * 1024);
        size = gb >= 1 ? `${gb.toFixed(1)} GB` : `${Math.round(l.size_bytes / (1024 * 1024))} MB`;
      }
      return {
        id: l.id,
        title: label || "Standard Download",
        size: size || sizeNormalStr,
        url: l.url || `/api/downloads/signed-url?resource_id=${item.id}`,
        isVip: false,
      };
    });

  // Category 2: 4K VIP Premium Links
  const vipLinks: MovieDownloadLink[] = rawLinks
    .filter((l) => l.link_type === "MIRROR")
    .map((l) => {
      let label = l.title.replace(/^👑\s*/, "").trim();
      let size = "";
      const match = label.match(/\(([^)]+)\)$/);
      if (match) {
        size = match[1];
        label = label.replace(/\s*\([^)]+\)$/, "").trim();
      } else if (l.size_bytes) {
        const gb = l.size_bytes / (1024 * 1024 * 1024);
        size = gb >= 1 ? `${gb.toFixed(1)} GB` : `${Math.round(l.size_bytes / (1024 * 1024))} MB`;
      }
      return {
        id: l.id,
        title: label || "4K VIP Master",
        size: size || sizePremiumStr,
        url: l.url || "",
        isVip: true,
      };
    });

  if (freeLinks.length === 1) {
    sizeNormalStr = freeLinks[0].size;
  } else if (freeLinks.length > 1) {
    sizeNormalStr = `${freeLinks[0].size} – ${freeLinks[freeLinks.length - 1].size}`;
  }
  if (vipLinks.length === 1) {
    sizePremiumStr = vipLinks[0].size;
  } else if (vipLinks.length > 1) {
    sizePremiumStr = `${vipLinks[0].size} – ${vipLinks[vipLinks.length - 1].size}`;
  }

  const regularPrice = item.price !== null && item.price !== undefined ? Number(item.price) : 0;
  const hasDiscount =
    item.sale_price !== null &&
    item.sale_price !== undefined &&
    Number(item.sale_price) < regularPrice;
  const offerPrice = hasDiscount ? Number(item.sale_price) : regularPrice;
  const discountPct =
    hasDiscount && regularPrice > 0
      ? Math.round(((regularPrice - offerPrice) / regularPrice) * 100)
      : 0;

  const currentMovie: MovieItem = {
    id: item.id,
    title: item.title,
    slug: item.slug || "",
    year,
    genres,
    quality,
    posterUrl: item.thumbnail_url || "",
    rating: "",
    sizeNormal: sizeNormalStr,
    sizePremium: sizePremiumStr,
    audio: item.platform || "",
    cast: item.developer || "",
    trailerUrl: item.changelog || "",
    normalDownloadUrl: freeLinks[0]?.url || "",
    premiumPrice: offerPrice,
    regularPrice,
    hasDiscount,
    discountPct,
    description: item.short_description || item.description || "",
    shortDescription: item.short_description || "",
    screenshots: Array.isArray(item.features) ? item.features.filter(Boolean) : [],
    freeLinks,
    vipLinks,
  };

  // Check auth state and VIP entitlement on server-side
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  let hasVipAccess = false;
  let hasPendingOrder = false;

  if (currentUser) {
    // Check active entitlement
    const { data: ent } = await supabase
      .from("entitlements")
      .select("id")
      .eq("user_id", currentUser.id)
      .eq("resource_id", item.id)
      .eq("status", "ACTIVE")
      .maybeSingle();
    hasVipAccess = !!ent;

    // Check pending order via order_items if no entitlement yet
    if (!hasVipAccess) {
      const { data: oi } = await supabase
        .from("order_items")
        .select("id, orders!inner(id, status, user_id)")
        .eq("resource_id", item.id)
        .maybeSingle();
      if (oi) {
        const o = (oi as any).orders;
        hasPendingOrder = o?.status === "PENDING" && o?.user_id === currentUser.id;
      }
    }
  }

  // 2. Query Related Blockbuster Movies (STRICTLY Cinema & Movies only — no software)
  const { data: movieCat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "movies")
    .maybeSingle();

  const movieCategoryId = (item as any).category_id || movieCat?.id || "50e82476-24c6-498c-a703-49bbb96b0dcf";

  const [{ data: relatedData }, resourceAd, inFeedAd] = await Promise.all([
    supabase
      .from("resources")
      .select("id, title, slug, version, created_at, size_bytes, tags, price, platform, thumbnail_url, category_id")
      .eq("status", "PUBLISHED")
      .eq("category_id", movieCategoryId)
      .neq("id", item.id)
      .order("published_at", { ascending: false })
      .limit(4),
    getActiveAd("RESOURCE_PAGE"),
    getActiveAd("IN_FEED"),
  ]);

  const relatedMovies: MovieItem[] = (relatedData || []).map((m: any) => ({
    id: m.id,
    title: m.title,
    slug: m.slug || "",
    year: m.version ? parseInt(m.version, 10) || 2026 : 2026,
    genres: Array.isArray(m.tags) ? m.tags.filter((t: string) => !["movie", "movies"].includes(t.toLowerCase())) : [],
    quality: m.price > 0 ? "4K UHD" : "1080p FHD",
    posterUrl: m.thumbnail_url || "",
    sizeNormal: "",
    sizePremium: "",
    audio: m.platform || "",
    normalDownloadUrl: "",
    premiumPrice: m.price || 0,
    description: "",
  }));

  // Schema.org Movie Structured Data
  const movieJsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: currentMovie.title,
    dateCreated: String(currentMovie.year),
    image: currentMovie.posterUrl,
    description: currentMovie.description,
    genre: currentMovie.genres,
    actor: currentMovie.cast ? [{ "@type": "Person", name: currentMovie.cast }] : undefined,
    trailer: currentMovie.trailerUrl
      ? {
          "@type": "VideoObject",
          name: `${currentMovie.title} Trailer`,
          embedUrl: currentMovie.trailerUrl,
          thumbnailUrl: currentMovie.posterUrl,
          description: `Official trailer for ${currentMovie.title}`,
        }
      : undefined,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(movieJsonLd) }}
      />
      <MovieViewClient
        movie={currentMovie}
        relatedMovies={relatedMovies}
        isLoggedIn={!!currentUser}
        hasVipAccess={hasVipAccess}
        hasPendingOrder={hasPendingOrder}
        movieSlug={item.slug || item.id}
        resourceAd={resourceAd}
        inFeedAd={inFeedAd}
      />
    </div>
  );
}
