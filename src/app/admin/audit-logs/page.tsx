import React from "react";
import { FileText, ShieldCheck, Activity, ShieldAlert, History } from "lucide-react";
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

  const allLogs = logs || [];

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* ── SaaS Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Security &amp; Compliance Audit Trail
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <History className="w-6 h-6" />
            </div>
            <span>System Audit Logs &amp; Activity</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Immutable chronological record of administrator operations, status mutations, entity edits, and deletions.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-neutral-950/80 border border-neutral-800 text-xs text-neutral-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Captured Events:</span>{" "}
            <strong className="text-white font-mono text-sm">{allLogs.length} Entries</strong>
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            Tamper-Resistant
          </div>
        </div>
      </div>

      {allLogs.length > 0 ? (
        <div className="rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-neutral-950/80 text-neutral-400 uppercase font-semibold border-b border-neutral-800 tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-4 py-4">Admin Operator</th>
                  <th className="px-4 py-4">Target Entity</th>
                  <th className="px-4 py-4">Payload Details</th>
                  <th className="px-6 py-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {allLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700/60 text-white font-mono font-bold text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-white">
                        {log.admin?.full_name || "Admin"}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono truncate max-w-[160px]">
                        {log.admin?.email}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-neutral-300">
                      <span className="text-sky-400 font-semibold">{log.entity_type}</span>{" "}
                      {log.entity_id ? (
                        <span className="text-[10px] text-neutral-500">
                          ({log.entity_id.substring(0, 8)}...)
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 max-w-xs truncate text-neutral-400 font-mono text-[11px]">
                      {log.new_data ? JSON.stringify(log.new_data) : log.old_data ? JSON.stringify(log.old_data) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right text-neutral-400 font-mono text-[11px] whitespace-nowrap">
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
