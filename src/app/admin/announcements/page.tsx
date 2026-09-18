import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Announcement } from "@/types/database";
import { AnnouncementsClient } from "./announcements-client";

export const revalidate = 0;

export default async function AdminAnnouncementsPage() {
  const supabase = createAdminClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("priority", { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
          Announcement Bar Management
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Configure real-time banner announcements, priority order, expiration dates, and CTA buttons.
        </p>
      </div>

      <AnnouncementsClient initialAnnouncements={(announcements || []) as Announcement[]} />
    </div>
  );
}
