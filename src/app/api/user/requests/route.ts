import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SupportChatStore } from "@/lib/support/support-chat-store";

// GET: Authenticated user's own resource requests with technical review & solved details
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const isAdmin = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";

    // Select all fields including admin notes and resolution timestamps
    let query = supabaseAdmin
      .from("resource_requests")
      .select(
        "id, user_id, name, user_name, user_email, resource_name, software_name, category, software_category, description, status, admin_note, admin_notes, created_at, updated_at, contacted_at, resolved_at"
      )
      .order("created_at", { ascending: false });

    // Users view their own requests; admins view their requests or all if requested
    query = query.eq("user_id", user.id);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get active/recent support chat sessions to find any specialist messages linked to these requests
    const allSessions = SupportChatStore.getAllSessions();

    const requests = (data || []).map((row: any) => {
      let cleanDesc = row.description || "";
      cleanDesc = cleanDesc.replace(/^\[WhatsApp:[^\]]+\]\s*/, "").trim();

      const rawStatus = (row.status || "pending").toLowerCase();
      const mappedStatus =
        rawStatus === "fulfilled" || rawStatus === "completed"
          ? "completed"
          : rawStatus === "in_review" || rawStatus === "reviewing"
          ? "reviewing"
          : rawStatus === "rejected"
          ? "rejected"
          : "pending";

      const resourceName = row.resource_name || row.software_name || "Requested Resource";
      const adminNote = row.admin_note || row.admin_notes || null;

      // Find any chat session matching this request
      const matchedSession = allSessions.find((s) => {
        const cat = (s.category || "").toLowerCase();
        const rName = resourceName.toLowerCase();
        return (
          cat.includes(rName) ||
          s.id.includes(row.id.slice(0, 8)) ||
          (s.userEmail && row.user_email && s.userEmail.toLowerCase() === row.user_email.toLowerCase())
        );
      });

      let latestSpecialistMsg: string | null = null;
      let specialistName: string | null = null;
      let chatSessionId: string | null = null;

      if (matchedSession) {
        chatSessionId = matchedSession.id;
        specialistName = matchedSession.assignedSpecialistName || "Technical Specialist";
        const adminMsgs = matchedSession.messages.filter((m) => m.sender === "admin");
        if (adminMsgs.length > 0) {
          latestSpecialistMsg = adminMsgs[adminMsgs.length - 1].text;
        }
      }

      return {
        id: row.id,
        resource_name: resourceName,
        category: row.category || row.software_category || "Software",
        description: cleanDesc,
        status: mappedStatus,
        admin_note: adminNote,
        created_at: row.created_at,
        updated_at: row.updated_at || null,
        contacted_at: row.contacted_at || null,
        resolved_at: row.resolved_at || null,
        specialist_message: latestSpecialistMsg,
        specialist_name: specialistName,
        chat_session_id: chatSessionId,
      };
    });

    return NextResponse.json({ success: true, requests });
  } catch (err: any) {
    console.error("User requests fetch error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE: User deletes their own resource request
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: "Request ID is required." }, { status: 400 });
    }

    // Verify user role
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const isAdmin = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";

    // Delete matching request owned by this user (or if admin)
    let deleteQuery = supabaseAdmin.from("resource_requests").delete().eq("id", id);
    if (!isAdmin) {
      deleteQuery = deleteQuery.eq("user_id", user.id);
    }

    const { error: deleteError } = await deleteQuery;

    if (deleteError) {
      console.error("Error deleting user resource request:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Resource request deleted successfully.",
    });
  } catch (err: any) {
    console.error("User request delete error:", err);
    return NextResponse.json({ error: err?.message || "Failed to delete request" }, { status: 500 });
  }
}
