import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { movie_id, movie_title, utr_number, amount, payment_provider = "UPI" } = await request.json();

    if (!utr_number || !amount) {
      return NextResponse.json({ error: "UTR number and amount are required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Generate order number
    const orderNumber = `MOV-${Date.now().toString().slice(-8)}`;

    // Create the order with PENDING status
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        subtotal: amount,
        discount: 0,
        total: amount,
        currency: "INR",
        status: "PENDING",
        payment_provider: payment_provider,
        payment_id: utr_number,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // If movie_id is given, create order item referencing the resource
    if (movie_id) {
      await supabaseAdmin
        .from("order_items")
        .insert({
          order_id: order.id,
          resource_id: movie_id,
          price: amount,
        })
        .select();
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_number: orderNumber,
      message: "Payment submitted successfully. Awaiting admin verification.",
    });
  } catch (err: any) {
    console.error("Submit UTR error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
