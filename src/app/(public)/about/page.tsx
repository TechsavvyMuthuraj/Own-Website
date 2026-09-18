import React from "react";
import Image from "next/image";
import { ShieldCheck, CheckCircle2, Lock, FileCode, Layers } from "lucide-react";

export const metadata = {
  title: "About NammaTech",
  description: "Learn about NammaTech's mission to provide fast, verified, and legal digital resources. All you need. One place.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-5 shadow-xl bg-slate-950 flex items-center justify-center border border-white/10">
          <Image
            src="/images/nammatech-logo.png"
            alt="NammaTech Logo"
            width={64}
            height={64}
            className="w-full h-full object-cover"
            priority
          />
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-[var(--primary)] mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>About NammaTech</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight mb-4">
          Trust-First Digital Distribution
        </h1>
        <p className="text-base text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
          NammaTech was engineered to solve the clutter, deceptive advertisements, and security risks common across traditional software directories. All you need. One place.
        </p>
      </div>

      {/* Core Principles */}
      <div className="space-y-6 text-sm text-[var(--foreground)] leading-relaxed">
        <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-3">
          <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            1. Zero Mock Data, Complete Transparency
          </h2>
          <p className="text-[var(--muted-foreground)]">
            We never publish simulated ratings, inflated download counts, or artificial countdown clocks. What you see is backed by real, authenticated database records. If a resource hasn&apos;t been reviewed or verified, it isn&apos;t published.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-3">
          <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-500" />
            2. Strict Anti-Deception Standards
          </h2>
          <p className="text-[var(--muted-foreground)]">
            We reject deceptive &quot;Download Now&quot; advertising banners that trick users into running untrusted installers. All downloads on this platform are direct, clean, and delivered via secure signed URLs or official developer mirrors.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-3">
          <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-500" />
            3. Respect for Licensing and Copyright
          </h2>
          <p className="text-[var(--muted-foreground)]">
            Every resource clearly states its developer, version, and license terms (GPL, MIT, Apache, Freeware, Public Domain, or Commercial). We actively protect developer rights and uphold strict DMCA takedown procedures.
          </p>
        </div>
      </div>
    </div>
  );
}
