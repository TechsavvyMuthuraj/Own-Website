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
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SearchModal } from "@/components/search/search-modal";
import { useCart } from "@/lib/cart/cart-store";
import { useAuth } from "@/lib/auth/auth-context";

export function Header() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, profile, isAdmin, signOut } = useAuth();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore" },
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
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
                <Image
                  src="/images/namma-tech-icon.svg"
                  alt="NammaTech Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                  NammaTech
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)] -mt-1 font-mono">
                  All You Need. One Place.
                </span>
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
          <div className="lg:hidden border-t border-[var(--border)] bg-[var(--card)] px-4 py-4 space-y-1 text-sm shadow-xl">
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
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-semibold text-[#FD1843] hover:bg-[var(--secondary)]"
              >
                Admin Console
              </Link>
            )}
          </div>
        )}
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
