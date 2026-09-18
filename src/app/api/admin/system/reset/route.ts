import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
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

    const body = await request.json().catch(() => ({}));
    if (body.confirmation !== "RESET") {
      return NextResponse.json(
        { error: "Confirmation keyword 'RESET' required to proceed with data wipe." },
        { status: 400 }
      );
    }

    // ── Safe Cascade Wipe ───────────────────────────────────────────────────
    // Delete in dependency order
    const nullId = "00000000-0000-0000-0000-000000000000";

    await Promise.allSettled([
      supabaseAdmin.from("download_logs").delete().neq("id", nullId),
      supabaseAdmin.from("download_links").delete().neq("id", nullId),
      supabaseAdmin.from("resource_images").delete().neq("id", nullId),
      supabaseAdmin.from("order_items").delete().neq("id", nullId),
      supabaseAdmin.from("favorites").delete().neq("id", nullId),
      supabaseAdmin.from("user_entitlements").delete().neq("id", nullId),
      supabaseAdmin.from("reviews").delete().neq("id", nullId),
    ]);

    // Delete orders, resource requests, messages
    await Promise.allSettled([
      supabaseAdmin.from("orders").delete().neq("id", nullId),
      supabaseAdmin.from("resource_requests").delete().neq("id", nullId),
      supabaseAdmin.from("contact_messages").delete().neq("id", nullId),
      supabaseAdmin.from("resources").delete().neq("id", nullId),
      supabaseAdmin.from("coupons").delete().neq("id", nullId),
      supabaseAdmin.from("announcements").delete().neq("id", nullId),
    ]);

    // Log the reset
    await supabaseAdmin.from("audit_logs").insert({
      admin_id: user.id,
      action: "PLATFORM_FACTORY_RESET",
      entity_type: "system",
      entity_id: "ALL",
      new_data: { reset_at: new Date().toISOString(), admin_email: user.email },
    });

    return NextResponse.json({
      success: true,
      message: "Platform data has been completely erased. All catalogs, orders, and test records are cleared.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
