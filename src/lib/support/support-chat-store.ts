/**
 * Realtime Technical Support Chat Store (Server-side Singleton)
 * Manages active 1-on-1 support chat sessions, message histories, typing states, and read receipts.
 */

export interface SupportMessage {
  id: string;
  sessionId: string;
  sender: "user" | "admin" | "system";
  senderName: string;
  text: string;
  codeSnippet?: string;
  category?: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
  reactions?: Record<string, string[]>; // e.g. { "👍": ["user"], "🔥": ["admin"] }
}

export interface SupportSession {
  id: string;
  userName: string;
  userEmail?: string;
  userPhone?: string;
  category?: string;
  assignedSpecialistName?: string;
  assignedSpecialistEmail?: string;
  assignedSpecialistRole?: string;
  specialistDutyStatus?: "ON_DUTY" | "BUSY" | "OFF_DUTY";
  status: "ACTIVE" | "WAITING" | "RESOLVED";
  unreadAdminCount: number;
  unreadUserCount: number;
  isUserTyping?: boolean;
  isAdminTyping?: boolean;
  lastTypingTimestamp?: number;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  rating?: number;
  feedback?: string;
  messages: SupportMessage[];
}

import { createAdminClient } from "@/lib/supabase/admin";

// Global declaration to survive hot-reloads in Next.js development
declare global {
  // eslint-disable-next-line no-var
  var __nammatech_support_sessions__: Map<string, SupportSession> | undefined;
  // eslint-disable-next-line no-var
  var __nammatech_deleted_sessions__: Set<string> | undefined;
  // eslint-disable-next-line no-var
  var __nammatech_last_sync_timestamp__: number | undefined;
}

if (!global.__nammatech_support_sessions__) {
  global.__nammatech_support_sessions__ = new Map<string, SupportSession>();
}
if (!global.__nammatech_deleted_sessions__) {
  global.__nammatech_deleted_sessions__ = new Set<string>();
}

const sessionsStore = global.__nammatech_support_sessions__;
const deletedSessions = global.__nammatech_deleted_sessions__;

