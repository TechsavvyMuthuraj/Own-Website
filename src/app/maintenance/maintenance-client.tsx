"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wrench,
  Clock,
  ShieldCheck,
  Eye,
  Settings,
  PowerOff,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function MaintenanceClient() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [liveDetected, setLiveDetected] = useState(false);

  // Check admin privileges
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const adminEmails = ["techsavvy.muthuraj.dev@gmail.com"];
          const isEmailAdmin = Boolean(user.email && adminEmails.includes(user.email.toLowerCase()));
          if (isEmailAdmin) {
            setIsAdmin(true);
            return;
          }

          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN") {
            setIsAdmin(true);
          }
        }
      } catch {
        // Ignore errors
      }
    }

    checkAuth();
  }, []);

  // Real-time polling to auto-redirect once maintenance is turned OFF
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        setCheckingStatus(true);
        const res = await fetch("/api/admin/settings", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const isMaintenance =
            data.settings?.maintenance_mode === true ||
            data.settings?.maintenance_mode === "true";

          if (!isMaintenance) {
            setLiveDetected(true);
            setTimeout(() => {
              window.location.href = "/";
            }, 800);
          }
        }
      } catch {
        // Ignore polling errors
      } finally {
        setCheckingStatus(false);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleDisableMaintenance = async () => {
    if (!confirm("Turn OFF maintenance mode and restore public access immediately?")) return;
    setIsDisabling(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenance_mode: false }),
      });
      if (res.ok) {
        setLiveDetected(true);
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        alert("Failed to disable maintenance mode. Please use admin settings.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setIsDisabling(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[var(--background)] relative">
      {/* Admin Floating Quick-Control Banner */}
      {isAdmin && (
        <div className="fixed top-4 inset-x-4 sm:max-w-2xl sm:mx-auto z-50 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-md shadow-lg shadow-amber-500/5 flex flex-wrap items-center justify-between gap-3 text-xs animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>Admin Active: Site is in Maintenance</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/?admin_preview=true"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card)] hover:bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] font-medium transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span>Preview Site</span>
            </Link>

            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--card)] hover:bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] font-medium transition-all"
            >
              <Settings className="w-3.5 h-3.5 text-amber-500" />
              <span>Console</span>
            </Link>

            <button
              type="button"
              onClick={handleDisableMaintenance}
              disabled={isDisabling}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all disabled:opacity-50"
            >
              {isDisabling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <PowerOff className="w-3.5 h-3.5" />
              )}
              <span>Turn Off</span>
            </button>
          </div>
        </div>
      )}

      {/* Live Restored Alert */}
      {liveDetected && (
        <div className="fixed top-6 inset-x-4 sm:max-w-md sm:mx-auto z-50 p-4 rounded-2xl bg-emerald-500 text-white shadow-xl flex items-center gap-3 animate-in zoom-in-95 duration-200">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 animate-bounce" />
          <div>
            <p className="font-bold text-sm">Platform Restored!</p>
            <p className="text-xs text-emerald-100">Redirecting you to the home page now...</p>
          </div>
        </div>
      )}

      <div className="max-w-lg w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Animated Glow & Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-3xl bg-amber-500/15 animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-xl shadow-amber-500/10">
            <Wrench className="w-12 h-12 text-amber-500 animate-bounce" style={{ animationDuration: "3s" }} />
          </div>
        </div>

        {/* Headline & Description */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Scheduled Platform Maintenance</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
            We&apos;ll Be Back Soon
          </h1>

          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-sm mx-auto">
            NammaTech is currently undergoing scheduled optimization and system upgrades. Public access will be restored automatically as soon as maintenance is complete.
          </p>
        </div>

        {/* What we are doing */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-left space-y-3 shadow-sm">
          <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            What we&apos;re doing
          </h3>
          <ul className="space-y-2 text-xs text-[var(--muted-foreground)]">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              High-speed infrastructure &amp; database upgrades
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              Security patches &amp; direct download mirror validations
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
              Catalog refresh &amp; resource updates
            </li>
          </ul>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-[var(--muted-foreground)]">
          <RefreshCw className={`w-3 h-3 ${checkingStatus ? "animate-spin text-amber-500" : ""}`} />
          <span>Auto-checks every few seconds • Will automatically reload when live</span>
        </div>

        {/* Admin Login Link */}
        <p className="text-xs text-[var(--muted-foreground)]">
          Are you an administrator?{" "}
          <Link
            href="/admin/login"
            className="text-[var(--primary)] hover:underline font-semibold"
          >
            Access Admin Console
          </Link>
        </p>
      </div>
    </div>
  );
}
