"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  Send,
  Sparkles,
  ShieldCheck,
  Headphones,
  Check,
  CheckCheck,
  Code,
  Smile,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  Copy,
  Star,
  Zap,
  Terminal,
  ChevronDown,
  Info,
  ExternalLink,
  Bot,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { chatAudio } from "@/lib/support/chat-audio";
import { useToast } from "@/components/ui/toast";
import type { SupportSession, SupportMessage } from "@/lib/support/support-chat-store";

const ISSUE_CATEGORIES = [
  { id: "Software Installation", label: "Software Installation", icon: "🛠️" },
  { id: "Game Crash / Error", label: "Game Crash / Error", icon: "🎮" },
  { id: "Broken Download Link", label: "Broken Download Link", icon: "🔗" },
  { id: "VIP Access & Activation", label: "VIP Access & Billing", icon: "👑" },
  { id: "Software Request", label: "Software Request", icon: "💡" },
  { id: "General Inquiry", label: "General Inquiry", icon: "⚡" },
];

const QUICK_PROMPTS = [
  "Where can I find the archive/ZIP password?",
  "Windows Defender blocked the setup. Is it safe?",
  "The download link expired or is stuck at 99%.",
  "How do I activate VIP high-speed Google Drive access?",
  "Do you have a video tutorial for this software?",
];

const QUICK_EMOJIS = ["👍", "🔥", "❤️", "🚀", "💻", "⚡", "🙏", "🎉", "💯", "🤝"];

const STORAGE_SESSION_KEY = "nammatech_support_session_id_v2";

