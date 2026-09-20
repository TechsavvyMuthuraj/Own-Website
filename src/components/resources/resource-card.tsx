import React from "react";
import Link from "next/link";
import {
  ExternalLink,
  Sparkles,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import type { Resource } from "@/types/database";
import { ResourceVisual } from "@/components/resources/resource-visual";
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  isNewResource,
  isUpdatedResource,
} from "@/lib/utils";
import BorderGlow from "@/components/ui/BorderGlow";

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const isUpdated = isUpdatedResource(resource.updated_at, resource.created_at);
  const isNew = isNewResource(resource.published_at || resource.created_at);
  const isPaid = resource.access_type === "PAID";
  const isExternal = resource.access_type === "EXTERNAL" || resource.resource_type === "EXTERNAL_LINK";

  const finalPrice = resource.sale_price !== null && resource.sale_price !== undefined ? resource.sale_price : resource.price;
  const hasDiscount = resource.sale_price !== null && resource.sale_price !== undefined && resource.price > resource.sale_price;
  const discountPercent = hasDiscount && resource.price > 0 ? Math.round(((resource.price - resource.sale_price!) / resource.price) * 100) : 0;

  return (
    <BorderGlow
      borderRadius={18}
      edgeSensitivity={32}
      glowRadius={36}
      glowIntensity={1.1}
      glowColor="40 90 75"
      colors={["#f59e0b", "#ec4899", "#38bdf8"]}
      backgroundColor="var(--card)"
      className="group transition-all duration-300 hover:-translate-y-1 h-full block"
    >
      <Link
        href={`/resource/${resource.slug}`}
        className="relative flex flex-col h-full p-4 cursor-pointer"
      >
        {/* Media / Visual Showcase area */}
      <div className="relative mb-4">
        <ResourceVisual resource={resource} variant="card" showFormatTag={true} />

        {/* Dynamic Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5">
          {/* If updated, show UPDATED with highest priority so admin edits are immediately obvious */}
          {isUpdated ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-neutral-950 shadow-md shadow-amber-500/20">
              <Clock className="w-3 h-3" />
              UPDATED
            </span>
          ) : isNew ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500 text-white backdrop-blur-md shadow-sm">
              <Sparkles className="w-3 h-3" />
              NEW
            </span>
          ) : null}

          {isPaid ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-neutral-950 shadow-sm border border-amber-300/30">
              ★ PRO
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
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] mt-auto gap-2">
          <div className="flex-1 min-w-0">
            {isPaid ? (
              <div className="flex flex-col gap-1">
                {/* Pro Style Price Pill */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-baseline gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-yellow-500/10 border border-amber-500/40 text-amber-500 shadow-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 dark:text-amber-400">PRO</span>
                    <span className="text-base sm:text-lg font-black tracking-tight text-[var(--foreground)]">
                      {formatCurrency(finalPrice, resource.currency)}
                    </span>
                  </div>
                  {hasDiscount && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[var(--muted-foreground)] line-through opacity-70">
                        {formatCurrency(resource.price, resource.currency)}
                      </span>
                      {discountPercent > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-500 border border-amber-500/30">
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Exact Date & Relative Time */}
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted-foreground)]">
                  <Calendar className="w-3 h-3 text-amber-500/70 shrink-0" />
                  <span className="truncate">
                    {isUpdated ? "Updated " : "Added "}
                    <strong className="font-semibold text-[var(--foreground)]">
                      {formatDate(resource.updated_at || resource.created_at)}
                    </strong>
                    <span className="opacity-75 ml-1">
                      • {formatRelativeTime(resource.updated_at || resource.created_at)}
                    </span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 shadow-xs w-fit">
                  <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wider">100% Free</span>
                </div>

                {/* Exact Date & Relative Time */}
                <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted-foreground)]">
                  <Calendar className="w-3 h-3 text-emerald-500/70 shrink-0" />
                  <span className="truncate">
                    {isUpdated ? "Updated " : "Added "}
                    <strong className="font-semibold text-[var(--foreground)]">
                      {formatDate(resource.updated_at || resource.created_at)}
                    </strong>
                    <span className="opacity-75 ml-1">
                      • {formatRelativeTime(resource.updated_at || resource.created_at)}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 group-hover:bg-amber-500 text-amber-400 group-hover:text-neutral-950 text-xs font-bold transition-all shadow-sm shrink-0">
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
    </BorderGlow>
  );
}
