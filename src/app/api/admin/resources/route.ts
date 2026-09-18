import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const body = await request.json();
    const supabaseAdmin = createAdminClient();

    // Prepare resource fields
    const resourceData = {
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      short_description: body.short_description || null,
      description: body.description || null,
      category_id: body.category_id || null,
      thumbnail_url: body.thumbnail_url || null,
      icon_url: body.icon_url || null,
      resource_type: body.resource_type || "DOWNLOAD",
      access_type: body.access_type || "FREE",
      price: body.price ? Number(body.price) : 0,
      sale_price: body.sale_price ? Number(body.sale_price) : null,
      currency: "INR",
      platform: body.platform || null,
      version: body.version || null,
      version_code: body.version_code ? Number(body.version_code) : null,
      package_name: body.package_name || null,
      size_bytes: body.size_bytes ? Number(body.size_bytes) : null,
      developer: body.developer || null,
      license: body.license || null,
      official_url: body.official_url || null,
      download_type: body.download_type || null,
      status: body.status || "DRAFT",
      featured: !!body.featured,
      changelog: body.changelog || null,
      system_requirements: body.system_requirements || null,
      features: body.features || [],
      tags: body.tags || [],
      published_at: body.status === "PUBLISHED" ? new Date().toISOString() : null,
    };

    // 1. Insert Resource
    const { data: newResource, error: insertError } = await supabaseAdmin
      .from("resources")
      .insert(resourceData)
      .select()
      .single();

    if (insertError) {
      console.error("Resource insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    // 2. Insert Download Links if provided
    if (body.download_links && Array.isArray(body.download_links) && body.download_links.length > 0) {
      const links = body.download_links.map((link: any, idx: number) => ({
        resource_id: newResource.id,
        title: link.title || "Primary Download",
        link_type: link.link_type || "PRIMARY",
        url: link.url || null,
        r2_key: link.r2_key || null,
        size_bytes: link.size_bytes ? Number(link.size_bytes) : null,
        is_active: link.is_active !== false,
        sort_order: idx,
      }));
      await supabaseAdmin.from("download_links").insert(links);
    }

    // 3. Insert Screenshots if provided
    if (body.images && Array.isArray(body.images) && body.images.length > 0) {
      const images = body.images.map((img: any, idx: number) => ({
        resource_id: newResource.id,
        image_url: typeof img === "string" ? img : img.image_url,
        caption: img.caption || null,
        sort_order: idx,
      }));
      await supabaseAdmin.from("resource_images").insert(images);
    }

    // 4. Log audit event
    await supabaseAdmin.from("audit_logs").insert({
      admin_id: user.id,
      action: "CREATE_RESOURCE",
      entity_type: "resource",
      entity_id: newResource.id,
      new_data: { title: newResource.title, slug: newResource.slug, status: newResource.status },
    });

    return NextResponse.json({ resource: newResource });
  } catch (err: any) {
    console.error("Resource creation route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
