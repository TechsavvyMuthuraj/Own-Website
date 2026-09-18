import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "ADMIN" && profile.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Fetch original resource
    const { data: original, error: origError } = await supabaseAdmin
      .from("resources")
      .select("*, images:resource_images(*), download_links(*)")
      .eq("id", id)
      .single();

    if (origError || !original) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    // 2. Clone with new slug and DRAFT status (clean ID, 0 downloads, 0 views)
    const newSlug = `${original.slug}-copy-${Math.floor(Math.random() * 1000)}`;
    const clonedResourceData = {
      title: `${original.title} (Copy)`,
      slug: newSlug,
      short_description: original.short_description,
      description: original.description,
      category_id: original.category_id,
      thumbnail_url: original.thumbnail_url,
      icon_url: original.icon_url,
      resource_type: original.resource_type,
      access_type: original.access_type,
      price: original.price,
      sale_price: original.sale_price,
      currency: original.currency,
      platform: original.platform,
      version: original.version,
      version_code: original.version_code,
      package_name: original.package_name,
      size_bytes: original.size_bytes,
      developer: original.developer,
      license: original.license,
      official_url: original.official_url,
      status: "DRAFT", // Duplicated items start as DRAFT
      featured: false,
      changelog: original.changelog,
      system_requirements: original.system_requirements,
      features: original.features,
      tags: original.tags,
      views_count: 0,
      downloads_count: 0,
    };

    const { data: cloned, error: cloneError } = await supabaseAdmin
      .from("resources")
      .insert(clonedResourceData)
      .select()
      .single();

    if (cloneError || !cloned) {
      return NextResponse.json({ error: cloneError?.message || "Failed to clone resource" }, { status: 400 });
    }

    // Clone download links
    if (original.download_links && original.download_links.length > 0) {
      const clonedLinks = original.download_links.map((link: any) => ({
        resource_id: cloned.id,
        title: link.title,
        link_type: link.link_type,
        url: link.url,
        r2_key: link.r2_key,
        size_bytes: link.size_bytes,
        is_active: link.is_active,
        sort_order: link.sort_order,
      }));
      await supabaseAdmin.from("download_links").insert(clonedLinks);
    }

    // Audit log
    await supabaseAdmin.from("audit_logs").insert({
      admin_id: user.id,
      action: "DUPLICATE_RESOURCE",
      entity_type: "resource",
      entity_id: cloned.id,
      new_data: { clonedFromId: id, newSlug: cloned.slug },
    });

    return NextResponse.json({ resource: cloned });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
