import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Download,
  ExternalLink,
  Sparkles,
  Clock,
  Laptop,
  Smartphone,
  Globe,
  Layers,
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

  const getPlatformIcon = (platform: string | null) => {
    if (!platform) return <Layers className="w-3.5 h-3.5" />;
    const p = platform.toLowerCase();
    if (p.includes("android") || p.includes("apk")) {
      return <Smartphone className="w-3.5 h-3.5 text-emerald-500" />;
    }
    if (p.includes("windows") || p.includes("pc") || p.includes("mac") || p.includes("linux")) {
      return <Laptop className="w-3.5 h-3.5 text-blue-500" />;
    }
    if (p.includes("web") || p.includes("online")) {
      return <Globe className="w-3.5 h-3.5 text-cyan-500" />;
    }
    return <Layers className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />;
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--ring)]/50 hover:shadow-xl hover:shadow-[#FD1843]/10">
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
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/90 text-white backdrop-blur-md shadow-sm">
              PREMIUM
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FD1843]/90 text-white backdrop-blur-md shadow-sm">
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
        <Link href={`/resource/${resource.slug}`} className="group-hover:text-[var(--primary)] transition-colors">
          <h3 className="font-semibold text-[var(--foreground)] line-clamp-1 text-base tracking-tight mb-1">
            {resource.title}
          </h3>
        </Link>

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

          <Link
            href={`/resource/${resource.slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--secondary)] hover:bg-[var(--primary)] text-[var(--foreground)] hover:text-[var(--primary-foreground)] text-xs font-medium transition-all shadow-sm group-hover:bg-[var(--primary)] group-hover:text-[var(--primary-foreground)]"
          >
            {isExternal ? (
              <>
                <span>Visit</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Get</span>
                <Download className="w-3.5 h-3.5" />
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
