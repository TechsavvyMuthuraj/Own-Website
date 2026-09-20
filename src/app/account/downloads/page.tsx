import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Crown, CheckCircle2, Sparkles, Film, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatBytes } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { ResourceVisual } from "@/components/resources/resource-visual";

export const revalidate = 0; // Fresh database queries on account downloads

export default async function AccountDownloadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account/downloads");
  }

  const supabaseAdmin = createAdminClient();

  // 1. Fetch active entitlements, download records, and paid orders for current user
  const [entitlementsRes, downloadsRes, paidOrdersRes] = await Promise.all([
    supabaseAdmin
      .from("entitlements")
      .select("*, resource:resources(*)")
      .eq("user_id", user.id)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("downloads")
      .select("id, downloaded_at, resource_id, resource:resources(*)")
      .eq("user_id", user.id)
      .order("downloaded_at", { ascending: false }),
    supabaseAdmin
      .from("orders")
      .select("id, created_at, status, items:order_items(*, resource:resources(*))")
      .eq("user_id", user.id)
      .in("status", ["PAID", "VERIFIED"])
      .order("created_at", { ascending: false }),
  ]);

  // 2. Merge and deduplicate by resource_id
  const seenResourceIds = new Set<string>();
  const allItems: Array<{
    id: string;
    resource: any;
    date: string;
    isEntitled: boolean;
    isFree: boolean;
  }> = [];

  // Add all active entitlements first
  if (entitlementsRes.data) {
    for (const item of entitlementsRes.data) {
      const res = Array.isArray(item.resource) ? item.resource[0] : item.resource;
      if (res && !seenResourceIds.has(res.id)) {
        seenResourceIds.add(res.id);
        const isFree = Number(res.price || 0) === 0 && res.access_type !== "PAID";
        allItems.push({
          id: item.id,
          resource: res,
          date: item.created_at,
          isEntitled: true,
          isFree,
        });
      }
    }
  }

  // Add items from paid/verified orders (Fail-safe: guarantees user downloads appear immediately upon order payment)
  if (paidOrdersRes.data) {
    for (const order of paidOrdersRes.data) {
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          const res = Array.isArray(item.resource) ? item.resource[0] : item.resource;
          if (res && !seenResourceIds.has(res.id)) {
            seenResourceIds.add(res.id);
            const isFree = Number(res.price || 0) === 0 && res.access_type !== "PAID";
            allItems.push({
              id: item.id,
              resource: res,
              date: order.created_at,
              isEntitled: true,
              isFree,
            });
            // Auto-heal missing entitlement in background if needed
            supabaseAdmin
              .from("entitlements")
              .upsert(
                {
                  user_id: user.id,
                  resource_id: res.id,
                  order_id: order.id,
                  status: "ACTIVE",
                },
                { onConflict: "user_id,resource_id" }
              )
              .then(() => {});
          }
        }
      }
    }
  }

  // Add all downloads records (free items or claim events)
  if (downloadsRes.data) {
    for (const item of downloadsRes.data) {
      const res = Array.isArray(item.resource) ? item.resource[0] : item.resource;
      if (res && !seenResourceIds.has(res.id)) {
        seenResourceIds.add(res.id);
        const isFree = Number(res.price || 0) === 0 && res.access_type !== "PAID";
        allItems.push({
          id: item.id,
          resource: res,
          date: item.downloaded_at,
          isEntitled: false,
          isFree,
        });
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
            My Downloads & Purchased Products
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Instant access to all your free acquired tools, cinema media, and premium VIP licenses.
          </p>
        </div>

        {allItems.length > 0 && (
          <span className="self-start sm:self-auto px-3 py-1 rounded-xl text-xs font-bold bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)]">
            {allItems.length} {allItems.length === 1 ? "Item" : "Items"} Total
          </span>
        )}
      </div>

      {allItems.length > 0 ? (
        <div className="divide-y divide-[var(--border)] rounded-3xl border border-[var(--border)] bg-[var(--card)] p-3 sm:p-6 shadow-sm">
          {allItems.map(({ id, resource, date, isFree }) => {
            const isMovie =
              resource.tags?.includes("movie") ||
              resource.tags?.includes("movies") ||
              resource.tags?.includes("Cinema") ||
              resource.slug?.includes("movie");

            return (
              <div
                key={id}
                className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--secondary)]/20 -mx-2 px-3 sm:px-4 rounded-2xl transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="flex-shrink-0 mt-0.5 sm:mt-0">
                    <ResourceVisual resource={resource} variant="icon" size="md" showFormatTag={false} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-[var(--foreground)] truncate">
                        {resource.title}
                      </h4>

                      {/* Free vs VIP Badge */}
                      {isFree ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Free Product
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <Crown className="w-3 h-3" />
                          VIP License
                        </span>
                      )}

                      {isMovie && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          <Film className="w-3 h-3" />
                          Cinema
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--muted-foreground)] mt-1">
                      {resource.version && <span>v{resource.version}</span>}
                      {resource.version && resource.size_bytes && <span>•</span>}
                      {resource.size_bytes && <span>{formatBytes(resource.size_bytes)}</span>}
                      {date && <span>•</span>}
                      {date && <span>Acquired {formatDate(date)}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  <Link
                    href={
                      isMovie
                        ? "/movies"
                        : `/resource/${resource.slug || resource.id}/download`
                    }
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] active:scale-[0.98] transition-all shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto ring-1 ring-emerald-500/20">
            <Download className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[var(--foreground)]">
              No downloads or products yet
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto leading-relaxed">
              You haven't claimed any free digital tools or purchased VIP licenses yet. Any free software, tool, APK, or movie you download will be permanently accessible here.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/free"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Free Software</span>
            </Link>
            <Link
              href="/movies"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--foreground)] font-semibold text-xs transition-all"
            >
              <Film className="w-3.5 h-3.5 text-amber-500" />
              <span>Browse Movies Hub</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
