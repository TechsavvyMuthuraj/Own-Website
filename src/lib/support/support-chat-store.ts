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

// Global declaration to survive hot-reloads in Next.js development
declare global {
  // eslint-disable-next-line no-var
  var __nammatech_support_sessions__: Map<string, SupportSession> | undefined;
}

if (!global.__nammatech_support_sessions__) {
  global.__nammatech_support_sessions__ = new Map<string, SupportSession>();
}

const sessionsStore = global.__nammatech_support_sessions__;

export const SupportChatStore = {
  // Get all sessions (sorted newest active first)
  getAllSessions(): SupportSession[] {
    return Array.from(sessionsStore.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  // Get or initialize a session
  getSession(sessionId: string): SupportSession | null {
    return sessionsStore.get(sessionId) || null;
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

    const newMessage: SupportMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      sessionId,
      sender,
      senderName,
      text: text.trim(),
      codeSnippet: codeSnippet?.trim(),
      timestamp: now,
      status: "sent",
      reactions: {},
    };

    session.messages.push(newMessage);
    session.lastMessage = text.trim();
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

  // Delete session
  deleteSession(sessionId: string) {
    sessionsStore.delete(sessionId);
  },
};
