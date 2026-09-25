"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";

interface ArticleAuthorCardProps {
  authorName: string;
}

export function ArticleAuthorCard({ authorName }: ArticleAuthorCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const isFounder = authorName.toLowerCase().includes("muthuraj") || authorName === "NammaTech";

  return (
    <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-[var(--card)] via-[var(--card)]/90 to-amber-500/[0.03] p-6 sm:p-7 shadow-lg space-y-4">
      <div className="flex items-start gap-4 sm:gap-5">
        {/* Author Avatar */}
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border-2 border-amber-500/40 flex-shrink-0 bg-neutral-900 shadow-md ring-2 ring-amber-500/10">
          {isFounder && !imageFailed ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src="/images/founder-muthuraj.png"
              alt="Muthuraj C - Founder"
              className="w-full h-full object-cover object-top"
              onError={() => setImageFailed(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center font-black text-amber-400 bg-gradient-to-br from-amber-600/30 to-amber-950/60 text-lg select-none">
              <span>{isFounder ? "MC" : authorName.slice(0, 2).toUpperCase()}</span>
              {isFounder && <span className="text-[8px] tracking-widest text-amber-300 font-mono">FOUNDER</span>}
            </div>
          )}

          {isFounder && (
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-neutral-950 rounded-full p-0.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
        </div>

        {/* Author Details */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-black text-[var(--foreground)] tracking-tight">
              {isFounder ? "Muthuraj C" : authorName}
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{isFounder ? "Verified Founder" : "Verified Creator"}</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
            {isFounder
              ? "Founder & Lead Architect at NammaTech. Full-Stack Engineer and Tech Educator specializing in verified software pipelines, distributed architecture, and open developer tooling."
              : "Technical Contributor and verified software curator on NammaTech Journal."}
          </p>
        </div>
      </div>

      {/* Author Links & Socials */}
      <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          {/* YouTube */}
          <a
            href="https://www.youtube.com/@techiemuthuraj/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-red-500 hover:text-red-400 transition-colors"
            title="Subscribe on YouTube"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <span>@techiemuthuraj</span>
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/TechsavvyMuthuraj"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            title="Follow on GitHub"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/techiemuthuraj/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-pink-500 hover:text-pink-400 transition-colors"
            title="Follow on Instagram"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>Instagram</span>
          </a>
        </div>

        <Link
          href="/about"
          className="inline-flex items-center gap-1 text-[var(--muted-foreground)] hover:text-amber-500 font-semibold transition-colors group"
        >
          <span>More about founder</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

