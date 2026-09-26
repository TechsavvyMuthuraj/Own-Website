"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  ShieldCheck,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  ExternalLink,
  Copy,
  Check,
  Code,
  Sparkles,
  Layers,
  FileText,
  AlertCircle,
  Save,
  CheckCircle2,
  Lock,
  Layout,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Calendar,
  Eye,
  MousePointerClick,
  Activity,
  Radio,
  Flame,
  Star,
  Play,
  Sliders,
  EyeOff,
} from "lucide-react";
import type { AdsterraConfig, AdsterraStatsSummary, AdsterraStatRow } from "@/config/adsterra";
import { DEFAULT_ADSTERRA_CONFIG, ADSTERRA_ASSETS, ADSTERRA_API_CONFIG } from "@/config/adsterra";
import { useToast } from "@/components/ui/toast";

interface AdsterraPanelProps {
  initialConfig?: AdsterraConfig;
  globalAdsEnabled: boolean;
  onToggleGlobalAds: (enabled: boolean) => Promise<void>;
}

export function AdsterraPanel({
  initialConfig,
  globalAdsEnabled,
  onToggleGlobalAds,
}: AdsterraPanelProps) {
  const [config, setConfig] = useState<AdsterraConfig>(
    initialConfig || DEFAULT_ADSTERRA_CONFIG
  );
  const [saving, setSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { showToast } = useToast();

  // ── Adsterra Live Performance & Revenue Analytics State ──
  const [stats, setStats] = useState<AdsterraStatsSummary | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<"today" | "7d" | "30d" | "month">("30d");
  const [selectedGroupBy, setSelectedGroupBy] = useState<"placement" | "date" | "country" | "domain">("placement");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const getDatesForPreset = (preset: "today" | "7d" | "30d" | "month") => {
    const today = new Date();
    const finish = today.toISOString().split("T")[0];
    let start = finish;

    if (preset === "today") {
      start = finish;
    } else if (preset === "7d") {
      const d = new Date();
      d.setDate(today.getDate() - 7);
      start = d.toISOString().split("T")[0];
    } else if (preset === "30d") {
      const d = new Date();
      d.setDate(today.getDate() - 30);
      start = d.toISOString().split("T")[0];
    } else if (preset === "month") {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      start = d.toISOString().split("T")[0];
    }
    return { start, finish };
  };

  const fetchAdsterraStats = async (
    preset = selectedPreset,
    groupBy = selectedGroupBy,
    forceRefresh = false
  ) => {
    if (forceRefresh) setRefreshing(true);
    else setLoadingStats(true);
    setStatsError(null);

    try {
      const { start, finish } = getDatesForPreset(preset);
      const url = `/api/admin/ads/adsterra-stats?start_date=${start}&finish_date=${finish}&group_by=${groupBy}${
        forceRefresh ? "&refresh=true" : ""
      }`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load Adsterra stats");
      }

      setStats(data.summary);
    } catch (err: any) {
      setStatsError(err.message || "Failed to load live statistics");
    } finally {
      setLoadingStats(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdsterraStats(selectedPreset, selectedGroupBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPreset, selectedGroupBy]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast({ message: "Copied to clipboard", type: "success" });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggle = async (
    key: keyof AdsterraConfig | keyof AdsterraConfig["placements"],
    isPlacement = false
  ) => {
    const updated: AdsterraConfig = isPlacement
      ? {
          ...config,
          placements: {
            ...config.placements,
            [key]: !config.placements[key as keyof AdsterraConfig["placements"]],
          },
        }
      : {
          ...config,
          [key]: !config[key as keyof AdsterraConfig],
        };

    setConfig(updated);
    await saveSettings(updated);
  };

  const saveSettings = async (settingsToSave: AdsterraConfig) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_adsterra_settings",
          adsterra_settings: settingsToSave,
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      showToast({
        message: "Adsterra configuration updated successfully.",
        type: "success",
      });
    } catch (err: any) {
      showToast({
        message: err.message || "Failed to update Adsterra settings.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const [previewZoneKey, setPreviewZoneKey] = useState<string | null>(null);

  const handleTestPopup = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-adsterra-popup"));
      showToast({ message: "Triggered live Pop-Up Ad modal!", type: "info" });
    }
  };

  const bannerZones = [
    { name: "Desktop Leaderboard", dims: "728x90", width: 728, height: 90, key: ADSTERRA_ASSETS.bannerZones.leaderboard_728x90.key, format: "iframe" },
    { name: "Medium Rectangle", dims: "300x250", width: 300, height: 250, key: ADSTERRA_ASSETS.bannerZones.rectangle_300x250.key, format: "iframe" },
    { name: "Mobile Banner", dims: "320x50", width: 320, height: 50, key: ADSTERRA_ASSETS.bannerZones.mobile_320x50.key, format: "iframe" },
    { name: "Standard Banner", dims: "468x60", width: 468, height: 60, key: ADSTERRA_ASSETS.bannerZones.banner_468x60.key, format: "iframe" },
    { name: "Vertical Mini", dims: "160x300", width: 160, height: 300, key: ADSTERRA_ASSETS.bannerZones.vertical_160x300.key, format: "iframe" },
    { name: "Skyscraper", dims: "160x600", width: 160, height: 600, key: ADSTERRA_ASSETS.bannerZones.skyscraper_160x600.key, format: "iframe" },
  ];

  return (
    <div className="space-y-8">
      {/* ── Top Level Asset Intelligence & Security Bar ── */}
      <div className="p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-neutral-900/60 to-neutral-950 text-neutral-100 shadow-sm relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Adsterra Monetization Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Full Publisher Asset Inventory</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Equipped with all official Adsterra monetization assets: 3 Direct Smartlinks, 2 Provider Global Scripts, Native Container Widget, and 6 Iframe Banner Zones (728x90, 300x250, 320x50, 468x60, 160x300, 160x600).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-xs font-medium text-neutral-300 flex items-center gap-2 shadow-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Restricted Routes Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 0. LIVE ADSTERRA PERFORMANCE & EARNINGS DASHBOARD (OFFICIAL API) ── */}
      <div className="p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-neutral-900/70 to-neutral-950 text-neutral-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-neutral-800/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Official Publisher API Live Connected
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <span>Real-Time Adsterra Performance &amp; Revenue</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-1">
              Live earnings, impressions, CTR, and CPM streamed directly from Adsterra Publisher API (Token:{" "}
              <code className="px-1.5 py-0.5 rounded bg-neutral-800 font-mono text-[11px] text-amber-300">
                {ADSTERRA_API_CONFIG.maskedKey}
              </code>
              {" "}• Publisher ID: <span className="font-mono text-neutral-200">#3486860</span>)
            </p>
          </div>

          {/* Quick Date Presets & Manual Refresh */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-2xl bg-neutral-900 border border-neutral-800 p-1 text-xs">
              {(["today", "7d", "30d", "month"] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSelectedPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    selectedPreset === preset
                      ? "bg-emerald-500 text-neutral-950 shadow-xs"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {preset === "today"
                    ? "Today"
                    : preset === "7d"
                    ? "7 Days"
                    : preset === "30d"
                    ? "30 Days"
                    : "This Month"}
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchAdsterraStats(selectedPreset, selectedGroupBy, true)}
              disabled={refreshing || loadingStats}
              className="px-3.5 py-2 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-bold text-neutral-200 hover:text-white transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Refresh statistics now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing || loadingStats ? "animate-spin text-emerald-400" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh Stats"}</span>
            </button>
          </div>
        </div>

        {/* Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Revenue */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {loadingStats ? (
                <div className="h-8 w-24 bg-neutral-800 animate-pulse rounded-md" />
              ) : (
                `$${(stats?.totalRevenue ?? 0).toFixed(4)}`
              )}
            </div>
            <div className="text-[11px] text-emerald-400/90 font-medium mt-1">
              ≈ ₹{(((stats?.totalRevenue ?? 0) * 86.5)).toFixed(2)} INR (Estimated)
            </div>
          </div>

          {/* Impressions */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Impressions</span>
              <Eye className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {loadingStats ? (
                <div className="h-8 w-20 bg-neutral-800 animate-pulse rounded-md" />
              ) : (
                (stats?.totalImpressions ?? 0).toLocaleString()
              )}
            </div>
            <div className="text-[11px] text-neutral-400 font-medium mt-1">
              Live banner &amp; direct link views
            </div>
          </div>

          {/* Average CPM */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Average CPM</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {loadingStats ? (
                <div className="h-8 w-20 bg-neutral-800 animate-pulse rounded-md" />
              ) : (
                `$${(stats?.averageCpm ?? 0).toFixed(3)}`
              )}
            </div>
            <div className="text-[11px] text-neutral-400 font-medium mt-1">
              Revenue per 1,000 ad impressions
            </div>
          </div>

          {/* Clicks & CTR */}
          <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Clicks &amp; CTR</span>
              <MousePointerClick className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {loadingStats ? (
                <div className="h-8 w-20 bg-neutral-800 animate-pulse rounded-md" />
              ) : (
                `${stats?.totalClicks ?? 0}`
              )}
            </div>
            <div className="text-[11px] text-neutral-400 font-medium mt-1">
              CTR: {(stats?.averageCtr ?? 0).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Breakdown Navigation & Table */}
        <div className="rounded-2xl bg-neutral-900/90 border border-neutral-800/80 overflow-hidden">
          <div className="p-4 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Breakdown View:
              </span>
              <div className="inline-flex rounded-xl bg-neutral-950 p-1 border border-neutral-800 text-xs">
                {(["placement", "date", "country", "domain"] as const).map((view) => (
                  <button
                    key={view}
                    onClick={() => setSelectedGroupBy(view)}
                    className={`px-3 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                      selectedGroupBy === view
                        ? "bg-neutral-800 text-emerald-400 shadow-xs"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>

            {stats?.lastUpdateTime && (
              <span className="text-[11px] text-neutral-500 font-mono">
                Provider sync: {stats.lastUpdateTime}
              </span>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {statsError ? (
              <div className="p-6 text-center text-rose-400 text-xs flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{statsError}</span>
              </div>
            ) : loadingStats ? (
              <div className="p-8 text-center text-neutral-400 text-xs flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                <span>Fetching live metrics from Adsterra...</span>
              </div>
            ) : stats?.items && stats.items.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">
                      {selectedGroupBy === "placement"
                        ? "Ad Placement / Format"
                        : selectedGroupBy === "date"
                        ? "Date"
                        : selectedGroupBy === "country"
                        ? "Country Code"
                        : "Domain"}
                    </th>
                    <th className="py-3 px-4 text-right">Impressions</th>
                    <th className="py-3 px-4 text-right">Clicks</th>
                    <th className="py-3 px-4 text-right">CTR</th>
                    <th className="py-3 px-4 text-right">CPM ($)</th>
                    <th className="py-3 px-4 text-right">Revenue ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {stats.items.map((row: AdsterraStatRow, idx: number) => (
                    <tr key={idx} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-white">
                        {selectedGroupBy === "placement" ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-neutral-200">
                              {row.placement_name || `Placement #${row.placement}`}
                            </span>
                            {row.placement && (
                              <code className="text-[10px] text-neutral-500 font-mono">
                                #{row.placement}
                              </code>
                            )}
                          </div>
                        ) : selectedGroupBy === "date" ? (
                          <span className="font-mono text-neutral-300">{row.date}</span>
                        ) : selectedGroupBy === "country" ? (
                          <span className="font-bold text-neutral-200 tracking-wider">
                            🌐 {row.country}
                          </span>
                        ) : (
                          <span className="font-semibold text-neutral-200">
                            {row.domain_name || `Domain #${row.domain}`}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-neutral-300">
                        {row.impression.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-neutral-300">
                        {row.clicks}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-neutral-400">
                        {row.ctr.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-amber-300">
                        ${row.cpm.toFixed(3)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        ${row.revenue.toFixed(4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-neutral-400 text-xs">
                No impression or revenue records found for this period. Keep advertising active to accumulate data!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 1. GLOBAL & ASSET KILLSWITCHES ── */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
          Master Network &amp; Format Switches
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Global Ads Toggle */}
          <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Master Switch
                </span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    globalAdsEnabled ? "bg-emerald-500 animate-pulse" : "bg-neutral-500"
                  }`}
                />
              </div>
              <h4 className="text-base font-extrabold text-neutral-900 dark:text-white">
                GLOBAL ADS
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Platform-wide master switch for all monetization networks.
              </p>
            </div>
            <div className="pt-4 mt-2">
              <button
                onClick={() => onToggleGlobalAds(!globalAdsEnabled)}
                className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  globalAdsEnabled
                    ? "bg-emerald-500 hover:bg-emerald-600 text-neutral-950"
                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                }`}
              >
                <span>{globalAdsEnabled ? "GLOBAL: ACTIVE" : "GLOBAL: PAUSED"}</span>
              </button>
            </div>
          </div>

          {/* Adsterra Provider Script 1 */}
          <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Social Bar / Script 1
                </span>
                <Code className="w-4 h-4 text-amber-500" />
              </div>
              <h4 className="text-base font-extrabold text-neutral-900 dark:text-white">
                AD SCRIPT 1
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Script (<code className="font-mono text-[10px]">18911b...js</code>) lazy-injected on public pages.
              </p>
            </div>
            <div className="pt-4 mt-2">
              <button
                onClick={() => handleToggle("scriptEnabled")}
                className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  config.scriptEnabled
                    ? "bg-amber-500 hover:bg-amber-600 text-neutral-950"
                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                }`}
              >
                <span>{config.scriptEnabled ? "SCRIPT 1: ON" : "SCRIPT 1: OFF"}</span>
              </button>
            </div>
          </div>

          {/* Adsterra Provider Script 2 */}
          <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Popunder / Script 2
                </span>
                <Code className="w-4 h-4 text-amber-500" />
              </div>
              <h4 className="text-base font-extrabold text-neutral-900 dark:text-white">
                AD SCRIPT 2
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Script (<code className="font-mono text-[10px]">309f95...js</code>) lazy-injected on public pages.
              </p>
            </div>
            <div className="pt-4 mt-2">
              <button
                onClick={() => handleToggle("script2Enabled")}
                className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  config.script2Enabled
                    ? "bg-amber-500 hover:bg-amber-600 text-neutral-950"
                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                }`}
              >
                <span>{config.script2Enabled ? "SCRIPT 2: ON" : "SCRIPT 2: OFF"}</span>
              </button>
            </div>
          </div>

          {/* Native Widget Container */}
          <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Native Widget
                </span>
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </div>
              <h4 className="text-base font-extrabold text-neutral-900 dark:text-white">
                NATIVE BANNER
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Container (<code className="font-mono text-[10px]">d10157...</code>) in-feed widget.
              </p>
            </div>
            <div className="pt-4 mt-2">
              <button
                onClick={() => handleToggle("nativeBannerEnabled")}
                className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  config.nativeBannerEnabled
                    ? "bg-emerald-500 hover:bg-emerald-600 text-neutral-950"
                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                }`}
              >
                <span>{config.nativeBannerEnabled ? "NATIVE: ON" : "NATIVE: OFF"}</span>
              </button>
            </div>
          </div>

          {/* Official Iframe Banners Switch */}
          <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Display Zones
                </span>
                <Layout className="w-4 h-4 text-cyan-500" />
              </div>
              <h4 className="text-base font-extrabold text-neutral-900 dark:text-white">
                IFRAME BANNERS
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Controls all 6 Adsterra banner zones (728x90, 300x250, 320x50, etc.).
              </p>
            </div>
            <div className="pt-4 mt-2">
              <button
                onClick={() => handleToggle("bannerZonesEnabled")}
                className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  config.bannerZonesEnabled
                    ? "bg-cyan-500 hover:bg-cyan-600 text-neutral-950"
                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                }`}
              >
                <span>{config.bannerZonesEnabled ? "BANNERS: ON" : "BANNERS: OFF"}</span>
              </button>
            </div>
          </div>

          {/* Smartlink 1 Toggle */}
          <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Direct Link 1
                </span>
                <Zap className="w-4 h-4 text-indigo-500" />
              </div>
              <h4 className="text-base font-extrabold text-neutral-900 dark:text-white">
                SMARTLINK 1
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Primary smartlink (<code className="font-mono text-[10px]">hebd0w...</code>).
              </p>
            </div>
            <div className="pt-4 mt-2">
              <button
                onClick={() => handleToggle("smartlink1Enabled")}
                className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  config.smartlink1Enabled
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                }`}
              >
                <span>{config.smartlink1Enabled ? "LINK 1: ON" : "LINK 1: OFF"}</span>
              </button>
            </div>
          </div>

          {/* Smartlink 2 Toggle */}
          <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Direct Link 2
                </span>
                <Zap className="w-4 h-4 text-purple-500" />
              </div>
              <h4 className="text-base font-extrabold text-neutral-900 dark:text-white">
                SMARTLINK 2
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Secondary smartlink (<code className="font-mono text-[10px]">x0a8ik...</code>).
              </p>
            </div>
            <div className="pt-4 mt-2">
              <button
                onClick={() => handleToggle("smartlink2Enabled")}
                className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  config.smartlink2Enabled
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                }`}
              >
                <span>{config.smartlink2Enabled ? "LINK 2: ON" : "LINK 2: OFF"}</span>
              </button>
            </div>
          </div>

          {/* Smartlink 3 Toggle */}
          <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Direct Link 3
                </span>
                <Zap className="w-4 h-4 text-pink-500" />
              </div>
              <h4 className="text-base font-extrabold text-neutral-900 dark:text-white">
                SMARTLINK 3
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Tertiary smartlink (<code className="font-mono text-[10px]">p9zz1z...</code>).
              </p>
            </div>
            <div className="pt-4 mt-2">
              <button
                onClick={() => handleToggle("smartlink3Enabled")}
                className={`w-full py-2.5 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  config.smartlink3Enabled
                    ? "bg-pink-600 hover:bg-pink-700 text-white"
                    : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                }`}
              >
                <span>{config.smartlink3Enabled ? "LINK 3: ON" : "LINK 3: OFF"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. PAGE & DEVICE PLACEMENT SWITCHES ── */}
      <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              <span>Placement &amp; Device Targeting</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Activate or pause advertising independently across specific templates and screen form-factors.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">
              {Object.values(config.placements).filter(Boolean).length} / {Object.keys(config.placements).length} Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Homepage Ads */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                Homepage Ads
              </span>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Below hero banner &amp; native in-feed
              </p>
            </div>
            <button
              onClick={() => handleToggle("homepage", true)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                config.placements.homepage
                  ? "bg-emerald-500 text-neutral-950"
                  : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
              }`}
            >
              {config.placements.homepage ? "ON" : "OFF"}
            </button>
          </div>

          {/* Resource Ads */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                Resource Ads
              </span>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Explore grid &amp; detail information
              </p>
            </div>
            <button
              onClick={() => handleToggle("resourceList", true)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                config.placements.resourceList
                  ? "bg-emerald-500 text-neutral-950"
                  : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
              }`}
            >
              {config.placements.resourceList ? "ON" : "OFF"}
            </button>
          </div>

          {/* Resource Details */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                Resource Details
              </span>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Sidebar &amp; detail page banner
              </p>
            </div>
            <button
              onClick={() => handleToggle("resourceDetails", true)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                config.placements.resourceDetails
                  ? "bg-emerald-500 text-neutral-950"
                  : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
              }`}
            >
              {config.placements.resourceDetails ? "ON" : "OFF"}
            </button>
          </div>

          {/* Article Ads */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-500" />
                Article Ads
              </span>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Post-intro, in-feed, &amp; footer
              </p>
            </div>
            <button
              onClick={() => handleToggle("article", true)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                config.placements.article
                  ? "bg-emerald-500 text-neutral-950"
                  : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
              }`}
            >
              {config.placements.article ? "ON" : "OFF"}
            </button>
          </div>

          {/* Mobile Ads */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-rose-500" />
                Mobile Ads
              </span>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Smartphones &amp; small portrait viewports
              </p>
            </div>
            <button
              onClick={() => handleToggle("mobile", true)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                config.placements.mobile
                  ? "bg-emerald-500 text-neutral-950"
                  : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
              }`}
            >
              {config.placements.mobile ? "ON" : "OFF"}
            </button>
          </div>

          {/* Desktop Ads */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-emerald-500" />
                Desktop Ads
              </span>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Wide screens, laptops, &amp; monitors
              </p>
            </div>
            <button
              onClick={() => handleToggle("desktop", true)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                config.placements.desktop
                  ? "bg-emerald-500 text-neutral-950"
                  : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
              }`}
            >
              {config.placements.desktop ? "ON" : "OFF"}
            </button>
          </div>

          {/* Sponsored Links Toggle */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 flex items-center justify-between sm:col-span-2 lg:col-span-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Sponsored Links (Smartlinks Display)
              </span>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Controls all smartlink badges, partner pills, and sponsored discovery units platform-wide.
              </p>
            </div>
            <button
              onClick={() => handleToggle("smartlinks", true)}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                config.placements.smartlinks
                  ? "bg-emerald-500 text-neutral-950"
                  : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
              }`}
            >
              {config.placements.smartlinks ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      </div>

      {/* ── 2.5. HIGH-CONVERTING AD FORMATS & USER INFLUENCING DESIGN MANAGER ── */}
      <div className="p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-white to-amber-500/10 dark:from-amber-950/20 dark:via-neutral-900/60 dark:to-neutral-950 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider mb-1.5 border border-amber-500/30">
              <Flame className="w-3.5 h-3.5" />
              <span>Conversion-Optimized Ad Formats</span>
            </div>
            <h3 className="text-lg font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Interactive Ad Formats &amp; Monetization Strategy</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
              High-CTR, user-influencing advertising experiences engineered to maximize clicks and CPM without harming user trust.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleTestPopup}
              className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-neutral-950" />
              <span>Test Pop-up Ad Live</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Format 1: Full-Website Pop-up Ad Modal */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/60 flex flex-col justify-between gap-3 shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Full-Website Pop-up Ad Modal</span>
                </span>
                <button
                  onClick={() => handleToggle("popupAdEnabled")}
                  className={`px-3 py-1 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    config.popupAdEnabled !== false
                      ? "bg-emerald-500 text-neutral-950"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {config.popupAdEnabled !== false ? "ACTIVE" : "DISABLED"}
                </button>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Renders a centered 300x250 Medium Rectangle ad modal with close countdown. Automatically triggers on route visits and sponsored button clicks.
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between text-xs">
              <span className="text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                <span>Trigger Delay:</span>
              </span>
              <div className="flex items-center gap-1.5">
                {[2, 3.5, 5, 8].map((sec) => (
                  <button
                    key={sec}
                    onClick={async () => {
                      const updated = { ...config, popupDelaySeconds: sec };
                      setConfig(updated);
                      await saveSettings(updated);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      (config.popupDelaySeconds ?? 3.5) === sec
                        ? "bg-amber-500 text-neutral-950 shadow-xs"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-white"
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Format 2: Floating Sticky Bottom Bar */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/60 flex flex-col justify-between gap-3 shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Floating Sticky Bottom Bar</span>
                </span>
                <button
                  onClick={() => handleToggle("stickyBarEnabled")}
                  className={`px-3 py-1 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    config.stickyBarEnabled !== false
                      ? "bg-emerald-500 text-neutral-950"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {config.stickyBarEnabled !== false ? "ACTIVE" : "DISABLED"}
                </button>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Floating pill pinned to the bottom of the viewport with pulsating status indicator and direct access CTA to Smartlink 2 ($5-$20 CPM).
              </p>
            </div>

            {/* Sticky Bar Live Mini Preview */}
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-amber-500/40 flex items-center justify-between text-[11px] text-white">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="font-bold truncate">⚡ High-Speed Direct Cloud Access &amp; Tools</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-neutral-950 font-black text-[10px] shrink-0 ml-2">
                Direct Access ↗
              </span>
            </div>
          </div>

          {/* Format 3: Curated Native 4-Card Sponsored Grid */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/60 flex flex-col justify-between gap-3 shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  <span>Native Curated Sponsored Grid</span>
                </span>
                <button
                  onClick={() => handleToggle("nativeBannerEnabled")}
                  className={`px-3 py-1 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    config.nativeBannerEnabled !== false
                      ? "bg-emerald-500 text-neutral-950"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {config.nativeBannerEnabled !== false ? "ACTIVE" : "DISABLED"}
                </button>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Presents 4 verified developer utilities and cloud tools (VPN, VPS, Developer API, AI Studio) with ratings and badges that strongly influence user clicks.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>4 Interactive Cards With Star Ratings &amp; Smartlinks</span>
            </div>
          </div>

          {/* Format 4: High-CTR VIP Fast Download Mirror */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/60 flex flex-col justify-between gap-3 shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-cyan-500" />
                  <span>VIP Fast Download Mirror (Highest CTR)</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-cyan-500/15 text-cyan-500 border border-cyan-500/30">
                  AUTO-ENABLED
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                On resource download pages, displays a highlighted "⚡ High-Speed Direct Mirror (Fastest) [VIP CDN]" button above standard mirrors, driving maximal user engagement.
              </p>
            </div>

            <a
              href={config.smartlink3}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer"
            >
              <span>⚡ High-Speed Direct Mirror (Fastest)</span>
              <span className="px-1.5 py-0.5 rounded bg-neutral-950 text-amber-400 text-[9px] uppercase">
                Test Mirror ↗
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* ── 3. OFFICIAL BANNER ZONES INVENTORY WITH LIVE INTERACTIVE PREVIEWS ── */}
      <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Layout className="w-4 h-4 text-cyan-500" />
              <span>Official Adsterra Banner Zones ({bannerZones.length}) with Live Visual Previews</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Click &quot;Preview Ad&quot; on any zone to render the live ad unit directly inside the admin panel.
            </p>
          </div>
          {previewZoneKey && (
            <button
              onClick={() => setPreviewZoneKey(null)}
              className="px-3 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Hide All Previews</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {bannerZones.map((zone) => {
            const isPreviewing = previewZoneKey === zone.key;

            return (
              <div
                key={zone.key}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 text-xs ${
                  isPreviewing
                    ? "border-amber-500/60 bg-amber-500/5 dark:bg-amber-950/20 shadow-md col-span-1 md:col-span-2 lg:col-span-3"
                    : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 dark:text-white">{zone.name}</span>
                    <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {zone.dims}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                    Key: {zone.key}
                  </div>
                </div>

                {/* Live Preview Iframe Container */}
                {isPreviewing && (
                  <div className="my-3 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Live Ad Display ({zone.dims})</span>
                    </div>
                    <div className="max-w-full overflow-x-auto flex justify-center py-1">
                      <iframe
                        title={`Live Adsterra Preview ${zone.name}`}
                        src={`/api/ads/banner?key=${zone.key}&w=${zone.width}&h=${zone.height}&link=1`}
                        width={zone.width}
                        height={zone.height}
                        className="border-0 rounded-xl overflow-hidden shadow-md max-w-full"
                        scrolling="no"
                        loading="eager"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-neutral-200/50 dark:border-neutral-800/50">
                  <button
                    onClick={() => setPreviewZoneKey(isPreviewing ? null : zone.key)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1.5 transition-all cursor-pointer ${
                      isPreviewing
                        ? "bg-amber-500 text-neutral-950"
                        : "bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {isPreviewing ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-cyan-400" />}
                    <span>{isPreviewing ? "Close Preview" : "Preview Ad"}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(zone.key, zone.key)}
                    className="px-2 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-1 transition-all text-[10px] cursor-pointer"
                  >
                    {copiedKey === zone.key ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === zone.key ? "Copied" : "Copy Key"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. LIVE ASSET VERIFICATION & TEST CARDS ── */}
      <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Configured Publisher Asset URLs</span>
        </h3>

        <div className="space-y-3">
          {/* Smartlink 1 URL */}
          <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1 min-w-0">
              <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Smartlink 1 Destination</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  DIRECT LINK
                </span>
              </div>
              <p className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400 truncate max-w-xl">
                {config.smartlink1}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopy(config.smartlink1, "link1")}
                className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-1.5 transition-all text-xs cursor-pointer"
              >
                {copiedKey === "link1" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "link1" ? "Copied" : "Copy"}</span>
              </button>
              <a
                href={config.smartlink1}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 transition-all text-xs shadow-xs"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Smartlink 2 URL */}
          <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1 min-w-0">
              <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Smartlink 2 Destination</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  SECONDARY
                </span>
              </div>
              <p className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400 truncate max-w-xl">
                {config.smartlink2}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopy(config.smartlink2, "link2")}
                className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-1.5 transition-all text-xs cursor-pointer"
              >
                {copiedKey === "link2" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "link2" ? "Copied" : "Copy"}</span>
              </button>
              <a
                href={config.smartlink2}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-1.5 transition-all text-xs shadow-xs"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Smartlink 3 URL */}
          <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1 min-w-0">
              <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Smartlink 3 Destination</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  TERTIARY
                </span>
              </div>
              <p className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400 truncate max-w-xl">
                {config.smartlink3}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopy(config.smartlink3, "link3")}
                className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-1.5 transition-all text-xs cursor-pointer"
              >
                {copiedKey === "link3" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "link3" ? "Copied" : "Copy"}</span>
              </button>
              <a
                href={config.smartlink3}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold flex items-center gap-1.5 transition-all text-xs shadow-xs"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Provider Script Tag 1 */}
          <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1 min-w-0">
              <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Adsterra Script 1 (Social Bar / Delivery)</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  NEXT/SCRIPT LAZY
                </span>
              </div>
              <p className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400 truncate max-w-xl">
                {config.scriptUrl}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopy(`<script src="${config.scriptUrl}"></script>`, "script1")}
                className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-1.5 transition-all text-xs cursor-pointer"
              >
                {copiedKey === "script1" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "script1" ? "Copied" : "Copy Tag"}</span>
              </button>
            </div>
          </div>

          {/* Provider Script Tag 2 */}
          <div className="p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1 min-w-0">
              <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Adsterra Script 2 (Popunder / Delivery)</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  NEXT/SCRIPT LAZY
                </span>
              </div>
              <p className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400 truncate max-w-xl">
                {config.scriptUrl2}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopy(`<script src="${config.scriptUrl2}"></script>`, "script2")}
                className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-1.5 transition-all text-xs cursor-pointer"
              >
                {copiedKey === "script2" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "script2" ? "Copied" : "Copy Tag"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. OPTIONAL BANNER ZONE CODE OVERRIDE ── */}
      <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-950 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Code className="w-4 h-4 text-amber-500" />
            <span>Custom Banner Zone Snippet Override (Optional)</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            The site is already equipped with all 6 official Adsterra banner zones. If you generate a special custom HTML/JS snippet in the future, paste it below to override standard banner units.
          </p>
        </div>

        <textarea
          rows={3}
          value={config.customBannerCode || ""}
          onChange={(e) => setConfig({ ...config, customBannerCode: e.target.value })}
          placeholder='<!-- Optional: Paste custom Adsterra banner code snippet here -->'
          className="w-full font-mono text-xs p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-neutral-100"
        />

        <div className="flex justify-end">
          <button
            onClick={() => saveSettings(config)}
            disabled={saving}
            className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-neutral-950 font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Save Configuration"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
