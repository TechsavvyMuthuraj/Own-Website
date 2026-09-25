"use client";

import React, { useState } from "react";
import {
  FileText,
  ShieldCheck,
  History,
  Trash2,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_data?: any;
  new_data?: any;
  created_at: string;
  admin?: {
    full_name?: string;
    email?: string;
  };
}

interface AuditLogsClientProps {
  initialLogs: AuditLog[];
}

export function AuditLogsClient({ initialLogs }: AuditLogsClientProps) {
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
  const [isClearing, setIsClearing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { showToast } = useToast();

  const handleClearLogs = async () => {
    if (logs.length === 0) return;

    const confirmed = window.confirm(
      "⚠️ PERMANENT AUDIT PURGE\n\nAre you sure you want to permanently clear all system audit logs? This action is irreversible."
    );

    if (!confirmed) return;

    setIsClearing(true);
    try {
      const res = await fetch("/api/admin/audit-logs", {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setLogs([]);
        showToast({
          type: "success",
          title: "Audit Trail Cleared",
          message: "All audit log entries have been permanently purged from the system.",
        });
      } else {
        showToast({
          type: "error",
          title: "Purge Failed",
          message: data.error || "Failed to clear audit logs.",
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Failed to connect to audit logging service.",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* ── SaaS Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-gradient-to-br from-white via-slate-50/80 to-white dark:from-neutral-950 dark:via-neutral-900/90 dark:to-neutral-950 shadow-xs relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Security &amp; Compliance Audit Trail
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <History className="w-6 h-6" />
            </div>
            <span>System Audit Logs &amp; Activity</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl">
            Chronological record of administrator operations, status mutations, entity edits, and deletions.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 flex items-center gap-2 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Captured Events:</span>{" "}
            <strong className="text-neutral-900 dark:text-white font-mono text-sm">{logs.length} Entries</strong>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            Tamper-Resistant
          </div>

          {/* Action Buttons: Refresh & Clear Logs */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all cursor-pointer shadow-xs"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            disabled={logs.length === 0 || isClearing}
            onClick={handleClearLogs}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isClearing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>Clear All Logs</span>
          </button>
        </div>
      </div>

      {logs.length > 0 ? (
        <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 backdrop-blur-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-neutral-50/90 dark:bg-neutral-950/80 text-neutral-600 dark:text-neutral-400 uppercase font-semibold border-b border-neutral-200 dark:border-neutral-800 tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-4 py-4">Admin Operator</th>
                  <th className="px-4 py-4">Target Entity</th>
                  <th className="px-4 py-4">Payload Details</th>
                  <th className="px-6 py-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80 dark:divide-neutral-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60 text-neutral-900 dark:text-white font-mono font-bold text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-neutral-900 dark:text-white">
                        {log.admin?.full_name || "Admin"}
                      </div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono truncate max-w-[160px]">
                        {log.admin?.email}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-neutral-700 dark:text-neutral-300">
                      <span className="text-sky-600 dark:text-sky-400 font-semibold">{log.entity_type}</span>{" "}
                      {log.entity_id ? (
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          ({log.entity_id.substring(0, 8)}...)
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 max-w-xs truncate text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">
                      {log.new_data
                        ? JSON.stringify(log.new_data)
                        : log.old_data
                        ? JSON.stringify(log.old_data)
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right text-neutral-500 dark:text-neutral-400 font-mono text-[11px] whitespace-nowrap">
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
          title="No audit log entries"
          description="Actions performed by administrators (creating resources, status updates, deletions) will appear here automatically."
        />
      )}
    </div>
  );
}
