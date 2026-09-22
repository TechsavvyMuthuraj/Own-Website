import React, { Suspense } from "react";
import { Header, DEFAULT_NAV_LINKS, type NavLinkItem } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { AnnouncementBar } from "@/components/announcements/announcement-bar";
import { AdSlot } from "@/components/ads/ad-slot";
import { getActiveAd } from "@/lib/ads";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminMaintenanceBanner } from "@/components/admin/admin-maintenance-banner";
import { TopLoader } from "@/components/navigation/top-loader";
import { PageLoader } from "@/components/ui/page-loader";
import { YouTubeMiniPlayer } from "@/components/media/youtube-mini-player";
import { GlobalSiteMascot } from "@/components/mascot/global-site-mascot";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function checkMaintenanceMode(): Promise<boolean> {
  try {
    const supabaseAdmin = createAdminClient();
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .single();
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
}

async function getNavbarLinks(): Promise<NavLinkItem[]> {
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
        return parsed.navbar_items;
      }
    }
  } catch {}
  return DEFAULT_NAV_LINKS;
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
      <Suspense fallback={null}>
        <PageLoader />
        <TopLoader />
        <YouTubeMiniPlayer />
        <GlobalSiteMascot />
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
