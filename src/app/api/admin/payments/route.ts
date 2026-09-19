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

    // Check admin role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com").split(",").map(e => e.trim().toLowerCase());
    const isAdmin = adminEmails.includes((user.email || "").toLowerCase()) || profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { order_id, admin_note } = await request.json();
    if (!order_id) {
      return NextResponse.json({ error: "order_id is required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Fetch order with items
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("*, items:order_items(*)")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "PAID") {
      return NextResponse.json({ success: true, message: "Order already verified" });
    }

    // Update order to PAID
    await supabaseAdmin
      .from("orders")
      .update({
        status: "PAID",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    // Grant entitlements for all order items
    if (order.items && order.items.length > 0) {
      const entitlements = order.items.map((item: any) => ({
        user_id: order.user_id,
        resource_id: item.resource_id,
        order_id: order.id,
        status: "ACTIVE",
      }));

      await supabaseAdmin
        .from("entitlements")
        .upsert(entitlements, { onConflict: "user_id,resource_id" });
    }

    return NextResponse.json({ success: true, message: "Order verified and entitlements granted" });
  } catch (err: any) {
    console.error("Admin verify error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
