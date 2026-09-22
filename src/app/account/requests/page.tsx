"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Plus,
  MessageSquarePlus,
  Calendar,
  Tag,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

interface UserRequest {
  id: string;
  resource_name: string;
  category: string;
  description: string;
  status: "pending" | "reviewing" | "approved" | "rejected" | "completed";
  created_at: string;
  contacted_at: string | null;
  resolved_at: string | null;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    icon: Clock,
  },
  reviewing: {
    label: "Reviewing",
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    icon: Search,
  },
  approved: {
    label: "Approved",
    color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    icon: XCircle,
  },
  completed: {
    label: "Completed",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    icon: CheckCircle2,
  },
};

export default function AccountRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMyRequests() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/user/requests");
        const data = await res.json();
        if (res.ok && data.success) {
          setRequests(data.requests || []);
        } else {
          setError(data.error || "Failed to load requests.");
        }
      } catch {
        setError("Network error loading your requests.");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchMyRequests();
    }
  }, [user, authLoading]);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-[var(--primary)]" />
            <span>My Resource Requests</span>
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Track the status of tools, software, or digital packages you&apos;ve requested.
          </p>
        </div>

        <Link
          href="/request"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all shadow-sm w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </Link>
      </div>

      {/* Content Area */}
      {loading || authLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl border border-[var(--border)] bg-[var(--card)]">
          <MessageSquarePlus className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">
            No resource requests yet
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto mb-5 leading-relaxed">
            Can&apos;t find a specific software or tool in our catalog? Submit a request and our team will review it.
          </p>
          <Link
            href="/request"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Request a Resource</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((item) => {
            const statusConf = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusConf.icon;

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--border)]/80 transition-all shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-[var(--foreground)]">
                      {item.resource_name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)]">
                      <Tag className="w-3 h-3" />
                      {item.category}
                    </span>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border w-fit ${statusConf.color}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{statusConf.label}</span>
                  </span>
                </div>

                {item.description && (
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)]/60 text-[11px] text-[var(--muted-foreground)]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 opacity-70" />
                    <span>Requested: {formatDate(item.created_at)}</span>
                  </div>

                  {item.contacted_at && (
                    <div className="flex items-center gap-1 text-emerald-500">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Admin reached out via WhatsApp</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
