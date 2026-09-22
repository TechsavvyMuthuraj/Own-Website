"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Headphones,
  ShieldCheck,
  Zap,
  Terminal,
  Cpu,
  Monitor,
  Globe,
  Wifi,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Download,
  AlertTriangle,
  FileCode,
  Sparkles,
  ArrowRight,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { LiveSupportChat } from "@/components/support/live-support-chat";
import { useToast } from "@/components/ui/toast";

interface SystemDiagnostics {
  os: string;
  browser: string;
  resolution: string;
  cores: number | string;
  memory: string;
  gpu: string;
  online: boolean;
  userAgent: string;
}

const COMMON_TOOLKITS = [
  {
    title: "Visual C++ 2015–2022 All-in-One",
    description: "Fixes 95% of launch errors (vcruntime140.dll, msvcp140.dll missing errors).",
    badge: "Must-Have",
    url: "https://aka.ms/vs/17/release/vc_redist.x64.exe",
  },
  {
    title: "DirectX End-User Web Installer",
    description: "Installs legacy DirectX 9/10/11 game libraries required for repacks and software.",
    badge: "DirectX",
    url: "https://www.microsoft.com/en-us/download/details.aspx?id=35",
  },
  {
    title: ".NET 8.0 / 9.0 Desktop Runtime",
    description: "Executes modern WPF and Windows desktop applications and keygens.",
    badge: ".NET Runtime",
    url: "https://dotnet.microsoft.com/en-us/download/dotnet/8.0",
  },
  {
    title: "7-Zip 64-Bit Archive Extractor",
    description: "Avoids corrupted ZIP extractions and handles multi-part .001 .part1 archives.",
    badge: "Recommended",
    url: "https://www.7-zip.org/download.html",
  },
];

const COMMON_ERROR_GUIDES = [
  {
    code: "0xc0000142",
    title: "Application Failed to Initialize Properly",
    solution: "Missing VC++ runtime libraries or Windows Defender quarantined the modified .dll file. Add folder to Defender exclusions and reinstall VC++ 2022.",
  },
  {
    code: "0xc000007b",
    title: "Invalid Image Format / 32-bit vs 64-bit Conflict",
    solution: "A 32-bit DLL was placed into System32 instead of SysWOW64. Install both x86 and x64 Visual C++ runtimes.",
  },
  {
    code: "ISDone.dll / Unarc.dll error",
    title: "Decompression Memory Error",
    solution: "Increase your Windows virtual memory pagefile to at least 16GB and run the setup in Windows 7 compatibility mode.",
  },
];

