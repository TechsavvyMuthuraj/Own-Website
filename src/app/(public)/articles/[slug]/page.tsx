import React, { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Article } from "@/types/database";
import { Newspaper, Calendar, Clock, Tag, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { AdSlot } from "@/components/ads/ad-slot";

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
  const data = await getArticleBySlug(slug);
  if (!data) return { title: "Article Not Found | NammaTech" };
  return {
    title: `${data.title} | NammaTech Journal`,
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
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const a = article as Article;
  const supabase = createAdminClient();

  // Fetch author profile separately (no FK relationship exists in schema)
  let authorName = "NammaTech";
  if (a.author_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", a.author_id)
      .maybeSingle();
    if (profile?.full_name) authorName = profile.full_name;
  }

  const { data: related } = await supabase
    .from("articles")
    .select("id, title, slug, thumbnail_url, published_at, excerpt")
    .eq("status", "PUBLISHED")
    .neq("id", a.id)
    .order("published_at", { ascending: false })
    .limit(3);

  return (
    <div className="relative min-h-screen py-8 sm:py-12 overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-5 w-80 h-80 bg-yellow-500/8 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/articles" className="hover:text-amber-500 transition-colors">Articles</Link>
          <span>/</span>
          <span className="text-[var(--foreground)] truncate max-w-[240px] font-semibold">{a.title}</span>
        </nav>

        {/* Hero thumbnail */}
        {a.thumbnail_url && (
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-amber-500/20 bg-neutral-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.thumbnail_url} alt={a.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Article header card */}
        <header className="rounded-3xl border border-[var(--border)] bg-[var(--card)] backdrop-blur-md p-6 sm:p-8 space-y-4 shadow-xl">
          {a.tags && a.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {a.tags.map((t) => (
                <Link
                  key={t}
                  href={`/articles?tag=${encodeURIComponent(t)}`}
                  className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                >
                  <Tag className="w-3 h-3 inline mr-1" />{t}
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-2xl sm:text-4xl font-black text-[var(--foreground)] leading-tight tracking-tight">
            {a.title}
          </h1>

          {a.excerpt && (
            <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed font-medium">
              {a.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted-foreground)] border-t border-[var(--border)] pt-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              {formatDate(a.published_at || a.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              {estimateReadTime(a.content)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 text-amber-500 font-bold">✍</span>
              <span className="font-semibold text-[var(--foreground)]">{authorName}</span>
            </span>
          </div>
        </header>

        {/* AdSense top of article */}
        <AdSlot location="RESOURCE_PAGE" format="fluid" slotId="7836943657" />

        {/* Article Content */}
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--card)] backdrop-blur-md p-6 sm:p-10 shadow-xl">
          {a.content ? (
            a.content.trim().startsWith("<") ? (
              <div
                className="prose dark:prose-invert prose-sm sm:prose-base max-w-none
                  prose-headings:text-[var(--foreground)] prose-headings:font-bold
                  prose-p:text-[var(--foreground)]/85 prose-p:leading-relaxed
                  prose-a:text-amber-500 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-[var(--foreground)] prose-em:text-[var(--muted-foreground)]
                  prose-code:text-amber-500 prose-code:bg-[var(--secondary)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-[var(--secondary)] prose-pre:border prose-pre:border-[var(--border)] prose-pre:rounded-2xl
                  prose-blockquote:border-amber-500 prose-blockquote:bg-amber-500/5 prose-blockquote:rounded-r-xl prose-blockquote:text-[var(--muted-foreground)]
                  prose-img:rounded-2xl prose-img:shadow-xl
                  prose-ul:text-[var(--foreground)]/85 prose-ol:text-[var(--foreground)]/85
                  prose-li:text-[var(--foreground)]/85
                  prose-hr:border-[var(--border)]"
                dangerouslySetInnerHTML={{ __html: a.content }}
              />
            ) : (
              <div className="text-sm sm:text-base text-[var(--foreground)]/85 leading-relaxed space-y-6 whitespace-pre-wrap font-sans">
                {a.content}
              </div>
            )
          ) : (
            <div className="p-12 rounded-2xl border border-dashed border-[var(--border)] text-center text-sm text-[var(--muted-foreground)]">
              Content is being finalized by the editorial team. Check back soon!
            </div>
          )}
        </article>

        {/* AdSense bottom of article */}
        <AdSlot location="IN_FEED" format="auto" slotId="8282064044" />

        {/* Related Articles */}
        {related && related.length > 0 && (
          <section className="space-y-4 pt-4">
            <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-amber-500" />
              More from NammaTech Journal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {(related as any[]).map((r) => (
                <Link
                  key={r.id}
                  href={`/articles/${r.slug}`}
                  className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] backdrop-blur-md overflow-hidden hover:border-amber-500/40 hover:shadow-xl transition-all"
                >
                  {r.thumbnail_url ? (
                    <div className="aspect-video overflow-hidden bg-neutral-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={r.thumbnail_url}
                        alt={r.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-[var(--secondary)] flex items-center justify-center">
                      <Newspaper className="w-8 h-8 text-[var(--muted-foreground)]" />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3 className="text-xs font-bold text-[var(--foreground)] group-hover:text-amber-500 transition-colors line-clamp-2 leading-snug">
                      {r.title}
                    </h3>
                    <span className="text-[10px] text-[var(--muted-foreground)] pt-2 block">
                      {formatDate(r.published_at)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back navigation button */}
        <div className="pt-4 border-t border-[var(--border)]">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] text-xs font-bold text-[var(--foreground)] hover:text-amber-500 transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to All Articles
          </Link>
        </div>
      </div>
    </div>
  );
}
