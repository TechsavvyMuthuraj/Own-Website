"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Hash,
  Film,
  Crown,
  Video,
  Send,
  Smile,
  Volume2,
  VolumeX,
  Users,
  Sparkles,
  ShieldCheck,
  Pin,
  Clock,
  MessageSquare,
  Radio,
  ExternalLink,
  Trash2,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  Mic,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";
import { playMessageChimeSound, playPopSound } from "@/lib/sound";
import { WebRTCLounge } from "./webrtc-lounge";
import {
  moderateText,
  COMMUNITY_TIMEOUT_DURATION_MS,
} from "@/lib/community/moderation";
import { VoiceRecorder } from "./voice-recorder";
import { VoiceMessagePlayer } from "./voice-message-player";
import { MicrophonePermissionModal } from "@/components/ui/microphone-permission-modal";
import {
  CommunityMessage,
  CommunityRole,
  CommunityRoom,
  CommunityPresenceUser,
} from "./community-types";

const ROOMS: CommunityRoom[] = [
  {
    id: "general-tech",
    name: "General Tech & AI",
    description: "Software engineering, web development, AI tools, OS tricks, and tech discussion.",
    icon: "hash",
    type: "chat",
    defaultTopic: "Welcome to NammaTech community! Share tips, software tools, or ask technical questions.",
  },
  {
    id: "movies-cinema",
    name: "Cinema & 4K Lounge",
    description: "Discuss latest theatrical releases, review prints, request 4K UHD masters, and audio setups.",
    icon: "film",
    type: "chat",
    badge: "HOT",
    defaultTopic: "Discuss regional cinema, 4K prints, audio codecs, and recommend your favorite releases.",
  },
  {
    id: "vip-lounge",
    name: "VIP Direct Lounge",
    description: "Priority channel for VIP pass holders, custom download requests, and direct developer support.",
    icon: "crown",
    type: "chat",
    badge: "VIP",
    defaultTopic: "VIP Access Channel: Request direct high-speed cloud mirrors and custom tool repacks.",
  },
  {
    id: "live-stage",
    name: "Live Audio & Video Stage",
    description: "Real-time WebRTC group audio and video lounge. Hang out, screenshare tutorials, or watch trailers.",
    icon: "video",
    type: "lounge",
    badge: "LIVE",
  },
];

const INITIAL_PINNED_MESSAGES: Record<string, CommunityMessage> = {
  "general-tech": {
    id: "pinned-general",
    roomId: "general-tech",
    senderId: "muthuraj-founder",
    senderName: "Muthuraj C",
    senderAvatar: "/images/founder-muthuraj.webp",
    senderRole: "FOUNDER",
    content:
      "Vanakkam & Welcome to NammaTech Community! 🚀 This is our official tech gathering place. Be respectful, share verified tools, and enjoy learning together.",
    timestamp: Date.now() - 3600000 * 24,
    isPinned: true,
    reactions: { "🔥": ["founder", "system"], "👍": ["system"] },
  },
  "movies-cinema": {
    id: "pinned-movies",
    roomId: "movies-cinema",
    senderId: "muthuraj-founder",
    senderName: "Muthuraj C",
    senderAvatar: "/images/founder-muthuraj.webp",
    senderRole: "FOUNDER",
    content:
      "Welcome to Cinema Lounge! 🎬 Share feedback on new releases, sound mixing, or request 4K high-bitrate UHD prints.",
    timestamp: Date.now() - 3600000 * 12,
    isPinned: true,
    reactions: { "🎬": ["founder"], "🍿": ["system"] },
  },
  "vip-lounge": {
    id: "pinned-vip",
    roomId: "vip-lounge",
    senderId: "muthuraj-founder",
    senderName: "Muthuraj C",
    senderAvatar: "/images/founder-muthuraj.webp",
    senderRole: "FOUNDER",
    content:
      "Exclusive VIP Channel 👑 Thank you for supporting NammaTech! VIP members get fast-lane cloud mirrors and direct software assistance.",
    timestamp: Date.now() - 3600000 * 6,
    isPinned: true,
    reactions: { "👑": ["founder"], "⚡": ["system"] },
  },
};

