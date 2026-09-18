import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { resourceId } = await request.json();
    if (!resourceId) {
      return NextResponse.json({ error: "resourceId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Compute privacy-preserving IP hash if available
    const forwardedFor = request.headers.get("x-forwarded-for") || "";
    const ipHash = forwardedFor
      ? crypto.createHash("sha256").update(forwardedFor.split(",")[0].trim()).digest("hex").substring(0, 16)
      : null;

    const supabaseAdmin = createAdminClient();

    // 1. Record download event
    await supabaseAdmin.from("downloads").insert({
      resource_id: resourceId,
      user_id: user?.id || null,
      ip_hash: ipHash,
    });

    // 2. Automatically grant active entitlement if logged in so it appears in My Purchased Products & Downloads!
    if (user?.id) {
      try {
        await supabaseAdmin.from("entitlements").upsert(
          {
            user_id: user.id,
            resource_id: resourceId,
            status: "ACTIVE",
          },
          { onConflict: "user_id,resource_id" }
        );
      } catch (entitlementErr) {
        console.warn("Could not upsert entitlement for free download:", entitlementErr);
      }
    }

    // 3. Increment downloads_count on resource
    const { data: res } = await supabaseAdmin
      .from("resources")
      .select("downloads_count")
      .eq("id", resourceId)
      .single();

    if (res) {
      await supabaseAdmin
        .from("resources")
        .update({ downloads_count: (res.downloads_count || 0) + 1 })
        .eq("id", resourceId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to record download event:", error);
    return NextResponse.json({ error: "Failed to log download" }, { status: 500 });
  }
}
