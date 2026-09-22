import React from "react";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { AuditLogsClient } from "./audit-logs-client";

export const metadata: Metadata = {
  title: "System Audit Logs - NammaTech Admin",
  description: "Chronological record of administrator operations, status mutations, entity edits, and deletions.",
};

export const revalidate = 0;

export default async function AdminAuditLogsPage() {
  const supabase = createAdminClient();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*, admin:profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  const allLogs = logs || [];

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      <AuditLogsClient initialLogs={allLogs} />
    </div>
  );
}
