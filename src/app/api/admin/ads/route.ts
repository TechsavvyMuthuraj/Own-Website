import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { invalidateAdsCache } from "@/lib/ads";
import { DEFAULT_ADSTERRA_CONFIG } from "@/config/adsterra";

// Helper to verify admin identity (via designated email or DB profile role)
async function verifyAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { authorized: false, user: null };

  const adminEmails = (process.env.ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  const isDesignatedAdmin = Boolean(user.email && adminEmails.includes(user.email.toLowerCase()));
  if (isDesignatedAdmin) return { authorized: true, user };

  const supabaseAdmin = createAdminClient();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdminByRole = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";
  return { authorized: isAdminByRole, user };
}

// GET: Returns all ad placements and ads configuration
export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();

    const { data: ads, error } = await supabaseAdmin
      .from("ad_placements")
      .select("*")
      .order("priority", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Also fetch global site settings related to ads
    const { data: settingsData } = await supabaseAdmin
      .from("site_settings")
      .select("key,value")
      .in("key", ["ads_enabled", "adsense_auto_ads", "adsense_client_id", "adsterra_settings"]);

    const adSettings: Record<string, any> = {
      ads_enabled: true,
      adsense_auto_ads: true,
      adsense_client_id: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-1960459798233871",
      adsterra_settings: DEFAULT_ADSTERRA_CONFIG,
    };

    (settingsData || []).forEach((item: any) => {
      try {
        const val = typeof item.value === "string" ? JSON.parse(item.value) : item.value;
        if (item.key === "adsterra_settings") {
          adSettings.adsterra_settings = {
            ...DEFAULT_ADSTERRA_CONFIG,
            ...val,
            placements: {
              ...DEFAULT_ADSTERRA_CONFIG.placements,
              ...(val?.placements || {}),
            },
          };
        } else {
          adSettings[item.key] = val;
        }
      } catch {
        adSettings[item.key] = item.value;
      }
    });

    return NextResponse.json({ ads: ads || [], settings: adSettings });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create a new ad placement or seed defaults
export async function POST(request: Request) {
  try {
    const { authorized } = await verifyAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized or Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const supabaseAdmin = createAdminClient();

    // Action: Seed default high-earning ad slots
    if (body.action === "seed_defaults") {
      const defaultSlots = [
        {
          title: "Top Header Leaderboard Banner",
          location: "HEADER",
          provider: "ADSENSE",
          ad_code: `<!-- Google AdSense - Top Leaderboard -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-1960459798233871"}"
     data-ad-slot="auto"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>`,
          priority: 10,
          is_active: true,
        },
        {
          title: "Resource Detail Sidebar Rectangle",
          location: "SIDEBAR",
          provider: "ADSENSE",
          ad_code: `<!-- Google AdSense - Sidebar Medium Rectangle -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-1960459798233871"}"
     data-ad-slot="auto"
     data-ad-format="rectangle"
     data-full-width-responsive="true"></ins>`,
          priority: 8,
          is_active: true,
        },
        {
          title: "Download Page Verification Banner (High CTR)",
          location: "DOWNLOAD_PAGE",
          provider: "ADSENSE",
          ad_code: `<!-- Google AdSense - Download Unlock Banner -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-1960459798233871"}"
     data-ad-slot="auto"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>`,
          priority: 9,
          is_active: true,
        },
        {
          title: "In-Feed Resource Grid Native Ad",
          location: "IN_FEED",
          provider: "ADSENSE",
          ad_code: `<!-- Google AdSense - In-Feed Native Unit -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-format="fluid"
     data-ad-layout-key="-fb+5w+4e-db+86"
     data-ad-client="${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-1960459798233871"}"
     data-ad-slot="auto"></ins>`,
          priority: 6,
          is_active: true,
        },
        {
          title: "Above-Footer Full-Width Banner",
          location: "FOOTER",
          provider: "ADSENSE",
          ad_code: `<!-- Google AdSense - Footer Banner -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-1960459798233871"}"
     data-ad-slot="auto"
     data-ad-format="horizontal"
     data-full-width-responsive="true"></ins>`,
          priority: 5,
          is_active: true,
        },
      ];

      for (const slot of defaultSlots) {
        // Check if slot with same location exists
        const { data: existing } = await supabaseAdmin
          .from("ad_placements")
          .select("id")
          .eq("location", slot.location)
          .limit(1);

        if (!existing || existing.length === 0) {
          await supabaseAdmin.from("ad_placements").insert(slot);
        }
      }

      return NextResponse.json({ success: true, message: "Default ad slots created successfully" });
    }

    // Action: Update global ad settings
    if (body.action === "update_settings") {
      if (typeof body.ads_enabled !== "undefined") {
        await supabaseAdmin.from("site_settings").upsert({
          key: "ads_enabled",
          value: JSON.stringify(body.ads_enabled),
          updated_at: new Date().toISOString(),
        });
      }
      if (typeof body.adsense_auto_ads !== "undefined") {
        await supabaseAdmin.from("site_settings").upsert({
          key: "adsense_auto_ads",
          value: JSON.stringify(body.adsense_auto_ads),
          updated_at: new Date().toISOString(),
        });
      }
      invalidateAdsCache();
      return NextResponse.json({ success: true });
    }

    // Action: Update Adsterra Monetization Settings
    if (body.action === "update_adsterra_settings") {
      if (body.adsterra_settings) {
        await supabaseAdmin.from("site_settings").upsert({
          key: "adsterra_settings",
          value: JSON.stringify(body.adsterra_settings),
          updated_at: new Date().toISOString(),
        });
        invalidateAdsCache();
      }
      return NextResponse.json({ success: true, settings: body.adsterra_settings });
    }

    // Standard Ad Placement Creation
    const { data, error } = await supabaseAdmin
      .from("ad_placements")
      .insert({
        title: body.title.trim(),
        location: body.location || "HEADER",
        provider: body.provider || "ADSENSE",
        ad_code: body.ad_code ? body.ad_code.trim() : "",
        priority: Number(body.priority) || 0,
        is_active: body.is_active !== false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateAdsCache();
    return NextResponse.json({ ad: data });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH: Update an ad placement (e.g. toggle is_active, change title/code)
export async function PATCH(request: Request) {
  try {
    const { authorized } = await verifyAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized or Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Ad placement ID is required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from("ad_placements")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateAdsCache();
    return NextResponse.json({ ad: data });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Remove an ad placement
export async function DELETE(request: Request) {
  try {
    const { authorized } = await verifyAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized or Forbidden" }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Ad placement ID is required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from("ad_placements").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    invalidateAdsCache();
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
