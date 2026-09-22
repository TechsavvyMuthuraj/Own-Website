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
  category?: string;
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

  // Add initial sample demo session so admin immediately sees the studio in action
  const sampleId = "session_welcome_demo";
  const now = new Date().toISOString();
  global.__nammatech_support_sessions__.set(sampleId, {
    id: sampleId,
    userName: "Alex Explorer",
    userEmail: "alex@example.com",
    category: "Software Installation Help",
    status: "ACTIVE",
    unreadAdminCount: 1,
    unreadUserCount: 0,
    createdAt: now,
    updatedAt: now,
    lastMessage: "Hi support team! I need help setting up OBS virtual camera on Windows 11.",
    messages: [
      {
        id: "msg_init_sys",
        sessionId: sampleId,
        sender: "system",
        senderName: "NammaTech Bot",
        text: "⚡ Connected to NammaTech 1-on-1 Technical Support. An administrator has been alerted.",
        timestamp: new Date(Date.now() - 120000).toISOString(),
        status: "read",
      },
      {
        id: "msg_init_user",
        sessionId: sampleId,
        sender: "user",
        senderName: "Alex Explorer",
        text: "Hi support team! I need help setting up OBS virtual camera on Windows 11. Is there an official legal bypass or config?",
        timestamp: new Date(Date.now() - 60000).toISOString(),
        status: "delivered",
      },
    ],
  });
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
  getOrCreateSession(sessionId: string, userName: string, category?: string, userEmail?: string): SupportSession {
    let session = sessionsStore.get(sessionId);
    const now = new Date().toISOString();

    if (!session) {
      session = {
        id: sessionId,
        userName: userName.trim() || "Guest Explorer",
        userEmail: userEmail?.trim(),
        category: category || "General Support",
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
            senderName: "NammaTech Bot",
            text: `👋 Welcome ${userName.trim()}! You are connected to NammaTech Realtime Technical Support. An administrator has been notified. How can we help you today?`,
            timestamp: now,
            status: "read",
          },
        ],
      };
      sessionsStore.set(sessionId, session);
    } else {
      // Update username if provided
      if (userName && userName !== "Guest Explorer") {
        session.userName = userName.trim();
      }
      if (category) {
        session.category = category;
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

  // Update session status (e.g. resolve)
  updateStatus(sessionId: string, status: "ACTIVE" | "WAITING" | "RESOLVED") {
    const session = sessionsStore.get(sessionId);
    if (!session) return;
    session.status = status;
    session.updatedAt = new Date().toISOString();

    if (status === "RESOLVED") {
      session.messages.push({
        id: `sys_resolved_${Date.now()}`,
        sessionId,
        sender: "system",
        senderName: "System",
        text: "✅ This technical support ticket was marked as resolved. You can still message anytime if you need more assistance!",
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

  // Delete session
  deleteSession(sessionId: string) {
    sessionsStore.delete(sessionId);
  },
};
