"use client";

import React, { useState, useTransition } from "react";
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
  Sparkles,
  AlertTriangle,
  Layers,
  Smartphone,
  Laptop,
  Globe,
  Tag,
  Boxes,
  ShieldCheck,
  Zap,
  Check,
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
  stats?: {
    total: number;
    published: number;
    paid: number;
    free: number;
  };
}

export function ResourceTableClient({
  initialResources,
  categories,
  currentQuery,
  currentCategory,
  currentStatus,
  stats,
}: ResourceTableClientProps) {
  const router = useRouter();
  const { showToast, confirm } = useToast();
  const [searchTerm, setSearchTerm] = useState(currentQuery);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Compute stats dynamically if not provided
  const liveStats = stats || {
    total: initialResources.length,
    published: initialResources.filter((r) => r.status === "PUBLISHED").length,
    paid: initialResources.filter((r) => r.access_type === "PAID" && Number(r.price || 0) > 0).length,
    free: initialResources.filter((r) => r.access_type !== "PAID" || !r.price || Number(r.price) === 0).length,
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`/admin/resources?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange("q", searchTerm);
  };

  const handleCopySlug = (slug: string) => {
    navigator.clipboard.writeText(`/resource/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleDuplicate = (id: string, title: string) => {
    confirm({
      title: "Duplicate Resource?",
      message: `Create a new draft copy of "${title}" with all its configurations, download mirrors, and metadata?`,
      confirmText: "Duplicate Resource",
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
              title: "Duplicate Created 🚀",
              message: `Successfully cloned "${title}" as a draft.`,
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
      message: "This will permanently remove this resource and its associated download mirrors from the database. This action cannot be reversed.",
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
              message: `"${title}" has been permanently purged.`,
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
        "WARNING: This will permanently purge ALL digital resource products, download mirrors, and attachments across the entire catalog. Use this option to start with a fresh slate.",
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
              message: data.message || "All catalog resources purged successfully.",
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

  const getPlatformIcon = (platform?: string | null) => {
    if (!platform) return <Laptop className="w-3.5 h-3.5 text-neutral-400" />;
    const p = platform.toLowerCase();
    if (p.includes("android") || p.includes("apk")) {
      return <Smartphone className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (p.includes("windows") || p.includes("pc")) {
      return <Laptop className="w-3.5 h-3.5 text-blue-400" />;
    }
    if (p.includes("web") || p.includes("online")) {
      return <Globe className="w-3.5 h-3.5 text-cyan-400" />;
    }
    return <Laptop className="w-3.5 h-3.5 text-purple-400" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            PUBLISHED
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
            ARCHIVED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            DRAFT
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ── SaaS Quick Metric Stats Ribbon ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 backdrop-blur-md shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider block">
              Total Catalog
            </span>
            <span className="text-xl font-black text-neutral-900 dark:text-white font-mono">
              {liveStats.total}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 backdrop-blur-md shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider block">
              Live Published
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {liveStats.published}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 backdrop-blur-md shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider block">
              Monetized / Paid
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {liveStats.paid}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 backdrop-blur-md shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider block">
              Free Community
            </span>
            <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
              {liveStats.free}
            </span>
          </div>
        </div>
      </div>

      {/* ── SaaS Command & Filter Toolbar ── */}
      <div className="p-4 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white/95 dark:bg-neutral-900/50 backdrop-blur-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 text-xs shadow-xs dark:shadow-xl">
        {/* Search with input shortcut badge */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search software by title, tag, or version..."
            className="w-full pl-10 pr-16 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all shadow-inner"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                handleFilterChange("q", "");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              Clear
            </button>
          ) : (
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
              /
            </kbd>
          )}
        </form>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Segmented Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
            {[
              { id: "ALL", label: "All", count: liveStats.total },
              { id: "PUBLISHED", label: "Published", count: liveStats.published },
              { id: "DRAFT", label: "Draft", count: liveStats.total - liveStats.published },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleFilterChange("status", tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  currentStatus === tab.id
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-bold"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    currentStatus === tab.id
                      ? "bg-neutral-100 dark:bg-white/20 text-neutral-900 dark:text-white font-bold"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={currentCategory}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-800 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer transition-all"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Layers className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Start Fresh / Purge All Button */}
          {initialResources.length > 0 && (
            <button
              type="button"
              onClick={handlePurgeAll}
              disabled={actionLoading === "purge_all"}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold text-xs transition-all shadow-xs cursor-pointer active:scale-95"
              title="Remove all products to start completely fresh"
            >
              {actionLoading === "purge_all" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Purge All</span>
            </button>
          )}
        </div>
      </div>

      {/* ── SaaS Table Canvas ── */}
      {initialResources.length > 0 ? (
        <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 backdrop-blur-xl overflow-hidden shadow-xs dark:shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50/90 dark:bg-neutral-950/70 text-neutral-600 dark:text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-200 dark:border-neutral-800 text-[10px]">
                  <th className="px-6 py-4">Resource Details</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Platform &amp; Engine</th>
                  <th className="px-4 py-4">Monetization</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Updated</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80 dark:divide-neutral-800/60">
                {initialResources.map((res) => (
                  <tr
                    key={res.id}
                    className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30 transition-all duration-150 group"
                  >
                    {/* Resource Thumbnail, Title, and Slug */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative shrink-0 rounded-2xl overflow-hidden p-0.5 border border-neutral-200 dark:border-neutral-700/60 bg-neutral-100 dark:bg-neutral-800/80 shadow-xs group-hover:border-cyan-500/40 transition-colors">
                          <ResourceVisual
                            resource={res}
                            variant="icon"
                            size="sm"
                            showFormatTag={false}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate max-w-xs sm:max-w-sm">
                            {res.title}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-[200px]">
                              /{res.slug}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopySlug(res.slug)}
                              className="text-[10px] text-neutral-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                              title="Copy URL path"
                            >
                              {copiedSlug === res.slug ? (
                                <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700/60">
                        <Tag className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                        <span>{res.category?.name || "General"}</span>
                      </span>
                    </td>

                    {/* Platform & Engine */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                          {getPlatformIcon(res.platform)}
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                            {res.platform || "Universal"}
                          </div>
                          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-mono">
                            {res.resource_type || "Software"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Access / Price */}
                    <td className="px-4 py-4">
                      {res.access_type === "PAID" && Number(res.price || 0) > 0 ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold font-mono text-xs">
                          <span>
                            {formatCurrency(
                              res.sale_price !== null && res.sale_price !== undefined
                                ? res.sale_price
                                : res.price,
                              res.currency
                            )}
                          </span>
                          {res.sale_price !== null && res.sale_price !== undefined && res.sale_price < res.price && (
                            <span className="line-through text-neutral-400 dark:text-neutral-500 text-[10px]">
                              {formatCurrency(res.price, res.currency)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 font-bold text-xs tracking-wide">
                          FREE
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">{getStatusBadge(res.status)}</td>

                    {/* Updated Time */}
                    <td className="px-4 py-4 text-neutral-600 dark:text-neutral-400 whitespace-nowrap font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
                        <span>{formatDate(res.updated_at)}</span>
                      </div>
                    </td>

                    {/* Actions Dock */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {res.status === "PUBLISHED" && (
                          <Link
                            href={`/resource/${res.slug}`}
                            target="_blank"
                            title="View Public Page"
                            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-100 dark:bg-neutral-800/60 hover:bg-emerald-500/15 text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 transition-all shadow-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <Link
                          href={`/admin/resources/${res.id}/edit`}
                          title="Edit Resource"
                          className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-100 dark:bg-neutral-800/60 hover:bg-cyan-500/15 text-neutral-700 dark:text-neutral-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/30 transition-all shadow-xs"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(res.id, res.title)}
                          disabled={actionLoading === `dup_${res.id}`}
                          title="Duplicate Resource"
                          className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-100 dark:bg-neutral-800/60 hover:bg-purple-500/15 text-neutral-700 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-500/30 transition-all shadow-xs cursor-pointer"
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
                          className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-100 dark:bg-neutral-800/60 hover:bg-red-500/15 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/30 transition-all shadow-xs cursor-pointer"
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

          {/* Table SaaS Footer */}
          <div className="px-6 py-3.5 bg-neutral-50/90 dark:bg-neutral-950/80 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>
                Showing <strong className="text-neutral-900 dark:text-white">{initialResources.length}</strong> items in digital catalog
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px]">
              <span>POSTGRESQL STORAGE NODE</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">REALTIME SYNC ACTIVE</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 mx-auto flex items-center justify-center">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">No Catalog Resources Found</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
            Your digital software catalog is clean and ready. Click below to add your first verified software or tool.
          </p>
          <Link
            href="/admin/resources/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
          >
            <Package className="w-4 h-4" />
            <span>+ Add New Resource</span>
          </Link>
        </div>
      )}
    </div>
  );
}
