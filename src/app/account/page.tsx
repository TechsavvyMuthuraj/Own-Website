"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  ShoppingBag,
  Heart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  User,
  Loader2,
  Calendar,
  Layers,
  Settings,
  Headphones,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

export default function AccountOverviewPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [entitlementsCount, setEntitlementsCount] = useState<number>(0);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/account");
      return;
    }

    if (!user) return;

    let isMounted = true;
    const supabase = createClient();

    async function loadUserStats() {
      try {
        setStatsLoading(true);

        const [entitlementsRes, ordersRes, favoritesRes] = await Promise.all([
          supabase
            .from("entitlements")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user!.id)
            .eq("status", "ACTIVE"),
          supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user!.id),
          supabase
            .from("favorites")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user!.id),
        ]);

        if (isMounted) {
          setEntitlementsCount(entitlementsRes.count || 0);
          setOrdersCount(ordersRes.count || 0);
          setFavoritesCount(favoritesRes.count || 0);
        }
      } catch (err) {
        console.error("Error loading account stats:", err);
      } finally {
        if (isMounted) {
          setStatsLoading(false);
        }
      }
    }

    loadUserStats();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        <p className="text-xs text-[var(--muted-foreground)]">Loading your account dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
          Account Overview
        </h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          View your active digital entitlements, order records, and saved items.
        </p>
      </div>

      {/* Real Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/account/downloads"
          className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--ring)]/50 transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--muted-foreground)]">
              My Purchased Products
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--foreground)]">
            {statsLoading ? "—" : entitlementsCount}
          </div>
        </Link>

        <Link
          href="/account/orders"
          className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--ring)]/50 transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--muted-foreground)]">
              Total Orders
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--foreground)]">
            {statsLoading ? "—" : ordersCount}
          </div>
        </Link>

        <Link
          href="/account/favorites"
          className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--ring)]/50 transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--muted-foreground)]">
              Saved Favorites
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--foreground)]">
            {statsLoading ? "—" : favoritesCount}
          </div>
        </Link>

        {/* Contact & Live Technical Support Card */}
        <Link
          href="/account/support"
          className="p-5 rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-[var(--card)] to-[var(--card)] hover:border-sky-500 transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-sky-500 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Technical Support
            </span>
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 group-hover:scale-110 transition-transform">
              <Headphones className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base font-extrabold text-[var(--foreground)]">
              Support Desk
            </span>
            <span className="text-xs text-sky-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
              <span>Open</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>
      </div>

      {/* ── Direct Realtime Support Banner ── */}
      <div className="p-6 rounded-3xl border border-[var(--border)] bg-gradient-to-r from-sky-500/10 via-[var(--card)] to-indigo-500/10 relative overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-extrabold text-sm sm:text-base text-[var(--foreground)]">
                  Need Technical Help or Custom Setup?
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                  Specialist Online
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] max-w-xl leading-relaxed">
                Connect 1-on-1 with an administrator in real time for installation troubleshooting, software fixes, VIP Google Drive mirrors, or direct inquiry answers.
              </p>
            </div>
          </div>

          <Link
            href="/account/support"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-neutral-950 text-xs font-bold transition-all shadow-md shadow-sky-500/20 whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Launch Technical Support Hub</span>
          </Link>
        </div>
      </div>

      {/* Account Info Details */}
      <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
            Profile Details
          </h3>
          <Link
            href="/account/profile"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[var(--muted-foreground)]">Display Name:</span>
            <p className="font-semibold text-[var(--foreground)] mt-0.5">
              {profile?.full_name || (user?.user_metadata as any)?.full_name || "Mani"}
            </p>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">Email Address:</span>
            <p className="font-semibold text-[var(--foreground)] mt-0.5 font-mono">
              {user.email}
            </p>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">Account Role:</span>
            <p className="font-semibold text-[var(--foreground)] mt-0.5 uppercase">
              {profile?.role || "USER"}
            </p>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">Member Since:</span>
            <p className="font-semibold text-[var(--foreground)] mt-0.5">
              {formatDate(profile?.created_at || user.created_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
