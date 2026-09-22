"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import "./page-loader.css";

interface PageLoaderProps {
  /** Minimum duration for the animation in milliseconds (default: 6000 for 6s load) */
  duration?: number;
  /** Force show regardless of session or path */
  forceShow?: boolean;
}

// In-memory flag so the animation only plays on initial page load / refresh of the main page,
// and NOT on internal SPA route transitions back to the main page.
// On browser refresh (F5 / pull-to-refresh), the JS runtime resets and this becomes false again.
let hasShownInThisSession = false;

export function PageLoader({
  duration = 6000,
  forceShow = false,
}: PageLoaderProps) {
  const pathname = usePathname();
  const isMainPage = pathname === "/";

  // Only the main page shows the loader on initial load / refresh
  const shouldShow = forceShow || (isMainPage && !hasShownInThisSession);

  const [visible, setVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("INITIALIZING NAMMATECH CORE...");

  // Generate 22 floating micro-sparkles with fixed randomized coordinates
  const particles = useMemo(() => {
    return Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      left: `${(i * 4.6 + 3) % 94}%`,
      top: `${(i * 7.3 + 15) % 85}%`,
      size: `${Math.max(2, (i % 4) + 1.5)}px`,
      duration: `${3 + (i % 4) * 0.8}s`,
      delay: `${(i * 0.25) % 2.5}s`,
    }));
  }, []);

  const finishLoading = useCallback(() => {
    setProgress(100);
    setStatusText("WELCOME TO NAMMATECH");
    setIsFadingOut(true);
    hasShownInThisSession = true;
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("page-loader-finished"));
    }
    // 0.01s instant sync
    setTimeout(() => {
      setVisible(false);
    }, 15);
  }, []);

  useEffect(() => {
    if (!shouldShow) {
      setVisible(false);
      return;
    }

    setVisible(true);
    setIsFadingOut(false);
    setProgress(0);

    const startTime = performance.now();
    let animationFrameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(Math.round(pct));

      if (pct < 25) {
        setStatusText("INITIALIZING NAMMATECH CORE...");
      } else if (pct < 50) {
        setStatusText("CONNECTING ENCRYPTED MAINFRAME...");
      } else if (pct < 75) {
        setStatusText("VERIFYING SECURE DIGITAL ASSETS & APKS...");
      } else if (pct < 98) {
        setStatusText("OPTIMIZING 4K VISUALS & TOOLS...");
      } else {
        finishLoading();
        return;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    // Watchdog timer: safety completion after 6.5 seconds
    const watchdogTimer = setTimeout(() => {
      finishLoading();
    }, duration + 500);

    // Emergency failsafe timer: force unmount if ever delayed
    const emergencyTimer = setTimeout(() => {
      hasShownInThisSession = true;
      setIsFadingOut(true);
      setVisible(false);
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    }, duration + 1000);

    const handleReplay = () => {
      setVisible(true);
      setIsFadingOut(false);
      setProgress(0);
      animationFrameId = requestAnimationFrame(tick);
    };
    window.addEventListener("replay-namma-loader", handleReplay);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(watchdogTimer);
      clearTimeout(emergencyTimer);
      window.removeEventListener("replay-namma-loader", handleReplay);
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, [shouldShow, duration, finishLoading]);

  if (!visible || !shouldShow) return null;

  return (
    <div
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#06070a] text-white select-none transition-opacity duration-75 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100 cursor-default"
      }`}
      style={{
        isolation: "isolate",
        pointerEvents: isFadingOut ? "none" : "auto",
      }}
    >
      {/* 1. Subtle High-Tech Cyber Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none namma-cyber-grid" />

      {/* 2. Deep Ambient Luxury Glow Orbs (Electric Blue & Cyber Cyan) */}
      <div className="absolute top-1/2 left-1/2 w-[550px] sm:w-[700px] h-[550px] sm:h-[700px] rounded-full bg-gradient-to-r from-blue-600/25 via-cyan-500/20 to-blue-500/25 blur-[140px] pointer-events-none namma-ambient-aura z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[450px] h-[350px] sm:h-[450px] rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none z-0" />

      {/* 3. Floating Micro Cyan Particles (Pure CSS, 0% CPU) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <span
            key={p.id}
            className="namma-particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* 4. Vignette Shadow Overlay */}
      <div className="absolute inset-0 z-1 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(6,7,10,0.7)_75%,rgba(4,5,8,0.98)_100%)]" />

      {/* 5. Central Foreground Hero Animation */}
      <div className="relative z-10 flex flex-col items-center px-4 max-w-2xl text-center pointer-events-none">
        {/* Concentric Tech HUD Rings + Expanding Sonar Pulse + Official Logo */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Sonar Ripple Waves */}
          <div className="absolute w-24 sm:w-28 h-24 sm:h-28 rounded-full border border-blue-500/40 namma-sonar-wave pointer-events-none" />
          <div className="absolute w-24 sm:w-28 h-24 sm:h-28 rounded-full border border-cyan-400/30 namma-sonar-wave-delayed pointer-events-none" />

          {/* Outer Dashed HUD Ring */}
          <div className="absolute w-28 sm:w-36 h-28 sm:h-36 rounded-full border border-dashed border-blue-500/35 namma-hud-outer pointer-events-none" />

          {/* Middle Bi-Color Glowing Arc Ring */}
          <div className="absolute w-24 sm:w-32 h-24 sm:h-32 rounded-full border-2 border-transparent border-t-cyan-400/90 border-b-blue-500/70 namma-hud-inner pointer-events-none shadow-[0_0_20px_rgba(14,165,233,0.4)]" />

          {/* Core Official Logo Container */}
          <div className="relative w-18 sm:w-22 h-18 sm:h-22 rounded-3xl bg-gradient-to-br from-blue-400/90 via-cyan-400/80 to-blue-600/90 p-[1.5px] shadow-[0_0_40px_rgba(14,165,233,0.7)]">
            <div className="w-full h-full rounded-[22px] bg-[#0c0d14]/95 backdrop-blur-xl flex items-center justify-center overflow-hidden p-2.5">
              <Image
                src="/logo.png"
                alt="NammaTech Logo"
                width={88}
                height={88}
                priority
                unoptimized
                className="w-full h-full object-contain drop-shadow-[0_0_16px_rgba(14,165,233,0.85)] transition-transform duration-300"
              />
            </div>
          </div>
        </div>

        {/* "NAMMA TECH" Luxury Typography with Rolling Metallic Shimmer */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.24em] uppercase leading-none mb-3 drop-shadow-[0_0_45px_rgba(14,165,233,0.6)]">
          <span className="namma-text-shine">NAMMA TECH</span>
        </h1>

        {/* Tagline */}
        <p className="text-[11px] sm:text-xs font-bold tracking-[0.35em] text-neutral-400/90 uppercase mb-8">
          Movies • APKs • Software • 4K Wallpapers
        </p>

        {/* High-Tech Progress Track (Electric Blue & Cyan Laser) */}
        <div className="w-64 sm:w-80 flex flex-col gap-2.5 mb-6">
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden relative p-[1px] border border-white/10 backdrop-blur-md">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-400 rounded-full shadow-[0_0_20px_rgba(14,165,233,1)] transition-all duration-150 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Glowing Laser Head at front of progress bar */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#ffffff,0_0_18px_#38bdf8]" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono tracking-wider">
            <span className="text-cyan-400/90 font-semibold truncate max-w-[200px]">
              {statusText}
            </span>
            <span className="text-cyan-300 font-bold ml-2">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageLoader;
