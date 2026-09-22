import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token || token.length < 16) {
      return NextResponse.json({ error: "Invalid access token" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Fetch entitlement by access_token — must be ACTIVE and not expired
    const { data: entitlement, error } = await supabaseAdmin
      .from("entitlements")
      .select(`
        id,
        resource_id,
        order_id,
        status,
        access_token,
        customer_name,
        whatsapp_number,
        expires_at,
        verified_at,
        resources:resource_id (
          id,
          title,
          slug,
          description,
          thumbnail_url,
          access_type,
          status,
          download_links (
            id,
            label,
            url,
            r2_key,
            is_active
          )
        )
      `)
      .eq("access_token", token)
      .eq("status", "ACTIVE")
      .maybeSingle();

    if (error || !entitlement) {
      return NextResponse.json(
        { error: "Access token is invalid, expired, or already used." },
        { status: 404 }
      );
    }

    // Check expiry
    if (entitlement.expires_at && new Date(entitlement.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This access link has expired. Please contact support." },
        { status: 410 }
      );
    }

    const resource = entitlement.resources as any;

    if (!resource || resource.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Resource is no longer available." }, { status: 404 });
    }

    // Return safe payload — no tokens, only what the page needs
    return NextResponse.json({
      valid: true,
      entitlementId: entitlement.id,
      customerName: entitlement.customer_name,
      verifiedAt: entitlement.verified_at,
      resource: {
        id: resource.id,
        title: resource.title,
        slug: resource.slug,
        description: resource.description,
        thumbnailUrl: resource.thumbnail_url,
        accessType: resource.access_type,
        downloadLinks: (resource.download_links || [])
          .filter((l: any) => l.is_active)
          .map((l: any) => ({
            id: l.id,
            label: l.label,
            url: l.url,
            r2Key: l.r2_key,
          })),
      },
    });
  } catch (err) {
    console.error("Access token validation error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
