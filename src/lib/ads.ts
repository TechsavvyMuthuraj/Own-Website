import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { AdPlacement } from "@/types/database";

const areAdsGloballyEnabled = cache(async (): Promise<boolean> => {
  try {
    const supabase = await createClient();
    const { data: globalSetting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "ads_enabled")
      .single();

    if (globalSetting) {
      const isEnabled =
        typeof globalSetting.value === "string"
          ? JSON.parse(globalSetting.value)
          : globalSetting.value;
      if (isEnabled === false) return false;
    }
    return true;
  } catch {
    return true;
  }
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
