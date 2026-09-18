import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await context.params;
    const body = await request.json();
    const { role, full_name, confirmed } = body;

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const {
      data: { user: caller },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !caller) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    const isDesignatedAdmin = caller.email && adminEmails.includes(caller.email.toLowerCase());

    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .single();

    if (
      !isDesignatedAdmin &&
      callerProfile?.role !== "ADMIN" &&
      callerProfile?.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (role && ["USER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      updates.role = role;
    }

    if (full_name) {
      updates.full_name = full_name;
    }

    // Update public.profiles
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", targetUserId)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update profile:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Update auth.users (role and/or confirmation approval)
    const authUpdates: any = {};
    if (role) {
      authUpdates.app_metadata = { ...(authUpdates.app_metadata || {}), role };
      authUpdates.user_metadata = { ...(authUpdates.user_metadata || {}), role };
    }

    if (typeof confirmed === "boolean") {
      authUpdates.email_confirm = confirmed;
      authUpdates.app_metadata = {
        ...(authUpdates.app_metadata || {}),
        is_approved: confirmed,
      };
      authUpdates.user_metadata = {
        ...(authUpdates.user_metadata || {}),
        is_approved: confirmed,
      };
    }

    if (Object.keys(authUpdates).length > 0) {
      await supabaseAdmin.auth.admin.updateUserById(targetUserId, authUpdates);
    }

    // Create Audit Log
    try {
      await supabaseAdmin.from("audit_logs").insert({
        admin_id: caller.id,
        action: typeof confirmed === "boolean"
          ? (confirmed ? "CONFIRM_USER" : "UNCONFIRM_USER")
          : "UPDATE_USER_ROLE",
        entity_type: "user",
        entity_id: targetUserId,
        old_data: null,
        new_data: { role, confirmed, caller_email: caller.email },
      });
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (err: any) {
    console.error("Error updating user:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await context.params;

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const {
      data: { user: caller },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !caller) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    const isDesignatedAdmin = caller.email && adminEmails.includes(caller.email.toLowerCase());

    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .single();

    if (
      !isDesignatedAdmin &&
      callerProfile?.role !== "ADMIN" &&
      callerProfile?.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Safety check 1: Admin cannot delete their own account from admin directory
    if (caller.id === targetUserId) {
      return NextResponse.json(
        { error: "You cannot delete your own account from the administrator directory." },
        { status: 400 }
      );
    }

    // Safety check 2: Cannot delete root admin email
    const { data: targetAuthUser } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
    if (
      targetAuthUser?.user?.email &&
      adminEmails.includes(targetAuthUser.user.email.toLowerCase())
    ) {
      return NextResponse.json(
        { error: "Protected root administrator account cannot be deleted." },
        { status: 403 }
      );
    }

    // 1. Delete user from Supabase Auth (cascades to profiles, entitlements, favorites)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
    if (deleteError) {
      console.error("Failed to delete auth user:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // 2. Ensure profile is removed if not cascaded
    await supabaseAdmin.from("profiles").delete().eq("id", targetUserId);

    // 3. Log audit action
    try {
      await supabaseAdmin.from("audit_logs").insert({
        admin_id: caller.id,
        action: "DELETE_USER",
        entity_type: "user",
        entity_id: targetUserId,
        old_data: { email: targetAuthUser?.user?.email, id: targetUserId },
      });
    } catch (auditErr) {
      console.error("Audit log error:", auditErr);
    }

    return NextResponse.json({ success: true, message: "User permanently deleted." });
  } catch (err: any) {
    console.error("Error deleting user:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
