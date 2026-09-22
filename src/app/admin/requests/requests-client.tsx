"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  RefreshCw,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  User,
  Calendar,
  Tag,
  FileText,
  MessageCircle,
  Send,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  X,
  Phone,
  HelpCircle,
  Check,
  Sparkles,
  Trash2,
  Globe,
  Copy,
  CheckCheck,
  Zap,
  Wand2,
  Bold,
  Italic,
  Strikethrough,
  Smile,
} from "lucide-react";

function YouTubeIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={`${className} fill-current`} viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={`${className} fill-current`} viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export interface ResourceRequest {
  id: string;
  user_id: string | null;
  name: string;
  whatsapp_number: string;
  masked_whatsapp?: string;
  resource_name: string;
  category: string;
  description: string;
  status: "pending" | "reviewing" | "approved" | "rejected" | "completed";
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  contacted_at: string | null;
  resolved_at: string | null;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    icon: Clock,
  },
  reviewing: {
    label: "Reviewing",
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    icon: Search,
  },
  approved: {
    label: "Approved",
    color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    icon: XCircle,
  },
  completed: {
    label: "Completed",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    icon: CheckCircle2,
  },
};

export function RequestsClient() {
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal / Drawer
  const [selectedRequest, setSelectedRequest] = useState<ResourceRequest | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // WhatsApp Message Composer & Studio
  const [activeTemplate, setActiveTemplate] = useState<number>(0);
  const [whatsappStyle, setWhatsappStyle] = useState<
    "techie" | "vip" | "friendly" | "direct" | "tanglish"
  >("techie");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [copiedMessage, setCopiedMessage] = useState(false);

  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fetchRequests = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          per_page: "25",
          status: statusFilter,
          sort: sortOrder,
        });
        if (searchQuery.trim()) {
          params.set("q", searchQuery.trim());
        }

        const res = await fetch(`/api/requests?${params}`);
        const data = await res.json();

        if (res.ok) {
          setRequests(data.requests || []);
          setTotalCount(data.total || 0);
        } else {
          setToastMessage({
            type: "error",
            text: data.error || "Failed to load resource requests.",
          });
        }
      } catch {
        setToastMessage({
          type: "error",
          text: "Network error loading requests.",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [statusFilter, sortOrder, searchQuery, page]
  );

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  // Load single request with full unmasked WhatsApp number
  const handleOpenDetail = async (req: ResourceRequest) => {
    setSelectedRequest(req);
    setAdminNote(req.admin_note || "");
    setLoadingDetail(true);

    try {
      const res = await fetch(`/api/requests/${req.id}`);
      const data = await res.json();
      if (res.ok && data.request) {
        setSelectedRequest(data.request);
        setAdminNote(data.request.admin_note || "");
        initWhatsAppMessage(data.request, 0);
      } else {
        initWhatsAppMessage(req, 0);
      }
    } catch {
      initWhatsAppMessage(req, 0);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Social and Site URLs
  const SITE_URL = "https://nammatech.in";
  const YT_URL = "https://www.youtube.com/channel/UCavl9VKjbVWJBsqlVaCiIsw";
  const IG_URL = "https://www.instagram.com/techiemuthuraj/";

  // Rich WhatsApp message generator across 5 styles and 5 templates
  const getMessageTemplate = (
    req: ResourceRequest,
    templateIndex: number,
    style: "techie" | "vip" | "friendly" | "direct" | "tanglish" = whatsappStyle
  ) => {
    const name = req.name?.trim() || "there";
    const resource = req.resource_name?.trim() || "your requested tool";
    const searchUrl = `${SITE_URL}/search?q=${encodeURIComponent(resource)}`;

    if (style === "techie") {
      switch (templateIndex) {
        case 0:
          return `⚡ *NAMMATECH // REQUEST RECEIVED* ⚡\n\nHey *${name}*! 👋\n\nWe locked in your request for *"${resource}"*! 🎮💻\nOur tech team is reviewing and verifying the cleanest, safest version for you.\n\n🔗 *Official Website:* ${SITE_URL}\n📺 *YouTube Channel:* ${YT_URL}\n📸 *Instagram:* ${IG_URL}\n\nWe'll ping you here as soon as it's live! 🚀✨`;
        case 1:
          return `⚡ *NAMMATECH // QUICK SPECS NEEDED* ⚡\n\nYo *${name}*! 🛠️\nRegarding your request for *"${resource}"*:\nCould you tell us:\n• Target OS / Platform (e.g. Windows 11, Android 14)?\n• Any specific build, patch, or feature needed?\n\nDrop a quick reply here so we can grab the exact one! 💡\n\n🌐 ${SITE_URL} | 📺 YouTube: @TechieMuthuraj`;
        case 2:
          return `🚀 *NAMMATECH // RESOURCE DEPLOYED!* 🚀\n\nAwesome news, *${name}*! 🎉\nYour requested resource *"${resource}"* is now live & 100% verified on NammaTech! 💎\n\n📥 *Download / Access Now:* ${searchUrl}\n\n📺 *Watch Setup Guide on YouTube:* ${YT_URL}\n📸 *Follow on Instagram:* ${IG_URL}\n\nEnjoy the boost and game on! 🔥🕹️`;
        case 3:
          return `⚠️ *NAMMATECH // STATUS UPDATE* ⚠️\n\nHey *${name}*! 🤝\nWe reviewed your request for *"${resource}"*.\nDue to strict safety policies or licensing, an official safe version isn't currently available for direct release.\n\n💡 *Safe Alternatives Available:* ${SITE_URL}/explore\n\nFeel free to request another tool anytime! Thank you for staying safe with NammaTech. 🛡️`;
        case 4:
        default:
          return `⚡ *NAMMATECH DIRECT* ⚡\n\nHey *${name}*! Just checking in from NammaTech regarding *"${resource}"*. Need any further help or updates?\n\n🌐 ${SITE_URL}\n📺 ${YT_URL}`;
      }
    }

    if (style === "vip") {
      switch (templateIndex) {
        case 0:
          return `💎 *NAMMATECH VERIFIED CONCIERGE* 💎\n\nDear *${name}*,\n\nThank you for reaching out. We have successfully logged your priority request for *"${resource}"*.\nOur curators are reviewing verified sources to ensure 100% authentic delivery.\n\n🌐 *Portal:* ${SITE_URL}\n📺 *Official Channel:* ${YT_URL}\n📸 *Instagram:* ${IG_URL}\n\nYou will receive an update as soon as testing concludes. 🌟`;
        case 1:
          return `💎 *NAMMATECH CONCIERGE // SPECIFICATIONS* 💎\n\nDear *${name}*,\n\nTo ensure we provide the exact edition of *"${resource}"* suited for your setup, please share:\n1️⃣ Operating System (Windows / macOS / Android)\n2️⃣ Version or feature preferences\n\nSimply reply to this message directly. ✨\n\n🌐 ${SITE_URL}`;
        case 2:
          return `✨ *NAMMATECH // RESOURCE AVAILABLE* ✨\n\nDear *${name}*,\n\nWe are pleased to inform you that *"${resource}"* is verified and ready for you on NammaTech.\n\n📥 *Direct Link:* ${searchUrl}\n\n📺 *Video Walkthroughs:* ${YT_URL}\n📸 *Community Highlights:* ${IG_URL}\n\nThank you for choosing NammaTech! 💎`;
        case 3:
          return `🛡️ *NAMMATECH QUALITY ASSURANCE* 🛡️\n\nDear *${name}*,\n\nRegarding your request for *"${resource}"*:\nOur security protocols found no authentic release meeting our quality standards at this time.\n\n🔍 *Explore Curated Catalog:* ${SITE_URL}/explore\n\nWe welcome any alternative requests you may have. 🌟`;
        case 4:
        default:
          return `💎 *NAMMATECH SUPPORT* 💎\n\nDear *${name}*, this is Muthuraj from NammaTech following up on *"${resource}"*. We are at your service for any assistance.\n\n🌐 ${SITE_URL}`;
      }
    }

    if (style === "friendly") {
      switch (templateIndex) {
        case 0:
          return `👋 *Hi ${name}!* Muthuraj here from NammaTech 💙\n\nGot your request for *"${resource}"*! Thank you for trusting NammaTech.\nI'm already looking into this with the team to get you the best working solution. ✨\n\n🌐 Check out the site: ${SITE_URL}\n📺 Subscribe on YouTube: ${YT_URL}\n📸 Connect on Instagram: ${IG_URL}\n\nWill message you here with the update soon! 🚀`;
        case 1:
          return `👋 *Hey ${name}!* Quick question about *"${resource}"* 🤔\n\nCould you let me know which device or OS you're running (like Windows 10/11 or mobile)? Also let me know if there's any specific version you need.\n\nJust text back here! 👍\n\n📺 @TechieMuthuraj | 🌐 ${SITE_URL}`;
        case 2:
          return `🎉 *Good news, ${name}!* \n\nI just finished verifying *"${resource}"* and it's officially published on NammaTech! 🥳\n\n👉 *Grab it here:* ${searchUrl}\n\n📺 I also post guides and tech reviews on YouTube: ${YT_URL}\n📸 DM me anytime on Insta: ${IG_URL}\n\nHope this helps you out! Have a great day! 💙`;
        case 3:
          return `👋 *Hi ${name},* \n\nI personally checked for *"${resource}"*, but unfortunately couldn't find a clean and safe version right now that I would recommend. 🛡️\n\nCheck out the other resources we have on the website:\n👉 ${SITE_URL}/explore\n\nFeel free to ask for any other tools or games! 💙`;
        case 4:
        default:
          return `👋 *Hey ${name}!* Just checking in to see how *"${resource}"* is going for you. Drop a message anytime!\n\n🌐 ${SITE_URL} | 📺 YouTube: @TechieMuthuraj`;
      }
    }

    if (style === "tanglish") {
      switch (templateIndex) {
        case 0:
          return `வணக்கம் *${name}*! 🙏 Muthuraj here from NammaTech.\n\nUnga request for *"${resource}"* receive pannitom! 🎮✨\nNamma team ippo clean & safe version verify pannitu irukkom.\n\n🌐 *Website:* ${SITE_URL}\n📺 *YouTube Channel:* ${YT_URL}\n📸 *Instagram:* ${IG_URL}\n\nReady aanathum ingaye message panren! 🚀`;
        case 1:
          return `வணக்கம் *${name}*! 🛠️\nUnga *"${resource}"* request-ku oru chinna detail theva paduthu:\n• PC or Mobile? (Windows 10/11 or Android?)\n• Specific version preferences iruka?\n\nIngaye reply pannunga, seekirame arrange panren! 💡\n\n🌐 ${SITE_URL}`;
        case 2:
          return `🎉 *Semma News, ${name}!* \n\nNeenga request panna *"${resource}"* ippo NammaTech-la verified & available! 💎\n\n📥 *Download link:* ${searchUrl}\n\n📺 Tutorials paaka YouTube subscribe pannunga: ${YT_URL}\n📸 Updates ku Instagram follow pannunga: ${IG_URL}\n\nEnjoy panunga! 🔥`;
        case 3:
          return `வணக்கம் *${name}*! 🤝\nUnga *"${resource}"* request check pannom. Current-ah legal/safe version kedaikala nanba. 🛡️\n\n💡 *Alternative tools website-la iruku:* ${SITE_URL}/explore\n\nVera ethavathu resource venumna kandippa kelunga! Thank you. ✨`;
        case 4:
        default:
          return `வணக்கம் *${name}*! NammaTech Muthuraj here. *"${resource}"* pathina update ku ingaye connect pannalam!\n\n🌐 ${SITE_URL} | 📺 ${YT_URL}`;
      }
    }

    // Direct / Short
    switch (templateIndex) {
      case 0:
        return `Hi *${name}*, your request for *"${resource}"* is received and in review.\n\n🌐 ${SITE_URL}\n📺 YouTube: ${YT_URL}\n📸 Instagram: ${IG_URL}`;
      case 1:
        return `Hi *${name}*, which OS/platform and version do you need for *"${resource}"*? Please reply here. 💡\n\n🌐 ${SITE_URL}`;
      case 2:
        return `Hi *${name}*, *"${resource}"* is now live on NammaTech!\n\n📥 Link: ${searchUrl}\n📺 YouTube Guide: ${YT_URL}`;
      case 3:
        return `Hi *${name}*, *"${resource}"* could not be added due to availability. Safe alternatives: ${SITE_URL}/explore`;
      case 4:
      default:
        return `Hi *${name}*, updating you on *"${resource}"* from NammaTech.\n\n🌐 ${SITE_URL}`;
    }
  };

  const initWhatsAppMessage = (
    req: ResourceRequest,
    templateIdx: number,
    style = whatsappStyle
  ) => {
    setActiveTemplate(templateIdx);
    setWhatsappMessage(getMessageTemplate(req, templateIdx, style));
  };

  const handleTemplateChange = (idx: number, style = whatsappStyle) => {
    if (!selectedRequest) return;
    setActiveTemplate(idx);
    setWhatsappMessage(getMessageTemplate(selectedRequest, idx, style));
  };

  const handleStyleChange = (style: typeof whatsappStyle) => {
    setWhatsappStyle(style);
    if (!selectedRequest) return;
    setWhatsappMessage(getMessageTemplate(selectedRequest, activeTemplate, style));
  };

  const handleInsertSnippet = (snippet: string) => {
    setWhatsappMessage((prev) => (prev ? `${prev} ${snippet}` : snippet));
  };

  const handleFormatText = (symbol: string) => {
    setWhatsappMessage((prev) => (prev ? `${prev} ${symbol}text${symbol}` : `${symbol}text${symbol}`));
  };

  const handleCopyMessage = async () => {
    if (!whatsappMessage) return;
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    } catch {
      // fallback
    }
  };

  const renderWhatsAppFormattedText = (text: string) => {
    if (!text) return <span className="text-neutral-400 italic">Empty message...</span>;
    return text.split("\n").map((line, idx) => {
      const parts = line.split(/(https?:\/\/[^\s]+|\*[^*]+\*|_[^_]+_|~[^~]+~)/g);
      return (
        <div key={idx} className="min-h-[1.2rem]">
          {parts.map((part, pIdx) => {
            if (!part) return null;
            if (part.startsWith("http://") || part.startsWith("https://")) {
              return (
                <span
                  key={pIdx}
                  className="text-cyan-300 underline underline-offset-2 break-all font-mono"
                >
                  {part}
                </span>
              );
            }
            if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
              return (
                <strong key={pIdx} className="font-bold text-white">
                  {part.slice(1, -1)}
                </strong>
              );
            }
            if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
              return (
                <em key={pIdx} className="italic text-neutral-200">
                  {part.slice(1, -1)}
                </em>
              );
            }
            if (part.startsWith("~") && part.endsWith("~") && part.length > 2) {
              return (
                <del key={pIdx} className="line-through text-neutral-400">
                  {part.slice(1, -1)}
                </del>
              );
            }
            return <span key={pIdx}>{part}</span>;
          })}
        </div>
      );
    });
  };

  // Status update
  const handleUpdateStatus = async (status: ResourceRequest["status"]) => {
    if (!selectedRequest) return;
    setUpdatingId(selectedRequest.id);

    try {
      const res = await fetch(`/api/requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          admin_note: adminNote,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setToastMessage({
          type: "success",
          text: `Status updated to ${status.toUpperCase()}.`,
        });
        setSelectedRequest((prev) => (prev ? { ...prev, status, admin_note: adminNote } : null));
        setRequests((prev) =>
          prev.map((r) =>
            r.id === selectedRequest.id ? { ...r, status, admin_note: adminNote } : r
          )
        );
      } else {
        setToastMessage({ type: "error", text: data.error || "Failed to update status." });
      }
    } catch {
      setToastMessage({ type: "error", text: "Error updating request status." });
    } finally {
      setUpdatingId(null);
    }
  };

  // Save Admin Note
  const handleSaveNote = async () => {
    if (!selectedRequest) return;
    setSavingNote(true);

    try {
      const res = await fetch(`/api/requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_note: adminNote }),
      });

      const data = await res.json();
      if (res.ok) {
        setToastMessage({ type: "success", text: "Admin note saved." });
        setSelectedRequest((prev) => (prev ? { ...prev, admin_note: adminNote } : null));
        setRequests((prev) =>
          prev.map((r) => (r.id === selectedRequest.id ? { ...r, admin_note: adminNote } : r))
        );
      } else {
        setToastMessage({ type: "error", text: data.error || "Failed to save note." });
      }
    } catch {
      setToastMessage({ type: "error", text: "Error saving admin note." });
    } finally {
      setSavingNote(false);
    }
  };

  // Open WhatsApp & Record contacted_at
  const handleOpenWhatsApp = async () => {
    if (!selectedRequest || !selectedRequest.whatsapp_number) return;

    // Clean phone number (digits only with leading plus)
    const cleanPhone = selectedRequest.whatsapp_number.replace(/[^\d+]/g, "");
    const waPhone = cleanPhone.startsWith("+") ? cleanPhone.slice(1) : cleanPhone;
    const encodedText = encodeURIComponent(whatsappMessage);
    const waUrl = `https://wa.me/${waPhone}?text=${encodedText}`;

    // Open WhatsApp Web/App in new window
    window.open(waUrl, "_blank", "noopener,noreferrer");

    // Track contacted_at in background
    try {
      const nowIso = new Date().toISOString();
      await fetch(`/api/requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ record_contact: true }),
      });
      setSelectedRequest((prev) => (prev ? { ...prev, contacted_at: nowIso } : null));
      setRequests((prev) =>
        prev.map((r) => (r.id === selectedRequest.id ? { ...r, contacted_at: nowIso } : r))
      );
    } catch {
      // Non-blocking
    }
  };

  // Permanently Delete Request
  const handleDeleteRequest = async (id: string, resourceName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete the request for "${resourceName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setToastMessage({
          type: "success",
          text: `Request for "${resourceName}" was deleted.`,
        });
        setRequests((prev) => prev.filter((r) => r.id !== id));
        setTotalCount((prev) => Math.max(0, prev - 1));
        if (selectedRequest?.id === id) {
          setSelectedRequest(null);
        }
      } else {
        setToastMessage({
          type: "error",
          text: data.error || "Failed to delete request.",
        });
      }
    } catch {
      setToastMessage({
        type: "error",
        text: "Network error while deleting request.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Real Database Metrics KPI Calculation
  const stats = {
    total: totalCount,
    pending: requests.filter((r) => r.status === "pending").length,
    reviewing: requests.filter((r) => r.status === "reviewing").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Section Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-semibold tracking-wide uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Resource Requests Engine • Realtime Feedback
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-cyan-400" />
            <span>Resource Requests</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Review user-requested tools, verify legal distribution, and communicate directly through WhatsApp with one-click message templates.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchRequests(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-700/80 bg-neutral-800/60 hover:bg-neutral-800 text-xs font-semibold text-neutral-200 hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
            <span>{refreshing ? "Syncing..." : "Sync Requests"}</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: stats.total, color: "text-white", bg: "bg-blue-500/10 text-blue-400" },
          { label: "Pending", value: stats.pending, color: "text-amber-400", bg: "bg-amber-500/10 text-amber-400" },
          { label: "Reviewing", value: stats.reviewing, color: "text-blue-400", bg: "bg-blue-500/10 text-blue-400" },
          { label: "Completed", value: stats.completed, color: "text-emerald-400", bg: "bg-emerald-500/10 text-emerald-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-md shadow-sm flex items-center gap-3.5"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${stat.bg}`}>
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-xl font-black mt-0.5 ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-3xl border border-neutral-800/80 bg-neutral-900/50 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by resource name, user, WhatsApp, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950/80 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all shadow-inner"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3.5 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="reviewing">Reviewing</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>

        {/* Sort Order */}
        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value);
            setPage(1);
          }}
          className="px-3.5 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-neutral-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Main Grid: Requests List + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table / List View */}
        <div
          className={`rounded-3xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-xl shadow-2xl overflow-hidden ${
            selectedRequest ? "lg:col-span-7" : "lg:col-span-12"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-7 h-7 animate-spin text-cyan-400" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20 px-4">
              <Package className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-neutral-300">No resource requests yet.</p>
              <p className="text-xs text-neutral-500 mt-1">
                When users submit requests from the /request page, they will appear here in realtime.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-950/60 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Request / Tool</th>
                    <th className="px-4 py-3.5">User Details</th>
                    <th className="px-4 py-3.5">WhatsApp (Masked)</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Created</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/70 text-xs">
                  {requests.map((req) => {
                    const statusConf = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                    const StatusIcon = statusConf.icon;
                    const isSelected = selectedRequest?.id === req.id;

                    return (
                      <tr
                        key={req.id}
                        className={`transition-colors hover:bg-neutral-800/40 cursor-pointer ${
                          isSelected ? "bg-neutral-800/70" : ""
                        }`}
                        onClick={() => handleOpenDetail(req)}
                      >
                        {/* Request Name */}
                        <td className="px-5 py-4">
                          <div className="font-bold text-white max-w-[200px] truncate">
                            {req.resource_name}
                          </div>
                          {req.description && (
                            <div className="text-[11px] text-neutral-400 max-w-[200px] truncate mt-0.5">
                              {req.description}
                            </div>
                          )}
                        </td>

                        {/* User Name */}
                        <td className="px-4 py-4">
                          <div className="font-semibold text-neutral-200">{req.name}</div>
                          {req.user_id ? (
                            <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                              Registered
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded">
                              Guest
                            </span>
                          )}
                        </td>

                        {/* WhatsApp (Masked) */}
                        <td className="px-4 py-4 font-mono text-neutral-300">
                          {req.masked_whatsapp || req.whatsapp_number}
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-800 text-neutral-300">
                            {req.category}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusConf.color}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            <span>{statusConf.label}</span>
                          </span>
                        </td>

                        {/* Created Date */}
                        <td className="px-4 py-4 text-neutral-400 text-[11px] whitespace-nowrap">
                          {formatDate(req.created_at)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetail(req);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-xs font-semibold text-white transition-all cursor-pointer shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === req.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRequest(req.id, req.resource_name);
                              }}
                              className="inline-flex items-center justify-center p-1.5 rounded-xl border border-rose-900/50 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 transition-all cursor-pointer disabled:opacity-50"
                              title="Delete Request"
                            >
                              {deletingId === req.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Request Detail View (Opens when admin clicks View Request) ── */}
        {selectedRequest && (
          <div className="lg:col-span-5 rounded-3xl border border-neutral-800 bg-neutral-900/90 backdrop-blur-2xl p-6 shadow-2xl space-y-6 lg:sticky lg:top-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  Request Dossier
                </span>
                <h2 className="text-lg font-black text-white tracking-tight mt-0.5">
                  {selectedRequest.resource_name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-neutral-400">{selectedRequest.category}</span>
                  <span className="text-neutral-600">•</span>
                  <span className="text-xs text-neutral-400">
                    {formatDate(selectedRequest.created_at)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. USER DETAILS FIRST (Explicit Requirement) */}
            <div className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>USER DETAILS</span>
                </span>
                {selectedRequest.contacted_at && (
                  <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Check className="w-3 h-3" />
                    <span>WhatsApp Contacted</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-neutral-400 block text-[11px]">Name</span>
                  <strong className="text-white text-sm block mt-0.5">
                    {selectedRequest.name}
                  </strong>
                </div>

                <div>
                  <span className="text-neutral-400 block text-[11px]">WhatsApp</span>
                  <strong className="text-emerald-400 text-sm block mt-0.5 font-mono">
                    {selectedRequest.whatsapp_number}
                  </strong>
                </div>
              </div>
            </div>

            {/* 2. REQUEST DETAILS */}
            <div className="space-y-3 text-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                REQUEST DETAILS
              </span>

              <div>
                <span className="text-neutral-400 text-[11px] block">Resource</span>
                <p className="text-white font-semibold text-sm mt-0.5">
                  {selectedRequest.resource_name}
                </p>
              </div>

              <div>
                <span className="text-neutral-400 text-[11px] block">Description</span>
                <p className="text-neutral-300 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80 mt-1 leading-relaxed whitespace-pre-wrap">
                  {selectedRequest.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* 3. WHATSAPP DIRECT MESSAGE INTEGRATION & STUDIO */}
            <div className="p-4 sm:p-5 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 space-y-4 shadow-xl relative overflow-hidden">
              {/* Studio Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <span>WhatsApp Communication Studio</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </h3>
                    <p className="text-[10px] text-neutral-400">
                      High-converting formatted templates with official channel links
                    </p>
                  </div>
                </div>
                {selectedRequest.contacted_at ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Contacted</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Ready</span>
                  </span>
                )}
              </div>

              {/* Message Tone & Style Switcher */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Wand2 className="w-3 h-3 text-emerald-400" />
                    <span>Message Tone & Style</span>
                  </span>
                  <span className="text-emerald-400/80 font-mono lowercase">
                    {whatsappStyle} mode
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 text-[10px] font-semibold">
                  {[
                    { id: "techie" as const, label: "⚡ Techie" },
                    { id: "vip" as const, label: "💎 VIP" },
                    { id: "friendly" as const, label: "🌟 Friendly" },
                    { id: "direct" as const, label: "🎯 Short" },
                    { id: "tanglish" as const, label: "🌴 Tanglish" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleStyleChange(s.id)}
                      className={`py-1.5 px-1 rounded-xl border text-center transition-all truncate cursor-pointer ${
                        whatsappStyle === s.id
                          ? "bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 border-emerald-400 text-emerald-200 shadow-sm shadow-emerald-950"
                          : "border-neutral-800/80 bg-neutral-950/60 text-neutral-400 hover:text-white hover:border-neutral-700"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Presets Selector */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Action Presets
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px] font-semibold">
                  {[
                    { idx: 0, icon: "📥", label: "Request Received" },
                    { idx: 1, icon: "🔍", label: "Need More Info" },
                    { idx: 2, icon: "🚀", label: "Resource Live" },
                    { idx: 3, icon: "⚠️", label: "Alternative Sent" },
                    { idx: 4, icon: "💬", label: "Direct Follow-up" },
                  ].map((tpl) => (
                    <button
                      key={tpl.idx}
                      type="button"
                      onClick={() => handleTemplateChange(tpl.idx)}
                      className={`py-1.5 px-2 rounded-xl border transition-all text-left flex items-center gap-1.5 cursor-pointer truncate ${
                        activeTemplate === tpl.idx
                          ? "bg-emerald-500/25 border-emerald-500 text-emerald-200 shadow-sm"
                          : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white"
                      }`}
                    >
                      <span className="text-xs">{tpl.icon}</span>
                      <span className="truncate">{tpl.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 1-Click Quick Insert Toolbar (Links, Formatting, Emojis) */}
              <div className="p-2.5 rounded-2xl bg-neutral-950/80 border border-neutral-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Quick Insert Links & Emojis</span>
                  </span>
                  <span className="text-[10px] text-neutral-500">1-click inject</span>
                </div>

                {/* Direct Channel Link Chips */}
                <div className="flex flex-wrap gap-1.5 text-[10px] font-medium">
                  <button
                    type="button"
                    onClick={() => handleInsertSnippet(SITE_URL)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-all cursor-pointer"
                  >
                    <Globe className="w-3 h-3 text-blue-400" />
                    <span>+ Website</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertSnippet(YT_URL)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 transition-all cursor-pointer"
                  >
                    <YouTubeIcon className="w-3 h-3 text-red-500" />
                    <span>+ YouTube</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertSnippet(IG_URL)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 transition-all cursor-pointer"
                  >
                    <InstagramIcon className="w-3 h-3 text-pink-400" />
                    <span>+ Instagram</span>
                  </button>
                  {selectedRequest && (
                    <button
                      type="button"
                      onClick={() =>
                        handleInsertSnippet(
                          `${SITE_URL}/search?q=${encodeURIComponent(
                            selectedRequest.resource_name
                          )}`
                        )
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>+ Resource Link</span>
                    </button>
                  )}
                </div>

                {/* Formatting Chips & Quick Emojis */}
                <div className="flex items-center justify-between pt-1 border-t border-neutral-900 gap-2 overflow-x-auto">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleFormatText("*")}
                      className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold text-[10px] border border-neutral-800 cursor-pointer"
                      title="Bold: *text*"
                    >
                      *B*
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormatText("_")}
                      className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 italic text-[10px] border border-neutral-800 cursor-pointer"
                      title="Italic: _text_"
                    >
                      _I_
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFormatText("~")}
                      className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 line-through text-[10px] border border-neutral-800 cursor-pointer"
                      title="Strikethrough: ~text~"
                    >
                      ~S~
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertSnippet("• ")}
                      className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[10px] border border-neutral-800 cursor-pointer"
                      title="Bullet point"
                    >
                      •
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {["🚀", "🎮", "💻", "💎", "📥", "⚡", "🌟", "✨", "🛡️", "💡", "🔥", "👍", "💙"].map(
                      (emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleInsertSnippet(emoji)}
                          className="hover:scale-125 transition-transform text-xs cursor-pointer p-0.5"
                        >
                          {emoji}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Editable Message Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-neutral-400">
                  <span>Message text (WhatsApp Markdown supported):</span>
                  <div className="flex items-center gap-2">
                    <span>{whatsappMessage.length} chars</span>
                    <button
                      type="button"
                      onClick={() => setWhatsappMessage("")}
                      className="hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <textarea
                  rows={4}
                  value={whatsappMessage}
                  onChange={(e) => setWhatsappMessage(e.target.value)}
                  placeholder="Type your WhatsApp message..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-neutral-800 bg-neutral-950 font-mono text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-y min-h-[90px] leading-relaxed"
                />
              </div>

              {/* Realistic Live WhatsApp Chat Preview */}
              <div className="rounded-2xl border border-emerald-950/60 bg-[#0b141a] p-3.5 space-y-2 shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80 text-[10px]">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>WhatsApp Live Preview</span>
                  </div>
                  <span className="text-neutral-500 text-[10px]">Recipient view</span>
                </div>

                {/* WhatsApp Chat Bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[95%] rounded-2xl rounded-tr-xs bg-[#005c4b] text-neutral-100 p-3 text-[11px] leading-relaxed shadow-lg relative space-y-1">
                    <div className="text-[10px] font-bold text-emerald-200 flex items-center justify-between pb-1 border-b border-emerald-600/40">
                      <span>Muthuraj • NammaTech Official</span>
                      <span className="text-[9px] text-emerald-300/80">online</span>
                    </div>

                    <div className="pt-0.5 space-y-1">
                      {renderWhatsAppFormattedText(whatsappMessage)}
                    </div>

                    <div className="flex items-center justify-end gap-1 text-[9px] text-emerald-200/70 pt-1">
                      <span>Just now</span>
                      <CheckCheck className="w-3.5 h-3.5 text-sky-400 inline shrink-0" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Message on WhatsApp + Copy Text */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="px-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  {copiedMessage ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="sm:col-span-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950/60 cursor-pointer active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 fill-white/20" />
                  <span>Message on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>
              </div>
            </div>

            {/* 4. ADMIN NOTE (Internal & Private) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                  ADMIN NOTE (PRIVATE)
                </span>
                <button
                  type="button"
                  disabled={savingNote}
                  onClick={handleSaveNote}
                  className="text-[11px] text-cyan-400 hover:underline font-semibold cursor-pointer"
                >
                  {savingNote ? "Saving..." : "Save Note"}
                </button>
              </div>
              <textarea
                rows={2}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Checking whether an official/legal download is available..."
                className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 resize-none"
              />
            </div>

            {/* 5. STATUS TRANSITION ACTIONS */}
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block mb-1">
                UPDATE STATUS
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    status: "pending",
                    label: "Pending",
                    className: "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20",
                  },
                  {
                    status: "reviewing",
                    label: "Reviewing",
                    className: "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20",
                  },
                  {
                    status: "approved",
                    label: "Approved",
                    className: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20",
                  },
                  {
                    status: "rejected",
                    label: "Rejected",
                    className: "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20",
                  },
                  {
                    status: "completed",
                    label: "Completed",
                    className: "col-span-2 border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 py-2.5",
                  },
                ].map((action) => (
                  <button
                    key={action.status}
                    type="button"
                    disabled={updatingId === selectedRequest.id || selectedRequest.status === action.status}
                    onClick={() => handleUpdateStatus(action.status as ResourceRequest["status"])}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-40 cursor-pointer ${action.className}`}
                  >
                    {updatingId === selectedRequest.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : null}
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 6. DANGER ZONE - DELETE REQUEST */}
            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-rose-400">Permanently Remove</div>
                <div className="text-[10px] text-neutral-500">Deletes request from database</div>
              </div>
              <button
                type="button"
                disabled={deletingId === selectedRequest.id}
                onClick={() =>
                  handleDeleteRequest(selectedRequest.id, selectedRequest.resource_name)
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {deletingId === selectedRequest.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete Request</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
