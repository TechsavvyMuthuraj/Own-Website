import React from "react";
import Link from "next/link";
import { CheckCircle2, Home, ArrowRight, MessageSquare, Sparkles } from "lucide-react";

export const metadata = {
  title: "Message Sent – NammaTech",
  description: "Your message has been received. Our team will get back to you shortly.",
};

export default function ContactSuccessPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Success Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-3xl bg-emerald-500/10 animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-xl shadow-emerald-500/10">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          {/* Confetti dots */}
          <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[var(--primary)]/40" />
          <div className="absolute -bottom-1 -left-3 w-3 h-3 rounded-full bg-emerald-400/50" />
          <div className="absolute top-2 -left-4 w-2 h-2 rounded-full bg-amber-400/60" />
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Message Received</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
            Thank You! 🎉
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-sm mx-auto">
            Your message has been delivered to the NammaTech team. We&apos;ll review it carefully and get back to you within 24–48 hours.
          </p>
        </div>

        {/* Info Card */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-left space-y-3">
          <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[var(--primary)]" />
            What happens next?
          </h3>
          <ul className="space-y-2 text-xs text-[var(--muted-foreground)]">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold text-[9px] flex-shrink-0">1</span>
              <span>Our team receives your message instantly via email notification.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold text-[9px] flex-shrink-0">2</span>
              <span>We review and log your inquiry in our support system.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold text-[9px] flex-shrink-0">3</span>
              <span>You&apos;ll receive a reply at your provided email address within 1–2 business days.</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            id="contact-success-home-btn"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:bg-[var(--primary-hover)] transition-all shadow-md shadow-[#FD1843]/25"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/contact"
            id="contact-success-another-btn"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-all"
          >
            <span>Send Another Message</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Extra Links */}
        <p className="text-xs text-[var(--muted-foreground)]">
          Need something fast?{" "}
          <Link href="/request" className="text-[var(--primary)] hover:underline font-medium">
            Request a resource
          </Link>
          {" "}or{" "}
          <Link href="/explore" className="text-[var(--primary)] hover:underline font-medium">
            explore our catalog
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
