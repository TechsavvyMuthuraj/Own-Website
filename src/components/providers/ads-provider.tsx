"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { AdsterraConfig } from "@/config/adsterra";
import { DEFAULT_ADSTERRA_CONFIG } from "@/config/adsterra";

interface AdsContextType {
  adsEnabled: boolean;
  autoAds: boolean;
  adsterraSettings: AdsterraConfig;
  updateAdsterraSettings: (settings: Partial<AdsterraConfig>) => void;
}

const AdsContext = createContext<AdsContextType>({
  adsEnabled: true,
  autoAds: true,
  adsterraSettings: DEFAULT_ADSTERRA_CONFIG,
  updateAdsterraSettings: () => {},
});

export function AdsProvider({
  children,
  adsEnabled = true,
  autoAds = true,
  adsterraSettings: initialAdsterraSettings,
}: {
  children: React.ReactNode;
  adsEnabled?: boolean;
  autoAds?: boolean;
  adsterraSettings?: AdsterraConfig;
}) {
  const [adsterraSettings, setAdsterraSettings] = useState<AdsterraConfig>(
    initialAdsterraSettings || DEFAULT_ADSTERRA_CONFIG
  );

  useEffect(() => {
    if (initialAdsterraSettings) {
      setAdsterraSettings(initialAdsterraSettings);
    }
  }, [initialAdsterraSettings]);

  const updateAdsterraSettings = (partial: Partial<AdsterraConfig>) => {
    setAdsterraSettings((prev) => ({
      ...prev,
      ...partial,
      placements: {
        ...prev.placements,
        ...(partial.placements || {}),
      },
    }));
  };

  return (
    <AdsContext.Provider
      value={{
        adsEnabled,
        autoAds,
        adsterraSettings,
        updateAdsterraSettings,
      }}
    >
      {children}
    </AdsContext.Provider>
  );
}

export function useAds() {
  return useContext(AdsContext);
}

export function useAdsterra() {
  const { adsterraSettings, adsEnabled } = useContext(AdsContext);
  return {
    ...adsterraSettings,
    isGloballyActive: adsEnabled && adsterraSettings.enabled,
  };
}
