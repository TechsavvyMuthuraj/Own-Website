import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Crown,
  Sparkles,
  Code2,
  ShieldCheck,
  ExternalLink,
  Zap,
  Mail,
  CheckCircle2,
} from "lucide-react";

export function FounderProfile() {
  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6 sm:p-10 lg:p-12 shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Portrait Polaroid Frame */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="group relative w-full max-w-[240px] sm:max-w-xs lg:max-w-sm">
              {/* Outer Golden Aura Glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 via-yellow-400/30 to-amber-600/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />

              {/* Photo Frame Container */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/40 bg-[#FDE000] shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                <div className="relative aspect-[9/16] w-full bg-[#FDE000]">
                  <Image
                    src="/images/founder-muthuraj.png"
                    alt="Muthuraj C - Founder & CEO of NammaTech"
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 280px, (max-width: 1024px) 340px, 400px"
                    className="object-cover object-center"
                    priority
                  />
                </div>

                {/* Floating Verified Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-950/85 backdrop-blur-md border border-amber-500/40 text-amber-400 text-xs font-bold shadow-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Founder</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Founder Details & Social Handles */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5" />
                <span>Founder & Chief Executive Officer</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Muthuraj C
              </h2>

              <p className="text-sm sm:text-base font-semibold text-amber-400">
                Lead Software Architect • Digital Creator • Tech Entrepreneur
              </p>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              Muthuraj C is a dedicated software developer, digital architect, and tech creator behind{" "}
              <strong className="text-white">Techsavvy Muthuraj</strong> and{" "}
              <strong className="text-amber-400">NammaTech</strong>. Driven by a mission to build transparent, high-speed, and secure digital infrastructure, he engineered NammaTech to give developers, students, and digital creators direct access to verified software, open-source tools, developer utilities, and cinema media — zero deceptive ads, zero mock data, and 100% community-first trust.
            </p>

            {/* Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-200">
                <Code2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Full-Stack Web & Next.js Architecture</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero Mock Data & 100% Transparency</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-200">
                <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>High-Speed Direct Cloud Delivery</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-neutral-200">
                <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Tech Creator & Mentor @techiemuthuraj</span>
              </div>
            </div>

            {/* Connect & Social Media Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              {/* Instagram Button */}
              <a
                href="https://www.instagram.com/techiemuthuraj/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white font-bold text-xs shadow-lg shadow-rose-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                {/* Instagram Camera Icon */}
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>Follow on Instagram</span>
                <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
              </a>

              {/* YouTube Button */}
              <a
                href="https://www.youtube.com/@techiemuthuraj/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#FF0000] hover:bg-[#E60000] text-white font-bold text-xs shadow-lg shadow-red-600/20 active:scale-95 transition-all cursor-pointer"
              >
                {/* YouTube Play Icon */}
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span>Subscribe on YouTube</span>
                <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
              </a>

              {/* Contact Link */}
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs transition-all cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Get in Touch</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
