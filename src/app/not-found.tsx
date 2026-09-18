import React from "react";
import Link from "next/link";
import { Compass, ArrowLeft, Layers } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-[var(--background)]">
      <div className="max-w-md w-full text-center p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 ring-1 ring-indigo-500/20">
          <Compass className="w-8 h-8" />
        </div>
        <span className="text-xs font-mono font-bold text-indigo-500 tracking-wider">
          ERROR 404
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight mt-1 mb-2">
          Resource Not Found
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-6">
          The page or digital resource you requested may have been relocated, archived, or is currently unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--secondary)] text-xs font-semibold text-[var(--foreground)] transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Explore Catalog</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
