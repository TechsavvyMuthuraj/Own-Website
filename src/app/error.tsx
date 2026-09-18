"use client";

import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-[var(--background)]">
      <div className="max-w-md w-full text-center p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 ring-1 ring-red-500/20">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight mb-2">
          Something went wrong
        </h2>
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-6">
          An unexpected error occurred while rendering this page. Our team has been notified.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}
