import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (error || !coupon) {
      return NextResponse.json({ error: "Invalid or inactive coupon code" }, { status: 404 });
    }

    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return NextResponse.json({ error: "This coupon is not yet active" }, { status: 400 });
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
    }
    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return NextResponse.json({ error: "This coupon has reached its maximum usage limit" }, { status: 400 });
    }
    if (subtotal && subtotal < coupon.min_order) {
      return NextResponse.json(
        { error: `Minimum order of ₹${coupon.min_order} required for this coupon` },
        { status: 400 }
      );
    }

    return NextResponse.json({ coupon });
  } catch (err) {
    console.error("Coupon validation error:", err);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
