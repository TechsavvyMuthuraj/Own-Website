import { NextRequest, NextResponse } from "next/server";
import { SupportChatStore } from "@/lib/support/support-chat-store";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const all = searchParams.get("all");

    if (all === "true" || !sessionId) {
      // Admin request: get all active sessions
      const sessions = SupportChatStore.getAllSessions();
      return NextResponse.json({ sessions });
    }

    // Specific session query
    const session = SupportChatStore.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ session: null, error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (err: any) {
    console.error("[Support Chat GET Error]:", err);
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      userName = "Explorer",
      sender = "user",
      senderName = "Explorer",
      text,
      codeSnippet,
      category,
      userEmail,
    } = body;

    if (!sessionId?.trim()) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    if (!text?.trim() && !codeSnippet?.trim()) {
      return NextResponse.json({ error: "Message text or code is required" }, { status: 400 });
    }

    // Ensure session exists
    const session = SupportChatStore.getOrCreateSession(
      sessionId.trim(),
      userName.trim(),
      category,
      userEmail
    );

    // Append message
    const message = SupportChatStore.addMessage(
      sessionId.trim(),
      sender,
      senderName.trim(),
      text || "",
      codeSnippet
    );

    // Best-effort optional sync to Supabase contact_messages if email exists
    if (sender === "user" && userEmail) {
      try {
        const supabase = createAdminClient();
        await supabase.from("contact_messages").insert({
          name: userName,
          email: userEmail,
          subject: `[Live Support] ${category || "Inquiry"}`,
          message: `${text}${codeSnippet ? `\n\nCode/Logs:\n${codeSnippet}` : ""}`,
          status: "UNREAD",
        });
      } catch {
        // non-blocking
      }
    }

    return NextResponse.json({
      success: true,
      session: SupportChatStore.getSession(sessionId),
      message,
    });
  } catch (err: any) {
    console.error("[Support Chat POST Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to post message" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, action } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    if (action === "read") {
      SupportChatStore.markAsRead(sessionId, body.reader || "admin");
    } else if (action === "typing") {
      SupportChatStore.setTyping(sessionId, body.sender || "user", Boolean(body.isTyping));
    } else if (action === "status") {
      SupportChatStore.updateStatus(sessionId, body.status);
    } else if (action === "reaction") {
      SupportChatStore.addReaction(sessionId, body.messageId, body.emoji, body.userType);
    } else if (action === "rate") {
      SupportChatStore.rateSession(sessionId, body.rating, body.feedback);
    }

    return NextResponse.json({
      success: true,
      session: SupportChatStore.getSession(sessionId),
    });
  } catch (err: any) {
    console.error("[Support Chat PATCH Error]:", err);
    return NextResponse.json({ error: "Failed to update state" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    SupportChatStore.deleteSession(sessionId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Support Chat DELETE Error]:", err);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
