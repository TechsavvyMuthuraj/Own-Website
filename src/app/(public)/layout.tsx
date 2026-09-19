import React, { Suspense } from "react";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { AnnouncementBar } from "@/components/announcements/announcement-bar";
import { AdSlot } from "@/components/ads/ad-slot";
import { getActiveAd } from "@/lib/ads";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminMaintenanceBanner } from "@/components/admin/admin-maintenance-banner";
import { TopLoader } from "@/components/navigation/top-loader";

// In-memory 30s cache to avoid blocking database queries on every navigation click
let cachedMaintenance: { value: boolean; expiresAt: number } | null = null;

async function checkMaintenanceMode(): Promise<boolean> {
  const now = Date.now();
  if (cachedMaintenance && cachedMaintenance.expiresAt > now) {
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
    cachedMaintenance = { value: isMaintenanceActive, expiresAt: now + 30000 };
    return isMaintenanceActive;
  } catch {
    return false;
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [headerAd, footerAd, isMaintenanceActive] = await Promise.all([
    getActiveAd("HEADER"),
    getActiveAd("FOOTER"),
    checkMaintenanceMode(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={null}>
        <TopLoader />
      </Suspense>
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
