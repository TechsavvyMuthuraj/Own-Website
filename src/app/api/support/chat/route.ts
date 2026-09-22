import { NextRequest, NextResponse } from "next/server";
import { SupportChatStore } from "@/lib/support/support-chat-store";
import { createAdminClient } from "@/lib/supabase/admin";

const MOCK_EMAILS = [
  "karthik.techsupport@nammatech.dev",
  "priya.vip@nammatech.dev",
  "support.saravanan@nammatech.dev",
  "praveen.repack@nammatech.dev",
];

async function getTeamDutyStatus() {
  try {
    const supabase = createAdminClient();
    const { data: teamSetting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "technical_support_team")
      .maybeSingle();

    if (teamSetting?.value) {
      const rawList =
        typeof teamSetting.value === "string" ? JSON.parse(teamSetting.value) : teamSetting.value;
      if (Array.isArray(rawList) && rawList.length > 0) {
        const activeMembers = rawList.filter(
          (m: any) => !MOCK_EMAILS.includes((m?.email || "").toLowerCase())
        );

        const onDuty = activeMembers.filter((m: any) => m.dutyStatus === "ON_DUTY");
        const busy = activeMembers.filter((m: any) => m.dutyStatus === "BUSY");

        if (onDuty.length > 0) {
          return {
            overallStatus: "ON_DUTY" as const,
            onDutySpecialist: {
              name: onDuty[0].name,
              email: onDuty[0].email,
              role: onDuty[0].role || "Technical Support Specialist",
            },
          };
        } else if (busy.length > 0) {
          return {
            overallStatus: "BUSY" as const,
            onDutySpecialist: null,
          };
        } else if (activeMembers.length > 0) {
          return {
            overallStatus: "OFF_DUTY" as const,
            onDutySpecialist: null,
          };
        }
      }
    }
  } catch (err) {
    console.error("[GetTeamDutyStatus Error]:", err);
  }

  return {
    overallStatus: "ON_DUTY" as const,
    onDutySpecialist: {
      name: "Muthuraj C",
      email: "techsavvy.muthuraj.dev@gmail.com",
      role: "Lead Software Architect & Head of Support",
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const all = searchParams.get("all");

    const dutyInfo = await getTeamDutyStatus();

    if (all === "true" || !sessionId) {
      // Admin request: get all active sessions
      const sessions = SupportChatStore.getAllSessions();
      return NextResponse.json({
        sessions,
        specialistDutyStatus: dutyInfo.overallStatus,
        onDutySpecialist: dutyInfo.onDutySpecialist,
      });
    }

    // Specific session query
    let session = SupportChatStore.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ session: null, error: "Session not found" }, { status: 404 });
    }

    // Dynamic sync of on-duty specialist: if on duty specialist is available and session has no specialist
    if (!session.assignedSpecialistName && dutyInfo.onDutySpecialist) {
      SupportChatStore.updateSpecialist(sessionId, {
        name: dutyInfo.onDutySpecialist.name,
        email: dutyInfo.onDutySpecialist.email,
        role: dutyInfo.onDutySpecialist.role,
        dutyStatus: dutyInfo.overallStatus,
      });
      session = SupportChatStore.getSession(sessionId)!;
    } else if (session) {
      session.specialistDutyStatus = dutyInfo.overallStatus;
    }

    const allActiveSessions = SupportChatStore.getAllSessions().filter((s) => s.status === "ACTIVE");
    const queuePosition = Math.max(1, allActiveSessions.findIndex((s) => s.id === sessionId) + 1);

    return NextResponse.json({
      session,
      specialistDutyStatus: dutyInfo.overallStatus,
      onDutySpecialist: dutyInfo.onDutySpecialist,
      queuePosition,
    });
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
      userName,
      sender = "user",
      senderName,
      text,
      codeSnippet,
      category,
      userEmail,
      userPhone,
    } = body;

    if (!sessionId?.trim()) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    if (!text?.trim() && !codeSnippet?.trim()) {
      return NextResponse.json({ error: "Message text or code is required" }, { status: 400 });
    }

    const dutyInfo = await getTeamDutyStatus();

    // Resolve assigned specialist
    let assignedSpecialist: { name: string; email?: string; role?: string } | undefined = undefined;

    if (sender === "admin" && (senderName || body.specialistName)) {
      const rawName = body.specialistName || senderName;
      const cleanName = rawName.replace(/\(Technical Team\)/i, "").replace(/\(Technical Support\)/i, "").trim();
      assignedSpecialist = {
        name: cleanName,
        email: body.specialistEmail,
        role: body.specialistRole || "Technical Support Specialist",
      };
    } else if (sender === "user") {
      if (dutyInfo.onDutySpecialist) {
        assignedSpecialist = dutyInfo.onDutySpecialist;
      }
    }

    // Determine clean sender name
    const effectiveSenderName =
      senderName?.trim() ||
      (sender === "admin"
        ? (assignedSpecialist?.name ? `${assignedSpecialist.name} (Technical Team)` : "Technical Team")
        : userName?.trim() || userEmail?.split("@")[0] || "User");

    // Ensure session exists with assigned specialist
    const session = SupportChatStore.getOrCreateSession(
      sessionId.trim(),
      userName?.trim(),
      category,
      userEmail,
      sender,
      assignedSpecialist
    );

    if (userPhone && !session.userPhone) {
      session.userPhone = userPhone.trim();
    }
    session.specialistDutyStatus = dutyInfo.overallStatus;

    // Append message
    const message = SupportChatStore.addMessage(
      sessionId.trim(),
      sender,
      effectiveSenderName,
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
      specialistDutyStatus: dutyInfo.overallStatus,
      onDutySpecialist: dutyInfo.onDutySpecialist,
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

    if (action === "clear") {
      SupportChatStore.clearSessionMessages(sessionId, body.specialistName);
    } else if (action === "read") {
      SupportChatStore.markAsRead(sessionId, body.reader || "admin");
    } else if (action === "assign") {
      SupportChatStore.updateSpecialist(sessionId, {
        name: body.name,
        email: body.email,
        role: body.role,
        dutyStatus: body.dutyStatus,
      });
    } else if (action === "typing") {
      SupportChatStore.setTyping(sessionId, body.sender || "user", Boolean(body.isTyping));
    } else if (action === "status") {
      SupportChatStore.updateStatus(sessionId, body.status, body.specialistName, body.customNote);
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
    const { searchParams } = new URL(request.url);
    let sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      try {
        const body = await request.json();
        sessionId = body?.sessionId;
      } catch {}
    }

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
