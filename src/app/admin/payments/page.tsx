import React from "react";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { PaymentsClient } from "./payments-client";

export const metadata: Metadata = {
  title: "Payments & Financial Hub - NammaTech Admin",
  description: "Manage real-time revenue, UPI reconciliation, UTR checks, and transaction logs.",
};

export const revalidate = 0;

export default async function AdminPaymentsPage() {
  const supabase = createAdminClient();

  const [{ data: orders }, { data: resources }] = await Promise.all([
    supabase
      .from("orders")
      .select("*, user:profiles(full_name, email), items:order_items(*, resource:resources(id, title, thumbnail_url))")
      .order("created_at", { ascending: false }),
    supabase
      .from("resources")
      .select("id, title, price, sale_price")
      .eq("status", "PUBLISHED")
      .order("title"),
  ]);

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
            Payments &amp; Financial Management
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Real-time revenue metrics, UPI reconciliation, UTR checks, and transaction audits.
          </p>
        </div>
      </div>

      <PaymentsClient
        initialOrders={orders || []}
        availableResources={resources || []}
      />
    </div>
  );
}
