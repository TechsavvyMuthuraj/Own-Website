"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Download,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  UserPlus,
  ExternalLink,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

interface AccessResource {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  accessType: string;
  downloadLinks: { id: string; label: string; url: string; r2Key?: string }[];
}

interface AccessPayload {
  valid: boolean;
  entitlementId: string;
  customerName?: string;
  verifiedAt?: string;
  resource: AccessResource;
}

export default function AccessPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string | null>(null);
  const [payload, setPayload] = useState<AccessPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const { user } = useAuth();

  // Resolve params
  useEffect(() => {
    params.then(({ token: t }) => setToken(t));
  }, [params]);

  // Fetch entitlement data by token
  useEffect(() => {
    if (!token) return;

    const fetchAccess = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/access/${token}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "This access link is invalid or expired.");
        } else {
          setPayload(data);
        }
      } catch {
        setError("Unable to validate access link. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccess();
  }, [token]);

  // Claim purchase to account
  const handleClaim = async () => {
    if (!token || !user) return;
    setClaiming(true);
    setClaimError(null);
    try {
      const res = await fetch("/api/user/claim-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setClaimError(data.error || "Failed to claim. Please try again.");
      } else {
        setClaimMsg(data.message || "Successfully claimed to your account!");
      }
    } catch {
      setClaimError("Network error. Please try again.");
    } finally {
      setClaiming(false);
    }
  };

  // Loading state
  if (loading || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[var(--muted-foreground)]">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Validating your access link…</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl border border-red-500/20 bg-[var(--card)] text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto ring-1 ring-red-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">Access Denied</h1>
            <p className="text-sm text-[var(--muted-foreground)]">{error}</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to NammaTech
          </Link>
        </div>
      </div>
    );
  }

  if (!payload) return null;

  const { resource, customerName, verifiedAt } = payload;
  const hasDownloadLinks = resource.downloadLinks && resource.downloadLinks.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-5 animate-in fade-in zoom-in-95 duration-300">
        {/* Verified badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Payment Verified • Secure Access
          </div>
        </div>

        {/* Main card */}
        <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl shadow-emerald-500/5 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            {resource.thumbnailUrl ? (
              <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 ring-1 ring-[var(--border)]">
                <Image
                  src={resource.thumbnailUrl}
                  alt={resource.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[var(--secondary)] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-7 h-7 text-[var(--muted-foreground)]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-[var(--foreground)] leading-tight">
                {resource.title}
              </h1>
              {customerName && (
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Purchased for <span className="font-semibold text-[var(--foreground)]">{customerName}</span>
                </p>
              )}
              {verifiedAt && (
                <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                  Verified {new Date(verifiedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Description */}
          {resource.description && (
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-3">
              {resource.description}
            </p>
          )}

          {/* Download links */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Download Links
            </p>
            {hasDownloadLinks ? (
              <div className="space-y-2">
                {resource.downloadLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-[0.99]"
                  >
                    <span className="flex items-center gap-2">
                      <Download className="w-4 h-4 flex-shrink-0" />
                      <span>{link.label || "Download Now"}</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                Download links will appear here once they are activated. Please check back shortly
                or contact support via WhatsApp if this persists.
              </div>
            )}
          </div>

          {/* Claim to account section */}
          <div className="pt-2 border-t border-[var(--border)] space-y-3">
            {claimMsg ? (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {claimMsg}
              </div>
            ) : user ? (
              <div className="space-y-2">
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  You&apos;re signed in! Permanently save this purchase to your account for
                  easy access from your dashboard.
                </p>
                {claimError && (
                  <p className="text-[11px] text-red-500">{claimError}</p>
                )}
                <button
                  type="button"
                  onClick={handleClaim}
                  disabled={claiming}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-[var(--primary)]/50 bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] font-semibold text-xs transition-all disabled:opacity-60"
                >
                  {claiming ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                  {claiming ? "Claiming…" : "Claim to My Account"}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  Want to access this from your account dashboard?{" "}
                  <Link
                    href={`/auth/login?redirect=/access/${token}`}
                    className="font-semibold text-[var(--primary)] hover:underline"
                  >
                    Sign in or create a free account
                  </Link>{" "}
                  to permanently link this purchase.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to NammaTech
          </Link>
          <p className="text-[10px] text-[var(--muted-foreground)]">
            Keep this link safe — it&apos;s your secure access credential. Do not share it publicly.
          </p>
        </div>
      </div>
    </div>
  );
}
