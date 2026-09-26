import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { moderateText } from "@/lib/community/moderation";
import { CommunityMessage, CommunityRole } from "@/components/community/community-types";
import { CommunityMessageRow } from "@/types/database";

export const dynamic = "force-dynamic";

// Helper to convert database snake_case row to frontend camelCase CommunityMessage
function formatRowToMessage(row: CommunityMessageRow): CommunityMessage {
  return {
    id: row.id,
    roomId: row.room_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderAvatar: row.sender_avatar,
    senderRole: (row.sender_role as CommunityRole) || "MEMBER",
    content: row.content,
    timestamp: Number(row.timestamp),
    reactions: (row.reactions as Record<string, string[]>) || {},
    isPinned: Boolean(row.is_pinned),
    messageType: row.message_type || "text",
    voiceData: row.voice_data || undefined,
  };
}

/**
 * GET /api/community/messages
 * Public endpoint: Returns persistent community messages for a given room.
 * Accessible to all visitors (authenticated members & guests without login).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("room_id") || "general-tech";
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "100", 10), 1), 250);
    const before = searchParams.get("before");

    let query = supabaseAdmin
      .from("community_messages")
      .select("*")
      .eq("room_id", roomId)
      .order("timestamp", { ascending: true })
      .limit(limit);

    if (before) {
      const beforeTimestamp = parseInt(before, 10);
      if (!isNaN(beforeTimestamp)) {
        query = query.lt("timestamp", beforeTimestamp);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Community GET Error]:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const messages: CommunityMessage[] = (data || []).map((row) =>
      formatRowToMessage(row as CommunityMessageRow)
    );

    return NextResponse.json({ messages });
  } catch (err: any) {
    console.error("[Community GET Exception]:", err);
    return NextResponse.json({ error: err.message || "Failed to load messages" }, { status: 500 });
  }
}

/**
 * POST /api/community/messages
 * Inserts a new chat or voice message into the database.
 * Supports logged in users and guests without login.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id: customId,
      roomId = "general-tech",
      content = "",
      messageType = "text",
      voiceData = null,
      guestId,
      guestName,
      guestAvatar,
    } = body;

    // 1. Resolve user authentication & role
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let senderId: string;
    let senderName: string;
    let senderAvatar: string | null = null;
    let senderRole: CommunityRole = "MEMBER";

    if (user) {
      senderId = user.id;
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("full_name, avatar_url, role")
        .eq("id", user.id)
        .single();

      senderName =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "Community Member";

      senderAvatar = profile?.avatar_url || user.user_metadata?.avatar_url || null;

      if (
        profile?.role === "SUPER_ADMIN" ||
        senderName.toLowerCase().includes("muthuraj")
      ) {
        senderRole = "FOUNDER";
        if (!senderAvatar) senderAvatar = "/images/founder-muthuraj.webp";
      } else if (profile?.role === "ADMIN") {
        senderRole = "ADMIN";
      } else {
        senderRole = "MEMBER";
      }
    } else {
      // Guest user without login
      const cleanGuest = (guestName || "").trim().slice(0, 30);
      senderId = (guestId || "").trim() || `guest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      senderName = cleanGuest || `Techie_${Math.floor(1000 + Math.random() * 9000)}`;
      senderAvatar = guestAvatar || null;
      senderRole = "MEMBER";
    }

    // 2. Validate & Moderate Text Content
    let finalContent = (content || "").trim();
    if (messageType === "voice") {
      finalContent = finalContent || "🎤 Voice Message";
      if (!voiceData || !voiceData.audioUrl) {
        return NextResponse.json({ error: "Voice data missing" }, { status: 400 });
      }
    } else {
      if (!finalContent) {
        return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
      }

      // Check community safety moderation
      const modResult = moderateText(finalContent);
      if (!modResult.isClean) {
        return NextResponse.json(
          {
            error: modResult.blockedReason || "Message rejected by moderation filter.",
            moderated: true,
          },
          { status: 400 }
        );
      }
    }

    const messageId =
      customId ||
      `msg-${messageType === "voice" ? "voice-" : ""}${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = Number(body.timestamp) || Date.now();

    const insertRow = {
      id: messageId,
      room_id: roomId,
      sender_id: senderId,
      sender_name: senderName,
      sender_avatar: senderAvatar,
      sender_role: senderRole,
      content: finalContent,
      message_type: messageType,
      voice_data: voiceData,
      reactions: body.reactions || {},
      is_pinned: Boolean(body.isPinned),
      timestamp: timestamp,
    };

    const { data, error } = await supabaseAdmin
      .from("community_messages")
      .insert(insertRow)
      .select()
      .single();

    if (error) {
      console.error("[Community POST Error]:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const createdMessage = formatRowToMessage(data as CommunityMessageRow);

    return NextResponse.json({
      success: true,
      message: createdMessage,
    });
  } catch (err: any) {
    console.error("[Community POST Exception]:", err);
    return NextResponse.json({ error: err.message || "Failed to post message" }, { status: 500 });
  }
}

/**
 * PUT /api/community/messages
 * Handles message reactions, pinning/unpinning, or editing.
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { action, messageId, emoji, userId, isPinned, content } = body;

    if (!messageId) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 });
    }

    // 1. Toggle Reaction
    if (action === "reaction") {
      if (!emoji || !userId) {
        return NextResponse.json({ error: "Emoji and userId required" }, { status: 400 });
      }

      // Fetch current reactions
      const { data: current, error: fetchErr } = await supabaseAdmin
        .from("community_messages")
        .select("reactions")
        .eq("id", messageId)
        .single();

      if (fetchErr || !current) {
        return NextResponse.json({ error: "Message not found" }, { status: 404 });
      }

      const reactions = (current.reactions as Record<string, string[]>) || {};
      const currentUsers = reactions[emoji] || [];
      const hasReacted = currentUsers.includes(userId);
      const nextUsers = hasReacted
        ? currentUsers.filter((u) => u !== userId)
        : [...currentUsers, userId];

      const updatedReactions = {
        ...reactions,
        [emoji]: nextUsers,
      };

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from("community_messages")
        .update({ reactions: updatedReactions })
        .eq("id", messageId)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        reactions: updated.reactions,
      });
    }

    // 2. Pin or Unpin (Admin only)
    if (action === "pin") {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPER_ADMIN")) {
        return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
      }

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from("community_messages")
        .update({ is_pinned: Boolean(isPinned) })
        .eq("id", messageId)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        isPinned: updated.is_pinned,
      });
    }

    // 3. Edit Message Content (Author or Admin)
    if (action === "edit") {
      if (!content || !content.trim()) {
        return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
      }

      const modResult = moderateText(content.trim());
      if (!modResult.isClean) {
        return NextResponse.json({ error: modResult.blockedReason }, { status: 400 });
      }

      const { data: updated, error: updateErr } = await supabaseAdmin
        .from("community_messages")
        .update({ content: content.trim() })
        .eq("id", messageId)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: formatRowToMessage(updated as CommunityMessageRow),
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("[Community PUT Exception]:", err);
    return NextResponse.json({ error: err.message || "Failed to update message" }, { status: 500 });
  }
}

/**
 * DELETE /api/community/messages
 * Deletes a message (Author or Admin).
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const requesterId = searchParams.get("userId");

    if (!id) {
      return NextResponse.json({ error: "Message ID required" }, { status: 400 });
    }

    // Check caller permission
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let isAdmin = false;
    if (user) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile && (profile.role === "ADMIN" || profile.role === "SUPER_ADMIN")) {
        isAdmin = true;
      }
    }

    if (!isAdmin) {
      // Must be the author
      const { data: existing } = await supabaseAdmin
        .from("community_messages")
        .select("sender_id")
        .eq("id", id)
        .single();

      if (!existing) {
        return NextResponse.json({ success: true });
      }

      const activeUserId = user?.id || requesterId;
      if (!activeUserId || existing.sender_id !== activeUserId) {
        return NextResponse.json({ error: "Forbidden: Cannot delete this message" }, { status: 403 });
      }
    }

    const { error: delErr } = await supabaseAdmin
      .from("community_messages")
      .delete()
      .eq("id", id);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error("[Community DELETE Exception]:", err);
    return NextResponse.json({ error: err.message || "Failed to delete message" }, { status: 500 });
  }
}
