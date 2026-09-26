import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  ADSTERRA_API_CONFIG,
  ADSTERRA_PLACEMENT_CATALOG,
  ADSTERRA_DOMAIN_CATALOG,
  type AdsterraStatRow,
  type AdsterraStatsSummary,
} from "@/config/adsterra";

// Helper to verify admin identity (via designated email or DB profile role)
async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { authorized: false, user: null };

  const adminEmails = (process.env.ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  const isDesignatedAdmin = Boolean(user.email && adminEmails.includes(user.email.toLowerCase()));
  if (isDesignatedAdmin) return { authorized: true, user };

  const supabaseAdmin = createAdminClient();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdminByRole = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";
  return { authorized: isAdminByRole, user };
}

// In-memory cache for API requests (60 seconds TTL) to avoid hitting Adsterra rate limits
const cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 60 * 1000;

export async function GET(request: Request) {
  try {
    const { authorized } = await verifyAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized or Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const groupByParam = (searchParams.get("group_by") || "date") as
      | "date"
      | "placement"
      | "country"
      | "domain";

    const apiKey = ADSTERRA_API_CONFIG.apiKey;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Adsterra API Key is not configured." },
        { status: 500 }
      );
    }

    const headers = {
      "X-API-Key": apiKey,
      Accept: "application/json",
      "User-Agent": "NammaTech-Admin-Dashboard/1.0",
    };

    // Action: Fetch registered domains from Adsterra
    if (action === "domains") {
      const cacheKey = "adsterra_domains";
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return NextResponse.json(cached.data);
      }

      const res = await fetch(ADSTERRA_API_CONFIG.domainsUrl, {
        headers,
        next: { revalidate: 60 },
      });

      if (!res.ok) {
        const errorText = await res.text();
        return NextResponse.json(
          { error: `Adsterra Domains API Error (${res.status}): ${errorText}` },
          { status: res.status }
        );
      }

      const data = await res.json();
      cache.set(cacheKey, { timestamp: Date.now(), data });
      return NextResponse.json(data);
    }

    // Action: Fetch placements across domains
    if (action === "placements") {
      const domainId = searchParams.get("domain_id") || "6077658";
      const cacheKey = `adsterra_placements_${domainId}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return NextResponse.json(cached.data);
      }

      const res = await fetch(ADSTERRA_API_CONFIG.domainPlacementsUrl(domainId), {
        headers,
        next: { revalidate: 60 },
      });

      if (!res.ok) {
        const errorText = await res.text();
        return NextResponse.json(
          { error: `Adsterra Placements API Error (${res.status}): ${errorText}` },
          { status: res.status }
        );
      }

      const data = await res.json();
      cache.set(cacheKey, { timestamp: Date.now(), data });
      return NextResponse.json(data);
    }

    // Default Action: Fetch Statistics
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    const startDate = searchParams.get("start_date") || formatDate(thirtyDaysAgo);
    const finishDate = searchParams.get("finish_date") || formatDate(today);

    const statsUrl = new URL(ADSTERRA_API_CONFIG.statsUrl);
    statsUrl.searchParams.set("start_date", startDate);
    statsUrl.searchParams.set("finish_date", finishDate);
    if (groupByParam) {
      statsUrl.searchParams.set("group_by", groupByParam);
    }

    const statsCacheKey = `stats_${startDate}_${finishDate}_${groupByParam}`;
    const cachedStats = cache.get(statsCacheKey);
    const forceRefresh = searchParams.get("refresh") === "true";

    let rawData: any;

    if (!forceRefresh && cachedStats && Date.now() - cachedStats.timestamp < CACHE_TTL_MS) {
      rawData = cachedStats.data;
    } else {
      const statsRes = await fetch(statsUrl.toString(), {
        headers,
        next: { revalidate: 60 },
      });

      if (!statsRes.ok) {
        const errorText = await statsRes.text();
        return NextResponse.json(
          { error: `Adsterra Stats API Error (${statsRes.status}): ${errorText}` },
          { status: statsRes.status }
        );
      }

      rawData = await statsRes.json();
      cache.set(statsCacheKey, { timestamp: Date.now(), data: rawData });
    }

    const items: AdsterraStatRow[] = (rawData?.items || []).map((item: any) => {
      const row: AdsterraStatRow = {
        date: item.date,
        placement: item.placement,
        placement_name: item.placement
          ? ADSTERRA_PLACEMENT_CATALOG[item.placement]?.name || `Placement #${item.placement}`
          : undefined,
        country: item.country,
        domain: item.domain,
        domain_name: item.domain
          ? ADSTERRA_DOMAIN_CATALOG[item.domain]?.title || `Domain #${item.domain}`
          : undefined,
        impression: Number(item.impression || 0),
        clicks: Number(item.clicks || 0),
        ctr: Number(item.ctr || 0),
        cpm: Number(item.cpm || 0),
        revenue: Number(item.revenue || 0),
      };
      return row;
    });

    // Compute aggregate totals
    const totalImpressions = items.reduce((acc, curr) => acc + curr.impression, 0);
    const totalClicks = items.reduce((acc, curr) => acc + curr.clicks, 0);
    const totalRevenue = Math.round(items.reduce((acc, curr) => acc + curr.revenue, 0) * 10000) / 10000;
    const averageCpm =
      totalImpressions > 0
        ? Math.round((totalRevenue / totalImpressions) * 1000 * 1000) / 1000
        : 0;
    const averageCtr =
      totalImpressions > 0
        ? Math.round((totalClicks / totalImpressions) * 100 * 100) / 100
        : 0;

    const summary: AdsterraStatsSummary = {
      totalImpressions,
      totalClicks,
      totalRevenue,
      averageCpm,
      averageCtr,
      startDate,
      finishDate,
      groupBy: groupByParam,
      items,
      lastUpdateTime: rawData?.dbDateTime || new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      summary,
      publisher: {
        id: "3486860",
        keyMasked: ADSTERRA_API_CONFIG.maskedKey,
        connected: true,
      },
    });
  } catch (error: any) {
    console.error("[Adsterra API Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to communicate with Adsterra API" },
      { status: 500 }
    );
  }
}
