"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Minus,
  Maximize2,
  ExternalLink,
  Play,
  Tv,
  Sparkles,
  ChevronUp,
} from "lucide-react";

interface YouTubeMiniPlayerProps {
  channelId?: string;
  channelName?: string;
  defaultVideoId?: string;
}

export function YouTubeMiniPlayer({
  channelId = "UCavl9VKjbVWJBsqlVaCiIsw",
  channelName = "Techsavvy Muthuraj",
}: YouTubeMiniPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Auto-generate uploads playlist ID by replacing 'UC' with 'UU'
  const uploadsPlaylistId = channelId.startsWith("UC")
    ? `UU${channelId.slice(2)}`
    : `UUavl9VKjbVWJBsqlVaCiIsw`;

  const currentEmbedUrl = selectedVideo
    ? `https://www.youtube-nocookie.com/embed/${selectedVideo}?autoplay=1&rel=0`
    : `https://www.youtube-nocookie.com/embed/videoseries?list=${uploadsPlaylistId}&rel=0`;

  if (isDismissed) return null;

  return (
    <aside aria-label="YouTube Channel Mini Player">
      {/* ── EXPANDED MINI PLAYER WINDOW ── */}
      {isOpen ? (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] rounded-3xl border border-neutral-800 bg-neutral-950/95 backdrop-blur-2xl shadow-2xl shadow-black/80 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/80 bg-neutral-900/60">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* YouTube Play Icon */}
              <div className="w-7 h-7 rounded-xl bg-[#FF0000] flex items-center justify-center text-white shadow-md shadow-red-600/30 flex-shrink-0">
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </div>

              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                  <span>{channelName}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
                <p className="text-[10px] text-neutral-400 truncate">YouTube Channel Mini Player</p>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              <a
                href={`https://www.youtube.com/channel/${channelId}?sub_confirmation=1`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open on YouTube & Subscribe"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="Open on YouTube"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize player"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="Minimize player"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsDismissed(true);
                }}
                title="Close mini player"
                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                aria-label="Close mini player"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 16:9 YouTube Video Embed Player */}
          <div className="relative aspect-video w-full bg-black">
            <iframe
              src={currentEmbedUrl}
              title={`${channelName} YouTube Player`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>

          {/* Player Footer & Quick Channel Actions */}
          <div className="p-3 bg-neutral-950 flex items-center justify-between gap-2 border-t border-neutral-800/60">
            <a
              href={`https://www.youtube.com/channel/${channelId}?sub_confirmation=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF0000] hover:bg-[#E60000] text-white text-[11px] font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all"
            >
              <svg
                className="w-3.5 h-3.5 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span>Subscribe Channel</span>
            </a>

            <button
              type="button"
              onClick={() => setSelectedVideo(null)}
              className="text-[10px] text-neutral-400 hover:text-white transition-colors"
            >
              Play All Uploads
            </button>
          </div>
        </div>
      ) : (
        /* ── COLLAPSED FLOATING DOCK BADGE ── */
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open YouTube Mini Player"
            className="group relative flex items-center gap-2.5 pl-2.5 pr-4 py-2 rounded-full border border-neutral-700/80 bg-neutral-900/95 hover:bg-neutral-800 text-white shadow-2xl shadow-black/80 hover:scale-105 hover:border-red-500/50 active:scale-95 transition-all duration-200 backdrop-blur-xl"
          >
            {/* Ambient Red Neon Halo */}
            <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-red-600/30 to-amber-500/20 blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />

            {/* YouTube Red Icon with Pulse */}
            <span className="relative w-7 h-7 rounded-full bg-[#FF0000] flex items-center justify-center text-white shadow-md shadow-red-600/40 flex-shrink-0 group-hover:rotate-6 transition-transform">
              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
            </span>

            {/* Title & Live Status */}
            <span className="relative flex flex-col items-start leading-tight">
              <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Muthuraj TV</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              </span>
              <span className="text-[9px] font-semibold text-neutral-400 group-hover:text-red-400 transition-colors uppercase tracking-wider">
                Watch Videos
              </span>
            </span>

            <ChevronUp className="relative w-3.5 h-3.5 text-neutral-400 group-hover:text-white group-hover:-translate-y-0.5 transition-all" />
          </button>
        </div>
      )}
    </aside>
  );
}
