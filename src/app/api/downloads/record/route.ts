import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

    // Record download event
    await supabase.from("downloads").insert({
      resource_id: resourceId,
      user_id: user?.id || null,
      ip_hash: ipHash,
    });

    // Increment downloads_count on resource via raw RPC or query
    const { data: res } = await supabase
      .from("resources")
      .select("downloads_count")
      .eq("id", resourceId)
      .single();

    if (res) {
      await supabase
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
