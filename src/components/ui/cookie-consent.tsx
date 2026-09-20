"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, Check, ShieldCheck, X } from "lucide-react";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("nammatech_cookie_consent");
      if (!consent) {
        // Delay slightly for smooth non-jarring appearance
        const timer = setTimeout(() => setShowBanner(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage restrictions in incognito
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem("nammatech_cookie_consent", "all");
    } catch {}
    setShowBanner(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem("nammatech_cookie_consent", "essential");
    } catch {}
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[99999] animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="p-5 rounded-2xl bg-neutral-950/95 text-white border border-amber-500/30 backdrop-blur-xl shadow-2xl shadow-black/80 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Cookie className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Cookie Preferences
              </h3>
              <p className="text-[11px] text-neutral-400">
                Google AdSense &amp; GDPR Compliance
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleEssentialOnly}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
            aria-label="Dismiss cookie notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          We use cookies to deliver essential services, remember your theme, and allow our partner{" "}
          <strong>Google AdSense</strong> to display relevant, non-intrusive advertisements. Learn more in our{" "}
          <Link
            href="/cookie-policy"
            className="text-amber-400 font-semibold underline underline-offset-2 hover:text-amber-300"
          >
            Cookie Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy-policy"
            className="text-amber-400 font-semibold underline underline-offset-2 hover:text-amber-300"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleAcceptAll}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-neutral-950 text-xs font-bold hover:brightness-110 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept All</span>
          </button>
          <button
            type="button"
            onClick={handleEssentialOnly}
            className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-all cursor-pointer"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
