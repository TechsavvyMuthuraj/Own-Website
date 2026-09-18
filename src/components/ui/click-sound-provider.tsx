"use client";

import { useEffect } from "react";
import { playClickSound } from "@/lib/sound";

export function ClickSoundProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if clicked element or any ancestor is interactive
      const interactiveEl = target.closest(
        'button, a, input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"], [role="button"], [role="tab"], summary, select, [data-sound="click"]'
      );

      if (interactiveEl) {
        // Skip if specifically opted out
        if (interactiveEl.getAttribute("data-no-sound") === "true") return;
        playClickSound();
      }
    };

    // Attach to document in capture phase
    document.addEventListener("click", handleClick, { capture: true, passive: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, []);

  return <>{children}</>;
}