export function LiveSupportChat() {
  const { user, profile } = useAuth();
  const { showToast, confirm } = useToast();

  // Session state
  const [sessionId, setSessionId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [category, setCategory] = useState<string>("Software Installation");
  const [hasJoined, setHasJoined] = useState<boolean>(false);

  // Chat data state
  const [session, setSession] = useState<SupportSession | null>(null);
  const [inputText, setInputText] = useState<string>("");
  const [codeSnippet, setCodeSnippet] = useState<string>("");
  const [showCodeInput, setShowCodeInput] = useState<boolean>(false);
  const [showEmojiBar, setShowEmojiBar] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [ratingFeedback, setRatingFeedback] = useState<string>("");
  const [hasRated, setHasRated] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<any>(null);
  const lastKnownMessageCountRef = useRef<number>(0);
  const typingTimeoutRef = useRef<any>(null);

  // Initialize identity from auth or localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedSessionId = localStorage.getItem(STORAGE_SESSION_KEY);
    const savedName = localStorage.getItem("nammatech_support_username");
    const savedEmail = localStorage.getItem("nammatech_support_email");
    const savedCat = localStorage.getItem("nammatech_support_category");

    const defaultName =
      profile?.full_name ||
      (user?.user_metadata as any)?.full_name ||
      user?.email?.split("@")[0] ||
      savedName ||
      "";
    const defaultEmail = user?.email || savedEmail || "";

    setUserName(defaultName);
    setUserEmail(defaultEmail);
    if (savedCat) setCategory(savedCat);

    if (savedSessionId) {
      setSessionId(savedSessionId);
      setHasJoined(true);
    }
  }, [user, profile]);

  // Scroll to bottom helper
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    }
  }, []);

  // Poll chat session
  const fetchSession = useCallback(
    async (sid: string, silent = false) => {
      if (!sid) return;
      try {
        const res = await fetch(`/api/support/chat?sessionId=${encodeURIComponent(sid)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.session) {
            const currentCount = data.session.messages.length;
            const previousCount = lastKnownMessageCountRef.current;

            // Check if a new message from admin arrived
            if (previousCount > 0 && currentCount > previousCount) {
              const latestMessage = data.session.messages[currentCount - 1];
              if (latestMessage.sender === "admin") {
                // Trigger audio chime
                chatAudio.playIncoming();
                // Alert tab title
                chatAudio.flashTitle(`🔔 Support: ${latestMessage.senderName} replied!`);
                // Visual toast
                showToast({
                  type: "info",
                  title: `Support Agent (${latestMessage.senderName})`,
                  message: latestMessage.text || "Sent a code/instruction snippet",
                });
              }
            }

            lastKnownMessageCountRef.current = currentCount;
            setSession(data.session);

            // Mark user read
            if (data.session.unreadUserCount > 0) {
              fetch("/api/support/chat", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId: sid, action: "read", reader: "user" }),
              }).catch(() => {});
            }
          }
        }
      } catch {
        // network hiccup, retry next tick
      }
    },
    [showToast]
  );

  // Polling loop when joined
  useEffect(() => {
    if (!hasJoined || !sessionId) return;

    fetchSession(sessionId, true);
    scrollToBottom(false);

    pollIntervalRef.current = setInterval(() => {
      fetchSession(sessionId, true);
    }, 1200);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [hasJoined, sessionId, fetchSession, scrollToBottom]);

  // Auto scroll when messages change
  useEffect(() => {
    if (session?.messages?.length) {
      scrollToBottom(true);
    }
  }, [session?.messages?.length, scrollToBottom]);

  // Handle typing state
  const handleInputChange = (val: string) => {
    setInputText(val);

    if (!sessionId) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    fetch("/api/support/chat", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, action: "typing", sender: "user", isTyping: true }),
    }).catch(() => {});

    typingTimeoutRef.current = setTimeout(() => {
      fetch("/api/support/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, action: "typing", sender: "user", isTyping: false }),
      }).catch(() => {});
    }, 1800);
  };

  // Start chat session
  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = userName.trim() || "Guest Specialist";
    const newSid = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    setSessionId(newSid);
    setHasJoined(true);

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_SESSION_KEY, newSid);
      localStorage.setItem("nammatech_support_username", finalName);
      if (userEmail) localStorage.setItem("nammatech_support_email", userEmail);
      localStorage.setItem("nammatech_support_category", category);
    }

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: newSid,
          userName: finalName,
          userEmail: userEmail.trim(),
          category,
          sender: "user",
          senderName: finalName,
          text: `👋 Started technical support session regarding: ${category}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
        lastKnownMessageCountRef.current = data.session?.messages?.length || 1;
        chatAudio.playSent();
        showToast({
          type: "success",
          title: "Connected to Live Support",
          message: "A support specialist has been alerted to your session.",
        });
      }
    } catch {
      showToast({
        type: "error",
        message: "Failed to initialize live chat session. Please retry.",
      });
    }
  };

  // Send message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : inputText;
    if ((!textToSend.trim() && !codeSnippet.trim()) || isSending) return;

    const activeSid = sessionId;
    if (!activeSid) return;

    setIsSending(true);
    setInputText("");
    const currentCode = codeSnippet;
    setCodeSnippet("");
    setShowCodeInput(false);

    // Optimistic message
    chatAudio.playSent();

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSid,
          userName: userName.trim() || "Guest",
          userEmail: userEmail.trim(),
          category,
          sender: "user",
          senderName: userName.trim() || "Guest",
          text: textToSend.trim(),
          codeSnippet: currentCode.trim() || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
        lastKnownMessageCountRef.current = data.session?.messages?.length || 0;
        scrollToBottom(true);
      } else {
        showToast({ type: "error", message: "Failed to send message. Please retry." });
      }
    } catch {
      showToast({ type: "error", message: "Network error sending message." });
    } finally {
      setIsSending(false);
    }
  };

  // Toggle reaction
  const handleReaction = async (messageId: string, emoji: string) => {
    if (!sessionId) return;
    try {
      await fetch("/api/support/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          action: "reaction",
          messageId,
          emoji,
          userType: "user",
        }),
      });
      fetchSession(sessionId, true);
    } catch {
      // non-blocking
    }
  };

  // Submit session rating
  const handleRateSession = async (rating: number) => {
    if (!sessionId) return;
    setUserRating(rating);
    try {
      await fetch("/api/support/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          action: "rate",
          rating,
          feedback: ratingFeedback.trim() || undefined,
        }),
      });
      setHasRated(true);
      showToast({
        type: "success",
        title: "Thank You!",
        message: "Your feedback helps us provide faster and better technical support.",
      });
    } catch {
      // non-blocking
    }
  };

  // Reset / Clear chat
  const handleResetChat = () => {
    confirm({
      title: "End Support Session?",
      message: "Are you sure you want to end this conversation and start a new support inquiry?",
      confirmText: "End & Reset",
      cancelText: "Stay in Chat",
      variant: "warning",
      onConfirm: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(STORAGE_SESSION_KEY);
        }
        setSessionId("");
        setSession(null);
        setHasJoined(false);
        lastKnownMessageCountRef.current = 0;
        showToast({ message: "Support session reset successfully", type: "info" });
      },
    });
  };

  // Copy or download transcript
  const handleExportTranscript = () => {
    if (!session || !session.messages.length) return;
    const transcript = [
      `=============================================================`,
      `NammaTech Realtime Support Transcript`,
      `Session ID: ${session.id}`,
      `User: ${session.userName} (${session.userEmail || "No email"})`,
      `Category: ${session.category || "General"}`,
      `Date: ${new Date().toLocaleString()}`,
      `=============================================================\n`,
      ...session.messages.map((m) => {
        const time = new Date(m.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        let line = `[${time}] ${m.senderName} (${m.sender.toUpperCase()}): ${m.text}`;
        if (m.codeSnippet) {
          line += `\n--- CODE/LOGS ---\n${m.codeSnippet}\n-----------------`;
        }
        return line;
      }),
    ].join("\n");

    if (navigator.clipboard) {
      navigator.clipboard.writeText(transcript);
      showToast({
        type: "success",
        title: "Transcript Copied",
        message: "Full conversation transcript copied to your clipboard!",
      });
    }
  };

  // Sound mute toggle
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    chatAudio.setMuted(next);
    showToast({
      type: "info",
      message: next ? "Audio alerts muted 🔇" : "Audio alerts enabled 🔊",
    });
  };

  return (
    <div className="w-full">
      {!hasJoined ? (
        /* ── STEP 1: ONBOARDING / NAME & CATEGORY ENTRY ── */
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6 mb-8 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                Specialist Desk Live
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight flex items-center gap-2.5">
                <Headphones className="w-7 h-7 text-[var(--primary)]" />
                <span>1-on-1 Realtime Technical Support</span>
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1 max-w-lg leading-relaxed">
                Connect directly with our engineering team for instant troubleshooting, software
                installation fixes, game crash logs, and direct mirror links.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="px-4 py-2.5 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] text-xs text-[var(--foreground)] flex items-center gap-2 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold">Direct Admin Channel</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleStartSession} className="space-y-6 relative z-10">
            {/* Name and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="chat-username"
                  className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-2"
                >
                  Your Name / Handle <span className="text-[var(--primary)]">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <input
                    id="chat-username"
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name (e.g. Alex Tech)"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="chat-useremail"
                  className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-2"
                >
                  Email Address <span className="text-xs font-normal text-[var(--muted-foreground)]">(Optional, for offline transcript)</span>
                </label>
                <input
                  id="chat-useremail"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-2.5">
                What issue do you need immediate help with?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ISSUE_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer text-xs font-semibold ${
                        isSelected
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] shadow-md shadow-[var(--primary)]/15 scale-[1.01]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--border)]/80 hover:bg-[var(--secondary)]"
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feature Highlights ("500+ Communication Features") */}
            <div className="p-4 rounded-2xl bg-[var(--secondary)]/70 border border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="flex flex-col items-center">
                <span className="font-bold text-[var(--foreground)] text-sm">⚡ 1.2s Sync</span>
                <span className="text-[11px] text-[var(--muted-foreground)]">Realtime Stream</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-[var(--foreground)] text-sm">🔔 Sound Chime</span>
                <span className="text-[11px] text-[var(--muted-foreground)]">Instant Sound &amp; Tab Flash</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-[var(--foreground)] text-sm">💻 Code / Log</span>
                <span className="text-[11px] text-[var(--muted-foreground)]">Syntax Crash Sharing</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-[var(--foreground)] text-sm">📋 Full Transcript</span>
                <span className="text-[11px] text-[var(--muted-foreground)]">Export &amp; Copy History</span>
              </div>
            </div>

            {/* Start Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-rose-600 text-white font-bold text-sm hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-[var(--primary)]/25 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Connect to Live Support Specialist</span>
            </button>
          </form>
        </div>
      ) : (
        /* ── STEP 2: ACTIVE LIVE TECHNICAL SUPPORT CONSOLE ── */
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl overflow-hidden flex flex-col h-[760px] relative">
          {/* Top Control Bar */}
          <div className="px-5 py-3.5 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md flex items-center justify-between gap-3 z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-rose-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                  <Headphones className="w-5 h-5" />
                </div>
                <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--card)] absolute -bottom-0.5 -right-0.5 animate-pulse" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[var(--foreground)] truncate">
                    NammaTech Live Support
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Online
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[var(--muted-foreground)]">
                  <span>Chatting as <strong className="text-[var(--foreground)]">{session?.userName || userName}</strong></span>
                  <span>&bull;</span>
                  <span className="truncate text-sky-500 font-medium">{session?.category || category}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Tools */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Audio Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                title={isMuted ? "Unmute sound notifications" : "Mute sound notifications"}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isMuted
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                    : "border-[var(--border)] bg-[var(--secondary)] text-[var(--foreground)] hover:border-[var(--border)]/80"
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Copy Transcript */}
              <button
                type="button"
                onClick={handleExportTranscript}
                title="Copy Chat Transcript"
                className="p-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)] text-[var(--foreground)] hover:border-[var(--border)]/80 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Reset Session */}
              <button
                type="button"
                onClick={handleResetChat}
                title="End & Start New Session"
                className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Session Banner / Status Notification */}
          <div className="bg-sky-500/10 border-b border-sky-500/20 px-4 py-2 flex items-center justify-between text-xs text-sky-600 dark:text-sky-300">
            <div className="flex items-center gap-2 truncate">
              <Zap className="w-3.5 h-3.5 flex-shrink-0 text-sky-500" />
              <span className="truncate">
                Session Active: Realtime notifications enabled. Audio chimes on admin responses.
              </span>
            </div>
            <span className="font-mono text-[10px] opacity-75 hidden sm:inline-block">
              Ping: 1.2s
            </span>
          </div>

          {/* Message Stream Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[var(--background)]/40">
            {session?.messages.map((msg: SupportMessage) => {
              const isUser = msg.sender === "user";
              const isSystem = msg.sender === "system";
              const isDelivered = msg.status === "delivered" || msg.status === "read";
              const isRead = msg.status === "read";
              const timeString = new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-3">
                    <div className="px-4 py-2 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] text-xs text-[var(--muted-foreground)] flex items-center gap-2 max-w-lg text-center shadow-sm">
                      <Bot className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" />
                      <span>{msg.text}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col group ${isUser ? "items-end" : "items-start"}`}
                >
                  {/* Sender Badge */}
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">
                      {isUser ? "You" : msg.senderName}
                    </span>
                    {!isUser && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[var(--primary)]/15 text-[var(--primary)] uppercase">
                        Admin Team
                      </span>
                    )}
                    <span className="text-[10px] text-[var(--muted-foreground)] opacity-70">
                      {timeString}
                    </span>
                  </div>

                  {/* Bubble Container */}
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 shadow-sm relative transition-all ${
                      isUser
                        ? "bg-[var(--primary)] text-white rounded-tr-xs"
                        : "bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-tl-xs"
                    }`}
                  >
                    {/* Text content */}
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line break-words font-sans">
                      {msg.text}
                    </p>

                    {/* Code / Crash Log Snippet */}
                    {msg.codeSnippet && (
                      <div className="mt-3 rounded-xl bg-neutral-950 text-neutral-200 border border-neutral-800 p-3 font-mono text-xs overflow-x-auto relative group/code">
                        <div className="flex items-center justify-between text-[10px] text-neutral-400 border-b border-neutral-800 pb-1 mb-2">
                          <div className="flex items-center gap-1.5">
                            <Terminal className="w-3 h-3 text-sky-400" />
                            <span>Command / Crash Log</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(msg.codeSnippet || "");
                                showToast({ message: "Code snippet copied", type: "success" });
                              }
                            }}
                            className="hover:text-white p-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
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

                    {/* Footer inside bubble (ticks for user) */}
                    {isUser && (
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-white/80">
                        {isRead ? (
                          <span className="flex items-center text-sky-200" title="Read by Admin">
                            <CheckCheck className="w-3.5 h-3.5" />
                          </span>
                        ) : isDelivered ? (
                          <span className="flex items-center opacity-80" title="Delivered">
                            <CheckCheck className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="flex items-center opacity-80" title="Sent">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message Reactions Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 mt-1 px-1">
                    {/* Render existing reactions */}
                    {msg.reactions &&
                      Object.entries(msg.reactions).map(([emoji, senders]) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleReaction(msg.id, emoji)}
                          className={`px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1 border transition-all cursor-pointer ${
                            senders.includes("user")
                              ? "bg-[var(--primary)]/15 border-[var(--primary)]/40 text-[var(--foreground)]"
                              : "bg-[var(--secondary)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                          }`}
                        >
                          <span>{emoji}</span>
                          <span className="text-[10px] font-bold">{senders.length}</span>
                        </button>
                      ))}

                    {/* Quick Reaction Button */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      {["👍", "❤️", "🔥"].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleReaction(msg.id, emoji)}
                          className="w-6 h-6 rounded-full hover:bg-[var(--secondary)] text-xs flex items-center justify-center transition-colors cursor-pointer"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Admin Typing Indicator */}
            {session?.isAdminTyping && (
              <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] p-2">
                <div className="w-8 h-8 rounded-xl bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
                  <Headphones className="w-4 h-4 animate-pulse" />
                </div>
                <div className="px-3.5 py-2 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center gap-1.5 shadow-sm">
                  <span className="font-semibold text-[var(--foreground)]">Support Specialist</span> is typing
                  <span className="inline-flex gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Troubleshooting Chips */}
          <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--card)]/60 overflow-x-auto flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[var(--primary)]" />
              Quick:
            </span>
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-xl text-xs bg-[var(--secondary)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] text-[var(--foreground)] border border-[var(--border)] whitespace-nowrap transition-all cursor-pointer text-left"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Code Snippet Drawer */}
          {showCodeInput && (
            <div className="p-3 border-t border-[var(--border)] bg-neutral-950 text-neutral-200">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
                <span className="flex items-center gap-1.5 font-bold">
                  <Terminal className="w-3.5 h-3.5 text-sky-400" />
                  Paste Crash Log / Terminal Error Output
                </span>
                <button
                  type="button"
                  onClick={() => setShowCodeInput(false)}
                  className="hover:text-white text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
              <textarea
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                placeholder="e.g. Error code: 0xc0000142, missing DLL: vcruntime140.dll..."
                rows={3}
                className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
              />
            </div>
          )}

          {/* Emoji Drawer */}
          {showEmojiBar && (
            <div className="p-2 border-t border-[var(--border)] bg-[var(--card)] flex items-center gap-2 overflow-x-auto">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setInputText((prev) => prev + emoji)}
                  className="w-8 h-8 rounded-xl hover:bg-[var(--secondary)] text-base flex items-center justify-center transition-colors cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Bottom Chat Input Bar */}
          <div className="p-3 sm:p-4 border-t border-[var(--border)] bg-[var(--card)]">
            <div className="flex items-end gap-2">
              {/* Code Toggle Button */}
              <button
                type="button"
                onClick={() => setShowCodeInput((prev) => !prev)}
                title="Add Crash Log / Code snippet"
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex-shrink-0 ${
                  showCodeInput
                    ? "bg-sky-500/20 border-sky-500 text-sky-400"
                    : "border-[var(--border)] bg-[var(--secondary)] text-[var(--foreground)] hover:border-[var(--border)]/80"
                }`}
              >
                <Code className="w-4 h-4" />
              </button>

              {/* Emoji Bar Toggle */}
              <button
                type="button"
                onClick={() => setShowEmojiBar((prev) => !prev)}
                title="Quick Emoji Picker"
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex-shrink-0 ${
                  showEmojiBar
                    ? "bg-amber-500/20 border-amber-500 text-amber-500"
                    : "border-[var(--border)] bg-[var(--secondary)] text-[var(--foreground)] hover:border-[var(--border)]/80"
                }`}
              >
                <Smile className="w-4 h-4" />
              </button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Describe your issue or question... (Enter to send, Shift+Enter for newline)"
                  rows={1}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:outline-none transition-all resize-none max-h-28"
                />
              </div>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={(!inputText.trim() && !codeSnippet.trim()) || isSending}
                className="p-3 rounded-2xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-[var(--primary)]/25 flex-shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Rating / Feedback bar if session resolved */}
            {session?.status === "RESOLVED" && !hasRated && (
              <div className="mt-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCheck className="w-4 h-4" />
                  <span>Issue marked resolved. How was your support experience?</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRateSession(star)}
                      className="p-1 hover:scale-110 transition-transform text-amber-400 cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          userRating >= star ? "fill-amber-400" : "opacity-40"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