export default function TechnicalSupportDashboardPage() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [copiedSpecs, setCopiedSpecs] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<"LIVE_CHAT" | "DIAGNOSTICS" | "TOOLKITS">("LIVE_CHAT");

  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics>({
    os: "Detecting...",
    browser: "Detecting...",
    resolution: "Detecting...",
    cores: "—",
    memory: "—",
    gpu: "Detecting...",
    online: true,
    userAgent: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect OS
    let detectedOS = "Unknown OS";
    const ua = navigator.userAgent;
    if (ua.includes("Win")) detectedOS = "Windows (x64)";
    else if (ua.includes("Mac")) detectedOS = "macOS";
    else if (ua.includes("Linux")) detectedOS = "Linux";
    else if (ua.includes("Android")) detectedOS = "Android";
    else if (ua.includes("iPhone") || ua.includes("iPad")) detectedOS = "iOS";

    // Detect Browser
    let detectedBrowser = "Modern Browser";
    if (ua.includes("Edg/")) detectedBrowser = "Microsoft Edge";
    else if (ua.includes("Chrome/")) detectedBrowser = "Google Chrome";
    else if (ua.includes("Firefox/")) detectedBrowser = "Mozilla Firefox";
    else if (ua.includes("Safari/")) detectedBrowser = "Apple Safari";

    // Detect GPU via WebGL
    let detectedGpu = "Standard Hardware Renderer";
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        const debugInfo = (gl as any).getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          detectedGpu = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || detectedGpu;
        }
      }
    } catch {
      // ignore
    }

    setDiagnostics({
      os: detectedOS,
      browser: detectedBrowser,
      resolution: `${window.screen.width} × ${window.screen.height} (${window.devicePixelRatio}x scale)`,
      cores: navigator.hardwareConcurrency || "4+",
      memory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB+` : "8 GB+",
      gpu: detectedGpu,
      online: navigator.onLine,
      userAgent: ua,
    });
  }, []);

  const handleCopyDiagnostics = () => {
    const report = [
      `--- NammaTech Technical Diagnostics Report ---`,
      `User: ${profile?.full_name || (user?.user_metadata as any)?.full_name || "User"} (${user?.email || "Guest"})`,
      `OS: ${diagnostics.os}`,
      `Browser: ${diagnostics.browser}`,
      `Screen Resolution: ${diagnostics.resolution}`,
      `CPU Cores: ${diagnostics.cores}`,
      `Device Memory: ${diagnostics.memory}`,
      `GPU Renderer: ${diagnostics.gpu}`,
      `Timestamp: ${new Date().toISOString()}`,
      `----------------------------------------------`,
    ].join("\n");

    if (navigator.clipboard) {
      navigator.clipboard.writeText(report);
      setCopiedSpecs(true);
      showToast({
        type: "success",
        title: "Diagnostics Copied!",
        message: "Your system specifications have been copied. You can paste it in the support chat.",
      });
      setTimeout(() => setCopiedSpecs(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Section Header ── */}
      <div className="p-6 sm:p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] relative overflow-hidden shadow-sm">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Specialist Desk Active • Average Response: &lt;2 min
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight flex items-center gap-2.5">
              <Headphones className="w-7 h-7 text-sky-500" />
              <span>Technical Support &amp; Engineering Desk</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1 max-w-xl leading-relaxed">
              Real-time technical assistance for software setup, missing DLL errors, game crash logs, VIP mirror requests, and direct administrator support.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="mailto:techsavvy.muthuraj.dev@gmail.com?subject=Technical%20Support%20Request"
              className="px-4 py-2.5 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] text-xs text-[var(--foreground)] hover:border-sky-500 transition-colors flex items-center gap-2 font-semibold shadow-xs"
            >
              <span>Email Support Team</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>

            <a
              href="https://wa.me/919944875726?text=Hi%20NammaTech%20Technical%20Support,%20I%20need%20assistance:"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all flex items-center gap-2"
            >
              <span>WhatsApp Helpline</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Support Sub-Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-[var(--border)] overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab("LIVE_CHAT")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === "LIVE_CHAT"
                ? "bg-sky-500 text-neutral-950 font-black shadow-md shadow-sky-500/20"
                : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>⚡ 1-on-1 Realtime Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("DIAGNOSTICS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === "DIAGNOSTICS"
                ? "bg-sky-500 text-neutral-950 font-black shadow-md shadow-sky-500/20"
                : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>🖥️ System Diagnostics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("TOOLKITS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeSubTab === "TOOLKITS"
                ? "bg-sky-500 text-neutral-950 font-black shadow-md shadow-sky-500/20"
                : "bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>🛠️ Essential Runtimes &amp; Fixes</span>
          </button>
        </div>
      </div>

      {/* ── Sub-Tab 1: Live Realtime Chat Console ── */}
      {activeSubTab === "LIVE_CHAT" && (
        <div className="space-y-4">
          <LiveSupportChat />
        </div>
      )}

      {/* ── Sub-Tab 2: System Diagnostics & Environment Specs ── */}
      {activeSubTab === "DIAGNOSTICS" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sky-500" />
                  <span>Hardware &amp; Runtime Environment Diagnostics</span>
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Auto-detected specifications to help our engineers identify missing DLLs, driver incompatibilities, or DirectX issues.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyDiagnostics}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                {copiedSpecs ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSpecs ? "Specs Copied!" : "Copy Diagnostics Sheet"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[var(--secondary)]/60 border border-[var(--border)]">
                <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
                  <Monitor className="w-4 h-4 text-sky-500" />
                  <span className="font-semibold">Operating System</span>
                </div>
                <p className="text-sm font-bold text-[var(--foreground)]">{diagnostics.os}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--secondary)]/60 border border-[var(--border)]">
                <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
                  <Globe className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold">Browser Engine</span>
                </div>
                <p className="text-sm font-bold text-[var(--foreground)]">{diagnostics.browser}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--secondary)]/60 border border-[var(--border)]">
                <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
                  <Monitor className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold">Display Resolution</span>
                </div>
                <p className="text-sm font-bold text-[var(--foreground)]">{diagnostics.resolution}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--secondary)]/60 border border-[var(--border)]">
                <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
                  <Cpu className="w-4 h-4 text-amber-500" />
                  <span className="font-semibold">CPU Logical Threads</span>
                </div>
                <p className="text-sm font-bold text-[var(--foreground)]">{diagnostics.cores} Cores</p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--secondary)]/60 border border-[var(--border)]">
                <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
                  <Wifi className="w-4 h-4 text-rose-500" />
                  <span className="font-semibold">System Memory</span>
                </div>
                <p className="text-sm font-bold text-[var(--foreground)]">{diagnostics.memory}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--secondary)]/60 border border-[var(--border)]">
                <div className="flex items-center gap-2 text-[var(--muted-foreground)] mb-1">
                  <Zap className="w-4 h-4 text-violet-500" />
                  <span className="font-semibold">Network State</span>
                </div>
                <p className="text-sm font-bold text-emerald-500">Connected &amp; Operational</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 text-neutral-300 border border-neutral-800 font-mono text-[11px] overflow-x-auto">
              <span className="text-[10px] text-neutral-500 block mb-1 uppercase font-bold">
                GPU Renderer String:
              </span>
              <code>{diagnostics.gpu}</code>
            </div>
          </div>
        </div>
      )}

      {/* ── Sub-Tab 3: Essential Runtimes & Common Error Solutions ── */}
      {activeSubTab === "TOOLKITS" && (
        <div className="space-y-6">
          {/* Runtimes grid */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <Download className="w-4 h-4 text-sky-500" />
              <span>Essential Windows Runtimes (Official Sources)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COMMON_TOOLKITS.map((toolkit) => (
                <div
                  key={toolkit.title}
                  className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-sky-500/40 transition-colors space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-[var(--foreground)]">{toolkit.title}</h4>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/15 text-sky-500 uppercase">
                      {toolkit.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    {toolkit.description}
                  </p>
                  <a
                    href={toolkit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-sky-500 hover:text-sky-400 transition-colors"
                  >
                    <span>Download Official Installer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Error guides */}
          <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Common Error Codes &amp; Immediate Fixes</span>
            </h3>

            <div className="space-y-3">
              {COMMON_ERROR_GUIDES.map((err) => (
                <div
                  key={err.code}
                  className="p-4 rounded-2xl bg-[var(--secondary)]/60 border border-[var(--border)] space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-500 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                      {err.code}
                    </span>
                    <h4 className="text-xs font-bold text-[var(--foreground)]">{err.title}</h4>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed pl-1">
                    {err.solution}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
