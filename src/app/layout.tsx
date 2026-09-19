import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RootProviders } from "@/components/providers/root-providers";
import { GoogleAdSense } from "@/components/ads/google-adsense";
import { getAdsGlobalSettings } from "@/lib/ads";
import { AdsProvider } from "@/components/providers/ads-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
  ? process.env.NEXT_PUBLIC_SITE_URL
  : "https://www.techsavvymuthuraj.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | NammaTech",
    default: "NammaTech - Movies, APKs, Software, AI Tools & Downloads",
  },
  description:
    "Explore and download verified open-source software, freeware utilities, Android APKs, developer tools, UI templates, and 4K cinema releases. Fast, secure, and 100% verified.",
  keywords: [
    "NammaTech",
    "verified digital resources",
    "open-source software download",
    "freeware utilities",
    "developer tools",
    "Android APK downloads",
    "UI templates",
    "4K cinema hub",
    "safe software download",
    "Muthuraj",
  ],
  authors: [{ name: "Muthuraj C", url: `${siteUrl}/about` }],
  creator: "Muthuraj C",
  publisher: "NammaTech",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "NammaTech",
    title: "NammaTech - Verified Digital Resources, Software & Cinema Hub",
    description:
      "Explore and download verified open-source software, freeware utilities, Android APKs, developer tools, and 4K cinema. Fast, secure, and 100% verified.",
    images: [
      {
        url: "/images/hero-clean.png",
        width: 1200,
        height: 630,
        alt: "NammaTech - Everything You Need In One Place",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NammaTech - Verified Digital Resources, Software & Cinema Hub",
    description:
      "Explore and download verified open-source software, freeware utilities, Android APKs, developer tools, and 4K cinema.",
    images: ["/images/hero-clean.png"],
    creator: "@NammaTech",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google38f31838101be6e4",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  other: {
    "google-adsense-account": "ca-pub-1960459798233871",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF9FA" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0C10" },
  ],
};

const jsonLdWebsiteAndOrg = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "NammaTech",
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      founder: {
        "@type": "Person",
        name: "Muthuraj C",
        jobTitle: "Founder & Lead Architect",
        url: `${siteUrl}/about`,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "NammaTech",
      description: "Verified Digital Resources, Software & Cinema Hub",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { adsEnabled, autoAds } = await getAdsGlobalSettings();

  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <head>
        {/* Google Site Verification */}
        <meta name="google-site-verification" content="google38f31838101be6e4" />
        {/* Google AdSense Meta Verification */}
        <meta name="google-adsense-account" content="ca-pub-1960459798233871" />
        {/* Global Structured Data JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsiteAndOrg) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)] antialiased">
        <AdsProvider adsEnabled={adsEnabled} autoAds={autoAds}>
          <GoogleAdSense autoAds={autoAds} />
          <RootProviders>{children}</RootProviders>
        </AdsProvider>
      </body>
    </html>
  );
}
