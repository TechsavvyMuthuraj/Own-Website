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
  XCircle,
  Loader2,
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

export interface LiveSupportChatProps {
  compact?: boolean;
  onActiveStateChange?: (active: boolean) => void;
}

export function LiveSupportChat({ compact = false, onActiveStateChange }: LiveSupportChatProps = {}) {
  const { user, profile, loading: authLoading } = useAuth();
  const { showToast, confirm } = useToast();

  // Session state
  const [sessionId, setSessionId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [category, setCategory] = useState<string>("Software Installation");
  const [hasJoined, setHasJoined] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return Boolean(
      localStorage.getItem(STORAGE_SESSION_KEY) || localStorage.getItem("nammatech_support_session_id")
    );
  });
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [showInspector, setShowInspector] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768 && !compact) {
      setShowInspector(true);
    }
  }, [compact]);

  useEffect(() => {
    onActiveStateChange?.(hasJoined);
  }, [hasJoined, onActiveStateChange]);

  // Chat data state
  const [session, setSession] = useState<SupportSession | null>(null);

  // Safe specialist name (sanitizes any stale Vijaya references)
  const rawSpecialist = session?.assignedSpecialistName || "";
  const displaySpecialistName =
    rawSpecialist && !rawSpecialist.toLowerCase().includes("vijaya")
      ? rawSpecialist
      : "Kishore";
  const [inputText, setInputText] = useState<string>("");
  const [codeSnippet, setCodeSnippet] = useState<string>("");
  const [showCodeInput, setShowCodeInput] = useState<boolean>(false);
  const [showEmojiBar, setShowEmojiBar] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [ratingFeedback, setRatingFeedback] = useState<string>("");
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [dutyStatus, setDutyStatus] = useState<"ON_DUTY" | "BUSY" | "OFF_DUTY">("ON_DUTY");
  const [queuePosition, setQueuePosition] = useState<number>(1);
  const [isStartingSession, setIsStartingSession] = useState<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<any>(null);
  const lastKnownMessageCountRef = useRef<number>(0);
  const typingTimeoutRef = useRef<any>(null);
  const isTypingEmittedRef = useRef<boolean>(false);
  const isRecoveringRef = useRef<boolean>(false);
  const consecutive404Ref = useRef<number>(0);

  // Initialize identity from auth or localStorage (Supports both authenticated users and guests)
  useEffect(() => {
    if (typeof window === "undefined" || authLoading) return;

    const savedUserId = localStorage.getItem("nammatech_support_user_id");
    const savedSessionId =
      localStorage.getItem(STORAGE_SESSION_KEY) || localStorage.getItem("nammatech_support_session_id");
    const savedName = localStorage.getItem("nammatech_support_username");
    const savedEmail = localStorage.getItem("nammatech_support_email");
    const savedCat = localStorage.getItem("nammatech_support_category");

    if (user) {
      // Authenticated User: Check if previous session belonged to a different account
      if (savedUserId && savedUserId !== user.id) {
        try {
          localStorage.removeItem(STORAGE_SESSION_KEY);
          localStorage.removeItem("nammatech_support_session_id");
          localStorage.removeItem("nammatech_support_username");
          localStorage.removeItem("nammatech_support_email");
          localStorage.removeItem("nammatech_support_category");
          localStorage.removeItem("nammatech_support_user_id");
        } catch {}
        setSessionId("");
        setSession(null);
        setHasJoined(false);
        lastKnownMessageCountRef.current = 0;
      }

      const defaultName =
        profile?.full_name ||
        (user?.user_metadata as any)?.full_name ||
        user?.email?.split("@")[0] ||
        "";
      const defaultEmail = user?.email || "";

      setUserName(defaultName);
      setUserEmail(defaultEmail);
      if (savedCat) setCategory(savedCat);

      if (savedSessionId && (!savedUserId || savedUserId === user.id)) {
        setSessionId(savedSessionId);
        setHasJoined(true);
      }
    } else {
      // Guest / Visitor User (Without Signing In):
      // Full access to 1-on-1 live technical support without requiring any login or account creation
      if (savedName) setUserName(savedName);
      if (savedEmail) setUserEmail(savedEmail);
      if (savedCat) setCategory(savedCat);

      if (savedSessionId) {
        setSessionId(savedSessionId);
        setHasJoined(true);
      }
    }
  }, [user, profile, authLoading]);

  // Reset live chat when user signs out anywhere on the website
  useEffect(() => {
    const handleSignOutReset = () => {
      setSessionId("");
      setSession(null);
      setHasJoined(false);
      setUserName("");
      setUserEmail("");
      lastKnownMessageCountRef.current = 0;
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(STORAGE_SESSION_KEY);
          localStorage.removeItem("nammatech_support_session_id");
          localStorage.removeItem("nammatech_support_username");
          localStorage.removeItem("nammatech_support_email");
          localStorage.removeItem("nammatech_support_category");
          localStorage.removeItem("nammatech_support_user_id");
        } catch {}
      }
    };
    window.addEventListener("nammatech-user-signed-out", handleSignOutReset);
    return () => window.removeEventListener("nammatech-user-signed-out", handleSignOutReset);
  }, []);

  // Check if user is near bottom of chat stream
  const isNearBottom = useCallback(() => {
    if (!chatContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 150;
  }, []);

  // Smooth scroll directly to bottom of container (Never jumps or glitches parent webpage)
  const scrollToBottom = useCallback((smooth = true) => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  // Poll chat session with auto-recovery
  const fetchSession = useCallback(
    async (sid: string, silent = false) => {
      if (!sid) return;
      try {
        const res = await fetch(`/api/support/chat?sessionId=${encodeURIComponent(sid)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.session) {
            consecutive404Ref.current = 0;
            const currentCount = data.session.messages.length;
            const previousCount = lastKnownMessageCountRef.current;

            // Check if a new message from admin arrived
            if (previousCount > 0 && currentCount > previousCount) {
              const latestMessage = data.session.messages[currentCount - 1];
              if (latestMessage.sender === "admin") {
                chatAudio.playIncoming();
                const cleanSenderName = latestMessage.senderName
                  ? latestMessage.senderName.replace(/\(Technical Team\)/i, "").replace(/\(Technical Support\)/i, "").trim()
                  : "Specialist";
                chatAudio.flashTitle(`🔔 Support: ${cleanSenderName} replied!`);
                showToast({
                  type: "info",
                  title: `Support Specialist (${cleanSenderName})`,
                  message: latestMessage.text || "Sent a code/instruction snippet",
                });
              }
            }

            lastKnownMessageCountRef.current = currentCount;
            setSession(data.session);

            if (data.specialistDutyStatus) {
              setDutyStatus(data.specialistDutyStatus);
            }
            if (data.queuePosition !== undefined) {
              setQueuePosition(data.queuePosition);
            }

            // Mark user read
            if (data.session.unreadUserCount > 0) {
              fetch("/api/support/chat", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId: sid, action: "read", reader: "user" }),
              }).catch(() => {});
            }
          }
        } else if (res.status === 410) {
          // Session was permanently deleted by support specialist
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          if (typeof window !== "undefined") {
            try {
              localStorage.removeItem(STORAGE_SESSION_KEY);
              localStorage.removeItem("nammatech_support_session_id");
              localStorage.removeItem("nammatech_support_username");
              localStorage.removeItem("nammatech_support_email");
              localStorage.removeItem("nammatech_support_category");
              localStorage.removeItem("nammatech_support_user_id");
            } catch {}
          }
          setSessionId("");
          setSession(null);
          setHasJoined(false);
          lastKnownMessageCountRef.current = 0;
          return;
        } else if (res.status === 404) {
          // Transient 404: retry and only disconnect if 8 consecutive polls fail (~3.5s)
          consecutive404Ref.current += 1;
          if (consecutive404Ref.current > 8) {
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            if (typeof window !== "undefined") {
              try {
                localStorage.removeItem(STORAGE_SESSION_KEY);
                localStorage.removeItem("nammatech_support_session_id");
              } catch {}
            }
            setSessionId("");
            setSession(null);
            setHasJoined(false);
            lastKnownMessageCountRef.current = 0;
          }
        }
      } catch {
        // Network retry on next interval
      }
    },
    [showToast, userName, userEmail, category]
  );

  // Polling loop when joined
  useEffect(() => {
    if (!hasJoined || !sessionId) return;

    fetchSession(sessionId, true);
    scrollToBottom(false);

    pollIntervalRef.current = setInterval(() => {
      fetchSession(sessionId, true);
    }, 350);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [hasJoined, sessionId, fetchSession, scrollToBottom]);

  // Auto scroll when messages change, only if already near bottom (no jarring jump)
  useEffect(() => {
    if (session?.messages?.length) {
      if (isNearBottom()) {
        scrollToBottom(true);
      }
    }
  }, [session?.messages?.length, isNearBottom, scrollToBottom]);

  // Handle debounced typing state (avoids spamming server on every keystroke)
  const handleInputChange = (val: string) => {
    setInputText(val);

    if (!sessionId) return;

    if (!isTypingEmittedRef.current) {
      isTypingEmittedRef.current = true;
      fetch("/api/support/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, action: "typing", sender: "user", isTyping: true }),
      }).catch(() => {});
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      isTypingEmittedRef.current = false;
      fetch("/api/support/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, action: "typing", sender: "user", isTyping: false }),
      }).catch(() => {});
    }, 1800);
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStartingSession) return;

    const finalName =
      userName.trim() ||
      profile?.full_name ||
      (user?.user_metadata as any)?.full_name ||
      user?.email?.split("@")[0] ||
      "User";
    const newSid = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    setIsStartingSession(true);

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
        if (data.session) {
          consecutive404Ref.current = 0;
          setSession(data.session);
          setSessionId(newSid);
          setHasJoined(true);
          lastKnownMessageCountRef.current = data.session?.messages?.length || 1;

          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(STORAGE_SESSION_KEY, newSid);
              localStorage.setItem("nammatech_support_username", finalName);
              if (userEmail) localStorage.setItem("nammatech_support_email", userEmail);
              localStorage.setItem("nammatech_support_category", category);
              if (user?.id) localStorage.setItem("nammatech_support_user_id", user.id);
            } catch {}
          }

          chatAudio.playSent();
          showToast({
            type: "success",
            title: "Connected to Live Support",
            message: "A support specialist has been alerted to your session.",
          });
        }
      } else {
        showToast({
          type: "error",
          message: "Failed to connect to support specialist. Please retry.",
        });
      }
    } catch {
      showToast({
        type: "error",
        message: "Failed to initialize live chat session. Please check your connection.",
      });
    } finally {
      setIsStartingSession(false);
    }
  };

  // Send message with INSTANT 0ms Optimistic UI
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : inputText;
    const trimmedText = textToSend.trim();
    const currentCode = codeSnippet.trim();
    if ((!trimmedText && !currentCode) || !sessionId) return;

    const activeSid = sessionId;
    const effectiveName =
      userName.trim() ||
      profile?.full_name ||
      (user?.user_metadata as any)?.full_name ||
      user?.email?.split("@")[0] ||
      "User";

    // Instantly clear inputs & play sound (0ms response)
    setInputText("");
    setCodeSnippet("");
    setShowCodeInput(false);
    chatAudio.playSent();

    // Create optimistic message and render IMMEDIATELY (0ms delay)
    const optimisticMsg: SupportMessage = {
      id: `opt_${Date.now()}`,
      sessionId: activeSid,
      sender: "user",
      senderName: effectiveName,
      text: trimmedText,
      codeSnippet: currentCode || undefined,
      timestamp: new Date().toISOString(),
      status: "sent",
      reactions: {},
    };

    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, optimisticMsg],
        lastMessage: trimmedText,
        updatedAt: optimisticMsg.timestamp,
      };
    });
    scrollToBottom(true);

    setIsSending(true);
    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSid,
          userName: effectiveName,
          userEmail: userEmail.trim(),
          category,
          sender: "user",
          senderName: effectiveName,
          text: trimmedText,
          codeSnippet: currentCode || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.session) {
          setSession(data.session);
          lastKnownMessageCountRef.current = data.session.messages.length;
          scrollToBottom(true);
        }
      }
    } catch {
      // background
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

  // User explicitly closes / ends chat session
  const handleCloseChatSession = () => {
    if (!sessionId || !session) return;
    confirm({
      title: "End Support Chat?",
      message: "Are you satisfied with the solution or wish to close this session? Closing marks the issue resolved and opens your rating feedback.",
      confirmText: "End Chat",
      cancelText: "Keep Chatting",
      variant: "warning",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/support/chat", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              action: "status",
              status: "RESOLVED",
              specialistName: session.assignedSpecialistName || "User",
              customNote: `✅ Support session closed by ${userName || "User"}. Ticket marked as resolved.`,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.session) setSession(data.session);
            showToast({
              type: "success",
              title: "Session Resolved & Closed",
              message: "Thank you! Please rate your technical support experience.",
            });
          }
        } catch {
          showToast({ type: "error", message: "Failed to close support chat." });
        }
      },
    });
  };

  // Start fresh support inquiry
  const handleStartNewInquiry = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_SESSION_KEY);
        localStorage.removeItem("nammatech_support_session_id");
        localStorage.removeItem("nammatech_support_username");
        localStorage.removeItem("nammatech_support_email");
        localStorage.removeItem("nammatech_support_category");
        localStorage.removeItem("nammatech_support_user_id");
      } catch {}
    }
    setSessionId("");
    setSession(null);
    setHasJoined(false);
    setUserRating(0);
    setRatingFeedback("");
    setHasRated(false);
    lastKnownMessageCountRef.current = 0;
    showToast({ message: "Ready to start a new support inquiry.", type: "info" });
  };

  // Reset / Clear chat
  const handleResetChat = () => {
    confirm({
      title: "End Support Session?",
      message: "Are you sure you want to end this conversation and start a new support inquiry?",
      confirmText: "End & Reset",
      cancelText: "Stay in Chat",
      variant: "warning",
      onConfirm: handleStartNewInquiry,
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
        <div className={compact ? "rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 shadow-lg relative overflow-hidden text-left" : "rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-10 shadow-2xl relative overflow-hidden"}>
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-emerald-500/10 via-sky-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Header Banner */}
          {!compact ? (
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
          ) : (
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border)] relative z-10">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Support Specialist Live
                </span>
                <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                  <Headphones className="w-4 h-4 text-[var(--primary)]" />
                  Start Live Chat Session
                </h3>
              </div>
            </div>
          )}

          <form onSubmit={handleStartSession} className={compact ? "space-y-4 relative z-10" : "space-y-6 relative z-10"}>
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
              disabled={isStartingSession}
              className="w-full flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-rose-600 text-white font-bold text-sm hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-[var(--primary)]/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStartingSession ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Specialist Desk...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Connect to Live Support Specialist</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* ── STEP 2: ACTIVE LIVE TECHNICAL SUPPORT CONSOLE (WINDOWS OS FORMAT) ── */
        <div
          style={{ backgroundColor: "#090a10" }}
          className={
            isMaximized
              ? "fixed inset-0 z-50 rounded-none border-none flex flex-col text-left shadow-2xl overflow-hidden"
              : compact
              ? "rounded-2xl border border-neutral-800 shadow-xl overflow-hidden flex flex-col h-[500px] relative text-left"
              : "rounded-2xl sm:rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col h-[calc(100dvh-150px)] sm:h-[calc(100vh-140px)] min-h-[480px] sm:min-h-[580px] max-h-[820px] relative text-left"
          }
        >
          {/* 1. Windows OS Application Titlebar */}
          <div
            style={{ backgroundColor: "#10121a" }}
            className="px-3.5 py-2 border-b border-neutral-800 flex items-center justify-between text-xs select-none z-20"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-5 h-5 rounded bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center text-[11px] font-bold">
                🪟
              </span>
              <span className="font-bold text-slate-100 truncate">
                NammaTech Remote Assist Console v3.2
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono text-neutral-400">
                [{session?.id ? session.id.slice(0, 16) : "Connecting"}...]
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                TLS 1.3 Encrypted
              </span>
            </div>

            {/* Windows Action Controls */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowInspector((prev) => !prev)}
                className="px-2 py-1 rounded hover:bg-neutral-800 text-[11px] text-neutral-400 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
                title="Toggle Technical Inspector & Specs"
              >
                <span className="hidden sm:inline">{showInspector ? "Hide Inspector" : "Show Inspector"}</span>
                <span className="sm:hidden font-semibold">{showInspector ? "Chat" : "Info"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMaximized((prev) => !prev)}
                className="w-7 h-6 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs font-mono"
                title={isMaximized ? "Restore Window" : "Maximize to Fullscreen"}
              >
                {isMaximized ? "❐" : "▢"}
              </button>
              <button
                type="button"
                onClick={handleCloseChatSession}
                className="w-7 h-6 rounded hover:bg-red-600 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-xs font-bold"
                title="Close Session"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 2. Windows Menu Bar */}
          <div className="px-3.5 py-1.5 bg-[#0b0c12] border-b border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 select-none z-10">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-none">
              <span className="hover:text-slate-200 cursor-pointer">File</span>
              <span className="hover:text-slate-200 cursor-pointer">Diagnostics</span>
              <span className="hover:text-slate-200 cursor-pointer">Crash Logs</span>
              <span className="hover:text-slate-200 cursor-pointer">Direct Mirrors</span>
              <a
                href="https://wa.me/919944875726?text=Hi%20NammaTech%20Support,%20I%20am%20connected%20to%20session:%20"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Specialist Hotline: +91 99448 75726</span>
              </a>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
              <span>Direct Edge: 10 Gbps</span>
              <span>•</span>
              <span>Status: 100% Online</span>
            </div>
          </div>

          {/* 3. Split 2-Pane Technical Support Workspace */}
          <div className="flex-1 flex overflow-hidden min-h-0 relative">
            {/* LEFT PANE: Technical Support Inspector (Overlay on Mobile, Sidebar on Desktop) */}
            {showInspector && (
              <aside
                style={{ backgroundColor: "#0d0f17" }}
                className="absolute inset-0 z-30 md:static md:z-auto w-full md:w-64 lg:w-72 border-r border-neutral-800 flex flex-col justify-between overflow-y-auto p-4 text-xs select-none flex-shrink-0 animate-in fade-in duration-150"
              >
                <div className="space-y-4">
                  {/* Mobile Back-to-chat header */}
                  <div className="md:hidden flex items-center justify-between pb-3 border-b border-neutral-800 mb-2">
                    <span className="font-bold text-white text-xs">Technical Specs &amp; Diagnostics</span>
                    <button
                      type="button"
                      onClick={() => setShowInspector(false)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold cursor-pointer"
                    >
                      ← Back to Chat
                    </button>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                      Active Client Session
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Client:</span>
                        <span className="font-bold text-white truncate max-w-[130px]">
                          {session?.userName || userName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Issue:</span>
                        <span className="text-sky-400 font-semibold truncate max-w-[130px]">
                          {session?.category || category}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-[10px]">
                        <span className="text-neutral-500 font-mono truncate max-w-[130px]">
                          {session?.id ? session.id.slice(0, 14) : ""}...
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (session?.id) {
                              navigator.clipboard.writeText(session.id);
                              showToast({ message: "Session ID copied to clipboard!", type: "success" });
                            }
                          }}
                          className="text-sky-400 hover:underline cursor-pointer"
                          title="Copy Session ID"
                        >
                          Copy ID
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Specialist Card */}
                  <div>
                    <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                      On-Duty Specialist
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          {displaySpecialistName ? displaySpecialistName.charAt(0) : "S"}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">
                            {displaySpecialistName}
                          </div>
                          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live Triage Active
                          </div>
                        </div>
                      </div>
                      <a
                        href="https://wa.me/919944875726"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1.5 px-2 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#25D366] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>WhatsApp: +91 99448 75726</span>
                      </a>
                    </div>
                  </div>

                  {/* Quick Technical Presets */}
                  <div>
                    <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                      Quick Technical Presets
                    </div>
                    <div className="space-y-1.5">
                      {[
                        "🛡️ Windows Defender False Positive",
                        "🎮 Missing DirectX / VC++ Runtime",
                        "📦 Archive Password (nammatech)",
                        "🔗 Mirror Stuck at 99%",
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setInputText(preset)}
                          className="w-full text-left p-2 rounded-lg bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800/60 text-[11px] text-neutral-300 hover:text-white transition-colors cursor-pointer truncate"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-neutral-800 space-y-2">
                  <button
                    type="button"
                    onClick={handleExportTranscript}
                    className="w-full py-1.5 px-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save Session Transcript</span>
                  </button>
                </div>
              </aside>
            )}

            {/* RIGHT PANE: Chat Stream & Message Input */}
            <div style={{ backgroundColor: "#090a10" }} className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* Top Control Bar */}
              <div
                style={{ backgroundColor: "#0c0d14" }}
                className="px-5 py-3 border-b border-neutral-800 flex items-center justify-between gap-3 z-10"
              >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-rose-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                  <Headphones className="w-5 h-5" />
                </div>
                <span
                  className={`w-3 h-3 rounded-full border-2 border-[var(--card)] absolute -bottom-0.5 -right-0.5 ${
                    dutyStatus === "ON_DUTY"
                      ? "bg-emerald-500 animate-pulse"
                      : dutyStatus === "BUSY"
                      ? "bg-amber-500 animate-ping"
                      : "bg-purple-500"
                  }`}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[var(--foreground)] truncate">
                    {displaySpecialistName ? (
                      <span className="flex items-center gap-1.5">
                        <span className="text-emerald-500 font-extrabold">{displaySpecialistName}</span>
                        <span className="text-xs font-semibold text-[var(--muted-foreground)]">(Technical Team)</span>
                      </span>
                    ) : dutyStatus === "BUSY" ? (
                      <span className="text-amber-500 font-bold">Waiting for Next Specialist...</span>
                    ) : (
                      "NammaTech Live Support"
                    )}
                  </h3>

                  {session?.status === "RESOLVED" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-xs">
                      <CheckCheck className="w-3 h-3" />
                      Issue Resolved
                    </span>
                  ) : session?.status === "WAITING" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1 animate-pulse shadow-xs">
                      ⏳ Specialist Waiting
                    </span>
                  ) : dutyStatus === "ON_DUTY" ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Connected
                    </span>
                  ) : dutyStatus === "BUSY" ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                      Queue #{queuePosition}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                      Offline Desk
                    </span>
                  )}
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
              {/* User Close / End Chat Button */}
              {session?.status !== "RESOLVED" ? (
                <button
                  type="button"
                  onClick={handleCloseChatSession}
                  title="Close & End this support session"
                  className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Close Chat</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartNewInquiry}
                  title="Start a new support inquiry"
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-90 active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>New Inquiry</span>
                </button>
              )}

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

          {/* Dynamic Duty & Queue Banner */}
          {dutyStatus === "BUSY" ? (
            <div className="bg-amber-500/10 border-b border-amber-500/25 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-600 dark:text-amber-300">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping flex-shrink-0" />
                <span className="truncate">
                  <strong>Technical Team High Volume:</strong> Specialists are currently assisting other users. You are queued for the next on-duty specialist...
                </span>
              </div>
              <span className="font-mono text-[10px] font-bold bg-amber-500/20 px-2 py-0.5 rounded-md flex-shrink-0">
                Queue #{queuePosition}
              </span>
            </div>
          ) : dutyStatus === "OFF_DUTY" ? (
            <div className="bg-purple-500/10 border-b border-purple-500/25 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-purple-600 dark:text-purple-300">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm flex-shrink-0">🌙</span>
                <span className="truncate">
                  <strong>After Hours:</strong> Live desk is currently offline (Shift: 9:00 AM - 6:00 PM IST). You can post your question here or reach WhatsApp.
                </span>
              </div>
              <a
                href="https://wa.me/919944875726?text=Hi%20NammaTech%20Technical%20Support,%20I%20need%20assistance:"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-[#25D366] text-black font-bold text-[11px] flex items-center gap-1 flex-shrink-0 shadow-xs hover:opacity-90 transition-opacity"
              >
                <span>WhatsApp Helpline</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-300">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span className="truncate">
                  {displaySpecialistName ? (
                    <span>Connected to <strong>{displaySpecialistName}</strong> (Technical Support Specialist). Live 1-on-1 session active.</span>
                  ) : (
                    <span>Connected to <strong>Technical Support Team</strong>. Specialist on duty.</span>
                  )}
                </span>
              </div>
              <span className="font-mono text-[10px] opacity-75 hidden sm:inline-block">
                Live Stream • 0.6s Sync
              </span>
            </div>
          )}

          {/* Message Stream Area */}
          <div
            ref={chatContainerRef}
            style={{ backgroundColor: "#06070a" }}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
          >
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
                      <span>{msg.text.replace(/vijaya/gi, displaySpecialistName)}</span>
                    </div>
                  </div>
                );
              }

              const cleanSenderName = (
                msg.senderName?.replace(/\s*\((Technical Team|Technical Specialist|Support Agent)\)/i, "") ||
                displaySpecialistName
              ).replace(/vijaya/gi, displaySpecialistName);

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col group ${isUser ? "items-end" : "items-start"}`}
                >
                  {/* Sender Badge */}
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-semibold text-[var(--muted-foreground)]">
                      {isUser ? "You" : cleanSenderName}
                    </span>
                    {!isUser && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/15 text-emerald-500 uppercase">
                        Technical Team
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
                  <span className="font-semibold text-[var(--foreground)]">
                    {session.assignedSpecialistName ? session.assignedSpecialistName : "Support Specialist"}
                  </span>{" "}
                  is typing
                  <span className="inline-flex gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-bounce" />
                  </span>
                </div>
              </div>
            )}

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
          <div
            style={{ backgroundColor: "#0c0d14" }}
            className="p-3 sm:p-4 border-t border-neutral-800"
          >
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
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Rating / Feedback Card if session resolved */}
            {session?.status === "RESOLVED" && (
              <div className="mt-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0">
                    <CheckCheck className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                      Support Ticket Marked as Resolved
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)]">
                      {hasRated
                        ? `Thank you for rating us ${userRating}/5 stars!`
                        : "How was your troubleshooting experience with our technical team?"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {!hasRated ? (
                    <div className="flex items-center gap-1 bg-[var(--card)] px-2.5 py-1 rounded-xl border border-[var(--border)] shadow-xs">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRateSession(star)}
                          title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                          className="p-1 hover:scale-125 transition-transform text-amber-400 cursor-pointer"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              userRating >= star ? "fill-amber-400" : "opacity-35"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-400/10 text-amber-500 border border-amber-400/20 text-xs font-bold">
                      ⭐ {userRating} / 5 Stars
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleStartNewInquiry}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-xs shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>New Ticket</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )}
</div>
  );
}
