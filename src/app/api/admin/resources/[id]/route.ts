import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabaseAdmin = createAdminClient();

    const { data: resource, error } = await supabaseAdmin
      .from("resources")
      .select("*, images:resource_images(*), download_links(*)")
      .eq("id", id)
      .single();

    if (error || !resource) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json({ resource });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
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

    const body = await request.json();
    const supabaseAdmin = createAdminClient();

    // Fetch existing for audit log
    const { data: existing } = await supabaseAdmin
      .from("resources")
      .select("*")
      .eq("id", id)
      .single();

    const updateData: Record<string, any> = {
      title: body.title,
      slug: body.slug,
      short_description: body.short_description || null,
      description: body.description || null,
      category_id: body.category_id || null,
      thumbnail_url: body.thumbnail_url || null,
      icon_url: body.icon_url || null,
      resource_type: body.resource_type || "DOWNLOAD",
      access_type: body.access_type || "FREE",
      price: body.price !== undefined ? Number(body.price) : 0,
      sale_price:
        body.sale_price !== null && body.sale_price !== undefined
          ? Number(body.sale_price)
          : null,
      platform: body.platform || null,
      version: body.version || null,
      version_code: body.version_code ? Number(body.version_code) : null,
      package_name: body.package_name || null,
      size_bytes: body.size_bytes ? Number(body.size_bytes) : null,
      developer: body.developer || null,
      license: body.license || null,
      official_url: body.official_url || null,
      status: body.status || "DRAFT",
      featured: !!body.featured,
      changelog: body.changelog || null,
      system_requirements: body.system_requirements || null,
      features: body.features || [],
      tags: body.tags || [],
      updated_at: new Date().toISOString(),
    };

    if (body.status === "PUBLISHED" && (!existing || !existing.published_at)) {
      updateData.published_at = new Date().toISOString();
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("resources")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Replace download links if provided
    if (body.download_links && Array.isArray(body.download_links)) {
      await supabaseAdmin.from("download_links").delete().eq("resource_id", id);
      const links = body.download_links.map((link: any, idx: number) => ({
        resource_id: id,
        title: link.title || "Primary Download",
        link_type: link.link_type || "PRIMARY",
        url: link.url || null,
        r2_key: link.r2_key || null,
        size_bytes: link.size_bytes ? Number(link.size_bytes) : null,
        is_active: link.is_active !== false,
        sort_order: idx,
      }));
      if (links.length > 0) {
        await supabaseAdmin.from("download_links").insert(links);
      }
    }

    // Log audit
    await supabaseAdmin.from("audit_logs").insert({
      admin_id: user.id,
      action: "UPDATE_RESOURCE",
      entity_type: "resource",
      entity_id: id,
      old_data: existing,
      new_data: updated,
    });

    return NextResponse.json({ resource: updated });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
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

    // Fetch existing for audit log
    const { data: existing } = await supabaseAdmin
      .from("resources")
      .select("title, slug")
      .eq("id", id)
      .single();

    // ── Safe Foreign Key Cleanup ─────────────────────────────────────────────
    // Clean up all related child rows to prevent foreign key constraint violations
    await Promise.allSettled([
      supabaseAdmin.from("download_links").delete().eq("resource_id", id),
      supabaseAdmin.from("resource_images").delete().eq("resource_id", id),
      supabaseAdmin.from("order_items").delete().eq("resource_id", id),
      supabaseAdmin.from("favorites").delete().eq("resource_id", id),
      supabaseAdmin.from("download_logs").delete().eq("resource_id", id),
      supabaseAdmin.from("user_entitlements").delete().eq("resource_id", id),
      supabaseAdmin.from("reviews").delete().eq("resource_id", id),
    ]);

    // Now safely delete the resource itself
    const { error: deleteError } = await supabaseAdmin
      .from("resources")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    await supabaseAdmin.from("audit_logs").insert({
      admin_id: user.id,
      action: "DELETE_RESOURCE",
      entity_type: "resource",
      entity_id: id,
      old_data: existing,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
