import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RootProviders } from "@/components/providers/root-providers";
import { GoogleAdSense } from "@/components/ads/google-adsense";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | NammaTech",
    default: "NammaTech - Trusted Digital Resources & Open-Source Software",
  },
  description:
    "NammaTech is a fast, trustworthy digital resource platform for verified open-source software, freeware, developer tools, APKs, templates, and digital assets. All you need. One place.",
  keywords: [
    "NammaTech",
    "open-source software",
    "freeware",
    "developer tools",
    "authorized APKs",
    "digital resources",
    "templates",
    "fonts",
    "icons",
  ],
  authors: [{ name: "NammaTech Team" }],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <head>
        {/* Google AdSense Meta Verification */}
        <meta name="google-adsense-account" content="ca-pub-1960459798233871" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)] antialiased">
        <GoogleAdSense />
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
