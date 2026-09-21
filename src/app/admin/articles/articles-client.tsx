"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Article } from "@/types/database";
import { Newspaper, Plus, Search, Edit2, Trash2, Eye, EyeOff, Sparkles, Star, StarOff, Calendar, X, Check, Loader2, Tag, Image as ImageIcon, FileText, Globe } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ArticlesAdminClientProps {
  initialArticles: Article[];
}

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function ArticlesAdminClient({ initialArticles }: ArticlesAdminClientProps) {
  const router = useRouter();
  const { showToast, confirm } = useToast();
  const supabase = createClient();

  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [fTitle, setFTitle] = useState("");
  const [fSlug, setFSlug] = useState("");
  const [fExcerpt, setFExcerpt] = useState("");
  const [fContent, setFContent] = useState("");
  const [fThumbnail, setFThumbnail] = useState("");
  const [fTags, setFTags] = useState("");
  const [fStatus, setFStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [fFeatured, setFFeatured] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return articles.filter(a => a.title.toLowerCase().includes(q) || (a.excerpt || "").toLowerCase().includes(q));
  }, [articles, search]);

  function openCreate() {
    setEditingArticle(null);
    setFTitle(""); setFSlug(""); setFExcerpt(""); setFContent(""); setFThumbnail(""); setFTags(""); setFStatus("DRAFT"); setFFeatured(false);
    setShowForm(true);
  }

  function openEdit(a: Article) {
    setEditingArticle(a);
    setFTitle(a.title); setFSlug(a.slug); setFExcerpt(a.excerpt || ""); setFContent(a.content || ""); setFThumbnail(a.thumbnail_url || ""); setFTags((a.tags || []).join(", ")); setFStatus(a.status); setFFeatured(a.featured);
    setShowForm(true);
  }

  function handleTitleChange(v: string) {
    setFTitle(v);
    if (!editingArticle) setFSlug(slugify(v));
  }

  async function handleSave() {
    if (!fTitle.trim() || !fSlug.trim()) {
      showToast({ type: "error", title: "Missing Fields", message: "Title and slug are required." });
      return;
    }
    setSaving(true);
    try {
      const tags = fTags.split(",").map(t => t.trim()).filter(Boolean);
      const payload: any = {
        title: fTitle.trim(),
        slug: fSlug.trim(),
        excerpt: fExcerpt.trim() || null,
        content: fContent.trim() || null,
        thumbnail_url: fThumbnail.trim() || null,
        tags: tags.length > 0 ? tags : null,
        status: fStatus,
        featured: fFeatured,
        published_at: fStatus === "PUBLISHED" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      if (editingArticle) {
        const { data, error } = await supabase.from("articles").update(payload).eq("id", editingArticle.id).select().single();
        if (error) throw error;
        setArticles(prev => prev.map(a => a.id === editingArticle.id ? data as Article : a));
        showToast({ type: "success", title: "Article Updated", message: fTitle });
      } else {
        payload.created_at = new Date().toISOString();
        const { data, error } = await supabase.from("articles").insert(payload).select().single();
        if (error) throw error;
        setArticles(prev => [data as Article, ...prev]);
        showToast({ type: "success", title: "Article Created", message: fTitle });
      }
      setShowForm(false);
    } catch (err: any) {
      showToast({ type: "error", title: "Save Failed", message: err.message || "Unknown error" });
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(a: Article) {
    confirm({
      title: "Delete Article?",
      message: `Are you sure you want to delete "${a.title}"? This cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        const { error } = await supabase.from("articles").delete().eq("id", a.id);
        if (error) {
          showToast({ type: "error", title: "Delete Failed", message: error.message });
          return;
        }
        setArticles(prev => prev.filter(x => x.id !== a.id));
        showToast({ type: "success", title: "Deleted", message: a.title });
      },
    });
  }

  async function toggleStatus(a: Article) {
    const newStatus = a.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const { data, error } = await supabase.from("articles").update({ status: newStatus, published_at: newStatus === "PUBLISHED" ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq("id", a.id).select().single();
    if (error) { showToast({ type: "error", title: "Update Failed", message: error.message }); return; }
    setArticles(prev => prev.map(x => x.id === a.id ? data as Article : x));
    showToast({ type: "success", title: newStatus === "PUBLISHED" ? "Published!" : "Set to Draft", message: a.title });
  }

  async function toggleFeatured(a: Article) {
    const { data, error } = await supabase.from("articles").update({ featured: !a.featured, updated_at: new Date().toISOString() }).eq("id", a.id).select().single();
    if (error) { showToast({ type: "error", title: "Update Failed", message: error.message }); return; }
    setArticles(prev => prev.map(x => x.id === a.id ? data as Article : x));
  }

  const publishedCount = articles.filter(a => a.status === "PUBLISHED").length;
  const draftCount = articles.filter(a => a.status === "DRAFT").length;

  return (
    <div className="space-y-6">
      {/* ── SaaS Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Editorial Publication Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Newspaper className="w-7 h-7 text-blue-400" />
            <span>Articles & Technical Journal</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Publish rich editorial tutorials, developer news, software deep dives, and manage featured posts.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Article</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md shadow-sm flex items-center gap-3.5 hover:-translate-y-0.5 transition-transform">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
            <Newspaper className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Total Articles</span>
            <span className="text-xl font-black text-white">{articles.length}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md shadow-sm flex items-center gap-3.5 hover:-translate-y-0.5 transition-transform">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Live Published</span>
            <span className="text-xl font-black text-emerald-400">{publishedCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md shadow-sm flex items-center gap-3.5 hover:-translate-y-0.5 transition-transform">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Draft Articles</span>
            <span className="text-xl font-black text-amber-400">{draftCount}</span>
          </div>
        </div>
      </div>

      {/* SaaS Search Bar */}
      <div className="p-4 rounded-3xl border border-neutral-800/80 bg-neutral-900/50 backdrop-blur-xl shadow-xl flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search articles by title, tags, or excerpt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-16 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-inner"
          />
          {search ? (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 hover:text-white"
            >
              Clear
            </button>
          ) : (
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[10px] text-neutral-400 font-mono">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Articles Table */}
      <div className="rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl shadow-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Newspaper className="w-10 h-10 text-neutral-600 mx-auto" />
            <p className="text-sm font-semibold text-neutral-300">No articles found</p>
            <button type="button" onClick={openCreate} className="text-xs text-blue-400 hover:underline cursor-pointer">Create the first article</button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/60">
            {filtered.map((a) => (
              <div key={a.id} className="flex items-center gap-4 p-5 hover:bg-neutral-800/30 transition-colors group">
                {/* Thumbnail */}
                <div className="w-20 h-14 rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800/80 flex-shrink-0 relative shadow-sm">
                  {a.thumbnail_url ? (
                    <img src={a.thumbnail_url} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600"><Newspaper className="w-5 h-5 opacity-40" /></div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate max-w-md">{a.title}</h3>
                    {a.featured && <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" />FEATURED</span>}
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border ${a.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" : a.status === "ARCHIVED" ? "bg-neutral-800 text-neutral-400 border-neutral-700" : "bg-blue-500/10 text-blue-400 border-blue-500/25"}`}>{a.status}</span>
                  </div>
                  {a.excerpt && <p className="text-xs text-neutral-400 line-clamp-1 mt-1">{a.excerpt}</p>}
                  <div className="flex items-center gap-3 text-[10px] text-neutral-500 mt-1 font-mono">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-neutral-400" />{formatDate(a.created_at)}</span>
                    {a.tags && a.tags.length > 0 && <span className="flex items-center gap-1"><Tag className="w-3 h-3 text-blue-400" />{a.tags.slice(0, 2).join(", ")}</span>}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {a.status === "PUBLISHED" && (
                    <a href={`/articles/${a.slug}`} target="_blank" rel="noreferrer" className="p-2 rounded-xl border border-neutral-700/80 bg-neutral-800/60 hover:bg-blue-500/15 text-neutral-400 hover:text-blue-400 hover:border-blue-500/30 transition-all shadow-xs" title="View public article"><Globe className="w-3.5 h-3.5" /></a>
                  )}
                  <button type="button" onClick={() => toggleFeatured(a)} className={`p-2 rounded-xl border transition-all shadow-xs cursor-pointer ${a.featured ? "border-amber-500/30 bg-amber-500/15 text-amber-400" : "border-neutral-700/80 bg-neutral-800/60 text-neutral-400 hover:text-amber-400"}`} title={a.featured ? "Unfeature" : "Feature"}>{a.featured ? <Star className="w-3.5 h-3.5 fill-amber-400" /> : <StarOff className="w-3.5 h-3.5" />}</button>
                  <button type="button" onClick={() => toggleStatus(a)} className={`p-2 rounded-xl border transition-all shadow-xs cursor-pointer ${a.status === "PUBLISHED" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:text-amber-400" : "border-neutral-700/80 bg-neutral-800/60 text-neutral-400 hover:text-emerald-400"}`} title={a.status === "PUBLISHED" ? "Set to Draft" : "Publish"}>{a.status === "PUBLISHED" ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                  <button type="button" onClick={() => openEdit(a)} className="p-2 rounded-xl border border-neutral-700/80 bg-neutral-800/60 hover:bg-blue-500/15 text-neutral-300 hover:text-blue-400 hover:border-blue-500/30 transition-all shadow-xs cursor-pointer" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button type="button" onClick={() => handleDelete(a)} className="p-2 rounded-xl border border-neutral-700/80 bg-neutral-800/60 hover:bg-red-500/15 text-neutral-400 hover:text-red-400 hover:border-red-500/30 transition-all shadow-xs cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-6 py-3.5 bg-neutral-950/80 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Total <strong className="text-white">{articles.length}</strong> journal publications synced</span>
          </div>
          <div className="font-mono text-[10px] text-neutral-400">
            NAMMATECH EDITORIAL SYSTEM
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
              <h2 className="text-base font-bold text-[var(--foreground)]">{editingArticle ? "Edit Article" : "New Article"}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Title *</label>
                <input type="text" value={fTitle} onChange={e => handleTitleChange(e.target.value)} placeholder="Article title..." className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              {/* Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Slug *</label>
                <input type="text" value={fSlug} onChange={e => setFSlug(slugify(e.target.value))} placeholder="article-slug" className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] font-mono placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              {/* Thumbnail */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Thumbnail URL</label>
                <input type="url" value={fThumbnail} onChange={e => setFThumbnail(e.target.value)} placeholder="https://..." className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                {fThumbnail && <img src={fThumbnail} alt="thumb preview" className="mt-2 h-20 rounded-lg object-cover" onError={e => (e.currentTarget.style.display = "none")} />}
              </div>
              {/* Excerpt */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Excerpt / Summary</label>
                <textarea value={fExcerpt} onChange={e => setFExcerpt(e.target.value)} rows={2} placeholder="Short summary shown in article cards..." className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
              </div>
              {/* Content */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Content</label>
                <textarea value={fContent} onChange={e => setFContent(e.target.value)} rows={10} placeholder="Write your article content here..." className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-y font-mono" />
              </div>
              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)] flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Tags (comma-separated)</label>
                <input type="text" value={fTags} onChange={e => setFTags(e.target.value)} placeholder="tech, cinema, tutorial, news" className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              </div>
              {/* Status & Featured */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">Status</label>
                  <select value={fStatus} onChange={e => setFStatus(e.target.value as any)} className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer">
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">Featured</label>
                  <button type="button" onClick={() => setFFeatured(!fFeatured)} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${fFeatured ? "bg-amber-500/15 border-amber-500/30 text-amber-500" : "bg-[var(--secondary)] border-[var(--border)] text-[var(--muted-foreground)]"}`}>
                    {fFeatured ? <><Star className="w-3.5 h-3.5 fill-amber-500" /> Featured</> : <><StarOff className="w-3.5 h-3.5" /> Not Featured</>}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-[var(--border)]">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors cursor-pointer">Cancel</button>
              <button type="button" onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {editingArticle ? "Save Changes" : "Create Article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

