"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Layers,
  Sparkles,
  User,
  Search,
  Sliders,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface HomepageClientProps {
  initialSettings: Record<string, any>;
}

export function HomepageClient({ initialSettings }: HomepageClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  // Hero & Search
  const [heroImageUrl, setHeroImageUrl] = useState(
    initialSettings.hero_image_url || "/images/hero-clean.png"
  );
  const [showSearchBar, setShowSearchBar] = useState(
    initialSettings.show_search_bar !== false
  );
  const [searchPlaceholder, setSearchPlaceholder] = useState(
    initialSettings.search_placeholder ||
      "Search software, movies, tools, APKs, templates..."
  );

  // Trending
  const [showTrending, setShowTrending] = useState(
    initialSettings.show_trending !== false
  );
  const [trendingLabel, setTrendingLabel] = useState(
    initialSettings.trending_label || "Trending:"
  );

  // Categories Section
  const [showCategories, setShowCategories] = useState(
    initialSettings.show_categories !== false
  );
  const [categoriesTitle, setCategoriesTitle] = useState(
    initialSettings.categories_title || "Browse by Category"
  );
  const [categoriesSubtitle, setCategoriesSubtitle] = useState(
    initialSettings.categories_subtitle ||
      "Find exactly what you need across organized classifications."
  );
  const [categoriesLimit, setCategoriesLimit] = useState(
    initialSettings.categories_limit || 8
  );

  // Featured Resources
  const [showFeatured, setShowFeatured] = useState(
    initialSettings.show_featured !== false
  );
  const [featuredTitle, setFeaturedTitle] = useState(
    initialSettings.featured_title || "Featured Resources"
  );
  const [featuredSubtitle, setFeaturedSubtitle] = useState(
    initialSettings.featured_subtitle ||
      "Hand-picked, high quality digital assets and software."
  );

  // Latest Releases
  const [showLatest, setShowLatest] = useState(
    initialSettings.show_latest !== false
  );
  const [latestTitle, setLatestTitle] = useState(
    initialSettings.latest_title || "Latest Additions"
  );
  const [latestSubtitle, setLatestSubtitle] = useState(
    initialSettings.latest_subtitle ||
      "Recently verified releases, updates, and open-source packages."
  );
  const [latestLimit, setLatestLimit] = useState(
    initialSettings.latest_limit || 8
  );

  // Founder Profile
  const [showFounder, setShowFounder] = useState(
    initialSettings.show_founder !== false
  );
  const [founderName, setFounderName] = useState(
    initialSettings.founder_name || "Muthuraj C"
  );
  const [founderTitle, setFounderTitle] = useState(
    initialSettings.founder_title || "Founder & Chief Executive Officer"
  );
  const [founderRole, setFounderRole] = useState(
    initialSettings.founder_role ||
      "Lead Software Architect • Digital Creator • Tech Entrepreneur"
  );
  const [founderBio, setFounderBio] = useState(
    initialSettings.founder_bio ||
      "Muthuraj C is a dedicated software developer, digital architect, and tech creator behind Techsavvy Muthuraj and NammaTech. Driven by a mission to build transparent, high-speed, and secure digital infrastructure, he engineered NammaTech to give developers, students, and digital creators direct access to verified software, open-source tools, developer utilities, and cinema media — zero deceptive ads, zero mock data, and 100% community-first trust."
  );
  const [founderImageUrl, setFounderImageUrl] = useState(
    initialSettings.founder_image_url || "/images/founder-muthuraj.png"
  );
  const [founderInstagram, setFounderInstagram] = useState(
    initialSettings.founder_instagram ||
      "https://www.instagram.com/techiemuthuraj/"
  );
  const [founderYoutube, setFounderYoutube] = useState(
    initialSettings.founder_youtube ||
      "https://youtube.com/@TechsavvyMuthuraj"
  );
  const [founderGithub, setFounderGithub] = useState(
    initialSettings.founder_github || "https://github.com/TechsavvyMuthuraj"
  );
  const [founderLinkedin, setFounderLinkedin] = useState(
    initialSettings.founder_linkedin ||
      "https://linkedin.com/in/techsavvymuthuraj"
  );
  const [founderTelegram, setFounderTelegram] = useState(
    initialSettings.founder_telegram || "https://t.me/techsavvymuthuraj"
  );

  // Ads
  const [showHomepageAd, setShowHomepageAd] = useState(
    initialSettings.show_homepage_ad !== false
  );
  const [showInFeedAd, setShowInFeedAd] = useState(
    initialSettings.show_in_feed_ad !== false
  );

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        homepage_settings: {
          hero_image_url: heroImageUrl.trim(),
          show_search_bar: showSearchBar,
          search_placeholder: searchPlaceholder.trim(),
          show_trending: showTrending,
          trending_label: trendingLabel.trim(),
          show_categories: showCategories,
          categories_title: categoriesTitle.trim(),
          categories_subtitle: categoriesSubtitle.trim(),
          categories_limit: Number(categoriesLimit) || 8,
          show_featured: showFeatured,
          featured_title: featuredTitle.trim(),
          featured_subtitle: featuredSubtitle.trim(),
          show_latest: showLatest,
          latest_title: latestTitle.trim(),
          latest_subtitle: latestSubtitle.trim(),
          latest_limit: Number(latestLimit) || 8,
          show_founder: showFounder,
          founder_name: founderName.trim(),
          founder_title: founderTitle.trim(),
          founder_role: founderRole.trim(),
          founder_bio: founderBio.trim(),
          founder_image_url: founderImageUrl.trim(),
          founder_instagram: founderInstagram.trim(),
          founder_youtube: founderYoutube.trim(),
          founder_github: founderGithub.trim(),
          founder_linkedin: founderLinkedin.trim(),
          founder_telegram: founderTelegram.trim(),
          show_homepage_ad: showHomepageAd,
          show_in_feed_ad: showInFeedAd,
        },
      };

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast({
          type: "success",
          title: "Homepage Saved! 🚀",
          message:
            "Homepage sections have been updated and are now live on the public site.",
        });
        router.refresh();
      } else {
        const data = await res.json();
        showToast({
          type: "error",
          title: "Save Failed",
          message: data.error || "Could not save homepage settings.",
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Failed to connect to admin settings server.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Top Bar with Quick Actions */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <Sliders className="w-4 h-4 text-amber-500" />
          <span>Real-time homepage section toggles and customizations</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] hover:bg-[var(--secondary)] text-xs font-semibold text-[var(--foreground)] transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-amber-500" />
            <span>Preview Site</span>
            <ExternalLink className="w-3 h-3 text-[var(--muted-foreground)]" />
          </a>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Homepage</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 1. HERO & SEARCH SECTION */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">
              1. Hero Banner & Search Bar
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Configure the top full-bleed graphic and search bar overlay.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              Hero Graphic Image Path / URL
            </label>
            <input
              type="text"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="/images/hero-clean.png"
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Default is `/images/hero-clean.png`. Supports local paths or external image URLs.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              Search Input Placeholder
            </label>
            <input
              type="text"
              value={searchPlaceholder}
              onChange={(e) => setSearchPlaceholder(e.target.value)}
              placeholder="Search software, movies, tools, APKs, templates..."
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--secondary)]/40 border border-[var(--border)]">
          <div>
            <p className="text-xs font-semibold text-[var(--foreground)]">
              Display Search Bar on Hero Banner
            </p>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Enables the interactive floating search input overlay on desktop and mobile.
            </p>
          </div>
          <input
            type="checkbox"
            checked={showSearchBar}
            onChange={(e) => setShowSearchBar(e.target.checked)}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* 2. TRENDING PILLS BAR */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">
              2. Trending Quick-Access Bar
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Quick access shortcut pills below the hero banner (Movies, Free Downloads, VIP, APKs).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              Trending Bar Prefix Label
            </label>
            <input
              type="text"
              value={trendingLabel}
              onChange={(e) => setTrendingLabel(e.target.value)}
              placeholder="Trending:"
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--secondary)]/40 border border-[var(--border)] mt-auto">
            <div>
              <p className="text-xs font-semibold text-[var(--foreground)]">
                Enable Trending Quick Bar
              </p>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Shows quick shortcuts to Movies, Free, and Premium.
              </p>
            </div>
            <input
              type="checkbox"
              checked={showTrending}
              onChange={(e) => setShowTrending(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 3. CATEGORIES SECTION */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">
                3. Categories Grid Section
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Classification tiles showing software, cinema, AI tools, APKs, etc.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">Visible</span>
            <input
              type="checkbox"
              checked={showCategories}
              onChange={(e) => setShowCategories(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              Section Title
            </label>
            <input
              type="text"
              value={categoriesTitle}
              onChange={(e) => setCategoriesTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              Section Subtitle
            </label>
            <input
              type="text"
              value={categoriesSubtitle}
              onChange={(e) => setCategoriesSubtitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              Categories Limit
            </label>
            <input
              type="number"
              value={categoriesLimit}
              onChange={(e) => setCategoriesLimit(Number(e.target.value))}
              min={2}
              max={24}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </div>
      </div>

      {/* 4. FEATURED RESOURCES SECTION */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">
                4. Featured Resources Section
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Hand-picked resources marked as featured in the Resources catalog.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">Visible</span>
            <input
              type="checkbox"
              checked={showFeatured}
              onChange={(e) => setShowFeatured(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              Section Title
            </label>
            <input
              type="text"
              value={featuredTitle}
              onChange={(e) => setFeaturedTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              Section Subtitle
            </label>
            <input
              type="text"
              value={featuredSubtitle}
              onChange={(e) => setFeaturedSubtitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </div>
      </div>

      {/* 5. LATEST RELEASES SECTION */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">
                5. Latest Additions Section
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Displays the newest published verified downloads.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">Visible</span>
            <input
              type="checkbox"
              checked={showLatest}
              onChange={(e) => setShowLatest(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              Section Title
            </label>
            <input
              type="text"
              value={latestTitle}
              onChange={(e) => setLatestTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              Section Subtitle
            </label>
            <input
              type="text"
              value={latestSubtitle}
              onChange={(e) => setLatestSubtitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              Items Limit
            </label>
            <input
              type="number"
              value={latestLimit}
              onChange={(e) => setLatestLimit(Number(e.target.value))}
              min={2}
              max={30}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </div>
      </div>

      {/* 6. FOUNDER PROFILE SECTION */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">
                6. Founder & CEO Profile Section
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Customize Muthuraj C&apos;s verified founder card at the bottom of the homepage.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)] font-medium">Visible</span>
            <input
              type="checkbox"
              checked={showFounder}
              onChange={(e) => setShowFounder(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              Founder Full Name
            </label>
            <input
              type="text"
              value={founderName}
              onChange={(e) => setFounderName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              Founder Title / Role
            </label>
            <input
              type="text"
              value={founderTitle}
              onChange={(e) => setFounderTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--foreground)]">
            Founder Tagline / Subtitle
          </label>
          <input
            type="text"
            value={founderRole}
            onChange={(e) => setFounderRole(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--foreground)]">
            Biography / Mission Statement
          </label>
          <textarea
            rows={4}
            value={founderBio}
            onChange={(e) => setFounderBio(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              Portrait Image URL
            </label>
            <input
              type="text"
              value={founderImageUrl}
              onChange={(e) => setFounderImageUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              Instagram Link
            </label>
            <input
              type="text"
              value={founderInstagram}
              onChange={(e) => setFounderInstagram(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              YouTube Channel Link
            </label>
            <input
              type="text"
              value={founderYoutube}
              onChange={(e) => setFounderYoutube(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              GitHub Profile Link
            </label>
            <input
              type="text"
              value={founderGithub}
              onChange={(e) => setFounderGithub(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              LinkedIn Link
            </label>
            <input
              type="text"
              value={founderLinkedin}
              onChange={(e) => setFounderLinkedin(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              Telegram Community Link
            </label>
            <input
              type="text"
              value={founderTelegram}
              onChange={(e) => setFounderTelegram(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/40 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </div>
      </div>

      {/* 7. AD PLACEMENTS TOGGLES */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">
              7. Homepage Ad Placements
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Control where Google AdSense and custom banner ads appear on the homepage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--secondary)]/40 border border-[var(--border)]">
            <div>
              <p className="text-xs font-semibold text-[var(--foreground)]">
                Top Homepage Feature Ad
              </p>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Shows banner below categories preview.
              </p>
            </div>
            <input
              type="checkbox"
              checked={showHomepageAd}
              onChange={(e) => setShowHomepageAd(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--secondary)]/40 border border-[var(--border)]">
            <div>
              <p className="text-xs font-semibold text-[var(--foreground)]">
                In-Feed Ad Placement
              </p>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Shows in-feed banner above the founder section.
              </p>
            </div>
            <input
              type="checkbox"
              checked={showInFeedAd}
              onChange={(e) => setShowInFeedAd(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Bottom Save Action */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] text-sm font-bold transition-all shadow-xl shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Publish Homepage</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
