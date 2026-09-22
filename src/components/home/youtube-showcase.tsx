"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Play,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Eye,
  Clock,
  Tv,
  RefreshCw,
} from "lucide-react";

export interface YouTubeVideo {
  id: string;
  videoId?: string;
  title: string;
  description: string;
  duration: string;
  views: string;
  tag: string;
  thumbnailUrl: string;
  videoUrl: string;
}

interface YouTubeShowcaseProps {
  settings?: Record<string, any>;
}

const DEFAULT_VIDEOS: YouTubeVideo[] = [
  {
    id: "yt-1",
    videoId: "YCWA1uiY3gs",
    title: "🔥 Multiple OBS at the Same Time?! 😱 | UMINGLE + Recording/Streaming Full Setup",
    description:
      "Multiple OBS Studio instances running simultaneously with virtual cameras, audio routing, and direct recording.",
    duration: "14:28",
    views: "18.5K views",
    tag: "#OBSStudio",
    thumbnailUrl: "https://i.ytimg.com/vi/YCWA1uiY3gs/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/watch?v=YCWA1uiY3gs",
  },
  {
    id: "yt-2",
    videoId: "n9exIjLuJSk",
    title: "#techiemuthuraj Software Tips & Developer Shortcuts",
    description:
      "Quick shorts and essential tools for Windows, Android, and web developers curated by Techie Muthuraj.",
    duration: "0:45",
    views: "24.1K views",
    tag: "#Shorts",
    thumbnailUrl: "https://i.ytimg.com/vi/n9exIjLuJSk/hqdefault.jpg",
    videoUrl: "https://www.youtube.com/shorts/n9exIjLuJSk",
  },
  {
    id: "yt-3",
    videoId: "ytsage-dl",
    title: "YTSage - How to Download YouTube Videos in High Quality | Open Source Media Downloader",
    description:
      "Clean, ad-free, open-source media utility tutorial — multi-resolution 4K/1080p and audio ripping.",
    duration: "09:30",
    views: "31.4K views",
    tag: "#YTSage",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/channel/UCavl9VKjbVWJBsqlVaCiIsw",
  },
  {
    id: "yt-4",
    videoId: "obs-cam-setup",
    title: "OBS Virtual Camera & Audio Routing Setup for Video Calls & Streaming",
    description:
      "Step-by-step masterclass on bypassing virtual camera restrictions with crisp resolution and zero latency.",
    duration: "16:15",
    views: "42.9K views",
    tag: "#VirtualCamera",
    thumbnailUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/channel/UCavl9VKjbVWJBsqlVaCiIsw",
  },
];

