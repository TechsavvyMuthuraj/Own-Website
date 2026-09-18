import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingBag, CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AccountOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account/orders");
  }

  // Fetch orders for current user
  const { data: orders } = await supabase
    .from("orders")
    .select("*, items:order_items(*, resource:resources(title, slug))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Paid
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
          Order History
        </h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          View all your previous purchases, transaction receipts, and digital delivery status.
        </p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[var(--foreground)]">
                      #{order.order_number}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <span className="text-[11px] text-[var(--muted-foreground)]">
                    Placed on {formatDate(order.created_at)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-[var(--foreground)]">
                    {formatCurrency(order.total, order.currency)}
                  </span>
                </div>
              </div>

              {/* Items in this order */}
              <div className="space-y-1.5 pt-1">
                {order.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs py-1 text-[var(--muted-foreground)]"
                  >
                    <span className="font-medium text-[var(--foreground)]">
                      {item.resource?.title || "Digital Resource"}
                    </span>
                    <span>{formatCurrency(item.price, order.currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          description="You haven't made any digital purchases yet."
          actionText="Explore Marketplace"
          actionHref="/explore"
        />
      )}
    </div>
  );
}
