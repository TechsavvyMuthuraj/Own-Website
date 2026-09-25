import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_NAV_LINKS } from "@/components/navigation/header";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "homepage_settings")
      .maybeSingle();

    if (data?.value) {
      const parsed = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
      if (parsed?.navbar_items && Array.isArray(parsed.navbar_items)) {
        const hasCommunity = parsed.navbar_items.some((item: any) => item.href === "/community");
        if (!hasCommunity) {
          const homeIdx = parsed.navbar_items.findIndex((item: any) => item.href === "/");
          const communityItem = {
            id: "nav-community",
            href: "/community",
            label: "Community",
            active: true,
            badge: "LIVE",
          };
          if (homeIdx !== -1) {
            parsed.navbar_items.splice(homeIdx + 1, 0, communityItem);
          } else {
            parsed.navbar_items.unshift(communityItem);
          }
        }
        return NextResponse.json(
          { navLinks: parsed.navbar_items },
          {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            },
          }
        );
      }
    }
  } catch (err) {
    console.error("Error fetching navigation:", err);
  }

  return NextResponse.json(
    { navLinks: DEFAULT_NAV_LINKS },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  );
}
