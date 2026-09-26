import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Resource, DownloadLink } from "@/types/database";
import { DownloadUnlockExperience } from "./unlock-client";
import { AdSlot } from "@/components/ads/ad-slot";
import { AdsterraBanner } from "@/components/ads/AdsterraBanner";
import { getActiveAd } from "@/lib/ads";

interface DownloadPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DownloadPage({ params }: DownloadPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch resource with download links
  const { data: resData, error } = await supabase
    .from("resources")
    .select("*, download_links(*)")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .single();

  if (error || !resData) {
    notFound();
  }

  const resource = {
    ...resData,
    download_links: (resData.download_links || []).filter(
      (link: DownloadLink) => link.is_active
    ),
  } as Resource;

  // 2. If paid, verify authenticated user and active entitlement
  if (resource.access_type === "PAID") {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(`/auth/login?redirect=/resource/${resource.slug}/download`);
    }

    const { data: entitlement } = await supabase
      .from("entitlements")
      .select("id")
      .eq("user_id", user.id)
      .eq("resource_id", resource.id)
      .eq("status", "ACTIVE")
      .maybeSingle();

    if (!entitlement) {
      // User has not purchased this resource
      redirect(`/resource/${resource.slug}?error=payment_required`);
    }
  }

  // 3. Fetch Download Screen Ad
  const downloadAd = await getActiveAd("DOWNLOAD_PAGE");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col justify-center space-y-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mb-2">
        <Link href="/" className="hover:text-[var(--foreground)]">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/resource/${resource.slug}`} className="hover:text-[var(--foreground)]">
          {resource.title}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[var(--foreground)] font-medium">Download Access</span>
      </nav>

      {/* Unlock & Download Experience Client Component */}
      <DownloadUnlockExperience resource={resource} />

      {/* Download Verification Ad Placement */}
      {downloadAd ? (
        <div className="w-full">
          <AdSlot ad={downloadAd} location="DOWNLOAD_PAGE" format="auto" />
        </div>
      ) : (
        <div className="w-full pt-4 flex justify-center">
          <AdsterraBanner placement="resourceDetails" format="rectangle" linkType={1} />
        </div>
      )}
    </div>
  );
}
