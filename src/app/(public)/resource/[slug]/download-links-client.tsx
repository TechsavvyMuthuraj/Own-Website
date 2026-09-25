"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Copy,
  Check,
  Download,
  ExternalLink,
  Link2,
  Shield,
  HardDrive,
  ChevronDown,
  ChevronUp,
  Lock,
  Zap,
  ShoppingCart,
  ShieldCheck,
} from "lucide-react";
import type { DownloadLink, Resource } from "@/types/database";
import { formatBytes, formatCurrency } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { useCart } from "@/lib/cart/cart-store";
import { createClient } from "@/lib/supabase/client";

interface DownloadLinksClientProps {
  links: DownloadLink[];
  isPaid?: boolean;
  hasAccess?: boolean;
  resource?: Resource;
}

const LINK_TYPE_LABELS: Record<string, string> = {
  PRIMARY: "Primary",
  MIRROR: "Mirror",
  R2_FILE: "Direct File",
  EXTERNAL: "External",
};

const LINK_TYPE_COLORS: Record<string, string> = {
  PRIMARY: "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/25",
  MIRROR: "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/25",
  R2_FILE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
  EXTERNAL: "bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/25",
};

export function DownloadLinksClient({
  links,
  isPaid = false,
  hasAccess = true,
  resource,
}: DownloadLinksClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [effectiveAccess, setEffectiveAccess] = useState<boolean>(hasAccess);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Client-side real-time entitlement validation
  useEffect(() => {
    if (effectiveAccess || !isPaid || !user || !resource?.id) return;

    const supabase = createClient();
    async function checkClientAccess() {
      try {
        const { data: ent } = await supabase
          .from("entitlements")
          .select("id")
          .eq("user_id", user?.id)
          .eq("resource_id", resource?.id)
          .eq("status", "ACTIVE")
          .maybeSingle();

        if (ent) {
          setEffectiveAccess(true);
          return;
        }

        const { data: orderItem } = await supabase
          .from("order_items")
          .select("id, orders!inner(id, status, user_id)")
          .eq("resource_id", resource?.id)
          .eq("orders.user_id", user?.id)
          .eq("orders.status", "PAID")
          .maybeSingle();

        if (orderItem) {
          setEffectiveAccess(true);
        }
      } catch (e) {
        console.error("Client entitlement check error:", e);
      }
    }

    checkClientAccess();
  }, [user, isPaid, resource?.id, effectiveAccess]);

  if (!links || links.length === 0) return null;

  const visibleLinks = showAll ? links : links.slice(0, 4);

  const handleCopy = async (url: string, id: string) => {
    if (!url) return;
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
    const validUrls = links.filter((l) => Boolean(l.url));
    if (validUrls.length === 0) return;
    const allUrls = validUrls.map((l, i) => `${i + 1}. ${l.title}: ${l.url || ""}`).join("\n");
    try {
      await navigator.clipboard.writeText(allUrls);
      setCopiedId("all");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleBuyNow = () => {
    if (resource) {
      addItem(resource);
      router.push("/checkout");
    }
  };

  const priceValue = resource?.sale_price !== null && resource?.sale_price !== undefined
    ? resource.sale_price
    : resource?.price;
  const priceDisplay = priceValue ? `(${formatCurrency(priceValue, resource?.currency)})` : "";

  // ── LOCKED STATE FOR PAID RESOURCES ──
  if (isPaid && !effectiveAccess) {
    return (
      <div className="rounded-3xl border border-amber-500/30 bg-white dark:bg-neutral-900/60 p-6 sm:p-7 shadow-lg shadow-amber-500/5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                Direct Download Mirrors
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {links.length} verified cloud mirror{links.length !== 1 ? "s" : ""} available
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs">
            PRO / VIP ACCESS
          </span>
        </div>

        {/* Info notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-neutral-700 dark:text-neutral-300">
          <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            This is a verified premium digital package. Direct cloud download links, mirrors, and package files are exclusively accessible after purchasing.
          </span>
        </div>

        {/* Locked Link Rows Preview */}
        <div className="space-y-2.5">
          {visibleLinks.map((link) => {
            const typeColor = LINK_TYPE_COLORS[link.link_type] || LINK_TYPE_COLORS["EXTERNAL"];
            const typeLabel = LINK_TYPE_LABELS[link.link_type] || link.link_type;
            return (
              <div
                key={link.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center flex-shrink-0 text-neutral-500">
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {link.title}
                      </span>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold border flex-shrink-0 ${typeColor}`}>
                        {typeLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                      {link.size_bytes && link.size_bytes > 0 && (
                        <span className="flex items-center gap-1 font-sans">
                          <HardDrive className="w-2.5 h-2.5" />
                          {formatBytes(link.size_bytes)}
                        </span>
                      )}
                      <span className="text-amber-500/90 font-medium">• Direct Mirror Protected</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400">
                    <Lock className="w-3 h-3" />
                    <span>Locked</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Unlock Call to Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-200/80 dark:border-neutral-800/80">
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold text-neutral-900 dark:text-white">
              Instant Lifetime Access &amp; Direct Downloads
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              One-time payment • No subscriptions • Instant link unlock
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {user ? (
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 text-xs font-black transition-all shadow-md shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Unlock Now {priceDisplay}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 text-xs font-black transition-all shadow-md shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Buy Now {priceDisplay}</span>
                </button>
                <Link
                  href={`/auth/login?redirect=/resource/${resource?.slug || ""}`}
                  className="px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── UNLOCKED STATE (FREE OR PURCHASED CONTENT) ──
  return (
    <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Download className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">Download Links</h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {links.length} link{links.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>
        <button
          onClick={handleCopyAll}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
            copiedId === "all"
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
              : "bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          {copiedId === "all" ? (
            <>
              <Check className="w-3 h-3 mr-1" />
              Copied All!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              Copy All
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-[11px] text-neutral-600 dark:text-neutral-400">
        <Shield className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
        <span>
          {isPaid
            ? "Verified purchase active. All mirrors unlocked and verified safe."
            : "All links are verified and safe. Use primary link first, mirrors as backup."}
        </span>
      </div>

      <div className="space-y-2.5">
        {visibleLinks.map((link) => {
          const isCopied = copiedId === link.id;
          const typeColor = LINK_TYPE_COLORS[link.link_type] || LINK_TYPE_COLORS["EXTERNAL"];
          const typeLabel = LINK_TYPE_LABELS[link.link_type] || link.link_type;
          return (
            <div
              key={link.id}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 hover:bg-neutral-100/70 dark:hover:bg-neutral-900/60 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center flex-shrink-0 text-neutral-600 dark:text-neutral-400">
                {link.link_type === "EXTERNAL" ? (
                  <ExternalLink className="w-3.5 h-3.5" />
                ) : (
                  <Link2 className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                    {link.title}
                  </span>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold border flex-shrink-0 ${typeColor}`}
                  >
                    {typeLabel}
                  </span>
                </div>
                {link.size_bytes && link.size_bytes > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400">
                    <HardDrive className="w-2.5 h-2.5" />
                    {formatBytes(link.size_bytes)}
                  </div>
                )}
                {link.url && (
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5 font-mono">
                    {link.url}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {link.url && (
                  <button
                    onClick={() => handleCopy(link.url!, link.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                      isCopied
                        ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                        : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-amber-500 hover:border-amber-500/30"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
                {link.url && (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-neutral-950 hover:border-amber-500 transition-all shadow-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Open</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {links.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all cursor-pointer"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              Show {links.length - 4} More Link{links.length - 4 !== 1 ? "s" : ""}
            </>
          )}
        </button>
      )}
    </div>
  );
}