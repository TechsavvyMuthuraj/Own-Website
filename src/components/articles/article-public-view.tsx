"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Tag,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Share2,
  Bookmark,
  ShieldCheck,
} from "lucide-react";
import type { Article } from "@/types/database";
import type { TocItem } from "@/lib/articles/content-parser";
import { extractArticleFont, loadGoogleFont } from "@/lib/articles/font-catalog";
import { ArticleContentRenderer } from "./article-content-renderer";
import { ArticleToc } from "./article-toc";
import { ArticleReadingControls } from "./article-reading-controls";
import { ArticleShareBar } from "./article-share-bar";
import { ArticleAuthorCard } from "./article-author-card";
import { ArticlePagination } from "./article-pagination";
import { AdsterraBanner } from "@/components/ads/AdsterraBanner";
import { AdsterraNative } from "@/components/ads/AdsterraNative";

interface ArticlePublicViewProps {
  article: Article;
  authorName: string;
  tocItems: TocItem[];
  readingTimeText: string;
  prevArticle?: Article | null;
  nextArticle?: Article | null;
  topAd?: any;
  inFeedAd?: any;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ArticlePublicView({
  article,
  authorName,
  tocItems,
  readingTimeText,
  prevArticle,
  nextArticle,
}: ArticlePublicViewProps) {
  const [fontSize, setFontSize] = useState<"default" | "medium" | "large">("default");
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

  // Extract custom article base font (e.g. <!-- font: Playfair Display -->)
  const baseFont = useMemo(() => extractArticleFont(article.content || ""), [article.content]);

  useEffect(() => {
    if (baseFont) {
      loadGoogleFont(baseFont);
    }
  }, [baseFont]);

  return (
    <div className={`relative transition-all duration-300 ${isFocusMode ? "focus-reading-active" : ""}`}>
      {/* 1. Global Reading Progress Bar & Controls */}
      <ArticleReadingControls
        readingTimeText={readingTimeText}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        isFocusMode={isFocusMode}
        onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Breadcrumb Navigation */}
        {!isFocusMode && (
          <nav
            aria-label="Breadcrumb"
            className={`flex items-center gap-2 text-xs text-[var(--muted-foreground)] ${
              tocItems.length === 0 ? "max-w-4xl mx-auto" : "w-full"
            }`}
          >
            <Link href="/" className="hover:text-amber-500 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
            <Link href="/articles" className="hover:text-amber-500 transition-colors">
              Journal
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
            <span className="text-[var(--foreground)] truncate max-w-[280px] font-semibold">
              {article.title}
            </span>
          </nav>
        )}

        {/* Article Hero Banner / Featured Media (Suitable Medium Size) */}
        {article.thumbnail_url && !isFocusMode && (
          <div className="flex justify-center w-full">
            <div className="relative aspect-[16/9] max-w-3xl max-h-[340px] w-full rounded-2xl overflow-hidden shadow-xl border border-amber-500/20 bg-neutral-950 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.thumbnail_url}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                loading="eager"
              />
              {article.featured && (
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-current" />
                    <span>Featured Release</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Article Header Card */}
        <header
          className={`rounded-3xl border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md p-6 sm:p-10 space-y-5 shadow-xl ${
            tocItems.length === 0 ? "max-w-4xl mx-auto" : "w-full"
          }`}
        >
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {article.tags.map((t) => (
                <Link
                  key={t}
                  href={`/articles?tag=${encodeURIComponent(t)}`}
                  className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20 hover:bg-amber-500/20 transition-all hover:scale-105"
                >
                  <Tag className="w-3 h-3 inline mr-1" />
                  {t}
                </Link>
              ))}
            </div>
          )}

          {/* Article Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[var(--foreground)] leading-tight tracking-tight">
            {article.title}
          </h1>

          {/* Article Subtitle / Excerpt */}
          {article.excerpt && (
            <p className="text-base sm:text-lg text-[var(--muted-foreground)] leading-relaxed font-medium">
              {article.excerpt}
            </p>
          )}

          {/* Metadata Strip */}
          <div className="flex flex-wrap items-center gap-5 text-xs text-[var(--muted-foreground)] border-t border-[var(--border)] pt-5">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Published {formatDate(article.published_at || article.created_at)}</span>
            </span>

            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{readingTimeText}</span>
            </span>

            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-semibold text-[var(--foreground)]">{authorName}</span>
            </span>
          </div>
        </header>

        {/* Adsterra Sponsored Banner after Article Introduction */}
        <AdsterraBanner
          placement="article"
          format="responsive"
          linkType={1}
          className="w-full my-2"
        />

        {/* ── Main Multi-Column Reading Layout ── */}
        <div
          style={baseFont ? { fontFamily: `'${baseFont}', sans-serif` } : undefined}
          className={
            !isFocusMode && tocItems.length > 0
              ? "grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start w-full"
              : "max-w-4xl mx-auto w-full space-y-8"
          }
        >
          {/* Left Column: Sticky Table of Contents */}
          {!isFocusMode && tocItems.length > 0 && (
            <aside className="w-full">
              <ArticleToc items={tocItems} />
            </aside>
          )}

          {/* Center Column: Article Content & Interaction */}
          <main className="min-w-0 space-y-8 w-full">
            {/* The Core Content Renderer */}
            <article className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md p-6 sm:p-10 shadow-xl">
              <ArticleContentRenderer content={article.content} fontSize={fontSize} />
            </article>

            {/* Adsterra Native In-Feed Recommendation between Content & Engagement */}
            <AdsterraNative
              placement="article"
              linkType={2}
              categoryTag="Recommended Article Partner"
              className="my-4"
            />

            {/* Social Share & Reader Feedback */}
            <ArticleShareBar title={article.title} slug={article.slug} />

            {/* Author Profile */}
            <ArticleAuthorCard authorName={authorName} />

            {/* Previous & Next Stories */}
            <ArticlePagination prevArticle={prevArticle} nextArticle={nextArticle} />

            {/* Adsterra Sponsored Banner near Footer */}
            <AdsterraBanner
              placement="article"
              format="responsive"
              linkType={1}
              className="w-full my-4"
            />

            {/* Back to All Articles */}
            <div className="pt-2">
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] text-xs font-bold text-[var(--foreground)] hover:text-amber-500 transition-all shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Articles &amp; News</span>
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
