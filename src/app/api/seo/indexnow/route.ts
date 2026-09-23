import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const INDEXNOW_KEY = "e0f7e4a19b88494cb68019a27d2c3dfb";
const HOST = "www.techsavvymuthuraj.dev";
const SITE_URL = "https://www.techsavvymuthuraj.dev";

async function collectAllSiteUrls(): Promise<string[]> {
  const supabase = createAdminClient();

  const urls: string[] = [
    `${SITE_URL}`,
    `${SITE_URL}/explore`,
    `${SITE_URL}/movies`,
    `${SITE_URL}/articles`,
    `${SITE_URL}/categories`,
    `${SITE_URL}/free`,
    `${SITE_URL}/premium`,
    `${SITE_URL}/new-and-updated`,
    `${SITE_URL}/request`,
    `${SITE_URL}/about`,
    `${SITE_URL}/contact`,
    `${SITE_URL}/terms`,
    `${SITE_URL}/privacy-policy`,
    `${SITE_URL}/cookie-policy`,
    `${SITE_URL}/dmca`,
    `${SITE_URL}/disclaimer`,
    `${SITE_URL}/refund-policy`,
  ];

  try {
    const [categoriesRes, resourcesRes, articlesRes] = await Promise.all([
      supabase.from("categories").select("slug").eq("is_active", true),
      supabase.from("resources").select("slug, tags, category_id").eq("status", "PUBLISHED"),
      supabase.from("articles").select("slug").eq("status", "PUBLISHED"),
    ]);

    if (categoriesRes.data) {
      categoriesRes.data.forEach((c) => {
        if (c.slug) urls.push(`${SITE_URL}/category/${c.slug}`);
      });
    }

    if (resourcesRes.data) {
      resourcesRes.data.forEach((r) => {
        if (r.slug) {
          urls.push(`${SITE_URL}/resource/${r.slug}`);
          // Also if it's a movie, add movie URL
          const isMovie =
            Array.isArray(r.tags) &&
            r.tags.some((t: string) =>
              ["movie", "movies", "cinema"].includes(t.toLowerCase())
            );
          if (isMovie) {
            urls.push(`${SITE_URL}/movies/${r.slug}`);
          }
        }
      });
    }

    if (articlesRes.data) {
      articlesRes.data.forEach((a) => {
        if (a.slug) urls.push(`${SITE_URL}/articles/${a.slug}`);
      });
    }
  } catch (err) {
    console.error("Error gathering URLs for IndexNow:", err);
  }

  return Array.from(new Set(urls));
}

export async function POST(request: Request) {
  try {
    const allUrls = await collectAllSiteUrls();

    // 1. Submit to IndexNow API (Bing, Yandex, Seznam, Naver)
    const indexNowPayload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: allUrls.slice(0, 10000), // IndexNow max limit per call is 10k
    };

    let indexNowStatus = "not_attempted";
    let indexNowResponseCode = 0;

    try {
      const indexNowRes = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(indexNowPayload),
      });

      indexNowResponseCode = indexNowRes.status;
      if (indexNowRes.ok || indexNowRes.status === 200 || indexNowRes.status === 202) {
        indexNowStatus = "submitted";
      } else {
        indexNowStatus = `http_${indexNowRes.status}`;
      }
    } catch (e: any) {
      console.error("IndexNow ping failed:", e);
      indexNowStatus = `error: ${e?.message}`;
    }

    // 2. Ping Google Search Console Sitemap endpoint
    let googlePingStatus = "not_attempted";
    try {
      const gRes = await fetch(
        `https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE_URL}/sitemap.xml`)}`
      );
      googlePingStatus = gRes.ok ? "success" : `status_${gRes.status}`;
    } catch (e: any) {
      googlePingStatus = `error: ${e?.message}`;
    }

    // 3. Ping Bing Sitemap endpoint
    let bingPingStatus = "not_attempted";
    try {
      const bRes = await fetch(
        `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${SITE_URL}/sitemap.xml`)}`
      );
      bingPingStatus = bRes.ok ? "success" : `status_${bRes.status}`;
    } catch (e: any) {
      bingPingStatus = `error: ${e?.message}`;
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      urlsSubmittedCount: allUrls.length,
      sampleUrls: allUrls.slice(0, 10),
      indexNow: {
        host: HOST,
        key: INDEXNOW_KEY,
        status: indexNowStatus,
        statusCode: indexNowResponseCode,
      },
      sitemapPings: {
        google: googlePingStatus,
        bing: bingPingStatus,
        sitemapUrl: `${SITE_URL}/sitemap.xml`,
      },
    });
  } catch (err: any) {
    console.error("SEO Instant Indexing error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST(new Request(`${SITE_URL}/api/seo/indexnow`, { method: "POST" }));
}
