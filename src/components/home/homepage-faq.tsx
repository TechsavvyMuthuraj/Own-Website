"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";
import Link from "next/link";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Are all software, APKs, and tools on NammaTech safe to download?",
    answer:
      "Yes. Every binary and package published on NammaTech undergoes SHA-256 cryptographic verification against official developer releases and multi-engine security scanning. We strictly disallow repackaged installers, third-party download managers, and bundled adware.",
  },
  {
    question: "Do I need to create an account to download resources?",
    answer:
      "No account is required for 95% of our catalog! All open-source software, freeware utilities, Android APKs, developer tools, and public 4K wallpapers are immediately accessible via direct, unthrottled links. An account is only needed if you wish to track your order history, access 4K VIP cinema, or manage submitted requests.",
  },
  {
    question: "What is the difference between Free downloads and 4K VIP Cinema releases?",
    answer:
      "Standard Free resources are 100% open-source or public freeware distributed under MIT, GPL, Apache, or developer permissions. The 4K VIP Cinema Hub provides exclusive high-bitrate master releases (4K UHD, HDR10+, Dolby Atmos audio) with multiple file-size choices.",
  },
  {
    question: "Can I request specific software, developer packages, or movie titles?",
    answer:
      "Absolutely! Use our dedicated Community Request page (/request). Our team will audit the license, verify the authentic source, generate mirrors, and notify you as soon as the release is published.",
  },
  {
    question: "How do you ensure direct high-speed download speeds?",
    answer:
      "All files are hosted on enterprise multi-region cloud object storage and edge CDN nodes. When you click download, your connection communicates directly with storage nodes without deceptive redirect chains or artificial speed caps.",
  },
  {
    question: "I am a software developer. How can I submit my application to NammaTech?",
    answer:
      "We love featuring independent and open-source creators! Visit our contact page or community request hub to submit your project URL, license, and repository. Once our team completes standard hash and security checks, your tool will be published with full creator attribution.",
  },
];

export function HomepageFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 text-xs font-bold uppercase tracking-wider mb-2.5">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Answered</span>
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight">
          Everything You Need to Know About NammaTech
        </h2>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1.5 max-w-lg">
          Clear, honest answers regarding downloads, security audits, and licensing.
        </p>
      </div>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "border-[var(--primary)]/40 bg-[var(--card)] shadow-md"
                  : "border-[var(--border)] bg-[var(--card)]/80 hover:border-[var(--border)]/90"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors cursor-pointer"
              >
                <span className="text-sm sm:text-base font-bold text-[var(--foreground)] pr-4">
                  {item.question}
                </span>
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 ${
                    isOpen
                      ? "bg-[var(--primary)] text-white border-[var(--primary)] rotate-180"
                      : "bg-[var(--secondary)] text-[var(--muted-foreground)] border-[var(--border)]"
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 animate-in fade-in duration-200">
                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed border-t border-[var(--border)] pt-3">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Still have questions banner */}
      <div className="mt-8 p-5 rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
              Have a specific question or custom software request?
            </h4>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Our lead developer is always available to verify and curate tools.
            </p>
          </div>
        </div>
        <Link
          href="/request"
          className="px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-bold transition-all shadow-md shadow-[var(--primary)]/20 whitespace-nowrap cursor-pointer"
        >
          Submit Request
        </Link>
      </div>
    </section>
  );
}
