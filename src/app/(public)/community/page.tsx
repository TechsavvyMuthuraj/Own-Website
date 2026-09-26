import React from "react";
import type { Metadata } from "next";
import { CommunityHub } from "@/components/community/community-hub";

export const metadata: Metadata = {
  title: "Live Community Chat & Developer Forum",
  description:
    "Join the NammaTech community chat. Connect in real-time developer channels, discuss software, share code, talk cinema, and participate in collaborative voice stages.",
  keywords: [
    "NammaTech community",
    "nammatech community",
    "NammaTech chat",
    "nammatech chat",
    "chat",
    "developer chat",
    "tech community",
    "developer forum",
    "coding discussion",
    "free live chat",
    "nammatech live chat",
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
