import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
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

    const supabaseAdmin = createAdminClient();

    // Query meetings with registrations count
    const { data: meetings, error } = await supabaseAdmin
      .from("zoom_meetings")
      .select("*, zoom_registrations(count)")
      .order("scheduled_start", { ascending: false });

    if (error) {
      // Table might not exist yet before SQL migration, return sample/empty list gracefully
      console.warn("zoom_meetings table query error (run SQL migration):", error.message);
      return NextResponse.json({
        meetings: [],
        tableReady: false,
        message: "zoom_meetings table not created yet. Please execute provided SQL migration.",
      });
    }

    const formatted = (meetings || []).map((m: any) => ({
      ...m,
      registrations_count: m.zoom_registrations?.[0]?.count || 0,
    }));

    return NextResponse.json({ meetings: formatted, tableReady: true });
  } catch (err: any) {
    console.error("Error in GET /api/admin/meetings:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    if (!body.title?.trim() || !body.scheduled_start || !body.join_url?.trim()) {
      return NextResponse.json(
        { error: "Title, scheduled start time, and Zoom join URL are required." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const insertPayload = {
      title: body.title.trim(),
      description: body.description?.trim() || null,
      meeting_type: body.meeting_type || "consultation",
      host_name: body.host_name?.trim() || "Muthuraj C",
      host_email: body.host_email?.trim() || "contact@techsavvymuthuraj.dev",
      meeting_url: body.meeting_url?.trim() || body.join_url.trim(),
      join_url: body.join_url.trim(),
      meeting_id: body.meeting_id?.trim() || null,
      passcode: body.passcode?.trim() || null,
      scheduled_start: new Date(body.scheduled_start).toISOString(),
      duration_minutes: Number(body.duration_minutes) || 45,
      max_participants: Number(body.max_participants) || 50,
      status: body.status || "scheduled",
    };

    const { data, error } = await supabaseAdmin
      .from("zoom_meetings")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error("Error inserting zoom_meeting:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ meeting: data }, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/admin/meetings:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
