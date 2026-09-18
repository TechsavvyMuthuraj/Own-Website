"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles, ArrowRight } from "lucide-react";
import type { Announcement } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

export function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadActiveAnnouncement() {
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .eq("is_active", true)
          .eq("location", "TOP_BAR")
          .order("priority", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          const now = new Date();
          if (data.start_date && new Date(data.start_date) > now) return;
          if (data.end_date && new Date(data.end_date) < now) return;

          // Check if dismissed in sessionStorage
          const dismissedId = sessionStorage.getItem("dismissed_announcement_id");
          if (dismissedId !== data.id) {
            setAnnouncement(data as Announcement);
          }
        }
      } catch (e) {
        console.error("Error checking announcements:", e);
      }
    }

    loadActiveAnnouncement();
  }, [supabase]);

  if (!announcement || isDismissed) {
    // If there is no active announcement in the real database: hide completely
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem("dismissed_announcement_id", announcement.id);
    } catch {
      // Ignore storage error
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white px-4 py-2 text-xs sm:text-sm font-medium transition-all shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 justify-center sm:justify-start">
          <span className="p-1 rounded-full bg-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </span>
          <span className="truncate">{announcement.title}</span>
          {announcement.content && (
            <span className="hidden md:inline text-white/80 font-normal">
              - {announcement.content}
            </span>
          )}
          {announcement.cta_url && (
            <Link
              href={announcement.cta_url}
              className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:text-cyan-200 transition-colors ml-1"
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
          className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
