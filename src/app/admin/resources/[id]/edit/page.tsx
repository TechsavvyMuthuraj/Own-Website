import React from "react";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Resource, Category } from "@/types/database";
import { ResourceForm } from "@/components/admin/resource-form";

interface EditResourcePageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

export default async function EditResourcePage({ params }: EditResourcePageProps) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Fetch resource and download links
  const { data: resource, error } = await supabase
    .from("resources")
    .select("*, download_links(*)")
    .eq("id", id)
    .single();

  if (error || !resource) {
    notFound();
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
          Edit Resource
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 font-mono">
          ID: {resource.id} • Slug: /{resource.slug}
        </p>
      </div>

      <ResourceForm
        categories={(categories || []) as Category[]}
        initialData={resource as Resource}
        isEdit={true}
      />
    </div>
  );
}
