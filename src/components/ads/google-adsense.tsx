"use client";

import React from "react";
import Script from "next/script";
import { useAds } from "@/components/providers/ads-provider";

interface GoogleAdSenseProps {
  clientId?: string;
  autoAds?: boolean;
}

export function GoogleAdSense({
  clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-1960459798233871",
  autoAds = true,
}: GoogleAdSenseProps) {
  const { adsEnabled, autoAds: globalAutoAds } = useAds();

  // If ads are globally disabled, do not load Google AdSense script at all
  if (!adsEnabled) {
    return null;
  }

  if (!clientId || clientId.includes("XXXX")) {
    return null;
  }

  // Ensure format is ca-pub-XXXXXXXXXXXXXXXX
  const formattedClientId = clientId.startsWith("ca-") ? clientId : `ca-${clientId}`;
  const effectiveAutoAds = autoAds && globalAutoAds;

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${formattedClientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
      data-ad-client={formattedClientId}
      {...(effectiveAutoAds ? {} : { "data-ad-frequency-hint": "30s" })}
    />
  );
}
