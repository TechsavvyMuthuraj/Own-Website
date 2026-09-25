"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    let lastVisible = false;

    const toggleVisibility = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const nowVisible = window.scrollY > 300;
          if (nowVisible !== lastVisible) {
            lastVisible = nowVisible;
            setIsVisible(nowVisible);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility();
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Back to top"
      className="fixed bottom-6 right-6 z-40 p-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] shadow-xl hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
    >
      <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
      <span className="sr-only">Scroll to top</span>
    </button>
  );
}
