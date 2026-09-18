import React from "react";
import Image from "next/image";
import { ShieldCheck, CheckCircle2, Lock, FileCode, Layers } from "lucide-react";
import { FounderProfile } from "@/components/home/founder-profile";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About NammaTech & Founder Muthuraj C",
  description:
    "Learn about NammaTech's mission to deliver verified open-source software, developer tools, and digital resources. Founded by Muthuraj C.",
  openGraph: {
    title: "About NammaTech & Founder Muthuraj C",
    description:
      "Learn about NammaTech's mission to deliver verified digital resources and open-source software.",
  },
};

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  mainEntity: {
    "@type": "Person",
    name: "Muthuraj C",
    jobTitle: "Founder & Lead Architect",
    image: "https://nammatech.in/images/founder-muthuraj.png",
    worksFor: {
      "@type": "Organization",
      name: "NammaTech",
      url: "https://nammatech.in",
    },
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <div className="max-w-3xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-5 shadow-xl bg-slate-950 flex items-center justify-center border border-amber-500/30 p-2">
          <Image
            src="/images/namma-tech-icon.svg"
            alt="NammaTech Logo"
            width={48}
            height={48}
            className="w-full h-full object-contain"
            priority
          />
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/20 bg-[var(--card)] text-xs font-semibold text-amber-500 mb-4">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-[var(--foreground)] leading-relaxed">
        <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-3">
          <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span>Zero Mock Data</span>
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            We never publish simulated ratings, inflated download counts, or artificial countdown clocks. What you see is backed by real, authenticated database records.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-3">
          <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-500 flex-shrink-0" />
            <span>Anti-Deception Standard</span>
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            We reject deceptive fake download buttons that trick users into running untrusted adware. All downloads on this platform are direct, clean, and verified.
          </p>
        </div>

        <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-3">
          <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
            <FileCode className="w-5 h-5 text-cyan-500 flex-shrink-0" />
            <span>Respect for Creators</span>
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Every resource clearly credits developers and licenses. We actively protect developer rights and uphold strict DMCA procedures.
          </p>
        </div>
      </div>

      {/* Meet the Founder & Developer */}
      <div className="pt-4">
        <FounderProfile />
      </div>
    </div>
  );
}
