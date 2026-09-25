"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, Mic } from "lucide-react";

interface VoiceMessagePlayerProps {
  audioUrl: string;
  duration?: number;
  isCurrentUser?: boolean;
}

export function VoiceMessagePlayer({
  audioUrl,
  duration = 0,
  isCurrentUser = false,
}: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Audio playback interrupted:", err);
      });
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !totalDuration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = fraction * totalDuration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSpeed = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressFraction = totalDuration > 0 ? currentTime / totalDuration : 0;
  const barHeights = [40, 65, 80, 50, 90, 75, 45, 85, 95, 60, 70, 90, 55, 80, 45, 65, 75, 85, 50, 60];

  return (
    <div
      className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl transition-all select-none max-w-xs sm:max-w-sm ${
        isCurrentUser
          ? "bg-amber-600/90 text-black border border-amber-400/40 shadow-md"
          : "bg-black/40 dark:bg-white/5 border border-black/10 dark:border-white/10 text-white shadow-sm"
      }`}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play / Pause Circular Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer flex-shrink-0 active:scale-95 ${
          isCurrentUser
            ? "bg-black text-amber-400 hover:bg-neutral-900 shadow-md"
            : "bg-amber-500 text-black hover:bg-amber-400 shadow-md shadow-amber-500/20"
        }`}
        title={isPlaying ? "Pause voice note" : "Play voice note"}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      {/* Audio Waveform Scrubber Bars */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div
          onClick={handleSeek}
          className="flex items-center gap-0.5 h-6 cursor-pointer py-1 group"
          title="Click to seek"
        >
          {barHeights.map((h, idx) => {
            const barFraction = idx / barHeights.length;
            const isFilled = barFraction <= progressFraction;

            return (
              <span
                key={idx}
                className={`flex-1 rounded-full transition-all duration-100 ${
                  isFilled
                    ? isCurrentUser
                      ? "bg-black"
                      : "bg-amber-400"
                    : isCurrentUser
                    ? "bg-black/25 group-hover:bg-black/40"
                    : "bg-white/20 group-hover:bg-white/30"
                }`}
                style={{
                  height: `${isPlaying ? Math.max(20, (h * (0.6 + Math.sin((currentTime * 8) + idx) * 0.4))) : h}%`,
                }}
              />
            );
          })}
        </div>

        {/* Timers & Speed Multiplier */}
        <div className="flex items-center justify-between text-[10px] font-mono leading-none">
          <span className={isCurrentUser ? "text-black/80 font-bold" : "text-zinc-400"}>
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </span>

          <button
            type="button"
            onClick={cycleSpeed}
            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
              isCurrentUser
                ? "bg-black/15 hover:bg-black/25 text-black"
                : "bg-white/10 hover:bg-white/20 text-amber-400"
            }`}
            title="Change playback speed"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>
    </div>
  );
}
