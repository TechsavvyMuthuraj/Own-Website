import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { HomepageClient } from "./homepage-client";

export const revalidate = 0;

export default async function AdminHomepagePage() {
  const supabase = createAdminClient();
  const { data: settingsData } = await supabase
    .from("site_settings")
    .select("*")
    .eq("key", "homepage_settings")
    .maybeSingle();

  let initialSettings: Record<string, any> = {};
  if (settingsData?.value) {
    try {
      initialSettings =
        typeof settingsData.value === "string"
          ? JSON.parse(settingsData.value)
          : settingsData.value;
    } catch {
      initialSettings = {};
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
          Homepage Sections Editor
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Customize and configure the hero banner, sections visibility, categories, featured releases, and founder bio on the public homepage.
        </p>
      </div>

      <HomepageClient initialSettings={initialSettings} />
    </div>
  );
}
