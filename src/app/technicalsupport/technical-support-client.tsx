"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Headphones,
  ShieldCheck,
  Zap,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Clock,
  Phone,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  ExternalLink,
  Code,
  Sparkles,
  Search,
  Check,
  Smile,
  Volume2,
  VolumeX,
  User,
  Users,
  Copy,
  Sun,
  Moon,
  Trash2,
  RotateCcw,
  CheckCheck,
  Inbox,
  FileText,
  Filter,
  Tag,
  XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { chatAudio } from "@/lib/support/chat-audio";
import type { SupportSession, SupportMessage } from "@/lib/support/support-chat-store";
import type { SupportTeamMember } from "@/app/api/admin/support-team/route";

const QUICK_RESPONSES = [
  "👋 Hello! This is NammaTech Technical Support. I'm looking into your request right now.",
  "🔗 Here is the direct high-speed Google Drive mirror for your download.",
  "📦 Please extract using the latest 7-Zip or WinRAR. The archive password is: nammatech",
  "🛡️ Windows Defender false-positive: You can safely allow this repack through Windows Security exclusions.",
  "🎮 For the missing DLL crash, please install the DirectX & Visual C++ All-in-One Redistributable package.",
  "✨ Your VIP access has been verified and high-speed mirror priority is now enabled.",
  "✅ Has this resolved your issue? Please let me know if you need any additional assistance!",
];

const SPECIALIST_STORAGE_KEY = "nammatech_active_specialist_session";

