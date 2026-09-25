import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const supabaseAdmin = createAdminClient();

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.description !== undefined) updates.description = body.description?.trim() || null;
    if (body.meeting_type !== undefined) updates.meeting_type = body.meeting_type;
    if (body.host_name !== undefined) updates.host_name = body.host_name.trim();
    if (body.host_email !== undefined) updates.host_email = body.host_email.trim();
    if (body.join_url !== undefined) updates.join_url = body.join_url.trim();
    if (body.meeting_url !== undefined) updates.meeting_url = body.meeting_url.trim();
    if (body.meeting_id !== undefined) updates.meeting_id = body.meeting_id?.trim() || null;
    if (body.passcode !== undefined) updates.passcode = body.passcode?.trim() || null;
    if (body.scheduled_start !== undefined) updates.scheduled_start = new Date(body.scheduled_start).toISOString();
    if (body.duration_minutes !== undefined) updates.duration_minutes = Number(body.duration_minutes);
    if (body.max_participants !== undefined) updates.max_participants = Number(body.max_participants);
    if (body.status !== undefined) updates.status = body.status;

    const { data, error } = await supabaseAdmin
      .from("zoom_meetings")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ meeting: data });
  } catch (err: any) {
    console.error("Error in PATCH /api/admin/meetings/[id]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from("zoom_meetings").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in DELETE /api/admin/meetings/[id]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
