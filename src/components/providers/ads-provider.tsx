"use client";

import React, { createContext, useContext } from "react";

interface AdsContextType {
  adsEnabled: boolean;
  autoAds: boolean;
}

const AdsContext = createContext<AdsContextType>({
  adsEnabled: false,
  autoAds: false,
});

export function AdsProvider({
  children,
  adsEnabled = false,
  autoAds = false,
}: {
  children: React.ReactNode;
  adsEnabled?: boolean;
  autoAds?: boolean;
}) {
  return (
    <AdsContext.Provider value={{ adsEnabled, autoAds }}>
      {children}
    </AdsContext.Provider>
  );
}

export function useAds() {
  return useContext(AdsContext);
}