export function YouTubeShowcase({ settings = {} }: YouTubeShowcaseProps) {
  if (settings.show_youtube_showcase === false) return null;

  const channelId = settings.youtube_channel_id || "UCavl9VKjbVWJBsqlVaCiIsw";
  const channelUrl =
    settings.youtube_channel_url ||
    settings.founder_youtube ||
    `https://www.youtube.com/channel/${channelId}`;
  const subscribeUrl = `${channelUrl}?sub_confirmation=1`;
  const channelName = settings.youtube_channel_name || "Techie Muthuraj";
  const channelHandle = settings.youtube_handle || "@techiemuthuraj";
  const channelSubtitle =
    settings.youtube_subtitle ||
    "Muthuraj C • Tech Creator, Software Architect & YouTuber";
  const channelTags =
    settings.youtube_tags ||
    "OBS Studio • PC Optimization • Open-Source Utilities • Tamil Tech Tutorials";

  const [videos, setVideos] = useState<YouTubeVideo[]>(DEFAULT_VIDEOS);
  const [loading, setLoading] = useState(false);

  // Fetch real latest videos from YouTube RSS feed
  useEffect(() => {
    let isMounted = true;
    async function loadLatestVideos() {
      try {
        setLoading(true);
        const res = await fetch(`/api/social/youtube?channelId=${encodeURIComponent(channelId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.videos) && data.videos.length > 0 && isMounted) {
            const mapped: YouTubeVideo[] = data.videos.map((v: any) => ({
              id: v.id,
              videoId: v.videoId,
              title: v.title,
              description: v.description || `Watch ${v.title} on YouTube.`,
              duration: v.duration || "12:00",
              views: v.views || "10K+ views",
              tag: v.tag || "#TechieMuthuraj",
              thumbnailUrl: v.thumbnailUrl,
              videoUrl: v.link || channelUrl,
            }));
            setVideos(mapped);
          }
        }
      } catch (e) {
        // Fallback to default catalog on error
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLatestVideos();
    return () => {
      isMounted = false;
    };
  }, [channelId, channelUrl]);

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
      <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 p-6 sm:p-10 shadow-2xl">
        {/* Ambient YouTube Red Gradient Glow Behind Section */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-red-600/15 via-rose-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Channel Header Bar */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-neutral-800/80">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Red Gradient Ring around Channel Avatar */}
            <div className="relative p-[3px] rounded-full bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 shadow-lg shadow-red-600/25 flex-shrink-0">
              <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-2 border-neutral-950 bg-neutral-900">
                <Image
                  src="/images/founder-muthuraj.png"
                  alt={`${channelName} on YouTube`}
                  fill
                  sizes="72px"
                  className="object-cover object-center"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {channelName}
                </h3>
                {/* YouTube Verified Badge */}
                <span className="w-5 h-5 rounded-full bg-neutral-800 text-neutral-300 border border-neutral-700 flex items-center justify-center text-[10px] shadow-sm">
                  ✓
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {channelHandle}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600/20 text-red-400 border border-red-500/30">
                  Official Channel
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-neutral-300">
                {channelSubtitle}
              </p>
              <div className="flex items-center gap-3 text-xs text-neutral-400">
                <span>{channelTags}</span>
              </div>
            </div>
          </div>

          {/* Red YouTube Subscribe Button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href={subscribeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 active:scale-95 transition-all"
            >
              {/* YouTube Play Icon */}
              <div className="w-4 h-4 rounded-md bg-white text-red-600 flex items-center justify-center flex-shrink-0">
                <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
              </div>
              <span>Subscribe on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>

        {/* Video Cards Grid - 4 distinct videos, ZERO DUPLICATES */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          {videos.map((video) => (
            <a
              key={video.id}
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-2xl border border-neutral-800/80 bg-neutral-900/50 hover:bg-neutral-800/50 overflow-hidden transition-all duration-300 hover:border-red-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-950/20"
            >
              {/* Video Thumbnail (Distinct Original Image) */}
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                <Image
                  src={video.thumbnailUrl}
                  alt={video.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized={video.thumbnailUrl.startsWith("http")}
                />

                {/* Dark Gradient Overlay for Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                {/* Video Tag Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-neutral-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>{video.tag}</span>
                </div>

                {/* Duration Chip */}
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-[10px] font-mono font-bold text-white flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-neutral-400" />
                  <span>{video.duration}</span>
                </div>

                {/* Big Center Play Hover Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl shadow-red-950/60 transform scale-75 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Video Card Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-red-400 transition-colors leading-snug">
                    {video.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                    {video.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400">
                  <span className="font-mono text-neutral-300 font-medium">
                    {video.views}
                  </span>
                  <span className="text-red-400 group-hover:underline inline-flex items-center gap-1 font-semibold text-[10px] uppercase tracking-wider">
                    <span>Watch</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Bottom Channel Strip */}
        <div className="mt-8 pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-neutral-400">
            <Tv className="w-4 h-4 text-red-500" />
            <span>
              Watch full tutorials, benchmark tests, and software guides on{" "}
              <strong className="text-white">{channelName}</strong>
            </span>
          </div>
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 font-bold transition-colors"
          >
            <span>Explore All Videos on YouTube</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
