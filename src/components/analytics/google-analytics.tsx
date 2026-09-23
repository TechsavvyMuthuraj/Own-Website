"use client";

import React, { useEffect, Suspense } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

interface GoogleAnalyticsProps {
  measurementId?: string;
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

function AnalyticsTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!measurementId || typeof window.gtag !== "function") return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    window.gtag("config", measurementId, {
      page_path: url,
    });
  }, [pathname, searchParams, measurementId]);

  return null;
}

export function GoogleAnalytics({
  measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-0PV54Y30XS",
}: GoogleAnalyticsProps) {
  if (!measurementId) return null;

  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
      <Suspense fallback={null}>
        <AnalyticsTracker measurementId={measurementId} />
      </Suspense>
    </>
  );
}

// Utility function to log custom events into GA4
export function trackEvent(
  action: string,
  params?: Record<string, any>
) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, params);
  }
}
