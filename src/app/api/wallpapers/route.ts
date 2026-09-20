import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    let query = supabase
      .from("wallpapers")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!all) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Wallpapers query notice:", error.message);
      return NextResponse.json({ wallpapers: [], fromFallback: false });
    }

    return NextResponse.json({ wallpapers: data || [], fromFallback: false });
  } catch (err: any) {
    console.error("GET /api/wallpapers error:", err);
    return NextResponse.json({ wallpapers: [], fromFallback: false });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseServer = await createClient();
    const {
      data: { user },
    } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      preview_url,
      download_url,
      category,
      resolution,
      is_featured,
      is_active,
    } = body;

    if (!name || !preview_url || !download_url) {
      return NextResponse.json(
        { error: "Name, Preview URL, and Download URL are required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("wallpapers")
      .insert({
        name: name.trim(),
        preview_url: preview_url.trim(),
        download_url: download_url.trim(),
        category: category?.trim() || "4K Wallpapers",
        resolution: resolution?.trim() || "4K Ultra HD",
        is_featured: is_featured ?? true,
        is_active: is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating wallpaper:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ wallpaper: data });
  } catch (err: any) {
    console.error("POST /api/wallpapers error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create wallpaper" },
      { status: 500 }
    );
  }
}
