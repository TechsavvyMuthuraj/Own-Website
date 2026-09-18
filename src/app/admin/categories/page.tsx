import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Category } from "@/types/database";
import { CategoriesClient } from "./categories-client";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const supabase = createAdminClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
          Category Management
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Organize platform taxonomy, ordering, active status, and SEO classifications.
        </p>
      </div>

      <CategoriesClient initialCategories={(categories || []) as Category[]} />
    </div>
  );
}
