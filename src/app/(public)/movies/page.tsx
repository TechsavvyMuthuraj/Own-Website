import React from "react";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { MoviesClient, type MovieItem, type MovieDownloadLink } from "./movies-client";

export const metadata: Metadata = {
  title: "Movies & Cinema Hub - Free & 4K VIP Downloads",
  description:
    "Explore blockbuster regional and global movies with multiple download link sizes in 480p, 720p, 1080p Full HD, and 4K UHD VIP high-bitrate releases.",
  keywords: [
    "movies download",
    "4K UHD movies",
    "1080p FHD movies",
    "Tamil movies download",
    "blockbuster cinema",
    "free movie downloads",
    "VIP 4K releases",
    "NammaTech movies",
  ],
  alternates: {
    canonical: "https://www.techsavvymuthuraj.dev/movies",
  },
  openGraph: {
    title: "Movies & Cinema Hub - Free & 4K VIP Downloads | NammaTech",
    description:
      "Explore blockbuster movies with multiple download link options based on file size.",
    type: "website",
    images: [
      {
        url: "/images/hero-clean.png",
        width: 1200,
        height: 630,
        alt: "NammaTech Movies Cinema Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Movies & Cinema Hub | NammaTech",
    description: "Download blockbuster movies in 4K UHD and 1080p.",
  },
};

export const revalidate = 60; // Cache at edge for 60 seconds

let cachedMovieCategoryId: { id: string | null; expiresAt: number } | null = null;

async function getMovieCategoryId(supabase: any): Promise<string | null> {
  const now = Date.now();
  if (cachedMovieCategoryId && cachedMovieCategoryId.expiresAt > now) {
    return cachedMovieCategoryId.id;
  }
  try {
    const { data } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "movies")
      .maybeSingle();
    const id = data?.id ?? null;
    cachedMovieCategoryId = { id, expiresAt: now + 60000 };
    return id;
  } catch {
    return cachedMovieCategoryId ? cachedMovieCategoryId.id : null;
  }
}

export default async function MoviesPage() {
  const supabase = createAdminClient();
  let dbMovies: MovieItem[] = [];

  try {
    // 1. Find Movies category ID if exists from cache
    const movieCategoryId = await getMovieCategoryId(supabase);

    // 2. Query real database resources for movies with their size-based download links
    const MOVIE_FIELDS =
      "id, title, slug, version, created_at, size_bytes, tags, price, sale_price, description, short_description, developer, features, platform, thumbnail_url, changelog, download_links(id, title, link_type, url, size_bytes, is_active)";

    let query = supabase
      .from("resources")
      .select(MOVIE_FIELDS)
      .eq("status", "PUBLISHED");

    if (movieCategoryId) {
      query = query.or(
        `category_id.eq.${movieCategoryId},tags.cs.{movie},tags.cs.{movies},tags.cs.{Cinema}`
      );
    } else {
      query = query.or(
        `tags.cs.{movie},tags.cs.{movies},tags.cs.{Cinema},ilike(title,*movie*)`
      );
    }

    const { data } = await query
      .order("published_at", { ascending: false })
      .limit(30);

    if (data && data.length > 0) {
      dbMovies = (data as any[]).map((item: any) => {
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
          ? item.tags.filter((t: string) => !["movie", "movies", "cinema", "4k uhd", "1080p fhd", "720p hd", "4k hdr dolby"].includes(t.toLowerCase()))
          : [];

        const quality = item.price > 0 ? "4K UHD" : "1080p FHD";

        // ── Parse Size-Based Download Links into Two Categories ──
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

        // Dynamic size range display from real links
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

        return {
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
      });
    }
  } catch (err) {
    console.error("Error loading real movies from Supabase:", err);
  }

  const moviesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "NammaTech Movies & Cinema Hub",
    description: "Verified blockbuster regional and global movies with standard and 4K VIP downloads",
    itemListElement: dbMovies.map((m, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Movie",
        name: m.title,
        description: m.description,
        image: m.posterUrl,
        genre: m.genres,
      },
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(moviesJsonLd) }}
      />
      <MoviesClient movies={dbMovies} />
    </div>
  );
}
