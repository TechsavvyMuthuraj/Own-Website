"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Sparkles,
  Undo2,
  Redo2,
  Code2,
  List,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Quote,
  Table,
  Image as ImageIcon,
  Link2,
  AlertTriangle,
  Lightbulb,
  Info,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Search,
  ExternalLink,
  Laptop,
  Tablet,
  Smartphone,
  Layers,
  Wand2,
  Clock,
  FileText,
  Loader2,
  X,
  Plus,
  Download,
  FileArchive,
  Type,
} from "lucide-react";
import type { Article } from "@/types/database";
import { useToast } from "@/components/ui/toast";
import { autoArrangeArticleContent } from "@/lib/articles/auto-arrange";
import { ARTICLE_TEMPLATES } from "@/lib/articles/templates";
import { calculateReadingStats, extractHeadings } from "@/lib/articles/content-parser";
import { ArticleContentRenderer } from "@/components/articles/article-content-renderer";
import { FontPickerModal } from "./font-picker-modal";
import {
  extractArticleFont,
  applyArticleFont,
  loadGoogleFont,
  loadMultipleGoogleFonts,
  extractUsedFonts,
} from "@/lib/articles/font-catalog";

interface ArticleStudioProps {
  initialArticle?: Article | null;
  isEdit?: boolean;
}

