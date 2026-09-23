import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdPlacement } from "@/types/database";

import { unstable_cache } from "next/cache";

let cachedAdsSettings: {
  adsEnabled: boolean;
  autoAds: boolean;
  expiresAt: number;
} | null = null;

let cachedAdsByLocation: Record<string, { ad: AdPlacement | null; expiresAt: number }> = {};

export function invalidateAdsCache() {
  cachedAdsSettings = null;
  cachedAdsByLocation = {};
}

const fetchAdsGlobalSettingsFromDb = async (): Promise<{
  adsEnabled: boolean;
  autoAds: boolean;
}> => {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["ads_enabled", "adsense_auto_ads"]);

    let adsEnabled = true;
    let autoAds = true;

    if (data) {
      for (const row of data) {
        let val = row.value;
        if (typeof val === "string") {
          try {
            val = JSON.parse(val);
          } catch {
            val = val === "true";
          }
        }
        if (row.key === "ads_enabled") {
          adsEnabled = val !== false;
        } else if (row.key === "adsense_auto_ads") {
          autoAds = val !== false;
        }
      }
    }

    return { adsEnabled, autoAds };
  } catch {
    return { adsEnabled: true, autoAds: true };
  }
};

const getCachedAdsGlobalSettings = unstable_cache(
  fetchAdsGlobalSettingsFromDb,
  ["global-ads-settings"],
  { revalidate: 300, tags: ["ads-settings"] }
);

export const getAdsGlobalSettings = async (): Promise<{
  adsEnabled: boolean;
  autoAds: boolean;
}> => {
  const now = Date.now();
  if (cachedAdsSettings && cachedAdsSettings.expiresAt > now) {
    return {
      adsEnabled: cachedAdsSettings.adsEnabled,
      autoAds: cachedAdsSettings.autoAds,
    };
  }

  try {
    const res = await getCachedAdsGlobalSettings();
    cachedAdsSettings = {
      adsEnabled: res.adsEnabled,
      autoAds: res.autoAds,
      expiresAt: now + 300000,
    };
    return res;
  } catch {
    return cachedAdsSettings
      ? { adsEnabled: cachedAdsSettings.adsEnabled, autoAds: cachedAdsSettings.autoAds }
      : { adsEnabled: true, autoAds: true };
  }
};

export const areAdsGloballyEnabled = cache(async (): Promise<boolean> => {
  const settings = await getAdsGlobalSettings();
  return settings.adsEnabled;
});

/**
 * Fetch the highest priority active ad for a given placement location.
 * Memoized per request using React cache() and in-memory 60s cache.
 */
export const getActiveAd = cache(async (location: string): Promise<AdPlacement | null> => {
  try {
    const isEnabled = await areAdsGloballyEnabled();
    if (!isEnabled) return null;

    const now = Date.now();
    const cached = cachedAdsByLocation[location];
    if (cached && cached.expiresAt > now) {
      return cached.ad;
    }

    const supabase = createAdminClient();
    const { data } = await supabase
      .from("ad_placements")
      .select("id, title, location, provider, ad_code, priority, is_active")
      .eq("location", location)
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .limit(1)
      .single();

    const ad = (data as AdPlacement) || null;
    cachedAdsByLocation[location] = { ad, expiresAt: now + 60000 };
    return ad;
  } catch {
    return null;
  }
});
