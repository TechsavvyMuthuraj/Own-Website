import React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Newspaper } from "lucide-react";
import type { Article } from "@/types/database";

interface ArticlePaginationProps {
  prevArticle?: Article | null;
  nextArticle?: Article | null;
}

export function ArticlePagination({ prevArticle, nextArticle }: ArticlePaginationProps) {
  if (!prevArticle && !nextArticle) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
      {/* Previous Article */}
      {prevArticle ? (
        <Link
          href={`/articles/${prevArticle.slug}`}
          className="group flex flex-col p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-amber-500/40 hover:bg-[var(--secondary)]/60 transition-all shadow-sm"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-1">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Previous Story</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[var(--foreground)] line-clamp-2 leading-snug group-hover:text-amber-500 transition-colors">
            {prevArticle.title}
          </p>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* Next Article */}
      {nextArticle ? (
        <Link
          href={`/articles/${nextArticle.slug}`}
          className="group flex flex-col p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-amber-500/40 hover:bg-[var(--secondary)]/60 transition-all text-right shadow-sm"
        >
          <div className="flex items-center justify-end gap-1.5 text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-1">
            <span>Next Story</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-[var(--foreground)] line-clamp-2 leading-snug group-hover:text-amber-500 transition-colors">
            {nextArticle.title}
          </p>
        </Link>
      ) : null}
    </div>
  );
}
