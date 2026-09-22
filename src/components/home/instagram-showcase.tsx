"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Play,
  Layers,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface InstagramPost {
  id: string;
  type: "reel" | "post" | "carousel";
  title: string;
  caption: string;
  viewsOrLikes: string;
  comments: string;
  tag: string;
  imageUrl: string;
}

interface InstagramShowcaseProps {
  settings?: Record<string, any>;
}

export function InstagramShowcase({ settings = {} }: InstagramShowcaseProps) {
  if (settings.show_instagram_showcase === false) return null;

  const instagramUrl =
    settings.instagram_url ||
    settings.founder_instagram ||
    "https://www.instagram.com/techiemuthuraj/";
  const handle = settings.instagram_handle || "@techiemuthuraj";
  const displayName =
    settings.instagram_name ||
    "Muthuraj C • Tech Creator, Software Architect & Founder";
  const bioTags =
    settings.instagram_bio_tags ||
    "Daily Tech Reels • Software Tutorials • Cinema News";

  const defaultPosts: InstagramPost[] = [
    {
      id: "ig-1",
      type: "reel",
      title: "Windows 11 Optimization & Secret Tweaks 🔥",
      caption: "FlyOobe 3.0 deep dive — optimize telemetry, debloat apps and unlock max gaming FPS.",
      viewsOrLikes: "24.5K views",
      comments: "382",
      tag: "#Windows11",
      imageUrl: "/images/hero-clean.png",
    },
    {
      id: "ig-2",
      type: "reel",
      title: "Top Verified Android APKs in 2026 📱",
      caption: "Clean, ad-free, and cryptographically verified utilities you can download on NammaTech.",
      viewsOrLikes: "18.2K views",
      comments: "254",
      tag: "#AndroidAPKs",
      imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "ig-3",
      type: "carousel",
      title: "Ultra HD 4K Cinema Releases & Direct Hub 🎬",
      caption: "Streaming blockbusters with lossless audio & multi-resolution download direct links.",
      viewsOrLikes: "31.8K views",
      comments: "492",
      tag: "#4KCinema",
      imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "ig-4",
      type: "reel",
      title: "Behind The Scenes: Building NammaTech ⚡",
      caption: "Zero mock data, real-time database indexing, and guest-first checkout infrastructure.",
      viewsOrLikes: "15.9K views",
      comments: "188",
      tag: "#TechCreator",
      imageUrl: "/images/founder-muthuraj.png",
    },
  ];

  const posts: InstagramPost[] =
    Array.isArray(settings.instagram_posts) && settings.instagram_posts.length > 0
      ? settings.instagram_posts
      : defaultPosts;

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
      <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 p-6 sm:p-10 shadow-2xl">
        {/* Ambient Instagram Gradient Glow Behind Section */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Profile Header Bar */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-neutral-800/80">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Story Gradient Ring around Avatar */}
            <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-lg shadow-rose-500/25 flex-shrink-0">
              <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-2 border-neutral-950 bg-neutral-900">
                <Image
                  src="/images/founder-muthuraj.png"
                  alt="Muthuraj C on Instagram"
                  fill
                  sizes="72px"
                  className="object-cover object-center"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {handle}
                </h3>
                {/* Instagram Verified Badge */}
                <span className="w-5 h-5 rounded-full bg-[#0095F6] text-white flex items-center justify-center text-[10px] shadow-sm">
                  ✓
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-neutral-300">
                {displayName}
              </p>
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <span>{bioTags}</span>
              </div>
            </div>
          </div>

          {/* Follow Button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-rose-500/25 active:scale-95 transition-all"
            >
              <svg
                className="w-4 h-4 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>Follow on Instagram</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>

        {/* Instagram Post & Reel Highlights Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-8">
          {posts.map((post) => (
            <a
              key={post.id}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900 hover:border-neutral-700 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-rose-500/10"
            >
              {/* Post Visual Thumbnail */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-950">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized={post.imageUrl.startsWith("http")}
                />

                {/* Dark Vignette Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top Badge: Reel or Carousel */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                  {post.type === "reel" ? (
                    <>
                      <Play className="w-3 h-3 fill-rose-500 text-rose-500" />
                      <span>Reel</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-3 h-3 text-amber-400" />
                      <span>Post</span>
                    </>
                  )}
                </div>

                {/* Hashtag on Thumbnail */}
                <div className="absolute top-3 right-3 text-[10px] font-mono text-white/80 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md">
                  {post.tag}
                </div>

                {/* Engagement Stats Hover Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-semibold">
                  <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>{post.viewsOrLikes}</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-neutral-300">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{post.comments}</span>
                  </span>
                </div>
              </div>

              {/* Post Caption Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                    {post.caption}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1 text-rose-400 font-semibold group-hover:underline">
                    <span>Watch on Instagram</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Bottom Callout Bar */}
        <div className="relative z-10 mt-8 pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-neutral-400">
            Follow <span className="text-white font-semibold">@techiemuthuraj</span> for daily tech reels, APK tests, tutorials and live updates.
          </p>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
          >
            <span>Explore All Posts on Instagram</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
