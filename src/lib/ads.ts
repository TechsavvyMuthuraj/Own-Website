import { createClient } from "@/lib/supabase/server";
import type { AdPlacement } from "@/types/database";

/**
 * Fetch the highest priority active ad for a given placement location.
 * Cached or dynamic depending on parent route.
 */
export async function getActiveAd(location: string): Promise<AdPlacement | null> {
  try {
    const supabase = await createClient();

    // Check if ads are enabled globally
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
      if (isEnabled === false) return null;
    }

    const { data } = await supabase
      .from("ad_placements")
      .select("*")
      .eq("location", location)
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .limit(1)
      .single();

    return (data as AdPlacement) || null;
  } catch {
    return null;
  }
}
