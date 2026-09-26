"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  MessageSquare,
  Pin,
  Trash2,
  Edit3,
  Search,
  Filter,
  Volume2,
  Megaphone,
  User,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Check,
  X,
  ExternalLink,
  Crown,
  Film,
  Hash,
  AlertTriangle,
  Play,
  RotateCcw,
} from "lucide-react";
import { CommunityMessageRow } from "@/types/database";
import { VoiceMessagePlayer } from "@/components/community/voice-message-player";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

interface CommunityManagerProps {
  initialMessages: CommunityMessageRow[];
  initialStats: {
    totalMessages: number;
    messagesToday: number;
    voiceNotesCount: number;
    pinnedCount: number;
  };
}

const ROOM_OPTIONS = [
  { id: "all", name: "All Channels", icon: Hash },
  { id: "general-tech", name: "#general-tech", icon: Hash },
  { id: "movies-cinema", name: "#movies-cinema", icon: Film },
  { id: "vip-lounge", name: "#vip-lounge", icon: Crown },
];

export function CommunityManager({
  initialMessages,
  initialStats,
}: CommunityManagerProps) {
  const { showToast, confirm } = useToast();
  const supabase = createClient();

  const [messages, setMessages] = useState<CommunityMessageRow[]>(initialMessages);
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string>("all");
  const [activeType, setActiveType] = useState<string>("all");
  const [activePinned, setActivePinned] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Broadcast modal state
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastRoom, setBroadcastRoom] = useState("general-tech");
  const [broadcastContent, setBroadcastContent] = useState("");
  const [broadcastPin, setBroadcastPin] = useState(true);
  const [broadcastRole, setBroadcastRole] = useState("FOUNDER");
  const [isSubmittingBroadcast, setIsSubmittingBroadcast] = useState(false);

  // Edit Message Modal state
  const [editingMsg, setEditingMsg] = useState<CommunityMessageRow | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editPinned, setEditPinned] = useState(false);
  const [editRole, setEditRole] = useState("MEMBER");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Refetch messages from API
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeRoom !== "all") params.set("room", activeRoom);
      if (activeType !== "all") params.set("type", activeType);
      if (activePinned !== "all") params.set("pinned", activePinned);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("limit", "100");

      const res = await fetch(`/api/admin/community?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        showToast({ message: data.error || "Failed to fetch messages", type: "error" });
      }
    } catch {
      showToast({ message: "Network error while loading messages", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [activeRoom, activeType, activePinned]);

  // Connect to Supabase Realtime channel to reflect changes live
  useEffect(() => {
    const channel = supabase
      .channel("nammatech-community-global")
      .on("broadcast", { event: "new-message" }, () => {
        fetchMessages();
      })
      .on("broadcast", { event: "delete-message" }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMessages();
  };

  // Toggle Pin Status
  const handleTogglePin = async (msg: CommunityMessageRow) => {
    const newStatus = !msg.is_pinned;
    try {
      const res = await fetch("/api/admin/community", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: msg.id,
          isPinned: newStatus,
        }),
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, is_pinned: newStatus } : m))
        );
        showToast({
          message: newStatus ? "Message pinned to top" : "Message unpinned",
          type: "success",
        });

        // Broadcast pin update to clients
        const channel = supabase.channel("nammatech-community-global");
        channel.send({
          type: "broadcast",
          event: "update-message",
          payload: { messageId: msg.id, roomId: msg.room_id, isPinned: newStatus },
        });
      } else {
        const data = await res.json();
        showToast({ message: data.error || "Failed to update pin status", type: "error" });
      }
    } catch {
      showToast({ message: "Network error", type: "error" });
    }
  };

  // Delete Message
  const handleDeleteMessage = (msg: CommunityMessageRow) => {
    confirm({
      title: "Delete Community Message?",
      message: `Delete message by "${msg.sender_name}"? This action is permanent and will remove it from the chat database.`,
      confirmText: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/community?id=${msg.id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            setMessages((prev) => prev.filter((m) => m.id !== msg.id));
            setStats((prev) => ({
              ...prev,
              totalMessages: Math.max(0, prev.totalMessages - 1),
              voiceNotesCount:
                msg.message_type === "voice"
                  ? Math.max(0, prev.voiceNotesCount - 1)
                  : prev.voiceNotesCount,
            }));
            showToast({ message: "Message deleted successfully", type: "success" });

            // Broadcast to clients
            const channel = supabase.channel("nammatech-community-global");
            channel.send({
              type: "broadcast",
              event: "delete-message",
              payload: { messageId: msg.id, roomId: msg.room_id },
            });
          } else {
            const data = await res.json();
            showToast({ message: data.error || "Failed to delete message", type: "error" });
          }
        } catch {
          showToast({ message: "Network error while deleting", type: "error" });
        }
      },
    });
  };

  // Open Edit Modal
  const openEditModal = (msg: CommunityMessageRow) => {
    setEditingMsg(msg);
    setEditContent(msg.content);
    setEditPinned(msg.is_pinned);
    setEditRole(msg.sender_role || "MEMBER");
  };

  // Save Edit
  const handleSaveEdit = async () => {
    if (!editingMsg) return;
    if (!editContent.trim()) {
      showToast({ message: "Message content cannot be empty", type: "error" });
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await fetch("/api/admin/community", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingMsg.id,
          content: editContent.trim(),
          isPinned: editPinned,
          senderRole: editRole,
        }),
      });

      if (res.ok) {
        const { message: updated } = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === editingMsg.id ? { ...m, ...updated } : m))
        );
        showToast({ message: "Message updated successfully", type: "success" });

        // Broadcast edit to clients
        const channel = supabase.channel("nammatech-community-global");
        channel.send({
          type: "broadcast",
          event: "update-message",
          payload: {
            messageId: editingMsg.id,
            roomId: editingMsg.room_id,
            content: editContent.trim(),
            isPinned: editPinned,
            senderRole: editRole,
          },
        });

        setEditingMsg(null);
      } else {
        const data = await res.json();
        showToast({ message: data.error || "Failed to update message", type: "error" });
      }
    } catch {
      showToast({ message: "Network error", type: "error" });
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Submit Official Broadcast
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastContent.trim()) {
      showToast({ message: "Broadcast message cannot be empty", type: "error" });
      return;
    }

    setIsSubmittingBroadcast(true);
    try {
      const res = await fetch("/api/admin/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: broadcastRoom,
          content: broadcastContent.trim(),
          isPinned: broadcastPin,
          broadcastRole: broadcastRole,
        }),
      });

      if (res.ok) {
        const { message: newMsg } = await res.json();
        showToast({ message: "Official Announcement posted successfully!", type: "success" });

        // Broadcast to clients
        if (newMsg) {
          const channel = supabase.channel("nammatech-community-global");
          channel.send({
            type: "broadcast",
            event: "new-message",
            payload: {
              id: newMsg.id,
              roomId: newMsg.room_id,
              senderId: newMsg.sender_id,
              senderName: newMsg.sender_name,
              senderAvatar: newMsg.sender_avatar,
              senderRole: newMsg.sender_role,
              content: newMsg.content,
              timestamp: Number(newMsg.timestamp),
              reactions: newMsg.reactions || {},
              isPinned: newMsg.is_pinned,
              messageType: "text",
            },
          });
        }

        setBroadcastContent("");
        setIsBroadcastOpen(false);
        fetchMessages();
      } else {
        const data = await res.json();
        showToast({ message: data.error || "Failed to post announcement", type: "error" });
      }
    } catch {
      showToast({ message: "Network error", type: "error" });
    } finally {
      setIsSubmittingBroadcast(false);
    }
  };

  // Clear Room
  const handleClearRoom = (roomId: string) => {
    const roomLabel = ROOM_OPTIONS.find((r) => r.id === roomId)?.name || roomId;
    confirm({
      title: `Clear ${roomLabel}?`,
      message: `DANGER: Are you sure you want to clear ALL messages in ${roomLabel}? This will remove all chats and voice recordings in this channel.`,
      confirmText: "Clear Channel",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/community?clearRoomId=${roomId}`, {
            method: "DELETE",
          });

          if (res.ok) {
            showToast({ message: `Cleared channel ${roomLabel}`, type: "success" });
            fetchMessages();

            // Broadcast to clients
            const channel = supabase.channel("nammatech-community-global");
            channel.send({
              type: "broadcast",
              event: "clear-room",
              payload: { roomId },
            });
          } else {
            const data = await res.json();
            showToast({ message: data.error || "Failed to clear channel", type: "error" });
          }
        } catch {
          showToast({ message: "Network error", type: "error" });
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Top Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Total Messages
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-mono">
            {stats.totalMessages}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Stored in SQL Database</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Sent Today
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {stats.messagesToday}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Live active engagement</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Voice Notes
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
              <Volume2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
            {stats.voiceNotesCount}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">WebM &amp; Audio recordings</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Pinned Notice
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <Pin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {stats.pinnedCount}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Featured at channel top</p>
        </div>
      </div>

      {/* ── Action Toolbar & Filters ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Channel selector chips */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
            {ROOM_OPTIONS.map((room) => {
              const Icon = room.icon;
              const isActive = activeRoom === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? "bg-amber-500 text-neutral-950 font-bold shadow-xs shadow-amber-500/20"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{room.name}</span>
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBroadcastOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-bold text-xs flex items-center gap-1.5 hover:opacity-95 transition-opacity shadow-xs cursor-pointer"
            >
              <Megaphone className="w-4 h-4" />
              <span>Post Announcement</span>
            </button>

            {activeRoom !== "all" && (
              <button
                onClick={() => handleClearRoom(activeRoom)}
                className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold hover:bg-rose-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Clear current channel messages"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear Channel</span>
              </button>
            )}

            <button
              onClick={fetchMessages}
              disabled={loading}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Refresh messages"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Secondary filters: Type, Pin, Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={activeType}
              onChange={(e) => setActiveType(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium border border-neutral-200 dark:border-neutral-700 focus:outline-hidden"
            >
              <option value="all">All Types (Text &amp; Voice)</option>
              <option value="text">Text Messages Only</option>
              <option value="voice">Voice Notes Only</option>
            </select>

            <select
              value={activePinned}
              onChange={(e) => setActivePinned(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium border border-neutral-200 dark:border-neutral-700 focus:outline-hidden"
            >
              <option value="all">All Messages</option>
              <option value="pinned">Pinned Only 📌</option>
            </select>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search author or message content..."
              className="w-full pl-8 pr-16 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 border border-neutral-200 dark:border-neutral-700 focus:outline-hidden focus:border-amber-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  fetchMessages();
                }}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 cursor-pointer"
            >
              Go
            </button>
          </form>
        </div>
      </div>

      {/* ── Messages Moderation Feed & Table ── */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
              Community Hub Chat History
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              {messages.length} displayed
            </span>
          </div>
          <span className="text-[11px] text-neutral-400">
            Realtime DB sync enabled
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
            <p className="text-xs text-neutral-500">Loading messages from SQL database...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              No Messages Found
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              No chat messages match your current channel or search filters. Post an announcement or check back later!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {messages.map((msg) => {
              const isVoice = msg.message_type === "voice";
              const isPinned = msg.is_pinned;
              const formattedDate = new Date(Number(msg.timestamp)).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={msg.id}
                  className={`p-4 sm:p-5 transition-colors hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isPinned ? "bg-amber-500/5 border-l-4 border-l-amber-500" : ""
                  }`}
                >
                  {/* Left Column: Author + Content */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {msg.sender_avatar ? (
                        <Image
                          src={msg.sender_avatar}
                          alt={msg.sender_name}
                          width={38}
                          height={38}
                          className="rounded-xl object-cover border border-black/10 dark:border-white/10"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-700 dark:text-neutral-200 uppercase">
                          {msg.sender_name.slice(0, 2)}
                        </div>
                      )}

                      {/* Online dot or Pin badge */}
                      {isPinned && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-neutral-950 flex items-center justify-center text-[9px] shadow-xs">
                          📌
                        </span>
                      )}
                    </div>

                    {/* Metadata & Message Content */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {msg.sender_name}
                        </span>

                        {/* Role Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            msg.sender_role === "FOUNDER"
                              ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                              : msg.sender_role === "ADMIN"
                              ? "bg-rose-500/20 text-rose-500 border border-rose-500/30"
                              : msg.sender_role === "VIP"
                              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                          }`}
                        >
                          {msg.sender_role}
                        </span>

                        {/* Room Badge */}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                          #{msg.room_id}
                        </span>

                        {/* Date */}
                        <span className="text-[11px] text-neutral-400">
                          {formattedDate}
                        </span>

                        {isPinned && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" /> Pinned
                          </span>
                        )}
                      </div>

                      {/* Message Content Render */}
                      {isVoice && msg.voice_data?.audioUrl ? (
                        <div className="pt-1 max-w-sm">
                          <VoiceMessagePlayer
                            audioUrl={msg.voice_data.audioUrl}
                            duration={msg.voice_data.duration || 0}
                            isCurrentUser={false}
                          />
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed break-words whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      )}

                      {/* Reactions Pill Display */}
                      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {Object.entries(msg.reactions).map(([emoji, users]) => {
                            if (!Array.isArray(users) || users.length === 0) return null;
                            return (
                              <span
                                key={emoji}
                                className="px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/60 text-[11px] text-neutral-700 dark:text-neutral-300 flex items-center gap-1"
                              >
                                <span>{emoji}</span>
                                <span className="font-mono font-bold text-[10px]">{users.length}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions (Edit, Pin, Delete) */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handleTogglePin(msg)}
                      className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isPinned
                          ? "bg-amber-500/20 text-amber-600 border-amber-500/40 hover:bg-amber-500/30"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white border-transparent"
                      }`}
                      title={isPinned ? "Unpin message" : "Pin message to top"}
                    >
                      <Pin className={`w-3.5 h-3.5 ${isPinned ? "fill-amber-500" : ""}`} />
                    </button>

                    <button
                      onClick={() => openEditModal(msg)}
                      className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                      title="Edit message content"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteMessage(msg)}
                      className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                      title="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal: Post Official Announcement ── */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Post Community Announcement
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Broadcast an official notice directly to community members &amp; guests.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBroadcastOpen(false)}
                className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Target Channel
                </label>
                <select
                  value={broadcastRoom}
                  onChange={(e) => setBroadcastRoom(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 focus:outline-hidden"
                >
                  <option value="general-tech">#general-tech (General Tech &amp; AI)</option>
                  <option value="movies-cinema">#movies-cinema (Cinema &amp; 4K Lounge)</option>
                  <option value="vip-lounge">#vip-lounge (VIP Direct Lounge)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Announcement Badge / Authority
                </label>
                <select
                  value={broadcastRole}
                  onChange={(e) => setBroadcastRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 focus:outline-hidden"
                >
                  <option value="FOUNDER">👑 FOUNDER (Muthuraj C)</option>
                  <option value="ADMIN">🛡️ ADMIN (Official NammaTech Team)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Announcement Message Content
                </label>
                <textarea
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  rows={4}
                  placeholder="Type official community news, update, maintenance alert, or guidelines..."
                  className="w-full p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 focus:outline-hidden focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="broadcastPin"
                  checked={broadcastPin}
                  onChange={(e) => setBroadcastPin(e.target.checked)}
                  className="rounded border-neutral-300 text-amber-500 focus:ring-amber-500"
                />
                <label
                  htmlFor="broadcastPin"
                  className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  Pin this announcement to top of the channel 📌
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBroadcast}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 text-xs font-bold flex items-center gap-1.5 hover:opacity-95 shadow-xs"
                >
                  {isSubmittingBroadcast ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Broadcasting...</span>
                    </>
                  ) : (
                    <>
                      <Megaphone className="w-3.5 h-3.5" />
                      <span>Post Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Message Content ── */}
      {editingMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Edit Community Message
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Author: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{editingMsg.sender_name}</span> (#{editingMsg.room_id})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingMsg(null)}
                className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Message Content
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 focus:outline-hidden focus:border-amber-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Sender Role Label
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 focus:outline-hidden"
                >
                  <option value="MEMBER">MEMBER</option>
                  <option value="VIP">VIP</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="FOUNDER">FOUNDER</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editPin"
                  checked={editPinned}
                  onChange={(e) => setEditPinned(e.target.checked)}
                  className="rounded border-neutral-300 text-amber-500 focus:ring-amber-500"
                />
                <label
                  htmlFor="editPin"
                  className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  Pin this message to the top of #{editingMsg.room_id} 📌
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMsg(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 text-xs font-bold flex items-center gap-1.5 hover:opacity-95 shadow-xs"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
