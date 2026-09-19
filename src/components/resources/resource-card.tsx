import React from "react";
import Link from "next/link";
import {
  ExternalLink,
  Sparkles,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";
import type { Resource } from "@/types/database";
import { ResourceVisual } from "@/components/resources/resource-visual";
import {
  formatCurrency,
  formatRelativeTime,
  isNewResource,
  isUpdatedResource,
} from "@/lib/utils";

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const isNew = isNewResource(resource.published_at || resource.created_at);
  const isUpdated = isUpdatedResource(resource.updated_at, resource.created_at);
  const isPaid = resource.access_type === "PAID";
  const isExternal = resource.access_type === "EXTERNAL" || resource.resource_type === "EXTERNAL_LINK";

  return (
    <Link
      href={`/resource/${resource.slug}`}
      className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer block"
    >
      {/* Media / Visual Showcase area */}
      <div className="relative mb-4">
        <ResourceVisual resource={resource} variant="card" showFormatTag={true} />

        {/* Dynamic Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5">
          {isNew && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
              <Sparkles className="w-3 h-3" />
              NEW
            </span>
          )}
          {isUpdated && !isNew && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/90 text-white backdrop-blur-md shadow-sm">
              <Clock className="w-3 h-3" />
              UPDATED
            </span>
          )}
          {isPaid ? (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500 text-neutral-950 shadow-sm">
              PREMIUM
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/90 text-white shadow-sm">
              FREE
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        {/* Category & Version */}
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-1.5">
          <span>{resource.category?.name || "General"}</span>
          {resource.version && (
            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[var(--secondary)]">
              v{resource.version}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-[var(--foreground)] group-hover:text-amber-400 transition-colors line-clamp-1 text-base tracking-tight mb-1">
          {resource.title}
        </h3>

        {/* Short description */}
        <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-4 leading-relaxed flex-1">
          {resource.short_description || "No description provided."}
        </p>

        {/* Footer info: Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] mt-auto">
          <div>
            {isPaid ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-[var(--foreground)]">
                  {formatCurrency(resource.sale_price !== null ? resource.sale_price : resource.price, resource.currency)}
                </span>
                {resource.sale_price !== null && (
                  <span className="text-xs text-[var(--muted-foreground)] line-through">
                    {formatCurrency(resource.price, resource.currency)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Free Download
              </span>
            )}
            <div className="text-[10px] text-[var(--muted-foreground)]">
              {formatRelativeTime(resource.updated_at)}
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 group-hover:bg-amber-500 text-amber-400 group-hover:text-neutral-950 text-xs font-bold transition-all shadow-sm">
            <span>{isExternal ? "Open Link" : "View Details"}</span>
            {isExternal ? (
              <ExternalLink className="w-3.5 h-3.5" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
