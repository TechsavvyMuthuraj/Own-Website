import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdPlacement } from "@/types/database";
import { AdsClient } from "./ads-client";

export const revalidate = 0;

export default async function AdminAdsPage() {
  const supabase = createAdminClient();

  const [{ data: ads }, { data: settingsData }] = await Promise.all([
    supabase.from("ad_placements").select("*").order("priority", { ascending: false }),
    supabase.from("site_settings").select("key,value").in("key", ["ads_enabled", "adsense_auto_ads"]),
  ]);

  const globalSettings: Record<string, any> = {
    ads_enabled: true,
    adsense_auto_ads: true,
    adsense_client_id: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-1960459798233871",
  };

  (settingsData || []).forEach((item: any) => {
    try {
      globalSettings[item.key] = typeof item.value === "string" ? JSON.parse(item.value) : item.value;
    } catch {
      globalSettings[item.key] = item.value;
    }
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
          Ad Monetization &amp; Placements
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Manage Google AdSense integration, high-CTR download page units, in-feed banners, and policy compliance.
        </p>
      </div>

      <AdsClient
        initialAds={(ads || []) as AdPlacement[]}
        initialSettings={globalSettings}
      />
    </div>
  );
}
