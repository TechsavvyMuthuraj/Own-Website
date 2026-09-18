import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify caller is admin
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
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    // 1. Fetch all Auth Users via Supabase Admin
    const { data: authData, error: authListError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (authListError) {
      console.error("Failed to list auth users:", authListError);
      return NextResponse.json({ error: authListError.message }, { status: 500 });
    }

    // 2. Fetch all Profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("*");

    if (profilesError) {
      console.error("Failed to list profiles:", profilesError);
    }

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

    // 3. Fetch orders count per user
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("user_id");

    const orderCountMap: Record<string, number> = {};
    (orders || []).forEach((o: any) => {
      if (o.user_id) {
        orderCountMap[o.user_id] = (orderCountMap[o.user_id] || 0) + 1;
      }
    });

    // 4. Fetch downloads count per user
    const { data: downloads } = await supabaseAdmin
      .from("downloads")
      .select("user_id");

    const downloadCountMap: Record<string, number> = {};
    (downloads || []).forEach((d: any) => {
      if (d.user_id) {
        downloadCountMap[d.user_id] = (downloadCountMap[d.user_id] || 0) + 1;
      }
    });

    const now = Date.now();
    const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

    const users = (authData.users || []).map((u) => {
      const prof = profileMap.get(u.id) || {};
      const role =
        prof.role ||
        (u.email && adminEmails.includes(u.email.toLowerCase()) ? "SUPER_ADMIN" : "USER");

      // Check last activity from updated_at or raw_user_meta_data
      const updatedAtTime = prof.updated_at ? new Date(prof.updated_at).getTime() : 0;
      const lastSignInTime = u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : 0;
      const recentActivity = Math.max(updatedAtTime, lastSignInTime);

      const isOnline = now - recentActivity < ONLINE_THRESHOLD_MS;

      return {
        id: u.id,
        email: u.email || "",
        full_name: prof.full_name || u.user_metadata?.full_name || "NammaTech User",
        avatar_url: prof.avatar_url || u.user_metadata?.avatar_url || null,
        role: role as "USER" | "ADMIN" | "SUPER_ADMIN",
        is_online: isOnline,
        last_seen_at: prof.updated_at || u.last_sign_in_at || null,
        last_sign_in_at: u.last_sign_in_at || null,
        created_at: u.created_at,
        email_confirmed: Boolean(
          u.email_confirmed_at ||
          u.app_metadata?.is_approved ||
          u.user_metadata?.is_approved ||
          (u.email && adminEmails.includes(u.email.toLowerCase()))
        ),
        email_confirmed_at: u.email_confirmed_at || null,
        orders_count: orderCountMap[u.id] || 0,
        downloads_count: downloadCountMap[u.id] || 0,
        provider: u.app_metadata?.provider || "email",
        phone: u.phone || null,
      };
    });

    // Sort: Admins first, then Online users, then newest
    users.sort((a, b) => {
      if (a.role === "SUPER_ADMIN" && b.role !== "SUPER_ADMIN") return -1;
      if (b.role === "SUPER_ADMIN" && a.role !== "SUPER_ADMIN") return 1;
      if (a.is_online && !b.is_online) return -1;
      if (b.is_online && !a.is_online) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const stats = {
      total_users: users.length,
      online_users: users.filter((u) => u.is_online).length,
      admin_users: users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length,
      verified_users: users.filter((u) => u.email_confirmed).length,
    };

    return NextResponse.json({ users, stats });
  } catch (err: any) {
    console.error("Admin users API error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
