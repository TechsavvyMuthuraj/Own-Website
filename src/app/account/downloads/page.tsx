import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Layers, ShieldCheck, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { ResourceVisual } from "@/components/resources/resource-visual";

export default async function AccountDownloadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account/downloads");
  }

  // Fetch active entitlements for current user
  const { data: entitlements } = await supabase
    .from("entitlements")
    .select("*, resource:resources(*)")
    .eq("user_id", user.id)
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false });

  const items = (entitlements || []).map((e: any) => ({
    ...e,
    resource: Array.isArray(e.resource) ? e.resource[0] : e.resource,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
          My Purchased Products & Downloads
        </h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Access and re-download verified digital assets attached to your account entitlements.
        </p>
      </div>

      {items.length > 0 ? (
        <div className="divide-y divide-[var(--border)] rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6 shadow-sm">
          {items.map(({ id, resource, created_at }: any) => {
            if (!resource) return null;
            return (
              <div
                key={id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <ResourceVisual resource={resource} variant="icon" size="md" showFormatTag={false} />
                  <div>
                    <h4 className="font-semibold text-sm text-[var(--foreground)]">
                      {resource.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mt-0.5">
                      {resource.version && <span>v{resource.version}</span>}
                      {resource.version && <span>•</span>}
                      <span>Granted {formatDate(created_at)}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/resource/${resource.slug}/download`}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Download}
          title="No purchased products yet"
          description="You haven't purchased any commercial digital products or software licenses yet."
          actionText="Browse Premium Catalog"
          actionHref="/premium"
        />
      )}
    </div>
  );
}
