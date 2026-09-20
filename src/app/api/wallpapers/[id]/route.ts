import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, preview_url, download_url, category, resolution, is_featured, is_active, sort_order } = body;

    const supabaseAdmin = createAdminClient();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updatePayload.name = name.trim();
    if (preview_url !== undefined) updatePayload.preview_url = preview_url.trim();
    if (download_url !== undefined) updatePayload.download_url = download_url.trim();
    if (category !== undefined) updatePayload.category = category.trim();
    if (resolution !== undefined) updatePayload.resolution = resolution.trim();
    if (is_featured !== undefined) updatePayload.is_featured = is_featured;
    if (is_active !== undefined) updatePayload.is_active = is_active;
    if (sort_order !== undefined) updatePayload.sort_order = Number(sort_order);

    const { data, error } = await supabaseAdmin
      .from("wallpapers")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ wallpaper: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update wallpaper" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
      .from("wallpapers")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete wallpaper" }, { status: 500 });
  }
}
