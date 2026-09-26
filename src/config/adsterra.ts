/**
 * Adsterra Centralized Advertising Configuration
 * 
 * Official Monetization Assets Provided:
 * 
 * 1. Direct Links / Smartlinks:
 * - Smartlink 1: https://demolishwrestconclusions.com/hebd0wzjqw?key=ef54880efe2cf24e942204e7b606498c
 * - Smartlink 2: https://demolishwrestconclusions.com/x0a8ik0sn4?key=01cda2b2e4e25f16daea215015495d74
 * - Smartlink 3: https://demolishwrestconclusions.com/p9zz1z9nw?key=f0d4b0285569216ca06b70c80fd36df8
 * 
 * 2. Provider Scripts (Social Bar / Popunder / In-Page Push):
 * - Script 1: https://demolishwrestconclusions.com/18/91/1b/18911b7efb81e91a2cf994b94c5589c2.js
 * - Script 2: https://demolishwrestconclusions.com/30/9f/95/309f95fd3760f90cc4ce9941f34d920f.js
 * 
 * 3. Native Container Banner:
 * - Container: container-d10157a3b2e5ea2ae26efcd419ed2db1
 * - Script: https://demolishwrestconclusions.com/d10157a3b2e5ea2ae26efcd419ed2db1/invoke.js
 * 
 * 4. Official Banner Zones:
 * - 728x90 Leaderboard: a6ecc44708171fc9f4ecde59963afc03
 * - 300x250 Medium Rectangle: 8d5d7640361a7a528012a299baffb51c
 * - 320x50 Mobile Banner: b7191fddc56009fabc3c950a2355f388
 * - 468x60 Banner: 44f77fe702f3a252d10ff7396d908999
 * - 160x300 Vertical Mini: 10bc7358a4e926330a8bffaf21c9b9d9
 * - 160x600 Skyscraper: 9231e5277fd331179b87cefb0653bfaf
 */

export interface AdsterraPlacements {
  homepage: boolean;
  resourceList: boolean;
  resourceDetails: boolean;
  article: boolean;
  mobile: boolean;
  desktop: boolean;
  smartlinks: boolean;
}

export interface AdsterraBannerZone {
  key: string;
  width: number;
  height: number;
}

export interface AdsterraConfig {
  enabled: boolean;
  smartlink1Enabled: boolean;
  smartlink2Enabled: boolean;
  smartlink3Enabled: boolean;
  scriptEnabled: boolean;
  script2Enabled: boolean;
  nativeBannerEnabled: boolean;
  bannerZonesEnabled: boolean;
  smartlink1: string;
  smartlink2: string;
  smartlink3: string;
  scriptUrl: string;
  scriptUrl2: string;
  customBannerCode?: string;
  popupAdEnabled?: boolean;
  stickyBarEnabled?: boolean;
  stickyBarPosition?: "bottom-right" | "bottom-left" | "right-edge" | "left-edge";
  popupDelaySeconds?: number;
  placements: AdsterraPlacements;
}

export const ADSTERRA_ASSETS = {
  smartlink1:
    process.env.NEXT_PUBLIC_ADSTERRA_SMARTLINK_1 ||
    "https://demolishwrestconclusions.com/hebd0wzjqw?key=ef54880efe2cf24e942204e7b606498c",
  smartlink2:
    process.env.NEXT_PUBLIC_ADSTERRA_SMARTLINK_2 ||
    "https://demolishwrestconclusions.com/x0a8ik0sn4?key=01cda2b2e4e25f16daea215015495d74",
  smartlink3:
    process.env.NEXT_PUBLIC_ADSTERRA_SMARTLINK_3 ||
    "https://demolishwrestconclusions.com/p9zz1z9nw?key=f0d4b0285569216ca06b70c80fd36df8",
  scriptUrl:
    process.env.NEXT_PUBLIC_ADSTERRA_SCRIPT_URL ||
    "https://demolishwrestconclusions.com/18/91/1b/18911b7efb81e91a2cf994b94c5589c2.js",
  scriptUrl2:
    process.env.NEXT_PUBLIC_ADSTERRA_SCRIPT_URL_2 ||
    "https://demolishwrestconclusions.com/30/9f/95/309f95fd3760f90cc4ce9941f34d920f.js",
  nativeBanner: {
    containerId: "container-d10157a3b2e5ea2ae26efcd419ed2db1",
    scriptUrl: "https://demolishwrestconclusions.com/d10157a3b2e5ea2ae26efcd419ed2db1/invoke.js",
  },
  bannerZones: {
    leaderboard_728x90: {
      key: "a6ecc44708171fc9f4ecde59963afc03",
      width: 728,
      height: 90,
    },
    rectangle_300x250: {
      key: "8d5d7640361a7a528012a299baffb51c",
      width: 300,
      height: 250,
    },
    mobile_320x50: {
      key: "b7191fddc56009fabc3c950a2355f388",
      width: 320,
      height: 50,
    },
    banner_468x60: {
      key: "44f77fe702f3a252d10ff7396d908999",
      width: 468,
      height: 60,
    },
    vertical_160x300: {
      key: "10bc7358a4e926330a8bffaf21c9b9d9",
      width: 160,
      height: 300,
    },
    skyscraper_160x600: {
      key: "9231e5277fd331179b87cefb0653bfaf",
      width: 160,
      height: 600,
    },
  },
} as const;

