"use client";

import React, { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User, ArrowRight, Loader2, AlertCircle, Clock, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import GlitchText from "@/components/ui/GlitchText";


const Hyperspeed = dynamic(() => import("@/components/ui/Hyperspeed"), { ssr: false });

const HYPERSPEED_OPTIONS = {
  distortion: "turbulentDistortion",
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 4,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5] as [number, number],
  lightStickHeight: [1.3, 1.7] as [number, number],
  movingAwaySpeed: [60, 80] as [number, number],
  movingCloserSpeed: [-120, -160] as [number, number],
  carLightsLength: [12, 80] as [number, number],
  carLightsRadius: [0.05, 0.14] as [number, number],
  carWidthPercentage: [0.3, 0.5] as [number, number],
  carShiftX: [-0.8, 0.8] as [number, number],
  carFloorSeparation: [0, 5] as [number, number],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0xffffff,
    brokenLines: 0xffffff,
    leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
    rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
    sticks: 0x03b3c3,
  },
};


function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: fullName.trim(), is_approved: false } },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com")
          .split(",").map((e) => e.trim().toLowerCase());
        const isRootAdmin = email && adminEmails.includes(email.trim().toLowerCase());

        if (isRootAdmin) {
          router.push(redirectUrl);
          router.refresh();
        } else {
          await supabase.auth.signOut();
          setIsSubmitted(true);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected registration error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Shared input focus/blur handlers
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(253,24,67,0.5)";
    e.target.style.boxShadow = "0 0 0 3px rgba(253,24,67,0.1)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(255,255,255,0.1)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div
      className="w-full max-w-md mx-auto p-8 rounded-2xl relative z-10"
      style={{
        background: "rgba(8, 4, 14, 0.72)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 0.09)",
        boxShadow: "0 24px 64px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* Brand Header */}
      <div className="text-center mb-7">
        <Link href="/" className="inline-flex flex-col items-center gap-3 mb-5 group">
          <div className="rounded-full overflow-hidden"
            style={{ width: 72, height: 72, boxShadow: "0 0 0 2px rgba(255,255,255,0.12), 0 8px 24px rgba(0,0,0,0.5)" }}>
            <Image
              src="/images/nammatech-logo.png"
              alt="NammaTech"
              width={72}
              height={72}
              className="w-full h-full object-cover"
              priority
              unoptimized
            />
          </div>
        </Link>

        {!isSubmitted && (
          <>
            <div className="mb-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                Create <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Account</span>
              </h1>
            </div>
            <p className="text-xs text-neutral-400">
              Join to download verified resources and manage your orders.
            </p>
          </>
        )}
      </div>

      {isSubmitted ? (
        /* ── Success State ── */
        <div className="text-center py-2 space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border"
            style={{ background: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.25)" }}>
            <Clock className="w-7 h-7 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Account Created!</h2>
            <p className="text-xs font-semibold text-amber-400 mt-1">Awaiting admin approval</p>
          </div>
          <div className="p-4 rounded-xl text-left text-xs leading-relaxed space-y-2"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p style={{ color: "rgba(255,255,255,0.6)" }}>
              Account for <span className="font-mono font-semibold text-white">{email}</span> has been created.
              An admin must approve it before you can log in.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-1">
            <Link href="/auth/login"
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold text-white"
              style={{ background: "#FD1843", boxShadow: "0 4px 20px rgba(253,24,67,0.3)" }}>
              <span>Go to Login</span><ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/"
              className="py-2.5 rounded-xl text-xs font-semibold text-center transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}>
              Back to Home
            </Link>
          </div>
        </div>
      ) : (
        /* ── Register Form ── */
        <>
          {errorMsg && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl mb-5 text-xs"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
                <input
                  type="text" required value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Smith"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                Password <span style={{ color: "rgba(255,255,255,0.3)" }}>(min 6 characters)</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
                <input
                  type={showPassword ? "text" : "password"} required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={onFocus} onBlur={onBlur}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "rgba(255,255,255,0.3)" }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60 mt-1"
              style={{ background: loading ? "rgba(253,24,67,0.6)" : "#FD1843", boxShadow: "0 4px 20px rgba(253,24,67,0.3)" }}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating account...</span></>
              ) : (
                <><span>Register</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 text-center text-xs"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }}>
            Already have an account?{" "}
            <Link href={`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`}
              className="font-semibold hover:underline" style={{ color: "#FD1843" }}>
              Sign in
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div
      className="relative isolate min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "#000000" }}
    >
      {/* Hyperspeed WebGL highway animation fills the entire background */}
      <div className="absolute inset-0 z-0">
        <Hyperspeed effectOptions={HYPERSPEED_OPTIONS} />
      </div>

      {/* Dark vignette behind the card for legibility */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Card wrapper */}
      <div className="relative z-10 w-full px-4 py-12" style={{ maxWidth: 480, margin: "0 auto" }}>
        <Suspense fallback={<div className="text-xs text-center" style={{ color: "rgba(255,255,255,0.3)" }}>Loading...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
