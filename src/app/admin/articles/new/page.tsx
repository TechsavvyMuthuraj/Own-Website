import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArticleStudio } from "@/components/admin/articles/article-studio";

export const metadata = {
  title: "New Article — NammaTech Studio",
  description: "Create and publish a technical journal article or developer guide.",
};

export default async function NewArticlePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="w-full">
      <ArticleStudio isEdit={false} />
    </div>
  );
}
