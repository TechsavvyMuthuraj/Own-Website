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
  Compass,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  RotateCcw,
  Play,
  Tv,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

export interface NavbarMenuItem {
  id: string;
  label: string;
  href: string;
  active: boolean;
  badge?: string;
}

export const DEFAULT_NAVBAR_ITEMS: NavbarMenuItem[] = [
  { id: "nav-home", label: "Home", href: "/", active: true },
  { id: "nav-movies", label: "Movies", href: "/movies", active: true, badge: "HOT" },
  { id: "nav-categories", label: "Categories", href: "/categories", active: true },
  { id: "nav-free", label: "Free", href: "/free", active: true, badge: "FREE" },
  { id: "nav-new", label: "New & Updated", href: "/new-and-updated", active: true },
  { id: "nav-articles", label: "Articles", href: "/articles", active: true },
  { id: "nav-premium", label: "Premium", href: "/premium", active: true, badge: "VIP" },
  { id: "nav-request", label: "Request", href: "/request", active: true },
  { id: "nav-contact", label: "Contact", href: "/contact", active: true, badge: "LIVE" },
];

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
  const [heroTitle, setHeroTitle] = useState(
    initialSettings.hero_title || "Explore High Performance Computing Resources"
  );
  const [heroSubtitle, setHeroSubtitle] = useState(
    initialSettings.hero_subtitle || "Curated, verified, virus-free tools, repacks, and development utilities."
  );
  const [showSearchBar, setShowSearchBar] = useState(
    initialSettings.show_search_bar !== false
  );
  const [searchPlaceholder, setSearchPlaceholder] = useState(
    initialSettings.search_placeholder ||
      "Search software, movies, tools, APKs, templates..."
  );

  // Navbar / Menubar navigation links state & operations
  const [navbarItems, setNavbarItems] = useState<NavbarMenuItem[]>(() => {
    if (
      initialSettings.navbar_items &&
      Array.isArray(initialSettings.navbar_items) &&
      initialSettings.navbar_items.length > 0
    ) {
      const items: NavbarMenuItem[] = initialSettings.navbar_items;
      const hrefs = new Set(items.map((i) => i.href));
      const merged = [...items];
      for (const def of DEFAULT_NAVBAR_ITEMS) {
        if (!hrefs.has(def.href)) {
          merged.push(def);
        }
      }
      return merged;
    }
    return DEFAULT_NAVBAR_ITEMS;
  });

  const moveNavbarItemUp = (index: number) => {
    if (index === 0) return;
    setNavbarItems((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const moveNavbarItemDown = (index: number) => {
    if (index === navbarItems.length - 1) return;
    setNavbarItems((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const updateNavbarItem = (index: number, field: keyof NavbarMenuItem, value: any) => {
    setNavbarItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const toggleNavbarItem = (index: number) => {
    setNavbarItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], active: !next[index].active };
      return next;
    });
  };

  const addNavbarItem = () => {
    const newId = `nav-custom-${Date.now()}`;
    setNavbarItems((prev) => [
      ...prev,
      { id: newId, label: "Custom Link", href: "/explore", active: true, badge: "" },
    ]);
  };

  const deleteNavbarItem = (index: number) => {
    setNavbarItems((prev) => prev.filter((_, i) => i !== index));
  };

  const resetNavbarItems = () => {
    setNavbarItems(DEFAULT_NAVBAR_ITEMS);
  };

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
    initialSettings.founder_image_url || "/images/founder-muthuraj.webp"
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

  // YouTube Showcase
  const [showYoutubeShowcase, setShowYoutubeShowcase] = useState(
    initialSettings.show_youtube_showcase !== false
  );
  const [youtubeChannelName, setYoutubeChannelName] = useState(
    initialSettings.youtube_channel_name || "Techsavvy Muthuraj"
  );
  const [youtubeChannelId, setYoutubeChannelId] = useState(
    initialSettings.youtube_channel_id || "UCavl9VKjbVWJBsqlVaCiIsw"
  );
  const [youtubeHandle, setYoutubeHandle] = useState(
    initialSettings.youtube_handle || "@TechsavvyMuthuraj"
  );
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState(
    initialSettings.youtube_channel_url ||
      "https://www.youtube.com/channel/UCavl9VKjbVWJBsqlVaCiIsw"
  );
  const [youtubeSubtitle, setYoutubeSubtitle] = useState(
    initialSettings.youtube_subtitle ||
      "Muthuraj C • Tech Creator, Software Architect & YouTuber"
  );
  const [youtubeTags, setYoutubeTags] = useState(
    initialSettings.youtube_tags ||
      "PC Optimization • Android APKs • Open-Source Utilities • Coding"
  );

  // Instagram Showcase
  const [showInstagramShowcase, setShowInstagramShowcase] = useState(
    initialSettings.show_instagram_showcase !== false
  );
  const [instagramHandle, setInstagramHandle] = useState(
    initialSettings.instagram_handle || "@techiemuthuraj"
  );
  const [instagramName, setInstagramName] = useState(
    initialSettings.instagram_name ||
      "Muthuraj C • Tech Creator, Software Architect & Founder"
  );
  const [instagramUrl, setInstagramUrl] = useState(
    initialSettings.instagram_url || "https://www.instagram.com/techiemuthuraj/"
  );
  const [instagramBioTags, setInstagramBioTags] = useState(
    initialSettings.instagram_bio_tags ||
      "Daily Tech Reels • Software Tutorials • Cinema News"
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
          navbar_items: navbarItems,
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
          show_youtube_showcase: showYoutubeShowcase,
          youtube_channel_name: youtubeChannelName.trim(),
          youtube_channel_id: youtubeChannelId.trim(),
          youtube_handle: youtubeHandle.trim(),
          youtube_channel_url: youtubeChannelUrl.trim(),
          youtube_subtitle: youtubeSubtitle.trim(),
          youtube_tags: youtubeTags.trim(),
          show_instagram_showcase: showInstagramShowcase,
          instagram_handle: instagramHandle.trim(),
          instagram_name: instagramName.trim(),
          instagram_url: instagramUrl.trim(),
          instagram_bio_tags: instagramBioTags.trim(),
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
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("nammatech-nav-updated"));
        }
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
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-neutral-900/40 border border-neutral-200/90 dark:border-neutral-800/80 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
          <Sliders className="w-4 h-4 text-amber-500" />
          <span>Real-time homepage section toggles and customizations</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 transition-colors shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-amber-500" />
            <span>Preview Site</span>
            <ExternalLink className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
          </a>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
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
      <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-neutral-200/80 dark:border-neutral-800/80 pb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              1. Hero Banner & Search Bar
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Configure the top full-bleed graphic and search bar overlay.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Hero Graphic Image Path / URL
            </label>
            <input
              type="text"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="/images/hero-clean.png"
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Default is `/images/hero-clean.png`. Supports local paths or external image URLs.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Search Input Placeholder
            </label>
            <input
              type="text"
              value={searchPlaceholder}
              onChange={(e) => setSearchPlaceholder(e.target.value)}
              placeholder="Search software, movies, tools, APKs, templates..."
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50/80 dark:bg-neutral-950/60 border border-neutral-200/90 dark:border-neutral-800/80">
          <div>
            <p className="text-xs font-semibold text-neutral-900 dark:text-white">
              Display Search Bar on Hero Banner
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
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

      {/* 2. HEADER NAVBAR / MENUBAR SECTION (ADJUST ORDER & EDIT LINKS) */}
      <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 pb-4 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                2. Header Navbar / Menubar (Adjust Priority Order & Links)
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Rearrange priority order, change menu names, edit destination links, set badges (HOT, VIP, FREE), and toggle visibility.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetNavbarItems}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={addNavbarItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Menu Item</span>
            </button>
          </div>
        </div>

        {/* Live Preview of Header Navbar */}
        <div className="p-4 rounded-2xl bg-neutral-50/80 dark:bg-neutral-950/60 border border-neutral-200/90 dark:border-neutral-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            <span>Live Header Navbar Preview</span>
            <span className="text-[10px] text-amber-500 lowercase font-medium">updates in real-time</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto py-2 px-1">
            {navbarItems
              .filter((item) => item.active)
              .map((item, i) => (
                <div
                  key={item.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    i === 0
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold"
                      : "bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800"
                  } whitespace-nowrap shadow-xs`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Editable Menu Items List */}
        <div className="space-y-3">
          {navbarItems.map((item, index) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all ${
                item.active
                  ? "border-neutral-200/90 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-neutral-950/40"
                  : "border-dashed border-neutral-300 dark:border-neutral-800 bg-neutral-100/40 dark:bg-neutral-950/20 opacity-65"
              } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
            >
              {/* Order & Priority Controls */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-mono text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  {index + 1}
                </div>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveNavbarItemUp(index)}
                    title="Move higher in priority"
                    className="p-1 rounded bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={index === navbarItems.length - 1}
                    onClick={() => moveNavbarItemDown(index)}
                    title="Move lower in priority"
                    className="p-1 rounded bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Editable Fields: Label, Link, Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 w-full sm:w-auto">
                <div>
                  <label className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase block mb-1">
                    Menu Label
                  </label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateNavbarItem(index, "label", e.target.value)}
                    placeholder="Label (e.g. Movies)"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase block mb-1">
                    Destination URL / Route
                  </label>
                  <input
                    type="text"
                    value={item.href}
                    onChange={(e) => updateNavbarItem(index, "href", e.target.value)}
                    placeholder="/movies or https://..."
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white font-mono placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase block mb-1">
                    Highlight Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={item.badge || ""}
                    onChange={(e) => updateNavbarItem(index, "badge", e.target.value)}
                    placeholder="e.g. HOT, VIP, NEW, FREE"
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white uppercase placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={item.active}
                    onChange={() => toggleNavbarItem(index)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    {item.active ? "Active" : "Hidden"}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => deleteNavbarItem(index)}
                  title="Delete menu item"
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. TRENDING PILLS BAR */}
      <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-neutral-200/80 dark:border-neutral-800/80 pb-4">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              3. Trending Quick-Access Bar
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Quick access shortcut pills below the hero banner (Movies, Free Downloads, VIP, APKs).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Trending Bar Prefix Label
            </label>
            <input
              type="text"
              value={trendingLabel}
              onChange={(e) => setTrendingLabel(e.target.value)}
              placeholder="Trending:"
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50/80 dark:bg-neutral-950/60 border border-neutral-200/90 dark:border-neutral-800/80 mt-auto">
            <div>
              <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                Enable Trending Quick Bar
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
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

      {/* 4. CATEGORIES SECTION */}
      <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                4. Categories Grid Section
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Classification tiles showing software, cinema, AI tools, APKs, etc.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Visible</span>
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
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Section Title
            </label>
            <input
              type="text"
              value={categoriesTitle}
              onChange={(e) => setCategoriesTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Section Subtitle
            </label>
            <input
              type="text"
              value={categoriesSubtitle}
              onChange={(e) => setCategoriesSubtitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Categories Limit
            </label>
            <input
              type="number"
              value={categoriesLimit}
              onChange={(e) => setCategoriesLimit(Number(e.target.value))}
              min={2}
              max={24}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* 5. FEATURED RESOURCES SECTION */}
      <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                5. Featured Resources Section
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Hand-picked resources marked as featured in the Resources catalog.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Visible</span>
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
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Section Title
            </label>
            <input
              type="text"
              value={featuredTitle}
              onChange={(e) => setFeaturedTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Section Subtitle
            </label>
            <input
              type="text"
              value={featuredSubtitle}
              onChange={(e) => setFeaturedSubtitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* 6. LATEST RELEASES SECTION */}
      <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                6. Latest Additions Section
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Displays the newest published verified downloads.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Visible</span>
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
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Section Title
            </label>
            <input
              type="text"
              value={latestTitle}
              onChange={(e) => setLatestTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Section Subtitle
            </label>
            <input
              type="text"
              value={latestSubtitle}
              onChange={(e) => setLatestSubtitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Items Limit
            </label>
            <input
              type="number"
              value={latestLimit}
              onChange={(e) => setLatestLimit(Number(e.target.value))}
              min={2}
              max={30}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* 7. FOUNDER PROFILE SECTION */}
      <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                7. Founder & CEO Profile Section
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Customize Muthuraj C&apos;s verified founder card at the bottom of the homepage.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Visible</span>
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
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Founder Full Name
            </label>
            <input
              type="text"
              value={founderName}
              onChange={(e) => setFounderName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Founder Title / Role
            </label>
            <input
              type="text"
              value={founderTitle}
              onChange={(e) => setFounderTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Founder Tagline / Subtitle
          </label>
          <input
            type="text"
            value={founderRole}
            onChange={(e) => setFounderRole(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Biography / Mission Statement
          </label>
          <textarea
            rows={4}
            value={founderBio}
            onChange={(e) => setFounderBio(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Portrait Image URL
            </label>
            <input
              type="text"
              value={founderImageUrl}
              onChange={(e) => setFounderImageUrl(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Instagram Link
            </label>
            <input
              type="text"
              value={founderInstagram}
              onChange={(e) => setFounderInstagram(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              YouTube Channel Link
            </label>
            <input
              type="text"
              value={founderYoutube}
              onChange={(e) => setFounderYoutube(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              GitHub Profile Link
            </label>
            <input
              type="text"
              value={founderGithub}
              onChange={(e) => setFounderGithub(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              LinkedIn Link
            </label>
            <input
              type="text"
              value={founderLinkedin}
              onChange={(e) => setFounderLinkedin(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Telegram Community Link
            </label>
            <input
              type="text"
              value={founderTelegram}
              onChange={(e) => setFounderTelegram(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/80 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* 8. YOUTUBE CHANNEL SHOWCASE */}
      <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                8. YouTube Channel Showcase
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Manage your YouTube channel showcase, handle, channel ID, and title displayed on the homepage.
              </p>
            </div>
          </div>
        </div>

        {/* YouTube Showcase Settings */}
        <div className="p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-950/60 border border-neutral-200/90 dark:border-neutral-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                YouTube Channel Showcase
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Visible</span>
              <input
                type="checkbox"
                checked={showYoutubeShowcase}
                onChange={(e) => setShowYoutubeShowcase(e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Channel Name
              </label>
              <input
                type="text"
                value={youtubeChannelName}
                onChange={(e) => setYoutubeChannelName(e.target.value)}
                placeholder="Techie Muthuraj"
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Channel Handle
              </label>
              <input
                type="text"
                value={youtubeHandle}
                onChange={(e) => setYoutubeHandle(e.target.value)}
                placeholder="@techiemuthuraj"
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Channel ID
              </label>
              <input
                type="text"
                value={youtubeChannelId}
                onChange={(e) => setYoutubeChannelId(e.target.value)}
                placeholder="UCavl9VKjbVWJBsqlVaCiIsw"
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Full YouTube URL
            </label>
            <input
              type="text"
              value={youtubeChannelUrl}
              onChange={(e) => setYoutubeChannelUrl(e.target.value)}
              placeholder="https://www.youtube.com/channel/UCavl9VKjbVWJBsqlVaCiIsw"
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Channel Subtitle / Bio
              </label>
              <input
                type="text"
                value={youtubeSubtitle}
                onChange={(e) => setYoutubeSubtitle(e.target.value)}
                placeholder="Muthuraj C • Tech Creator, Software Architect & YouTuber"
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Topic Tags / Badges
              </label>
              <input
                type="text"
                value={youtubeTags}
                onChange={(e) => setYoutubeTags(e.target.value)}
                placeholder="OBS Studio • PC Optimization • Open-Source Utilities • Coding"
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 9. AD PLACEMENTS TOGGLES */}
      <div className="rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-3 border-b border-neutral-200/80 dark:border-neutral-800/80 pb-4">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">
              9. Homepage Ad Placements
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Control where Google AdSense and custom banner ads appear on the homepage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50/80 dark:bg-neutral-950/60 border border-neutral-200/90 dark:border-neutral-800/80">
            <div>
              <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                Top Homepage Feature Ad
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
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

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-50/80 dark:bg-neutral-950/60 border border-neutral-200/90 dark:border-neutral-800/80">
            <div>
              <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                In-Feed Ad Placement
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
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
          className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-sm font-bold transition-all shadow-xl shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
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
