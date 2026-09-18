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
      return NextResponse.json({ error: "Unauthorized: Please log in first." }, { status: 401 });
    }

    // Safety check: Do not allow the root designated admin to self-delete via profile
    const adminEmails = (process.env.ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    if (user.email && adminEmails.includes(user.email.toLowerCase())) {
      return NextResponse.json(
        { error: "Protected root administrator account cannot be deleted." },
        { status: 403 }
      );
    }

    const userId = user.id;

    // 1. Delete user from Supabase Auth (cascades to public.profiles, entitlements, favorites)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError);
      return NextResponse.json({ error: deleteAuthError.message }, { status: 500 });
    }

    // 2. Explicitly ensure profile is deleted if not cascaded
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // 3. Sign out session
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: "Your account and all associated data have been permanently deleted.",
    });
  } catch (error: any) {
    console.error("Unexpected error in delete-account route:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete account. Please try again later." },
      { status: 500 }
    );
  }
}
