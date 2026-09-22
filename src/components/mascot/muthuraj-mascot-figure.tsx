"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Sparkles, Heart } from "lucide-react";
import "./namma-mascot.css";

export type MascotPose =
  | "run" // Running forward with backpack ("Always Forward >>")
  | "think" // Hand on chin thinking ("Ideas into Reality 💡")
  | "peek-side" // Peeking from behind door/edge with "Hey There! 👋"
  | "peek-card" // Peeking over white card with hands on top edge
  | "point" // Sitting with laptop pointing ("Let's Build Together 💙")
  | "celebrate"; // Full figure leaning with pink flowers ("Same Guy Bigger Dreams")

export type MascotExpression =
  | "normal"
  | "look-left"
  | "look-right"
  | "surprised"
  | "peek"
  | "watching"
  | "wave"
  | "celebrate";

interface MuthurajMascotFigureProps {
  expression?: MascotExpression;
  size?: "sm" | "md" | "lg";
  className?: string;
  isPeekingFromBehind?: boolean;
}

// Map logical cinematic expressions to the exact cropped artwork
function getPoseForExpression(expression: MascotExpression, isPeeking: boolean): MascotPose {
  if (expression === "celebrate") return "celebrate";
  if (expression === "watching") return "point";
  if (expression === "wave") return "peek-side";
  if (expression === "surprised") return "think";
  if (expression === "look-left" || expression === "look-right") return "think";
  if (expression === "peek" || isPeeking) return "peek-card";
  return "run"; // normal / walk-in / walk-toward
}

const POSE_IMAGES: Record<MascotPose, { src: string; alt: string; aspect: string }> = {
  run: {
    src: "/images/mascot/mascot-run.png",
    alt: "Muthuraj Running Forward",
    aspect: "aspect-[185/305]",
  },
  think: {
    src: "/images/mascot/mascot-think.png",
    alt: "Muthuraj Thinking",
    aspect: "aspect-[190/300]",
  },
  "peek-side": {
    src: "/images/mascot/mascot-peek-side.png",
    alt: "Muthuraj Peeking Hey There",
    aspect: "aspect-[130/275]",
  },
  "peek-card": {
    src: "/images/mascot/mascot-peek-card.png",
    alt: "Muthuraj Peeking Over Card",
    aspect: "aspect-[250/180]",
  },
  point: {
    src: "/images/mascot/mascot-point.png",
    alt: "Muthuraj Laptop Pointing",
    aspect: "aspect-[245/255]",
  },
  celebrate: {
    src: "/images/mascot/mascot-celebrate.png",
    alt: "Muthuraj Celebrating With Flowers",
    aspect: "aspect-[285/625]",
  },
};

export function MuthurajMascotFigure({
  expression = "normal",
  size = "md",
  className = "",
  isPeekingFromBehind = false,
}: MuthurajMascotFigureProps) {
  const pose = getPoseForExpression(expression, isPeekingFromBehind);
  const poseInfo = POSE_IMAGES[pose];

  const sizeStyles = {
    sm: "w-20 sm:w-24",
    md: "w-28 sm:w-36",
    lg: "w-40 sm:w-48",
  }[size];

  // Confetti particles for celebrate state
  const confetti = useMemo(() => {
    return [
      { color: "#38bdf8", tx: -40, ty: -65, rot: 45, delay: "0s" },
      { color: "#f43f5e", tx: 40, ty: -70, rot: -60, delay: "0.1s" },
      { color: "#fbbf24", tx: -50, ty: -40, rot: 90, delay: "0.2s" },
      { color: "#10b981", tx: 50, ty: -45, rot: -30, delay: "0.15s" },
      { color: "#a855f7", tx: 0, ty: -85, rot: 15, delay: "0.05s" },
      { color: "#06b6d4", tx: -25, ty: -75, rot: -75, delay: "0.25s" },
      { color: "#e11d48", tx: 30, ty: -55, rot: 60, delay: "0.12s" },
    ];
  }, []);

  return (
    <div
      className={`relative inline-block select-none pointer-events-none transition-all duration-300 ${sizeStyles} ${className}`}
    >
      {/* ── Celebration Confetti Burst ── */}
      {expression === "celebrate" && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
          {confetti.map((c, i) => (
            <span
              key={i}
              className="absolute w-2.5 h-2.5 rounded-xs"
              style={
                {
                  backgroundColor: c.color,
                  animation: `mascotConfettiPop 1.2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite`,
                  animationDelay: c.delay,
                  "--tx": `${c.tx}px`,
                  "--ty": `${c.ty}px`,
                  "--rot": `${c.rot}deg`,
                  boxShadow: `0 0 8px ${c.color}`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* ── Surprised "!" Exclamation Icon Bubble ── */}
      {expression === "surprised" && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 mascot-state-notice-excl">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-cyan-500/50 border border-white/60">
            !
          </div>
        </div>
      )}

      {/* ── Soft Ambient Glow Aura ── */}
      <div className="absolute inset-2 -z-10 rounded-full bg-cyan-500/20 blur-xl scale-95 opacity-80" />

      {/* ── Cropped Character Avatar Image with Smooth Blend ── */}
      <div
        className={`relative overflow-hidden rounded-2xl filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] transition-transform duration-300 ${
          expression === "celebrate"
            ? "mascot-state-celebrate"
            : expression === "watching"
            ? "mascot-state-watching"
            : "mascot-state-hover-idle"
        }`}
      >
        <Image
          src={poseInfo.src}
          alt={poseInfo.alt}
          width={400}
          height={400}
          priority
          className="w-full h-auto object-contain select-none pointer-events-none"
        />
      </div>
    </div>
  );
}
