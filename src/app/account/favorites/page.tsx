import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, Layers, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { ResourceCard } from "@/components/resources/resource-card";
import type { Resource } from "@/types/database";

export default async function AccountFavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account/favorites");
  }

  // Fetch favorites for current user
  const { data: favorites } = await supabase
    .from("favorites")
    .select("*, resource:resources(*, category:categories(*))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const resources = (favorites || [])
    .map((f: any) => {
      if (!f.resource) return null;
      return {
        ...f.resource,
        category: Array.isArray(f.resource.category) ? f.resource.category[0] : f.resource.category,
      };
    })
    .filter(Boolean) as Resource[];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
          Saved Favorites
        </h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Resources you have bookmarked for quick reference and future downloads.
        </p>
      </div>

      {resources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No saved favorites"
          description="You haven't bookmarked any resources yet. Click the heart icon on any resource card to save it here."
          actionText="Browse Resources"
          actionHref="/explore"
        />
      )}
    </div>
  );
}
