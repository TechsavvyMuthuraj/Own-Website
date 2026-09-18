import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { MovieForm } from "@/components/admin/movie-form";

export const revalidate = 0;

export default async function AdminNewMoviePage() {
  const supabase = createAdminClient();

  // Find Movies category ID
  const { data: movieCat } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", "movies")
    .maybeSingle();

  const movieCategoryId = movieCat?.id || "50e82476-24c6-498c-a703-49bbb96b0dcf";

  return (
    <div className="space-y-6">
      <MovieForm movieCategoryId={movieCategoryId} />
    </div>
  );
}
