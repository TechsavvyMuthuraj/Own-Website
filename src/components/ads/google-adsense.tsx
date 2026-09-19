"use client";

import React from "react";
import Script from "next/script";

interface GoogleAdSenseProps {
  clientId?: string;
  autoAds?: boolean;
}

export function GoogleAdSense({
  clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-1960459798233871",
  autoAds = true,
}: GoogleAdSenseProps) {
  if (!clientId || clientId.includes("XXXX")) {
    return null;
  }

  // Ensure format is ca-pub-XXXXXXXXXXXXXXXX
  const formattedClientId = clientId.startsWith("ca-") ? clientId : `ca-${clientId}`;

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${formattedClientId}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
      data-ad-client={formattedClientId}
      {...(autoAds ? {} : { "data-ad-frequency-hint": "30s" })}
    />
  );
}
