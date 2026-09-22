import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Admin check helper
async function verifyAdminAccess() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { authorized: false, error: "Unauthorized", status: 401 };
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  const isDesignatedAdmin = user.email && adminEmails.includes(user.email.toLowerCase());
  const { data: callerProfile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    !isDesignatedAdmin &&
    callerProfile?.role !== "ADMIN" &&
    callerProfile?.role !== "SUPER_ADMIN"
  ) {
    return { authorized: false, error: "Forbidden: Admin access required.", status: 403 };
  }

  return { authorized: true, user };
}

// GET: Fetch single request details (Admin only - returns unmasked WhatsApp for direct contact)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminAccess();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await context.params;

    const { data: row, error } = await supabaseAdmin
      .from("resource_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !row) {
      return NextResponse.json({ error: "Resource request not found." }, { status: 404 });
    }

    let rawPhone = row.whatsapp_number || "";
    if (!rawPhone && row.description) {
      const match = row.description.match(/\[WhatsApp:\s*([^\]]+)\]/);
      if (match) rawPhone = match[1].trim();
    }
    if (!rawPhone && row.user_email && row.user_email.includes("@whatsapp.nammatech")) {
      rawPhone = "+" + row.user_email.replace("@whatsapp.nammatech", "");
    }

    let cleanDesc = row.description || "";
    cleanDesc = cleanDesc.replace(/^\[WhatsApp:[^\]]+\]\s*/, "").trim();

    const rawStatus = (row.status || "pending").toLowerCase();
    const mappedStatus =
      rawStatus === "fulfilled"
        ? "completed"
        : rawStatus === "in_review"
        ? "reviewing"
        : rawStatus;

    return NextResponse.json({
      success: true,
      request: {
        id: row.id,
        user_id: row.user_id,
        name: row.name || row.user_name || "Anonymous",
        whatsapp_number: rawPhone || "—",
        resource_name: row.resource_name || row.software_name || "Resource",
        category: row.category || row.software_category || "Software",
        description: cleanDesc,
        status: mappedStatus,
        admin_note: row.admin_note || row.admin_notes || null,
        created_at: row.created_at,
        updated_at: row.updated_at,
        contacted_at: row.contacted_at || null,
        resolved_at: row.resolved_at || null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// PATCH: Update request status, admin note, or contacted_at (Admin only)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminAccess();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const { status, admin_note, record_contact } = body;

    const nowIso = new Date().toISOString();
    const updates: Record<string, any> = {
      updated_at: nowIso,
    };

    if (status) {
      const normalizedStatus = status.toLowerCase();
      updates.status = normalizedStatus;
      if (normalizedStatus === "completed") {
        updates.resolved_at = nowIso;
      }
    }

    if (admin_note !== undefined) {
      updates.admin_note = admin_note;
      // Also update admin_notes if existing column
      updates.admin_notes = admin_note;
    }

    if (record_contact) {
      updates.contacted_at = nowIso;
    }

    // Try update
    let { data, error } = await supabaseAdmin
      .from("resource_requests")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    // If some columns don't exist yet in the database, fall back gracefully
    if (error && (error.message.includes("does not exist") || error.code === "42703")) {
      const safeUpdates: Record<string, any> = {
        updated_at: nowIso,
      };
      if (status) safeUpdates.status = status.toUpperCase();
      if (admin_note !== undefined) safeUpdates.admin_notes = admin_note;

      const fallbackRes = await supabaseAdmin
        .from("resource_requests")
        .update(safeUpdates)
        .eq("id", id)
        .select()
        .single();

      data = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      request: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete resource request (Admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminAccess();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await context.params;

    // Verify request exists
    const { data: existing, error: findError } = await supabaseAdmin
      .from("resource_requests")
      .select("id, resource_name, user_email, name")
      .eq("id", id)
      .maybeSingle();

    if (findError || !existing) {
      return NextResponse.json({ error: "Resource request not found" }, { status: 404 });
    }

    // Delete record
    const { error: deleteError } = await supabaseAdmin
      .from("resource_requests")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Insert audit log
    try {
      await supabaseAdmin.from("audit_logs").insert({
        admin_id: auth.user?.id,
        action: "DELETE_RESOURCE_REQUEST",
        entity_type: "resource_request",
        entity_id: id,
        old_data: existing,
      });
    } catch {
      // Non-blocking audit failure
    }

    return NextResponse.json({
      success: true,
      message: "Resource request deleted successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
