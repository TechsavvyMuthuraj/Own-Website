"use client";

import React, { useState } from "react";
import { Wrench, Power, ExternalLink, Loader2, Check } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

export function AdminMaintenanceBanner({ isMaintenanceActive }: { isMaintenanceActive: boolean }) {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!isAdmin || !isMaintenanceActive || dismissed) return null;

  const handleTurnOff = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenance_mode: false }),
      });
      if (res.ok) {
        showToast({
          type: "success",
          title: "Platform Is Live! 🟢",
          message: "Maintenance mode disabled. Site is now live for all visitors.",
        });
        router.refresh();
      } else {
        showToast({
          type: "error",
          title: "Failed to Disable",
          message: "Could not update maintenance mode.",
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Failed to communicate with settings server.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-black px-4 py-2.5 text-xs font-semibold shadow-md relative z-50 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2">
        <Wrench className="w-4 h-4 animate-bounce flex-shrink-0" />
        <span>
          <strong>ADMIN NOTICE:</strong> Platform Maintenance Mode is currently <u>ACTIVE</u>. All public visitors are redirected to the maintenance page.
        </span>
      </div>

      <div className="flex items-center gap-2">
        <a
          href="/maintenance"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/15 hover:bg-black/25 text-black font-bold transition-all"
        >
          <span>View Screen</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <button
          type="button"
          disabled={loading}
          onClick={handleTurnOff}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black text-white hover:bg-black/90 font-bold transition-all shadow-xs disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Power className="w-3 h-3" />}
          <span>Disable Maintenance Mode</span>
        </button>
      </div>
    </div>
  );
}
