"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Trash2,
  CheckCircle2,
  MessageSquare,
  Zap,
  Headphones,
  Send,
  Code,
  Terminal,
  Volume2,
  VolumeX,
  Sparkles,
  Search,
  ExternalLink,
  Check,
  CheckCheck,
  Clock,
  User,
  ShieldCheck,
  RotateCcw,
  Copy,
} from "lucide-react";
import type { ContactMessage } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { chatAudio } from "@/lib/support/chat-audio";
import type { SupportSession, SupportMessage } from "@/lib/support/support-chat-store";

const CANNED_RESPONSES = [
  {
    title: "👋 Greeting & Welcome",
    text: "Hello! Thank you for contacting NammaTech Technical Support. How can I assist you with your setup or resource today?",
  },
  {
    title: "🛡️ Windows Defender False Positive",
    text: "This is a standard false positive due to modified game/software binaries. Please add the installation folder to your Windows Defender exclusions list, then run the installer again as Administrator.",
  },
  {
    title: "⚙️ Run as Administrator",
    text: "Please right-click the setup file and select 'Run as Administrator'. Also make sure you have the DirectX and Visual C++ 2015-2022 runtimes installed.",
  },
  {
    title: "👑 VIP Direct Mirror Link",
    text: "Here is your verified high-speed VIP Google Drive mirror. This link bypasses daily bandwidth caps and is active for 24 hours.",
  },
  {
    title: "💻 Request Error / Log",
    text: "Could you copy and paste the exact error code or terminal crash log using the Code button below? That will help us pinpoint the missing DLL or dependency immediately.",
  },
  {
    title: "✅ Issue Resolved",
    text: "Awesome! We have marked this support inquiry as resolved. Feel free to ping anytime if you encounter any other problems. Have a great day!",
  },
];

