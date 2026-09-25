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
import { useToast } from "@/components/ui/toast";

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
  const { showToast, confirm } = useToast();

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
        showToast({ message: enabled ? "Ads enabled across platform." : "All ads globally paused.", type: "success" });
      }
    } catch {
      showToast({ message: "Failed to update global ad status.", type: "error" });
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
        showToast({ message: auto ? "Auto-Ads enabled." : "Auto-Ads disabled.", type: "success" });
      }
    } catch {
      showToast({ message: "Failed to update Auto-Ads setting.", type: "error" });
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
        showToast({ message: "Failed to toggle ad placement status.", type: "error" });
      }
    } catch {
      setAds((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_active: currentActive } : item))
      );
      showToast({ message: "Network error updating ad slot.", type: "error" });
    }
  };

  // 1-Click Seed recommended high-earning placements
  const handleSeedDefaults = () => {
    confirm({
      title: "Generate Recommended Placements",
      message: "Automatically create recommended Google AdSense placements for Header, Sidebar, Download Page, and Footer?",
      confirmText: "Generate Slots",
      cancelText: "Cancel",
      variant: "primary",
      onConfirm: async () => {
        setSeeding(true);
        try {
          const res = await fetch("/api/admin/ads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "seed_defaults" }),
          });

          if (res.ok) {
            showToast({ message: "Standard high-earning ad slots generated successfully!", type: "success" });
            router.refresh();
            setTimeout(() => window.location.reload(), 800);
          } else {
            showToast({ message: "Failed to seed default placements", type: "error" });
          }
        } catch {
          showToast({ message: "Error generating ad slots", type: "error" });
        } finally {
          setSeeding(false);
        }
      },
    });
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

  const handleDelete = (id: string) => {
    confirm({
      title: "Delete Ad Placement",
      message: "Are you sure you want to permanently delete this ad placement?",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/admin/ads", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
          });
          if (res.ok) {
            setAds((prev) => prev.filter((item) => item.id !== id));
            showToast({ message: "Ad placement removed", type: "success" });
          } else {
            showToast({ message: "Failed to delete ad placement", type: "error" });
          }
        } catch {
          showToast({ message: "Error deleting ad placement", type: "error" });
        }
      },
    });
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
        <div className="p-6 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 backdrop-blur-xl shadow-xs space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Google AdSense Verification &amp; Account
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Publisher ID: <span className="font-mono font-semibold text-neutral-900 dark:text-white">{initialSettings.adsense_client_id}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {adsTxtStatus === "VERIFIED" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ads.txt Verified
                </span>
              )}
              {adsTxtStatus === "CHECKING" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 shadow-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Checking ads.txt...
                </span>
              )}
              <a
                href="/ads.txt"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-xs"
              >
                <span>View /ads.txt</span>
                <ExternalLink className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
              </a>
            </div>
          </div>

          {/* Master Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between shadow-xs">
              <div>
                <h4 className="text-xs font-semibold text-neutral-900 dark:text-white">Platform Master Ads Switch</h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Globally enable or pause all ad units</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={adsEnabled}
                  onChange={(e) => handleToggleGlobalAds(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between shadow-xs">
              <div>
                <h4 className="text-xs font-semibold text-neutral-900 dark:text-white">AdSense Auto-Ads</h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Allow Google AI automated in-page ads</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAds}
                  onChange={(e) => handleToggleAutoAds(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Quick Setup Actions Card */}
        <div className="p-6 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 backdrop-blur-xl shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FD1843]/10 text-[#FD1843] border border-[#FD1843]/20 mb-3">
              <Sparkles className="w-3 h-3" />
              <span>Earnings Acceleration</span>
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Recommended Placements Setup
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
              Initialize optimized slots (Header, Sidebar, Download Page, Footer) with one click.
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-400 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
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
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold transition-all cursor-pointer shadow-xs"
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
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Active Ad Placement Units ({ads.length})
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Toggle specific slots on/off instantly or adjust their embed code and priority.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold hover:bg-sky-400 transition-all shadow-xs cursor-pointer"
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
                      ? "border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 shadow-xs hover:border-sky-500/50"
                      : "border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/50 dark:bg-neutral-950/20 opacity-70"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                          {info.name}
                        </span>
                        <h4 className="font-bold text-sm text-neutral-900 dark:text-white mt-1.5 line-clamp-1">
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
                        <div className="w-9 h-5 bg-neutral-200 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {info.desc}
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        {info.rpm}
                      </span>
                      <span className="text-neutral-400 dark:text-neutral-600">•</span>
                      <span className="font-mono text-neutral-500 dark:text-neutral-400">
                        Provider: {ad.provider || "ADSENSE"}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Priority: <strong className="text-neutral-800 dark:text-neutral-200">{ad.priority}</strong>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(ad)}
                        className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="Edit Slot Configuration"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(ad.id)}
                        className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
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
      <div className="p-6 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-gradient-to-r from-neutral-50 via-white to-white dark:from-neutral-950/40 dark:via-neutral-900/40 dark:to-neutral-900/40 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
            NammaTech High-Yield AdSense Compliance Guidelines
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-neutral-600 dark:text-neutral-400">
          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
            <h5 className="font-semibold text-neutral-900 dark:text-white mb-1">Clear Differentiation</h5>
            <p>Every ad slot automatically includes an &quot;Advertisement&quot; label. Never disguise ads as fake download triggers.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
            <h5 className="font-semibold text-neutral-900 dark:text-white mb-1">Download Page Monetization</h5>
            <p>During download link verification, ads receive high attention. The countdown timer gives users value while maximizing ad viewability.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs">
            <h5 className="font-semibold text-neutral-900 dark:text-white mb-1">Zero Layout Shift</h5>
            <p>All containers include reserved CSS minimum heights so pages don&apos;t jump when Google ads dynamically populate.</p>
          </div>
        </div>
      </div>

      {/* 4. Edit / Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {editingAd ? "Configure Ad Placement" : "Create New Ad Placement"}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  Adjust slot dimensions, provider, and embed script.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Slot Label / Description *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Download Page Waiting Screen Unit"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Placement Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-xs"
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
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Ad Provider
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-xs"
                  >
                    <option value="ADSENSE">Google AdSense (Responsive)</option>
                    <option value="CUSTOM">Custom HTML / Script / Affiliate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white font-mono resize-none focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Priority (Higher loads first)
                  </label>
                  <input
                    type="number"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-xs"
                  />
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500"
                    />
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      Immediately Active
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-400 transition-all disabled:opacity-50 shadow-xs cursor-pointer"
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
