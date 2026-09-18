"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Package,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Clock,
  Archive,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import type { Resource, Category } from "@/types/database";
import { formatDate, formatCurrency } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { ResourceVisual } from "@/components/resources/resource-visual";
import { useToast } from "@/components/ui/toast";

interface ResourceTableClientProps {
  initialResources: Resource[];
  categories: Category[];
  currentQuery: string;
  currentCategory: string;
  currentStatus: string;
}

export function ResourceTableClient({
  initialResources,
  categories,
  currentQuery,
  currentCategory,
  currentStatus,
}: ResourceTableClientProps) {
  const router = useRouter();
  const { showToast, confirm } = useToast();
  const [searchTerm, setSearchTerm] = useState(currentQuery);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/resources?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange("q", searchTerm);
  };

  const handleDuplicate = (id: string, title: string) => {
    confirm({
      title: "Duplicate Resource?",
      message: `Create a new draft copy of "${title}" with all its configurations?`,
      confirmText: "Duplicate",
      variant: "primary",
      onConfirm: async () => {
        setActionLoading(`dup_${id}`);
        try {
          const res = await fetch(`/api/admin/resources/${id}/duplicate`, {
            method: "POST",
          });
          const data = await res.json();
          if (res.ok) {
            showToast({
              type: "success",
              title: "Duplicate Created",
              message: `Successfully duplicated "${title}".`,
            });
            router.refresh();
          } else {
            showToast({
              type: "error",
              title: "Duplicate Failed",
              message: data.error || "Failed to duplicate resource.",
            });
          }
        } catch {
          showToast({
            type: "error",
            title: "Network Error",
            message: "Error duplicating resource.",
          });
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handleDelete = (id: string, title: string) => {
    confirm({
      title: `Delete "${title}"?`,
      message: "This will permanently remove this resource and all associated download links. This cannot be undone.",
      confirmText: "Delete Permanently",
      variant: "danger",
      onConfirm: async () => {
        setActionLoading(`del_${id}`);
        try {
          const res = await fetch(`/api/admin/resources/${id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (res.ok) {
            showToast({
              type: "success",
              title: "Resource Deleted",
              message: `"${title}" has been permanently removed.`,
            });
            router.refresh();
          } else {
            showToast({
              type: "error",
              title: "Deletion Failed",
              message: data.error || "Failed to delete resource.",
            });
          }
        } catch {
          showToast({
            type: "error",
            title: "Network Error",
            message: "Error communicating with server.",
          });
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const handlePurgeAll = () => {
    confirm({
      title: "Clear All Resources & Start Fresh?",
      message:
        "WARNING: This will permanently purge ALL resource products, download links, and images across the entire platform. Use this option to start with a fresh catalog.",
      confirmText: "Wipe All & Start Fresh",
      variant: "danger",
      onConfirm: async () => {
        setActionLoading("purge_all");
        try {
          const res = await fetch("/api/admin/resources/purge", {
            method: "POST",
          });
          const data = await res.json();
          if (res.ok) {
            showToast({
              type: "success",
              title: "Fresh Slate Activated! 🚀",
              message: data.message || "All resources purged successfully.",
              duration: 5000,
            });
            router.refresh();
          } else {
            showToast({
              type: "error",
              title: "Purge Failed",
              message: data.error || "Could not purge resources.",
            });
          }
        } catch {
          showToast({
            type: "error",
            title: "Network Error",
            message: "Failed to reach server to purge resources.",
          });
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            PUBLISHED
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20">
            ARCHIVED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            DRAFT
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar with Purge Action */}
      <div className="p-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category selector */}
          <select
            value={currentCategory}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status selector */}
          <select
            value={currentStatus}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Start Fresh / Purge All Option */}
          {initialResources.length > 0 && (
            <button
              type="button"
              onClick={handlePurgeAll}
              disabled={actionLoading === "purge_all"}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold text-xs transition-all shadow-xs"
              title="Remove all products to start completely fresh"
            >
              {actionLoading === "purge_all" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Clear All & Start Fresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Canvas */}
      {initialResources.length > 0 ? (
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--secondary)]/60 text-[var(--muted-foreground)] uppercase tracking-wider font-semibold border-b border-[var(--border)]">
                <tr>
                  <th className="px-5 py-3.5">Resource</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Type / Platform</th>
                  <th className="px-4 py-3.5">Access / Price</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Updated</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {initialResources.map((res) => (
                  <tr key={res.id} className="hover:bg-[var(--secondary)]/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <ResourceVisual resource={res} variant="icon" size="sm" showFormatTag={false} />
                        <div>
                          <div className="font-semibold text-sm text-[var(--foreground)]">
                            {res.title}
                          </div>
                          <div className="font-mono text-[10px] text-[var(--muted-foreground)]">
                            /{res.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[var(--foreground)]">
                      {res.category?.name || "Uncategorized"}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--muted-foreground)]">
                      <div>{res.resource_type}</div>
                      {res.platform && (
                        <span className="text-[10px] text-[var(--foreground)] font-medium">
                          {res.platform}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-[var(--foreground)]">
                        {res.access_type === "PAID"
                          ? formatCurrency(res.sale_price !== null ? res.sale_price : res.price, res.currency)
                          : "FREE"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">{getStatusBadge(res.status)}</td>
                    <td className="px-4 py-3.5 text-[var(--muted-foreground)] whitespace-nowrap">
                      {formatDate(res.updated_at)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {res.status === "PUBLISHED" && (
                          <Link
                            href={`/resource/${res.slug}`}
                            target="_blank"
                            title="View Public Page"
                            className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/resources/${res.id}/edit`}
                          title="Edit Resource"
                          className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--secondary)] text-[var(--foreground)] transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(res.id, res.title)}
                          disabled={actionLoading === `dup_${res.id}`}
                          title="Duplicate Resource"
                          className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--secondary)] text-[var(--foreground)] transition-colors"
                        >
                          {actionLoading === `dup_${res.id}` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(res.id, res.title)}
                          disabled={actionLoading === `del_${res.id}`}
                          title="Delete Resource"
                          className="p-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-500 transition-colors"
                        >
                          {actionLoading === `del_${res.id}` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="No resources in database"
          description="Your catalog is clean and ready for fresh products. Click 'Add New Resource' to publish software or digital assets."
          actionText="Add New Resource"
          actionHref="/admin/resources/new"
        />
      )}
    </div>
  );
}
