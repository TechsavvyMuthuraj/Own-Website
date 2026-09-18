import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST() {
  try {
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
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isDesignatedAdmin = user.email && adminEmails.includes(user.email.toLowerCase());

    // Update profile presence timestamp
    const now = new Date().toISOString();
    const updatePayload: Record<string, any> = {
      updated_at: now,
    };

    if (isDesignatedAdmin) {
      updatePayload.role = "SUPER_ADMIN";
    }

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id);

    if (updateError) {
      console.error("Heartbeat update error:", updateError);
    }

    return NextResponse.json({
      success: true,
      user_id: user.id,
      timestamp: now,
    });
  } catch (err: any) {
    console.error("Heartbeat exception:", err);
    return NextResponse.json({ success: false, error: err?.message || "Internal error" }, { status: 500 });
  }
}
