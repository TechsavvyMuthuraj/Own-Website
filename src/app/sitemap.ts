import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL &&
    !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_SITE_URL
      : "https://www.techsavvymuthuraj.dev";
  const supabase = createAdminClient();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/movies`, lastModified: new Date(), changeFrequency: "daily", priority: 0.95 },
    { url: `${siteUrl}/explore`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/articles`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${siteUrl}/new-and-updated`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${siteUrl}/free`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${siteUrl}/premium`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${siteUrl}/request`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/cookie-policy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/dmca`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/disclaimer`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/refund-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];

  try {
    // Dynamic categories
    const { data: categories } = await supabase
      .from("categories")
      .select("slug, updated_at")
      .eq("is_active", true);

    const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
      url: `${siteUrl}/category/${cat.slug}`,
      lastModified: new Date(cat.updated_at || new Date()),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    // Dynamic resources (PUBLISHED only)
    const { data: resources } = await supabase
      .from("resources")
      .select("slug, updated_at")
      .eq("status", "PUBLISHED");

    const resourceRoutes: MetadataRoute.Sitemap = (resources || []).map((res) => ({
      url: `${siteUrl}/resource/${res.slug}`,
      lastModified: new Date(res.updated_at || new Date()),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // Dynamic articles (PUBLISHED only)
    const { data: articles } = await supabase
      .from("articles")
      .select("slug, updated_at, published_at")
      .eq("status", "PUBLISHED");

    const articleRoutes: MetadataRoute.Sitemap = (articles || []).map((art) => ({
      url: `${siteUrl}/articles/${art.slug}`,
      lastModified: new Date(art.updated_at || art.published_at || new Date()),
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    return [...staticRoutes, ...categoryRoutes, ...resourceRoutes, ...articleRoutes];
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
    return staticRoutes;
  }
}
