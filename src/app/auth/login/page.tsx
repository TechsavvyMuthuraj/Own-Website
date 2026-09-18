"use client";

import React, { useState, Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, Clock, Home, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import GlitchText from "@/components/ui/GlitchText";


const Hyperspeed = dynamic(() => import("@/components/ui/Hyperspeed"), { ssr: false });


function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [pendingApproval, setPendingApproval] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com")
          .split(",")
          .map((e) => e.trim().toLowerCase());

        const isUserAdmin =
          (data.user.email && adminEmails.includes(data.user.email.toLowerCase())) ||
          profile?.role === "ADMIN" ||
          profile?.role === "SUPER_ADMIN";

        const isApproved =
          isUserAdmin ||
          Boolean(data.user.email_confirmed_at) ||
          data.user.app_metadata?.is_approved === true ||
          data.user.user_metadata?.is_approved === true;

        if (!isApproved) {
          await supabase.auth.signOut();
          setPendingEmail(data.user.email || email);
          setPendingApproval(true);
          setLoading(false);
          return;
        }

        if (isUserAdmin) {
          router.push(redirectUrl === "/account" || redirectUrl.startsWith("/admin") ? "/admin" : redirectUrl);
        } else {
          router.push(redirectUrl);
        }
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected login error occurred.");
      setLoading(false);
    }
  };

  if (pendingApproval) {
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
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 border"
            style={{ background: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.25)" }}>
            <Clock className="w-7 h-7 text-amber-400 animate-pulse" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Account Pending Approval</h2>
          <p className="text-xs font-semibold text-amber-400 mb-5">Waiting for admin to approve your account</p>
          <div className="p-4 rounded-xl text-left text-xs leading-relaxed space-y-2 mb-6"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-white/60">
              Your account for{" "}
              <span className="font-mono font-semibold text-white">{pendingEmail}</span>{" "}
              is awaiting administrator approval. This usually happens within 24 hours.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-all"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Home className="w-4 h-4" /> Back to Home
            </Link>
            <button type="button"
              onClick={() => { setPendingApproval(false); setErrorMsg(""); }}
              className="text-xs text-white/40 hover:text-white/70 transition-colors py-2"
            >
              Try a different account
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex flex-col items-center gap-3 mb-5 group">
          <div className="w-18 h-18 rounded-full overflow-hidden transition-all"
            style={{ width: 72, height: 72, boxShadow: "0 0 0 2px rgba(255,255,255,0.12), 0 8px 24px rgba(0,0,0,0.5)" }}>
            <Image
              src="/images/nammatech-logo.png"
              alt="NammaTech"
              width={72}
              height={72}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <span className="text-sm font-semibold tracking-wide" style={{ color: "rgba(255,255,255,0.75)" }}>
            NammaTech
          </span>
        </Link>
        <div className="mb-2">
          <GlitchText
            speed={1.2}
            enableShadows={true}
            enableOnHover={true}
            className="!text-2xl !font-extrabold !tracking-tight !cursor-default"
          >
            Welcome Back
          </GlitchText>
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          Sign in to access your downloads and account settings.
        </p>
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl mb-5 text-xs"
          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(253,24,67,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(253,24,67,0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>Password</label>
            <Link href="/auth/forgot-password"
              className="text-[10px] font-medium hover:underline transition-colors"
              style={{ color: "rgba(253,24,67,0.8)" }}>
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onFocus={(e) => { e.target.style.borderColor = "rgba(253,24,67,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(253,24,67,0.1)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "rgba(255,255,255,0.3)" }}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setRememberMe(!rememberMe)}
            className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: rememberMe ? "#FD1843" : "rgba(255,255,255,0.05)",
              border: rememberMe ? "1px solid #FD1843" : "1px solid rgba(255,255,255,0.15)",
            }}
          >
            {rememberMe && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Remember me</span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60 mt-1"
          style={{
            background: loading ? "rgba(253,24,67,0.6)" : "#FD1843",
            boxShadow: "0 4px 20px rgba(253,24,67,0.3)",
          }}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /><span>Signing in...</span></>
          ) : (
            <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 pt-5 text-center text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }}>
        Don&apos;t have an account?{" "}
        <Link href={`/auth/register?redirect=${encodeURIComponent(redirectUrl)}`}
          className="font-semibold hover:underline" style={{ color: "#FD1843" }}>
          Create an account
        </Link>
      </div>
    </div>
  );
}

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

export default function LoginPage() {
  return (
    <div
      className="relative isolate min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "#000000" }}
    >
      {/* Hyperspeed WebGL highway animation fills the entire background */}
      <div className="absolute inset-0 z-0">
        <Hyperspeed effectOptions={HYPERSPEED_OPTIONS} />
      </div>

      {/* Dark vignette behind the card for extra legibility */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 70% at 50% 50%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Card wrapper */}
      <div className="relative z-10 w-full px-4 py-12" style={{ maxWidth: 480, margin: "0 auto" }}>
        <Suspense fallback={<div className="text-xs text-center" style={{ color: "rgba(255,255,255,0.3)" }}>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
