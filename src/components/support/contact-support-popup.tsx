"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Headphones,
  X,
  Minus,
  MessageSquare,
  Mail,
  Phone,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { LiveSupportChat } from "./live-support-chat";
import { useToast } from "@/components/ui/toast";

const WHATSAPP_NUMBER = "919944875726";
const SUPPORT_EMAIL = "techsavvy.muthuraj.dev@gmail.com";

const WHATSAPP_TEMPLATES = [
  {
    id: "install",
    title: "Software Setup & Installation",
    icon: "🛠️",
    text: "Hello Technical Support team, I need assistance with installing software or APKs on my PC/Android.",
  },
  {
    id: "crash",
    title: "Error / Crash Fix",
    icon: "🎮",
    text: "Hello Technical Support team, I encountered an error or missing DLL while running an application downloaded from NammaTech.",
  },
  {
    id: "vip",
    title: "VIP Drive Mirror Access",
    icon: "👑",
    text: "Hi Technical Support team, I have a query regarding high-speed Google Drive mirrors and VIP account access.",
  },
  {
    id: "request",
    title: "Request a Tool or Game",
    icon: "💡",
    text: "Hi Technical Support team, I would like to request an updated software or game repack on NammaTech.",
  },
];

export function ContactSupportPopup() {
  const pathname = usePathname();
  const { showToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "whatsapp" | "helpline">("chat");
  const [customMsg, setCustomMsg] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Close popup or don't render floating trigger on full support page if desired
  const isDedicatedSupportPage = pathname === "/account/support" || pathname === "/contact";

  // Listen for global open requests (e.g. from navbar or buttons: window.dispatchEvent(new CustomEvent('open-support-popup')))
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-support-popup", handleOpen);
    return () => window.removeEventListener("open-support-popup", handleOpen);
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopiedEmail(true);
    showToast({
      type: "success",
      title: "Email Copied! 📋",
      message: `${SUPPORT_EMAIL} copied to clipboard.`,
    });
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const openWhatsApp = (messageText: string) => {
    const text = encodeURIComponent(messageText.trim() || "Hello Muthuraj Technical Support Team, I need help.");
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (isDedicatedSupportPage) {
    return null;
  }

  return (
    <>
      {/* ── 1. FLOATING LAUNCHER BUTTON ── */}
      {!isOpen && (
        <aside
          aria-label="Contact & Support Quick Access"
          className="fixed bottom-16 right-4 sm:bottom-20 sm:right-6 z-40 select-none animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open Contact & Support Hub"
            className="group relative flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-full border border-emerald-500/40 bg-neutral-950/90 hover:bg-neutral-900 text-white shadow-2xl shadow-emerald-950/50 hover:scale-105 hover:border-emerald-400 active:scale-95 transition-all duration-200 backdrop-blur-xl cursor-pointer"
          >
            {/* Glowing Neon Ambient Ring */}
            <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-emerald-500/40 to-teal-500/30 blur-sm opacity-60 group-hover:opacity-100 transition-opacity" />

            {/* Icon with Live Pulse Indicator */}
            <span className="relative flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-neutral-950 shadow-md shadow-emerald-500/30 flex-shrink-0">
              <Headphones className="w-3.5 h-3.5 text-neutral-950 stroke-[2.5]" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-neutral-950" />
              </span>
            </span>

            {/* Label and Status */}
            <span className="relative flex flex-col items-start leading-tight">
              <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Support &amp; Help</span>
                <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE
                </span>
              </span>
              <span className="text-[9px] font-medium text-neutral-400 group-hover:text-emerald-300 transition-colors">
                Instant technical assistance
              </span>
            </span>
          </button>
        </aside>
      )}

      {/* ── 2. EXPANDED SUPPORT POPUP DIALOG ── */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[460px] h-[620px] max-h-[85vh] rounded-3xl border border-neutral-800 bg-neutral-950/95 backdrop-blur-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
          {/* Header Bar */}
          <div className="px-4 py-3.5 border-b border-neutral-800/80 bg-neutral-900/70 flex items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-neutral-950 shadow-md shadow-emerald-500/20">
                  <Headphones className="w-4 h-4 text-neutral-950 stroke-[2.5]" />
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-neutral-950 absolute -bottom-0.5 -right-0.5 animate-pulse" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-tight truncate">
                    NammaTech Support Desk
                  </h3>
                  <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                    24/7
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Engineering Specialists Online
                </p>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize support"
                aria-label="Minimize support dialog"
                className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close support"
                aria-label="Close support dialog"
                className="p-1.5 rounded-xl hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-3 p-1.5 bg-neutral-900/40 border-b border-neutral-800/60 text-xs flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold transition-all ${
                activeTab === "chat"
                  ? "bg-neutral-800 text-white shadow-sm border border-neutral-700/80"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("whatsapp")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold transition-all ${
                activeTab === "whatsapp"
                  ? "bg-neutral-800 text-white shadow-sm border border-neutral-700/80"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
              }`}
            >
              <span className="text-sm">💬</span>
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("helpline")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold transition-all ${
                activeTab === "helpline"
                  ? "bg-neutral-800 text-white shadow-sm border border-neutral-700/80"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Helpline</span>
            </button>
          </div>

          {/* ── TAB CONTENT ── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* ── TAB 1: LIVE 1-ON-1 CHAT ── */}
            {activeTab === "chat" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <LiveSupportChat compact={true} />
              </div>
            )}

            {/* ── TAB 2: WHATSAPP DIRECT CONNECT ── */}
            {activeTab === "whatsapp" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Official Profile Badge */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-neutral-900/60 to-neutral-950 border border-emerald-500/30 flex items-center gap-3.5 shadow-lg">
                  <div className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-500/30 flex-shrink-0">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.076-2.007-.468-1.579-.654-2.612-2.261-2.693-2.368-.081-.107-.648-.862-.648-1.644 0-.781.408-1.166.554-1.326.145-.16.317-.2.423-.2.106 0 .212.001.305.006.098.005.23-.037.36.275.133.32.454 1.109.493 1.19.039.081.066.176.012.283-.054.107-.081.174-.162.268-.08.094-.171.21-.244.282-.081.08-.166.168-.071.332.095.163.421.696.904 1.126.621.554 1.144.726 1.307.808.163.081.258.071.353-.04.095-.11.407-.474.516-.637.109-.163.218-.137.367-.082.15.054.95.448 1.114.53.164.081.272.122.313.19.041.069.041.4-.103.805z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-white truncate">NammaTech Technical Support</h4>
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate">
                      Direct WhatsApp Channel • +91 99448 75726
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Typical reply time: &lt; 5 minutes
                    </span>
                  </div>
                </div>

                {/* Instant Topic Selection */}
                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                    Pick a Support Topic for 1-Tap Message:
                  </label>
                  <div className="space-y-2">
                    {WHATSAPP_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => openWhatsApp(tmpl.text)}
                        className="w-full p-3 rounded-2xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/80 text-left transition-all group flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-500/40"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-base flex-shrink-0">{tmpl.icon}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                              {tmpl.title}
                            </p>
                            <p className="text-[10px] text-neutral-400 truncate max-w-xs">
                              {tmpl.text}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Message Field */}
                <div className="pt-2 border-t border-neutral-800/60 space-y-2">
                  <label htmlFor="wa-custom-msg" className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Or Type Your Own Custom Message:
                  </label>
                  <textarea
                    id="wa-custom-msg"
                    rows={2}
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                    placeholder="Type your question or query here..."
                    className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-900 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => openWhatsApp(customMsg || "Hello Technical Support team, I need assistance.")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <span>Launch WhatsApp Chat</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* ── TAB 3: HELPLINE & LINKS ── */}
            {activeTab === "helpline" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Email Support Card */}
                <div className="p-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Technical Support Email</h4>
                      <p className="text-[10px] text-neutral-400">Guaranteed response within 24h</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-200">
                    <span className="truncate">{SUPPORT_EMAIL}</span>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      title="Copy email"
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                    >
                      {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Response Commitment Card */}
                <div className="grid grid-cols-2 gap-2.5 text-center">
                  <div className="p-3 rounded-2xl border border-neutral-800 bg-neutral-900/40">
                    <span className="text-base block mb-1">⚡</span>
                    <span className="text-xs font-bold text-white block">&lt; 15 Mins</span>
                    <span className="text-[10px] text-neutral-400">Average Live Response</span>
                  </div>
                  <div className="p-3 rounded-2xl border border-neutral-800 bg-neutral-900/40">
                    <span className="text-base block mb-1">🛡️</span>
                    <span className="text-xs font-bold text-white block">Verified Help</span>
                    <span className="text-[10px] text-neutral-400">100% Safe Mirrors</span>
                  </div>
                </div>

                {/* Quick Navigation Links */}
                <div className="space-y-2 pt-2 border-t border-neutral-800/60">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Full Support Portals:
                  </span>

                  <Link
                    href="/account/support"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-xs font-bold text-white transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-emerald-400" />
                      <span>Technical Support Dashboard</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-xs font-bold text-white transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span>Official Contact &amp; Inquiry Form</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2.5 border-t border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between text-[10px] text-neutral-400 flex-shrink-0">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Encrypted Technical Support Hub</span>
            </span>
            <span className="text-neutral-500">Muthuraj C • NammaTech</span>
          </div>
        </div>
      )}
    </>
  );
}
