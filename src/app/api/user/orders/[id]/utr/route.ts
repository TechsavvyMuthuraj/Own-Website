import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// PATCH /api/user/orders/[id]/utr  — user updates their own UTR on a PENDING order
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orderId } = await params;
    const { utrNumber } = await request.json();

    // Validate UTR — must be exactly 12 digits
    const trimmed = (utrNumber || "").trim();
    if (!trimmed) {
      return NextResponse.json({ error: "UTR number is required" }, { status: 400 });
    }
    if (!/^\d{12}$/.test(trimmed)) {
      return NextResponse.json(
        { error: "UTR must be exactly 12 digits (numbers only)" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Verify the order belongs to this user and is still PENDING
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, user_id, status")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "PAID") {
      return NextResponse.json(
        { error: "Cannot update UTR on an already verified order" },
        { status: 409 }
      );
    }

    // Update the UTR on the order
    await supabaseAdmin
      .from("orders")
      .update({
        payment_id: trimmed,
        payment_provider: "UPI",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("user_id", user.id);

    return NextResponse.json({ success: true, utr: trimmed });
  } catch (err) {
    console.error("UTR update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
