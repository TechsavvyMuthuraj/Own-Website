import React from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
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

export const revalidate = 0; // Always fresh real database queries

export default async function MoviesPage() {
  const supabase = await createClient();
  let dbMovies: MovieItem[] = [];

  try {
    // 1. Find Movies category ID if exists
    const { data: movieCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", "movies")
      .single();

    // 2. Query real database resources for movies with their size-based download links
    let query = supabase
      .from("resources")
      .select("*, category:categories(*), download_links(*)")
      .eq("status", "PUBLISHED");

    if (movieCategory?.id) {
      query = query.or(
        `category_id.eq.${movieCategory.id},tags.cs.{movie},tags.cs.{movies},tags.cs.{Cinema}`
      );
    } else {
      query = query.or(
        `tags.cs.{movie},tags.cs.{movies},tags.cs.{Cinema},ilike(title,*movie*)`
      );
    }

    const { data } = await query
      .order("published_at", { ascending: false })
      .limit(50);

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

        const genres = Array.isArray(item.tags) && item.tags.length > 0
          ? item.tags.filter((t: string) => !["movie", "movies", "cinema"].includes(t.toLowerCase()))
          : ["Cinema", "Feature"];

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

        // No fallback — show empty if no real links exist

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

        // No VIP fallback — only show real VIP links from database

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

        return {
          id: item.id,
          title: item.title,
          year,
          genres: genres.length > 0 ? genres : ["Feature"],
          quality,
          posterUrl: item.thumbnail_url || "",
          rating: item.rating ? String(item.rating) : "",
          sizeNormal: sizeNormalStr,
          sizePremium: sizePremiumStr,
          audio: item.platform || "",
          normalDownloadUrl: freeLinks[0]?.url || "",
          premiumPrice: item.price > 0 ? item.price : 49,
          description: item.short_description || item.description || "",
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
