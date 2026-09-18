import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
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

    // Step 1: Clean all dependent child tables
    await Promise.allSettled([
      supabaseAdmin.from("download_links").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      supabaseAdmin.from("resource_images").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      supabaseAdmin.from("order_items").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      supabaseAdmin.from("favorites").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      supabaseAdmin.from("download_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      supabaseAdmin.from("user_entitlements").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      supabaseAdmin.from("reviews").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
    ]);

    // Step 2: Delete all resources
    const { data: deleted, error: deleteError } = await supabaseAdmin
      .from("resources")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000")
      .select("id");

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    // Log audit
    await supabaseAdmin.from("audit_logs").insert({
      admin_id: user.id,
      action: "PURGE_ALL_RESOURCES",
      entity_type: "resource",
      entity_id: "ALL",
      new_data: { deleted_count: deleted?.length || 0 },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully purged all resources (${deleted?.length || 0} removed). Platform ready for fresh start.`,
      deletedCount: deleted?.length || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
