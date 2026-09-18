import React from "react";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Resource } from "@/types/database";
import { MovieForm } from "@/components/admin/movie-form";

interface AdminEditMoviePageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

export default async function AdminEditMoviePage({ params }: AdminEditMoviePageProps) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: resource, error } = await supabase
    .from("resources")
    .select("*, download_links(*)")
    .eq("id", id)
    .single();

  if (error || !resource) {
    notFound();
  }

  // Find Movies category ID
  const { data: movieCat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "movies")
    .maybeSingle();

  const movieCategoryId =
    resource.category_id || movieCat?.id || "50e82476-24c6-498c-a703-49bbb96b0dcf";

  return (
    <div className="space-y-6">
      <MovieForm
        initialData={resource as Resource}
        isEdit={true}
        movieCategoryId={movieCategoryId}
      />
    </div>
  );
}
