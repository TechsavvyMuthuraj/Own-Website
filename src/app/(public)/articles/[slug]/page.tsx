import React, { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Article } from "@/types/database";
import type { Metadata } from "next";
import { extractHeadings, calculateReadingStats } from "@/lib/articles/content-parser";
import { ArticlePublicView } from "@/components/articles/article-public-view";
import { AdSlot } from "@/components/ads/ad-slot";
import { getActiveAd } from "@/lib/ads";

export const revalidate = 120;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("articles")
    .select("slug")
    .eq("status", "PUBLISHED")
    .limit(50);

  return (data || []).filter((a) => Boolean(a.slug)).map((a) => ({ slug: a.slug }));
}

const getArticleBySlug = cache(async (slug: string): Promise<Article | null> => {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();
  return (data as Article) || null;
});

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getArticleBySlug(slug);
  if (!data) return { title: "Article Not Found | NammaTech" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.techsavvymuthuraj.dev";
  const ogImage = data.thumbnail_url || `${siteUrl}/images/hero-clean.png`;

  return {
    title: `${data.title} | NammaTech Journal`,
    description: data.excerpt || `Read ${data.title} on NammaTech Journal. Verified developer guides, tutorials, and tech news.`,
    alternates: {
      canonical: `${siteUrl}/articles/${slug}`,
    },
    openGraph: {
      title: data.title,
      description: data.excerpt || "",
      url: `${siteUrl}/articles/${slug}`,
      type: "article",
      publishedTime: data.published_at || data.created_at,
      modifiedTime: data.updated_at,
      authors: ["Muthuraj C"],
      tags: data.tags || [],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.excerpt || "",
      images: [ogImage],
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const a = article as Article;
  const supabase = createAdminClient();

  // Concurrently fetch Author profile, Prev/Next articles, and Ad slots
  const [authorResult, prevResult, nextResult, topAdResult, inFeedAdResult] = await Promise.all([
    a.author_id
      ? supabase
          .from("profiles")
          .select("full_name")
          .eq("id", a.author_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("articles")
      .select("id, title, slug, thumbnail_url, published_at")
      .eq("status", "PUBLISHED")
      .lt("published_at", a.published_at || a.created_at)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("articles")
      .select("id, title, slug, thumbnail_url, published_at")
      .eq("status", "PUBLISHED")
      .gt("published_at", a.published_at || a.created_at)
      .order("published_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    getActiveAd("RESOURCE_PAGE"),
    getActiveAd("IN_FEED"),
  ]);

  let authorName = "Muthuraj C (NammaTech)";
  if (authorResult.data?.full_name) {
    authorName = authorResult.data.full_name;
  }

  const prevArticle = (prevResult.data as Article) || null;
  const nextArticle = (nextResult.data as Article) || null;
  const topAd = topAdResult;
  const inFeedAd = inFeedAdResult;

  // Extract outline & compute reading metrics
  const tocItems = extractHeadings(a.content);
  const { readingTimeText } = calculateReadingStats(a.content);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.techsavvymuthuraj.dev";

  // Structured Data (JSON-LD) for Google SEO
  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: a.title,
    description: a.excerpt || a.title,
    image: a.thumbnail_url ? [a.thumbnail_url] : [`${siteUrl}/images/hero-clean.png`],
    datePublished: a.published_at || a.created_at,
    dateModified: a.updated_at || a.published_at || a.created_at,
    author: {
      "@type": "Person",
      name: authorName,
      url: `${siteUrl}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "NammaTech",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/articles/${a.slug}`,
    },
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Articles",
        item: `${siteUrl}/articles`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: a.title,
        item: `${siteUrl}/articles/${a.slug}`,
      },
    ],
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

      {/* Top Ad (if active in admin) */}
      {topAd && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <AdSlot ad={topAd} location="RESOURCE_PAGE" format="fluid" />
        </div>
      )}

      {/* Public Article Experience */}
      <ArticlePublicView
        article={a}
        authorName={authorName}
        tocItems={tocItems}
        readingTimeText={readingTimeText}
        prevArticle={prevArticle}
        nextArticle={nextArticle}
        topAd={topAd}
        inFeedAd={inFeedAd}
      />

      {/* Bottom Ad (if active in admin) */}
      {inFeedAd && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <AdSlot ad={inFeedAd} location="IN_FEED" format="auto" />
        </div>
      )}
    </>
  );
}
