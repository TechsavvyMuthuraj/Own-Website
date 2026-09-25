import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "ALL";

    const supabaseAdmin = createAdminClient();
    let query = supabaseAdmin
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "ALL") {
      query = query.eq("status", status);
    }

    if (q) {
      query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,slug.ilike.%${q}%`);
    }

    const { data: articles, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ articles: articles || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const body = await request.json();
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Article title is required" }, { status: 400 });
    }

    const slug = (
      body.slug ||
      body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    ).trim();

    const supabaseAdmin = createAdminClient();

    // Check slug uniqueness
    const { data: existingSlug } = await supabaseAdmin
      .from("articles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingSlug) {
      return NextResponse.json(
        { error: `An article with the slug "${slug}" already exists. Please choose a unique slug.` },
        { status: 400 }
      );
    }

    const status = body.status || "DRAFT";
    const articleData = {
      title: body.title.trim(),
      slug,
      content: body.content ? body.content.trim() : null,
      excerpt: body.excerpt ? body.excerpt.trim() : null,
      thumbnail_url: body.thumbnail_url ? body.thumbnail_url.trim() : null,
      author_id: user.id,
      status,
      tags: Array.isArray(body.tags) ? body.tags : null,
      featured: Boolean(body.featured),
      views_count: 0,
      published_at: status === "PUBLISHED" ? (body.published_at || new Date().toISOString()) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newArticle, error: insertError } = await supabaseAdmin
      .from("articles")
      .insert(articleData)
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ article: newArticle });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
