import React from "react";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { AnnouncementBar } from "@/components/announcements/announcement-bar";
import { AdSlot } from "@/components/ads/ad-slot";
import { getActiveAd } from "@/lib/ads";

import { createAdminClient } from "@/lib/supabase/admin";
import { AdminMaintenanceBanner } from "@/components/admin/admin-maintenance-banner";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseAdmin = createAdminClient();
  const [headerAd, footerAd, { data: settingsData }] = await Promise.all([
    getActiveAd("HEADER"),
    getActiveAd("FOOTER"),
    supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .single(),
  ]);

  let isMaintenanceActive = false;
  if (settingsData?.value) {
    try {
      const parsed = typeof settingsData.value === "string" ? JSON.parse(settingsData.value) : settingsData.value;
      isMaintenanceActive = parsed === true || parsed === "true";
    } catch {
      isMaintenanceActive = settingsData.value === "true";
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AdminMaintenanceBanner isMaintenanceActive={isMaintenanceActive} />
      <AnnouncementBar />
      <Header />

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
