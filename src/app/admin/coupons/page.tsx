import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Coupon } from "@/types/database";
import { CouponsClient } from "./coupons-client";

export const revalidate = 0;

export default async function AdminCouponsPage() {
  const supabase = createAdminClient();
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
          Coupons & Discounts
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
          Create percentage or fixed promotional vouchers with minimum orders and usage caps.
        </p>
      </div>

      <CouponsClient initialCoupons={(coupons || []) as Coupon[]} />
    </div>
  );
}
