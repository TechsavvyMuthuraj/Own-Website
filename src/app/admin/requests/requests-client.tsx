"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronDown,
  User,
  Calendar,
  Tag,
  FileText,
} from "lucide-react";

interface ResourceRequest {
  id: string;
  user_id: string | null;
  user_email: string;
  user_name: string | null;
  software_name: string;
  software_category: string;
  description: string | null;
  official_url: string | null;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  status: "PENDING" | "IN_REVIEW" | "FULFILLED" | "REJECTED" | "CLOSED";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Pending", color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Clock },
  IN_REVIEW: { label: "In Review", color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20", icon: Search },
  FULFILLED: { label: "Fulfilled", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20", icon: XCircle },
  CLOSED: { label: "Closed", color: "text-slate-500 bg-slate-500/10 border-slate-500/20", icon: XCircle },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  LOW: { label: "Low", color: "text-slate-500 bg-slate-500/10" },
  NORMAL: { label: "Normal", color: "text-[var(--primary)] bg-[var(--primary)]/10" },
  HIGH: { label: "High", color: "text-amber-600 dark:text-amber-400 bg-amber-500/10" },
  URGENT: { label: "Urgent", color: "text-red-600 dark:text-red-400 bg-red-500/10" },
};

export function RequestsClient() {
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedRequest, setSelectedRequest] = useState<ResourceRequest | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [total, setTotal] = useState(0);

  const fetchRequests = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({ per_page: "100" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/requests?${params}`);
      const data = await res.json();

      if (res.ok) {
        setRequests(data.requests || []);
        setTotal(data.total || 0);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to load requests." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error loading requests." });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const handleUpdateStatus = async (requestId: string, status: string) => {
    try {
      setUpdatingId(requestId);
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, admin_notes: adminNotes || undefined }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: `Request marked as ${status}.` });
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: status as ResourceRequest["status"], admin_notes: adminNotes || r.admin_notes } : r))
        );
        if (selectedRequest?.id === requestId) {
          setSelectedRequest((prev) => prev ? { ...prev, status: status as ResourceRequest["status"], admin_notes: adminNotes || prev.admin_notes } : null);
        }
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update request." });
      }
    } catch {
      setMessage({ type: "error", text: "Error updating request." });
    } finally {
      setUpdatingId(null);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const filteredRequests = requests.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.software_name.toLowerCase().includes(q) ||
      r.user_email.toLowerCase().includes(q) ||
      (r.user_name || "").toLowerCase().includes(q) ||
      r.software_category.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "PENDING").length,
    in_review: requests.filter((r) => r.status === "IN_REVIEW").length,
    fulfilled: requests.filter((r) => r.status === "FULFILLED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            Software Requests
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
            Review and manage user-submitted software addition requests.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchRequests(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs font-medium hover:bg-[var(--secondary)] transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
          message.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-[var(--foreground)]" },
          { label: "Pending", value: stats.pending, color: "text-amber-600 dark:text-amber-400" },
          { label: "In Review", value: stats.in_review, color: "text-indigo-600 dark:text-indigo-400" },
          { label: "Fulfilled", value: stats.fulfilled, color: "text-emerald-600 dark:text-emerald-400" },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <p className="text-xs text-[var(--muted-foreground)]">{stat.label}</p>
            <p className={`text-2xl font-extrabold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search by name, email, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] focus:outline-none"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="FULFILLED">Fulfilled</option>
          <option value="REJECTED">Rejected</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      <div className="flex gap-6">
        {/* Requests Table */}
        <div className={`flex-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden ${selectedRequest ? "hidden lg:block" : ""}`}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--muted-foreground)]" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-3 opacity-40" />
              <p className="text-sm text-[var(--muted-foreground)]">No requests found.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {filteredRequests.map((req) => {
                const StatusIcon = STATUS_CONFIG[req.status]?.icon || Clock;
                const priorityConf = PRIORITY_CONFIG[req.priority];
                return (
                  <div
                    key={req.id}
                    onClick={() => { setSelectedRequest(req); setAdminNotes(req.admin_notes || ""); }}
                    className={`p-4 cursor-pointer hover:bg-[var(--secondary)]/50 transition-colors ${selectedRequest?.id === req.id ? "bg-[var(--secondary)]/70 border-l-2 border-l-[var(--primary)]" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-[var(--foreground)] truncate">{req.software_name}</p>
                          <p className="text-xs text-[var(--muted-foreground)] truncate">{req.user_email}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${priorityConf?.color}`}>
                              {priorityConf?.label}
                            </span>
                            <span className="text-[10px] text-[var(--muted-foreground)] bg-[var(--secondary)] px-2 py-0.5 rounded-full">
                              {req.software_category}
                            </span>
                            <span className="text-[10px] text-[var(--muted-foreground)]">
                              {formatTimeAgo(req.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border flex-shrink-0 ${STATUS_CONFIG[req.status]?.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {STATUS_CONFIG[req.status]?.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Drawer */}
        {selectedRequest && (
          <div className="w-full lg:w-[400px] flex-shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 space-y-4 h-fit sticky top-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base text-[var(--foreground)]">{selectedRequest.software_name}</h3>
                <p className="text-xs text-[var(--muted-foreground)]">{selectedRequest.software_category}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)]"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-3.5 rounded-xl bg-[var(--secondary)]/60 border border-[var(--border)] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                <User className="w-3.5 h-3.5" />
                <span>{selectedRequest.user_name || "Anonymous"}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate">{selectedRequest.user_email}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(selectedRequest.created_at).toLocaleString()}</span>
              </div>
              {selectedRequest.official_url && (
                <a
                  href={selectedRequest.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[var(--primary)] hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="truncate">Official Website</span>
                </a>
              )}
            </div>

            {/* Description */}
            {selectedRequest.description && (
              <div>
                <p className="text-[11px] font-semibold text-[var(--foreground)] mb-1">User Description:</p>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed bg-[var(--secondary)]/40 p-3 rounded-xl border border-[var(--border)]">
                  {selectedRequest.description}
                </p>
              </div>
            )}

            {/* Admin Notes */}
            <div>
              <label className="text-[11px] font-semibold text-[var(--foreground)] mb-1 block">
                Admin Notes (internal):
              </label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this request..."
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
              />
            </div>

            {/* Status Actions */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-[var(--foreground)]">Update Status:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { status: "IN_REVIEW", label: "Mark In Review", className: "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20" },
                  { status: "FULFILLED", label: "Mark Fulfilled", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20" },
                  { status: "REJECTED", label: "Reject", className: "border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20" },
                  { status: "CLOSED", label: "Close", className: "border-[var(--border)] bg-[var(--secondary)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]/80" },
                ].map((action) => (
                  <button
                    key={action.status}
                    type="button"
                    disabled={updatingId === selectedRequest.id || selectedRequest.status === action.status}
                    onClick={() => handleUpdateStatus(selectedRequest.id, action.status)}
                    className={`flex items-center justify-center gap-1 py-2 rounded-xl text-[11px] font-semibold border transition-all disabled:opacity-40 ${action.className}`}
                  >
                    {updatingId === selectedRequest.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : null}
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
