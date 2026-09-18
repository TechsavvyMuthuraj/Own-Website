import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Laptop,
  FileCheck,
  Calendar,
  Building,
  HardDrive,
  Info,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Resource, ResourceImage, DownloadLink } from "@/types/database";
import {
  formatBytes,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  isNewResource,
  isUpdatedResource,
} from "@/lib/utils";
import { ResourceGrid } from "@/components/resources/resource-grid";
import { ResourceDetailActions } from "./actions-client";
import { ResourceVisual } from "@/components/resources/resource-visual";
import { AdSlot } from "@/components/ads/ad-slot";
import { getActiveAd } from "@/lib/ads";

import type { Metadata } from "next";

interface ResourceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: ResourceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: res } = await supabase
    .from("resources")
    .select("title, short_description, description, thumbnail_url, tags, platform, version, category:categories(name)")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();

  if (!res) {
    return {
      title: "Resource Not Found | NammaTech",
      description: "The requested digital resource could not be found.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://nammatech.in";

  const title = `${res.title} - Download Free & Verified | NammaTech`;
  const description =
    res.short_description ||
    res.description?.slice(0, 160) ||
    `Download ${res.title} safely on NammaTech. Fast, verified, and malware-free.`;
  const imageUrl = res.thumbnail_url || `${siteUrl}/images/hero-clean.png`;

  const categoryName = Array.isArray(res.category)
    ? (res.category[0] as any)?.name
    : (res.category as any)?.name;

  return {
    title,
    description,
    keywords: [
      res.title,
      categoryName || "Digital Resources",
      res.platform || "Multi-Platform",
      ...(Array.isArray(res.tags) ? res.tags : []),
      "safe download",
      "verified software",
    ],
    alternates: {
      canonical: `${siteUrl}/resource/${slug}`,
    },
    openGraph: {
      type: "article",
      url: `${siteUrl}/resource/${slug}`,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: res.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch Resource with Category, Images, and Active Download Links
  const { data: resData, error } = await supabase
    .from("resources")
    .select("*, category:categories(*), images:resource_images(*), download_links(*)")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .single();

  if (error || !resData) {
    notFound();
  }

  const resource = {
    ...resData,
    category: Array.isArray(resData.category) ? resData.category[0] : resData.category,
    images: (resData.images || []).sort(
      (a: ResourceImage, b: ResourceImage) => a.sort_order - b.sort_order
    ),
    download_links: (resData.download_links || []).filter(
      (link: DownloadLink) => link.is_active
    ),
  } as Resource;

  // 2. Fetch Related Resources in same category
  let relatedResources: Resource[] = [];
  if (resource.category_id) {
    const { data: relatedData } = await supabase
      .from("resources")
      .select("*, category:categories(*)")
      .eq("category_id", resource.category_id)
      .eq("status", "PUBLISHED")
      .neq("id", resource.id)
      .limit(4);

    if (relatedData) {
      relatedResources = (relatedData as unknown[]).map((item: any) => ({
        ...item,
        category: Array.isArray(item.category) ? item.category[0] : item.category,
      })) as Resource[];
    }
  }

  // 3. Fetch Active Ad Placements for Sidebar and Content Bottom
  const [sidebarAd, resourcePageAd] = await Promise.all([
    getActiveAd("SIDEBAR"),
    getActiveAd("RESOURCE_PAGE"),
  ]);

  const isNew = isNewResource(resource.published_at || resource.created_at);
  const isUpdated = isUpdatedResource(resource.updated_at, resource.created_at);
  const isPaid = resource.access_type === "PAID";
  const isExternal = resource.access_type === "EXTERNAL" || resource.resource_type === "EXTERNAL_LINK";

  const schemaOrgProduct = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: resource.title,
    description: resource.short_description || resource.description,
    applicationCategory: resource.category?.name || "UtilitiesApplication",
    operatingSystem: resource.platform || "Windows, Android, Web",
    offers: {
      "@type": "Offer",
      price: resource.price || "0.00",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
    ...(resource.thumbnail_url && { image: resource.thumbnail_url }),
    author: {
      "@type": "Person",
      name: resource.developer || "NammaTech",
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Product / SoftwareApplication Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgProduct) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mb-6">
        <Link href="/" className="hover:text-[var(--foreground)]">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        {resource.category && (
          <>
            <Link
              href={`/category/${resource.category.slug}`}
              className="hover:text-[var(--foreground)]"
            >
              {resource.category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
          </>
        )}
        <span className="text-[var(--foreground)] font-medium truncate">
          {resource.title}
        </span>
      </nav>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-start gap-5 p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
            {/* App / File Icon */}
            <ResourceVisual
              resource={resource}
              variant="icon"
              size="xl"
              showFormatTag={false}
            />

            {/* Title & Metadata */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {isNew && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="w-3 h-3" />
                    NEW
                  </span>
                )}
                {isUpdated && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    <Clock className="w-3 h-3" />
                    UPDATED
                  </span>
                )}
                {isPaid ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    PREMIUM
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    FREE
                  </span>
                )}
                {resource.platform && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)]">
                    {resource.platform}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight mb-2">
                {resource.title}
              </h1>

              {resource.short_description && (
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {resource.short_description}
                </p>
              )}
            </div>
          </div>

          {/* Screenshots Gallery (if available) or Default App/File Showcase */}
          {resource.images && resource.images.length > 0 ? (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <h3 className="text-base font-bold text-[var(--foreground)] mb-4">
                Screenshots & Preview
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resource.images.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-video rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--secondary)]"
                  >
                    <Image
                      src={img.image_url}
                      alt={img.caption || resource.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm overflow-hidden relative">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-full sm:w-56 flex-shrink-0">
                  <ResourceVisual resource={resource} variant="card" showFormatTag={true} />
                </div>
                <div className="flex-1 space-y-3 text-left w-full">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Direct Verified Package
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      Safe & Untouched
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-[var(--foreground)]">
                    Official App & File Distribution
                  </h4>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    This digital resource is distributed directly via authentic download URLs and mirrors with valid licensing terms. Clean of adware, malware, or deceptive wrappers.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--foreground)] pt-1">
                    {resource.platform && (
                      <div className="flex items-center gap-1 font-medium">
                        <span className="text-[var(--muted-foreground)]">Platform:</span>
                        <span>{resource.platform}</span>
                      </div>
                    )}
                    {resource.version && (
                      <div className="flex items-center gap-1 font-mono">
                        <span className="text-[var(--muted-foreground)] font-sans">Version:</span>
                        <span>v{resource.version}</span>
                      </div>
                    )}
                    {resource.license && (
                      <div className="flex items-center gap-1 font-medium">
                        <span className="text-[var(--muted-foreground)]">License:</span>
                        <span>{resource.license}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Description */}
          {resource.description && (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">
                About this Resource
              </h3>
              <div className="prose dark:prose-invert max-w-none text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line">
                {resource.description}
              </div>
            </div>
          )}

          {/* Features List (if available) */}
          {resource.features && resource.features.length > 0 && (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <h3 className="text-base font-bold text-[var(--foreground)] mb-4">
                Key Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resource.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[var(--foreground)]">
                    <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Changelog / Version History (if available) */}
          {resource.changelog && (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <h3 className="text-base font-bold text-[var(--foreground)] mb-3">
                Changelog
              </h3>
              <div className="p-4 rounded-xl bg-[var(--secondary)]/50 border border-[var(--border)] font-mono text-xs text-[var(--muted-foreground)] whitespace-pre-line">
                {resource.changelog}
              </div>
            </div>
          )}

          {/* System Requirements (if available) */}
          {resource.system_requirements && (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <h3 className="text-base font-bold text-[var(--foreground)] mb-3">
                System Requirements
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed whitespace-pre-line">
                {resource.system_requirements}
              </p>
            </div>
          )}
        </div>

        {/* Right 1 Column: Metadata & Action Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <div className="sticky top-20 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg shadow-indigo-500/5 space-y-5">
            {/* Price section */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Access & Pricing
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                {isPaid ? (
                  <>
                    <span className="text-3xl font-extrabold text-[var(--foreground)]">
                      {formatCurrency(resource.sale_price !== null ? resource.sale_price : resource.price, resource.currency)}
                    </span>
                    {resource.sale_price !== null && (
                      <span className="text-sm text-[var(--muted-foreground)] line-through">
                        {formatCurrency(resource.price, resource.currency)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    Free Download
                  </span>
                )}
              </div>
            </div>

            {/* Client Interactive Action Buttons (Download, Cart, Buy Now) */}
            <ResourceDetailActions resource={resource} />

            {/* Trust Indicators */}
            <div className="pt-4 border-t border-[var(--border)] space-y-3 text-xs">
              <h4 className="font-bold text-[var(--foreground)] text-xs uppercase tracking-wider">
                Resource Details
              </h4>

              {resource.developer && (
                <div className="flex items-center justify-between text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    Developer:
                  </span>
                  <span className="font-medium text-[var(--foreground)]">
                    {resource.developer}
                  </span>
                </div>
              )}

              {resource.version && (
                <div className="flex items-center justify-between text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Version:
                  </span>
                  <span className="font-mono font-medium text-[var(--foreground)]">
                    {resource.version}
                  </span>
                </div>
              )}

              {resource.size_bytes && resource.size_bytes > 0 && (
                <div className="flex items-center justify-between text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5" />
                    File Size:
                  </span>
                  <span className="font-medium text-[var(--foreground)]">
                    {formatBytes(resource.size_bytes)}
                  </span>
                </div>
              )}

              {resource.license && (
                <div className="flex items-center justify-between text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5" />
                    License:
                  </span>
                  <span className="font-medium text-[var(--foreground)]">
                    {resource.license}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-[var(--muted-foreground)]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Last Updated:
                </span>
                <span className="font-medium text-[var(--foreground)]">
                  {formatDate(resource.updated_at)}
                </span>
              </div>

              {resource.official_url && (
                <div className="pt-2">
                  <a
                    href={resource.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--primary)] hover:underline"
                  >
                    <span>Official Developer Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Verification Tag */}
            <div className="p-3 rounded-2xl bg-[var(--secondary)] border border-[var(--border)] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div className="text-[11px] leading-relaxed text-[var(--muted-foreground)]">
                <strong className="text-[var(--foreground)] font-semibold">Legitimate Release:</strong>{" "}
                Distributed with permission or verified open-source/freeware license.
              </div>
            </div>

            {/* Sidebar Ad Unit */}
            {sidebarAd && (
              <div className="pt-2">
                <AdSlot ad={sidebarAd} location="SIDEBAR" format="rectangle" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resource Bottom Ad Banner */}
      {resourcePageAd && (
        <div className="mt-12 w-full">
          <AdSlot ad={resourcePageAd} location="RESOURCE_PAGE" format="auto" />
        </div>
      )}

      {/* Related Resources */}
      {relatedResources.length > 0 && (
        <div className="mt-16 pt-12 border-t border-[var(--border)]">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight mb-6">
            Related Resources
          </h2>
          <ResourceGrid resources={relatedResources} />
        </div>
      )}
    </div>
  );
}