export function TechnicalSupportClient() {
  const { showToast, confirm } = useToast();
  const supabase = createClient();

  // Specialist Authentication State
  const [specialist, setSpecialist] = useState<SupportTeamMember | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Dashboard Data State
  const [sessions, setSessions] = useState<SupportSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<SupportSession | null>(null);
  const [replyText, setReplyText] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [teamRoster, setTeamRoster] = useState<SupportTeamMember[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  // Left Pane View: Live Chat Queue vs User Resource Requests
  const [activeLeftTab, setActiveLeftTab] = useState<"queue" | "requests">("queue");
  const [resourceRequests, setResourceRequests] = useState<any[]>([]);
  const [requestStatusFilter, setRequestStatusFilter] = useState("ALL");
  const [requestSearchQuery, setRequestSearchQuery] = useState("");

  // Theme state: dark vs light
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedTheme = localStorage.getItem("nammatech_techsupport_theme") as "dark" | "light" | null;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("nammatech_techsupport_theme", next);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<any>(null);
  const prevTotalUnreadRef = useRef<number>(-1);
  const isTypingEmittedRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const deletedSessionIdsRef = useRef<Set<string>>(new Set());

  // Restore existing specialist session on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(SPECIALIST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.email) {
          setSpecialist(parsed);
        }
      }
    } catch {}
  }, []);

  // Fetch team roster
  const fetchTeamRoster = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/support-team");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.team)) {
          setTeamRoster(data.team);
        }
      }
    } catch {}
  }, []);

  // Fetch live chat sessions
  const fetchLiveSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/support/chat?all=true");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.sessions)) {
          const filtered = data.sessions.filter(
            (s: SupportSession) => !deletedSessionIdsRef.current.has(s.id)
          );
          setSessions(filtered);

          // Audio notification & title flash for incoming user messages
          const newTotalUnread = filtered.reduce(
            (acc: number, s: SupportSession) => acc + (s.unreadAdminCount || 0),
            0
          );
          if (prevTotalUnreadRef.current >= 0 && newTotalUnread > prevTotalUnreadRef.current) {
            if (!isMuted) chatAudio.playIncoming();
            chatAudio.flashTitle(`(${newTotalUnread}) New Live Chat Message!`);
          }
          prevTotalUnreadRef.current = newTotalUnread;

          if (selectedSessionId) {
            const found = data.sessions.find((s: SupportSession) => s.id === selectedSessionId);
            if (found) setActiveSession(found);
          }
        }
      }
    } catch {}
  }, [selectedSessionId, isMuted]);

  // Fetch user resource requests
  const fetchResourceRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/support/requests");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.requests)) {
          setResourceRequests(data.requests);
        }
      }
    } catch {}
  }, []);

  // Specialist Login Handler (Email Only - Must be created by admin)
  const handleSpecialistLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setLoginError("Please enter your registered specialist email address.");
      return;
    }

    setIsLoggingIn(true);
    setLoginError("");

    try {
      // Verify specialist against team roster created by admin
      const teamRes = await fetch("/api/admin/support-team");
      let roster: SupportTeamMember[] = [];
      if (teamRes.ok) {
        const teamData = await teamRes.json();
        roster = Array.isArray(teamData.team) ? teamData.team : [];
      }

      const matchedMember = roster.find(
        (m) => m.email.trim().toLowerCase() === cleanEmail
      );

      // Check configured admin emails fallback
      const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com")
        .split(",")
        .map((e) => e.trim().toLowerCase());
      const isConfigAdmin = adminEmails.includes(cleanEmail);

      if (matchedMember) {
        setSpecialist(matchedMember);
        if (typeof window !== "undefined") {
          localStorage.setItem(SPECIALIST_STORAGE_KEY, JSON.stringify(matchedMember));
        }

        showToast({
          type: "success",
          title: `Welcome, ${matchedMember.name}! 🚀`,
          message: "Technical Support Console active. Incoming queue connected.",
        });
      } else if (isConfigAdmin) {
        const adminMember: SupportTeamMember = {
          id: "spec_admin_session",
          name: "Muthuraj C",
          email: cleanEmail,
          role: "Lead Architect & Head of Support",
          shiftHours: "24/7 Priority Operations",
          phone: "+91 99448 75726",
          dutyStatus: "ON_DUTY",
          specializations: [
            "Software Installation",
            "Game Crash / Error",
            "VIP Access & Billing",
            "Direct Drive Mirroring",
          ],
          activeChatsCount: 1,
          resolvedChatsCount: 42,
          rating: 4.98,
          createdAt: new Date().toISOString(),
        };

        setSpecialist(adminMember);
        if (typeof window !== "undefined") {
          localStorage.setItem(SPECIALIST_STORAGE_KEY, JSON.stringify(adminMember));
        }

        showToast({
          type: "success",
          title: `Welcome, ${adminMember.name}! 🚀`,
          message: "Administrator Support Console connected.",
        });
      } else {
        setLoginError(
          "Access Denied: This email is not registered on the Technical Support Team. Please contact the administrator to create your specialist account."
        );
      }
    } catch (err: any) {
      setLoginError(err?.message || "Failed to verify specialist account.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Specialist Sign Out
  const handleSpecialistSignOut = () => {
    confirm({
      title: "Sign Out of Support Console?",
      message: "This will pause your specialist session and return you to the login gateway.",
      confirmText: "Sign Out",
      cancelText: "Stay Connected",
      variant: "warning",
      onConfirm: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(SPECIALIST_STORAGE_KEY);
        }
        setSpecialist(null);
        setSelectedSessionId(null);
        setActiveSession(null);
        showToast({
          type: "info",
          message: "Specialist logged out successfully.",
        });
      },
    });
  };

  // Toggle Duty Status
  const handleDutyStatusChange = async (newStatus: "ON_DUTY" | "BUSY" | "OFF_DUTY") => {
    if (!specialist) return;
    const updated = { ...specialist, dutyStatus: newStatus };
    setSpecialist(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(SPECIALIST_STORAGE_KEY, JSON.stringify(updated));
    }

    try {
      await fetch("/api/admin/support-team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: specialist.id, dutyStatus: newStatus }),
      });
      showToast({
        type: "success",
        title: "Duty Status Updated",
        message: `Status set to ${newStatus.replace("_", " ")}.`,
      });
    } catch {}
  };

  // Fast polling when specialist is authenticated
  // - Queue list + resource requests: 800ms (near-realtime queue awareness)
  // - Active session messages: 500ms (chat feels instant to both parties)
  const activePollRef = useRef<any>(null);
  useEffect(() => {
    if (!specialist) return;

    fetchTeamRoster();
    fetchLiveSessions();
    fetchResourceRequests();

    // Queue-level poll: every 500ms
    pollIntervalRef.current = setInterval(() => {
      fetchLiveSessions();
      fetchResourceRequests();
    }, 500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [specialist, fetchLiveSessions, fetchTeamRoster, fetchResourceRequests]);

  // Dedicated fast-polling for active session (300ms near-instant sync)
  useEffect(() => {
    if (!selectedSessionId || !specialist) {
      if (activePollRef.current) {
        clearInterval(activePollRef.current);
        activePollRef.current = null;
      }
      return;
    }

    const fetchActiveSessionOnly = async () => {
      try {
        const res = await fetch(`/api/support/chat?sessionId=${encodeURIComponent(selectedSessionId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.session) {
            setActiveSession(data.session);
          }
        }
      } catch {}
    };

    activePollRef.current = setInterval(fetchActiveSessionOnly, 300);

    return () => {
      if (activePollRef.current) {
        clearInterval(activePollRef.current);
        activePollRef.current = null;
      }
    };
  }, [selectedSessionId, specialist]);

  // Select a user session
  const handleSelectSession = (sid: string) => {
    setSelectedSessionId(sid);
    chatAudio.clearTitleFlash();
    const found = sessions.find((s) => s.id === sid);
    if (found) {
      setActiveSession(found);
      // Mark read as admin/specialist
      fetch("/api/support/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, action: "read", reader: "admin" }),
      }).catch(() => {});
    }
  };

  // Specialist debounced typing emitter
  const handleReplyInputChange = (val: string) => {
    setReplyText(val);

    if (activeSession?.id) {
      if (!isTypingEmittedRef.current) {
        isTypingEmittedRef.current = true;
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
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        isTypingEmittedRef.current = false;
        if (activeSession?.id) {
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
        }
      }, 1800);
    }
  };

  // Send reply to user with INSTANT 0ms Optimistic UI
  const handleSendReply = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : replyText;
    const msg = textToSend.trim();
    const code = codeSnippet.trim();
    if ((!msg && !code) || !activeSession) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTypingEmittedRef.current && activeSession?.id) {
      isTypingEmittedRef.current = false;
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
    }

    // Instantly clear inputs & play sound (0ms response)
    setReplyText("");
    setCodeSnippet("");
    setShowCodeInput(false);
    if (!isMuted) chatAudio.playSent();

    const senderDisplayName = `${specialist?.name || "Support Specialist"} (Technical Team)`;

    // Optimistic message rendered in 0ms
    const optimisticMsg: SupportMessage = {
      id: `opt_admin_${Date.now()}`,
      sessionId: activeSession.id,
      sender: "admin",
      senderName: senderDisplayName,
      text: msg,
      codeSnippet: code || undefined,
      timestamp: new Date().toISOString(),
      status: "sent",
      reactions: {},
    };

    setActiveSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, optimisticMsg],
        lastMessage: msg,
        updatedAt: optimisticMsg.timestamp,
      };
    });

    setIsSending(true);
    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSession.id,
          userName: activeSession.userName,
          userEmail: activeSession.userEmail,
          category: activeSession.category,
          sender: "admin",
          senderName: senderDisplayName,
          specialistName: specialist?.name,
          specialistEmail: specialist?.email,
          specialistRole: specialist?.role,
          text: msg,
          codeSnippet: code || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.session) {
          setActiveSession(data.session);
          fetchLiveSessions();
        }
      }
    } catch {
      // background
    } finally {
      setIsSending(false);
    }
  };

  // Specialist updates active session status (ACTIVE, WAITING, RESOLVED)
  const handleUpdateSessionStatus = async (
    targetStatus: "ACTIVE" | "WAITING" | "RESOLVED",
    customNote?: string
  ) => {
    if (!activeSession) return;

    if (targetStatus === "RESOLVED") {
      confirm({
        title: `Close Ticket for ${activeSession.userName}?`,
        message:
          "Has this user's issue been resolved? Closing will end this session and allow the user to submit rating feedback.",
        confirmText: "Close & Resolve",
        cancelText: "Keep Active",
        variant: "warning",
        onConfirm: async () => {
          try {
            const res = await fetch("/api/support/chat", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId: activeSession.id,
                action: "status",
                status: "RESOLVED",
                specialistName: specialist?.name || "Support Specialist",
                customNote:
                  customNote ||
                  `✅ Technical support ticket closed and marked as resolved by Specialist ${specialist?.name || "Support Specialist"}.`,
              }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.session) setActiveSession(data.session);
              fetchLiveSessions();
              showToast({
                type: "success",
                title: "Ticket Resolved",
                message: `Session for ${activeSession.userName} marked as resolved.`,
              });
            }
          } catch {
            showToast({ type: "error", message: "Failed to resolve session." });
          }
        },
      });
      return;
    }

    try {
      const res = await fetch("/api/support/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSession.id,
          action: "status",
          status: targetStatus,
          specialistName: specialist?.name || "Support Specialist",
          customNote:
            customNote ||
            (targetStatus === "WAITING"
              ? `⏳ Specialist ${specialist?.name || "Support Specialist"} is waiting for user response / diagnostic details.`
              : `⚡ Session active. Specialist ${specialist?.name || "Support Specialist"} is responding.`),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.session) setActiveSession(data.session);
        fetchLiveSessions();
        showToast({
          type: "success",
          title: `Status: ${targetStatus === "WAITING" ? "Waiting for User" : "Active"}`,
          message:
            targetStatus === "WAITING"
              ? "Status set to waiting for user logs/response."
              : "Status set to active troubleshooting.",
        });
      }
    } catch {
      showToast({ type: "error", message: "Failed to update session status." });
    }
  };

  // Specialist updates resource request status
  const handleUpdateRequestStatus = async (
    requestId: string,
    newStatus: "in_review" | "fulfilled" | "rejected" | "pending",
    note?: string
  ) => {
    try {
      const res = await fetch("/api/support/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: requestId,
          status: newStatus,
          adminNote: note,
          specialistName: specialist?.name,
        }),
      });
      if (res.ok) {
        setResourceRequests((prev) =>
          prev.map((r) =>
            r.id === requestId ? { ...r, status: newStatus, adminNote: note || r.adminNote } : r
          )
        );
        showToast({
          type: "success",
          title: "Request Updated",
          message: `Request marked as ${newStatus.replace("_", " ")}.`,
        });
      } else {
        showToast({ type: "error", message: "Failed to update request status." });
      }
    } catch {
      showToast({ type: "error", message: "Network error updating request status." });
    }
  };

  // Convert or launch Live Support chat for a user request
  const handleConvertRequestToChat = async (req: any) => {
    try {
      const sessionId = `req_chat_${req.id.slice(0, 8)}_${Date.now().toString(36)}`;
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          userName: req.userName,
          userEmail: req.whatsappNumber.includes("@") ? req.whatsappNumber : undefined,
          userPhone: req.whatsappNumber !== "—" ? req.whatsappNumber : undefined,
          category: `Request: ${req.resourceName}`,
          sender: "admin",
          senderName: `${specialist?.name || "Support Specialist"} (Technical Team)`,
          specialistName: specialist?.name,
          specialistEmail: specialist?.email,
          specialistRole: specialist?.role,
          text: `👋 Hello ${req.userName}! I am ${specialist?.name || "Technical Specialist"} from NammaTech Technical Support. I am looking into your request for: "${req.resourceName}". How can I help?`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await fetchLiveSessions();
        setActiveLeftTab("queue");
        setSelectedSessionId(sessionId);
        if (data.session) setActiveSession(data.session);
        showToast({
          type: "success",
          title: "Live Chat Launched",
          message: `Created support session with ${req.userName}.`,
        });
      }
    } catch {
      showToast({ type: "error", message: "Failed to open chat for this request." });
    }
  };

  // Mark Active Session as Read
  const handleMarkSessionRead = async (sid?: string) => {
    const targetId = sid || activeSession?.id;
    if (!targetId) return;
    try {
      const res = await fetch("/api/support/chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: targetId,
          action: "read",
          reader: "admin",
        }),
      });
      if (res.ok) {
        setSessions((prev) =>
          prev.map((s) => (s.id === targetId ? { ...s, unreadAdminCount: 0 } : s))
        );
        if (activeSession?.id === targetId) {
          setActiveSession((prev) => (prev ? { ...prev, unreadAdminCount: 0 } : null));
        }
        showToast({
          type: "success",
          title: "Marked as Read",
          message: "Unread count reset for this ticket.",
        });
      }
    } catch {
      showToast({ type: "error", message: "Failed to mark session as read." });
    }
  };

  // Clear Active Session Messages
  const handleClearSession = () => {
    if (!activeSession) return;
    confirm({
      title: `Clear Chat with ${activeSession.userName}?`,
      message: "This will remove previous message history in this session and start fresh. Are you sure?",
      confirmText: "Clear Chat",
      cancelText: "Keep Messages",
      variant: "warning",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/support/chat", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: activeSession.id,
              action: "clear",
              specialistName: specialist?.name || "Technical Specialist",
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.session) {
              setActiveSession(data.session);
              setSessions((prev) =>
                prev.map((s) => (s.id === data.session.id ? data.session : s))
              );
            }
            showToast({
              type: "success",
              title: "Chat Cleared",
              message: "Conversation history cleared successfully.",
            });
          }
        } catch {
          showToast({ type: "error", message: "Failed to clear chat." });
        }
      },
    });
  };

  // Delete Support Session Permanently
  const handleDeleteSession = (sessionIdToDelete?: string) => {
    const targetId = sessionIdToDelete || activeSession?.id;
    if (!targetId) return;
    const target = sessions.find((s) => s.id === targetId) || activeSession;

    confirm({
      title: `Delete Session for ${target?.userName || "User"}?`,
      message: "This will permanently remove this support inquiry from the Live Queue and database.",
      confirmText: "Delete Session",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        // Immediately blacklist and remove from UI so it never flickers or reflects back
        deletedSessionIdsRef.current.add(targetId);
        setSessions((prev) => prev.filter((s) => s.id !== targetId));
        if (selectedSessionId === targetId) {
          setSelectedSessionId(null);
          setActiveSession(null);
        }

        try {
          const res = await fetch(`/api/support/chat?sessionId=${encodeURIComponent(targetId)}`, {
            method: "DELETE",
          });
          if (res.ok) {
            showToast({
              type: "info",
              title: "Session Deleted",
              message: "Support ticket permanently removed from queue.",
            });
          }
        } catch {
          showToast({ type: "error", message: "Failed to delete session." });
        }
      },
    });
  };

  // Build WhatsApp URL with proper receiver address & business profile
  const getWhatsAppUrl = () => {
    if (!activeSession) return "#";
    const receiverName = activeSession.userName || "User";
    const specialistName = specialist?.name || "Technical Specialist";
    const issueCategory = activeSession.category || "Technical Support";
    const emailInfo = activeSession.userEmail ? ` (${activeSession.userEmail})` : "";

    const receiverMessage = `Hello ${receiverName}, this is ${specialistName} from NammaTech Technical Support regarding your request: "${issueCategory}"${emailInfo}. How can I assist you?`;

    const userPhone = activeSession.userPhone ? activeSession.userPhone.replace(/\D/g, "") : "";
    if (userPhone) {
      return `https://wa.me/${userPhone}?text=${encodeURIComponent(receiverMessage)}`;
    }
    // If no direct phone on session, opens WhatsApp to choose receiver contact with prefilled message
    return `https://wa.me/?text=${encodeURIComponent(receiverMessage)}`;
  };

  // Auto scroll inside message container without jumping parent window
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [activeSession?.messages?.length, activeSession?.id]);

  // Filtered Sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.userEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalUnread = sessions.reduce((acc, s) => acc + (s.unreadAdminCount || 0), 0);

  // ══════════════════════════════════════════════════════════════════════
  // VIEW 1: SPECIALIST LOGIN PORTAL
  // ══════════════════════════════════════════════════════════════════════
  if (!specialist) {
    return (
      <main className="min-h-screen bg-[#05030A] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        {/* Background Cyber Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-600/15 via-emerald-600/10 to-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Brand & Terminal Header */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-cyan-500/40 transition-all shadow-xl mb-4 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-black font-black shadow-lg">
                <Headphones className="w-5 h-5 text-black" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                  NammaTech Support Hub
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                </span>
                <span className="text-[10px] text-neutral-400 block font-mono">Specialist Gateway v2.4</span>
              </div>
            </Link>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2">
              Technical Support{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Terminal
              </span>
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
              Dedicated operations portal for Technical Support Specialists, Engineers, and Repack Diagnostics.
            </p>
          </div>

          {/* Login Card */}
          <div
            className="p-7 sm:p-8 rounded-3xl border border-neutral-800/80 shadow-2xl relative backdrop-blur-2xl"
            style={{
              background: "rgba(11, 7, 18, 0.75)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {loginError && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs mb-5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleSpecialistLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
                  Specialist Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. arun.techsupport@nammatech.dev"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-950/80 border border-neutral-800 text-white text-xs placeholder:text-neutral-600 focus:outline-none focus:border-cyan-500 transition-all font-mono"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed">
                  Enter your assigned technical support specialist email registered by the administrator.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-black font-extrabold text-xs tracking-wide uppercase shadow-lg shadow-cyan-500/20 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Verifying Specialist Account...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Support Console</span>
                    <ArrowRight className="w-4 h-4 text-black" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-neutral-800/60 text-center">
              <p className="text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Only administrator-created specialist accounts can access this console.</span>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center text-[11px] text-neutral-500 flex items-center justify-center gap-4">
            <Link href="/" className="hover:text-white transition-colors">
              ← Return Home
            </Link>
            <span>•</span>
            <Link href="/admin/support-team" className="hover:text-white transition-colors">
              Admin Roster Console
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // VIEW 2: ACTIVE TECHNICAL SUPPORT SPECIALIST CONSOLE
  // ══════════════════════════════════════════════════════════════════════
  const isLight = theme === "light";

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isLight ? "bg-slate-100 text-slate-900" : "bg-[#06040A] text-white"}`}>
      {/* ── TOP SPECIALIST CONTROL BAR ── */}
      <header className={`px-4 sm:px-6 py-3 border-b sticky top-0 z-30 flex items-center justify-between gap-4 backdrop-blur-xl transition-colors ${isLight ? "bg-white/95 border-slate-200 shadow-xs text-slate-900" : "bg-neutral-950/90 border-neutral-800/80 text-white"}`}>
        {/* Left: Brand & Specialist Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-black font-black shadow-md flex-shrink-0">
            <Headphones className="w-5 h-5 text-black" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-black truncate ${isLight ? "text-slate-900" : "text-white"}`}>{specialist.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
                {specialist.role}
              </span>
            </div>
            <div className={`flex items-center gap-2 text-[11px] font-mono ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
              <span className="truncate">{specialist.email}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {specialist.shiftHours}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Duty Status Switcher & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Duty Switcher */}
          <div className={`flex items-center gap-1.5 p-1 rounded-2xl border ${isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-900/80 border-neutral-800"}`}>
            {(["ON_DUTY", "BUSY", "OFF_DUTY"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleDutyStatusChange(st)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  specialist.dutyStatus === st
                    ? st === "ON_DUTY"
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                      : st === "BUSY"
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30"
                      : "bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30"
                    : isLight
                    ? "text-slate-500 hover:text-slate-900"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    st === "ON_DUTY"
                      ? "bg-emerald-400 animate-pulse"
                      : st === "BUSY"
                      ? "bg-amber-400 animate-ping"
                      : "bg-rose-400"
                  }`}
                />
                <span className="hidden sm:inline">{st.replace("_", " ")}</span>
              </button>
            ))}
          </div>

          {/* Theme Toggle Button (Light / Dark) */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isLight ? "Switch to Dark Theme" : "Switch to Light Theme"}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-amber-500 shadow-xs"
                : "bg-neutral-900/80 hover:bg-neutral-800 border-neutral-800 text-amber-400"
            }`}
          >
            {isLight ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Audio toggle */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isLight
                ? "border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200"
                : "border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-white"
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-500" />}
          </button>

          {/* Sign out */}
          <button
            type="button"
            onClick={handleSpecialistSignOut}
            title="Sign out of specialist desk"
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isLight
                ? "border-slate-300 bg-slate-100 text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                : "border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10"
            }`}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── WORKSPACE 3-PANE LAYOUT ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* ── PANE 1: DUAL-TAB DISPATCH DESK: LIVE QUEUE & USER REQUESTS (4 COLUMNS) ── */}
        <aside className={`lg:col-span-4 border-r flex flex-col h-[calc(100vh-61px)] ${isLight ? "bg-white border-slate-200" : "bg-neutral-950/50 border-neutral-800/80"}`}>
          {/* Dual Segmented Tabs */}
          <div className={`p-2.5 border-b grid grid-cols-2 gap-1.5 ${isLight ? "bg-slate-100/70 border-slate-200" : "bg-neutral-900/60 border-neutral-800/80"}`}>
            <button
              type="button"
              onClick={() => setActiveLeftTab("queue")}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeLeftTab === "queue"
                  ? isLight
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "bg-neutral-800 text-white shadow-sm border border-neutral-700"
                  : isLight
                  ? "text-slate-500 hover:text-slate-900"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-500" />
              <span>Live Queue</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                {sessions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLeftTab("requests")}
              className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeLeftTab === "requests"
                  ? isLight
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                    : "bg-neutral-800 text-white shadow-sm border border-neutral-700"
                  : isLight
                  ? "text-slate-500 hover:text-slate-900"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Inbox className="w-3.5 h-3.5 text-emerald-500" />
              <span>User Requests</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                {resourceRequests.filter((r) => r.status === "pending" || r.status === "in_review").length}
              </span>
            </button>
          </div>

          {/* TAB 1 CONTENT: LIVE CHAT QUEUE */}
          {activeLeftTab === "queue" ? (
            <>
              {/* Search & Filter Header */}
              <div className={`p-3.5 border-b space-y-2.5 ${isLight ? "border-slate-200" : "border-neutral-800/80"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>
                      Live Queue
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                      {sessions.length}
                    </span>
                  </div>
                  {totalUnread > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                      {totalUnread} Unread
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isLight ? "text-slate-400" : "text-neutral-500"}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search user name, email, issue..."
                    className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:border-cyan-500 ${
                      isLight
                        ? "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                        : "bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600"
                    }`}
                  />
                </div>
              </div>

              {/* Session Cards List */}
              <div className={`flex-1 overflow-y-auto divide-y ${isLight ? "divide-slate-100" : "divide-neutral-900/80"}`}>
                {filteredSessions.length === 0 ? (
                  <div className={`p-8 text-center space-y-2 ${isLight ? "text-slate-400" : "text-neutral-500"}`}>
                    <MessageSquare className={`w-8 h-8 mx-auto ${isLight ? "text-slate-300" : "text-neutral-700"}`} />
                    <p className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-neutral-400"}`}>No active user tickets</p>
                    <p className="text-[11px] opacity-75">
                      Incoming user inquiries from the website will appear here in realtime.
                    </p>
                  </div>
                ) : (
                  filteredSessions.map((s) => {
                    const isSelected = selectedSessionId === s.id;
                    const lastMsg = s.messages[s.messages.length - 1];
                    return (
                      <div
                        key={s.id}
                        onClick={() => handleSelectSession(s.id)}
                        className={`w-full text-left p-3.5 transition-all cursor-pointer flex items-start gap-3 group relative ${
                          isSelected
                            ? isLight
                              ? "bg-gradient-to-r from-cyan-50 to-emerald-50/50 border-l-4 border-cyan-500 shadow-xs"
                              : "bg-cyan-950/25 border-l-2 border-cyan-400"
                            : isLight
                            ? "hover:bg-slate-50"
                            : "hover:bg-neutral-900/40"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-sm ${
                          isLight
                            ? "bg-slate-100 text-slate-800 border border-slate-200"
                            : "bg-gradient-to-tr from-neutral-800 to-neutral-700 text-neutral-200"
                        }`}>
                          {s.userName.charAt(0).toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className={`text-xs font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>{s.userName}</span>
                            <span className={`text-[10px] font-mono flex-shrink-0 ${isLight ? "text-slate-400" : "text-neutral-500"}`}>
                              {new Date(s.updatedAt || s.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                              isLight
                                ? "bg-slate-100 text-slate-700 border-slate-200"
                                : "bg-neutral-800 text-neutral-400 border-neutral-700"
                            }`}>
                              {s.category}
                            </span>

                            {/* Status Badge */}
                            {s.status === "RESOLVED" ? (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                                Resolved
                              </span>
                            ) : s.status === "WAITING" ? (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 animate-pulse">
                                Waiting
                              </span>
                            ) : (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                                Active
                              </span>
                            )}

                            {s.assignedSpecialistName && (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                                {s.assignedSpecialistName}
                              </span>
                            )}
                          </div>

                          <p className={`text-[11px] truncate ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                            {lastMsg ? lastMsg.text : "Session started"}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {s.unreadAdminCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(s.id);
                            }}
                            title="Delete ticket"
                            className="p-1 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* TAB 2 CONTENT: USER RESOURCE REQUESTS */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Filter & Search Header */}
              <div className={`p-3 border-b space-y-2 ${isLight ? "border-slate-200" : "border-neutral-800/80"}`}>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isLight ? "text-slate-400" : "text-neutral-500"}`} />
                  <input
                    type="text"
                    value={requestSearchQuery}
                    onChange={(e) => setRequestSearchQuery(e.target.value)}
                    placeholder="Search requested software, user name..."
                    className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:border-cyan-500 ${
                      isLight
                        ? "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400"
                        : "bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600"
                    }`}
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                  {["ALL", "PENDING", "IN_REVIEW", "FULFILLED"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setRequestStatusFilter(st)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                        requestStatusFilter === st
                          ? "bg-cyan-500 text-black shadow-xs font-black"
                          : isLight
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-600"
                          : "bg-neutral-900 hover:bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {st.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Requests List */}
              <div className={`flex-1 overflow-y-auto divide-y ${isLight ? "divide-slate-100" : "divide-neutral-900/80"}`}>
                {resourceRequests
                  .filter((r) => {
                    const matchesSearch =
                      r.userName.toLowerCase().includes(requestSearchQuery.toLowerCase()) ||
                      r.resourceName.toLowerCase().includes(requestSearchQuery.toLowerCase()) ||
                      r.category.toLowerCase().includes(requestSearchQuery.toLowerCase()) ||
                      r.whatsappNumber.includes(requestSearchQuery);
                    const matchesStatus =
                      requestStatusFilter === "ALL" ||
                      r.status.toLowerCase() === requestStatusFilter.toLowerCase();
                    return matchesSearch && matchesStatus;
                  })
                  .map((req) => {
                    const reqPhone = req.whatsappNumber !== "—" ? req.whatsappNumber.replace(/[^0-9]/g, "") : "";
                    const reqWaUrl = reqPhone
                      ? `https://wa.me/${reqPhone}?text=${encodeURIComponent(
                          `Hello ${req.userName}, this is ${specialist?.name || "Technical Specialist"} from NammaTech regarding your request for "${req.resourceName}". We are working on providing the verified repack link!`
                        )}`
                      : "#";

                    return (
                      <div
                        key={req.id}
                        className={`p-3.5 space-y-2 transition-all ${
                          isLight ? "hover:bg-slate-50" : "hover:bg-neutral-900/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className={`text-xs font-black truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                              {req.resourceName}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className={`text-[10px] font-bold ${isLight ? "text-slate-600" : "text-neutral-400"}`}>
                                {req.userName}
                              </span>
                              <span className="text-[10px] text-neutral-500">•</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${
                                isLight ? "bg-slate-100 border-slate-200 text-slate-700" : "bg-neutral-800 border-neutral-700 text-neutral-300"
                              }`}>
                                {req.category}
                              </span>
                              <span className="text-[10px] text-neutral-500 font-mono">
                                {new Date(req.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                              </span>
                            </div>
                          </div>

                          {/* Status Pill */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex-shrink-0 ${
                              req.status === "fulfilled"
                                ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                                : req.status === "in_review"
                                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                                : req.status === "rejected"
                                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {req.status.replace("_", " ")}
                          </span>
                        </div>

                        {req.description && (
                          <p className={`text-[11px] line-clamp-2 leading-relaxed ${isLight ? "text-slate-600" : "text-neutral-300"}`}>
                            {req.description}
                          </p>
                        )}

                        {/* Direct Action Toolbar */}
                        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-neutral-800/40">
                          {reqPhone ? (
                            <a
                              href={reqWaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] text-[10px] font-bold border border-[#25D366]/30 flex items-center gap-1 cursor-pointer transition-colors"
                              title={`Contact ${req.userName} via WhatsApp (+91 99448 75726 context)`}
                            >
                              <Phone className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-neutral-500 font-mono">No direct phone</span>
                          )}

                          <div className="flex items-center gap-1">
                            {/* In Review Action */}
                            {req.status !== "in_review" && req.status !== "fulfilled" && (
                              <button
                                type="button"
                                onClick={() => handleUpdateRequestStatus(req.id, "in_review")}
                                title="Mark In Review"
                                className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                                  isLight
                                    ? "bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200"
                                    : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                                }`}
                              >
                                ⏳ Review
                              </button>
                            )}

                            {/* Fulfill Action */}
                            {req.status !== "fulfilled" && (
                              <button
                                type="button"
                                onClick={() => handleUpdateRequestStatus(req.id, "fulfilled")}
                                title="Mark Fulfilled / Resolved"
                                className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                                  isLight
                                    ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                                    : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                }`}
                              >
                                ✅ Fulfill
                              </button>
                            )}

                            {/* Convert to Live Chat */}
                            <button
                              type="button"
                              onClick={() => handleConvertRequestToChat(req)}
                              title="Start Live Support session for this user"
                              className="px-2 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-black text-[10px] font-black hover:opacity-90 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Chat</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {resourceRequests.length === 0 && (
                  <div className={`p-8 text-center space-y-2 ${isLight ? "text-slate-400" : "text-neutral-500"}`}>
                    <Inbox className={`w-8 h-8 mx-auto ${isLight ? "text-slate-300" : "text-neutral-700"}`} />
                    <p className={`text-xs font-bold ${isLight ? "text-slate-700" : "text-neutral-400"}`}>No resource requests yet</p>
                    <p className="text-[11px] opacity-75">
                      User software and movie requests will appear here for specialist triage.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* ── PANE 2: ACTIVE CONVERSATION CONSOLE (5 COLUMNS) ── */}
        <main className={`lg:col-span-5 border-r flex flex-col h-[calc(100vh-61px)] ${
          isLight ? "bg-slate-50/50 border-slate-200" : "bg-[#090610]/40 border-neutral-800/80"
        }`}>
          {activeSession ? (
            <>
              {/* Active Header */}
              <div className={`px-4 py-3 border-b flex items-center justify-between gap-3 backdrop-blur-md ${
                isLight ? "bg-white/95 border-slate-200 text-slate-900 shadow-xs" : "bg-neutral-950/60 border-neutral-800/80 text-white"
              }`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className={`text-sm font-black truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                      {activeSession.userName}
                    </h2>

                    {/* Dynamic Status Pill */}
                    {activeSession.status === "RESOLVED" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center gap-1 shadow-xs">
                        <CheckCheck className="w-3 h-3" />
                        Resolved &amp; Closed
                      </span>
                    ) : activeSession.status === "WAITING" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1 animate-pulse shadow-xs">
                        <Clock className="w-3 h-3" />
                        Waiting on User
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                      Specialist: {activeSession.assignedSpecialistName || specialist?.name || "Support Specialist"}
                    </span>
                  </div>
                  <p className={`text-[11px] truncate font-mono ${isLight ? "text-slate-500" : "text-neutral-400"}`}>
                    {activeSession.userEmail || "No email provided"} • {activeSession.category}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                  {/* Status Switcher: Active / In Progress */}
                  <button
                    type="button"
                    onClick={() => handleUpdateSessionStatus("ACTIVE")}
                    title="Mark active / responding"
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs ${
                      activeSession.status === "ACTIVE"
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40"
                        : isLight
                        ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                        : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-700"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="hidden sm:inline">Active</span>
                  </button>

                  {/* Status Switcher: Wait for User */}
                  <button
                    type="button"
                    onClick={() => handleUpdateSessionStatus("WAITING")}
                    title="Mark as waiting for user response or crash logs"
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs ${
                      activeSession.status === "WAITING"
                        ? "bg-amber-500/20 text-amber-500 border-amber-500/40"
                        : isLight
                        ? "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                        : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-700"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden sm:inline">Wait</span>
                  </button>

                  {/* Status Switcher: End / Close Session */}
                  <button
                    type="button"
                    onClick={() => handleUpdateSessionStatus("RESOLVED")}
                    title="End & close ticket once user issue is resolved"
                    className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs ${
                      activeSession.status === "RESOLVED"
                        ? "bg-purple-500/20 text-purple-400 border-purple-500/40"
                        : isLight
                        ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300"
                        : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="hidden sm:inline">End Chat</span>
                  </button>

                  {/* Mark Read */}
                  <button
                    type="button"
                    onClick={() => handleMarkSessionRead()}
                    title="Mark ticket as read"
                    className={`px-2 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      isLight
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 shadow-xs"
                        : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-700"
                    }`}
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="hidden sm:inline">Read</span>
                  </button>

                  {/* Clear Chat */}
                  <button
                    type="button"
                    onClick={handleClearSession}
                    title="Clear chat history for this user"
                    className={`px-2 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      isLight
                        ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 shadow-xs"
                        : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>

                  {/* WhatsApp Bridge to Receiver */}
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    title={`Send WhatsApp message directly to ${activeSession.userName}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>

                  {/* Delete Session */}
                  <button
                    type="button"
                    onClick={() => handleDeleteSession(activeSession.id)}
                    title="Permanently delete this session"
                    className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                      isLight
                        ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200 shadow-xs"
                        : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Message Transcript */}
              <div
                ref={chatContainerRef}
                className={`flex-1 overflow-y-auto p-4 space-y-3.5 ${isLight ? "bg-slate-100/60" : "bg-black/20"}`}
              >
                {activeSession.messages.map((msg) => {
                  const isSpecialist = msg.sender === "admin";
                  const isSystem = msg.sender === "system";

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <span className={`px-3 py-1.5 rounded-xl text-[11px] border font-medium max-w-md text-center ${
                          isLight
                            ? "bg-slate-200/80 border-slate-300 text-slate-700"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400"
                        }`}>
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isSpecialist ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className={`text-[10px] font-bold ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
                          {isSpecialist ? "Specialist Desk" : activeSession.userName}
                        </span>
                        <span className={`text-[10px] font-mono ${isLight ? "text-slate-400" : "text-neutral-600"}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-md ${
                          isSpecialist
                            ? "bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-tr-sm"
                            : isLight
                            ? "bg-white border border-slate-200 text-slate-900 rounded-tl-sm shadow-xs"
                            : "bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-tl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                        {msg.codeSnippet && (
                          <pre className="mt-2 p-2.5 rounded-xl bg-black/70 border border-white/10 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                            <code>{msg.codeSnippet}</code>
                          </pre>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* User Typing Indicator */}
                {activeSession.isUserTyping && (
                  <div className="flex items-center gap-2 text-xs py-1 animate-in fade-in duration-200">
                    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
                      isLight ? "bg-slate-200 border-slate-300 text-slate-700" : "bg-neutral-800 border-neutral-700 text-neutral-300"
                    }`}>
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-xs ${
                      isLight ? "bg-white border-slate-200 text-slate-700" : "bg-neutral-900 border-neutral-800 text-neutral-300"
                    }`}>
                      <span className="font-semibold">{activeSession.userName}</span>
                      <span className="text-[11px] opacity-75">is typing</span>
                      <span className="inline-flex gap-0.5 ml-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Response Bar */}
              <div className={`px-3 py-2 border-t overflow-x-auto flex gap-1.5 no-scrollbar ${
                isLight ? "border-slate-200 bg-slate-50" : "border-neutral-800/80 bg-neutral-950/80"
              }`}>
                {QUICK_RESPONSES.slice(0, 4).map((qr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendReply(qr)}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] whitespace-nowrap transition-all cursor-pointer ${
                      isLight
                        ? "bg-white border-slate-300 text-slate-700 hover:text-cyan-600 hover:border-cyan-400 shadow-xs"
                        : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-cyan-500/50"
                    }`}
                  >
                    {qr.slice(0, 32)}...
                  </button>
                ))}
              </div>

              {/* Code Snippet Input if opened */}
              {showCodeInput && (
                <div className={`p-3 border-t ${isLight ? "border-slate-200 bg-slate-100" : "border-neutral-800 bg-black/60"}`}>
                  <textarea
                    rows={3}
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    placeholder="// Paste PowerShell, Registry, or Command instructions here..."
                    className={`w-full p-2.5 rounded-xl border font-mono text-xs focus:outline-none focus:border-cyan-500 resize-none ${
                      isLight
                        ? "bg-white border-slate-300 text-slate-900"
                        : "bg-neutral-950 border-neutral-800 text-cyan-300"
                    }`}
                  />
                </div>
              )}

              {/* Message Input Box */}
              <div className={`p-3 border-t flex items-center gap-2 ${
                isLight ? "border-slate-200 bg-white" : "border-neutral-800/80 bg-neutral-950/90"
              }`}>
                <button
                  type="button"
                  onClick={() => setShowCodeInput(!showCodeInput)}
                  title="Attach Code / Command Fix"
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    showCodeInput
                      ? "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/40"
                      : isLight
                      ? "bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900"
                      : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  <Code className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => handleReplyInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  placeholder="Type reply to user..."
                  className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-cyan-500 font-sans ${
                    isLight
                      ? "bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-400"
                      : "bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-600"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => handleSendReply()}
                  disabled={isSending || (!replyText.trim() && !codeSnippet.trim())}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <Send className="w-4 h-4 text-black" />
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 ${isLight ? "text-slate-500" : "text-neutral-500"}`}>
              <div className={`w-16 h-16 rounded-3xl border flex items-center justify-center ${
                isLight ? "bg-slate-100 border-slate-200" : "bg-neutral-900/60 border-neutral-800"
              }`}>
                <Headphones className="w-8 h-8 text-cyan-500" />
              </div>
              <h3 className={`text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Select a User Session</h3>
              <p className="text-xs opacity-75 max-w-xs leading-relaxed">
                Choose an active session from the left queue to communicate directly with users needing assistance.
              </p>
            </div>
          )}
        </main>

        {/* ── PANE 3: SPECIALIST TOOLS & ROSTER RADAR (3 COLUMNS) ── */}
        <aside className={`lg:col-span-3 p-4 space-y-5 flex flex-col h-[calc(100vh-61px)] overflow-y-auto ${
          isLight ? "bg-white border-l border-slate-200" : "bg-neutral-950/80"
        }`}>
          {/* Specialist Profile Card */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? "bg-slate-50 border-slate-200 shadow-xs" : "bg-neutral-900/50 border-neutral-800/80"
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-black flex items-center justify-center text-sm">
                {specialist.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h4 className={`text-xs font-black truncate ${isLight ? "text-slate-900" : "text-white"}`}>{specialist.name}</h4>
                <p className="text-[10px] text-cyan-600 dark:text-cyan-400 truncate">{specialist.role}</p>
              </div>
            </div>

            <div className={`pt-2 border-t space-y-1.5 text-[11px] ${
              isLight ? "border-slate-200 text-slate-600" : "border-neutral-800/60 text-neutral-400"
            }`}>
              <div className="flex items-center justify-between">
                <span>Duty Status:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">● {specialist.dutyStatus}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shift Hours:</span>
                <span className={`font-mono ${isLight ? "text-slate-800" : "text-neutral-300"}`}>{specialist.shiftHours}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Helpline:</span>
                <span className={`font-mono ${isLight ? "text-slate-800" : "text-neutral-300"}`}>{specialist.phone}</span>
              </div>
            </div>
          </div>

          {/* Quick Support Templates */}
          <div className="space-y-2">
            <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? "text-slate-700" : "text-neutral-300"
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>Standard Response Templates</span>
            </h4>
            <div className="space-y-1.5">
              {QUICK_RESPONSES.map((qr, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    if (activeSession) {
                      handleSendReply(qr);
                    } else {
                      navigator.clipboard.writeText(qr);
                      showToast({ type: "info", message: "Template copied to clipboard" });
                    }
                  }}
                  className={`w-full text-left p-2 rounded-xl border text-[11px] transition-all cursor-pointer truncate ${
                    isLight
                      ? "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900"
                      : "bg-neutral-900/40 hover:bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                  title="Click to send or copy"
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>

          {/* Team Radar */}
          <div className={`space-y-2.5 pt-2 border-t ${isLight ? "border-slate-200" : "border-neutral-800/80"}`}>
            <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
              isLight ? "text-slate-700" : "text-neutral-300"
            }`}>
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span>Support Specialist Roster</span>
            </h4>

            <div className="space-y-2">
              {teamRoster.map((m) => (
                <div
                  key={m.id}
                  className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                    isLight
                      ? "bg-slate-50 border-slate-200 shadow-xs"
                      : "bg-neutral-900/30 border-neutral-800/60"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className={`font-bold text-[11px] truncate ${isLight ? "text-slate-900" : "text-white"}`}>{m.name}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{m.role}</p>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase flex-shrink-0 ${
                      m.dutyStatus === "ON_DUTY"
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                        : m.dutyStatus === "BUSY"
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-300"
                        : isLight
                        ? "bg-slate-200 text-slate-600"
                        : "bg-neutral-800 text-neutral-500"
                    }`}
                  >
                    {m.dutyStatus.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
