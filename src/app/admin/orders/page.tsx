import React from "react";
import { ShoppingBag, CheckCircle2, Clock, XCircle, User } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { OrdersTableClient } from "./orders-client";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, user:profiles(full_name, email), items:order_items(*, resource:resources(title))")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
          Order & Payment Management
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Real transactions, payment verification status, and manual UPI reconciliations.
        </p>
      </div>

      <OrdersTableClient initialOrders={orders || []} />
    </div>
  );
}
