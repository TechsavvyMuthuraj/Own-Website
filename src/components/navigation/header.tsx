"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Mic,
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
  ArrowRight,
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
  target?: string;
}

export const DEFAULT_NAV_LINKS: NavLinkItem[] = [
  { id: "nav-home", href: "/", label: "Home", active: true },
  { id: "nav-community", href: "/community", label: "Community", active: true, badge: "LIVE" },
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
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemCount } = useCart();
  const { user, profile, isAdmin, signOut } = useAuth();

  // Scroll detection for dynamic island compaction - 60fps raf throttled
  useEffect(() => {
    let ticking = false;
    let lastState = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const nowScrolled = window.scrollY > 20;
          if (nowScrolled !== lastState) {
            lastState = nowScrolled;
            setIsScrolled(nowScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Instant route prefetching on idle (0.1ms page switch speed)
  useEffect(() => {
    const prefetchRoutes = () => {
      const coreRoutes = [
        "/",
        "/community",
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
      <header
        className={`sticky top-0 sm:top-2.5 z-40 w-full px-2.5 sm:px-6 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isScrolled ? "sm:pt-0" : "sm:pt-1"
        }`}
      >
        <div className="max-w-7xl mx-auto pointer-events-auto">
          {/* Double-Bezel Floating Island Shell */}
          <div
            className={`relative flex items-center justify-between gap-2 sm:gap-4 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full border transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              isScrolled
                ? "bg-[var(--card)]/90 dark:bg-[#07070a]/90 border-black/10 dark:border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.28),0_1px_1px_rgba(255,255,255,0.06)_inset] backdrop-blur-2xl"
                : "bg-[var(--card)]/80 dark:bg-[#08080d]/80 border-black/5 dark:border-white/10 shadow-[0_10px_32px_rgba(0,0,0,0.14),0_1px_1px_rgba(255,255,255,0.05)_inset] backdrop-blur-xl"
            }`}
          >
            {/* Top edge specular highlight line for luxury glass finish */}
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 dark:via-white/30 to-transparent pointer-events-none rounded-full" />

            {/* Brand Logo with concentric double-bezel */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Link
                href="/"
                prefetch={true}
                onMouseEnter={() => router.prefetch("/")}
                onTouchStart={() => router.prefetch("/")}
                className="flex items-center gap-2.5 pl-0.5 pr-2 py-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
                aria-label="NammaTech Home"
              >
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0.5 bg-gradient-to-br from-amber-500/30 via-transparent to-cyan-500/30 ring-1 ring-black/10 dark:ring-white/15 group-hover:ring-amber-500/70 group-hover:scale-105 transition-all duration-300 shadow-md flex-shrink-0">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src="/images/nammatech-logo-sm.webp"
                      alt="NammaTech Logo"
                      fill
                      sizes="40px"
                      priority
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-black tracking-tight text-[var(--foreground)] group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                    NammaTech
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-medium text-[var(--muted-foreground)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Verified Tech
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links - Concentric Inner Pill Capsule */}
            <nav className="hidden lg:flex items-center gap-0.5 p-1 rounded-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/[0.06] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]">
              {activeLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                const isLive = link.badge === "LIVE" || link.badge === "FREE";
                return (
                  <Link
                    key={link.id || link.href}
                    href={link.href}
                    target={link.target}
                    rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
                    prefetch={true}
                    onMouseEnter={() => router.prefetch(link.href)}
                    onTouchStart={() => router.prefetch(link.href)}
                    className={`relative inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      isActive
                        ? "bg-black/10 dark:bg-white/10 text-[var(--foreground)] font-bold shadow-[0_2px_8px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.15)] ring-1 ring-black/5 dark:ring-white/15"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5 active:scale-95"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-xs ${
                          isLive
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions: Search & Voice, Cart, Theme, Account */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Search & Voice Capsule */}
              <div className="flex items-center rounded-full border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 shadow-2xs">
                <button
                  type="button"
                  id="header-search-btn"
                  onClick={() => {
                    setIsVoiceSearchActive(false);
                    setIsSearchOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 pl-3 pr-2 py-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors group cursor-pointer active:scale-95 flex-shrink-0"
                  aria-label="Search resources"
                >
                  <Search className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Search...</span>
                  <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded-md bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]">
                    ⌘K
                  </kbd>
                </button>
                <div className="w-px h-3.5 bg-black/10 dark:bg-white/15 my-auto" />
                <button
                  type="button"
                  id="header-voice-search-trigger"
                  onClick={() => {
                    setIsVoiceSearchActive(true);
                    setIsSearchOpen(true);
                  }}
                  className="p-1.5 px-2 text-[var(--muted-foreground)] hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer active:scale-95 group rounded-full"
                  title="Voice Search (English & தமிழ்)"
                  aria-label="Start voice search"
                >
                  <Mic className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              {/* Cart Icon Capsule */}
              <Link
                href="/cart"
                id="header-cart-btn"
                className="relative w-9 h-9 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:border-black/20 dark:hover:border-white/20 text-[var(--foreground)] flex items-center justify-center transition-all duration-300 active:scale-95 shadow-2xs group"
                aria-label="View shopping cart"
              >
                <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--primary)] text-white text-[10px] font-black flex items-center justify-center shadow-[0_0_8px_rgba(253,24,67,0.6)]">
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* Theme Toggle Capsule */}
              <div className="hidden sm:flex items-center">
                <ThemeToggle />
              </div>

              {/* User Account / Auth Dropdown */}
              {user ? (
                <div className="relative">
                  <button
                    ref={userBtnRef}
                    type="button"
                    id="user-menu-trigger"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:border-black/20 dark:hover:border-white/20 text-xs font-medium text-[var(--foreground)] transition-all duration-300 cursor-pointer active:scale-95 shadow-2xs"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FD1843] to-[#ff4d6d] p-0.5 ring-1 ring-white/20 flex items-center justify-center text-white text-[11px] font-bold shadow-xs">
                      {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="hidden md:inline max-w-[90px] truncate font-semibold">
                      {profile?.full_name || user.email?.split("@")[0]}
                    </span>
                  </button>

                  {/* Luxury Dropdown */}
                  {isUserMenuOpen && (
                    <div
                      ref={userMenuRef}
                      className="absolute right-0 mt-3 w-56 rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)]/95 dark:bg-[#09090e]/95 backdrop-blur-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200 text-xs space-y-1"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-black/5 dark:border-white/10 mb-1">
                        <p className="font-bold text-[var(--foreground)] truncate">
                          {profile?.full_name || "User"}
                        </p>
                        <p className="text-[11px] text-[var(--muted-foreground)] truncate">
                          {user.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#FD1843]/10 text-[#FD1843] border border-[#FD1843]/20">
                            ADMIN
                          </span>
                        )}
                      </div>

                      <Link
                        href="/account"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Account Dashboard</span>
                      </Link>
                      <Link
                        href="/account/downloads"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>My Downloads</span>
                      </Link>
                      <Link
                        href="/contact"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium"
                      >
                        <Headphones className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Contact & Live Support</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#FD1843] font-bold hover:bg-[#FD1843]/10 transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Admin Console</span>
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors mt-1 font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Link
                    href="/auth/login"
                    className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                  >
                    Sign in
                  </Link>

                  {/* Island Button with nested button-in-button arrow */}
                  <Link
                    href="/auth/register"
                    className="group relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:pl-4 sm:pr-1.5 py-1.5 sm:py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-neutral-950 text-[11px] sm:text-xs font-black shadow-[0_0_18px_rgba(245,158,11,0.35)] hover:shadow-[0_0_24px_rgba(245,158,11,0.55)] active:scale-95 transition-all duration-300"
                  >
                    <span>Get Started</span>
                    <span className="hidden sm:flex w-6 h-6 rounded-full bg-neutral-950/15 text-neutral-950 items-center justify-center group-hover:translate-x-0.5 group-hover:scale-105 transition-all duration-300">
                      <ArrowRight className="w-3 h-3 text-neutral-950 stroke-[2.5]" />
                    </span>
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger with Fluid Morph Animation */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden relative w-9 h-9 rounded-full border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-[var(--foreground)] flex items-center justify-center transition-all duration-300 active:scale-95 shadow-2xs"
                aria-label="Toggle mobile menu"
              >
                <div className="w-4 h-3.5 relative flex flex-col justify-between items-center">
                  <span
                    className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${
                      isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                    }`}
                  />
                  <span
                    className={`w-full h-0.5 bg-current rounded-full transition-all duration-200 ${
                      isMobileMenuOpen ? "opacity-0 scale-x-0" : ""
                    }`}
                  />
                  <span
                    className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 origin-center ${
                      isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer - Detached Island Card */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-2.5 rounded-3xl border border-black/10 dark:border-white/10 bg-[var(--card)]/95 dark:bg-[#07070b]/95 backdrop-blur-3xl p-4 shadow-2xl space-y-2 animate-in fade-in slide-in-from-top-3 duration-300">
              <div className="flex items-center justify-between px-3 py-1.5 mb-1 sm:hidden">
                <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Theme</span>
                <ThemeToggle />
              </div>

              <div className="grid grid-cols-1 gap-1">
                {activeLinks.map((link) => (
                  <Link
                    key={link.id || link.href}
                    href={link.href}
                    target={link.target}
                    rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
                    prefetch={true}
                    onMouseEnter={() => router.prefetch(link.href)}
                    onTouchStart={() => router.prefetch(link.href)}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all ${
                      pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                        ? "bg-black/10 dark:bg-white/10 text-[var(--foreground)] font-bold shadow-xs border border-black/5 dark:border-white/10"
                        : "text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Mobile Auth & Account Quick Links */}
              <div className="pt-2.5 mt-2 border-t border-black/5 dark:border-white/10 space-y-1">
                {user ? (
                  <>
                    <Link
                      href="/account/downloads"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>My Downloads</span>
                    </Link>

                    <Link
                      href="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <User className="w-4 h-4" />
                      <span>Account Overview</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-[#FD1843] hover:bg-[#FD1843]/10"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Admin Console</span>
                      </Link>
                    )}
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center py-2.5 px-3 rounded-full border border-black/10 dark:border-white/10 text-xs font-medium text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center py-2.5 px-3 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white text-xs font-bold shadow-md active:scale-95 transition-all"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {isSearchOpen && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => {
            setIsSearchOpen(false);
            setIsVoiceSearchActive(false);
          }}
          initialVoiceActive={isVoiceSearchActive}
        />
      )}
    </>
  );
}
