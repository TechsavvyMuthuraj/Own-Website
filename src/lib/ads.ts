import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { AdPlacement } from "@/types/database";

let cachedAdsSettings: {
  adsEnabled: boolean;
  autoAds: boolean;
  expiresAt: number;
} | null = null;

export function invalidateAdsCache() {
  cachedAdsSettings = null;
}

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
    const supabase = await createClient();
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

    cachedAdsSettings = {
      adsEnabled,
      autoAds,
      expiresAt: now + 15000,
    };

    return { adsEnabled, autoAds };
  } catch {
    return { adsEnabled: true, autoAds: true };
  }
};

export const areAdsGloballyEnabled = cache(async (): Promise<boolean> => {
  const settings = await getAdsGlobalSettings();
  return settings.adsEnabled;
});

/**
 * Fetch the highest priority active ad for a given placement location.
 * Memoized per request using React cache() to prevent duplicate database roundtrips.
 */
export const getActiveAd = cache(async (location: string): Promise<AdPlacement | null> => {
  try {
    const isEnabled = await areAdsGloballyEnabled();
    if (!isEnabled) return null;

    const supabase = await createClient();
    const { data } = await supabase
      .from("ad_placements")
      .select("id, title, location, provider, ad_code, priority, is_active")
      .eq("location", location)
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .limit(1)
      .single();

    return (data as AdPlacement) || null;
  } catch {
    return null;
  }
});
