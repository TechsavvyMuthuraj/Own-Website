import React from "react";
import { FileText, ShieldCheck } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

export const revalidate = 0;

export default async function AdminAuditLogsPage() {
  const supabase = createAdminClient();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*, admin:profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
          Admin Audit Logs
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Immutable chronological record of administrator operations, status mutations, and deletions.
        </p>
      </div>

      {logs && logs.length > 0 ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--secondary)]/60 text-[var(--muted-foreground)] uppercase font-semibold border-b border-[var(--border)]">
                <tr>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-4 py-3.5">Admin</th>
                  <th className="px-4 py-3.5">Entity</th>
                  <th className="px-4 py-3.5">Details</th>
                  <th className="px-5 py-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--secondary)]/30 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-[var(--foreground)]">
                      {log.action}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-[var(--foreground)]">
                        {log.admin?.full_name || "Admin"}
                      </div>
                      <div className="text-[10px] text-[var(--muted-foreground)] truncate max-w-[140px]">
                        {log.admin?.email}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[var(--muted-foreground)]">
                      {log.entity_type} {log.entity_id ? `(${log.entity_id.substring(0, 8)}...)` : ""}
                    </td>
                    <td className="px-4 py-3.5 max-w-xs truncate text-[var(--muted-foreground)] font-mono text-[11px]">
                      {log.new_data ? JSON.stringify(log.new_data) : log.old_data ? JSON.stringify(log.old_data) : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right text-[var(--muted-foreground)] whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No audit log entries yet"
          description="Actions performed by administrators (creating resources, publishing, updates, deletions) will appear here automatically."
        />
      )}
    </div>
  );
}
