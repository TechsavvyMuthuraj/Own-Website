"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // If on admin login page, don't show admin sidebar/header chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/resources", label: "Resources", icon: Package },
    { href: "/admin/movies", label: "Movies & Cinema", icon: Film },
    { href: "/admin/articles", label: "Articles & News", icon: Newspaper },
    { href: "/admin/categories", label: "Categories", icon: Layers },
    { href: "/admin/users", label: "Users & Verification", icon: Users },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/coupons", label: "Coupons", icon: Tag },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { href: "/admin/ads", label: "Ad Placements", icon: Sliders },
    { href: "/admin/messages", label: "Contact Inbox", icon: Mail },
    { href: "/admin/requests", label: "Software Requests", icon: Compass },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: FileText },
    { href: "/admin/settings", label: "System Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--background)]">
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--foreground)]"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-sm text-[var(--foreground)]">NammaTech Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/" className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Site
          </Link>
        </div>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 border-r border-[var(--border)] bg-[var(--card)] flex flex-col transition-transform duration-300 md:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shadow-md flex-shrink-0 ring-1 ring-[var(--border)]">
              <Image
                src="/images/nammatech-logo.png"
                alt="NammaTech Logo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-sm text-[var(--foreground)] block">
                NammaTech
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                Admin Console
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="md:hidden p-1 text-[var(--muted-foreground)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
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
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[var(--primary)] text-white shadow-sm font-semibold"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
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

          <div className="p-2.5 rounded-xl bg-[var(--secondary)]/60 border border-[var(--border)] flex items-center justify-between">
            <div className="min-w-0">
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
              className="p-1.5 text-[var(--muted-foreground)] hover:text-red-500 rounded-lg hover:bg-[var(--card)] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 overflow-x-hidden p-4 sm:p-8 md:p-10">{children}</main>
    </div>
  );
}
