import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Article } from "@/types/database";
import { ArticleStudio } from "@/components/admin/articles/article-studio";

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

export async function generateMetadata({ params }: EditArticlePageProps) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: article } = await supabase
    .from("articles")
    .select("title")
    .eq("id", id)
    .single();

  return {
    title: article?.title ? `Edit "${article.title}" — NammaTech Studio` : "Edit Article — NammaTech Studio",
  };
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
  const { id } = await params;

  // 1. Verify user session
  const serverSupabase = await createClient();
  const {
    data: { user },
  } = await serverSupabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // 2. Fetch article with admin privileges
  const adminSupabase = createAdminClient();
  const { data: article, error } = await adminSupabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !article) {
    notFound();
  }

  return (
    <div className="w-full">
      <ArticleStudio initialArticle={article as Article} isEdit={true} />
    </div>
  );
}
