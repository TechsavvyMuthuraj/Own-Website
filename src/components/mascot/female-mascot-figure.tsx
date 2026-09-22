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

interface FemaleMascotFigureProps {
  expression?: MascotExpression;
  size?: "sm" | "md" | "lg";
  className?: string;
  isPeekingFromBehind?: boolean;
}

export function FemaleMascotFigure({
  expression = "normal",
  size = "md",
  className = "",
  isPeekingFromBehind = false,
}: FemaleMascotFigureProps) {
  const dimensions = {
    sm: { width: 76, height: 92 },
    md: { width: 104, height: 126 },
    lg: { width: 136, height: 164 },
  }[size];

  // Confetti particles for celebrate state
  const confetti = useMemo(() => {
    return [
      { color: "#38bdf8", tx: -36, ty: -55, rot: 45, delay: "0s" },
      { color: "#f43f5e", tx: 36, ty: -62, rot: -60, delay: "0.1s" },
      { color: "#fbbf24", tx: -46, ty: -35, rot: 90, delay: "0.2s" },
      { color: "#10b981", tx: 46, ty: -40, rot: -30, delay: "0.15s" },
      { color: "#c084fc", tx: 0, ty: -70, rot: 15, delay: "0.05s" },
      { color: "#06b6d4", tx: -20, ty: -65, rot: -75, delay: "0.25s" },
      { color: "#fb7185", tx: 26, ty: -50, rot: 60, delay: "0.12s" },
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
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-pink-500 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-cyan-500/50 border border-white/60">
            !
          </div>
        </div>
      )}

      {/* ── SVG Vector Female Tech Anime Mascot ── */}
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
          {/* Hair Dark Indigo Gradient */}
          <linearGradient id="hairBase" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>

          {/* Hair Cyber Neon Streak */}
          <linearGradient id="hairNeonStreak" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="60%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>

          {/* Skin Soft Anime Gradient */}
          <linearGradient id="skinTone" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff1ea" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>

          {/* Cyber Jacket Metallic Chassis */}
          <linearGradient id="jacketChassis" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Cyber Neon Glow */}
          <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Iris Anime Electric Blue Gradient */}
          <linearGradient id="eyeIris" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#00f0ff" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>

          {/* Soft Glow Filter */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ── 1. Cyber Halo / Floating Tech Ring (Background) ── */}
        {!isPeekingFromBehind && (
          <ellipse
            cx="50"
            cy="24"
            rx="28"
            ry="9"
            stroke="url(#cyanGlow)"
            strokeWidth="1.8"
            strokeDasharray="12 4"
            opacity="0.85"
            filter="url(#softGlow)"
            className="mascot-antenna-glow"
          />
        )}

        {/* ── 2. Back Hair Flow ── */}
        <path
          d="M 26 38 C 18 55 16 80 23 90 C 28 84 32 68 33 55 Z"
          fill="url(#hairBase)"
        />
        <path
          d="M 74 38 C 82 55 84 80 77 90 C 72 84 68 68 67 55 Z"
          fill="url(#hairBase)"
        />
        {/* Soft neon hair accent strip on left */}
        <path
          d="M 23 48 C 19 62 19 76 24 85"
          stroke="url(#hairNeonStreak)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* ── 3. Cyber Jacket / Body (Hidden when peeking behind card) ── */}
        {!isPeekingFromBehind && (
          <g>
            {/* Jacket Torso */}
            <path
              d="M 33 80 L 30 106 C 30 110 38 114 50 114 C 62 114 70 110 70 106 L 67 80 Z"
              fill="url(#jacketChassis)"
              stroke="#334155"
              strokeWidth="1.5"
            />
            {/* Cyber Neon Trim on Jacket Collar */}
            <path
              d="M 44 80 L 44 112 M 50 82 L 50 114 M 56 80 L 56 112"
              stroke="url(#cyanGlow)"
              strokeWidth="1"
              opacity="0.4"
            />
            {/* Chest Core Tech Heart/Beacon */}
            <circle
              cx="50"
              cy="95"
              r="3.5"
              fill="url(#cyanGlow)"
              filter="url(#softGlow)"
              className="mascot-antenna-glow"
            />
          </g>
        )}

        {/* ── 4. Neck & Face Base ── */}
        {/* Neck */}
        {!isPeekingFromBehind && (
          <path d="M 44 70 L 44 82 L 56 82 L 56 70 Z" fill="url(#skinTone)" />
        )}

        {/* Face Shape */}
        <path
          d="M 28 42 C 28 30 38 24 50 24 C 62 24 72 30 72 42 C 72 58 64 74 50 75 C 36 74 28 58 28 42 Z"
          fill="url(#skinTone)"
          stroke="#fbcfe8"
          strokeWidth="0.8"
        />

        {/* Cute Rosy Cheeks Blush */}
        <circle cx="36" cy="58" r="4.5" fill="#fb7185" opacity="0.45" />
        <circle cx="64" cy="58" r="4.5" fill="#fb7185" opacity="0.45" />

        {/* ── 5. Expressive Eyes ── */}
        {expression === "wave" ? (
          /* Happy Crescent Eyes ^_^ */
          <g stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" fill="none">
            <path d="M 34 52 Q 40 44 46 52" />
            <path d="M 54 52 Q 60 44 66 52" />
          </g>
        ) : expression === "celebrate" ? (
          /* Joyful Star Sparkle Eyes ★ ★ */
          <g fill="#00f0ff" filter="url(#softGlow)">
            {/* Left Star Eye */}
            <polygon points="40,43 42,48 47,48 43,51 45,56 40,53 35,56 37,51 33,48 38,48" />
            {/* Right Star Eye */}
            <polygon points="60,43 62,48 67,48 63,51 65,56 60,53 55,56 57,51 53,48 58,48" />
          </g>
        ) : (
          /* Big Anime Expressive Eyes with Pupils */
          <g>
            {/* Eye Sclera (White) */}
            <ellipse cx="40" cy="50" rx="6.5" ry="8" fill="#ffffff" />
            <ellipse cx="60" cy="50" rx="6.5" ry="8" fill="#ffffff" />

            {/* Dynamic Pupils based on Direction */}
            {(() => {
              let pupilXOffset = 0;
              let pupilYOffset = 0;
              if (expression === "look-left") pupilXOffset = -2.5;
              if (expression === "look-right") pupilXOffset = 2.5;
              if (expression === "watching") pupilYOffset = 2;

              return (
                <g>
                  {/* Left Iris */}
                  <ellipse
                    cx={40 + pupilXOffset}
                    cy={50 + pupilYOffset}
                    rx="4.8"
                    ry="6.5"
                    fill="url(#eyeIris)"
                  />
                  {/* Left Inner Pupil */}
                  <ellipse
                    cx={40 + pupilXOffset}
                    cy={50 + pupilYOffset}
                    rx="2.6"
                    ry="3.6"
                    fill="#030712"
                  />
                  {/* Left Eye Sparkle Glints */}
                  <circle cx={38 + pupilXOffset} cy={47 + pupilYOffset} r="1.6" fill="#ffffff" />
                  <circle cx={42 + pupilXOffset} cy={53 + pupilYOffset} r="0.8" fill="#ffffff" />

                  {/* Right Iris */}
                  <ellipse
                    cx={60 + pupilXOffset}
                    cy={50 + pupilYOffset}
                    rx="4.8"
                    ry="6.5"
                    fill="url(#eyeIris)"
                  />
                  {/* Right Inner Pupil */}
                  <ellipse
                    cx={60 + pupilXOffset}
                    cy={50 + pupilYOffset}
                    rx="2.6"
                    ry="3.6"
                    fill="#030712"
                  />
                  {/* Right Eye Sparkle Glints */}
                  <circle cx={58 + pupilXOffset} cy={47 + pupilYOffset} r="1.6" fill="#ffffff" />
                  <circle cx={62 + pupilXOffset} cy={53 + pupilYOffset} r="0.8" fill="#ffffff" />
                </g>
              );
            })()}

            {/* Upper Eyelashes with Anime Wing Flick */}
            <path
              d="M 32 46 Q 40 40 48 46 L 47 44"
              stroke="#0f172a"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 52 46 Q 60 40 68 46 L 69 44"
              stroke="#0f172a"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Soft Cute Eyebrows */}
            <path d="M 34 40 Q 40 37 46 41" stroke="#334155" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M 54 41 Q 60 37 66 40" stroke="#334155" strokeWidth="1.6" strokeLinecap="round" />
          </g>
        )}

        {/* ── 6. Nose & Cute Mouth ── */}
        <circle cx="50" cy="58" r="0.8" fill="#f43f5e" opacity="0.6" />

        {expression === "surprised" ? (
          /* Cute surprised 'o' mouth */
          <ellipse cx="50" cy="65" rx="2.5" ry="3.5" fill="#f43f5e" />
        ) : expression === "celebrate" || expression === "wave" ? (
          /* Cheerful Open Smile */
          <path
            d="M 44 63 Q 50 71 56 63 Z"
            fill="#f43f5e"
            stroke="#e11d48"
            strokeWidth="0.8"
          />
        ) : (
          /* Sweet Gentle Smile */
          <path
            d="M 46 64 Q 50 67 54 64"
            stroke="#e11d48"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        )}

        {/* ── 7. Stylish Front Bangs & Framing Hair Strands ── */}
        {/* Left Framing Bangs */}
        <path
          d="M 28 32 C 34 32 38 40 36 50 C 33 46 30 40 28 32 Z"
          fill="url(#hairBase)"
        />
        {/* Center Bangs with Layered Strands */}
        <path
          d="M 36 28 C 44 26 48 38 47 46 C 45 40 42 34 36 28 Z"
          fill="url(#hairBase)"
        />
        <path
          d="M 46 27 C 52 26 56 36 54 44 C 52 38 49 32 46 27 Z"
          fill="url(#hairBase)"
        />
        {/* Right Framing Bangs */}
        <path
          d="M 54 28 C 62 30 68 40 66 50 C 64 42 60 36 54 28 Z"
          fill="url(#hairBase)"
        />
        {/* Neon Cyber Highlight Strand */}
        <path
          d="M 42 27 Q 45 36 44 44"
          stroke="url(#hairNeonStreak)"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* ── 8. Cyber Headset / Audio Communicator with Glowing Rings ── */}
        {/* Left Headset Piece */}
        <ellipse cx="26" cy="48" rx="3.5" ry="6" fill="#0f172a" stroke="url(#cyanGlow)" strokeWidth="1.5" />
        <circle cx="26" cy="48" r="1.8" fill="url(#cyanGlow)" filter="url(#softGlow)" />

        {/* Right Headset Piece */}
        <ellipse cx="74" cy="48" rx="3.5" ry="6" fill="#0f172a" stroke="url(#cyanGlow)" strokeWidth="1.5" />
        <circle cx="74" cy="48" r="1.8" fill="url(#cyanGlow)" filter="url(#softGlow)" />

        {/* ── 9. Interactive Arms & Hands ── */}

        {/* Resting Hands Clinging onto Card Edge when Peeking */}
        {isPeekingFromBehind && (
          <g filter="url(#softGlow)">
            {/* Left little hand over card top */}
            <rect x="26" y="68" width="9" height="5" rx="2.5" fill="#ffd3be" stroke="#fda4af" strokeWidth="0.8" />
            {/* Right little hand over card top */}
            <rect x="65" y="68" width="9" height="5" rx="2.5" fill="#ffd3be" stroke="#fda4af" strokeWidth="0.8" />
            {/* Cute cyber cuffs */}
            <rect x="25" y="72" width="11" height="3" rx="1.5" fill="#38bdf8" opacity="0.9" />
            <rect x="64" y="72" width="11" height="3" rx="1.5" fill="#38bdf8" opacity="0.9" />
          </g>
        )}

        {/* Waving Hand on Hover */}
        {expression === "wave" && (
          <g className="mascot-state-wave-arm">
            {/* Upper Arm */}
            <path
              d="M 68 83 C 78 78 86 64 88 56"
              stroke="#1e293b"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Hand with Cute Palm */}
            <circle cx="88" cy="55" r="4.5" fill="#fed7aa" />
            <circle cx="91" cy="53" r="1.8" fill="#fed7aa" />
            {/* Cyber Wrist Cuff */}
            <circle cx="87" cy="58" r="3" fill="#38bdf8" filter="url(#softGlow)" />
          </g>
        )}

        {/* Celebratory Raised Hands */}
        {expression === "celebrate" && (
          <g>
            {/* Left Arm High */}
            <path
              d="M 32 82 C 22 75 14 55 12 44"
              stroke="#1e293b"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="12" cy="43" r="4.5" fill="#fed7aa" />
            <circle cx="13" cy="46" r="3" fill="#38bdf8" filter="url(#softGlow)" />

            {/* Right Arm High */}
            <path
              d="M 68 82 C 78 75 86 55 88 44"
              stroke="#1e293b"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="88" cy="43" r="4.5" fill="#fed7aa" />
            <circle cx="87" cy="46" r="3" fill="#38bdf8" filter="url(#softGlow)" />
          </g>
        )}

        {/* Default Resting Arms (when not waving, celebrating, or peeking) */}
        {!isPeekingFromBehind && expression !== "wave" && expression !== "celebrate" && (
          <g>
            {/* Left Hand */}
            <path d="M 33 84 C 28 88 28 94 30 98" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="31" cy="98" r="3" fill="#fed7aa" />

            {/* Right Hand */}
            <path d="M 67 84 C 72 88 72 94 70 98" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="69" cy="98" r="3" fill="#fed7aa" />
          </g>
        )}
      </svg>
    </div>
  );
}
