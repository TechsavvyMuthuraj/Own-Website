import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/types/database";
import { Newspaper, Calendar, Clock, Tag, ArrowLeft, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { AdSlot } from "@/components/ads/ad-slot";

export const revalidate = 120;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function estimateReadTime(content: string | null) {
  if (!content) return "2 min";
  const words = content.split(/\s+/).length;
  return `${Math.ceil(words / 200)} min read`;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("title, excerpt, thumbnail_url")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return { title: "Article Not Found | NammaTech" };
  return {
    title: `${data.title} | NammaTech`,
    description: data.excerpt || `Read ${data.title} on NammaTech`,
    openGraph: {
      title: data.title,
      description: data.excerpt || "",
      images: data.thumbnail_url ? [data.thumbnail_url] : [],
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();

  if (!article) notFound();

  const a = article as Article;

  const { data: related } = await supabase
    .from("articles")
    .select("id, title, slug, thumbnail_url, published_at, excerpt")
    .eq("status", "PUBLISHED")
    .neq("id", a.id)
    .order("published_at", { ascending: false })
    .limit(3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
        <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/articles" className="hover:text-[var(--foreground)] transition-colors">Articles</Link>
        <span>/</span>
        <span className="text-[var(--foreground)] truncate max-w-[200px] font-semibold">{a.title}</span>
      </nav>

      {/* Hero thumbnail */}
      {a.thumbnail_url && (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.thumbnail_url} alt={a.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Article header */}
      <header className="space-y-4">
        {a.tags && a.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {a.tags.map((t) => (
              <Link
                key={t}
                href={`/articles?tag=${encodeURIComponent(t)}`}
                className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
              >
                <Tag className="w-3 h-3 inline mr-1" />{t}
              </Link>
            ))}
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] leading-tight">{a.title}</h1>
        {a.excerpt && (
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed font-medium">{a.excerpt}</p>
        )}
        <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)] border-b border-[var(--border)] pb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(a.published_at || a.created_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {estimateReadTime(a.content)}
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            NammaTech
          </span>
        </div>
      </header>

      {/* AdSense top of article */}
      <AdSlot location="RESOURCE_PAGE" format="fluid" slotId="7836943657" />

      {/* Article Content */}
      <article>
        {a.content ? (
          <div className="text-sm text-[var(--foreground)] leading-relaxed space-y-4 whitespace-pre-wrap">
            {a.content}
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-[var(--border)] text-center text-sm text-[var(--muted-foreground)]">
            Content coming soon...
          </div>
        )}
      </article>

      {/* AdSense bottom */}
      <AdSlot location="IN_FEED" format="auto" slotId="8282064044" />

      {/* Related Articles */}
      {related && related.length > 0 && (
        <section className="space-y-4 border-t border-[var(--border)] pt-8">
          <h2 className="text-base font-bold text-[var(--foreground)]">More Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(related as any[]).map((r) => (
              <Link
                key={r.id}
                href={`/articles/${r.slug}`}
                className="group flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-blue-500/30 transition-all"
              >
                {r.thumbnail_url ? (
                  <div className="aspect-video overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.thumbnail_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="aspect-video bg-[var(--secondary)] flex items-center justify-center">
                    <Newspaper className="w-8 h-8 text-[var(--muted-foreground)]/30" />
                  </div>
                )}
                <div className="p-3">
                  <h3 className="text-xs font-bold text-[var(--foreground)] group-hover:text-blue-400 transition-colors line-clamp-2">{r.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back button */}
      <div className="pt-4 border-t border-[var(--border)]">
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-[var(--foreground)] hover:border-blue-500/30 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Articles
        </Link>
      </div>
    </div>
  );
}
