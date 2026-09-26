import React, { Suspense } from "react";
import { Header, DEFAULT_NAV_LINKS, type NavLinkItem } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { AnnouncementBar } from "@/components/announcements/announcement-bar";
import { AdSlot } from "@/components/ads/ad-slot";
import { AdsterraScript } from "@/components/ads/AdsterraScript";
import { getActiveAd } from "@/lib/ads";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminMaintenanceBanner } from "@/components/admin/admin-maintenance-banner";
import { TopLoader } from "@/components/navigation/top-loader";
import { PageLoader } from "@/components/ui/page-loader";
import { GlobalSiteMascot } from "@/components/mascot/global-site-mascot";
import { ContactSupportPopup } from "@/components/support/contact-support-popup";

import { unstable_cache } from "next/cache";

export const revalidate = 300; // 300s Edge ISR cache — unlocks instant CDN page switching

const fetchMaintenanceModeFromDb = async (): Promise<boolean> => {
  try {
    const supabaseAdmin = createAdminClient();
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .maybeSingle();
    let isMaintenanceActive = false;
    if (data?.value) {
      try {
        const parsed = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
        isMaintenanceActive = parsed === true || parsed === "true";
      } catch {
        isMaintenanceActive = data.value === "true";
      }
    }
    return isMaintenanceActive;
  } catch {
    return false;
  }
};

const getCachedMaintenance = unstable_cache(
  fetchMaintenanceModeFromDb,
  ["site-maintenance-mode"],
  { revalidate: 60, tags: ["maintenance"] }
);

async function checkMaintenanceMode(): Promise<boolean> {
  try {
    return await getCachedMaintenance();
  } catch {
    return false;
  }
}

const fetchNavbarLinksFromDb = async (): Promise<NavLinkItem[]> => {
  try {
    const supabaseAdmin = createAdminClient();
    const { data } = await supabaseAdmin
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
          const communityItem: NavLinkItem = {
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
        return parsed.navbar_items;
      }
    }
  } catch {}

  return DEFAULT_NAV_LINKS;
};

const getCachedNavbarLinks = unstable_cache(
  fetchNavbarLinksFromDb,
  ["site-navbar-links"],
  { revalidate: 300, tags: ["nav-links"] }
);

async function getNavbarLinks(): Promise<NavLinkItem[]> {
  try {
    return await getCachedNavbarLinks();
  } catch {
    return DEFAULT_NAV_LINKS;
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerAd, footerAd, isMaintenanceActive, navLinks] = await Promise.all([
    getActiveAd("HEADER"),
    getActiveAd("FOOTER"),
    checkMaintenanceMode(),
    getNavbarLinks(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <AdsterraScript />
      <Suspense fallback={null}>
        <PageLoader />
        <TopLoader />
        <GlobalSiteMascot />
        <ContactSupportPopup />
      </Suspense>
      <AdminMaintenanceBanner isMaintenanceActive={isMaintenanceActive} />
      <AnnouncementBar />
      <Header navLinks={navLinks} />

      {/* Top Header Leaderboard Ad */}
      {headerAd && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
          <AdSlot ad={headerAd} location="HEADER" format="horizontal" />
        </div>
      )}

      <main className="flex-1 flex flex-col">{children}</main>

      {/* Above-Footer Leaderboard Ad */}
      {footerAd && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-8">
          <AdSlot ad={footerAd} location="FOOTER" format="horizontal" />
        </div>
      )}

      <Footer />
    </div>
  );
}
