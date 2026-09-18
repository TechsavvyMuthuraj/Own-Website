import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin
      .from("announcements")
      .insert({
        title: body.title.trim(),
        content: body.content?.trim() || null,
        cta_text: body.cta_text?.trim() || null,
        cta_url: body.cta_url?.trim() || null,
        priority: Number(body.priority) || 0,
        start_date: body.start_date ? new Date(body.start_date).toISOString() : null,
        end_date: body.end_date ? new Date(body.end_date).toISOString() : null,
        is_active: body.is_active !== false,
        location: body.location || "TOP_BAR",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ announcement: data });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    const supabaseAdmin = createAdminClient();

    const { error } = await supabaseAdmin.from("announcements").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Announcement ID required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("announcements")
      .update({
        title: updates.title ? updates.title.trim() : undefined,
        content: updates.content !== undefined ? updates.content?.trim() || null : undefined,
        cta_text: updates.cta_text !== undefined ? updates.cta_text?.trim() || null : undefined,
        cta_url: updates.cta_url !== undefined ? updates.cta_url?.trim() || null : undefined,
        priority: updates.priority !== undefined ? Number(updates.priority) || 0 : undefined,
        start_date: updates.start_date ? new Date(updates.start_date).toISOString() : null,
        end_date: updates.end_date ? new Date(updates.end_date).toISOString() : null,
        is_active: updates.is_active !== undefined ? updates.is_active : true,
        location: updates.location || "TOP_BAR",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ announcement: data });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
