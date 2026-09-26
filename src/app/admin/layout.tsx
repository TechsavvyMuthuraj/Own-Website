"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  CreditCard,
  Tag,
  Megaphone,
  Sliders,
  Mail,
  FileText,
  Settings,
  LogOut,
  Compass,
  Menu,
  X,
  ExternalLink,
  Film,
  Newspaper,
  Home,
  Headphones,
  Video,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { TopLoader } from "@/components/navigation/top-loader";
import { AdsterraPopUpAd } from "@/components/ads/AdsterraPopUpAd";
import { AdsterraStickyBar } from "@/components/ads/AdsterraStickyBar";
import { AdsterraScript } from "@/components/ads/AdsterraScript";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      if (pathname !== "/admin/login") {
        router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [loading, user, isAdmin, pathname, router]);

  // If on admin login page, don't show admin sidebar/header chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-[var(--muted-foreground)]">Verifying Administrator Session...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-[var(--muted-foreground)]">Redirecting to Admin Gateway...</p>
        </div>
      </div>
    );
  }

  const navSections = [
    {
      title: "Core",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/homepage", label: "Homepage Editor", icon: Home },
      ],
    },
    {
      title: "Catalog & Content",
      items: [
        { href: "/admin/resources", label: "Resources", icon: Package },
        { href: "/admin/movies", label: "Movies & Cinema", icon: Film },
        { href: "/admin/articles", label: "Articles & News", icon: Newspaper },
        { href: "/admin/categories", label: "Categories", icon: Layers },
      ],
    },
    {
      title: "Sales & Community",
      items: [
        { href: "/admin/users", label: "Users & Verification", icon: Users },
        { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
        { href: "/admin/payments", label: "Payments", icon: CreditCard },
        { href: "/admin/coupons", label: "Coupons", icon: Tag },
        { href: "/admin/support-team", label: "Support Team & Roster", icon: Headphones },
        { href: "/admin/community", label: "Community Hub Chat 💬", icon: MessageSquare },
        { href: "/admin/meetings", label: "Zoom & Video Calls 📹", icon: Video },
        { href: "/technicalsupport", label: "Specialist Terminal ⚡", icon: Headphones },
        { href: "/admin/messages", label: "Contact Inbox", icon: Mail },
        { href: "/admin/requests", label: "Resource Requests", icon: Compass },
      ],
    },
    {
      title: "System & Marketing",
      items: [
        { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
        { href: "/admin/ads", label: "Monetization & Ads", icon: DollarSign },
        { href: "/admin/audit-logs", label: "Audit Logs", icon: FileText },
        { href: "/admin/settings", label: "System Settings", icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--background)]">
      <Suspense fallback={null}>
        <TopLoader />
      </Suspense>
      <AdsterraScript />
      <AdsterraPopUpAd />
      <AdsterraStickyBar />
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)]"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-sm text-[var(--foreground)]">NammaTech Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/" target="_blank" className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Site ↗
          </Link>
        </div>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 border-r border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-xl flex flex-col transition-transform duration-300 md:translate-x-0 ${
          mobileNavOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center shadow-md flex-shrink-0 ring-1 ring-[var(--border)] group-hover:scale-105 transition-transform">
              <Image
                src="/images/nammatech-logo.png"
                alt="NammaTech Logo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                priority
                unoptimized
              />
            </div>
            <div>
              <span className="font-black text-sm text-[var(--foreground)] tracking-tight block">
                NammaTech
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)] font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Console v3.0
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="md:hidden p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categorized Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] opacity-70 mb-1">
                {sec.title}
              </div>
              {sec.items.map((item) => {
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md shadow-[var(--primary)]/20 font-bold"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 flex-shrink-0 ${
                        isActive
                          ? "text-[var(--primary-foreground)]"
                          : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom User / Site Link */}
        <div className="p-3 border-t border-[var(--border)] space-y-2">
          <div className="flex items-center justify-between px-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <ThemeToggle />
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--secondary)]/60 border border-[var(--border)] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/15 border border-[var(--primary)]/20 text-[var(--primary)] flex items-center justify-center font-bold text-xs shrink-0">
              {(profile?.full_name || user?.email || "A").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[var(--foreground)] truncate">
                {profile?.full_name || "Admin"}
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)] truncate">
                {user?.email}
              </p>
            </div>
            <button
              type="button"
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 text-[var(--muted-foreground)] hover:text-red-500 rounded-lg hover:bg-[var(--card)] transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop Overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-30 md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Admin Content Canvas */}
      <main
        className={`flex-1 w-full max-w-full overflow-x-hidden ${
          pathname === "/admin/articles/new" ||
          (pathname.startsWith("/admin/articles/") && pathname.endsWith("/edit"))
            ? "p-2 sm:p-4 md:p-6"
            : "p-3.5 sm:p-6 md:p-10"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
