import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { SettingsClient } from "./settings-client";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const supabase = createAdminClient();
  const { data: settingsData } = await supabase.from("site_settings").select("*");

  const initialSettings: Record<string, any> = {};
  (settingsData || []).forEach((item) => {
    try {
      initialSettings[item.key] =
        typeof item.value === "string" ? JSON.parse(item.value) : item.value;
    } catch {
      initialSettings[item.key] = item.value;
    }
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
          System Settings & Operations
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Global platform parameters, maintenance mode, currency, and contact routing.
        </p>
      </div>

      <SettingsClient initialSettings={initialSettings} />
    </div>
  );
}
