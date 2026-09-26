import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rixdlxqktshrwjbaxxcz.supabase.co";
const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpeGRseHFrdHNocndqYmF4eGN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTcxODEwMywiZXhwIjoyMTA1Mjk0MTAzfQ.jirviICOr8IBz_39JSI5OSDoMHpnUDRiIGFtSQ0O1Zw";

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function sync() {
  console.log("Checking ad_placements table...");
  const { data: placements, error: pErr } = await supabase.from("ad_placements").select("*");
  if (pErr) {
    console.error("ad_placements error:", pErr);
  } else {
    console.log(`Found ${placements?.length || 0} placements.`);
  }

  // Update site_settings
  const masterAdsterra = {
    enabled: true,
    smartlink1Enabled: true,
    smartlink2Enabled: true,
    smartlink3Enabled: true,
    scriptEnabled: true,
    script2Enabled: true,
    nativeBannerEnabled: true,
    bannerZonesEnabled: true,
    popupAdEnabled: true,
    stickyBarEnabled: true,
    popupDelaySeconds: 3.5,
    smartlink1: "https://demolishwrestconclusions.com/hebd0wzjqw?key=ef54880efe2cf24e942204e7b606498c",
    smartlink2: "https://demolishwrestconclusions.com/x0a8ik0sn4?key=01cda2b2e4e25f16daea215015495d74",
    smartlink3: "https://demolishwrestconclusions.com/p9zz1z9nw?key=f0d4b0285569216ca06b70c80fd36df8",
    scriptUrl: "https://demolishwrestconclusions.com/18/91/1b/18911b7efb81e91a2cf994b94c5589c2.js",
    scriptUrl2: "https://demolishwrestconclusions.com/30/9f/95/309f95fd3760f90cc4ce9941f34d920f.js",
    customBannerCode: "",
    placements: {
      homepage: true,
      resourceList: true,
      resourceDetails: true,
      article: true,
      mobile: true,
      desktop: true,
      smartlinks: true
    }
  };

  const { error: sErr } = await supabase.from("site_settings").upsert([
    { key: "ads_enabled", value: "true" },
    { key: "adsense_auto_ads", value: "true" },
    { key: "adsterra_settings", value: JSON.stringify(masterAdsterra) }
  ]);

  if (sErr) console.error("site_settings error:", sErr);
  else console.log("site_settings successfully synced!");

  // Ensure default placements exist with ad_code
  const defaultPlacements = [
    { title: "Top Header Leaderboard Banner (728x90 / 320x50)", location: "HEADER", provider: "ADSTERRA", ad_code: "<!-- Adsterra Header Banner -->", priority: 10, is_active: true },
    { title: "Homepage Feature Ad Banner (728x90 / 320x50)", location: "HOMEPAGE", provider: "ADSTERRA", ad_code: "<!-- Adsterra Homepage Banner -->", priority: 10, is_active: true },
    { title: "In-Feed Native & Display Unit (300x250 Medium Rectangle)", location: "IN_FEED", provider: "ADSTERRA", ad_code: "<!-- Adsterra In-Feed Unit -->", priority: 8, is_active: true },
    { title: "Resource Detail Sidebar Ad (300x250 Medium Rectangle)", location: "SIDEBAR", provider: "ADSTERRA", ad_code: "<!-- Adsterra Sidebar Rectangle -->", priority: 9, is_active: true },
    { title: "Resource Page Content Banner", location: "RESOURCE_PAGE", provider: "ADSTERRA", ad_code: "<!-- Adsterra Resource Banner -->", priority: 7, is_active: true },
    { title: "Download Access Verification Ad (728x90 / 300x250)", location: "DOWNLOAD_PAGE", provider: "ADSTERRA", ad_code: "<!-- Adsterra Download Banner -->", priority: 12, is_active: true },
    { title: "Above-Footer Leaderboard Banner (728x90 / 320x50)", location: "FOOTER", provider: "ADSTERRA", ad_code: "<!-- Adsterra Footer Banner -->", priority: 6, is_active: true },
    { title: "Full-Website Pop-up Ad (300x250 Medium Rectangle)", location: "POPUP", provider: "ADSTERRA", ad_code: "<!-- Adsterra Pop-up Modal -->", priority: 15, is_active: true }
  ];

  for (const item of defaultPlacements) {
    const existing = placements?.find(p => p.location === item.location);
    if (!existing) {
      const { error: insErr } = await supabase.from("ad_placements").insert(item);
      if (insErr) {
        console.error(`Failed to insert ${item.location}:`, insErr.message);
      } else {
        console.log(`Inserted missing placement: ${item.location}`);
      }
    } else {
      const { error: upErr } = await supabase.from("ad_placements").update({ is_active: true, provider: "ADSTERRA", ad_code: item.ad_code }).eq("id", existing.id);
      if (upErr) console.error(`Failed to update ${item.location}:`, upErr.message);
      else console.log(`Activated placement: ${item.location}`);
    }
  }

  console.log("Database sync complete!");
}

sync();
