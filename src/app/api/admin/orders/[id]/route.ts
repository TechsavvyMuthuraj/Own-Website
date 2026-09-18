import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com")
      .split(",")
      .map((e) => e.trim().toLowerCase());
    const isDesignatedAdmin = Boolean(user.email && adminEmails.includes(user.email.toLowerCase()));

    const supabaseAdmin = createAdminClient();
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = isDesignatedAdmin || profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    // Clean order items first
    await supabaseAdmin.from("order_items").delete().eq("order_id", id);

    // Delete order
    const { error: delErr } = await supabaseAdmin
      .from("orders")
      .delete()
      .eq("id", id);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 400 });
    }

    // Log audit
    await supabaseAdmin.from("audit_logs").insert({
      admin_id: user.id,
      action: "DELETE_ORDER",
      entity_type: "order",
      entity_id: id,
    });

    return NextResponse.json({ success: true, message: "Order and payment details deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
