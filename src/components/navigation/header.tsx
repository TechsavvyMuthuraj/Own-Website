"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
  Headphones,
} from "lucide-react";
import dynamic from "next/dynamic";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useCart } from "@/lib/cart/cart-store";
import { useAuth } from "@/lib/auth/auth-context";

const SearchModal = dynamic(
  () => import("@/components/search/search-modal").then((m) => m.SearchModal),
  { ssr: false }
);

export interface NavLinkItem {
  id?: string;
  href: string;
  label: string;
  active?: boolean;
  badge?: string;
}

export const DEFAULT_NAV_LINKS: NavLinkItem[] = [
  { id: "nav-home", href: "/", label: "Home", active: true },
  { id: "nav-movies", href: "/movies", label: "Movies", active: true, badge: "HOT" },
  { id: "nav-categories", href: "/categories", label: "Categories", active: true },
  { id: "nav-free", href: "/free", label: "Free", active: true, badge: "FREE" },
  { id: "nav-new", href: "/new-and-updated", label: "New & Updated", active: true },
  { id: "nav-articles", href: "/articles", label: "Articles", active: true },
  { id: "nav-premium", href: "/premium", label: "Premium", active: true, badge: "VIP" },
  { id: "nav-request", href: "/request", label: "Request", active: true },
  { id: "nav-contact", href: "/contact", label: "Contact", active: true, badge: "LIVE" },
];

interface HeaderProps {
  navLinks?: NavLinkItem[];
}

export function Header({ navLinks }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, profile, isAdmin, signOut } = useAuth();

  // Instant route prefetching on idle (0.1ms page switch speed)
  useEffect(() => {
    const prefetchRoutes = () => {
      const coreRoutes = [
        "/",
        "/movies",
        "/categories",
        "/free",
        "/new-and-updated",
        "/articles",
        "/premium",
        "/request",
        "/contact",
      ];
      coreRoutes.forEach((route) => {
        try {
          router.prefetch(route);
        } catch {}
      });
    };

    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(prefetchRoutes);
      } else {
        setTimeout(prefetchRoutes, 800);
      }
    }
  }, [router]);

  const [links, setLinks] = useState<NavLinkItem[]>(() => {
    if (navLinks !== undefined) return navLinks;
    return DEFAULT_NAV_LINKS;
  });

  // Sync if navLinks prop changes from server layout
  useEffect(() => {
    if (navLinks !== undefined) {
      setLinks(navLinks);
    }
  }, [navLinks]);

  // Fetch dynamic nav links when not passed by layout (e.g. AccountLayout) and listen to admin updates
  useEffect(() => {
    let isMounted = true;
    const fetchLatestNav = async () => {
      try {
        const res = await fetch("/api/navigation", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.navLinks)) {
            setLinks(data.navLinks);
          }
        }
      } catch {}
    };

    if (navLinks === undefined) {
      fetchLatestNav();
    }

    const onNavUpdated = () => {
      fetchLatestNav();
    };
    window.addEventListener("nammatech-nav-updated", onNavUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("nammatech-nav-updated", onNavUpdated);
    };
  }, [navLinks]);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const userBtnRef = useRef<HTMLButtonElement>(null);

  // Close user profile dropdown on outside click or Escape key
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(target) &&
        userBtnRef.current &&
        !userBtnRef.current.contains(target)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isUserMenuOpen]);

  // Close on route change
  useEffect(() => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Strictly filter out any item that is inactive or hidden
  const activeLinks = links.filter((l) => l.active !== false);

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
                  unoptimized
                />
              </div>
            </Link>

            {/* Desktop Navigation with Instant Route Prefetching & Dynamic Editable Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {activeLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.id || link.href}
                    href={link.href}
                    prefetch={true}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--secondary)] text-[var(--primary)] font-semibold"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]/60"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30">
                        {link.badge}
                      </span>
                    )}
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
                  ref={userBtnRef}
                  type="button"
                  id="user-menu-trigger"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--secondary)] text-xs font-medium text-[var(--foreground)] transition-colors cursor-pointer"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
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
                    ref={userMenuRef}
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
                    <Link
                      href="/contact"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                    >
                      <Headphones className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Contact &amp; Live Support</span>
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
            {activeLinks.map((link) => (
              <Link
                key={link.id || link.href}
                href={link.href}
                prefetch={true}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium ${
                  pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                    ? "bg-[var(--secondary)] text-[var(--primary)] font-semibold"
                    : "text-[var(--foreground)] hover:bg-[var(--secondary)]/60"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30">
                    {link.badge}
                  </span>
                )}
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

      {isSearchOpen && (
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      )}
    </>
  );
}
