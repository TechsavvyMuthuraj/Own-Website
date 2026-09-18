import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateDownloadPresignedUrl } from "@/lib/r2/signed-url";

export async function POST(request: Request) {
  try {
    const { resourceId, linkId, r2Key } = await request.json();

    if (!resourceId) {
      return NextResponse.json({ error: "Missing required resourceId" }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Fetch resource to verify access permissions
    const { data: resource, error: resError } = await supabase
      .from("resources")
      .select("id, title, access_type, status")
      .eq("id", resourceId)
      .single();

    if (resError || !resource || resource.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Resource not available" }, { status: 404 });
    }

    // 2. If Paid, strictly enforce user entitlement
    if (resource.access_type === "PAID") {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }

      const { data: entitlement } = await supabase
        .from("entitlements")
        .select("id")
        .eq("user_id", user.id)
        .eq("resource_id", resource.id)
        .eq("status", "ACTIVE")
        .maybeSingle();

      if (!entitlement) {
        return NextResponse.json({ error: "Payment required for this resource" }, { status: 403 });
      }
    }

    // 3. Find download link directly from Supabase
    if (linkId) {
      const { data: link } = await supabase
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
    const { data: fallbackLinks } = await supabase
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
