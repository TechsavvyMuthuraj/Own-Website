"use client";

import React, { useState, useEffect } from "react";
import { MuthurajMascotFigure, type MascotExpression } from "./muthuraj-mascot-figure";
import { Sparkles, MessageCircle, Heart } from "lucide-react";
import "./namma-mascot.css";

interface RequestSceneMascotProps {
  isTyping?: boolean;
  isSubmitted?: boolean;
}

type CinematicStep =
  | "walk-in"
  | "look-around"
  | "notice-form"
  | "walk-toward"
  | "hide-behind"
  | "peek"
  | "watching"
  | "wave"
  | "celebrate";

export function RequestSceneMascot({
  isTyping = false,
  isSubmitted = false,
}: RequestSceneMascotProps) {
  const [step, setStep] = useState<CinematicStep>("walk-in");
  const [lookDirection, setLookDirection] = useState<"look-left" | "look-right">("look-left");
  const [isHovered, setIsHovered] = useState(false);
  const [hasCompletedIntro, setHasCompletedIntro] = useState(false);

  // Cinematic Sequence Timeline
  useEffect(() => {
    // 1. Walk In (0s -> 1.8s)
    setStep("walk-in");

    // 2. Look Around (1.8s -> 3.4s)
    const t1 = setTimeout(() => {
      setStep("look-around");
      setLookDirection("look-left");
    }, 1800);

    const t1b = setTimeout(() => {
      setLookDirection("look-right");
    }, 2600);

    // 3. Notice the Request Form (3.4s -> 4.8s)
    const t2 = setTimeout(() => {
      setStep("notice-form");
    }, 3400);

    // 4. Walk Toward the Card (4.8s -> 6.5s)
    const t3 = setTimeout(() => {
      setStep("walk-toward");
    }, 4800);

    // 5. Hide Behind the Card (6.5s -> 8.0s)
    const t4 = setTimeout(() => {
      setStep("hide-behind");
    }, 6500);

    // 6. Peek From the Side (8.0s onwards)
    const t5 = setTimeout(() => {
      setStep("peek");
      setHasCompletedIntro(true);
    }, 8000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t1b);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  // Determine current active visual expression
  let activeExpression: MascotExpression = "normal";
  if (isSubmitted) {
    activeExpression = "celebrate";
  } else if (isHovered) {
    activeExpression = "wave";
  } else if (isTyping && hasCompletedIntro) {
    activeExpression = "watching";
  } else {
    switch (step) {
      case "walk-in":
        activeExpression = "normal";
        break;
      case "look-around":
        activeExpression = lookDirection;
        break;
      case "notice-form":
        activeExpression = "surprised";
        break;
      case "walk-toward":
        activeExpression = "normal";
        break;
      case "hide-behind":
        activeExpression = "peek";
        break;
      case "peek":
        activeExpression = "peek";
        break;
      default:
        activeExpression = "normal";
    }
  }

  // Positioning & Transform based on cinematic timeline step
  let positionStyle: React.CSSProperties = {};
  const isPeekingBehind =
    hasCompletedIntro && !isSubmitted && !isHovered && (step === "hide-behind" || step === "peek");

  // Dynamic z-index: behind card (5) when peeking, foreground (30) when waving/celebrating, neutral (20) otherwise
  const zIndex = isSubmitted || isHovered ? 30 : isPeekingBehind ? 5 : 20;

  if (isSubmitted) {
    // Jump celebration position
    positionStyle = {
      transform: "translateY(-45px) scale(1.15)",
      transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
      zIndex,
    };
  } else if (isHovered) {
    // Pops out to wave
    positionStyle = {
      transform: "translateY(-25px) translateX(-10px) scale(1.08)",
      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      zIndex,
    };
  } else {
    switch (step) {
      case "walk-in":
        positionStyle = {
          transform: "translate(-80px, -40px) scale(0.85) rotate(-6deg)",
          opacity: 0.9,
          transition: "transform 1.8s cubic-bezier(0.25, 1, 0.5, 1)",
          zIndex,
        };
        break;
      case "look-around":
        positionStyle = {
          transform: "translate(-30px, -25px) scale(0.9) rotate(2deg)",
          transition: "transform 1s cubic-bezier(0.25, 1, 0.5, 1)",
          zIndex,
        };
        break;
      case "notice-form":
        positionStyle = {
          transform: "translate(-15px, -20px) scale(1) rotate(-3deg)",
          transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          zIndex,
        };
        break;
      case "walk-toward":
        positionStyle = {
          transform: "translate(0px, -15px) scale(1)",
          transition: "transform 1.6s cubic-bezier(0.25, 1, 0.5, 1)",
          zIndex,
        };
        break;
      case "hide-behind":
        positionStyle = {
          transform: "translate(10px, 32px) scale(0.92)",
          transition: "transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)",
          zIndex,
        };
        break;
      case "peek":
      default:
        positionStyle = {
          transform: isTyping ? "translate(0px, 12px) scale(1)" : "translate(5px, 20px) scale(0.95)",
          transition: "all 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
          zIndex,
        };
        break;
    }
  }

  return (
    <div
      className="absolute -top-14 sm:-top-16 right-6 sm:right-10 pointer-events-auto cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={positionStyle}
    >
      {/* ── Interactive Speech Bubble on Hover or Celebrate ── */}
      {isHovered && !isSubmitted && (
        <div className="absolute -top-12 right-0 sm:right-auto sm:-left-36 z-30 mascot-speech-bubble pointer-events-none">
          <div className="px-3.5 py-1.5 rounded-2xl bg-neutral-950/90 backdrop-blur-xl border border-cyan-500/40 text-[11px] font-semibold text-cyan-300 shadow-xl shadow-cyan-950/40 whitespace-nowrap flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>I&apos;ll help Muthuraj find this for you! ✨</span>
          </div>
        </div>
      )}

      {isSubmitted && (
        <div className="absolute -top-14 -left-20 sm:-left-16 z-30 mascot-speech-bubble pointer-events-none">
          <div className="px-4 py-2 rounded-2xl bg-emerald-950/95 backdrop-blur-xl border border-emerald-500/50 text-xs font-black text-emerald-300 shadow-2xl shadow-emerald-950/60 whitespace-nowrap flex items-center gap-2 animate-bounce">
            <Heart className="w-4 h-4 text-emerald-400 fill-current" />
            <span>Woohoo! Request Received! 🎉</span>
          </div>
        </div>
      )}

      {isTyping && hasCompletedIntro && !isHovered && !isSubmitted && (
        <div className="absolute -top-7 -left-16 z-30 mascot-speech-bubble pointer-events-none">
          <div className="px-2.5 py-1 rounded-xl bg-neutral-950/80 border border-neutral-700/60 text-[10px] font-mono text-neutral-300 shadow-lg whitespace-nowrap flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Taking notes...</span>
          </div>
        </div>
      )}

      {/* Mascot Figure Rendering */}
      <MuthurajMascotFigure
        expression={activeExpression}
        size="md"
        isPeekingFromBehind={isPeekingBehind}
      />
    </div>
  );
}
