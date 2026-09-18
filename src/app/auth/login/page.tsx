"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
        // Check if user is an admin
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

        if (isUserAdmin) {
          // If admin, send directly to admin console unless they explicitly targeted another page
          if (redirectUrl === "/account" || redirectUrl.startsWith("/admin")) {
            router.push("/admin");
          } else {
            router.push(redirectUrl);
          }
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

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md bg-slate-950 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform">
            <Image
              src="/images/nammatech-logo.png"
              alt="NammaTech Logo"
              width={40}
              height={40}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <span className="font-bold text-xl text-[var(--foreground)] tracking-tight">NammaTech</span>
        </Link>
        <h1 className="text-2xl font-extrabold text-[var(--foreground)] tracking-tight">
          Welcome Back
        </h1>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          Sign in to access your digital purchases, downloads, and account settings.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-[var(--foreground)]">
              Password
            </label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:bg-[var(--primary-hover)] transition-all shadow-md shadow-indigo-500/20 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-[var(--border)] text-center text-xs text-[var(--muted-foreground)]">
        Don&apos;t have an account?{" "}
        <Link
          href={`/auth/register?redirect=${encodeURIComponent(redirectUrl)}`}
          className="text-[var(--primary)] font-semibold hover:underline"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--background)]">
      <Suspense fallback={<div className="text-xs text-[var(--muted-foreground)]">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
