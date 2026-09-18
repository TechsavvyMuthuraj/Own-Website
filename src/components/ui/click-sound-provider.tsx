"use client";

import { useEffect } from "react";
import { playClickSound } from "@/lib/sound";

export function ClickSoundProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensure sound is active
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("namatech_sound_enabled", "true");
      }
    } catch {
      // Non-blocking
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Skip if explicitly opted out
      if (target.closest('[data-no-sound="true"]')) return;

      // Skip if selecting text
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) return;

      playClickSound();
    };

    // Attach to document in capture phase
    document.addEventListener("click", handleClick, { capture: true, passive: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, []);

  return <>{children}</>;
}
