"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { Sparkles, ShieldCheck, Cpu } from "lucide-react";
import "./page-loader.css";

interface PageLoaderProps {
  /** Minimum duration for the animation in milliseconds (default: 1600) */
  duration?: number;
  /** Force show on every mount regardless of session storage (default: true for full page reload) */
  forceShow?: boolean;
}

export function PageLoader({
  duration = 500,
  forceShow = false,
}: PageLoaderProps) {
  const [visible, setVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("INITIALIZING NAMMATECH CORE...");

  // Generate 20 floating micro-sparkles with fixed randomized coordinates
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
    setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem("nammatech_loader_shown", "true");
      } catch {}
    }, 300);
  }, []);

  useEffect(() => {
    if (!forceShow) {
      try {
        if (sessionStorage.getItem("nammatech_loader_shown") === "true") {
          return;
        }
      } catch {}
    }

    setVisible(true);

    if (typeof document !== "undefined" && document.readyState === "complete") {
      finishLoading();
      return;
    }

    const startTime = performance.now();
    let animationFrameId: number;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(Math.round(pct));

      if (pct < 30) {
        setStatusText("INITIALIZING NAMMATECH CORE...");
      } else if (pct < 65) {
        setStatusText("VERIFYING SECURE DIGITAL ASSETS...");
      } else if (pct < 95) {
        setStatusText("OPTIMIZING 4K VISUALS & TOOLS...");
      } else {
        finishLoading();
        return;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    const handleLoad = () => finishLoading();
    window.addEventListener("load", handleLoad);

    const handleReplay = () => {
      setVisible(true);
      setIsFadingOut(false);
      setProgress(0);
    };
    window.addEventListener("replay-namma-loader", handleReplay);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("load", handleLoad);
      window.removeEventListener("replay-namma-loader", handleReplay);
    };
  }, [duration, finishLoading, forceShow]);

  if (!visible) return null;

  return (
    <div
      onClick={finishLoading}
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#06070a] text-white cursor-pointer select-none transition-all duration-600 ease-out ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
      style={{ isolation: "isolate" }}
    >
      {/* 1. Subtle High-Tech Cyber Grid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none namma-cyber-grid" />

      {/* 2. Deep Ambient Luxury Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 w-[550px] sm:w-[700px] h-[550px] sm:h-[700px] rounded-full bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-600/15 blur-[140px] pointer-events-none namma-ambient-aura z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[450px] h-[350px] sm:h-[450px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none z-0" />

      {/* 3. Floating Micro Golden Particles (Pure CSS, 0% CPU) */}
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
        {/* Holographic Verification Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase mb-8 shadow-[0_0_25px_rgba(245,158,11,0.25)] backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>VERIFIED DIGITAL HUB</span>
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
        </div>

        {/* Concentric Tech HUD Rings + Expanding Sonar Pulse + Official Logo */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Sonar Ripple Waves */}
          <div className="absolute w-24 sm:w-28 h-24 sm:h-28 rounded-full border border-amber-500/40 namma-sonar-wave pointer-events-none" />
          <div className="absolute w-24 sm:w-28 h-24 sm:h-28 rounded-full border border-yellow-400/30 namma-sonar-wave-delayed pointer-events-none" />

          {/* Outer Dashed HUD Ring */}
          <div className="absolute w-28 sm:w-36 h-28 sm:h-36 rounded-full border border-dashed border-amber-500/35 namma-hud-outer pointer-events-none" />

          {/* Middle Bi-Color Glowing Arc Ring */}
          <div className="absolute w-24 sm:w-32 h-24 sm:h-32 rounded-full border-2 border-transparent border-t-amber-400/80 border-b-cyan-400/60 namma-hud-inner pointer-events-none shadow-[0_0_20px_rgba(245,158,11,0.3)]" />

          {/* Core Official Logo Container */}
          <div className="relative w-18 sm:w-22 h-18 sm:h-22 rounded-3xl bg-gradient-to-br from-amber-400/90 via-yellow-500/80 to-amber-600/90 p-[1.5px] shadow-[0_0_40px_rgba(245,158,11,0.7)]">
            <div className="w-full h-full rounded-[22px] bg-[#0c0d14]/95 backdrop-blur-xl flex items-center justify-center overflow-hidden p-2.5">
              <Image
                src="/logo.png"
                alt="NammaTech Logo"
                width={88}
                height={88}
                priority
                className="w-full h-full object-contain drop-shadow-[0_0_16px_rgba(245,158,11,0.8)] transition-transform duration-300"
              />
            </div>
          </div>
        </div>

        {/* "NAMMA TECH" Luxury Typography with Rolling Metallic Shimmer */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.24em] uppercase leading-none mb-3 drop-shadow-[0_0_45px_rgba(245,158,11,0.55)]">
          <span className="namma-text-shine">NAMMA TECH</span>
        </h1>

        {/* Tagline */}
        <p className="text-[11px] sm:text-xs font-bold tracking-[0.35em] text-neutral-400/90 uppercase mb-8">
          Movies • APKs • Software • 4K Wallpapers
        </p>

        {/* High-Tech Progress Track */}
        <div className="w-64 sm:w-80 flex flex-col gap-2.5 mb-6">
          <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden relative p-[1px] border border-white/10 backdrop-blur-md">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-400 rounded-full shadow-[0_0_20px_rgba(245,158,11,1)] transition-all duration-150 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Glowing Laser Head at front of progress bar */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono tracking-wider">
            <span className="text-amber-400/90 font-semibold truncate max-w-[200px]">
              {statusText}
            </span>
            <span className="text-amber-300 font-bold ml-2">
              {progress}%
            </span>
          </div>
        </div>

        {/* Click anywhere to enter hint */}
        <span className="text-[10px] font-medium tracking-[0.2em] text-neutral-500 uppercase transition-opacity duration-300 hover:text-neutral-300">
          Click anywhere to enter
        </span>
      </div>
    </div>
  );
}

export default PageLoader;
