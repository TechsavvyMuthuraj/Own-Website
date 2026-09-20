import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { OrderHistoryClient } from "./orders-client";

export const revalidate = 0;

export default async function AccountOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account/orders");
  }

  // Use admin client to reliably fetch user's order items and joined resources
  const supabaseAdmin = createAdminClient();
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("*, items:order_items(*, resource:resources(title, slug))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
          Order History
        </h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          View purchases, update your UTR reference, and track payment verification status.
        </p>
      </div>

      <OrderHistoryClient orders={orders || []} />
    </div>
  );
}
