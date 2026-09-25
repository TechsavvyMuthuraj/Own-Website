"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  MessageCircle,
  HelpCircle,
  Info,
  Check,
  Film,
  Download,
  Compass,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { RequestSceneMascot } from "@/components/mascot/request-scene-mascot";
import { VoiceSearchButton } from "@/components/search/voice-search-button";

const CATEGORIES = [
  "Software",
  "Movies & 4K Cinema",
  "APK",
  "AI Tools",
  "Games",
  "Templates",
  "Files & Resources",
  "Useful Websites",
  "Education",
  "Other",
] as const;

export default function RequestPage() {
  const { user, profile } = useAuth();

  const [name, setName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [resourceName, setResourceName] = useState("");
  const [category, setCategory] = useState<string>("Software");
  const [description, setDescription] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Hidden honeypot for bot spam prevention

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedResource, setSubmittedResource] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Pre-fill user name when authenticated
  useEffect(() => {
    if (profile?.full_name && !name) {
      setName(profile.full_name);
    }
  }, [profile, name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // Honeypot check
    if (honeypot) {
      return;
    }

    // Client-side validations
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setStatus("error");
      setErrorMessage("Please enter your name (at least 2 characters).");
      return;
    }

    const trimmedPhone = whatsappNumber.trim().replace(/[\s\-\(\)]/g, "");
    if (!trimmedPhone || trimmedPhone.length < 7) {
      setStatus("error");
      setErrorMessage("Please enter a valid WhatsApp number with country code (e.g. +91XXXXXXXXXX).");
      return;
    }

    const trimmedResource = resourceName.trim();
    if (!trimmedResource || trimmedResource.length < 2) {
      setStatus("error");
      setErrorMessage("Please enter the resource or tool name you are looking for.");
      return;
    }

    const trimmedDescription = description.trim();
    if (!trimmedDescription || trimmedDescription.length < 5) {
      setStatus("error");
      setErrorMessage("Please tell us what you need with relevant details (at least 5 characters).");
      return;
    }

    setSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          whatsapp_number: trimmedPhone,
          resource_name: trimmedResource,
          category,
          description: trimmedDescription,
          hp_website: honeypot,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmittedResource(trimmedResource);
        setStatus("success");
        setResourceName("");
        setDescription("");
        setCategory("Software");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to submit request. Please verify your details.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setStatus("idle");
    setErrorMessage("");
    setResourceName("");
    setDescription("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-[var(--primary)] mb-4 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span>Resource Request</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--foreground)] tracking-tight mb-3">
          Request a Resource
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted-foreground)] max-w-xl mx-auto leading-relaxed">
          Can&apos;t find what you&apos;re looking for? Send us your request. Our team will review it and, if suitable and legally available, we&apos;ll try to add it to NammaTech.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Notice & Trust Guidelines */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
              <span>Review Criteria</span>
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Every submission is manually examined by our admin team before being curated or published.
            </p>
            <ul className="space-y-2.5 text-xs text-[var(--muted-foreground)] border-t border-[var(--border)] pt-3">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>Legitimate, official, freeware, or open-source resources only.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>No piracy, cracked executables, or unauthorized material.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>Direct WhatsApp notification when reviewed or available.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--secondary)]/40 border border-[var(--border)] flex items-start gap-3">
            <MessageCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <div className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
              <span className="font-semibold text-[var(--foreground)] block mb-0.5">WhatsApp Updates</span>
              We use WhatsApp strictly for request confirmations and follow-ups. Your phone number is never shared or displayed publicly.
            </div>
          </div>
        </div>

        {/* Right Side: Form or Success Card */}
        <div className="lg:col-span-8 relative">
          <RequestSceneMascot
            isTyping={isTyping}
            isSubmitted={status === "success"}
            userName={name}
          />
          <div className="rounded-2xl sm:rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-8 shadow-md relative z-10">
            {status === "success" ? (
              /* Success State */
              <div className="py-8 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-5 ring-1 ring-emerald-500/20 shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h2 className="text-2xl font-black text-[var(--foreground)] mb-2">Request Received</h2>
                <p className="text-sm font-medium text-[var(--foreground)] max-w-md mb-2">
                  Your request has been successfully submitted.
                </p>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-md mb-8 leading-relaxed">
                  Thanks! Your request for <span className="font-semibold text-[var(--foreground)]">&quot;{submittedResource}&quot;</span> has been received. Our team will review it and contact you through WhatsApp if we need more information or when there is an update.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm mb-6">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 text-xs font-semibold text-[var(--foreground)] transition-all cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                  <Link
                    href="/"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] text-xs font-semibold transition-all shadow-md text-center"
                  >
                    Back to NammaTech
                  </Link>
                </div>

                {/* Keep visitor engaged - Reduce Bounce */}
                <div className="w-full border-t border-[var(--border)] pt-6 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3 text-center">
                    While you wait, explore trending downloads:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Link
                      href="/movies"
                      className="p-3.5 rounded-2xl bg-[var(--secondary)]/50 hover:bg-[var(--secondary)] border border-[var(--border)] hover:border-red-500/30 transition-all group flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
                          <Film className="w-4 h-4" />
                        </span>
                        <span className="text-xs font-bold text-[var(--foreground)] group-hover:text-red-500 transition-colors">
                          Movies & Cinema
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2">
                        Stream & download blockbuster 4K & regional cinema.
                      </p>
                    </Link>

                    <Link
                      href="/explore"
                      className="p-3.5 rounded-2xl bg-[var(--secondary)]/50 hover:bg-[var(--secondary)] border border-[var(--border)] hover:border-blue-500/30 transition-all group flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                          <Compass className="w-4 h-4" />
                        </span>
                        <span className="text-xs font-bold text-[var(--foreground)] group-hover:text-blue-500 transition-colors">
                          Verified Software
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2">
                        Curated apps, PC tools, and essential downloads.
                      </p>
                    </Link>

                    <Link
                      href="/free"
                      className="p-3.5 rounded-2xl bg-[var(--secondary)]/50 hover:bg-[var(--secondary)] border border-[var(--border)] hover:border-emerald-500/30 transition-all group flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                          <Download className="w-4 h-4" />
                        </span>
                        <span className="text-xs font-bold text-[var(--foreground)] group-hover:text-emerald-500 transition-colors">
                          100% Free Tools
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2">
                        Zero cost, instant access software and utilities.
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* Request Form */
              <>
                <div className="mb-6 border-b border-[var(--border)] pb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-tight">
                    Submit Your Request
                  </h2>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Fill out the form below. Required fields are marked with an asterisk (*).
                  </p>
                </div>

                {status === "error" && (
                  <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-start gap-2.5 mb-6">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                  {/* Anti-spam Honeypot Field (invisible to real humans) */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="req-hp-website">Leave this field blank</label>
                    <input
                      id="req-hp-website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="req-name"
                      className="block text-xs font-semibold text-[var(--foreground)] mb-1.5"
                    >
                      Your Name <span className="text-[var(--primary)]">*</span>
                    </label>
                    <input
                      id="req-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                    />
                  </div>

                  {/* WhatsApp Number Field */}
                  <div>
                    <label
                      htmlFor="req-whatsapp"
                      className="block text-xs font-semibold text-[var(--foreground)] mb-1.5"
                    >
                      WhatsApp Number <span className="text-[var(--primary)]">*</span>
                    </label>
                    <input
                      id="req-whatsapp"
                      type="tel"
                      required
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                      placeholder="Enter your WhatsApp number (e.g. +91XXXXXXXXXX)"
                      className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all font-mono"
                    />
                    <p className="text-[11px] text-[var(--muted-foreground)] mt-1 flex items-center gap-1">
                      <Info className="w-3 h-3 text-[var(--primary)] shrink-0" />
                      <span>Include your country code (for India: +91XXXXXXXXXX). Private and confidential.</span>
                    </p>
                  </div>

                  {/* Resource / Tool Name Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="req-resource-name"
                        className="block text-xs font-semibold text-[var(--foreground)]"
                      >
                        What do you need? <span className="text-[var(--primary)]">*</span>
                      </label>
                      <VoiceSearchButton
                        onTranscript={(transcript) => {
                          setResourceName((prev) => (prev ? prev + " " + transcript : transcript));
                        }}
                      />
                    </div>
                    <input
                      id="req-resource-name"
                      type="text"
                      required
                      value={resourceName}
                      onChange={(e) => setResourceName(e.target.value)}
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                      placeholder="Example: OBS Virtual Camera, Photoshop alternative, AI tool, Movie..."
                      className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                    />
                  </div>

                  {/* Category Field */}
                  <div>
                    <label
                      htmlFor="req-category"
                      className="block text-xs font-semibold text-[var(--foreground)] mb-1.5"
                    >
                      Category
                    </label>
                    <select
                      id="req-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                      className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="req-description"
                        className="block text-xs font-semibold text-[var(--foreground)]"
                      >
                        Tell us what you need <span className="text-[var(--primary)]">*</span>
                      </label>
                      <VoiceSearchButton
                        onTranscript={(transcript) => {
                          setDescription((prev) => (prev ? prev + " " + transcript : transcript));
                        }}
                      />
                    </div>
                    <textarea
                      id="req-description"
                      required
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onFocus={() => setIsTyping(true)}
                      onBlur={() => setIsTyping(false)}
                      placeholder="Describe what you are looking for, version, platform, features, or any other useful details..."
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all resize-y min-h-[110px]"
                    />
                    <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                      Example: &quot;I need OBS Virtual Camera for Windows 11. I am looking for a legitimate tool or official solution that supports virtual camera output.&quot;
                    </p>
                  </div>

                  {/* User Association Notice if logged in */}
                  {user && (
                    <div className="p-3 rounded-xl bg-[var(--secondary)]/50 border border-[var(--border)] text-xs text-[var(--muted-foreground)] flex items-center justify-between">
                      <span>Submitting as authenticated user: <strong className="text-[var(--foreground)]">{user.email}</strong></span>
                      <Link href="/account/requests" className="text-[var(--primary)] hover:underline font-medium text-[11px]">
                        View My Requests
                      </Link>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      id="req-submit-btn"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:bg-[var(--primary-hover)] transition-all shadow-md shadow-[#FD1843]/20 disabled:opacity-70 cursor-pointer active:scale-[0.99]"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Request...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Discovery & Internal Linking Strip */}
          <div className="mt-8 pt-6 border-t border-[var(--border)]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Explore Popular Categories
              </span>
              <Link
                href="/explore"
                className="text-xs font-semibold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
              >
                Browse all categories <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: "Cinema & 4K", href: "/movies", icon: Film, color: "text-red-500" },
                { label: "Trending Apps", href: "/explore", icon: Compass, color: "text-blue-500" },
                { label: "Free Tools", href: "/free", icon: Download, color: "text-emerald-500" },
                { label: "Live Support", href: "/contact", icon: Sparkles, color: "text-purple-500" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="p-3 rounded-xl bg-[var(--card)] hover:bg-[var(--secondary)] border border-[var(--border)] transition-all flex items-center gap-2.5 group"
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-xs font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
