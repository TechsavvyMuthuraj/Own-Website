import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Initial seed / fallback wallpapers if database table hasn't been migrated yet
export const DEFAULT_WALLPAPERS = [
  {
    id: "wall-1",
    name: "Cosmic Nebula & Golden Stars",
    preview_url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
    download_url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=3840&q=100",
    category: "Cosmic & Space",
    resolution: "4K Ultra HD",
    is_featured: true,
    is_active: true,
    sort_order: 1,
    downloads_count: 342,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "wall-2",
    name: "Cyberpunk Neo Tokyo Night",
    preview_url: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80",
    download_url: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=3840&q=100",
    category: "Cyberpunk & Tech",
    resolution: "4K Ultra HD",
    is_featured: true,
    is_active: true,
    sort_order: 2,
    downloads_count: 512,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "wall-3",
    name: "Minimalist Obsidian Peaks",
    preview_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    download_url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=3840&q=100",
    category: "Minimal & Dark",
    resolution: "4K Ultra HD",
    is_featured: true,
    is_active: true,
    sort_order: 3,
    downloads_count: 289,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "wall-4",
    name: "Anime Sunset Horizon Drive",
    preview_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    download_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=3840&q=100",
    category: "Anime & Art",
    resolution: "4K Ultra HD",
    is_featured: true,
    is_active: true,
    sort_order: 4,
    downloads_count: 674,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "wall-5",
    name: "Neon Abstract Fluid Waves",
    preview_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    download_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=3840&q=100",
    category: "Abstract & 3D",
    resolution: "4K Ultra HD",
    is_featured: true,
    is_active: true,
    sort_order: 5,
    downloads_count: 419,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "wall-6",
    name: "Mystic Emerald Mountain Mist",
    preview_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
    download_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=3840&q=100",
    category: "Nature & Cinema",
    resolution: "4K Ultra HD",
    is_featured: true,
    is_active: true,
    sort_order: 6,
    downloads_count: 198,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    let query = supabase.from("wallpapers").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
    
    if (!all) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Could not query wallpapers table, returning default seed:", error.message);
      return NextResponse.json({ wallpapers: DEFAULT_WALLPAPERS, fromFallback: true });
    }

    return NextResponse.json({ wallpapers: data && data.length > 0 ? data : DEFAULT_WALLPAPERS, fromFallback: false });
  } catch (err: any) {
    console.error("GET /api/wallpapers error:", err);
    return NextResponse.json({ wallpapers: DEFAULT_WALLPAPERS, fromFallback: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, preview_url, download_url, category, resolution, is_featured, is_active } = body;

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
    return NextResponse.json({ error: err.message || "Failed to create wallpaper" }, { status: 500 });
  }
}
