import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    const { data: article, error } = await supabaseAdmin
      .from("articles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const supabaseAdmin = createAdminClient();

    // Check slug uniqueness if changed
    if (body.slug) {
      const { data: duplicate } = await supabaseAdmin
        .from("articles")
        .select("id")
        .eq("slug", body.slug.trim())
        .neq("id", id)
        .maybeSingle();

      if (duplicate) {
        return NextResponse.json(
          { error: `The slug "${body.slug}" is already in use by another article.` },
          { status: 400 }
        );
      }
    }

    // Fetch existing
    const { data: existing } = await supabaseAdmin
      .from("articles")
      .select("*")
      .eq("id", id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const status = body.status || existing.status;
    let published_at = existing.published_at;

    if (status === "PUBLISHED" && !existing.published_at) {
      published_at = new Date().toISOString();
    } else if (body.published_at !== undefined) {
      published_at = body.published_at;
    }

    const updateData: Record<string, any> = {
      title: body.title !== undefined ? body.title.trim() : existing.title,
      slug: body.slug !== undefined ? body.slug.trim() : existing.slug,
      content: body.content !== undefined ? (body.content ? body.content.trim() : null) : existing.content,
      excerpt: body.excerpt !== undefined ? (body.excerpt ? body.excerpt.trim() : null) : existing.excerpt,
      thumbnail_url: body.thumbnail_url !== undefined ? (body.thumbnail_url ? body.thumbnail_url.trim() : null) : existing.thumbnail_url,
      status,
      tags: Array.isArray(body.tags) ? body.tags : existing.tags,
      featured: body.featured !== undefined ? Boolean(body.featured) : existing.featured,
      published_at,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("articles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ article: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from("articles").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
