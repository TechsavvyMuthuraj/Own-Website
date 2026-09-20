import React from "react";
import { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_WALLPAPERS } from "@/app/api/wallpapers/route";
import { WallpapersClient } from "./wallpapers-client";
import type { Wallpaper } from "@/types/database";

export const metadata: Metadata = {
  title: "4K Wallpapers Manager | Admin | NammaTech",
  description: "Curate, publish, and manage verified 4K & Ultra HD wallpapers.",
};

export const dynamic = "force-dynamic";

export default async function AdminWallpapersPage() {
  let initialWallpapers: Wallpaper[] = DEFAULT_WALLPAPERS as Wallpaper[];
  let isFromFallback = false;

  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("wallpapers")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      initialWallpapers = data as Wallpaper[];
    } else if (error) {
      isFromFallback = true;
    }
  } catch {
    isFromFallback = true;
  }

  return (
    <WallpapersClient
      initialWallpapers={initialWallpapers}
      isFromFallback={isFromFallback}
    />
  );
}