const COMMON_EMOJIS = ["👍", "❤️", "🔥", "🚀", "🍿", "💯"];

export function CommunityHub() {
  const { user, profile } = useAuth();
  const [activeRoomId, setActiveRoomId] = useState<string>("general-tech");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [messages, setMessages] = useState<Record<string, CommunityMessage[]>>({});
  const [inputContent, setInputContent] = useState("");
  const [guestName, setGuestName] = useState("");
  const [onlineCount, setOnlineCount] = useState(1);
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [presenceUsers, setPresenceUsers] = useState<CommunityPresenceUser[]>([]);
  const [timeoutSeconds, setTimeoutSeconds] = useState<number>(0);
  const [moderationAlert, setModerationAlert] = useState<string | null>(null);
  const [isMicModalOpen, setIsMicModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const supabase = createClient();

  // Check and sync 30-second timeout countdown from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkTimeout = () => {
      const storedTimeout = localStorage.getItem("nammatech_community_timeout");
      if (storedTimeout) {
        const timeoutUntil = parseInt(storedTimeout, 10);
        const remaining = Math.max(0, Math.ceil((timeoutUntil - Date.now()) / 1000));
        setTimeoutSeconds(remaining);
        if (remaining <= 0) {
          localStorage.removeItem("nammatech_community_timeout");
          setModerationAlert(null);
        }
      } else {
        setTimeoutSeconds(0);
      }
    };

    checkTimeout();
    const interval = setInterval(checkTimeout, 1000);
    return () => clearInterval(interval);
  }, []);

  // Resolve user identity & role
  const resolvedName =
    profile?.full_name ||
    user?.email?.split("@")[0] ||
    guestName ||
    "TechieGuest";

  const resolvedRole: CommunityRole =
    profile?.role === "SUPER_ADMIN" || profile?.full_name?.toLowerCase().includes("muthuraj")
      ? "FOUNDER"
      : profile?.role === "ADMIN"
      ? "ADMIN"
      : user
      ? "MEMBER"
      : "MEMBER";

  const resolvedAvatar = profile?.avatar_url || (resolvedRole === "FOUNDER" ? "/images/founder-muthuraj.webp" : null);

  // Load guest name from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedGuest = localStorage.getItem("nammatech_guest_name");
      if (savedGuest) {
        setGuestName(savedGuest);
      } else {
        const randId = Math.floor(1000 + Math.random() * 9000);
        const autoName = `Techie_${randId}`;
        setGuestName(autoName);
        localStorage.setItem("nammatech_guest_name", autoName);
      }
    }
  }, []);

  // Load cached messages from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("nammatech_community_msgs");
        if (saved) {
          setMessages(JSON.parse(saved));
        }
      } catch {}
    }
  }, []);

  // Save messages to localStorage
  const updateAndPersistMessages = (updater: (prev: Record<string, CommunityMessage[]>) => Record<string, CommunityMessage[]>) => {
    setMessages((prev) => {
      const next = updater(prev);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("nammatech_community_msgs", JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  // Scroll internal chat container to bottom on new message or room switch — never scroll the outer window!
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, activeRoomId]);

  // Connect to Supabase Realtime Channel
  useEffect(() => {
    const channelName = "nammatech-community-global";
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: false, self: false },
        presence: { key: user?.id || `guest-${resolvedName}` },
      },
    });

    channel
      .on("broadcast", { event: "new-message" }, ({ payload }: { payload: any }) => {
        const incomingMsg: CommunityMessage = payload;
        updateAndPersistMessages((prev) => {
          const currentList = prev[incomingMsg.roomId] || [];
          if (currentList.some((m) => m.id === incomingMsg.id)) return prev;
          return {
            ...prev,
            [incomingMsg.roomId]: [...currentList, incomingMsg],
          };
        });

        if (soundEnabled && incomingMsg.senderId !== (user?.id || guestName)) {
          playMessageChimeSound();
        }
      })
      .on("broadcast", { event: "reaction" }, ({ payload }: { payload: any }) => {
        const { messageId, roomId, emoji, userId } = payload;
        updateAndPersistMessages((prev) => {
          const roomMsgs = prev[roomId] || [];
          const updated = roomMsgs.map((m) => {
            if (m.id !== messageId) return m;
            const existingReactions = m.reactions || {};
            const existingUsers = existingReactions[emoji] || [];
            const hasReacted = existingUsers.includes(userId);
            const nextUsers = hasReacted
              ? existingUsers.filter((u) => u !== userId)
              : [...existingUsers, userId];

            return {
              ...m,
              reactions: {
                ...existingReactions,
                [emoji]: nextUsers,
              },
            };
          });
          return { ...prev, [roomId]: updated };
        });
      })
      .on("broadcast", { event: "delete-message" }, ({ payload }: { payload: any }) => {
        const { messageId, roomId } = payload;
        updateAndPersistMessages((prev) => {
          const roomMsgs = prev[roomId] || [];
          return {
            ...prev,
            [roomId]: roomMsgs.filter((m) => m.id !== messageId),
          };
        });
      })
      .on("broadcast", { event: "clear-room" }, ({ payload }: { payload: any }) => {
        const { roomId } = payload;
        updateAndPersistMessages((prev) => ({
          ...prev,
          [roomId]: [],
        }));
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const usersList: CommunityPresenceUser[] = [];
        let count = 0;

        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            count++;
            usersList.push({
              id: p.user_id || `guest-${p.user_name}`,
              name: p.user_name || "Community Member",
              avatar: p.avatar_url || null,
              role: p.user_role || "MEMBER",
              isOnline: true,
              lastActive: Date.now(),
            });
          });
        });

        setOnlineCount(Math.max(count, 1));
        setPresenceUsers(usersList);
      })
      .subscribe(async (status: string) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: user?.id || `guest-${resolvedName}`,
            user_name: resolvedName,
            user_role: resolvedRole,
            avatar_url: resolvedAvatar,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile, resolvedName, resolvedRole, resolvedAvatar, soundEnabled]);

  const canModerate = resolvedRole === "FOUNDER" || resolvedRole === "ADMIN";

  const handleDeleteMessage = async (messageId: string) => {
    updateAndPersistMessages((prev) => {
      const roomMsgs = prev[activeRoomId] || [];
      return {
        ...prev,
        [activeRoomId]: roomMsgs.filter((m) => m.id !== messageId),
      };
    });

    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast",
        event: "delete-message",
        payload: { messageId, roomId: activeRoomId },
      });
    }
    playPopSound();
  };

  const handleClearRoom = async () => {
    if (!canModerate) return;
    const confirmed = window.confirm(
      `Are you sure you want to clear all messages in #${activeRoom.name}? This will reset the channel for all participants.`
    );
    if (!confirmed) return;

    updateAndPersistMessages((prev) => ({
      ...prev,
      [activeRoomId]: [],
    }));

    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast",
        event: "clear-room",
        payload: { roomId: activeRoomId },
      });
    }
    playPopSound();
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputContent.trim()) return;

    // Check if user is currently in a 30-second timeout
    if (timeoutSeconds > 0) {
      setModerationAlert(
        `You are on a ${timeoutSeconds}s timeout for violating community safety rules. Please wait.`
      );
      return;
    }

    // Safety & Scam Link Moderation Filter
    const modResult = moderateText(inputContent.trim());
    if (!modResult.isClean) {
      const newTimeoutUntil = Date.now() + COMMUNITY_TIMEOUT_DURATION_MS;
      if (typeof window !== "undefined") {
        localStorage.setItem("nammatech_community_timeout", String(newTimeoutUntil));
      }
      setTimeoutSeconds(Math.ceil(COMMUNITY_TIMEOUT_DURATION_MS / 1000));
      setModerationAlert(
        `${modResult.blockedReason || "Prohibited content detected"}. Message deleted and 30-second timeout applied.`
      );
      setInputContent("");
      return;
    }

    setModerationAlert(null);

    const newMessage: CommunityMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      roomId: activeRoomId,
      senderId: user?.id || `guest-${resolvedName}`,
      senderName: resolvedName,
      senderAvatar: resolvedAvatar,
      senderRole: resolvedRole,
      content: inputContent.trim(),
      timestamp: Date.now(),
      reactions: {},
    };

    setInputContent("");

    // Optimistic local add
    updateAndPersistMessages((prev) => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMessage],
    }));

    // Broadcast to real-time channel
    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast",
        event: "new-message",
        payload: newMessage,
      });
    }

    playPopSound();
  };

  const handleSendVoice = async (audioUrl: string, durationSeconds: number) => {
    if (timeoutSeconds > 0) return;

    const newMessage: CommunityMessage = {
      id: `msg-voice-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      roomId: activeRoomId,
      senderId: user?.id || `guest-${resolvedName}`,
      senderName: resolvedName,
      senderAvatar: resolvedAvatar,
      senderRole: resolvedRole,
      content: "🎤 Voice Message",
      messageType: "voice",
      voiceData: {
        audioUrl,
        duration: durationSeconds,
        mimeType: "audio/webm",
      },
      timestamp: Date.now(),
      reactions: {},
    };

    // Optimistic local add
    updateAndPersistMessages((prev) => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMessage],
    }));

    // Broadcast to real-time channel
    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast",
        event: "new-message",
        payload: newMessage,
      });
    }

    playPopSound();
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    const currentUserId = user?.id || `guest-${resolvedName}`;

    updateAndPersistMessages((prev) => {
      const roomMsgs = prev[activeRoomId] || [];
      const updated = roomMsgs.map((m) => {
        if (m.id !== messageId) return m;
        const existingReactions = m.reactions || {};
        const existingUsers = existingReactions[emoji] || [];
        const hasReacted = existingUsers.includes(currentUserId);
        const nextUsers = hasReacted
          ? existingUsers.filter((u) => u !== currentUserId)
          : [...existingUsers, currentUserId];

        return {
          ...m,
          reactions: {
            ...existingReactions,
            [emoji]: nextUsers,
          },
        };
      });
      return { ...prev, [activeRoomId]: updated };
    });

    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast",
        event: "reaction",
        payload: {
          messageId,
          roomId: activeRoomId,
          emoji,
          userId: currentUserId,
        },
      });
    }

    playPopSound();
  };

  const activeRoom = ROOMS.find((r) => r.id === activeRoomId) || ROOMS[0];
  const roomMessages = messages[activeRoomId] || [];
  const pinnedMessage = INITIAL_PINNED_MESSAGES[activeRoomId];

  return (
    <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 py-4 sm:py-8">
      {/* Top Banner Hero */}
      <div className="relative rounded-3xl p-5 sm:p-8 bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-cyan-500/10 border border-black/10 dark:border-white/10 overflow-hidden mb-6 shadow-xl backdrop-blur-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {onlineCount} Online Now
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/5 dark:bg-white/10 text-[var(--muted-foreground)]">
                Real-Time Broadcast
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--foreground)]">
              NammaTech Community Hub
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-xl">
              Connect with fellow tech enthusiasts, discuss 4K cinema releases, or join our live WebRTC audio and video stages.
            </p>
          </div>

          {/* Quick Header Actions: Sound Toggle & User Identity */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              title={soundEnabled ? "Mute message notification chimes" : "Enable message notification chimes"}
              className="p-2 sm:px-3 sm:py-2 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold text-[var(--foreground)] transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-amber-500" />
                  <span className="hidden sm:inline">Sound On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-zinc-400" />
                  <span className="hidden sm:inline">Sound Muted</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsMicModalOpen(true)}
              title="Inbuilt Microphone Access & Diagnostics for Any Browser"
              className="p-2 sm:px-3 sm:py-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-semibold text-amber-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Allow Mic</span>
            </button>

            <Link
              href="/meetings"
              title="Schedule or Join a Live 1-on-1 Zoom Session with Founder Muthuraj C"
              className="p-2 sm:px-3 sm:py-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Video className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Zoom Call</span>
            </Link>

            {!user ? (
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black tracking-wide shadow-md active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>Sign In for VIP Badge</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
                  {resolvedName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold text-[var(--foreground)] truncate max-w-[100px]">
                  {resolvedName}
                </span>
                <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  {resolvedRole}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Rooms Sidebar + Center Chat/Lounge Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Sidebar: Channels & Voice Stages */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-[var(--card)]/90 dark:bg-[#07070a]/90 backdrop-blur-2xl p-3 shadow-xl space-y-1.5">
            <div className="px-3 py-2 flex items-center justify-between text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
              <span>Rooms & Stages</span>
              <span className="text-[10px] text-amber-500 font-semibold">{ROOMS.length} Channels</span>
            </div>

            <div className="space-y-1">
              {ROOMS.map((room) => {
                const isActive = activeRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => {
                      setActiveRoomId(room.id);
                      playPopSound();
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                      isActive
                        ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                        : "hover:bg-black/5 dark:hover:bg-white/5 text-[var(--foreground)]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform ${
                          isActive
                            ? "bg-black/20 text-black"
                            : "bg-black/5 dark:bg-white/5 text-[var(--muted-foreground)] group-hover:scale-105 group-hover:text-amber-500"
                        }`}
                      >
                        {room.icon === "hash" && <Hash className="w-4 h-4" />}
                        {room.icon === "film" && <Film className="w-4 h-4" />}
                        {room.icon === "crown" && <Crown className="w-4 h-4" />}
                        {room.icon === "video" && <Video className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold truncate">{room.name}</p>
                        <p
                          className={`text-[10px] truncate ${
                            isActive ? "text-black/70" : "text-[var(--muted-foreground)]"
                          }`}
                        >
                          {room.type === "lounge" ? "WebRTC Voice & Video" : "Live Chat"}
                        </p>
                      </div>
                    </div>

                    {room.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          isActive
                            ? "bg-black text-amber-400"
                            : room.badge === "LIVE"
                            ? "bg-rose-500/20 text-rose-500 border border-rose-500/30 animate-pulse"
                            : room.badge === "HOT"
                            ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                            : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        }`}
                      >
                        {room.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guidelines Box */}
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-[var(--card)]/60 dark:bg-[#07070a]/60 backdrop-blur-xl p-4 text-xs space-y-2 text-[var(--muted-foreground)]">
            <div className="flex items-center gap-2 text-[var(--foreground)] font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Community Conduct</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              No piracy spam, maintain civil discussion, and enjoy high-speed verified software and 4K cinema tech discussions.
            </p>
          </div>
        </div>

        {/* Right Stage: Center Chat or WebRTC Lounge */}
        <div className="lg:col-span-8 xl:col-span-9">
          {activeRoom.type === "lounge" ? (
            <WebRTCLounge
              roomName={activeRoom.id}
              userName={resolvedName}
              userRole={resolvedRole}
              userAvatar={resolvedAvatar}
              presenceUsers={presenceUsers}
            />
          ) : (
            <div className="relative rounded-3xl border border-black/10 dark:border-white/10 bg-[var(--card)]/90 dark:bg-[#07070a]/90 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col h-[650px] sm:h-[720px]">
              {/* Room Top Bar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    {activeRoom.icon === "hash" && <Hash className="w-4 h-4" />}
                    {activeRoom.icon === "film" && <Film className="w-4 h-4" />}
                    {activeRoom.icon === "crown" && <Crown className="w-4 h-4" />}
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                      <span>#{activeRoom.name}</span>
                    </h2>
                    <p className="text-[11px] text-[var(--muted-foreground)] truncate max-w-xs sm:max-w-md">
                      {activeRoom.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {canModerate && (
                    <button
                      type="button"
                      onClick={handleClearRoom}
                      title="Clear all messages in this room (Admin/Founder Action)"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all cursor-pointer active:scale-95"
                    >
                      <RotateCcw className="w-3 h-3 text-rose-400" />
                      <span className="hidden sm:inline">Clear Channel</span>
                    </button>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Room
                  </span>
                </div>
              </div>

              {/* Chat Messages Feed */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Pinned Founder Message */}
                {pinnedMessage && (
                  <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <Pin className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-bold text-amber-500 uppercase tracking-wider">
                          Pinned by Founder
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--muted-foreground)]">Official Notice</span>
                    </div>

                    <div className="flex items-start gap-3 pt-1">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-amber-500/50">
                        {pinnedMessage.senderAvatar ? (
                          <Image
                            src={pinnedMessage.senderAvatar}
                            alt={pinnedMessage.senderName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-amber-500 text-black font-bold flex items-center justify-center text-xs">
                            M
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--foreground)]">
                            {pinnedMessage.senderName}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500 text-black">
                            FOUNDER
                          </span>
                        </div>
                        <p className="text-xs text-[var(--foreground)] mt-1 leading-relaxed">
                          {pinnedMessage.content}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages List */}
                {roomMessages.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center p-6 text-[var(--muted-foreground)]">
                    <MessageSquare className="w-8 h-8 text-amber-500/50 mb-2 animate-bounce" />
                    <p className="text-xs font-medium">Be the first to speak in #{activeRoom.name}!</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Messages broadcast instantly to all connected users.
                    </p>
                  </div>
                ) : (
                  roomMessages.map((msg) => {
                    const isCurrentUser = msg.senderId === (user?.id || `guest-${resolvedName}`);
                    const isFounder = msg.senderRole === "FOUNDER";
                    const isAdmin = msg.senderRole === "ADMIN";
                    const isVip = msg.senderRole === "VIP";

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-3 group transition-all ${
                          isCurrentUser ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-1 ${
                            isFounder
                              ? "ring-amber-500"
                              : isAdmin
                              ? "ring-rose-500"
                              : isVip
                              ? "ring-cyan-500"
                              : "ring-white/20"
                          } flex items-center justify-center text-xs font-bold ${
                            isCurrentUser ? "bg-amber-500 text-black" : "bg-black/10 dark:bg-white/10 text-[var(--foreground)]"
                          }`}
                        >
                          {msg.senderAvatar ? (
                            <Image
                              src={msg.senderAvatar}
                              alt={msg.senderName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            msg.senderName.charAt(0).toUpperCase()
                          )}
                        </div>

                        {/* Message Bubble Container */}
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] space-y-1 ${
                            isCurrentUser ? "items-end text-right" : "items-start text-left"
                          }`}
                        >
                          {/* Sender meta */}
                          <div
                            className={`flex items-center gap-1.5 text-[10px] text-[var(--muted-foreground)] ${
                              isCurrentUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            <span className="font-bold text-[var(--foreground)]">
                              {msg.senderName}
                            </span>
                            {isFounder && (
                              <span className="px-1 py-0.2 rounded text-[8px] font-black uppercase bg-amber-500 text-black">
                                FOUNDER
                              </span>
                            )}
                            {isAdmin && !isFounder && (
                              <span className="px-1 py-0.2 rounded text-[8px] font-black uppercase bg-rose-500 text-white">
                                ADMIN
                              </span>
                            )}
                            {isVip && (
                              <span className="px-1 py-0.2 rounded text-[8px] font-black uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                VIP
                              </span>
                            )}
                            <span>•</span>
                            <span>
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {/* Bubble content */}
                          <div
                            className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm transition-all ${
                              isCurrentUser
                                ? "bg-amber-500 text-black font-medium rounded-tr-xs"
                                : "bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[var(--foreground)] rounded-tl-xs"
                            } ${msg.messageType === "voice" ? "min-w-[240px] sm:min-w-[280px]" : ""}`}
                          >
                            {msg.messageType === "voice" && msg.voiceData?.audioUrl ? (
                              <VoiceMessagePlayer
                                audioUrl={msg.voiceData.audioUrl}
                                duration={msg.voiceData.duration}
                                isCurrentUser={isCurrentUser}
                              />
                            ) : (
                              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            )}
                          </div>

                          {/* Reactions Row */}
                          <div
                            className={`flex items-center gap-1 pt-0.5 flex-wrap ${
                              isCurrentUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            {/* Existing emoji pills */}
                            {msg.reactions &&
                              Object.entries(msg.reactions).map(([emoji, userIds]) => {
                                if (!userIds || userIds.length === 0) return null;
                                const currentUserId = user?.id || `guest-${resolvedName}`;
                                const hasReacted = userIds.includes(currentUserId);
                                return (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => handleReaction(msg.id, emoji)}
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                                      hasReacted
                                        ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                                        : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                    }`}
                                  >
                                    <span>{emoji}</span>
                                    <span>{userIds.length}</span>
                                  </button>
                                );
                              })}

                            {/* Quick Add Reaction Popover on Hover */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 ml-1">
                              {COMMON_EMOJIS.slice(0, 4).map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => handleReaction(msg.id, emoji)}
                                  className="w-5 h-5 rounded hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center text-[10px] cursor-pointer"
                                  title={`React ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              ))}

                              {/* Delete message button for Admins/Founders or Message Author */}
                              {(canModerate || isCurrentUser) && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="w-5 h-5 rounded hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 flex items-center justify-center text-[10px] cursor-pointer transition-colors ml-0.5"
                                  title="Delete Message"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Message Input Bar */}
              <div className="p-3 sm:p-4 border-t border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] flex-shrink-0">
                <form onSubmit={handleSendMessage} className="space-y-2">
                  {/* Safety & 30-Second Timeout Banner */}
                  {(timeoutSeconds > 0 || moderationAlert) && (
                    <div className="flex items-center gap-2.5 p-2.5 px-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in slide-in-from-bottom-1">
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[11px] leading-tight text-rose-300">
                          {moderationAlert || "Community Safety Restriction Active"}
                        </p>
                        {timeoutSeconds > 0 && (
                          <p className="text-[10px] text-rose-400/80 font-mono mt-0.5">
                            Cooldown active: {timeoutSeconds}s remaining before you can send new messages.
                          </p>
                        )}
                      </div>
                      {timeoutSeconds > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-500/25 border border-rose-500/40 text-rose-200 text-[11px] font-mono font-black">
                          {timeoutSeconds}s
                        </span>
                      )}
                    </div>
                  )}

                  {/* Quick Emoji Strip */}
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 text-xs">
                    <span className="text-[10px] text-[var(--muted-foreground)] font-semibold mr-1">
                      Quick React:
                    </span>
                    {COMMON_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          if (timeoutSeconds > 0) return;
                          setInputContent((prev) => prev + " " + emoji);
                          playPopSound();
                        }}
                        disabled={timeoutSeconds > 0}
                        className="px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-amber-500/20 text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Input field + Voice Recorder + Send button */}
                  <div className="flex items-center gap-2 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-1.5 pl-3.5 focus-within:border-amber-500/60 transition-all shadow-inner">
                    <input
                      type="text"
                      id="community-chat-input"
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      disabled={timeoutSeconds > 0}
                      placeholder={
                        timeoutSeconds > 0
                          ? `Safety timeout: Cooldown ${timeoutSeconds}s remaining...`
                          : `Message #${activeRoom.name} as ${resolvedName}...`
                      }
                      className="flex-1 bg-transparent text-xs sm:text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none disabled:opacity-50"
                    />

                    <VoiceRecorder onSendVoice={handleSendVoice} disabled={timeoutSeconds > 0} />

                    <button
                      type="submit"
                      disabled={!inputContent.trim() || timeoutSeconds > 0}
                      className="p-2 sm:px-4 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-black font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-xs active:scale-95 flex-shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inbuilt Microphone Access Modal for Any Browser */}
      <MicrophonePermissionModal
        isOpen={isMicModalOpen}
        onClose={() => setIsMicModalOpen(false)}
      />
    </div>
  );
}
