import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Category } from "@/types/database";
import { ResourceForm } from "@/components/admin/resource-form";

export const revalidate = 0;

export default async function NewResourcePage() {
  const supabase = createAdminClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
          Create New Resource
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Enter resource details, metadata, mirrors, and licensing terms.
        </p>
      </div>

      <ResourceForm categories={(categories || []) as Category[]} />
    </div>
  );
}
