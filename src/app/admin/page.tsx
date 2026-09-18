import React from "react";
import Link from "next/link";
import {
  Package,
  Layers,
  ShoppingBag,
  Download,
  IndianRupee,
  Users,
  Clock,
  Plus,
  ArrowRight,
  ShieldCheck,
  Megaphone,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

export const revalidate = 0; // Real-time server fetch on every admin load

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  let totalResources = 0;
  let publishedResources = 0;
  let totalUsers = 0;
  let totalOrders = 0;
  let paidOrders = 0;
  let totalDownloads = 0;
  let totalRevenue = 0;
  let pendingOrders = 0;
  let recentAuditLogs: any[] = [];

  try {
    // 1. Resources count
    const { count: resCount } = await supabase
      .from("resources")
      .select("*", { count: "exact", head: true });
    totalResources = resCount || 0;

    // 2. Published resources count
    const { count: pubCount } = await supabase
      .from("resources")
      .select("*", { count: "exact", head: true })
      .eq("status", "PUBLISHED");
    publishedResources = pubCount || 0;

    // 3. Users count
    const { count: usrCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    totalUsers = usrCount || 0;

    // 4. Orders counts
    const { count: ordCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });
    totalOrders = ordCount || 0;

    const { count: paidCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "PAID");
    paidOrders = paidCount || 0;

    const { count: pendCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "PENDING");
    pendingOrders = pendCount || 0;

    // 5. Total Downloads count
    const { count: dlCount } = await supabase
      .from("downloads")
      .select("*", { count: "exact", head: true });
    totalDownloads = dlCount || 0;

    // 6. Revenue from verified paid orders
    const { data: revenueData } = await supabase
      .from("orders")
      .select("total")
      .eq("status", "PAID");

    if (revenueData) {
      totalRevenue = revenueData.reduce((sum, o) => sum + Number(o.total || 0), 0);
    }

    // 7. Recent Audit Logs
    const { data: logs } = await supabase
      .from("audit_logs")
      .select("*, admin:profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(6);

    if (logs) {
      recentAuditLogs = logs;
    }
  } catch (err) {
    console.error("Error loading admin metrics:", err);
  }

  const metricCards = [
    {
      title: "Total Resources",
      value: totalResources,
      subValue: `${publishedResources} published`,
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      href: "/admin/resources",
    },
    {
      title: "Verified Revenue",
      value: formatCurrency(totalRevenue),
      subValue: `${paidOrders} paid orders`,
      icon: IndianRupee,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      href: "/admin/orders",
    },
    {
      title: "Total Downloads",
      value: totalDownloads,
      subValue: "Verified event records",
      icon: Download,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      href: "/admin/resources",
    },
    {
      title: "Registered Users",
      value: totalUsers,
      subValue: "Active profiles in DB",
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      href: "/admin/users",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            Dashboard & Realtime Metrics
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-0.5">
            Real database aggregates. Zero fabricated statistics or simulated accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/resources/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Resource</span>
          </Link>
          <Link
            href="/admin/announcements"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] text-xs font-medium text-[var(--foreground)] transition-colors"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Announcements</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.href}
              className="p-5 rounded-3xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--ring)]/50 transition-all shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[var(--muted-foreground)]">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-2xl ${card.bg} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
                  {card.value}
                </div>
                <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                  {card.subValue}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Secondary Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex items-center justify-between text-xs">
          <span className="text-[var(--muted-foreground)]">Total Orders (All statuses):</span>
          <span className="font-bold text-[var(--foreground)]">{totalOrders}</span>
        </div>
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex items-center justify-between text-xs">
          <span className="text-[var(--muted-foreground)]">Pending Review Orders:</span>
          <span className="font-bold text-amber-500">{pendingOrders}</span>
        </div>
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex items-center justify-between text-xs">
          <span className="text-[var(--muted-foreground)]">Verified Paid Orders:</span>
          <span className="font-bold text-emerald-500">{paidOrders}</span>
        </div>
      </div>

      {/* Audit Log Feed / Empty state */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">
            Recent System Activity
          </h3>
          <Link
            href="/admin/audit-logs"
            className="text-xs font-semibold text-[var(--primary)] hover:underline"
          >
            View all logs
          </Link>
        </div>

        {recentAuditLogs.length > 0 ? (
          <div className="divide-y divide-[var(--border)] text-xs">
            {recentAuditLogs.map((log) => (
              <div key={log.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[var(--foreground)] mr-2">
                    {log.action}
                  </span>
                  <span className="text-[var(--muted-foreground)]">
                    {log.entity_type} {log.entity_id ? `(${log.entity_id})` : ""}
                  </span>
                </div>
                <span className="text-[11px] text-[var(--muted-foreground)] font-mono">
                  {formatDate(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-[var(--secondary)]/40 border border-[var(--border)]">
            <p className="text-xs text-[var(--muted-foreground)]">
              No recent audit log entries recorded yet. As resources and configurations are changed, records will automatically stream here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
