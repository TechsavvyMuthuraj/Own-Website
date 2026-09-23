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
import { GlobalSiteMascot } from "@/components/mascot/global-site-mascot";
import { ContactSupportPopup } from "@/components/support/contact-support-popup";
import { AuroraBackground } from "@/components/ui/aurora-background";

export const revalidate = 60; // 60s Edge ISR cache — unlocks instant CDN page switching

let cachedMaintenance: { value: boolean; expires: number } | null = null;
let cachedNavLinks: { value: NavLinkItem[]; expires: number } | null = null;

async function checkMaintenanceMode(): Promise<boolean> {
  const now = Date.now();
  if (cachedMaintenance && cachedMaintenance.expires > now) {
    return cachedMaintenance.value;
  }

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
    cachedMaintenance = { value: isMaintenanceActive, expires: now + 60000 };
    return isMaintenanceActive;
  } catch {
    return cachedMaintenance ? cachedMaintenance.value : false;
  }
}

async function getNavbarLinks(): Promise<NavLinkItem[]> {
  const now = Date.now();
  if (cachedNavLinks && cachedNavLinks.expires > now) {
    return cachedNavLinks.value;
  }

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
        cachedNavLinks = { value: parsed.navbar_items, expires: now + 60000 };
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
    <div className="flex flex-col min-h-screen relative">
      {/* Ambient Animated Aurora Background for all pages */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-30 dark:opacity-45" aria-hidden="true">
        <AuroraBackground className="!w-full !h-full !bg-transparent" starCount={35} />
      </div>

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