export function ArticleStudio({ initialArticle, isEdit = false }: ArticleStudioProps) {
  const router = useRouter();
  const { showToast } = useToast();

  // Core Form State
  const [title, setTitle] = useState(initialArticle?.title || "");
  const [slug, setSlug] = useState(initialArticle?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!isEdit);
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || "");
  const [content, setContent] = useState(initialArticle?.content || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initialArticle?.thumbnail_url || "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(
    initialArticle?.status || "DRAFT"
  );
  const [featured, setFeatured] = useState(Boolean(initialArticle?.featured));
  const [tags, setTags] = useState<string[]>(initialArticle?.tags || []);
  const [newTagInput, setNewTagInput] = useState("");

  // SEO & Social State
  const [seoTitle, setSeoTitle] = useState(initialArticle?.title || "");
  const [seoDescription, setSeoDescription] = useState(initialArticle?.excerpt || "");

  // Studio UI State
  const [activeTab, setActiveTab] = useState<"meta" | "media" | "seo" | "quality" | "templates">("meta");
  const [viewMode, setViewMode] = useState<"edit" | "split" | "preview">("edit");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // Dialog Modals
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");

  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadTitle, setDownloadTitle] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadSize, setDownloadSize] = useState("");
  const [downloadType, setDownloadType] = useState("ZIP");

  // 200+ Fonts Typography Studio State
  const [fontModalOpen, setFontModalOpen] = useState(false);
  const currentArticleFont = extractArticleFont(content);

  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Automatically load all fonts used in the content for live preview
  useEffect(() => {
    if (!content) return;
    const fonts = extractUsedFonts(content);
    if (fonts.length > 0) {
      loadMultipleGoogleFonts(fonts);
    }
  }, [content]);

  // Auto-generate slug from title if autoSlug is true
  useEffect(() => {
    if (autoSlug && title.trim()) {
      const generated = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  }, [title, autoSlug]);

  // Compute live content statistics
  const stats = calculateReadingStats(content);
  const headingList = extractHeadings(content);

  // Record undo state before mutations
  const pushUndoState = (prevContent: string) => {
    setUndoStack((prev) => [...prev.slice(-20), prevContent]);
    setRedoStack([]);
  };

  const handleSelectArticleFont = (fontName: string) => {
    loadGoogleFont(fontName);
    pushUndoState(content);
    const updated = applyArticleFont(content, fontName);
    setContent(updated);
    showToast({
      type: "success",
      title: "Article Font Set",
      message: `Set "${fontName}" as article base typography.`,
    });
  };

  const handleInsertInlineFont = (fontName: string) => {
    loadGoogleFont(fontName);
    const textarea = editorTextareaRef.current;
    if (!textarea) {
      insertTextAtCursor(`[font:${fontName}]Sample text in ${fontName}[/font]`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    pushUndoState(content);
    if (selectedText) {
      const replacement = `[font:${fontName}]${selectedText}[/font]`;
      const nextContent = content.substring(0, start) + replacement + content.substring(end);
      setContent(nextContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + replacement.length);
      }, 50);
    } else {
      insertTextAtCursor(`[font:${fontName}]Sample styled text in ${fontName}[/font]`);
    }

    showToast({
      type: "success",
      title: "Font Style Applied",
      message: `Applied "${fontName}" styling to text.`,
    });
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, content]);
    setContent(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setUndoStack((prev) => [...prev, content]);
    setContent(next);
  };

  // Helper to insert markdown tokens at cursor position
  const insertTextAtCursor = (prefix: string, suffix: string = "", defaultPlaceholder: string = "") => {
    const textarea = editorTextareaRef.current;
    if (!textarea) return;

    pushUndoState(content);
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultPlaceholder;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  // 1-Click Auto Arrange Action
  const handleAutoArrange = () => {
    pushUndoState(content);
    const result = autoArrangeArticleContent(content);
    setContent(result.content);
    showToast({
      type: "success",
      title: "Content Auto-Arranged",
      message: result.changesMade.slice(0, 2).join(". ") || "Structure polished",
    });
  };

  // Apply a Starter Blueprint Template
  const handleApplyTemplate = (template: (typeof ARTICLE_TEMPLATES)[0]) => {
    pushUndoState(content);
    if (!title.trim()) setTitle(template.defaultTitle);
    if (!excerpt.trim()) setExcerpt(template.defaultExcerpt);
    if (tags.length === 0) setTags(template.defaultTags);
    setContent(template.content);
    showToast({
      type: "success",
      title: `Applied "${template.name}"`,
      message: "Template structure loaded into the editor.",
    });
  };

  // Tag Management
  const handleAddTag = () => {
    const clean = newTagInput.trim().replace(/^#/, "");
    if (clean && !tags.includes(clean)) {
      setTags((prev) => [...prev, clean]);
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Clean Paste Handler
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text/plain");
    // If it looks like a single YouTube link, auto-convert it
    if (pastedText && pastedText.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//)) {
      // Allow default paste, then auto arrange will recognize it
    }
  };

  // Save / Publish Handler
  const handleSave = async (overrideStatus?: "DRAFT" | "PUBLISHED" | "ARCHIVED") => {
    const targetStatus = overrideStatus || status;

    if (!title.trim()) {
      showToast({ type: "error", title: "Missing Title", message: "Please provide an article title." });
      return;
    }

    if (!slug.trim()) {
      showToast({ type: "error", title: "Missing Slug", message: "Please provide a valid URL slug." });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        content: content.trim() || null,
        thumbnail_url: thumbnailUrl.trim() || null,
        tags: tags.length > 0 ? tags : null,
        status: targetStatus,
        featured,
        published_at: targetStatus === "PUBLISHED" ? (initialArticle?.published_at || new Date().toISOString()) : null,
      };

      const endpoint = isEdit && initialArticle?.id
        ? `/api/admin/articles/${initialArticle.id}`
        : "/api/admin/articles";
      const method = isEdit && initialArticle?.id ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save article");
      }

      setStatus(targetStatus);
      setLastSaved(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));

      showToast({
        type: "success",
        title: targetStatus === "PUBLISHED" ? "Article Published!" : "Draft Saved",
        message: `"${title}" has been successfully saved.`,
      });

      if (!isEdit && data.article?.id) {
        router.push(`/admin/articles/${data.article.id}/edit`);
      }
    } catch (err: any) {
      showToast({ type: "error", title: "Save Failed", message: err?.message || "Error saving article" });
    } finally {
      setSaving(false);
    }
  };

  // Content Quality Checklist
  const qualityChecks = [
    { label: "Title is set and descriptive", pass: title.trim().length >= 10, error: "Title is too short" },
    { label: "Valid URL slug configured", pass: slug.trim().length >= 3, error: "Missing slug" },
    { label: "Summary / excerpt provided", pass: excerpt.trim().length >= 20, error: "Add an excerpt for search preview" },
    { label: "Body content is substantial", pass: stats.wordsCount >= 50, error: "Content is very brief (< 50 words)" },
    { label: "At least one heading structure", pass: headingList.length >= 1, error: "Use headings (H2, H3) for readability" },
    { label: "Featured cover image provided", pass: Boolean(thumbnailUrl.trim()), error: "Recommended for social and cards" },
    { label: "Tags / Categories attached", pass: tags.length >= 1, error: "Add at least 1 tag for discovery" },
  ];

  const allPassed = qualityChecks.filter((q) => q.pass).length;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      {/* ── 1. Top Command Bar ── */}
      <header className="sticky top-0 z-40 h-16 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Back & Title Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/articles"
            className="p-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            title="Return to Articles List"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs sm:text-sm text-[var(--foreground)] truncate max-w-[200px] sm:max-w-xs">
                {title || "Untitled Article"}
              </span>

              {/* Status Pill */}
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                  status === "PUBLISHED"
                    ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                    : status === "ARCHIVED"
                    ? "bg-neutral-500/15 text-neutral-400 border border-neutral-500/30"
                    : "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                }`}
              >
                {status}
              </span>
            </div>

            <p className="text-[10px] text-[var(--muted-foreground)] font-mono truncate">
              {lastSaved ? `Last saved at ${lastSaved}` : "Unsaved draft"}
            </p>
          </div>
        </div>

        {/* Center: View Mode Switcher */}
        <div className="hidden md:flex items-center bg-[var(--secondary)] rounded-xl p-1 border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setViewMode("edit")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "edit"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "split"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Split View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "preview"
                ? "bg-[var(--card)] text-[var(--foreground)] shadow-xs"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Preview
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* 1-Click Auto Arrange */}
          <button
            type="button"
            onClick={handleAutoArrange}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold text-xs transition-all cursor-pointer active:scale-95"
            title="Auto Arrange: normalize headings, code blocks, URLs, and formatting"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Auto Arrange</span>
          </button>

          {/* Save Draft */}
          <button
            type="button"
            onClick={() => handleSave("DRAFT")}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 text-[var(--foreground)] font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Save Draft</span>
          </button>

          {/* Publish Button */}
          <button
            type="button"
            onClick={() => handleSave("PUBLISHED")}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Publish</span>
          </button>
        </div>
      </header>

      {/* ── 2. Studio Workspace (Main Canvas + Settings) ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] overflow-hidden">
        {/* Left Column: Editor Canvas & Formatting Bar */}
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-y-auto border-r border-[var(--border)] bg-[var(--card)]/40">
          {/* Formatting Bar */}
          {viewMode !== "preview" && (
            <div className="sticky top-0 z-30 flex items-center flex-wrap gap-1 p-2 bg-[var(--card)]/95 backdrop-blur-md border-b border-[var(--border)] text-xs">
              {/* Headings */}
              <button
                type="button"
                onClick={() => insertTextAtCursor("## ", "\n", "Heading Title")}
                className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                title="Heading 2 (## )"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("### ", "\n", "Sub-heading")}
                className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                title="Heading 3 (### )"
              >
                <Heading3 className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />

              {/* Bold, Italic, Code */}
              <button
                type="button"
                onClick={() => insertTextAtCursor("**", "**", "bold text")}
                className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                title="Bold (**text**)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("*", "*", "italic text")}
                className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                title="Italic (*text*)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("`", "`", "code")}
                className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                title="Inline Code (`code`)"
              >
                <Code2 className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />

              {/* Code Block with Language */}
              <button
                type="button"
                onClick={() => insertTextAtCursor("```javascript\n", "\n```\n", "// Write your code here")}
                className="px-2 py-1 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-[11px] font-mono font-bold transition-colors"
                title="Fenced Code Block"
              >
                &lt;CODE&gt;
              </button>

              {/* Callouts */}
              <button
                type="button"
                onClick={() => insertTextAtCursor(":::tip\n", "\n:::\n", "Add high-value engineering tip here")}
                className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-emerald-400 transition-colors"
                title="Tip Callout (:::tip)"
              >
                <Lightbulb className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor(":::warning\n", "\n:::\n", "Add important warning message")}
                className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-amber-400 transition-colors"
                title="Warning Callout (:::warning)"
              >
                <AlertTriangle className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />

              {/* Quotes & Lists */}
              <button
                type="button"
                onClick={() => insertTextAtCursor("> ", "\n", "Quotation message")}
                className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                title="Blockquote (> )"
              >
                <Quote className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("- ", "\n", "List item")}
                className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                title="Bullet List (- )"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("- [ ] ", "\n", "Task item")}
                className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                title="Task List (- [ ] )"
              >
                <CheckSquare className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />

              {/* Insert Media Dialogs */}
              <button
                type="button"
                onClick={() => setLinkModalOpen(true)}
                className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                title="Insert Link"
              >
                <Link2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setImageModalOpen(true)}
                className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                title="Insert Image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setYoutubeModalOpen(true)}
                className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-red-500 hover:text-red-400 transition-colors"
                title="Insert YouTube Embed"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() =>
                  insertTextAtCursor(
                    "\n| Feature | Status | Notes |\n| :--- | :--- | :--- |\n| Speed | Verified | 100% fast |\n\n"
                  )
                }
                className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                title="Insert Markdown Table"
              >
                <Table className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDownloadModalOpen(true)}
                className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-emerald-400 hover:text-emerald-300 transition-colors"
                title="Insert Download Resource Card"
              >
                <Download className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-4 bg-[var(--border)] mx-1" />

              {/* 200+ Google Fonts Studio Picker */}
              <button
                type="button"
                onClick={() => setFontModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Choose from 200+ Google Fonts for article typography or text"
              >
                <Type className="w-3.5 h-3.5" />
                <span>Fonts (200+)</span>
              </button>

              {currentArticleFont && (
                <button
                  type="button"
                  onClick={() => setFontModalOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-neutral-800 text-amber-400 border border-amber-500/30 font-mono hover:bg-neutral-700 transition-colors cursor-pointer"
                  title="Click to change article base typography"
                >
                  <span>Base: {currentArticleFont}</span>
                </button>
              )}

              {/* Undo / Redo */}
              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] disabled:opacity-30 cursor-pointer"
                  title="Undo"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className="p-1.5 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)] disabled:opacity-30 cursor-pointer"
                  title="Redo"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Canvas Workspace: Edit, Split, or Preview */}
          <div className="flex-1 flex overflow-hidden">
            {/* Editor Textarea */}
            {(viewMode === "edit" || viewMode === "split") && (
              <div className={`p-6 sm:p-8 space-y-5 overflow-y-auto ${viewMode === "split" ? "w-1/2 border-r border-[var(--border)]" : "w-full max-w-4xl mx-auto"}`}>
                {/* Title Input */}
                <div>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Article Title..."
                    className="w-full text-2xl sm:text-4xl font-black bg-transparent border-0 text-[var(--foreground)] placeholder-[var(--muted-foreground)]/50 focus:outline-none tracking-tight"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)] pt-1">
                    <span>{title.length} characters</span>
                    <span className="font-mono">Slug: /{slug || "untitled"}</span>
                  </div>
                </div>

                {/* Subtitle / Excerpt Input */}
                <div>
                  <textarea
                    rows={2}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Write a compelling brief summary or sub-headline for cards and search snippets..."
                    className="w-full text-sm sm:text-base text-[var(--muted-foreground)] bg-transparent border-b border-[var(--border)]/70 pb-3 focus:outline-none focus:border-amber-500/50 resize-none font-medium leading-relaxed"
                  />
                </div>

                {/* Main Body Markdown Textarea */}
                <div className="relative min-h-[500px]">
                  <textarea
                    ref={editorTextareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="Write your article in Markdown or HTML... Use ## for Headings, ```code blocks, :::tip callouts, and images..."
                    className="w-full h-full min-h-[550px] bg-transparent text-sm sm:text-base font-mono text-[var(--foreground)] placeholder-[var(--muted-foreground)]/40 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Split / Full Live Preview */}
            {(viewMode === "split" || viewMode === "preview") && (
              <div className={`overflow-y-auto p-6 sm:p-8 bg-[var(--background)] ${viewMode === "split" ? "w-1/2" : "w-full max-w-4xl mx-auto"}`}>
                {/* Device Frame Bar (in preview mode) */}
                {viewMode === "preview" && (
                  <div className="flex items-center justify-between pb-6 border-b border-[var(--border)] mb-6">
                    <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                      Live Production Preview
                    </span>
                    <div className="flex items-center bg-[var(--secondary)] rounded-xl p-1 border border-[var(--border)]">
                      <button
                        type="button"
                        onClick={() => setPreviewDevice("desktop")}
                        className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                          previewDevice === "desktop" ? "bg-[var(--card)] text-amber-500" : "text-[var(--muted-foreground)]"
                        }`}
                        title="Desktop Preview"
                      >
                        <Laptop className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice("tablet")}
                        className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                          previewDevice === "tablet" ? "bg-[var(--card)] text-amber-500" : "text-[var(--muted-foreground)]"
                        }`}
                        title="Tablet Preview"
                      >
                        <Tablet className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice("mobile")}
                        className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                          previewDevice === "mobile" ? "bg-[var(--card)] text-amber-500" : "text-[var(--muted-foreground)]"
                        }`}
                        title="Mobile Preview"
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Device Frame Constraint */}
                <div
                  style={currentArticleFont ? { fontFamily: `'${currentArticleFont}', sans-serif` } : undefined}
                  className={`mx-auto transition-all ${
                    previewDevice === "mobile"
                      ? "max-w-sm rounded-3xl border border-[var(--border)] p-4 shadow-2xl bg-[var(--card)]"
                      : previewDevice === "tablet"
                      ? "max-w-2xl rounded-3xl border border-[var(--border)] p-6 shadow-2xl bg-[var(--card)]"
                      : "w-full"
                  }`}
                >
                  <h1 className="text-2xl sm:text-4xl font-black text-[var(--foreground)] mb-3 leading-tight">
                    {title || "Untitled Article Preview"}
                  </h1>
                  {excerpt && (
                    <p className="text-sm sm:text-base text-[var(--muted-foreground)] mb-6 font-medium leading-relaxed">
                      {excerpt}
                    </p>
                  )}
                  {thumbnailUrl && (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-6 border border-[var(--border)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <ArticleContentRenderer content={content} />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Statistics Dock */}
          <footer className="h-10 border-t border-[var(--border)] bg-[var(--card)]/90 px-4 flex items-center justify-between text-[11px] text-[var(--muted-foreground)] font-mono">
            <div className="flex items-center gap-4">
              <span>{stats.wordsCount} words</span>
              <span>{stats.charactersCount} characters</span>
              <span>{stats.readingTimeText}</span>
              <span>{headingList.length} sections</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold">Readiness:</span>
              <span className={`font-bold ${allPassed >= 5 ? "text-emerald-400" : "text-amber-400"}`}>
                {allPassed}/{qualityChecks.length} checks
              </span>
            </div>
          </footer>
        </div>

        {/* ── Right Column: Studio Settings Tabs ── */}
        <aside className="h-[calc(100vh-64px)] overflow-y-auto bg-[var(--card)] p-5 space-y-6">
          {/* Tab Navigation Strip */}
          <div className="grid grid-cols-5 gap-1 p-1 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("meta")}
              className={`py-1.5 rounded-xl transition-all ${
                activeTab === "meta" ? "bg-amber-500 text-neutral-950 shadow-xs" : "text-[var(--muted-foreground)]"
              }`}
              title="General Metadata"
            >
              Meta
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className={`py-1.5 rounded-xl transition-all ${
                activeTab === "media" ? "bg-amber-500 text-neutral-950 shadow-xs" : "text-[var(--muted-foreground)]"
              }`}
              title="Cover Media"
            >
              Media
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("seo")}
              className={`py-1.5 rounded-xl transition-all ${
                activeTab === "seo" ? "bg-amber-500 text-neutral-950 shadow-xs" : "text-[var(--muted-foreground)]"
              }`}
              title="SEO Engine"
            >
              SEO
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quality")}
              className={`py-1.5 rounded-xl transition-all ${
                activeTab === "quality" ? "bg-amber-500 text-neutral-950 shadow-xs" : "text-[var(--muted-foreground)]"
              }`}
              title="Quality Checklist"
            >
              Audit
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("templates")}
              className={`py-1.5 rounded-xl transition-all ${
                activeTab === "templates" ? "bg-amber-500 text-neutral-950 shadow-xs" : "text-[var(--muted-foreground)]"
              }`}
              title="Templates"
            >
              Blueprints
            </button>
          </div>

          {/* TAB 1: METADATA & TAXONOMY */}
          {activeTab === "meta" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                  URL Slug Identifier *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setAutoSlug(false);
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }}
                    placeholder="e.g. java-and-sql"
                    className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setAutoSlug((prev) => !prev)}
                    className={`p-2 rounded-xl border text-[11px] font-bold cursor-pointer ${
                      autoSlug
                        ? "bg-amber-500/15 border-amber-500 text-amber-500"
                        : "border-[var(--border)] bg-[var(--secondary)] text-[var(--muted-foreground)]"
                    }`}
                    title={autoSlug ? "Auto-sync with Title ON" : "Auto-sync OFF"}
                  >
                    Auto
                  </button>
                </div>
              </div>

              {/* Status Switcher */}
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                  Publication Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
                >
                  <option value="DRAFT">Draft (Unpublished)</option>
                  <option value="PUBLISHED">Published (Live to World)</option>
                  <option value="ARCHIVED">Archived (Unlisted)</option>
                </select>
              </div>

              {/* Article Typography / Font Style Selection */}
              <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-amber-500" />
                    <span>Article Typography</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    200+ Fonts
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                  <div className="min-w-0">
                    <div className="text-[10px] text-[var(--muted-foreground)]">Active Base Font</div>
                    <div className="text-xs font-bold text-[var(--foreground)] truncate font-mono">
                      {currentArticleFont || "Plus Jakarta Sans (Default)"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFontModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-sm transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                  >
                    <span>Change</span>
                  </button>
                </div>
              </div>

              {/* Featured Flag */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/40">
                <div>
                  <span className="text-xs font-bold text-[var(--foreground)] block">
                    Featured Publication
                  </span>
                  <span className="text-[10px] text-[var(--muted-foreground)]">
                    Display prominently on homepage highlights
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Tags Management */}
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                  Tags &amp; Classifications
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                    placeholder="Type tag and press Add..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)] text-xs font-semibold"
                    >
                      <span>#{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-[var(--muted-foreground)] hover:text-red-400 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {tags.length === 0 && (
                    <p className="text-[11px] text-[var(--muted-foreground)] italic">
                      No tags added yet. (e.g. Java, SQL, Windows)
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COVER MEDIA */}
          {activeTab === "media" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--foreground)] mb-1.5">
                  Cover / Thumbnail URL
                </label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://.../cover.png"
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] focus:outline-none"
                />
              </div>

              {thumbnailUrl && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase">
                    Preview
                  </span>
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[var(--border)] bg-neutral-950 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SEO ENGINE */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[var(--foreground)]">SEO Title</label>
                  <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                    {seoTitle.length}/60 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title || "SEO Title..."}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[var(--foreground)]">Meta Description</label>
                  <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                    {seoDescription.length}/160 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder={excerpt || "Search description..."}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none resize-none"
                />
              </div>

              {/* Google SERP Snippet Preview Mockup */}
              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Google Search Snippet Preview
                </span>
                <div className="p-4 rounded-2xl border border-[var(--border)] bg-neutral-950 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <span>https://techsavvymuthuraj.dev</span>
                    <span>› articles › {slug || "untitled"}</span>
                  </div>
                  <h4 className="text-sm font-bold text-blue-400 truncate">
                    {seoTitle || title || "Article Headline on NammaTech Journal"}
                  </h4>
                  <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                    {seoDescription || excerpt || "Read comprehensive developer guides and tutorials verified by the NammaTech team."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QUALITY AUDIT */}
          {activeTab === "quality" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pre-Publish Readiness Check</span>
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                  Automatic audit based on technical journalism standards.
                </p>
              </div>

              <div className="space-y-2.5">
                {qualityChecks.map((check, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs ${
                      check.pass
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                        : "bg-neutral-900 border-neutral-800 text-neutral-400"
                    }`}
                  >
                    {check.pass ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{check.label}</p>
                      {!check.pass && <p className="text-[10px] text-amber-400/90">{check.error}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BLUEPRINTS / TEMPLATES */}
          {activeTab === "templates" && (
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                1-Click Technical Blueprints
              </span>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Click any blueprint to automatically populate industry-standard technical article structure.
              </p>

              <div className="space-y-2.5 pt-2">
                {ARTICLE_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="group p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/40 hover:border-amber-500/40 hover:bg-[var(--secondary)] transition-all cursor-pointer space-y-1 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--foreground)] group-hover:text-amber-500 transition-colors">
                        {tmpl.name}
                      </span>
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        {tmpl.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ── Dialog Modals ── */}
      {/* 1. Insert Link Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <Link2 className="w-4 h-4 text-amber-500" />
              <span>Insert Hyperlink</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--muted-foreground)] mb-1">Display Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="e.g. Official Documentation"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[var(--muted-foreground)] mb-1">Target URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs text-[var(--muted-foreground)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  insertTextAtCursor(`[${linkText || linkUrl}](${linkUrl})`);
                  setLinkUrl("");
                  setLinkText("");
                  setLinkModalOpen(false);
                }}
                disabled={!linkUrl.trim()}
                className="px-4 py-1.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs disabled:opacity-50"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Insert YouTube Modal */}
      {youtubeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <svg className="w-4 h-4 fill-red-500" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span>Embed YouTube Video</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--muted-foreground)] mb-1">YouTube Video Link</label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setYoutubeModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs text-[var(--muted-foreground)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const trimmed = youtubeUrl.trim();
                  let videoId: string | null = null;
                  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
                    videoId = trimmed;
                  } else {
                    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                    if (match && match[1]) {
                      videoId = match[1];
                    }
                  }

                  if (videoId) {
                    insertTextAtCursor(`\n[youtube:${videoId}]\n`);
                    setYoutubeUrl("");
                    setYoutubeModalOpen(false);
                    showToast({
                      type: "success",
                      title: "YouTube Video Embedded",
                      message: `Embedded video ID: ${videoId}`,
                    });
                  } else {
                    showToast({
                      type: "error",
                      title: "Invalid YouTube Link",
                      message: "Please enter a valid YouTube video link or 11-character video ID.",
                    });
                  }
                }}
                disabled={!youtubeUrl.trim()}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                Embed Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Insert Image Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-500" />
              <span>Insert Image</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--muted-foreground)] mb-1">Image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://.../illustration.png"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[var(--muted-foreground)] mb-1">Alt Text / Caption</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Describe the image..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs text-[var(--muted-foreground)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  insertTextAtCursor(`\n![${imageAlt || "Article image"}](${imageUrl})\n`);
                  setImageUrl("");
                  setImageAlt("");
                  setImageModalOpen(false);
                }}
                disabled={!imageUrl.trim()}
                className="px-4 py-1.5 rounded-xl bg-amber-500 text-neutral-950 font-bold text-xs disabled:opacity-50"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 4. Insert Download Resource Modal */}
      {downloadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Insert Download Resource Card</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--muted-foreground)] mb-1">Resource Title *</label>
                <input
                  type="text"
                  value={downloadTitle}
                  onChange={(e) => setDownloadTitle(e.target.value)}
                  placeholder="e.g. Starter Project Source Code & SQL Dump"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[var(--muted-foreground)] mb-1">Download URL *</label>
                <input
                  type="url"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  placeholder="https://.../source-code.zip"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[var(--muted-foreground)] mb-1">File Size</label>
                  <input
                    type="text"
                    value={downloadSize}
                    onChange={(e) => setDownloadSize(e.target.value)}
                    placeholder="e.g. 14.5 MB"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[var(--muted-foreground)] mb-1">File Type</label>
                  <input
                    type="text"
                    value={downloadType}
                    onChange={(e) => setDownloadType(e.target.value)}
                    placeholder="e.g. ZIP, PDF, SQL"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none uppercase font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDownloadModalOpen(false)}
                className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!downloadTitle.trim() || !downloadUrl.trim()) {
                    showToast({ type: "error", title: "Missing Fields", message: "Title and URL are required" });
                    return;
                  }
                  insertTextAtCursor(`\n[download:${downloadTitle.trim()}|${downloadUrl.trim()}|${downloadSize.trim() || "Verified File"}|${downloadType.trim().toUpperCase() || "ZIP"}]\n`);
                  setDownloadTitle("");
                  setDownloadUrl("");
                  setDownloadSize("");
                  setDownloadType("ZIP");
                  setDownloadModalOpen(false);
                  showToast({ type: "success", title: "Download Card Inserted", message: "Resource card added to content." });
                }}
                disabled={!downloadTitle.trim() || !downloadUrl.trim()}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-bold text-xs disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-amber-500/20"
              >
                Insert Download Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. 200+ Google Fonts Typography Studio Modal */}
      <FontPickerModal
        isOpen={fontModalOpen}
        onClose={() => setFontModalOpen(false)}
        currentArticleFont={currentArticleFont}
        onSelectArticleFont={handleSelectArticleFont}
        onInsertInlineFont={handleInsertInlineFont}
      />
    </div>
  );
}

