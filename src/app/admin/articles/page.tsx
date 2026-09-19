import React from "react";
import { createClient } from "@/lib/supabase/server";
import { ArticlesAdminClient } from "./articles-client";
import type { Article } from "@/types/database";
import { redirect } from "next/navigation";

export default async function AdminArticlesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return <ArticlesAdminClient initialArticles={(articles || []) as Article[]} />;
}
