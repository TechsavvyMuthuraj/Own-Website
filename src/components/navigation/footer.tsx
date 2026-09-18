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

        {/* Bottom copyright & Socials */}
        <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md overflow-hidden flex items-center justify-center">
              <Image
                src="/images/namma-tech-icon.svg"
                alt="NammaTech Logo"
                width={24}
                height={24}
                className="w-full h-full object-contain"
              />
            </div>
            <span>&copy; {currentYear} NammaTech. Founded by <strong>Muthuraj C</strong>.</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/techiemuthuraj/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Muthuraj on Instagram"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:text-rose-500 hover:border-rose-500/40 transition-all font-medium text-[11px]"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>Instagram</span>
            </a>

            <a
              href="https://www.youtube.com/@techiemuthuraj/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Subscribe to Muthuraj on YouTube"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:text-red-500 hover:border-red-500/40 transition-all font-medium text-[11px]"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span>YouTube</span>
            </a>
          </div>

          <p className="text-center sm:text-right">
            Explore • Download • Upgrade • Together. Built with zero mock data.
          </p>
        </div>
      </div>
    </footer>
  );
}
