"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, AlertCircle, Info, Sparkles, ShieldCheck } from "lucide-react";

export interface AnimatedNotificationProps {
  id?: string;
  type?: "success" | "warning" | "error" | "info" | "upi";
  title: string;
  message?: string;
  autoCloseMs?: number;
  onClose?: () => void;
  className?: string;
}

export function AnimatedNotification({
  type = "info",
  title,
  message,
  autoCloseMs,
  onClose,
  className = "",
}: AnimatedNotificationProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 200);
  };

  useEffect(() => {
    if (autoCloseMs && autoCloseMs > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [autoCloseMs]);

  if (!isVisible) return null;

  const styleConfig = {
    success: {
      bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />,
      glow: "shadow-emerald-500/10",
    },
    warning: {
      bg: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
      icon: <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />,
      glow: "shadow-amber-500/10",
    },
    error: {
      bg: "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400",
      icon: <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />,
      glow: "shadow-red-500/10",
    },
    upi: {
      bg: "bg-[#FD1843]/10 border-[#FD1843]/30 text-[var(--foreground)]",
      icon: <Sparkles className="w-5 h-5 text-[#FD1843] flex-shrink-0 mt-0.5" />,
      glow: "shadow-[#FD1843]/15",
    },
    info: {
      bg: "bg-[var(--secondary)] border-[var(--border)] text-[var(--foreground)]",
      icon: <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />,
      glow: "shadow-black/5",
    },
  }[type];

  return (
    <div
      role="alert"
      className={`relative w-full p-4 rounded-2xl border backdrop-blur-md shadow-lg transition-all duration-200 flex items-start justify-between gap-3 ${
        styleConfig.bg
      } ${styleConfig.glow} ${
        isExiting ? "animate-popup-exit pointer-events-none" : "animate-popup-enter"
      } ${className}`}
    >
      <div className="flex items-start gap-3 min-w-0">
        {styleConfig.icon}
        <div className="text-left min-w-0">
          <h4 className="font-bold text-xs sm:text-sm text-[var(--foreground)] tracking-tight">
            {title}
          </h4>
          {message && (
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
              {message}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleClose}
        aria-label="Close notification"
        className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)]/80 transition-all transform hover:rotate-90 hover:scale-110 active:scale-95 flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
