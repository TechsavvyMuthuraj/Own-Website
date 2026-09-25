"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Announcement } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

export function AnnouncementBar() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const supabase = createClient();

  const { data: announcement } = useQuery<Announcement | null>({
    queryKey: ["active-announcement-top-bar"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, content, cta_text, cta_url, start_date, end_date, is_active, location")
        .eq("is_active", true)
        .eq("location", "TOP_BAR")
        .order("priority", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      const now = new Date();
      if (data.start_date && new Date(data.start_date) > now) return null;
      if (data.end_date && new Date(data.end_date) < now) return null;

      // Check if dismissed in sessionStorage
      if (typeof window !== "undefined") {
        const dismissedId = sessionStorage.getItem("dismissed_announcement_id");
        if (dismissedId === data.id) return null;
      }

      return data as Announcement;
    },
    staleTime: 5 * 60 * 1000, // Retain announcement cache for 5 minutes across page navigations
  });

  if (!announcement || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => {
      setIsDismissed(true);
      try {
        sessionStorage.setItem("dismissed_announcement_id", announcement.id);
      } catch {
        // Ignore storage error
      }
    }, 280);
  };

  return (
    <div
      className={`relative bg-gradient-to-r from-[#FD1843] via-[#e00d36] to-[#b30526] text-white px-4 py-2 text-xs sm:text-sm font-medium shadow-inner transition-all duration-300 ${
        isDismissing ? "animate-notification-exit pointer-events-none" : "animate-in fade-in slide-in-from-top-2 duration-300"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start">
          <span className="p-1 rounded-full bg-white/20">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </span>
          <span className="truncate">{announcement.title}</span>
          {announcement.content && (
            <span className="hidden md:inline text-white/90 font-normal">
              - {announcement.content}
            </span>
          )}
          {announcement.cta_url && (
            <Link
              href={announcement.cta_url}
              className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:text-pink-100 transition-colors ml-1"
            >
              <span>{announcement.cta_text || "Learn more"}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all transform hover:rotate-90 hover:scale-110 active:scale-95"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
