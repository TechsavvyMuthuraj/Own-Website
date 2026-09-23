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
  Trash2,
  ShieldCheck,
  Headphones,
  ExternalLink,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/components/ui/toast";

interface UserRequest {
  id: string;
  resource_name: string;
  category: string;
  description: string;
  status: "pending" | "reviewing" | "approved" | "rejected" | "completed";
  admin_note: string | null;
  created_at: string;
  updated_at: string | null;
  contacted_at: string | null;
  resolved_at: string | null;
  specialist_message?: string | null;
  specialist_name?: string | null;
  chat_session_id?: string | null;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending Triage",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    icon: Clock,
  },
  reviewing: {
    label: "In Review",
    color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    icon: Search,
  },
  approved: {
    label: "Approved",
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Declined",
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    icon: XCircle,
  },
  completed: {
    label: "Solved & Fulfilled",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    icon: CheckCircle2,
  },
};

export default function AccountRequestsPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast, confirm } = useToast();
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMyRequests = async () => {
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
  };

  useEffect(() => {
    if (!authLoading) {
      fetchMyRequests();
    }
  }, [user, authLoading]);

  // Handle User Deleting their own Request
  const handleDeleteRequest = (item: UserRequest) => {
    confirm({
      title: "Delete Resource Request?",
      message: `Are you sure you want to permanently delete your request for "${item.resource_name}"? This action cannot be undone.`,
      confirmText: "Delete Request",
      cancelText: "Keep",
      variant: "danger",
      onConfirm: async () => {
        setDeletingId(item.id);
        // Optimistic UI removal
        const prevRequests = [...requests];
        setRequests((prev) => prev.filter((r) => r.id !== item.id));

        try {
          const res = await fetch(`/api/user/requests?id=${item.id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast({
              type: "success",
              title: "Request Deleted",
              message: `Your request for "${item.resource_name}" was successfully removed.`,
            });
          } else {
            // Rollback on error
            setRequests(prevRequests);
            showToast({
              type: "error",
              title: "Delete Failed",
              message: data.error || "Could not delete request. Please try again.",
            });
          }
        } catch {
          setRequests(prevRequests);
          showToast({
            type: "error",
            title: "Network Error",
            message: "Failed to connect to server. Please try again.",
          });
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

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

  const formatDateTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return iso;
    }
  };

  // Helper to extract links from text
  const extractUrls = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
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
            Track technical support reviews, solved solutions, specialist messages, and manage your requests.
          </p>
        </div>

        <Link
          href="/request"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all shadow-sm w-fit cursor-pointer"
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
            Can&apos;t find a specific software, tool, or movie in our catalog? Submit a request and our technical team will review and fulfill it.
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
        <div className="space-y-4">
          {requests.map((item) => {
            const statusConf = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusConf.icon;
            const isCompleted = item.status === "completed";
            const isReviewing = item.status === "reviewing";
            const isDeleting = deletingId === item.id;
            const linksInNote = item.admin_note ? extractUrls(item.admin_note) : [];

            return (
              <div
                key={item.id}
                className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--border)]/80 transition-all shadow-xs space-y-4 relative overflow-hidden"
              >
                {/* Top Row: Title, Category, Status Badge & Delete Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      {item.resource_name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)]">
                      <Tag className="w-3 h-3" />
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConf.color}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusConf.label}</span>
                    </span>

                    {/* Delete Option */}
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => handleDeleteRequest(item)}
                      title="Delete this request"
                      className="p-1.5 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* User Original Description */}
                {item.description && (
                  <div className="text-xs text-[var(--muted-foreground)] leading-relaxed bg-[var(--secondary)]/40 p-3 rounded-xl border border-[var(--border)]/50">
                    <span className="font-semibold text-[var(--foreground)]">My Request Note: </span>
                    <span>{item.description}</span>
                  </div>
                )}

                {/* ── TECHNICAL TEAM REVIEW & SOLVED INFORMATION ── */}
                {isCompleted && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/30 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Technical Team Resolution & Solved Info
                        </span>
                      </div>
                      {item.resolved_at && (
                        <span className="text-[11px] text-emerald-400/80 font-mono">
                          Solved: {formatDateTime(item.resolved_at)}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-emerald-300/90 leading-relaxed font-medium bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/20">
                      {item.admin_note || "Your requested resource has been verified, tested, and fulfilled by our technical support desk."}
                    </div>

                    {/* Quick Access links if provided in note */}
                    {linksInNote.length > 0 && (
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {linksInNote.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors shadow-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Access Download Link {linksInNote.length > 1 ? `#${idx + 1}` : ""}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {isReviewing && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500/10 via-cyan-500/5 to-transparent border border-sky-500/30 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-sky-400">
                        <Search className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Under Technical Review
                        </span>
                      </div>
                      {item.contacted_at && (
                        <span className="text-[11px] text-sky-400/80 font-mono">
                          Started: {formatDateTime(item.contacted_at)}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-sky-300/90 leading-relaxed">
                      {item.admin_note ||
                        "A Technical Support Specialist is currently checking source mirrors, testing game/software repacks, and verifying clean distribution."}
                    </p>
                  </div>
                )}

                {/* ── TECHNICAL TEAM MESSAGE & LIVE SUPPORT CHAT LINK ── */}
                {item.specialist_message && (
                  <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Headphones className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5">
                          <span>{item.specialist_name || "Technical Specialist"}</span>
                          <span className="text-[10px] text-[var(--muted-foreground)] font-normal">
                            (Live Support)
                          </span>
                        </div>
                        <p className="text-xs text-[var(--foreground)] mt-0.5 leading-relaxed truncate">
                          &ldquo;{item.specialist_message}&rdquo;
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all shrink-0 cursor-pointer self-start sm:self-auto"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Reply in Live Support</span>
                    </Link>
                  </div>
                )}

                {/* Card Footer: Timestamps & WhatsApp Notification status */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)]/60 text-[11px] text-[var(--muted-foreground)]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 opacity-70" />
                    <span>Requested: {formatDate(item.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {item.contacted_at && (
                      <div className="flex items-center gap-1 text-emerald-500">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Admin reached out via WhatsApp</span>
                      </div>
                    )}
                    {item.resolved_at && (
                      <div className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolved on {formatDate(item.resolved_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
