"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Loader2,
  Trash2,
  Sparkles,
} from "lucide-react";
import { playClickSound, playPopSound, playSuccessSound } from "@/lib/sound";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "warning";
  onConfirm: () => Promise<void> | void;
}

interface ToastContextType {
  showToast: (options: {
    type?: ToastType;
    title?: string;
    message: string;
    duration?: number;
  }) => void;
  confirm: (options: ConfirmOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmModal, setConfirmModal] = useState<
    (ConfirmOptions & { isOpen: boolean; loading: boolean }) | null
  >(null);

  const showToast = useCallback(
    ({
      type = "success",
      title,
      message,
      duration = 4000,
    }: {
      type?: ToastType;
      title?: string;
      message: string;
      duration?: number;
    }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      // Audio feedback
      if (type === "success") {
        playSuccessSound();
      } else {
        playPopSound();
      }

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const confirm = useCallback((options: ConfirmOptions) => {
    playPopSound();
    setConfirmModal({
      ...options,
      isOpen: true,
      loading: false,
    });
  }, []);

  const handleConfirmAction = async () => {
    if (!confirmModal) return;
    const action = confirmModal.onConfirm;
    setConfirmModal((prev) => (prev ? { ...prev, loading: true } : null));
    try {
      if (typeof action === "function") {
        await action();
      }
    } catch (err) {
      console.error("Confirm callback execution error:", err);
    } finally {
      setConfirmModal(null);
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, confirm }}>
      {children}

      {/* Floating Animated Toasts Container */}
      <div className="fixed top-5 right-5 z-[999999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0">
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          const isWarning = toast.type === "warning";
          const isInfo = toast.type === "info";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-2xl transition-all duration-300 animate-in slide-in-from-top-3 fade-in bg-[var(--card)]/95 text-[var(--foreground)] ${
                isSuccess
                  ? "border-emerald-500/40 shadow-emerald-500/10"
                  : isError
                  ? "border-red-500/40 shadow-red-500/10"
                  : isWarning
                  ? "border-amber-500/40 shadow-amber-500/10"
                  : "border-indigo-500/40 shadow-indigo-500/10"
              }`}
            >
              <div
                className={`p-2 rounded-xl flex-shrink-0 ${
                  isSuccess
                    ? "bg-emerald-500/15 text-emerald-500"
                    : isError
                    ? "bg-red-500/15 text-red-500"
                    : isWarning
                    ? "bg-amber-500/15 text-amber-500"
                    : "bg-indigo-500/15 text-indigo-500"
                }`}
              >
                {isSuccess && <CheckCircle2 className="w-4 h-4" />}
                {isError && <AlertCircle className="w-4 h-4" />}
                {isWarning && <AlertTriangle className="w-4 h-4" />}
                {isInfo && <Sparkles className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0 pr-1">
                {toast.title && (
                  <h4 className="text-xs font-bold tracking-wide uppercase opacity-90 mb-0.5">
                    {toast.title}
                  </h4>
                )}
                <p className="text-xs leading-relaxed font-semibold">{toast.message}</p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1 rounded-lg hover:bg-[var(--secondary)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Modern Animated Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div
                className={`p-3 rounded-2xl flex-shrink-0 ${
                  confirmModal.variant === "danger"
                    ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                    : confirmModal.variant === "warning"
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    : "bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30"
                }`}
              >
                {confirmModal.variant === "danger" ? (
                  <Trash2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>

              <div className="space-y-1 flex-1">
                <h3 className="text-base font-bold text-[var(--foreground)] tracking-tight">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                disabled={confirmModal.loading}
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-all disabled:opacity-50"
              >
                {confirmModal.cancelText || "Cancel"}
              </button>
              <button
                type="button"
                disabled={confirmModal.loading}
                onClick={handleConfirmAction}
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50 ${
                  confirmModal.variant === "danger"
                    ? "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                    : "bg-[var(--primary)] hover:bg-[var(--primary-hover)] shadow-[var(--primary)]/20"
                }`}
              >
                {confirmModal.loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{confirmModal.confirmText || "Confirm"}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
