import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, CheckCircle2, Lock } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--card)]/50 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Trust Highlight Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-[var(--secondary)]/60 border border-[var(--border)] mb-12">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-1">
                Legitimate Distribution
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Only authorized, open-source, freeware, and public-domain resources with transparent licensing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-1">
                Zero Mock Data
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Every release, version, and download source is strictly verified and database-backed.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-1">
                Secure Signed Downloads
              </h4>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Direct, time-limited presigned URLs with tamper protection and zero deceptive download ads.
              </p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-[var(--muted-foreground)]">
              <li>
                <Link href="/explore" className="hover:text-[var(--primary)] transition-colors">
                  All Resources
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-[var(--primary)] transition-colors">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link href="/new-and-updated" className="hover:text-[var(--primary)] transition-colors">
                  New & Updated Releases
                </Link>
              </li>
              <li>
                <Link href="/free" className="hover:text-[var(--primary)] transition-colors">
                  Free Downloads
                </Link>
              </li>
              <li>
                <Link href="/premium" className="hover:text-[var(--primary)] transition-colors">
                  Premium Resources
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-[var(--muted-foreground)]">
              <li>
                <Link href="/category/pc-software" className="hover:text-[var(--primary)] transition-colors">
                  PC Software
                </Link>
              </li>
              <li>
                <Link href="/category/apk" className="hover:text-[var(--primary)] transition-colors">
                  Authorized APKs
                </Link>
              </li>
              <li>
                <Link href="/category/developer-tools" className="hover:text-[var(--primary)] transition-colors">
                  Developer Tools
                </Link>
              </li>
              <li>
                <Link href="/category/ai-tools" className="hover:text-[var(--primary)] transition-colors">
                  AI Utilities
                </Link>
              </li>
              <li>
                <Link href="/category/templates" className="hover:text-[var(--primary)] transition-colors">
                  Templates & Assets
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-[var(--muted-foreground)]">
              <li>
                <Link href="/about" className="hover:text-[var(--primary)] transition-colors">
                  About NammaTech
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--primary)] transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-[var(--primary)] transition-colors">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[var(--primary)] transition-colors">
                  Admin Console
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] mb-3">
              Legal & Trust
            </h4>
            <ul className="space-y-2 text-xs text-[var(--muted-foreground)]">
              <li>
                <Link href="/privacy-policy" className="hover:text-[var(--primary)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--primary)] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/dmca" className="hover:text-[var(--primary)] transition-colors">
                  DMCA & Copyright
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-[var(--primary)] transition-colors">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-[var(--primary)] transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md overflow-hidden bg-slate-950 flex items-center justify-center border border-white/10">
              <Image
                src="/images/nammatech-logo.png"
                alt="NammaTech Logo"
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            </div>
            <span>&copy; {currentYear} NammaTech. All rights reserved.</span>
          </div>
          <p className="text-center sm:text-right">
            Explore • Download • Upgrade • Together. Built with zero mock data.
          </p>
        </div>
      </div>
    </footer>
  );
}
