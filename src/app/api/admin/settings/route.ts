import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Public GET: returns all settings (used by middleware, public pages)
export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();
    const { data: settingsData } = await supabaseAdmin.from("site_settings").select("key,value");

    const settings: Record<string, any> = {};
    (settingsData || []).forEach((item: any) => {
      try {
        settings[item.key] = typeof item.value === "string" ? JSON.parse(item.value) : item.value;
      } catch {
        settings[item.key] = item.value;
      }
    });

    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check both designated admin email AND profile role
    const adminEmails = (process.env.ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    const isDesignatedAdmin = user.email && adminEmails.includes(user.email.toLowerCase());

    const supabaseAdmin = createAdminClient();
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdminByRole = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";

    if (!isDesignatedAdmin && !isAdminByRole) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const settings = await request.json();

    for (const [key, value] of Object.entries(settings)) {
      await supabaseAdmin.from("site_settings").upsert(
        {
          key,
          value: JSON.stringify(value),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
