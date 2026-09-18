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
    const { role, full_name } = body;

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

    // Also update auth.users metadata if role is modified
    if (role) {
      await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
        app_metadata: { role },
        user_metadata: { role },
      });
    }

    // Create Audit Log
    try {
      await supabaseAdmin.from("audit_logs").insert({
        user_id: caller.id,
        action: "UPDATE_USER_ROLE",
        entity_type: "USER",
        entity_id: targetUserId,
        details: { new_role: role, caller_email: caller.email },
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
