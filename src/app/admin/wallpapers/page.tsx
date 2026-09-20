import React from "react";
import { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { WallpapersClient } from "./wallpapers-client";
import type { Wallpaper } from "@/types/database";

export const metadata: Metadata = {
  title: "4K Wallpapers Manager | Admin | NammaTech",
  description: "Curate, publish, and manage verified 4K & Ultra HD wallpapers.",
};

export const dynamic = "force-dynamic";

export default async function AdminWallpapersPage() {
  let initialWallpapers: Wallpaper[] = [];

  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("wallpapers")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data) {
      initialWallpapers = data as Wallpaper[];
    }
  } catch (err) {
    console.error("Failed to load wallpapers for admin:", err);
    initialWallpapers = [];
  }

  return (
    <WallpapersClient
      initialWallpapers={initialWallpapers}
    />
  );
}
