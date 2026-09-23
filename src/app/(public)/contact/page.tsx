"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Send,
  AlertCircle,
  Loader2,
  MessageSquare,
  MapPin,
} from "lucide-react";


type FormStatus =
  | "idle"
  | "sending"
  | "success"
  | "validation_error"
  | "network_error"
  | "rate_limited"
  | "server_error";

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

import { LiveSupportChat } from "@/components/support/live-support-chat";
import { Zap } from "lucide-react";

export default function ContactPage() {
  const router = useRouter();
  const [contactMode, setContactMode] = useState<"live_chat" | "email">("live_chat");
  const [isChatActive, setIsChatActive] = useState<boolean>(false);

  const [formState, setFormState] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  // Prevent double submissions
  const submittingRef = useRef(false);

  // ── Form field change handler ─────────────────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status !== "idle" && status !== "sending" && status !== "success") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submittingRef.current || status === "sending") return;
    submittingRef.current = true;

    const { name, email, subject, message } = formState;
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setStatus("validation_error");
      setErrorMessage("Please fill in all required fields.");
      submittingRef.current = false;
      return;
    }
    if (message.trim().length < 10) {
      setStatus("validation_error");
      setErrorMessage("Your message must be at least 10 characters long.");
      submittingRef.current = false;
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/contact/success");
        return;
      }

      if (res.status === 429) {
        setStatus("rate_limited");
        setErrorMessage(data.error || "Too many submissions. Please wait a minute.");
      } else if (res.status >= 500) {
        setStatus("server_error");
        setErrorMessage(data.error || "A server error occurred. Please try again later.");
      } else {
        setStatus("validation_error");
        setErrorMessage(data.error || "Failed to send your message. Please check your details.");
      }
    } catch {
      setStatus("network_error");
      setErrorMessage("A network error occurred. Please check your connection and try again.");
    } finally {
      submittingRef.current = false;
    }
  };

  const isSending = status === "sending";
  const hasError =
    status === "validation_error" ||
    status === "network_error" ||
    status === "server_error" ||
    status === "rate_limited";

  const errorConfig: Record<string, { color: string; icon: React.ElementType; prefix: string }> = {
    validation_error: {
      color: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
      icon: AlertCircle,
      prefix: "Validation",
    },
    network_error: {
      color: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
      icon: AlertCircle,
      prefix: "Network Error",
    },
    server_error: {
      color: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
      icon: AlertCircle,
      prefix: "Server Error",
    },
    rate_limited: {
      color: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
      icon: AlertCircle,
      prefix: "Slow Down",
    },
  };
  const activeErrorConfig = hasError ? errorConfig[status] : null;
  const ErrorIcon = activeErrorConfig?.icon ?? AlertCircle;

  if (contactMode === "live_chat" && isChatActive) {
    return (
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
        <LiveSupportChat onActiveStateChange={setIsChatActive} />
      </div>
    );
  }

  return (
    <div className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${contactMode === "live_chat" ? "py-4 sm:py-6" : "py-12"}`}>
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className={`text-center ${contactMode === "live_chat" ? "mb-4" : "mb-8"}`}>
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-[var(--primary)] ${contactMode === "live_chat" ? "mb-2" : "mb-4"}`}>
          <Mail className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Support &amp; Inquiries Hub</span>
        </div>
        <h1 className={`font-extrabold text-[var(--foreground)] tracking-tight ${contactMode === "live_chat" ? "text-2xl sm:text-3xl mb-1.5" : "text-3xl sm:text-4xl mb-3"}`}>
          Get in Touch
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-lg mx-auto leading-relaxed">
          Need instant technical assistance, software installation guidance, or partnership inquiries? Connect via real-time 1-on-1 chat or send a traditional ticket.
        </p>

        {/* ── Mode Switcher: Live 1-on-1 Support vs Traditional Email Form ── */}
        <div className={`flex justify-center ${contactMode === "live_chat" ? "mt-3" : "mt-6"}`}>
          <div className="inline-flex p-1.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-lg gap-2">
            <button
              type="button"
              onClick={() => setContactMode("live_chat")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                contactMode === "live_chat"
                  ? "bg-gradient-to-r from-[var(--primary)] to-rose-600 text-white shadow-md shadow-[var(--primary)]/20"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ Live Support Chat (Instant)</span>
            </button>
            <button
              type="button"
              onClick={() => setContactMode("email")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                contactMode === "email"
                  ? "bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>✉️ Traditional Email Ticket</span>
            </button>
          </div>
        </div>
      </div>

      {contactMode === "live_chat" ? (
        <div className="space-y-8">
          <LiveSupportChat onActiveStateChange={setIsChatActive} />

          {/* Quick info strip below chat */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]">
            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--foreground)]">Direct Email</p>
                <p className="text-[11px] text-[var(--muted-foreground)] truncate">techsavvy.muthuraj.dev@gmail.com</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--foreground)]">Live Response Hours</p>
                <p className="text-[11px] text-[var(--muted-foreground)]">Mon–Sat, 9AM–6PM IST</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--foreground)]">Headquarters</p>
                <p className="text-[11px] text-[var(--muted-foreground)]">Tamil Nadu, India 🇮🇳</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Info Cards ─────────────────────────────────────────────────── */}
        <div className="space-y-4" aria-label="Contact information">
          {/* Email */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex items-start gap-4 hover:border-[var(--primary)]/30 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)] mb-1">
                Email Us
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                techsavvy.muthuraj.dev@gmail.com
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1 opacity-70">
                Replies within 24–48 hours
              </p>
            </div>
          </div>

          {/* Support Chat */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex items-start gap-4 hover:border-[var(--primary)]/30 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)] mb-1">
                Support Chat
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Use this contact form for fastest response
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1 opacity-70">
                Mon–Sat, 9AM–6PM IST
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex items-start gap-4 hover:border-[var(--primary)]/30 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)] mb-1">
                Based In
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Tamil Nadu, India 🇮🇳
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1 opacity-70">
                Indian Standard Time (IST)
              </p>
            </div>
          </div>

          {/* Request tip */}
          <div className="p-4 rounded-2xl bg-[var(--secondary)]/60 border border-[var(--border)]">
            <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
              <span className="font-semibold text-[var(--foreground)]">
                Quick tip:
              </span>{" "}
              For software requests, use the{" "}
              <a
                href="/request"
                className="text-[var(--primary)] hover:underline font-medium"
              >
                Request a Resource
              </a>{" "}
              page instead for faster processing.
            </p>
          </div>
        </div>

        {/* ── Contact Form ───────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--foreground)] mb-6">
              Send a Message
            </h2>

            {/* Error Banner */}
            {hasError && errorMessage && (
              <div
                role="alert"
                aria-live="assertive"
                className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2 mb-5 animate-in fade-in duration-200 ${activeErrorConfig?.color}`}
              >
                <ErrorIcon className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  {activeErrorConfig?.prefix && (
                    <span className="font-semibold block mb-0.5">
                      {activeErrorConfig.prefix}:
                    </span>
                  )}
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
              noValidate
              aria-label="Contact form"
            >
              {/* Name + Email row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-medium text-[var(--foreground)] mb-1.5"
                  >
                    Your Name{" "}
                    <span className="text-[var(--primary)]" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    required
                    autoComplete="name"
                    aria-required="true"
                    value={formState.name}
                    onChange={handleChange}
                    disabled={isSending}
                    placeholder="e.g. Alex Smith"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-medium text-[var(--foreground)] mb-1.5"
                  >
                    Email Address{" "}
                    <span className="text-[var(--primary)]" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    aria-required="true"
                    value={formState.email}
                    onChange={handleChange}
                    disabled={isSending}
                    placeholder="alex@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-medium text-[var(--foreground)] mb-1.5"
                >
                  Subject{" "}
                  <span className="text-[var(--primary)]" aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  required
                  aria-required="true"
                  value={formState.subject}
                  onChange={handleChange}
                  disabled={isSending}
                  placeholder="How can we assist you?"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                />
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-medium text-[var(--foreground)] mb-1.5"
                >
                  Message{" "}
                  <span className="text-[var(--primary)]" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  aria-required="true"
                  rows={6}
                  value={formState.message}
                  onChange={handleChange}
                  disabled={isSending}
                  placeholder="Provide as much context as possible — resource name, issue description, or your query..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                />
                <p className="text-[10px] text-[var(--muted-foreground)] mt-1 text-right">
                  {formState.message.length} chars
                  {formState.message.length < 10 && formState.message.length > 0 && (
                    <span className="text-amber-500 ml-1">(min 10)</span>
                  )}
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="contact-submit-btn"
                disabled={isSending}
                aria-disabled={isSending}
                aria-busy={isSending}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:bg-[var(--primary-hover)] transition-all shadow-md shadow-[#FD1843]/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Sending message…</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" aria-hidden="true" />
                    <span>Send Message</span>
                  </>
                )}
              </button>

              {/* Disclaimer */}
              <p className="text-[10px] text-center text-[var(--muted-foreground)]">
                By submitting this form, you agree to our{" "}
                <a
                  href="/privacy-policy"
                  className="hover:text-[var(--primary)] transition-colors underline underline-offset-2"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </form>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

