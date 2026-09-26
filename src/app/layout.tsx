import type { Metadata, Viewport } from "next";
import {
  Plus_Jakarta_Sans,
  Inter,
  Space_Grotesk,
  DM_Sans,
  Outfit,
  Geist,
  Geist_Mono,
} from "next/font/google";
import "./globals.css";
import { RootProviders } from "@/components/providers/root-providers";
import { GoogleAdSense } from "@/components/ads/google-adsense";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { getAdsGlobalSettings } from "@/lib/ads";
import { AdsProvider } from "@/components/providers/ads-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { ALL_SEO_KEYWORDS } from "@/config/seo-keywords";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const dmSans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: false,
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
  ? process.env.NEXT_PUBLIC_SITE_URL
  : "https://www.techsavvymuthuraj.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | NammaTech",
    default: "NammaTech | Free Software, Movies, APKs, Study Notes & Community Hub",
  },
  description:
    "NammaTech is your premier platform for verified open-source software, Android APKs, 4K movies, micro dramas, study notes, developer articles, live chat community, and 24/7 technical support.",
  keywords: ALL_SEO_KEYWORDS,
  authors: [{ name: "Muthuraj C (Founder of NammaTech)", url: `${siteUrl}/about` }],
  creator: "Muthuraj C",
  publisher: "NammaTech",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: "ta_IN",
    url: siteUrl,
    siteName: "NammaTech",
    title: "NammaTech | Free Software, Movies, APKs, Study Notes & Community Hub",
    description:
      "Explore and download verified open-source software, freeware utilities, Android APKs, developer tools, 4K cinema releases, and study notes. 100% fast, secure, and malware-free.",
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
    title: "NammaTech | Free Software, Movies, APKs, Study Notes & Community Hub",
    description:
      "Download verified open-source software, utilities, Android APKs, 4K cinema, and study notes from NammaTech.",
    images: ["/images/hero-clean.png"],
    creator: "@TechsavvyMuthuraj",
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
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
      alternateName: [
        "nammatech",
        "Namma Tech",
        "namma tech",
        "NammaTech Official",
        "NammaTech Movies",
        "NammaTech Downloads",
        "NammaTech Articles",
        "NammaTech Community",
        "NammaTech Support",
        "Techsavvy Muthuraj",
        "techsavvymuthuraj",
        "techsavvymuthuraj.dev",
      ],
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
        width: 512,
        height: 512,
      },
      sameAs: [
        "https://www.youtube.com/@TechsavvyMuthuraj",
        "https://github.com/TechsavvyMuthuraj",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91 99448 75726",
        contactType: "customer support",
        availableLanguage: ["English", "Tamil"],
      },
      founder: {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: "Muthuraj C",
        alternateName: "Techsavvy Muthuraj",
        jobTitle: "Founder, Software Engineer & Content Creator",
        url: `${siteUrl}/about`,
        sameAs: [
          "https://www.youtube.com/@TechsavvyMuthuraj",
          "https://github.com/TechsavvyMuthuraj",
        ],
        knowsAbout: [
          "Software Engineering",
          "Next.js & React",
          "Full-Stack Web Development",
          "Android APK Security",
          "Tamil Cinema & Media",
          "Technical Support",
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "NammaTech",
      alternateName: [
        "nammatech",
        "Namma Tech",
        "namma tech",
        "NammaTech Movies",
        "NammaTech Articles",
        "NammaTech Downloads",
        "NammaTech Community",
        "NammaTech Support",
        "NammaTech Founder",
        "NammaTech Micro Drama",
        "NammaTech Study Notes",
        "NammaTech APK",
        "Techsavvy Muthuraj",
        "techsavvymuthuraj.dev",
      ],
      description:
        "NammaTech is the premier platform for verified open-source software, Android APKs, 4K movies, micro dramas, study notes, developer articles, live chat community, and instant technical support.",
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
    {
      "@type": "SiteNavigationElement",
      name: [
        "Explore Software",
        "4K Movies & Drama",
        "Tech Articles & Notes",
        "Free Downloads",
        "Community Chat",
        "About Founder",
        "Live Technical Support",
      ],
      url: [
        `${siteUrl}/explore`,
        `${siteUrl}/movies`,
        `${siteUrl}/articles`,
        `${siteUrl}/free`,
        `${siteUrl}/community`,
        `${siteUrl}/about`,
        `${siteUrl}/contact`,
      ],
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { adsEnabled, autoAds, adsterraSettings } = await getAdsGlobalSettings();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${inter.variable} ${spaceGrotesk.variable} ${dmSans.variable} ${outfit.variable} ${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        {/* Resource Preconnections & DNS Prefetch for Fast First Byte */}
        <link rel="preconnect" href="https://rixdlxqktshrwjbaxxcz.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://rixdlxqktshrwjbaxxcz.supabase.co" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://demolishwrestconclusions.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://demolishwrestconclusions.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Google Site Verification */}
        <meta name="google-site-verification" content="google38f31838101be6e4" />
        {/* Google AdSense Meta Verification */}
        <meta name="google-adsense-account" content="ca-pub-1960459798233871" />

        {/* Favicons & Brand Icons (Optimized for Google Search, Mobile, and Desktop) */}
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        {/* Global Structured Data JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsiteAndOrg) }}
        />
        {/* Instant Synchronous Theme Pre-Hydration to prevent theme reset on refresh */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k="nammatech_style_prefs_v1";var r=localStorage.getItem(k);var t="midnight",a="amber",f="jakarta";if(r){var p=JSON.parse(r);if(p.theme==="nordic-light"||p.theme==="light")t="nordic-light";else t="midnight";if(p.accent)a=p.accent;if(p.fontStyle)f=p.fontStyle;}else{var s=localStorage.getItem("theme");if(s==="light")t="nordic-light";else t="midnight";}var d=document.documentElement;d.setAttribute("data-theme",t);d.setAttribute("data-accent",a);d.setAttribute("data-font",f);var isL=(t==="nordic-light");if(isL){d.classList.remove("dark");d.classList.add("light");d.style.colorScheme="light";}else{d.classList.remove("light");d.classList.add("dark");d.style.colorScheme="dark";}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)] antialiased smooth-scroll-ready"
      >
        <GoogleAnalytics />
        <SpeedInsights />
        <Analytics />
        <AdsProvider adsEnabled={adsEnabled} autoAds={autoAds} adsterraSettings={adsterraSettings}>
          <GoogleAdSense autoAds={autoAds} />
          <RootProviders>{children}</RootProviders>
        </AdsProvider>
      </body>
    </html>
  );
}
