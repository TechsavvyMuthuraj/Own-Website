import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdPlacement } from "@/types/database";
import { AdsClient } from "./ads-client";

export const revalidate = 0;

export default async function AdminAdsPage() {
  const supabase = createAdminClient();
  const { data: ads } = await supabase
    .from("ad_placements")
    .select("*")
    .order("priority", { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
          Advertisement Placements
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Configure transparent, clearly labeled ad placements (header, sidebar, in-feed). Never disguise ads as fake buttons.
        </p>
      </div>

      <AdsClient initialAds={(ads || []) as AdPlacement[]} />
    </div>
  );
}
