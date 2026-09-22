import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { SupportTeamClient } from "./support-team-client";
import type { SupportTeamMember } from "@/app/api/admin/support-team/route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminSupportTeamPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "technical_support_team")
    .maybeSingle();

  let initialTeam: SupportTeamMember[] = [];
  if (data?.value) {
    try {
      initialTeam = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
    } catch {}
  }

  return <SupportTeamClient initialTeam={initialTeam} />;
}