export const SupportChatStore = {
  // Sync state from Supabase site_settings (shared across all Vercel serverless lambdas)
  async syncFromSupabase(force = false) {
    const now = Date.now();
    const lastSync = global.__nammatech_last_sync_timestamp__ || 0;
    if (!force && now - lastSync < 1200) {
      return;
    }
    global.__nammatech_last_sync_timestamp__ = now;

    try {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["active_support_sessions", "deleted_support_sessions"]);

      if (data) {
        const deletedRow = data.find((r) => r.key === "deleted_support_sessions");
        if (Array.isArray(deletedRow?.value)) {
          deletedRow.value.forEach((id: string) => deletedSessions.add(id));
        }

        const activeRow = data.find((r) => r.key === "active_support_sessions");
        if (Array.isArray(activeRow?.value)) {
          // Remove any sessions currently in memory that were deleted elsewhere
          activeRow.value.forEach((s: SupportSession) => {
            if (!deletedSessions.has(s.id)) {
              const existing = sessionsStore.get(s.id);
              if (!existing || new Date(s.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
                sessionsStore.set(s.id, s);
              }
            } else {
              sessionsStore.delete(s.id);
            }
          });
        }
      }
    } catch (err) {
      console.error("[SupportChatStore syncFromSupabase Error]:", err);
    }
  },

  // Persist state to Supabase site_settings
  async persistToSupabase() {
    try {
      const supabase = createAdminClient();
      const activeList = Array.from(sessionsStore.values()).filter(
        (s) => !deletedSessions.has(s.id)
      );

      await supabase.from("site_settings").upsert([
        {
          key: "active_support_sessions",
          value: activeList.slice(0, 150),
          updated_at: new Date().toISOString(),
        },
        {
          key: "deleted_support_sessions",
          value: Array.from(deletedSessions).slice(-500),
          updated_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("[SupportChatStore persistToSupabase Error]:", err);
    }
  },

  // Get all sessions (sorted newest active first, excluding deleted)
  getAllSessions(): SupportSession[] {
    return Array.from(sessionsStore.values())
      .filter((s) => !deletedSessions.has(s.id))
      .sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  },

  // Check if a session was permanently deleted
  isDeleted(sessionId: string): boolean {
    return deletedSessions.has(sessionId);
  },

  // Get or initialize a session
  getSession(sessionId: string): SupportSession | null {
    if (deletedSessions.has(sessionId)) return null;
    const session = sessionsStore.get(sessionId);
    if (!session) return null;
    // Auto-expire stale typing state after 3.5 seconds of inactivity
    if (session.lastTypingTimestamp && Date.now() - session.lastTypingTimestamp > 3500) {
      session.isUserTyping = false;
      session.isAdminTyping = false;
    }
    return session;
  },

  // Create or join session
  getOrCreateSession(
    sessionId: string,
    userName?: string,
    category?: string,
    userEmail?: string,
    sender?: string,
    assignedSpecialist?: { name: string; email?: string; role?: string }
  ): SupportSession {
    let session = sessionsStore.get(sessionId);
    const now = new Date().toISOString();

    const cleanInputName = userName?.trim();
    const isGenericFallback = !cleanInputName || cleanInputName === "Explorer" || cleanInputName === "Guest Explorer" || cleanInputName === "Guest";
    const derivedName = !isGenericFallback ? cleanInputName : (userEmail?.split("@")[0] || "User");

    const specialistName = assignedSpecialist?.name?.trim() || "";

    if (!session) {
      const specGreeting = specialistName
        ? `${specialistName} (Technical Team) has connected to your session.`
        : `NammaTech Technical Support Specialist is connected.`;

      session = {
        id: sessionId,
        userName: derivedName,
        userEmail: userEmail?.trim(),
        category: category || "General Support",
        assignedSpecialistName: specialistName || undefined,
        assignedSpecialistEmail: assignedSpecialist?.email?.trim() || undefined,
        assignedSpecialistRole: assignedSpecialist?.role?.trim() || "Technical Support Specialist",
        status: "ACTIVE",
        unreadAdminCount: 0,
        unreadUserCount: 0,
        createdAt: now,
        updatedAt: now,
        messages: [
          {
            id: `sys_${Date.now()}`,
            sessionId,
            sender: "system",
            senderName: specialistName ? `${specialistName} (Technical Team)` : "Technical Team",
            text: `👋 Welcome ${derivedName}! ${specGreeting} How can we help you today?`,
            timestamp: now,
            status: "read",
          },
        ],
      };
      sessionsStore.set(sessionId, session);
    } else {
      // Only update username if a valid real name is provided from the user, and NOT from admin replies or generic fallbacks
      if (sender !== "admin" && !isGenericFallback) {
        session.userName = cleanInputName;
      }
      if (userEmail && !session.userEmail) {
        session.userEmail = userEmail.trim();
      }
      if (category) {
        session.category = category;
      }
      if (specialistName) {
        session.assignedSpecialistName = specialistName;
        if (assignedSpecialist?.email) session.assignedSpecialistEmail = assignedSpecialist.email;
        if (assignedSpecialist?.role) session.assignedSpecialistRole = assignedSpecialist.role;
      }
    }

    return session;
  },

  // Add message
  addMessage(
    sessionId: string,
    sender: "user" | "admin",
    senderName: string,
    text: string,
    codeSnippet?: string
  ): SupportMessage {
    const session = sessionsStore.get(sessionId);
    const now = new Date().toISOString();

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const cleanText = text.trim();
    const cleanCode = codeSnippet?.trim();

    // Prevent duplicate spam (e.g. from network retries or simultaneous polls)
    if (session.messages.length > 0) {
      const lastMsg = session.messages[session.messages.length - 1];
      if (
        lastMsg &&
        lastMsg.sender === sender &&
        lastMsg.text === cleanText &&
        (lastMsg.codeSnippet || "") === (cleanCode || "") &&
        Date.now() - new Date(lastMsg.timestamp).getTime() < 3000
      ) {
        return lastMsg;
      }
    }

    const newMessage: SupportMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      sessionId,
      sender,
      senderName,
      text: cleanText,
      codeSnippet: cleanCode,
      timestamp: now,
      status: "sent",
      reactions: {},
    };

    session.messages.push(newMessage);
    session.lastMessage = cleanText;
    session.updatedAt = now;

    if (sender === "user") {
      session.unreadAdminCount = (session.unreadAdminCount || 0) + 1;
      session.isUserTyping = false;
      session.status = "ACTIVE";
    } else if (sender === "admin") {
      session.unreadUserCount = (session.unreadUserCount || 0) + 1;
      session.isAdminTyping = false;
    }

    return newMessage;
  },

  // Update typing indicator
  setTyping(sessionId: string, sender: "user" | "admin", isTyping: boolean) {
    const session = sessionsStore.get(sessionId);
    if (!session) return;

    if (sender === "user") {
      session.isUserTyping = isTyping;
      session.lastTypingTimestamp = isTyping ? Date.now() : undefined;
    } else {
      session.isAdminTyping = isTyping;
      session.lastTypingTimestamp = isTyping ? Date.now() : undefined;
    }
  },

  // Mark messages as read
  markAsRead(sessionId: string, reader: "user" | "admin") {
    const session = sessionsStore.get(sessionId);
    if (!session) return;

    if (reader === "admin") {
      session.unreadAdminCount = 0;
      session.messages.forEach((m) => {
        if (m.sender === "user") m.status = "read";
      });
    } else {
      session.unreadUserCount = 0;
      session.messages.forEach((m) => {
        if (m.sender === "admin") m.status = "read";
      });
    }
  },

  // Update session status (e.g. ACTIVE, WAITING, RESOLVED)
  updateStatus(
    sessionId: string,
    status: "ACTIVE" | "WAITING" | "RESOLVED",
    specialistName?: string,
    customNote?: string
  ) {
    const session = sessionsStore.get(sessionId);
    if (!session) return;
    const prevStatus = session.status;
    session.status = status;
    session.updatedAt = new Date().toISOString();

    const effectiveSpecialist = specialistName || session.assignedSpecialistName || "Technical Specialist";

    if (status === "RESOLVED") {
      session.messages.push({
        id: `sys_resolved_${Date.now()}`,
        sessionId,
        sender: "system",
        senderName: effectiveSpecialist,
        text: customNote || `✅ Technical support session closed and marked as resolved by ${effectiveSpecialist}. Thank you!`,
        timestamp: new Date().toISOString(),
        status: "read",
      });
    } else if (status === "WAITING") {
      session.messages.push({
        id: `sys_waiting_${Date.now()}`,
        sessionId,
        sender: "system",
        senderName: effectiveSpecialist,
        text: customNote || `⏳ Specialist ${effectiveSpecialist} is waiting for user response / diagnostic details.`,
        timestamp: new Date().toISOString(),
        status: "read",
      });
    } else if (status === "ACTIVE" && prevStatus !== "ACTIVE") {
      session.messages.push({
        id: `sys_active_${Date.now()}`,
        sessionId,
        sender: "system",
        senderName: effectiveSpecialist,
        text: customNote || `⚡ Session is now active. Specialist ${effectiveSpecialist} is responding.`,
        timestamp: new Date().toISOString(),
        status: "read",
      });
    }
  },

  // Add reaction to message
  addReaction(sessionId: string, messageId: string, emoji: string, userType: "user" | "admin") {
    const session = sessionsStore.get(sessionId);
    if (!session) return;
    const msg = session.messages.find((m) => m.id === messageId);
    if (!msg) return;

    if (!msg.reactions) msg.reactions = {};
    if (!msg.reactions[emoji]) msg.reactions[emoji] = [];

    if (!msg.reactions[emoji].includes(userType)) {
      msg.reactions[emoji].push(userType);
    } else {
      msg.reactions[emoji] = msg.reactions[emoji].filter((u) => u !== userType);
      if (msg.reactions[emoji].length === 0) {
        delete msg.reactions[emoji];
      }
    }
  },

  // Rate session
  rateSession(sessionId: string, rating: number, feedback?: string) {
    const session = sessionsStore.get(sessionId);
    if (!session) return;
    session.rating = rating;
    if (feedback) session.feedback = feedback;
  },

  // Clear conversation messages
  clearSessionMessages(sessionId: string, specialistName?: string) {
    const session = sessionsStore.get(sessionId);
    if (!session) return;
    const now = new Date().toISOString();
    const effectiveName = specialistName || session.assignedSpecialistName || "Technical Team";
    session.messages = [
      {
        id: `sys_cleared_${Date.now()}`,
        sessionId,
        sender: "system",
        senderName: `${effectiveName} (Technical Team)`,
        text: `🧹 Conversation history cleared by ${effectiveName}. How can we help you?`,
        timestamp: now,
        status: "read",
      },
    ];
    session.lastMessage = "Conversation cleared";
    session.updatedAt = now;
    session.unreadAdminCount = 0;
    session.unreadUserCount = 0;
  },

  // Update assigned specialist & duty status
  updateSpecialist(
    sessionId: string,
    specialist: {
      name: string;
      email?: string;
      role?: string;
      dutyStatus?: "ON_DUTY" | "BUSY" | "OFF_DUTY";
    }
  ) {
    const session = sessionsStore.get(sessionId);
    if (!session) return;
    if (specialist.name) session.assignedSpecialistName = specialist.name;
    if (specialist.email) session.assignedSpecialistEmail = specialist.email;
    if (specialist.role) session.assignedSpecialistRole = specialist.role;
    if (specialist.dutyStatus) session.specialistDutyStatus = specialist.dutyStatus;
    session.updatedAt = new Date().toISOString();
  },

  // Delete session permanently and persist across all lambdas
  async deleteSession(sessionId: string) {
    sessionsStore.delete(sessionId);
    deletedSessions.add(sessionId);
    await this.persistToSupabase();
  },

  // Purge all sessions completely from memory and Supabase
  async purgeAll() {
    Array.from(sessionsStore.keys()).forEach((id) => deletedSessions.add(id));
    sessionsStore.clear();
    await this.persistToSupabase();
  },
};
