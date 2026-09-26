import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { CommunityMessageRow } from "@/types/database";

export const dynamic = "force-dynamic";

async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, status: 401, error: "Unauthorized" };
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPER_ADMIN")) {
    return { authorized: false, status: 403, error: "Forbidden: Admin access required" };
  }

  return { authorized: true, user, profile };
}

/**
 * GET /api/admin/community
 * Fetches community messages with filtering, search, pagination, and real-time statistics.
 */
export async function GET(request: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const room = searchParams.get("room") || "all";
    const type = searchParams.get("type") || "all";
    const pinned = searchParams.get("pinned") || "all";
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "50", 10)), 100);
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("community_messages")
      .select("*", { count: "exact" });

    if (room !== "all") {
      query = query.eq("room_id", room);
    }

    if (type !== "all") {
      query = query.eq("message_type", type);
    }

    if (pinned === "pinned") {
      query = query.eq("is_pinned", true);
    }

    if (search) {
      query = query.or(`content.ilike.%${search}%,sender_name.ilike.%${search}%`);
    }

    query = query
      .order("timestamp", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: messages, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate quick stats across entire community
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    const todayTimestamp = todayMidnight.getTime();

    const [
      { count: totalCount },
      { count: todayCount },
      { count: voiceCount },
      { count: pinnedCount },
    ] = await Promise.all([
      supabaseAdmin.from("community_messages").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("community_messages").select("*", { count: "exact", head: true }).gte("timestamp", todayTimestamp),
      supabaseAdmin.from("community_messages").select("*", { count: "exact", head: true }).eq("message_type", "voice"),
      supabaseAdmin.from("community_messages").select("*", { count: "exact", head: true }).eq("is_pinned", true),
    ]);

    return NextResponse.json({
      messages: (messages || []) as CommunityMessageRow[],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      stats: {
        totalMessages: totalCount || 0,
        messagesToday: todayCount || 0,
        voiceNotesCount: voiceCount || 0,
        pinnedCount: pinnedCount || 0,
      },
    });
  } catch (err: any) {
    console.error("[Admin Community GET Exception]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/community
 * Allows Admin to post an official broadcast announcement directly into any room.
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const {
      roomId = "general-tech",
      content,
      isPinned = false,
      broadcastRole = "FOUNDER",
    } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
    }

    const messageId = `msg-admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const senderName = auth.profile?.full_name || "Muthuraj C (Founder)";
    const senderAvatar = auth.profile?.avatar_url || "/images/founder-muthuraj.webp";

    const insertRow = {
      id: messageId,
      room_id: roomId,
      sender_id: auth.user!.id,
      sender_name: senderName,
      sender_avatar: senderAvatar,
      sender_role: broadcastRole || "FOUNDER",
      content: content.trim(),
      message_type: "text",
      reactions: { "📢": [auth.user!.id] },
      is_pinned: Boolean(isPinned),
      timestamp: Date.now(),
    };

    const { data, error } = await supabaseAdmin
      .from("community_messages")
      .insert(insertRow)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: data });
  } catch (err: any) {
    console.error("[Admin Community POST Exception]:", err);
    return NextResponse.json({ error: err.message || "Failed to post broadcast" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/community
 * Moderates a message: edit content, toggle pin status, or change role badge.
 */
export async function PATCH(request: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { id, content, isPinned, senderRole, roomId } = body;

    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    const updateFields: Record<string, any> = {};

    if (typeof content === "string") {
      updateFields.content = content.trim();
    }
    if (typeof isPinned === "boolean") {
      updateFields.is_pinned = isPinned;
    }
    if (typeof senderRole === "string") {
      updateFields.sender_role = senderRole;
    }
    if (typeof roomId === "string") {
      updateFields.room_id = roomId;
    }

    const { data, error } = await supabaseAdmin
      .from("community_messages")
      .update(updateFields)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: data });
  } catch (err: any) {
    console.error("[Admin Community PATCH Exception]:", err);
    return NextResponse.json({ error: err.message || "Failed to update message" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/community
 * Admin deletes a message or clears an entire room.
 */
export async function DELETE(request: Request) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const clearRoomId = searchParams.get("clearRoomId");

    if (clearRoomId) {
      const { error } = await supabaseAdmin
        .from("community_messages")
        .delete()
        .eq("room_id", clearRoomId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, clearedRoom: clearRoomId });
    }

    if (!id) {
      return NextResponse.json({ error: "Message ID or clearRoomId required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("community_messages")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("[Admin Community DELETE Exception]:", err);
    return NextResponse.json({ error: err.message || "Failed to delete message" }, { status: 500 });
  }
}
