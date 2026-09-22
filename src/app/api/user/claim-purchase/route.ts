import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/user/claim-purchase
 * Allows a signed-in user to claim a guest purchase (by access_token)
 * and link it permanently to their account.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "You must be signed in to claim a purchase." }, { status: 401 });
    }

    const { accessToken } = await request.json();

    if (!accessToken || typeof accessToken !== "string" || accessToken.length < 16) {
      return NextResponse.json({ error: "Invalid access token" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Find the guest entitlement by token
    const { data: entitlement, error: fetchError } = await supabaseAdmin
      .from("entitlements")
      .select("id, resource_id, user_id, status, expires_at")
      .eq("access_token", accessToken)
      .eq("status", "ACTIVE")
      .maybeSingle();

    if (fetchError || !entitlement) {
      return NextResponse.json({ error: "Access token not found or already used." }, { status: 404 });
    }

    if (entitlement.user_id) {
      // Already claimed — check if it's the same user
      if (entitlement.user_id === user.id) {
        return NextResponse.json({ success: true, message: "Already claimed to your account." });
      }
      return NextResponse.json(
        { error: "This purchase has already been claimed by another account." },
        { status: 409 }
      );
    }

    // Check expiry
    if (entitlement.expires_at && new Date(entitlement.expires_at) < new Date()) {
      return NextResponse.json({ error: "This access link has expired." }, { status: 410 });
    }

    // Check if user already owns this resource
    const { data: existingEntitlement } = await supabaseAdmin
      .from("entitlements")
      .select("id")
      .eq("user_id", user.id)
      .eq("resource_id", entitlement.resource_id)
      .eq("status", "ACTIVE")
      .maybeSingle();

    if (existingEntitlement) {
      // User already owns it — just clear the guest token
      await supabaseAdmin
        .from("entitlements")
        .update({ status: "SUPERSEDED" })
        .eq("id", entitlement.id);
      return NextResponse.json({ success: true, message: "You already own this resource in your account." });
    }

    // Claim: link this entitlement to the user account and clear the token
    const { error: updateError } = await supabaseAdmin
      .from("entitlements")
      .update({
        user_id: user.id,
        access_token: null, // invalidate guest token after claim
      })
      .eq("id", entitlement.id);

    if (updateError) {
      console.error("[Claim Purchase] Update error:", updateError);
      return NextResponse.json({ error: "Failed to claim purchase. Please try again." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Purchase successfully claimed to your account! You can now access it in My Downloads.",
    });
  } catch (err) {
    console.error("Claim purchase error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
