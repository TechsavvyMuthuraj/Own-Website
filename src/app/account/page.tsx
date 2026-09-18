import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Download,
  ShoppingBag,
  Heart,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function AccountOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account");
  }

  // 1. Fetch Entitlements count
  const { count: entitlementsCount } = await supabase
    .from("entitlements")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "ACTIVE");

  // 2. Fetch Orders count
  const { count: ordersCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // 3. Fetch Favorites count
  const { count: favoritesCount } = await supabase
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // 4. Fetch Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/account/downloads"
          className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--ring)]/50 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--muted-foreground)]">
              My Purchased Products
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Download className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--foreground)]">
            {entitlementsCount || 0}
          </div>
        </Link>

        <Link
          href="/account/orders"
          className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--ring)]/50 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--muted-foreground)]">
              Total Orders
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--foreground)]">
            {ordersCount || 0}
          </div>
        </Link>

        <Link
          href="/account/favorites"
          className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--ring)]/50 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--muted-foreground)]">
              Saved Favorites
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[var(--foreground)]">
            {favoritesCount || 0}
          </div>
        </Link>
      </div>

      {/* Account Info Details */}
      <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
          Profile Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[var(--muted-foreground)]">Display Name:</span>
            <p className="font-semibold text-[var(--foreground)] mt-0.5">
              {profile?.full_name || "Not specified"}
            </p>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">Email Address:</span>
            <p className="font-semibold text-[var(--foreground)] mt-0.5">
              {user.email}
            </p>
          </div>
          <div>
            <span className="text-[var(--muted-foreground)]">Account Role:</span>
            <p className="font-semibold text-[var(--foreground)] mt-0.5">
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
