import React from "react";
import Link from "next/link";
import { FolderSearch, LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderSearch,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-[var(--border)] bg-[var(--card)]/50 backdrop-blur-sm ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[var(--secondary)] flex items-center justify-center text-[var(--muted-foreground)] mb-4 ring-1 ring-[var(--border)] shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--foreground)] tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-sm text-[var(--muted-foreground)] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-all shadow-sm focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
        >
          {actionText}
        </Link>
      )}
      {actionText && onAction && !actionHref && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-all shadow-sm focus:ring-2 focus:ring-[var(--ring)] focus:outline-none"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
