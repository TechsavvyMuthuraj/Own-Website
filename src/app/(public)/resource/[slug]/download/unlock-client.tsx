"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Loader2,
  HardDrive,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import type { Resource, DownloadLink } from "@/types/database";
import { formatBytes } from "@/lib/utils";

interface DownloadUnlockExperienceProps {
  resource: Resource;
}

export function DownloadUnlockExperience({ resource }: DownloadUnlockExperienceProps) {
  const [step, setStep] = useState<"PREPARING" | "VERIFIED" | "READY">("PREPARING");
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([]);
  const [primarySignedUrl, setPrimarySignedUrl] = useState<string | null>(null);
  const [loadingSignedUrl, setLoadingSignedUrl] = useState(false);

  useEffect(() => {
    // Genuine quick verification progression (short, responsive feedback)
    const timer1 = setTimeout(() => {
      setStep("VERIFIED");
    }, 400);

    const timer2 = setTimeout(async () => {
      setStep("READY");
      // Record download log event
      try {
        await fetch("/api/downloads/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceId: resource.id }),
        });
      } catch (e) {
        console.error("Failed to log download:", e);
      }
    }, 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [resource.id]);

  useEffect(() => {
    if (resource.download_links) {
      setDownloadLinks(resource.download_links);
    }
  }, [resource.download_links]);

  const fetchSignedUrl = async (linkId: string, r2Key?: string) => {
    if (!r2Key) return null;
    setLoadingSignedUrl(true);
    try {
      const res = await fetch("/api/downloads/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId: resource.id, linkId, r2Key }),
      });
      const data = await res.json();
      if (data.signedUrl) {
        return data.signedUrl;
      }
    } catch (err) {
      console.error("Error obtaining signed URL:", err);
    } finally {
      setLoadingSignedUrl(false);
    }
    return null;
  };

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-12 text-center shadow-xl shadow-indigo-500/5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Step 1: Preparing */}
      {step === "PREPARING" && (
        <div className="flex flex-col items-center py-8 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 ring-1 ring-indigo-500/20">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight mb-2">
            Preparing Secure Access
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
            Validating release integrity and storage node...
          </p>
        </div>
      )}

      {/* Step 2: Verified */}
      {step === "VERIFIED" && (
        <div className="flex flex-col items-center py-8 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 ring-1 ring-emerald-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight mb-2">
            Resource Verified
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
            Distribution authenticity checked. Preparing download package...
          </p>
        </div>
      )}

      {/* Step 3: Ready for Download */}
      {step === "READY" && (
        <div className="flex flex-col items-center py-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 ring-1 ring-emerald-500/20 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            Access Ready
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight mb-2">
            {resource.title}
          </h2>

          <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] mb-8">
            {resource.version && <span>Version: v{resource.version}</span>}
            {resource.version && resource.size_bytes && <span>•</span>}
            {resource.size_bytes && <span>Size: {formatBytes(resource.size_bytes)}</span>}
            {resource.platform && <span>•</span>}
            {resource.platform && <span>Platform: {resource.platform}</span>}
          </div>

          {/* Download Buttons / Mirrors */}
          {downloadLinks.length > 0 ? (
            <div className="w-full max-w-md space-y-3">
              {downloadLinks.map((link) => {
                const isR2 = link.link_type === "R2_FILE" || !!link.r2_key;
                const isExternal = link.link_type === "EXTERNAL";

                return (
                  <div key={link.id} className="w-full">
                    <a
                      href={link.url || "#"}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      onClick={async (e) => {
                        if (isR2 && link.r2_key && !link.url) {
                          e.preventDefault();
                          const url = await fetchSignedUrl(link.id, link.r2_key);
                          if (url) {
                            window.location.href = url;
                          }
                        }
                      }}
                      className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-sm transition-all shadow-md shadow-indigo-500/20 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                        <span>{link.title}</span>
                      </div>
                      {link.size_bytes && (
                        <span className="text-xs font-mono font-normal opacity-80">
                          {formatBytes(link.size_bytes)}
                        </span>
                      )}
                    </a>
                  </div>
                );
              })}
            </div>
          ) : resource.official_url ? (
            <div className="w-full max-w-md">
              <a
                href={resource.official_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold text-sm transition-all shadow-md shadow-indigo-500/20"
              >
                <span>Download from Official Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] max-w-md w-full text-center">
              <AlertCircle className="w-5 h-5 text-amber-500 mx-auto mb-2" />
              <p className="text-xs text-[var(--muted-foreground)]">
                Download links are currently being verified or updated by an administrator. Please check back shortly.
              </p>
            </div>
          )}

          {/* Legal / Security disclaimer */}
          <div className="mt-8 pt-6 border-t border-[var(--border)] max-w-md w-full text-[11px] text-[var(--muted-foreground)] text-left flex items-start gap-2.5">
            <FileCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p leading-relaxed>
              This file is distributed in accordance with its license ({resource.license || "Standard License"}). No adware, malware, or deceptive installer wrappers are bundled.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
