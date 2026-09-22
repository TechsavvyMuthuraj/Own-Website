import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET: Authenticated user's own resource requests
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from("resource_requests")
      .select("id, name, user_name, resource_name, software_name, category, software_category, description, status, created_at, contacted_at, resolved_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const requests = (data || []).map((row: any) => {
      let cleanDesc = row.description || "";
      cleanDesc = cleanDesc.replace(/^\[WhatsApp:[^\]]+\]\s*/, "").trim();

      const rawStatus = (row.status || "pending").toLowerCase();
      const mappedStatus =
        rawStatus === "fulfilled"
          ? "completed"
          : rawStatus === "in_review"
          ? "reviewing"
          : rawStatus;

      return {
        id: row.id,
        resource_name: row.resource_name || row.software_name || "Requested Resource",
        category: row.category || row.software_category || "Software",
        description: cleanDesc,
        status: mappedStatus,
        created_at: row.created_at,
        contacted_at: row.contacted_at || null,
        resolved_at: row.resolved_at || null,
      };
    });

    return NextResponse.json({ success: true, requests });
  } catch (err: any) {
    console.error("User requests fetch error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
