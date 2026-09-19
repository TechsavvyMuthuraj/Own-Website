"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Layers,
  LogOut,
  Settings,
} from "lucide-react";
import dynamic from "next/dynamic";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useCart } from "@/lib/cart/cart-store";
import { useAuth } from "@/lib/auth/auth-context";

const SearchModal = dynamic(
  () => import("@/components/search/search-modal").then((m) => m.SearchModal),
  { ssr: false }
);

export function Header() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, profile, isAdmin, signOut } = useAuth();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/articles", label: "Articles" },
    { href: "/categories", label: "Categories" },
    { href: "/movies", label: "Movies" },
    { href: "/new-and-updated", label: "New & Updated" },
    { href: "/free", label: "Free" },
    { href: "/premium", label: "Premium" },
    { href: "/request", label: "Request" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group" aria-label="NammaTech Home">
              <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[var(--border)] group-hover:ring-amber-500/60 group-hover:scale-105 transition-all shadow-md flex-shrink-0">
                <Image
                  src="/images/nammatech-logo.png"
                  alt="NammaTech Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--secondary)] text-[var(--primary)] font-semibold"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]/60"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions: Search, Cart, Theme, Account */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search Trigger */}
            <button
              type="button"
              id="header-search-btn"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] text-xs text-[var(--muted-foreground)] transition-all shadow-sm"
              aria-label="Search resources"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--secondary)] border border-[var(--border)] text-[var(--muted-foreground)]">
                ⌘K
              </kbd>
            </button>

            {/* Cart Icon */}
            <Link
              href="/cart"
              id="header-cart-btn"
              className="relative p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--secondary)] text-[var(--foreground)] transition-colors"
              aria-label="View shopping cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Account / Auth Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  id="user-menu-trigger"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--secondary)] text-xs font-medium text-[var(--foreground)] transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FD1843] to-[#ff4d6d] flex items-center justify-center text-white text-[11px] font-bold">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {profile?.full_name || user.email?.split("@")[0]}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
                      <p className="font-semibold text-[var(--foreground)] truncate">
                        {profile?.full_name || "User"}
                      </p>
                      <p className="text-[11px] text-[var(--muted-foreground)] truncate">
                        {user.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FD1843]/10 text-[#FD1843] border border-[#FD1843]/20">
                          ADMIN
                        </span>
                      )}
                    </div>

                    <Link
                      href="/account"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Account Dashboard</span>
                    </Link>
                    <Link
                      href="/account/downloads"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FD1843]" />
                      <span>My Downloads</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#FD1843] font-semibold hover:bg-[var(--secondary)] transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/auth/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl text-xs font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-all shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-[var(--border)] hover:bg-[var(--secondary)] text-[var(--foreground)]"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[var(--border)] bg-[var(--card)] px-4 py-4 space-y-1 text-sm shadow-xl animate-in slide-in-from-top-2 duration-150">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-xs font-medium ${
                  pathname === link.href
                    ? "bg-[var(--secondary)] text-[var(--primary)] font-semibold"
                    : "text-[var(--foreground)] hover:bg-[var(--secondary)]/60"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Auth & Account Quick Links */}
            <div className="pt-2 mt-2 border-t border-[var(--border)] space-y-1">
              {user ? (
                <>
                  <Link
                    href="/account/downloads"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FD1843]" />
                    <span>My Downloads</span>
                  </Link>

                  <Link
                    href="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Account Overview</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#FD1843] hover:bg-[var(--secondary)]"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin Console</span>
                    </Link>
                  )}
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2 px-3 rounded-xl border border-[var(--border)] text-xs font-medium text-[var(--foreground)] hover:bg-[var(--secondary)]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2 px-3 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] shadow-xs"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
