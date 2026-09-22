"use client";

import React, { useMemo } from "react";
import "./namma-mascot.css";

export type MascotExpression =
  | "normal"
  | "look-left"
  | "look-right"
  | "surprised"
  | "peek"
  | "watching"
  | "wave"
  | "celebrate";

interface MascotFigureProps {
  expression?: MascotExpression;
  size?: "sm" | "md" | "lg";
  className?: string;
  isPeekingFromBehind?: boolean;
}

export function NammaMascotFigure({
  expression = "normal",
  size = "md",
  className = "",
  isPeekingFromBehind = false,
}: MascotFigureProps) {
  const dimensions = {
    sm: { width: 72, height: 86 },
    md: { width: 100, height: 120 },
    lg: { width: 130, height: 156 },
  }[size];

  // Confetti particles for celebrate state
  const confetti = useMemo(() => {
    return [
      { color: "#38bdf8", tx: -35, ty: -55, rot: 45, delay: "0s" },
      { color: "#f43f5e", tx: 35, ty: -60, rot: -60, delay: "0.1s" },
      { color: "#fbbf24", tx: -45, ty: -35, rot: 90, delay: "0.2s" },
      { color: "#10b981", tx: 45, ty: -40, rot: -30, delay: "0.15s" },
      { color: "#a855f7", tx: 0, ty: -70, rot: 15, delay: "0.05s" },
      { color: "#06b6d4", tx: -20, ty: -65, rot: -75, delay: "0.25s" },
      { color: "#e11d48", tx: 25, ty: -50, rot: 60, delay: "0.12s" },
    ];
  }, []);

  return (
    <div
      className={`relative inline-block select-none pointer-events-none ${className}`}
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      {/* ── Celebration Confetti Burst ── */}
      {expression === "celebrate" && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {confetti.map((c, i) => (
            <span
              key={i}
              className="absolute w-2 h-2 rounded-xs"
              style={
                {
                  backgroundColor: c.color,
                  animation: `mascotConfettiPop 1.2s cubic-bezier(0.1, 0.8, 0.3, 1) infinite`,
                  animationDelay: c.delay,
                  "--tx": `${c.tx}px`,
                  "--ty": `${c.ty}px`,
                  "--rot": `${c.rot}deg`,
                  boxShadow: `0 0 6px ${c.color}`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* ── Surprised "!" Exclamation Icon Bubble ── */}
      {expression === "surprised" && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 mascot-state-notice-excl">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-cyan-500/50 border border-white/40">
            !
          </div>
        </div>
      )}

      {/* ── SVG Vector Character ── */}
      <svg
        viewBox="0 0 100 120"
        width={dimensions.width}
        height={dimensions.height}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full filter drop-shadow-xl transition-transform duration-300 ${
          expression === "celebrate"
            ? "mascot-state-celebrate"
            : expression === "watching"
            ? "mascot-state-watching"
            : "mascot-state-hover-idle"
        }`}
      >
        <defs>
          {/* Cyber Body Metallic Gradient */}
          <linearGradient id="cyberChassis" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Visor Glass Gradient */}
          <linearGradient id="cyberVisor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#030712" />
            <stop offset="100%" stopColor="#0b1329" />
          </linearGradient>

          {/* Electric Blue Neon Core Glow */}
          <linearGradient id="cyanNeon" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Thruster Plume / Hover Jet (Hidden when peeking behind card) */}
        {!isPeekingFromBehind && (
          <g className="mascot-thruster">
            <ellipse cx="50" cy="108" rx="8" ry="5" fill="url(#cyanNeon)" opacity="0.8" filter="url(#neonGlow)" />
            <ellipse cx="50" cy="111" rx="4" ry="7" fill="#ffffff" opacity="0.9" />
          </g>
        )}

        {/* 2. Antenna Pole & Glowing Beacon */}
        <g>
          <line x1="50" y1="26" x2="50" y2="12" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          {/* Antenna Tip Glowing Ball */}
          <circle
            cx="50"
            cy="11"
            r="4.5"
            fill="url(#cyanNeon)"
            className="mascot-antenna-glow"
            filter="url(#neonGlow)"
          />
        </g>

        {/* 3. Ear Sensors / Dials (Left & Right) */}
        <g>
          {/* Left Ear Sensor */}
          <rect x="18" y="44" width="6" height="18" rx="3" fill="#334155" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="21" cy="53" r="1.5" fill="#38bdf8" />

          {/* Right Ear Sensor */}
          <rect x="76" y="44" width="6" height="18" rx="3" fill="#334155" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="79" cy="53" r="1.5" fill="#38bdf8" />
        </g>

        {/* 4. Head / Helmet Chassis */}
        <rect
          x="21"
          y="25"
          width="58"
          height="54"
          rx="22"
          fill="url(#cyberChassis)"
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Specular Helmet Top Glare */}
        <path
          d="M 32 28 Q 50 24 68 28"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* 5. Face Visor Display */}
        <rect
          x="26"
          y="35"
          width="48"
          height="35"
          rx="14"
          fill="url(#cyberVisor)"
          stroke="#1e293b"
          strokeWidth="1.2"
        />

        {/* Visor Specular Glass Reflection */}
        <path
          d="M 30 38 L 48 38 L 36 65 L 30 65 Z"
          fill="rgba(255, 255, 255, 0.05)"
        />

        {/* ── 6. EYES & VISOR EXPRESSIONS ── */}

        {/* A. Normal / Idle Eyes */}
        {expression === "normal" && (
          <g filter="url(#neonGlow)">
            <ellipse cx="41" cy="51" rx="4.5" ry="6" fill="#38bdf8" />
            <ellipse cx="59" cy="51" rx="4.5" ry="6" fill="#38bdf8" />
            {/* Eye reflections */}
            <circle cx="42.5" cy="49" r="1.5" fill="#ffffff" />
            <circle cx="60.5" cy="49" r="1.5" fill="#ffffff" />
          </g>
        )}

        {/* B. Look Left Eyes */}
        {expression === "look-left" && (
          <g filter="url(#neonGlow)">
            <ellipse cx="37" cy="51" rx="4.5" ry="6" fill="#38bdf8" />
            <ellipse cx="54" cy="51" rx="4.5" ry="6" fill="#38bdf8" />
            <circle cx="36" cy="49" r="1.5" fill="#ffffff" />
            <circle cx="53" cy="49" r="1.5" fill="#ffffff" />
          </g>
        )}

        {/* C. Look Right Eyes */}
        {expression === "look-right" && (
          <g filter="url(#neonGlow)">
            <ellipse cx="46" cy="51" rx="4.5" ry="6" fill="#38bdf8" />
            <ellipse cx="63" cy="51" rx="4.5" ry="6" fill="#38bdf8" />
            <circle cx="48" cy="49" r="1.5" fill="#ffffff" />
            <circle cx="65" cy="49" r="1.5" fill="#ffffff" />
          </g>
        )}

        {/* D. Surprised Eyes (Noticing form) */}
        {expression === "surprised" && (
          <g filter="url(#neonGlow)">
            <circle cx="40" cy="50" r="7" fill="#38bdf8" />
            <circle cx="60" cy="50" r="7" fill="#38bdf8" />
            <circle cx="40" cy="50" r="2.5" fill="#ffffff" />
            <circle cx="60" cy="50" r="2.5" fill="#ffffff" />
          </g>
        )}

        {/* E. Peek / Curious Eyes */}
        {expression === "peek" && (
          <g filter="url(#neonGlow)">
            <ellipse cx="44" cy="51" rx="5" ry="6" fill="#38bdf8" />
            <ellipse cx="61" cy="51" rx="4" ry="4" fill="#38bdf8" />
            <circle cx="45" cy="49" r="1.5" fill="#ffffff" />
          </g>
        )}

        {/* F. Watching You Type */}
        {expression === "watching" && (
          <g filter="url(#neonGlow)">
            <ellipse cx="41" cy="53" rx="5.5" ry="6.5" fill="#00f0ff" />
            <ellipse cx="59" cy="53" rx="5.5" ry="6.5" fill="#00f0ff" />
            <circle cx="42" cy="51" r="2" fill="#ffffff" />
            <circle cx="60" cy="51" r="2" fill="#ffffff" />
            {/* Small focus pupils */}
            <circle cx="40" cy="54" r="1" fill="#0369a1" />
            <circle cx="58" cy="54" r="1" fill="#0369a1" />
          </g>
        )}

        {/* G. Wave / Happy Smile Arc Eyes (^ _ ^) */}
        {(expression === "wave" || expression === "celebrate") && (
          <g filter="url(#neonGlow)">
            {/* Happy Left Arc Eye */}
            <path
              d="M 35 53 Q 41 46 47 53"
              stroke="#38bdf8"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Happy Right Arc Eye */}
            <path
              d="M 53 53 Q 59 46 65 53"
              stroke="#38bdf8"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Cute Cheerful Blush Spots */}
            <circle cx="34" cy="58" r="2.5" fill="#f43f5e" opacity="0.75" />
            <circle cx="66" cy="58" r="2.5" fill="#f43f5e" opacity="0.75" />
          </g>
        )}

        {/* 7. Lower Torso & Reactor Core (Hidden if peeking behind card) */}
        {!isPeekingFromBehind && (
          <g>
            <rect
              x="34"
              y="79"
              width="32"
              height="24"
              rx="10"
              fill="url(#cyberChassis)"
              stroke="#334155"
              strokeWidth="1.2"
            />
            {/* Chest Reactor Core */}
            <circle
              cx="50"
              cy="90"
              r="4.5"
              fill="url(#cyanNeon)"
              filter="url(#neonGlow)"
              className="mascot-antenna-glow"
            />
          </g>
        )}

        {/* 8. Arms & Hands */}

        {/* Resting hands when peeking behind card edge */}
        {isPeekingFromBehind && (
          <g filter="url(#neonGlow)">
            {/* Little robotic hands clinging onto the card border */}
            <rect x="25" y="72" width="10" height="5" rx="2.5" fill="#38bdf8" />
            <rect x="65" y="72" width="10" height="5" rx="2.5" fill="#38bdf8" />
          </g>
        )}

        {/* Waving Arm on Hover */}
        {expression === "wave" && (
          <g className="mascot-state-wave-arm">
            <path
              d="M 68 83 C 78 78 86 64 88 56"
              stroke="#334155"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Hand */}
            <circle cx="88" cy="55" r="4.5" fill="#38bdf8" filter="url(#neonGlow)" />
            <circle cx="91" cy="53" r="2" fill="#38bdf8" />
          </g>
        )}

        {/* Celebrating Raised Arms */}
        {expression === "celebrate" && (
          <g>
            {/* Left Arm High */}
            <path
              d="M 32 82 C 22 75 14 55 12 44"
              stroke="#334155"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="12" cy="43" r="4.5" fill="#38bdf8" filter="url(#neonGlow)" />

            {/* Right Arm High */}
            <path
              d="M 68 82 C 78 75 86 55 88 44"
              stroke="#334155"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="88" cy="43" r="4.5" fill="#38bdf8" filter="url(#neonGlow)" />
          </g>
        )}

        {/* Default Resting Arms (when not waving or celebrating) */}
        {!isPeekingFromBehind && expression !== "wave" && expression !== "celebrate" && (
          <g>
            {/* Left Hand */}
            <path d="M 33 84 C 28 88 28 94 30 98" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="31" cy="98" r="3" fill="#475569" />

            {/* Right Hand */}
            <path d="M 67 84 C 72 88 72 94 70 98" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="69" cy="98" r="3" fill="#475569" />
          </g>
        )}
      </svg>
    </div>
  );
}
