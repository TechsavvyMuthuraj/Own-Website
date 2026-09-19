"use client";

import React, { useState } from "react";
import { Copy, Check, Download, ExternalLink, Link2, Shield, HardDrive, ChevronDown, ChevronUp } from "lucide-react";
import type { DownloadLink } from "@/types/database";
import { formatBytes } from "@/lib/utils";

interface DownloadLinksClientProps {
  links: DownloadLink[];
}

const LINK_TYPE_LABELS: Record<string, string> = {
  PRIMARY: "Primary",
  MIRROR: "Mirror",
  R2_FILE: "Direct File",
  EXTERNAL: "External",
};

const LINK_TYPE_COLORS: Record<string, string> = {
  PRIMARY: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  MIRROR: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25",
  R2_FILE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  EXTERNAL: "bg-rose-500/10 text-rose-400 border-rose-500/25",
};

export function DownloadLinksClient({ links }: DownloadLinksClientProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  if (!links || links.length === 0) return null;

  const visibleLinks = showAll ? links : links.slice(0, 3);

  const handleCopy = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleCopyAll = async () => {
    const allUrls = links.map((l, i) => `${i + 1}. ${l.title}: ${l.url || ""}`).join("\n");
    try {
      await navigator.clipboard.writeText(allUrls);
      setCopiedId("all");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Download className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)]">Download Links</h3>
            <p className="text-[11px] text-[var(--muted-foreground)]">{links.length} link{links.length !== 1 ? "s" : ""} available</p>
          </div>
        </div>
        <button onClick={handleCopyAll} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${copiedId === "all" ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : "bg-[var(--secondary)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-amber-500/30"}`}>
          {copiedId === "all" ? <><Check className="w-3 h-3 mr-1" />Copied All!</> : <><Copy className="w-3 h-3 mr-1" />Copy All</>}
        </button>
      </div>
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-[11px] text-[var(--muted-foreground)]">
        <Shield className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
        <span>All links are verified and safe. Use primary link first, mirrors as backup.</span>
      </div>
      <div className="space-y-2.5">
        {visibleLinks.map((link) => {
          const isCopied = copiedId === link.id;
          const typeColor = LINK_TYPE_COLORS[link.link_type] || LINK_TYPE_COLORS["EXTERNAL"];
          const typeLabel = LINK_TYPE_LABELS[link.link_type] || link.link_type;
          return (
            <div key={link.id} className="flex items-center gap-3 p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/40 hover:bg-[var(--secondary)]/70 transition-colors">
              <div className="w-8 h-8 rounded-xl bg-[var(--secondary)] border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                {link.link_type === "EXTERNAL" ? <ExternalLink className="w-3.5 h-3.5 text-[var(--muted-foreground)]" /> : <Link2 className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-semibold text-[var(--foreground)] truncate">{link.title}</span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold border flex-shrink-0 ${typeColor}`}>{typeLabel}</span>
                </div>
                {link.size_bytes && link.size_bytes > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-[var(--muted-foreground)]"><HardDrive className="w-2.5 h-2.5" />{formatBytes(link.size_bytes)}</div>
                )}
                {link.url && <p className="text-[10px] text-[var(--muted-foreground)] truncate mt-0.5 font-mono">{link.url}</p>}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {link.url && (
                  <button onClick={() => handleCopy(link.url!, link.id)} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${isCopied ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400" : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-amber-400 hover:border-amber-500/30"}`}>
                    {isCopied ? <><Check className="w-3 h-3" /><span>Copied</span></> : <><Copy className="w-3 h-3" /><span>Copy</span></>}
                  </button>
                )}
                {link.url && (
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-neutral-950 hover:border-amber-500 transition-all">
                    <ExternalLink className="w-3 h-3" /><span>Open</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {links.length > 3 && (
        <button onClick={() => setShowAll(!showAll)} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-amber-500/30 transition-all">
          {showAll ? <><ChevronUp className="w-3.5 h-3.5" />Show Less</> : <><ChevronDown className="w-3.5 h-3.5" />Show {links.length - 3} More Link{links.length - 3 !== 1 ? "s" : ""}</>}
        </button>
      )}
    </div>
  );
}