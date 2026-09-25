import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Resource } from "@/types/database";
import type { Metadata } from "next";
import { FreeClient } from "./free-client";

export const metadata: Metadata = {
  title: "Free Digital Resources & Open-Source Downloads | NammaTech",
  description:
    "Discover 100% free open-source software, developer tools, authorized APKs, and design templates. No hidden fees, completely verified.",
  openGraph: {
    title: "Free Digital Resources & Open-Source Downloads | NammaTech",
    description:
      "Download verified free open-source tools and software with zero cost on NammaTech.",
  },
};

export const revalidate = 60;

const CARD_FIELDS =
  "id, title, slug, short_description, thumbnail_url, icon_url, resource_type, access_type, price, sale_price, currency, platform, version, status, featured, tags, created_at, updated_at, published_at, category_id, category:categories(id, name, slug, icon)";

export default async function FreeResourcesPage() {
  const supabase = createAdminClient();
  let resources: Resource[] = [];

  try {
    const { data } = await supabase
      .from("resources")
      .select(CARD_FIELDS)
      .eq("status", "PUBLISHED")
      .eq("access_type", "FREE")
      .order("published_at", { ascending: false })
      .limit(60);

    if (data) {
      resources = (data as unknown[])
        .map((item: any) => ({
          ...item,
          category: Array.isArray(item.category) ? item.category[0] : item.category,
        }))
        .filter((item: any) => {
          if (item.category?.slug === "movies") return false;
          const tags = Array.isArray(item.tags) ? item.tags.map((t: string) => String(t).toLowerCase()) : [];
          if (tags.includes("movie") || tags.includes("movies") || tags.includes("cinema")) {
            return false;
          }
          return true;
        }) as Resource[];
    }
  } catch (err) {
    console.error("Error loading free resources:", err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
      <FreeClient initialResources={resources} />
    </div>
  );
}
