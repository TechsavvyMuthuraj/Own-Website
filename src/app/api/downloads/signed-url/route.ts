import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateDownloadPresignedUrl } from "@/lib/r2/signed-url";

export async function POST(request: Request) {
  try {
    const { resourceId, linkId, r2Key, accessToken } = await request.json();

    if (!resourceId) {
      return NextResponse.json({ error: "Missing required resourceId" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // 1. Fetch resource to verify access permissions
    const { data: resource, error: resError } = await supabaseAdmin
      .from("resources")
      .select("id, title, access_type, status")
      .eq("id", resourceId)
      .single();

    if (resError || !resource || resource.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Resource not available" }, { status: 404 });
    }

    // 2. If Paid, enforce entitlement — user session OR valid access token
    if (resource.access_type === "PAID") {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let hasAccess = false;

      if (user) {
        // Check authenticated user's entitlement
        const { data: entitlement } = await supabaseAdmin
          .from("entitlements")
          .select("id")
          .eq("user_id", user.id)
          .eq("resource_id", resource.id)
          .eq("status", "ACTIVE")
          .maybeSingle();
        hasAccess = !!entitlement;
      } else if (accessToken && typeof accessToken === "string" && accessToken.length >= 16) {
        // Check guest access token
        const { data: entitlement } = await supabaseAdmin
          .from("entitlements")
          .select("id, resource_id, expires_at")
          .eq("access_token", accessToken)
          .eq("resource_id", resource.id)
          .eq("status", "ACTIVE")
          .maybeSingle();

        if (entitlement) {
          // Check expiry
          if (!entitlement.expires_at || new Date(entitlement.expires_at) > new Date()) {
            hasAccess = true;
          }
        }
      }

      if (!hasAccess) {
        return NextResponse.json({ error: "Payment required for this resource" }, { status: 403 });
      }
    }

    // 3. Find download link directly from Supabase
    if (linkId) {
      const { data: link } = await supabaseAdmin
        .from("download_links")
        .select("url, r2_key")
        .eq("id", linkId)
        .maybeSingle();

      if (link?.url) {
        return NextResponse.json({ signedUrl: link.url, downloadUrl: link.url });
      }
    }

    // 4. Fallback if r2Key was provided
    if (r2Key) {
      const signedUrl = await generateDownloadPresignedUrl(r2Key, 900);
      if (signedUrl) {
        return NextResponse.json({ signedUrl });
      }
    }

    // 5. If there is a primary link with url on the resource, return it
    const { data: fallbackLinks } = await supabaseAdmin
      .from("download_links")
      .select("url")
      .eq("resource_id", resourceId)
      .eq("is_active", true)
      .limit(1);

    if (fallbackLinks && fallbackLinks[0]?.url) {
      return NextResponse.json({ signedUrl: fallbackLinks[0].url, downloadUrl: fallbackLinks[0].url });
    }

    return NextResponse.json(
      { error: "No direct download link available for this resource." },
      { status: 404 }
    );
  } catch (err) {
    console.error("Signed URL generation error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
