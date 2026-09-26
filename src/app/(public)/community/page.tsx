import React from "react";
import type { Metadata } from "next";
import { CommunityHub } from "@/components/community/community-hub";

export const metadata: Metadata = {
  title: "Live Community Hub & Audio/Video Lounge | NammaTech",
  description:
    "Join the verified NammaTech community. Connect in real-time tech channels, discuss 4K cinema releases, and join free WebRTC group voice and video stages.",
  keywords: [
    "NammaTech community",
    "developer chat",
    "4K cinema lounge",
    "voice search",
    "group audio video calls",
    "WebRTC meet",
    "free tech tools Tamil Nadu",
  ],
  alternates: {
    canonical: "https://www.techsavvymuthuraj.dev/community",
  },
  openGraph: {
    title: "Live Community Hub & Audio/Video Lounge | NammaTech",
    description:
      "Connect with tech builders & cinema enthusiasts. Live real-time chat & WebRTC audio/video stage.",
    type: "website",
    images: [
      {
        url: "/images/hero-clean.webp",
        width: 1200,
        height: 630,
        alt: "NammaTech Community Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NammaTech Live Community Hub",
    description: "Real-time tech discussion, cinema talk, and group voice/video lounge.",
  },
};

export const revalidate = 60;

export default function CommunityPage() {
  return (
    <div className="min-h-screen pt-20 sm:pt-28 lg:pt-32 pb-8 sm:pb-16">
      <CommunityHub />
    </div>
  );
}
