import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Resource, Coupon } from "@/types/database";

export async function POST(request: Request) {
  try {
    const { resourceIds, couponCode } = await request.json();

    if (!resourceIds || !Array.isArray(resourceIds) || resourceIds.length === 0) {
      return NextResponse.json({ error: "Cart is empty or invalid" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required to checkout" }, { status: 401 });
    }

    // 1. Fetch real resource data from database (NEVER trust client price)
    const { data: resources, error: resError } = await supabase
      .from("resources")
      .select("id, title, price, sale_price, currency, status, access_type")
      .in("id", resourceIds)
      .eq("status", "PUBLISHED");

    if (resError || !resources || resources.length === 0) {
      return NextResponse.json({ error: "One or more resources are unavailable" }, { status: 404 });
    }

    // 2. Check if user already owns any of these items (Prevent duplicate digital purchases)
    const { data: existingEntitlements } = await supabase
      .from("entitlements")
      .select("resource_id")
      .eq("user_id", user.id)
      .in("resource_id", resourceIds)
      .eq("status", "ACTIVE");

    if (existingEntitlements && existingEntitlements.length > 0) {
      const ownedIds = new Set(existingEntitlements.map((e) => e.resource_id));
      const ownedTitles = resources
        .filter((r) => ownedIds.has(r.id))
        .map((r) => r.title)
        .join(", ");
      return NextResponse.json(
        { error: `You already own the following digital products: ${ownedTitles}` },
        { status: 400 }
      );
    }

    // 3. Calculate genuine subtotal
    const subtotal = resources.reduce((sum, res) => {
      const actualPrice = res.sale_price !== null ? Number(res.sale_price) : Number(res.price);
      return sum + actualPrice;
    }, 0);

    // 4. Validate Coupon if provided
    let discount = 0;
    let validatedCoupon: Coupon | null = null;

    if (couponCode && typeof couponCode === "string") {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (coupon) {
        const now = new Date();
        const isValid =
          (!coupon.starts_at || new Date(coupon.starts_at) <= now) &&
          (!coupon.expires_at || new Date(coupon.expires_at) >= now) &&
          (!coupon.usage_limit || coupon.times_used < coupon.usage_limit) &&
          subtotal >= Number(coupon.min_order);

        if (isValid) {
          validatedCoupon = coupon as Coupon;
          if (coupon.discount_type === "PERCENTAGE") {
            discount = (subtotal * Number(coupon.discount_value)) / 100;
            if (coupon.max_discount && discount > Number(coupon.max_discount)) {
              discount = Number(coupon.max_discount);
            }
          } else {
            discount = Number(coupon.discount_value);
          }
        }
      }
    }

    const total = Math.max(0, subtotal - discount);
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const isFreeOrder = total === 0;
    const initialStatus = isFreeOrder ? "PAID" : "PENDING";

    // 5. Create Order record in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        subtotal,
        discount,
        total,
        currency: "INR",
        status: initialStatus,
        payment_provider: isFreeOrder ? "FREE" : null,
        coupon_code: validatedCoupon ? validatedCoupon.code : null,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // 6. Insert Order Items using admin client to guarantee bypass of RLS
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabaseAdmin = createAdminClient();

    const orderItems = resources.map((res) => ({
      order_id: order.id,
      resource_id: res.id,
      price: res.sale_price !== null ? Number(res.sale_price) : Number(res.price),
    }));

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(orderItems);
    if (itemsError) {
      console.error("[Checkout] Order items insert error:", itemsError);
    }

    // 7. If this is a free order, grant active entitlements immediately!
    if (isFreeOrder) {
      const entitlementsToInsert = resources.map((res) => ({
        user_id: user.id,
        resource_id: res.id,
        order_id: order.id,
        status: "ACTIVE",
      }));
      await supabaseAdmin
        .from("entitlements")
        .upsert(entitlementsToInsert, { onConflict: "user_id,resource_id" });
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      subtotal,
      discount,
      total,
      currency: "INR",
      isFreeOrder,
    });
  } catch (err) {
    console.error("Checkout create order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
