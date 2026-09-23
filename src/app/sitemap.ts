import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 3600; // Cache sitemap at edge for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL &&
    !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_SITE_URL
      : "https://www.techsavvymuthuraj.dev";
  const supabase = createAdminClient();

  const now = new Date();

  // High-priority core landing pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/explore`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteUrl}/movies`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${siteUrl}/articles`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/free`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/premium`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/new-and-updated`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${siteUrl}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${siteUrl}/request`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${siteUrl}/privacy-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/cookie-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/dmca`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/refund-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  try {
    // 1. Dynamic categories
    const { data: categories } = await supabase
      .from("categories")
      .select("slug, updated_at")
      .eq("is_active", true);

    const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
      url: `${siteUrl}/category/${cat.slug}`,
      lastModified: new Date(cat.updated_at || now),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // 2. Dynamic resources (PUBLISHED only)
    const { data: resources } = await supabase
      .from("resources")
      .select("slug, updated_at, published_at, tags")
      .eq("status", "PUBLISHED");

    const resourceRoutes: MetadataRoute.Sitemap = [];
    const movieRoutes: MetadataRoute.Sitemap = [];

    (resources || []).forEach((res) => {
      if (!res.slug) return;
      const modDate = new Date(res.updated_at || res.published_at || now);

      resourceRoutes.push({
        url: `${siteUrl}/resource/${res.slug}`,
        lastModified: modDate,
        changeFrequency: "weekly",
        priority: 0.9,
      });

      // Check if item is also listed in cinema / movies
      const isMovie =
        Array.isArray(res.tags) &&
        res.tags.some((t: string) =>
          ["movie", "movies", "cinema"].includes(t.toLowerCase())
        );

      if (isMovie) {
        movieRoutes.push({
          url: `${siteUrl}/movies/${res.slug}`,
          lastModified: modDate,
          changeFrequency: "weekly",
          priority: 0.9,
        });
      }
    });

    // 3. Dynamic articles (PUBLISHED only)
    const { data: articles } = await supabase
      .from("articles")
      .select("slug, updated_at, published_at")
      .eq("status", "PUBLISHED");

    const articleRoutes: MetadataRoute.Sitemap = (articles || []).map((art) => ({
      url: `${siteUrl}/articles/${art.slug}`,
      lastModified: new Date(art.updated_at || art.published_at || now),
      changeFrequency: "weekly",
      priority: 0.85,
    }));

    return [
      ...staticRoutes,
      ...categoryRoutes,
      ...resourceRoutes,
      ...movieRoutes,
      ...articleRoutes,
    ];
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
    return staticRoutes;
  }
}