export const DEFAULT_ADSTERRA_CONFIG: AdsterraConfig = {
  enabled: true,
  smartlink1Enabled: true,
  smartlink2Enabled: true,
  smartlink3Enabled: true,
  scriptEnabled: true,
  script2Enabled: true,
  nativeBannerEnabled: true,
  bannerZonesEnabled: true,
  smartlink1: ADSTERRA_ASSETS.smartlink1,
  smartlink2: ADSTERRA_ASSETS.smartlink2,
  smartlink3: ADSTERRA_ASSETS.smartlink3,
  scriptUrl: ADSTERRA_ASSETS.scriptUrl,
  scriptUrl2: ADSTERRA_ASSETS.scriptUrl2,
  customBannerCode: "",
  popupAdEnabled: true,
  stickyBarEnabled: true,
  stickyBarPosition: "bottom-right",
  popupDelaySeconds: 4,
  placements: {
    homepage: true,
    resourceList: true,
    resourceDetails: true,
    article: true,
    mobile: true,
    desktop: true,
    smartlinks: true,
  },
};

/**
 * Strict path exclusion list.
 * Under NO circumstances should advertising scripts or components load on these routes.
 */
export const RESTRICTED_AD_PATHS = [
  "/login",
  "/register",
  "/auth",
  "/api",
  "/account",
  "/checkout",
  "/maintenance",
] as const;

/**
 * Checks if a given pathname is allowed to display Adsterra advertising.
 * Defense-in-depth: Rejects any match against admin, dashboard, auth, or internal API paths.
 */
export function isAdsterraAllowedPath(pathname: string | null | undefined): boolean {
  if (!pathname) return true;
  const cleanPath = pathname.toLowerCase();
  return !RESTRICTED_AD_PATHS.some(
    (restricted) => cleanPath === restricted || cleanPath.startsWith(`${restricted}/`)
  );
}

/**
 * Adsterra Publisher Reporting & Management API Configuration
 * 
 * Official Endpoint: https://api3.adsterratools.com/publisher/
 * Auth: Header 'X-API-Key'
 */
export const ADSTERRA_API_CONFIG = {
  baseUrl: "https://api3.adsterratools.com/publisher",
  statsUrl: "https://api3.adsterratools.com/publisher/stats.json",
  domainsUrl: "https://api3.adsterratools.com/publisher/domains.json",
  domainPlacementsUrl: (domainId: number | string) =>
    `https://api3.adsterratools.com/publisher/domain/${domainId}/placements.json`,
  apiKey: process.env.ADSTERRA_API_KEY || "ef97a5866c33989b51339a0a5b5cd7d5",
  maskedKey: "ef97a586...5b5cd7d5",
} as const;

/**
 * Official Adsterra Domain IDs linked to this account
 */
export const ADSTERRA_DOMAIN_CATALOG: Record<number, { title: string; type: string }> = {
  6077658: { title: "techsavvymuthuraj.dev", type: "Main Website" },
  6077660: { title: "smart-link-3486860", type: "Smartlink Network" },
};

/**
 * Known Publisher Placement catalog for mapping raw Adsterra IDs to friendly names & dimensions
 */
export const ADSTERRA_PLACEMENT_CATALOG: Record<
  number,
  { name: string; format: string; dims?: string; key?: string }
> = {
  31414155: { name: "Popunder Script", format: "Popunder", key: "18911b7efb81e91a2cf994b94c5589c2" },
  31414156: { name: "Native Banner Widget", format: "Native", dims: "Responsive", key: "container-d10157a3b2e5ea2ae26efcd419ed2db1" },
  31414157: { name: "Standard Banner", format: "Iframe Banner", dims: "468x60", key: "44f77fe702f3a252d10ff7396d908999" },
  31414158: { name: "Social Bar / Push", format: "Social Bar", key: "18911b7efb81e91a2cf994b94c5589c2" },
  31414159: { name: "Direct Smartlink 3", format: "Smartlink", key: "f0d4b0285569216ca06b70c80fd36df8" },
  31414166: { name: "Direct Smartlink 2", format: "Smartlink", key: "01cda2b2e4e25f16daea215015495d74" },
  31414169: { name: "Direct Smartlink 1", format: "Smartlink", key: "ef54880efe2cf24e942204e7b606498c" },
  31414172: { name: "Vertical Mini Banner", format: "Iframe Banner", dims: "160x300", key: "10bc7358a4e926330a8bffaf21c9b9d9" },
  31414173: { name: "Mobile Banner", format: "Iframe Banner", dims: "320x50", key: "b7191fddc56009fabc3c950a2355f388" },
  31414174: { name: "Medium Rectangle", format: "Iframe Banner", dims: "300x250", key: "8d5d7640361a7a528012a299baffb51c" },
  31414175: { name: "Desktop Leaderboard", format: "Iframe Banner", dims: "728x90", key: "a6ecc44708171fc9f4ecde59963afc03" },
  31414176: { name: "Skyscraper Banner", format: "Iframe Banner", dims: "160x600", key: "9231e5277fd331179b87cefb0653bfaf" },
};

export interface AdsterraStatRow {
  date?: string;
  placement?: number;
  placement_name?: string;
  country?: string;
  domain?: number;
  domain_name?: string;
  impression: number;
  clicks: number;
  ctr: number;
  cpm: number;
  revenue: number;
}

export interface AdsterraStatsSummary {
  totalImpressions: number;
  totalClicks: number;
  totalRevenue: number;
  averageCpm: number;
  averageCtr: number;
  startDate: string;
  finishDate: string;
  groupBy: "date" | "placement" | "country" | "domain";
  items: AdsterraStatRow[];
  lastUpdateTime?: string;
}

