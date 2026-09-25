export type CommunityRole = "FOUNDER" | "ADMIN" | "VIP" | "MEMBER";

export interface ChatReaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs
}

export interface CommunityMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  senderRole: CommunityRole;
  content: string;
  timestamp: number;
  reactions?: Record<string, string[]>; // emoji -> array of user IDs
  isPinned?: boolean;
  messageType?: "text" | "voice";
  voiceData?: {
    audioUrl: string; // Base64 data URL or audio link
    duration: number; // in seconds
    mimeType?: string;
  };
}

export interface CommunityRoom {
  id: string;
  name: string;
  description: string;
  icon: "hash" | "film" | "crown" | "radio" | "video";
  type: "chat" | "lounge";
  badge?: string;
  defaultTopic?: string;
}

export interface CommunityPresenceUser {
  id: string;
  name: string;
  avatar: string | null;
  role: CommunityRole;
  isOnline: boolean;
  lastActive: number;
}
