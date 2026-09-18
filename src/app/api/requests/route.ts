import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// POST: Submit a new resource request
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { software_name, software_category, description, official_url, priority } = body;

    if (!software_name || software_name.trim().length < 2) {
      return NextResponse.json({ error: "Software name is required (minimum 2 characters)." }, { status: 400 });
    }

    const userEmail = user?.email || body.user_email;
    const userName = user
      ? (user.user_metadata?.full_name || user.email || "Anonymous")
      : (body.user_name || "Anonymous");

    if (!userEmail) {
      return NextResponse.json({ error: "Email is required to submit a request." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.from("resource_requests").insert({
      user_id: user?.id || null,
      user_email: userEmail,
      user_name: userName,
      software_name: software_name.trim(),
      software_category: software_category || "General",
      description: description?.trim() || null,
      official_url: official_url?.trim() || null,
      priority: priority || "NORMAL",
      status: "PENDING",
    }).select("id").single();

    if (error) {
      console.error("Request insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err: any) {
    console.error("Request API error:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// GET: List requests (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com")
      .split(",")
      .map((e) => e.trim().toLowerCase());

    const isDesignatedAdmin = user.email && adminEmails.includes(user.email.toLowerCase());
    const { data: callerProfile } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).single();

    if (!isDesignatedAdmin && callerProfile?.role !== "ADMIN" && callerProfile?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "ALL";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const perPage = parseInt(url.searchParams.get("per_page") || "50", 10);

    let query = supabaseAdmin
      .from("resource_requests")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (status !== "ALL") {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ requests: data || [], total: count || 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