export function MessagesClient({ initialMessages }: { initialMessages: ContactMessage[] }) {
  const router = useRouter();
  const { showToast, confirm } = useToast();

  // Top mode: Live Support Desk vs Email Inquiries
  const [hubMode, setHubMode] = useState<"LIVE_SUPPORT" | "EMAIL_INBOX">("LIVE_SUPPORT");

  // ── Live Support State ───────────────────────────────────────────────────────
  const [liveSessions, setLiveSessions] = useState<SupportSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionSearch, setSessionSearch] = useState<string>("");
  const [sessionFilter, setSessionFilter] = useState<"ALL" | "ACTIVE" | "RESOLVED">("ALL");

  const [adminReplyText, setAdminReplyText] = useState<string>("");
  const [adminCodeSnippet, setAdminCodeSnippet] = useState<string>("");
  const [showCodeBox, setShowCodeBox] = useState<boolean>(false);
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevSessionsRef = useRef<Map<string, number>>(new Map());
  const adminTypingTimeoutRef = useRef<any>(null);

  // ── Email Inquiries State ───────────────────────────────────────────────────
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [emailTab, setEmailTab] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [emailSearchQuery, setEmailSearchQuery] = useState("");

  // ── Live Sessions Poller ────────────────────────────────────────────────────
  const fetchLiveSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/support/chat?all=true");
      if (res.ok) {
        const data = await res.json();
        const sessions: SupportSession[] = data.sessions || [];
        setLiveSessions(sessions);

        // Check for new incoming messages to trigger sound chime + toast alert
        let newMessagesFound = false;
        let latestSender = "";
        let latestSnippet = "";

        sessions.forEach((s) => {
          const prevCount = prevSessionsRef.current.get(s.id) || 0;
          const currCount = s.messages.length;

          if (prevCount > 0 && currCount > prevCount) {
            const lastMsg = s.messages[currCount - 1];
            if (lastMsg.sender === "user") {
              newMessagesFound = true;
              latestSender = s.userName;
              latestSnippet = lastMsg.text;
            }
          }
          prevSessionsRef.current.set(s.id, currCount);
        });

        if (newMessagesFound) {
          chatAudio.playIncoming();
          chatAudio.flashTitle(`🔔 New Live Message from ${latestSender}`);
          showToast({
            type: "info",
            title: `Live Support: ${latestSender}`,
            message: latestSnippet || "Sent a new message",
          });
        }

        // Auto-select first session if none selected
        if (!selectedSessionId && sessions.length > 0) {
          setSelectedSessionId(sessions[0].id);
        }
      }
    } catch {
      // network hiccup
    }
  }, [selectedSessionId, showToast]);

  useEffect(() => {
    fetchLiveSessions();
    const interval = setInterval(fetchLiveSessions, 1500);
    return () => clearInterval(interval);
  }, [fetchLiveSessions]);

  // Selected live session object
  const activeSession = liveSessions.find((s) => s.id === selectedSessionId) || null;

  // Mark admin read when selecting a session
  useEffect(() => {
    if (activeSession && activeSession.unreadAdminCount > 0) {
      fetch("/api/support/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSession.id,
          action: "read",
          reader: "admin",
        }),
      }).catch(() => {});
    }
  }, [activeSession]);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [activeSession?.messages?.length]);

  // Handle admin typing state
  const handleAdminInputChange = (val: string) => {
    setAdminReplyText(val);
    if (!activeSession) return;

    if (adminTypingTimeoutRef.current) clearTimeout(adminTypingTimeoutRef.current);

    fetch("/api/support/chat", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeSession.id,
        action: "typing",
        sender: "admin",
        isTyping: true,
      }),
    }).catch(() => {});

    adminTypingTimeoutRef.current = setTimeout(() => {
      fetch("/api/support/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSession.id,
          action: "typing",
          sender: "admin",
          isTyping: false,
        }),
      }).catch(() => {});
    }, 1800);
  };

  // Send admin reply
  const handleSendAdminReply = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : adminReplyText;
    if ((!textToSend.trim() && !adminCodeSnippet.trim()) || !activeSession || isSendingReply) {
      return;
    }

    setIsSendingReply(true);
    setAdminReplyText("");
    const code = adminCodeSnippet;
    setAdminCodeSnippet("");
    setShowCodeBox(false);

    chatAudio.playSent();

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSession.id,
          sender: "admin",
          senderName: "Support Team",
          text: textToSend.trim(),
          codeSnippet: code.trim() || undefined,
        }),
      });

      if (res.ok) {
        fetchLiveSessions();
      } else {
        showToast({ type: "error", message: "Failed to send reply" });
      }
    } catch {
      showToast({ type: "error", message: "Network error sending reply" });
    } finally {
      setIsSendingReply(false);
    }
  };

  // Update session status (Active, Waiting, Resolved)
  const handleUpdateSessionStatus = async (
    sessionId: string,
    status: "ACTIVE" | "WAITING" | "RESOLVED"
  ) => {
    try {
      await fetch("/api/support/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, action: "status", status }),
      });
      fetchLiveSessions();
      showToast({
        type: "success",
        message: `Session status set to ${status}`,
      });
    } catch {
      showToast({ type: "error", message: "Failed to update session status" });
    }
  };

  // Delete live session
  const handleDeleteSession = (sessionId: string) => {
    confirm({
      title: "Delete Support Session?",
      message: "Are you sure you want to delete this live chat session and history?",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/support/chat", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          });
          if (res.ok) {
            if (selectedSessionId === sessionId) {
              setSelectedSessionId(null);
            }
            fetchLiveSessions();
            showToast({ type: "success", message: "Support session removed" });
          }
        } catch {
          showToast({ type: "error", message: "Failed to delete session" });
        }
      },
    });
  };

  // Toggle reactions
  const handleAddReaction = async (sessionId: string, messageId: string, emoji: string) => {
    try {
      await fetch("/api/support/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          action: "reaction",
          messageId,
          emoji,
          userType: "admin",
        }),
      });
      fetchLiveSessions();
    } catch {
      // non-blocking
    }
  };

  // ── Email Inquiries Handlers ────────────────────────────────────────────────
  const updateEmailStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        showToast({ message: "Status updated", type: "success" });
        router.refresh();
      }
    } catch {
      showToast({ message: "Failed to update status", type: "error" });
    }
  };

  const handleDeleteEmail = (id: string) => {
    confirm({
      title: "Delete Message",
      message: "Are you sure you want to permanently delete this contact message?",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/messages", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          if (res.ok) {
            if (selectedMessage?.id === id) setSelectedMessage(null);
            showToast({ message: "Message deleted", type: "success" });
            router.refresh();
          }
        } catch {
          showToast({ message: "Failed to delete message", type: "error" });
        }
      },
    });
  };

  // Filtered live sessions
  const filteredSessions = liveSessions.filter((s) => {
    if (sessionFilter !== "ALL" && s.status !== sessionFilter) return false;
    if (sessionSearch.trim()) {
      const q = sessionSearch.toLowerCase();
      return (
        s.userName.toLowerCase().includes(q) ||
        (s.userEmail && s.userEmail.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q)) ||
        (s.lastMessage && s.lastMessage.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalLiveUnread = liveSessions.reduce((acc, s) => acc + (s.unreadAdminCount || 0), 0);
  const unreadEmailCount = initialMessages.filter((m) => m.status === "UNREAD").length;
  const readEmailCount = initialMessages.filter((m) => m.status === "READ").length;

  const filteredEmailMessages = initialMessages.filter((msg) => {
    if (emailTab === "UNREAD" && msg.status !== "UNREAD") return false;
    if (emailTab === "READ" && msg.status !== "READ") return false;
    if (emailSearchQuery.trim()) {
      const q = emailSearchQuery.toLowerCase();
      return (
        msg.name?.toLowerCase().includes(q) ||
        msg.email?.toLowerCase().includes(q) ||
        msg.subject?.toLowerCase().includes(q) ||
        msg.message?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── Top Hub Switcher ── */}
      <div className="flex items-center justify-between gap-4 p-2 rounded-2xl bg-neutral-950/80 border border-neutral-800">
        <div className="flex items-center gap-2">
          {/* Live Support Tab */}
          <button
            type="button"
            onClick={() => setHubMode("LIVE_SUPPORT")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              hubMode === "LIVE_SUPPORT"
                ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-neutral-950 font-black shadow-lg shadow-sky-500/20"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Zap className="w-4 h-4 fill-current" />
            <span>⚡ Live Support Desk</span>
            {totalLiveUnread > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-bounce">
                {totalLiveUnread} new
              </span>
            )}
            <span className="text-[10px] opacity-75">({liveSessions.length} active)</span>
          </button>

          {/* Email Inbox Tab */}
          <button
            type="button"
            onClick={() => setHubMode("EMAIL_INBOX")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
              hubMode === "EMAIL_INBOX"
                ? "bg-neutral-800 text-white shadow-md border border-neutral-700"
                : "text-neutral-400 hover:text-white hover:bg-neutral-900"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>📧 Contact Inquiries</span>
            {unreadEmailCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-sky-500/20 text-sky-400 border border-sky-500/30">
                {unreadEmailCount} unread
              </span>
            )}
          </button>
        </div>

        {/* Quick Tools */}
        <div className="flex items-center gap-2 pr-2">
          <button
            type="button"
            onClick={() => {
              const next = !isMuted;
              setIsMuted(next);
              chatAudio.setMuted(next);
              showToast({
                type: "info",
                message: next ? "Audio chime muted" : "Audio chime unmuted",
              });
            }}
            title={isMuted ? "Audio muted" : "Audio enabled"}
            className="p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {hubMode === "LIVE_SUPPORT" ? (
        /* ── SECTION 1: LIVE SUPPORT DESK (REALTIME 1-ON-1 CHAT) ── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[780px]">
          {/* Left Sessions Sidebar */}
          <div className="lg:col-span-4 rounded-3xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-xl flex flex-col overflow-hidden shadow-xl">
            {/* Sidebar Search & Status Filter */}
            <div className="p-3.5 border-b border-neutral-800 space-y-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  placeholder="Search user, issue, message..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto">
                {(["ALL", "ACTIVE", "RESOLVED"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSessionFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      sessionFilter === st
                        ? "bg-sky-500 text-neutral-950 font-black"
                        : "bg-neutral-950/60 text-neutral-400 hover:text-white border border-neutral-800/80"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/60">
              {filteredSessions.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-500 flex flex-col items-center">
                  <Headphones className="w-8 h-8 mb-2 opacity-30 text-sky-400" />
                  <p className="font-semibold text-neutral-400">No active live sessions</p>
                  <p className="text-[11px] text-neutral-600 mt-1">
                    When visitors click &apos;Connect to Live Support&apos;, they appear here in real-time.
                  </p>
                </div>
              ) : (
                filteredSessions.map((s) => {
                  const isSelected = selectedSessionId === s.id;
                  const hasUnread = s.unreadAdminCount > 0;
                  const lastMsgTime = new Date(s.updatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSessionId(s.id)}
                      className={`p-3.5 cursor-pointer transition-all text-xs relative ${
                        isSelected
                          ? "bg-sky-500/10 border-l-4 border-l-sky-400"
                          : "hover:bg-neutral-800/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              s.status === "ACTIVE"
                                ? "bg-emerald-400 animate-pulse"
                                : s.status === "RESOLVED"
                                ? "bg-neutral-600"
                                : "bg-amber-400"
                            }`}
                          />
                          <span
                            className={`font-bold truncate ${
                              hasUnread ? "text-white font-black" : "text-neutral-300"
                            }`}
                          >
                            {s.userName}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500 flex-shrink-0">
                          {lastMsgTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-neutral-800 text-sky-400 truncate max-w-[140px]">
                          {s.category || "General Support"}
                        </span>
                        {hasUnread && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white">
                            {s.unreadAdminCount} new
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                            s.status === "RESOLVED"
                              ? "bg-emerald-950 text-emerald-400"
                              : "bg-neutral-900 text-neutral-400"
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-400 line-clamp-1">
                        {s.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Main Chat Panel */}
          <div className="lg:col-span-8 rounded-3xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-xl flex flex-col overflow-hidden shadow-xl">
            {activeSession ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-neutral-800 bg-neutral-950/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-white truncate">
                          {activeSession.userName}
                        </h3>
                        {activeSession.userEmail && (
                          <span className="text-xs text-neutral-400 font-mono hidden sm:inline-block">
                            ({activeSession.userEmail})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-400">
                        <span className="text-sky-400 font-medium">
                          {activeSession.category || "General Support"}
                        </span>
                        <span>&bull;</span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          ID: {activeSession.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (Status dropdown, WhatsApp, Delete) */}
                  <div className="flex items-center gap-2">
                    {/* Status switcher */}
                    <select
                      value={activeSession.status}
                      onChange={(e) =>
                        handleUpdateSessionStatus(activeSession.id, e.target.value as any)
                      }
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-900 border border-neutral-700 text-white focus:outline-none cursor-pointer"
                    >
                      <option value="ACTIVE">⚡ ACTIVE</option>
                      <option value="WAITING">⏳ WAITING</option>
                      <option value="RESOLVED">✅ RESOLVED</option>
                    </select>

                    {/* WhatsApp Redirect Button */}
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Hi ${activeSession.userName}, regarding your NammaTech support inquiry on ${activeSession.category}:`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
                      title="Continue on WhatsApp"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* Delete Session */}
                    <button
                      type="button"
                      onClick={() => handleDeleteSession(activeSession.id)}
                      className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-neutral-950/40">
                  {activeSession.messages.map((msg: SupportMessage) => {
                    const isUser = msg.sender === "user";
                    const isSystem = msg.sender === "system";
                    const timeString = new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center my-2">
                          <div className="px-3.5 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-[11px] text-neutral-400 flex items-center gap-1.5 shadow-sm">
                            <Sparkles className="w-3 h-3 text-sky-400" />
                            <span>{msg.text}</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col group ${isUser ? "items-start" : "items-end"}`}
                      >
                        {/* Sender Label */}
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-neutral-400">
                          <span className="font-semibold text-neutral-300">
                            {isUser ? activeSession.userName : "Support Specialist"}
                          </span>
                          <span>&bull;</span>
                          <span>{timeString}</span>
                        </div>

                        {/* Bubble */}
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-md relative ${
                            isUser
                              ? "bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-tl-xs"
                              : "bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-xs"
                          }`}
                        >
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line break-words font-sans">
                            {msg.text}
                          </p>

                          {/* Code Snippet Box */}
                          {msg.codeSnippet && (
                            <div className="mt-2.5 rounded-xl bg-black/90 border border-neutral-800 p-2.5 font-mono text-xs overflow-x-auto text-neutral-200">
                              <div className="flex items-center justify-between text-[10px] text-neutral-400 border-b border-neutral-800 pb-1 mb-1.5">
                                <span className="flex items-center gap-1 text-sky-400">
                                  <Terminal className="w-3 h-3" />
                                  Code / Error Logs
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (navigator.clipboard) {
                                      navigator.clipboard.writeText(msg.codeSnippet || "");
                                      showToast({ message: "Snippet copied", type: "success" });
                                    }
                                  }}
                                  className="hover:text-white flex items-center gap-1 cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </button>
                              </div>
                              <pre className="text-[11px] leading-snug whitespace-pre-wrap">
                                {msg.codeSnippet}
                              </pre>
                            </div>
                          )}

                          {/* Admin read receipt icon */}
                          {!isUser && (
                            <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-sky-200">
                              <CheckCheck className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        {/* Reactions Bar */}
                        <div className="flex items-center gap-1 mt-1 px-1">
                          {msg.reactions &&
                            Object.entries(msg.reactions).map(([emoji, senders]) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleAddReaction(activeSession.id, msg.id, emoji)}
                                className={`px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1 border transition-all cursor-pointer ${
                                  senders.includes("admin")
                                    ? "bg-sky-500/20 border-sky-500 text-white"
                                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                                }`}
                              >
                                <span>{emoji}</span>
                                <span className="font-bold">{senders.length}</span>
                              </button>
                            ))}

                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            {["👍", "❤️", "🔥", "🚀"].map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleAddReaction(activeSession.id, msg.id, emoji)}
                                className="w-5 h-5 rounded hover:bg-neutral-800 text-xs flex items-center justify-center transition-colors cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* User Typing Indicator */}
                  {activeSession.isUserTyping && (
                    <div className="flex items-center gap-2 text-xs text-neutral-400 p-2">
                      <div className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-1.5">
                        <span className="font-semibold text-white">{activeSession.userName}</span>{" "}
                        is typing
                        <span className="inline-flex gap-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" />
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Canned Responses Toolbar */}
                <div className="px-4 py-2 border-t border-neutral-800 bg-neutral-950/80 overflow-x-auto flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 whitespace-nowrap flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    Presets:
                  </span>
                  {CANNED_RESPONSES.map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => handleSendAdminReply(preset.text)}
                      className="px-2.5 py-1 rounded-xl text-xs bg-neutral-900 hover:bg-sky-500/20 hover:text-sky-300 text-neutral-300 border border-neutral-800 whitespace-nowrap transition-all cursor-pointer"
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>

                {/* Code Snippet Box */}
                {showCodeBox && (
                  <div className="p-3 border-t border-neutral-800 bg-black text-neutral-200">
                    <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
                      <span className="flex items-center gap-1.5 font-bold text-sky-400">
                        <Terminal className="w-3.5 h-3.5" />
                        Send Command / Registry Fix / Code
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowCodeBox(false)}
                        className="hover:text-white text-xs cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                    <textarea
                      value={adminCodeSnippet}
                      onChange={(e) => setAdminCodeSnippet(e.target.value)}
                      placeholder="e.g. reg add HKLM\SOFTWARE\Policies\Microsoft\Windows Defender /v DisableAntiSpyware /t REG_DWORD /d 1 /f"
                      rows={2}
                      className="w-full p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
                    />
                  </div>
                )}

                {/* Admin Message Input Bar */}
                <div className="p-3.5 border-t border-neutral-800 bg-neutral-950 flex items-end gap-2">
                  {/* Code box toggle */}
                  <button
                    type="button"
                    onClick={() => setShowCodeBox((prev) => !prev)}
                    title="Attach Code / Terminal command"
                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex-shrink-0 ${
                      showCodeBox
                        ? "bg-sky-500/20 border-sky-500 text-sky-400"
                        : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
                    }`}
                  >
                    <Code className="w-4 h-4" />
                  </button>

                  {/* Textarea */}
                  <div className="flex-1">
                    <textarea
                      value={adminReplyText}
                      onChange={(e) => handleAdminInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendAdminReply();
                        }
                      }}
                      placeholder={`Reply to ${activeSession.userName}... (Enter to send, Shift+Enter for newline)`}
                      rows={1}
                      className="w-full px-4 py-2.5 rounded-2xl border border-neutral-800 bg-neutral-900 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none max-h-28"
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={() => handleSendAdminReply()}
                    disabled={
                      (!adminReplyText.trim() && !adminCodeSnippet.trim()) || isSendingReply
                    }
                    className="p-3 rounded-2xl bg-sky-500 text-neutral-950 font-bold hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-sky-500/20 flex-shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-neutral-500">
                <Headphones className="w-12 h-12 text-neutral-600 mb-3" />
                <p className="font-bold text-neutral-300 mb-1">Select a Live Session</p>
                <p className="text-xs text-neutral-500 max-w-sm">
                  Click on any visitor conversation on the left panel to begin real-time technical
                  troubleshooting.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── SECTION 2: EMAIL INBOX (CONTACT FORM SUBMISSIONS) ── */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "ALL", label: "All Inquiries", count: initialMessages.length },
                { id: "UNREAD", label: "Unread", count: unreadEmailCount },
                { id: "READ", label: "Read / Resolved", count: readEmailCount },
              ].map((tab) => {
                const isActive = emailTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setEmailTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                      isActive
                        ? "bg-sky-500 text-neutral-950 shadow-md shadow-sky-500/20"
                        : "bg-neutral-900/60 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? "bg-neutral-950 text-sky-400" : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:w-72">
              <input
                type="text"
                value={emailSearchQuery}
                onChange={(e) => setEmailSearchQuery(e.target.value)}
                placeholder="Search sender, email, subject..."
                className="w-full pl-4 pr-10 py-2 rounded-xl border border-neutral-800 bg-neutral-900/60 text-xs text-white placeholder-neutral-500 focus:ring-1 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {initialMessages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* List */}
              <div className="md:col-span-1 rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl divide-y divide-neutral-800/60 overflow-hidden shadow-xl max-h-[700px] overflow-y-auto">
                {filteredEmailMessages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-500">
                    No inquiries matched your filter.
                  </div>
                ) : (
                  filteredEmailMessages.map((msg) => {
                    const isSelected = selectedMessage?.id === msg.id;
                    const isUnread = msg.status === "UNREAD";
                    return (
                      <div
                        key={msg.id}
                        onClick={() => {
                          setSelectedMessage(msg);
                          if (msg.status === "UNREAD") updateEmailStatus(msg.id, "READ");
                        }}
                        className={`p-4 cursor-pointer transition-all text-xs relative ${
                          isSelected
                            ? "bg-sky-500/10 border-l-4 border-l-sky-400"
                            : "hover:bg-neutral-800/30"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse flex-shrink-0" />
                            )}
                            <span
                              className={`font-semibold truncate ${
                                isUnread ? "text-white font-bold" : "text-neutral-300"
                              }`}
                            >
                              {msg.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-neutral-500 flex-shrink-0 ml-2">
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                        <p
                          className={`truncate mb-1 text-xs ${
                            isUnread ? "text-sky-300 font-semibold" : "text-neutral-300"
                          }`}
                        >
                          {msg.subject}
                        </p>
                        <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                          {msg.message}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected Message Viewer */}
              <div className="md:col-span-2 rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl p-6 shadow-xl relative">
                {selectedMessage ? (
                  <div className="space-y-6 text-xs">
                    <div className="flex items-start justify-between border-b border-neutral-800 pb-5">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1.5 tracking-tight">
                          {selectedMessage.subject}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-neutral-400 text-xs">
                          <span>
                            From: <strong className="text-white">{selectedMessage.name}</strong>
                          </span>
                          <span>&bull;</span>
                          <span className="font-mono text-neutral-400">
                            {selectedMessage.email}
                          </span>
                          <span>&bull;</span>
                          <span>{formatDate(selectedMessage.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteEmail(selectedMessage.id)}
                          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors border border-rose-500/20 cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 text-sm text-neutral-200 leading-relaxed whitespace-pre-line font-sans shadow-inner">
                      {selectedMessage.message}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <a
                        href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                          selectedMessage.subject
                        )}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-neutral-950 font-bold hover:bg-sky-400 shadow-md shadow-sky-500/20 transition-all text-xs"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Reply via Email</span>
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          updateEmailStatus(
                            selectedMessage.id,
                            selectedMessage.status === "READ" ? "UNREAD" : "READ"
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:text-white hover:border-neutral-700 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>
                          Mark as {selectedMessage.status === "READ" ? "Unread" : "Read"}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-16 text-center text-xs text-neutral-500 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-800/50 flex items-center justify-center text-neutral-400 mb-3 border border-neutral-700/50">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-neutral-300 mb-1">No inquiry selected</p>
                    <p className="text-neutral-500 max-w-xs">
                      Select any submission on the left panel to inspect details and respond.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Mail}
              title="Inbox is empty"
              description="Zero customer inquiries received so far. When visitors submit inquiries on the public contact form, they will appear here."
            />
          )}
        </div>
      )}
    </div>
  );
}
