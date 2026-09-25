import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Public: Get upcoming and live meetings
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: meetings, error } = await supabase
      .from("zoom_meetings")
      .select("id, title, description, meeting_type, host_name, join_url, meeting_id, passcode, scheduled_start, duration_minutes, max_participants, status")
      .in("status", ["scheduled", "live"])
      .order("scheduled_start", { ascending: true });

    if (error) {
      console.warn("Public meetings fetch error:", error.message);
      return NextResponse.json({ meetings: [] });
    }

    return NextResponse.json({ meetings: meetings || [] });
  } catch (err: any) {
    console.error("Error in GET /api/meetings:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Public: Book or register for a Zoom meeting / 1-on-1 session
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.attendee_name?.trim() || !body.attendee_email?.trim()) {
      return NextResponse.json(
        { error: "Your name and email address are required to book a session." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.attendee_email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Optional user ID from session
    let authUserId: string | null = null;
    try {
      const userSupabase = await createClient();
      const {
        data: { user },
      } = await userSupabase.auth.getUser();
      if (user) authUserId = user.id;
    } catch {}

    const supabase = createAdminClient();

    let targetMeetingId = body.meeting_id;

    // If no specific meeting was picked (e.g. general 1-on-1 consultation request),
    // either link to an active consultation or create a scheduled request meeting
    if (!targetMeetingId) {
      // Find or create a 1-on-1 consultation meeting
      const { data: existingMeeting } = await supabase
        .from("zoom_meetings")
        .select("id")
        .eq("meeting_type", "consultation")
        .in("status", ["scheduled", "live"])
        .order("scheduled_start", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (existingMeeting) {
        targetMeetingId = existingMeeting.id;
      } else {
        // Create an on-demand consultation meeting record
        const preferredDate = body.preferred_date ? new Date(body.preferred_date) : new Date(Date.now() + 86400000);
        const { data: newMeeting, error: createError } = await supabase
          .from("zoom_meetings")
          .insert({
            title: `1-on-1 Consultation: ${body.attendee_name.trim()}`,
            description: body.topic_notes?.trim() || "Private technical consultation with Founder Muthuraj C.",
            meeting_type: "consultation",
            host_name: "Muthuraj C",
            host_email: "contact@techsavvymuthuraj.dev",
            meeting_url: "https://zoom.us/j/8492049102",
            join_url: "https://zoom.us/j/8492049102",
            meeting_id: "849 204 9102",
            passcode: "nammatech",
            scheduled_start: preferredDate.toISOString(),
            duration_minutes: 30,
            status: "scheduled",
          })
          .select("id")
          .single();

        if (!createError && newMeeting) {
          targetMeetingId = newMeeting.id;
        }
      }
    }

    if (!targetMeetingId) {
      return NextResponse.json({ error: "Could not allocate meeting session." }, { status: 400 });
    }

    // Insert registration
    const { data: registration, error: regError } = await supabase
      .from("zoom_registrations")
      .insert({
        meeting_id: targetMeetingId,
        user_id: authUserId,
        attendee_name: body.attendee_name.trim(),
        attendee_email: body.attendee_email.trim().toLowerCase(),
        attendee_phone: body.attendee_phone?.trim() || null,
        topic_notes: body.topic_notes?.trim() || null,
        status: "confirmed",
      })
      .select("*, zoom_meetings(*)")
      .single();

    if (regError) {
      console.error("Registration error:", regError);
      return NextResponse.json({ error: regError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      registration,
      message: "Zoom meeting consultation registered successfully!",
    });
  } catch (err: any) {
    console.error("Error in POST /api/meetings:", err);
    return NextResponse.json({ error: err.message || "Failed to book meeting" }, { status: 500 });
  }
}
