"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // When route changes, snap to 100% and fade out
  useEffect(() => {
    if (active) {
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);
      setFading(true);
      const timeout = setTimeout(() => {
        setActive(false);
        setProgress(0);
        setFading(false);
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [pathname, searchParams]);

  // Safety timeout to auto-reset TopLoader if navigation takes longer than 4.5s or is cancelled
  useEffect(() => {
    if (active) {
      const safetyTimeout = setTimeout(() => {
        setActive(false);
        setProgress(0);
        setFading(false);
      }, 4500);
      return () => clearTimeout(safetyTimeout);
    }
  }, [active]);

  // Listen to internal link clicks to start loading animation
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("//") &&
        target.target !== "_blank" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        try {
          const url = new URL(href, window.location.href);
          if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
            setActive(true);
            setFading(false);
            setProgress(20);

            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
              setProgress((prev) => {
                if (prev >= 85) {
                  if (timerRef.current) clearInterval(timerRef.current);
                  return prev;
                }
                const step = Math.max(2, (85 - prev) * 0.15);
                return Math.min(85, prev + step);
              });
            }, 120);
          }
        } catch {}
      }
    };

    document.addEventListener("click", handleClick, { passive: true });
    return () => {
      document.removeEventListener("click", handleClick);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!active && progress === 0) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-black/20 transition-opacity duration-300 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-200 ease-out relative"
        style={{
          width: `${progress}%`,
          boxShadow: "0 0 14px rgba(245, 158, 11, 0.9), 0 0 6px rgba(251, 191, 36, 0.8)",
        }}
      >
        {/* Glowing Head Point */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_#ffffff,0_0_18px_#f59e0b] -mr-1" />
      </div>
    </div>
  );
}
