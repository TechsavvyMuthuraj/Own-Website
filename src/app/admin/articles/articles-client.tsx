"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Article } from "@/types/database";
import {
  Newspaper,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Star,
  StarOff,
  Calendar,
  Check,
  Tag,
  FileText,
  Globe,
  Copy,
  ExternalLink,
  ArrowUpDown,
  CheckSquare,
  Square,
  BarChart3,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ArticlesAdminClientProps {
  initialArticles: Article[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ArticlesAdminClient({ initialArticles }: ArticlesAdminClientProps) {
  const router = useRouter();
  const { showToast, confirm } = useToast();
  const supabase = createClient();

  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT" | "ARCHIVED">("ALL");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title" | "views">("newest");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filtered & Sorted articles
  const filtered = useMemo(() => {
    let result = articles.filter((a) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        (a.excerpt || "").toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        (a.tags || []).some((t) => t.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
      const matchesFeatured = !featuredOnly || a.featured;

      return matchesSearch && matchesStatus && matchesFeatured;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "views") {
        return (b.views_count || 0) - (a.views_count || 0);
      }
      return 0;
    });

    return result;
  }, [articles, search, statusFilter, featuredOnly, sortBy]);

  // Bulk Selection toggling
  const isAllSelected = filtered.length > 0 && selectedIds.length === filtered.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Duplicate an article
  const handleDuplicate = async (a: Article) => {
    setActionLoading(`dup-${a.id}`);
    try {
      const uniqueSuffix = Math.random().toString(36).substring(2, 6);
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${a.title} (Copy)`,
          slug: `${a.slug}-copy-${uniqueSuffix}`,
          excerpt: a.excerpt,
          content: a.content,
          thumbnail_url: a.thumbnail_url,
          tags: a.tags,
          status: "DRAFT",
          featured: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to duplicate");

      setArticles((prev) => [data.article, ...prev]);
      showToast({
        type: "success",
        title: "Article Duplicated",
        message: `Draft created: "${a.title} (Copy)"`,
      });
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Duplication Failed",
        message: err.message,
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle Publish / Draft
  const toggleStatus = async (a: Article) => {
    const newStatus = a.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setActionLoading(`status-${a.id}`);
    try {
      const res = await fetch(`/api/admin/articles/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          published_at: newStatus === "PUBLISHED" ? new Date().toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      setArticles((prev) => prev.map((x) => (x.id === a.id ? (data.article as Article) : x)));
      showToast({
        type: "success",
        title: newStatus === "PUBLISHED" ? "Published!" : "Moved to Drafts",
        message: a.title,
      });
    } catch (err: any) {
      showToast({ type: "error", title: "Update Failed", message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle Featured
  const toggleFeatured = async (a: Article) => {
    setActionLoading(`feat-${a.id}`);
    try {
      const res = await fetch(`/api/admin/articles/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !a.featured }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      setArticles((prev) => prev.map((x) => (x.id === a.id ? (data.article as Article) : x)));
      showToast({
        type: "success",
        title: !a.featured ? "Marked as Featured" : "Removed from Featured",
        message: a.title,
      });
    } catch (err: any) {
      showToast({ type: "error", title: "Update Failed", message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  // Delete article
  const handleDelete = (a: Article) => {
    confirm({
      title: "Delete Article?",
      message: `Are you sure you want to permanently delete "${a.title}"? This action cannot be undone.`,
      confirmText: "Delete Article",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/articles/${a.id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to delete");

          setArticles((prev) => prev.filter((x) => x.id !== a.id));
          setSelectedIds((prev) => prev.filter((id) => id !== a.id));
          showToast({
            type: "success",
            title: "Article Deleted",
            message: a.title,
          });
        } catch (err: any) {
          showToast({
            type: "error",
            title: "Delete Failed",
            message: err.message,
          });
        }
      },
    });
  };

  // Bulk actions
  const handleBulkStatus = async (targetStatus: "PUBLISHED" | "DRAFT" | "ARCHIVED") => {
    if (selectedIds.length === 0) return;
    setActionLoading("bulk");
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/admin/articles/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: targetStatus,
              published_at: targetStatus === "PUBLISHED" ? new Date().toISOString() : null,
            }),
          })
        )
      );

      setArticles((prev) =>
        prev.map((a) =>
          selectedIds.includes(a.id)
            ? {
                ...a,
                status: targetStatus,
                published_at: targetStatus === "PUBLISHED" ? new Date().toISOString() : a.published_at,
              }
            : a
        )
      );
      showToast({
        type: "success",
        title: "Bulk Update Complete",
        message: `Updated ${selectedIds.length} articles to ${targetStatus}.`,
      });
      setSelectedIds([]);
    } catch (err: any) {
      showToast({ type: "error", title: "Bulk Action Failed", message: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    confirm({
      title: `Delete ${selectedIds.length} Articles?`,
      message: `Are you sure you want to permanently delete ${selectedIds.length} selected articles? This action cannot be reversed.`,
      confirmText: "Delete Selected",
      variant: "danger",
      onConfirm: async () => {
        setActionLoading("bulk-del");
        try {
          await Promise.all(
            selectedIds.map((id) =>
              fetch(`/api/admin/articles/${id}`, {
                method: "DELETE",
              })
            )
          );

          setArticles((prev) => prev.filter((a) => !selectedIds.includes(a.id)));
          setSelectedIds([]);
          showToast({
            type: "success",
            title: "Articles Deleted",
            message: `Deleted ${selectedIds.length} articles.`,
          });
        } catch (err: any) {
          showToast({ type: "error", title: "Bulk Delete Failed", message: err.message });
        } finally {
          setActionLoading(null);
        }
      },
    });
  };

  // Metrics
  const publishedCount = articles.filter((a) => a.status === "PUBLISHED").length;
  const draftCount = articles.filter((a) => a.status === "DRAFT").length;
  const totalViews = articles.reduce((acc, curr) => acc + (curr.views_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* ── SaaS Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-gradient-to-br from-white via-slate-50/80 to-white dark:from-neutral-950 dark:via-neutral-900/90 dark:to-neutral-950 shadow-xs relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
            NammaTech Publishing Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Newspaper className="w-7 h-7 text-amber-500 dark:text-amber-400" />
            <span>Articles & Technical Journal</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl">
            Publish rich editorial tutorials, software deep dives, and developer guides with live auto-arrange, markdown engine, and SEO checklists.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Open Article Studio</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 backdrop-blur-md shadow-xs flex items-center gap-3.5 hover:-translate-y-0.5 transition-transform">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              Total Articles
            </span>
            <span className="text-xl font-black text-neutral-900 dark:text-white">
              {articles.length}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 backdrop-blur-md shadow-xs flex items-center gap-3.5 hover:-translate-y-0.5 transition-transform">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              Live Published
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {publishedCount}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 backdrop-blur-md shadow-xs flex items-center gap-3.5 hover:-translate-y-0.5 transition-transform">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              Drafts
            </span>
            <span className="text-xl font-black text-blue-600 dark:text-blue-400">
              {draftCount}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 backdrop-blur-md shadow-xs flex items-center gap-3.5 hover:-translate-y-0.5 transition-transform">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
              Total Views
            </span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400">
              {totalViews.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters, Search, and Sort */}
      <div className="p-4 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white/95 dark:bg-neutral-900/50 backdrop-blur-xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-950/60 border border-neutral-200/70 dark:border-neutral-800/60 text-xs font-semibold overflow-x-auto">
            {(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-bold"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-200/60 dark:bg-neutral-700/60 font-mono">
                  {st === "ALL"
                    ? articles.length
                    : articles.filter((a) => a.status === st).length}
                </span>
              </button>
            ))}
          </div>

          {/* Featured Toggle & Sort Selector */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFeaturedOnly(!featuredOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                featuredOnly
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold"
                  : "bg-neutral-100/60 dark:bg-neutral-950/40 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Featured Only</span>
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-8 pr-8 py-2 rounded-xl text-xs font-medium bg-neutral-100/60 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
                <option value="views">Most Viewed</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search articles by title, URL slug, tags, or excerpt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all shadow-inner"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Ribbon (Shows when items are selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 px-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300">
            <CheckSquare className="w-4 h-4" />
            <span>{selectedIds.length} article(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkStatus("PUBLISHED")}
              disabled={actionLoading === "bulk"}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Publish</span>
            </button>
            <button
              type="button"
              onClick={() => handleBulkStatus("DRAFT")}
              disabled={actionLoading === "bulk"}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Draft</span>
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={actionLoading === "bulk-del"}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Articles Table */}
      <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 backdrop-blur-xl shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:flex items-center gap-4 px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
          <div className="w-6 flex items-center">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-amber-500" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="w-20">Media</div>
          <div className="flex-1">Title & Details</div>
          <div className="w-28 text-center">Status</div>
          <div className="w-24 text-center">Views</div>
          <div className="w-48 text-right pr-2">Actions</div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Newspaper className="w-10 h-10 text-neutral-400 dark:text-neutral-600 mx-auto" />
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              No matching articles found
            </p>
            <Link
              href="/admin/articles/new"
              className="inline-block text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              Write your first article in Studio →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200/80 dark:divide-neutral-800/60">
            {filtered.map((a) => {
              const isSelected = selectedIds.includes(a.id);
              return (
                <div
                  key={a.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30 transition-colors group ${
                    isSelected ? "bg-amber-500/5 dark:bg-amber-500/10" : ""
                  }`}
                >
                  {/* Select Checkbox & Thumbnail */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSelectOne(a.id)}
                      className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <div className="w-20 h-14 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800/80 flex-shrink-0 relative shadow-xs">
                      {a.thumbnail_url ? (
                        <img
                          src={a.thumbnail_url}
                          alt={a.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 dark:text-neutral-600">
                          <Newspaper className="w-5 h-5 opacity-40" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/admin/articles/${a.id}/edit`}
                        className="text-sm font-bold text-neutral-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors truncate max-w-md"
                      >
                        {a.title}
                      </Link>

                      {a.featured && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          FEATURED
                        </span>
                      )}
                    </div>

                    {a.excerpt && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1 mt-1">
                        {a.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-neutral-500 dark:text-neutral-400 mt-1.5 font-mono flex-wrap">
                      <span className="flex items-center gap-1 text-neutral-400">
                        /{a.slug}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        {formatDate(a.created_at)}
                      </span>
                      {a.tags && a.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <Tag className="w-3 h-3" />
                            {a.tags.slice(0, 3).join(", ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="w-28 text-center flex-shrink-0">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                        a.status === "PUBLISHED"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25"
                          : a.status === "ARCHIVED"
                          ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700"
                          : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>

                  {/* Views Count */}
                  <div className="w-24 text-center text-xs font-mono text-neutral-600 dark:text-neutral-400 flex-shrink-0">
                    {(a.views_count || 0).toLocaleString("en-IN")} views
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-end gap-1.5 flex-shrink-0 w-48">
                    {/* Public URL view */}
                    {a.status === "PUBLISHED" && (
                      <Link
                        href={`/articles/${a.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-500 hover:text-amber-500 hover:border-amber-500/30 transition-all shadow-xs"
                        title="View Public Article"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    {/* Feature Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleFeatured(a)}
                      className={`p-2 rounded-xl border transition-all shadow-xs cursor-pointer ${
                        a.featured
                          ? "border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-400 hover:text-amber-500"
                      }`}
                      title={a.featured ? "Unfeature" : "Feature"}
                    >
                      {a.featured ? (
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                      ) : (
                        <StarOff className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Status Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleStatus(a)}
                      className={`p-2 rounded-xl border transition-all shadow-xs cursor-pointer ${
                        a.status === "PUBLISHED"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-400 hover:text-emerald-500"
                      }`}
                      title={a.status === "PUBLISHED" ? "Switch to Draft" : "Publish Article"}
                    >
                      {a.status === "PUBLISHED" ? (
                        <Eye className="w-3.5 h-3.5" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={() => handleDuplicate(a)}
                      disabled={actionLoading === `dup-${a.id}`}
                      className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-500 hover:text-blue-500 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      title="Duplicate as new draft"
                    >
                      {actionLoading === `dup-${a.id}` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Edit in Studio */}
                    <Link
                      href={`/admin/articles/${a.id}/edit`}
                      className="p-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold transition-all shadow-xs cursor-pointer"
                      title="Edit in Studio"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(a)}
                      className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-red-50 dark:hover:bg-red-500/15 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-500/30 transition-all shadow-xs cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-neutral-50/90 dark:bg-neutral-950/80 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
            <span>
              Showing <strong className="text-neutral-900 dark:text-white">{filtered.length}</strong> of{" "}
              {articles.length} publications
            </span>
          </div>
          <div className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400">
            NAMMATECH PUBLISHING ENGINE
          </div>
        </div>
      </div>
    </div>
  );
}
