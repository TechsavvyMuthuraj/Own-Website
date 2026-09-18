"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  ShoppingBag,
  Download,
  Heart,
  Settings,
  LogOut,
  Compass,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, profile, isAdmin, signOut } = useAuth();

  const navItems = [
    { href: "/account", label: "Overview", icon: User },
    { href: "/account/downloads", label: "My Downloads", icon: Download },
    { href: "/account/orders", label: "Order History", icon: ShoppingBag },
    { href: "/account/favorites", label: "Saved Favorites", icon: Heart },
    { href: "/account/profile", label: "Profile & Security", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* User Greeting Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] mb-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FD1843] to-[#ff4d6d] flex items-center justify-center text-white text-xl font-bold shadow-md">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
                  {profile?.full_name || "User Account"}
                </h1>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FD1843]/10 text-[#FD1843] border border-[#FD1843]/20">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                {user?.email || "Authenticated user"}
              </p>
            </div>
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all shadow-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Console</span>
            </Link>
          )}
        </div>

        {/* Sidebar & Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left 1 Col: Navigation */}
          <aside className="space-y-1">
            <div className="p-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[var(--primary)] text-white shadow-sm"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={() => signOut()}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors mt-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* Right 3 Cols: Active Section */}
          <div className="md:col-span-3">{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
