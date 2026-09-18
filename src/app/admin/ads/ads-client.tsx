"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Power,
  ExternalLink,
  Sparkles,
  Layout,
  Layers,
  Smartphone,
  Info,
  Loader2,
  Eye,
  X,
} from "lucide-react";
import type { AdPlacement } from "@/types/database";
import { EmptyState } from "@/components/ui/empty-state";

interface AdsClientProps {
  initialAds: AdPlacement[];
  initialSettings: Record<string, any>;
}

export function AdsClient({ initialAds, initialSettings }: AdsClientProps) {
  const router = useRouter();

  const [ads, setAds] = useState<AdPlacement[]>(initialAds);
  const [adsEnabled, setAdsEnabled] = useState<boolean>(initialSettings.ads_enabled !== false);
  const [autoAds, setAutoAds] = useState<boolean>(initialSettings.adsense_auto_ads !== false);
  const [adsTxtStatus, setAdsTxtStatus] = useState<"VERIFIED" | "CHECKING" | "ERROR">("CHECKING");

  // Modal / Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdPlacement | null>(null);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState<string>("HEADER");
  const [provider, setProvider] = useState<string>("ADSENSE");
  const [adCode, setAdCode] = useState("");
  const [priority, setPriority] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Check /ads.txt live on mount
  useEffect(() => {
    async function checkAdsTxt() {
      try {
        const res = await fetch("/ads.txt");
        if (res.ok) {
          const text = await res.text();
          if (text.includes("pub-1960459798233871")) {
            setAdsTxtStatus("VERIFIED");
            return;
          }
        }
        setAdsTxtStatus("ERROR");
      } catch {
        setAdsTxtStatus("ERROR");
      }
    }
    checkAdsTxt();
  }, []);

  const openCreateModal = () => {
    setEditingAd(null);
    setTitle("");
    setLocation("HEADER");
    setProvider("ADSENSE");
    setAdCode("");
    setPriority("5");
    setIsActive(true);
    setErrorMsg("");
    setModalOpen(true);
  };

  const openEditModal = (ad: AdPlacement) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setLocation(ad.location);
    setProvider(ad.provider || "ADSENSE");
    setAdCode(ad.ad_code || "");
    setPriority(String(ad.priority || 0));
    setIsActive(ad.is_active);
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleToggleGlobalAds = async (enabled: boolean) => {
    setSavingSettings(true);
    setAdsEnabled(enabled);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_settings", ads_enabled: enabled }),
      });
      if (res.ok) {
        setSuccessMsg(enabled ? "Ads enabled across platform." : "All ads globally paused.");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch {
      alert("Failed to update global ad status.");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleAutoAds = async (auto: boolean) => {
    setSavingSettings(true);
    setAutoAds(auto);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_settings", adsense_auto_ads: auto }),
      });
      if (res.ok) {
        setSuccessMsg(auto ? "Auto-Ads enabled." : "Auto-Ads disabled.");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch {
      alert("Failed to update Auto-Ads setting.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Instant 1-click active/inactive toggle for individual slot
  const handleToggleSlot = async (id: string, currentActive: boolean) => {
    const nextState = !currentActive;
    setAds((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_active: nextState } : item))
    );

    try {
      const res = await fetch("/api/admin/ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: nextState }),
      });
      if (!res.ok) {
        // Revert on error
        setAds((prev) =>
          prev.map((item) => (item.id === id ? { ...item, is_active: currentActive } : item))
        );
        alert("Failed to toggle ad placement status.");
      }
    } catch {
      setAds((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_active: currentActive } : item))
      );
    }
  };

  // 1-Click Seed recommended high-earning placements
  const handleSeedDefaults = async () => {
    if (!confirm("Automatically create recommended Google AdSense placements for Header, Sidebar, Download Page, and Footer?")) {
      return;
    }

    setSeeding(true);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed_defaults" }),
      });

      if (res.ok) {
        setSuccessMsg("Standard high-earning ad slots generated successfully!");
        router.refresh();
        setTimeout(() => window.location.reload(), 800);
      } else {
        alert("Failed to seed default placements.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setSeeding(false);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Title is required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      if (editingAd) {
        // Update existing
        const res = await fetch("/api/admin/ads", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingAd.id,
            title: title.trim(),
            location,
            provider,
            ad_code: adCode.trim(),
            priority: Number(priority) || 0,
            is_active: isActive,
          }),
        });

        if (res.ok) {
          setModalOpen(false);
          setSuccessMsg("Ad placement updated successfully.");
          router.refresh();
          setTimeout(() => window.location.reload(), 600);
        } else {
          const data = await res.json();
          setErrorMsg(data.error || "Failed to update ad.");
        }
      } else {
        // Create new
        const res = await fetch("/api/admin/ads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            location,
            provider,
            ad_code: adCode.trim(),
            priority: Number(priority) || 0,
            is_active: isActive,
          }),
        });

        if (res.ok) {
          setModalOpen(false);
          setSuccessMsg("New ad placement created successfully.");
          router.refresh();
          setTimeout(() => window.location.reload(), 600);
        } else {
          const data = await res.json();
          setErrorMsg(data.error || "Failed to create ad.");
        }
      }
    } catch {
      setErrorMsg("Network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this ad placement?")) return;
    try {
      const res = await fetch("/api/admin/ads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setAds((prev) => prev.filter((item) => item.id !== id));
        setSuccessMsg("Ad placement removed.");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch {
      alert("Error deleting ad placement.");
    }
  };

  const locationLabels: Record<string, { name: string; desc: string; rpm: string }> = {
    HEADER: {
      name: "Header Leaderboard",
      desc: "Prominent top banner below navigation across all pages (728x90 / responsive)",
      rpm: "High Viewability",
    },
    SIDEBAR: {
      name: "Resource Detail Sidebar",
      desc: "Sticky desktop sidebar unit adjacent to product details (300x250 / 300x600)",
      rpm: "Strong CTR",
    },
    DOWNLOAD_PAGE: {
      name: "Download Unlock Screen",
      desc: "Prime placement displayed while users await verification and download links",
      rpm: "🔥 Maximum RPM",
    },
    IN_FEED: {
      name: "In-Feed Catalog Native",
      desc: "Native card unit positioned naturally inside resource search and category grids",
      rpm: "High Engagement",
    },
    HOMEPAGE: {
      name: "Homepage Feature",
      desc: "Mid-page banner between hero and resource classifications",
      rpm: "Broad Reach",
    },
    FOOTER: {
      name: "Footer Leaderboard",
      desc: "Above-footer horizontal banner for bottom-page readers",
      rpm: "Steady Impressions",
    },
  };

  return (
    <div className="space-y-8">
      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Global AdSense & Monetization Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AdSense Publisher Credentials Card */}
        <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)]">
                  Google AdSense Verification &amp; Account
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Publisher ID: <span className="font-mono font-semibold text-[var(--foreground)]">{initialSettings.adsense_client_id}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {adsTxtStatus === "VERIFIED" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ads.txt Verified
                </span>
              )}
              {adsTxtStatus === "CHECKING" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Checking ads.txt...
                </span>
              )}
              <a
                href="/ads.txt"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors"
              >
                <span>View /ads.txt</span>
                <ExternalLink className="w-3 h-3 text-[var(--muted-foreground)]" />
              </a>
            </div>
          </div>

          {/* Master Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[var(--secondary)]/50 border border-[var(--border)] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-[var(--foreground)]">Platform Master Ads Switch</h4>
                <p className="text-[11px] text-[var(--muted-foreground)]">Globally enable or pause all ad units</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={adsEnabled}
                  onChange={(e) => handleToggleGlobalAds(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--secondary)]/50 border border-[var(--border)] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-[var(--foreground)]">AdSense Auto-Ads</h4>
                <p className="text-[11px] text-[var(--muted-foreground)]">Allow Google AI automated in-page ads</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAds}
                  onChange={(e) => handleToggleAutoAds(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Quick Setup Actions Card */}
        <div className="p-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FD1843]/10 text-[#FD1843] border border-[#FD1843]/20 mb-3">
              <Sparkles className="w-3 h-3" />
              <span>Earnings Acceleration</span>
            </div>
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              Recommended Placements Setup
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Initialize optimized slots (Header, Sidebar, Download Page, Footer) with one click.
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all shadow-sm disabled:opacity-50"
            >
              {seeding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>{seeding ? "Generating..." : "Generate Recommended Slots"}</span>
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--secondary)] text-[var(--foreground)] text-xs font-semibold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Custom Ad Placement</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Placements Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)]">
              Active Ad Placement Units ({ads.length})
            </h3>
            <p className="text-xs text-[var(--muted-foreground)]">
              Toggle specific slots on/off instantly or adjust their embed code and priority.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Slot</span>
          </button>
        </div>

        {ads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ads.map((ad) => {
              const info = locationLabels[ad.location] || {
                name: ad.location,
                desc: "Custom placement",
                rpm: "Active",
              };

              return (
                <div
                  key={ad.id}
                  className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                    ad.is_active
                      ? "border-[var(--border)] bg-[var(--card)] shadow-sm hover:border-[var(--ring)]/50"
                      : "border-[var(--border)]/50 bg-[var(--secondary)]/20 opacity-70"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)]">
                          {info.name}
                        </span>
                        <h4 className="font-bold text-sm text-[var(--foreground)] mt-1.5 line-clamp-1">
                          {ad.title}
                        </h4>
                      </div>

                      {/* Instant Toggle */}
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={ad.is_active}
                          onChange={() => handleToggleSlot(ad.id, ad.is_active)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      {info.desc}
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {info.rpm}
                      </span>
                      <span className="text-[var(--muted-foreground)]">•</span>
                      <span className="font-mono text-[var(--muted-foreground)]">
                        Provider: {ad.provider || "ADSENSE"}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[var(--muted-foreground)]">
                      Priority: <strong className="text-[var(--foreground)]">{ad.priority}</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(ad)}
                        className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] transition-colors"
                        title="Edit Slot Configuration"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(ad.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete Placement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={DollarSign}
            title="No ad placements created yet"
            description="Generate standard AdSense responsive placements in 1 click or add custom sponsor slots."
            actionText="Generate Recommended Slots"
            onAction={handleSeedDefaults}
          />
        )}
      </div>

      {/* 3. Monetization Best Practices Card */}
      <div className="p-6 rounded-3xl border border-[var(--border)] bg-gradient-to-r from-[var(--secondary)]/40 via-[var(--card)] to-[var(--card)] shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <h4 className="text-sm font-bold text-[var(--foreground)]">
            NammaTech High-Yield AdSense Compliance Guidelines
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[var(--muted-foreground)]">
          <div className="p-3.5 rounded-2xl bg-[var(--background)]/60 border border-[var(--border)]">
            <h5 className="font-semibold text-[var(--foreground)] mb-1">Clear Differentiation</h5>
            <p>Every ad slot automatically includes an &quot;Advertisement&quot; label. Never disguise ads as fake download triggers.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--background)]/60 border border-[var(--border)]">
            <h5 className="font-semibold text-[var(--foreground)] mb-1">Download Page Monetization</h5>
            <p>During download link verification, ads receive high attention. The countdown timer gives users value while maximizing ad viewability.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[var(--background)]/60 border border-[var(--border)]">
            <h5 className="font-semibold text-[var(--foreground)] mb-1">Zero Layout Shift</h5>
            <p>All containers include reserved CSS minimum heights so pages don&apos;t jump when Google ads dynamically populate.</p>
          </div>
        </div>
      </div>

      {/* 4. Edit / Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  {editingAd ? "Configure Ad Placement" : "Create New Ad Placement"}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Adjust slot dimensions, provider, and embed script.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                  Slot Label / Description *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Download Page Waiting Screen Unit"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Placement Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)]"
                  >
                    <option value="HEADER">Header Leaderboard (Top)</option>
                    <option value="SIDEBAR">Detail Page Sidebar</option>
                    <option value="DOWNLOAD_PAGE">Download Unlock Screen (High RPM)</option>
                    <option value="IN_FEED">In-Feed Catalog Native</option>
                    <option value="HOMEPAGE">Homepage Showcase</option>
                    <option value="FOOTER">Above-Footer Leaderboard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Ad Provider
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)]"
                  >
                    <option value="ADSENSE">Google AdSense (Responsive)</option>
                    <option value="CUSTOM">Custom HTML / Script / Affiliate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                  Embed Code / Unit Config
                </label>
                <textarea
                  rows={4}
                  value={adCode}
                  onChange={(e) => setAdCode(e.target.value)}
                  placeholder={
                    provider === "ADSENSE"
                      ? "<!-- Leave blank to use standard responsive AdSense unit, or paste custom <ins> snippet -->"
                      : "<!-- Paste custom HTML banner, iframe, or affiliate embed code -->"
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--foreground)] font-mono resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                    Priority (Higher loads first)
                  </label>
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-xs font-mono"
                  />
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[var(--primary)] focus:ring-[var(--ring)]"
                    />
                    <span className="text-xs font-semibold text-[var(--foreground)]">
                      Immediately Active
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-medium text-[var(--foreground)] hover:bg-[var(--secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>{editingAd ? "Save Changes" : "Create Placement"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
