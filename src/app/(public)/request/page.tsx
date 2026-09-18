"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Package,
  Clock,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

const CATEGORIES = [
  "General",
  "Developer Tools",
  "Design & Graphics",
  "Video & Audio",
  "Productivity",
  "System Utilities",
  "Security",
  "Education",
  "Games",
  "Office & Documents",
  "Communication",
  "Browser & Extensions",
  "Database Tools",
  "Networking",
  "Other",
];

const PRIORITIES = [
  { value: "LOW", label: "Low", description: "Nice to have, no rush" },
  { value: "NORMAL", label: "Normal", description: "Standard request" },
  { value: "HIGH", label: "High", description: "Needed soon" },
];

export default function RequestPage() {
  const { user, profile } = useAuth();

  const [softwareName, setSoftwareName] = useState("");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [officialUrl, setOfficialUrl] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [guestEmail, setGuestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedName, setSubmittedName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          software_name: softwareName,
          software_category: category,
          description,
          official_url: officialUrl,
          priority,
          user_email: user?.email || guestEmail,
          user_name: profile?.full_name || user?.email || guestEmail,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmittedName(softwareName);
        setStatus("success");
        setSoftwareName("");
        setCategory("General");
        setDescription("");
        setOfficialUrl("");
        setPriority("NORMAL");
        setGuestEmail("");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Failed to submit request. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-xs font-semibold text-[var(--primary)] mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Resource Request</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight mb-3">
          Request a Software or Tool
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed">
          Can&apos;t find what you need? Tell us and we&apos;ll work on adding it to the NammaTech catalog.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Panel */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              How It Works
            </h3>
            <ul className="space-y-3">
              {[
                { icon: Search, text: "Submit your software request below", color: "text-[var(--primary)]" },
                { icon: Clock, text: "Admin reviews within 1–3 business days", color: "text-amber-500" },
                { icon: Package, text: "We source, verify & add it to our catalog", color: "text-emerald-500" },
                { icon: CheckCircle2, text: "You'll find it ready for download!", color: "text-indigo-500" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className={`mt-0.5 flex-shrink-0 ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15">
            <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5">Guidelines</h4>
            <ul className="space-y-1.5 text-[11px] text-[var(--muted-foreground)]">
              <li>• Only legitimate, licensed software</li>
              <li>• No piracy, cracks, or keygens</li>
              <li>• Freeware, open-source preferred</li>
              <li>• Be as specific as possible</li>
            </ul>
          </div>

          <Link
            href="/explore"
            className="flex items-center justify-between px-4 py-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--primary)]/30 transition-colors group"
          >
            <span>Browse existing catalog first</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Request Form */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 shadow-sm">
            {status === "success" ? (
              <div className="py-8 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 ring-1 ring-emerald-500/20 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Request Submitted!</h3>
                <p className="text-sm text-[var(--muted-foreground)] max-w-sm mb-2 leading-relaxed">
                  Your request for <span className="font-semibold text-[var(--foreground)]">&quot;{submittedName}&quot;</span> has been submitted.
                  Our admin will review it and add it to the catalog if eligible.
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mb-6 opacity-70">
                  Check back in 1–3 business days.
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    id="request-another-btn"
                    onClick={() => setStatus("idle")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 text-xs font-semibold text-[var(--foreground)] transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Another
                  </button>
                  <Link
                    href="/explore"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold transition-all shadow-md shadow-[#FD1843]/20"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Explore Catalog
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-[var(--foreground)] mb-6">Submit Your Request</h2>

                {status === "error" && (
                  <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2 mb-6">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Software Name */}
                  <div>
                    <label htmlFor="req-software-name" className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                      Software / Tool Name <span className="text-[var(--primary)]">*</span>
                    </label>
                    <input
                      id="req-software-name"
                      type="text"
                      required
                      value={softwareName}
                      onChange={(e) => setSoftwareName(e.target.value)}
                      placeholder="e.g. VLC Media Player, VS Code, Figma..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                      <label htmlFor="req-category" className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                        Category
                      </label>
                      <select
                        id="req-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                        Priority
                      </label>
                      <div className="flex gap-2">
                        {PRIORITIES.map((p) => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setPriority(p.value)}
                            className={`flex-1 py-2 rounded-xl text-[11px] font-semibold border transition-all ${
                              priority === p.value
                                ? p.value === "HIGH"
                                  ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
                                  : p.value === "NORMAL"
                                  ? "bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]"
                                  : "bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400"
                                : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Official URL */}
                  <div>
                    <label htmlFor="req-official-url" className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                      Official Website / Source URL
                    </label>
                    <input
                      id="req-official-url"
                      type="url"
                      value={officialUrl}
                      onChange={(e) => setOfficialUrl(e.target.value)}
                      placeholder="https://vlcmediaplayer.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="req-description" className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                      Why do you need it? (Optional)
                    </label>
                    <textarea
                      id="req-description"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the tool, its use case, and why it should be added to the NammaTech catalog..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
                    />
                  </div>

                  {/* Guest email if not logged in */}
                  {!user && (
                    <div>
                      <label htmlFor="req-guest-email" className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                        Your Email <span className="text-[var(--primary)]">*</span>
                      </label>
                      <input
                        id="req-guest-email"
                        type="email"
                        required
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                      />
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                        Or{" "}
                        <Link href="/auth/login?redirect=/request" className="text-[var(--primary)] hover:underline">
                          log in
                        </Link>
                        {" "}to auto-fill your details.
                      </p>
                    </div>
                  )}

                  {user && (
                    <p className="text-xs text-[var(--muted-foreground)] bg-[var(--secondary)]/60 px-3 py-2 rounded-xl border border-[var(--border)]">
                      Submitting as <span className="font-semibold text-[var(--foreground)]">{user.email}</span>
                    </p>
                  )}

                  <button
                    type="submit"
                    id="req-submit-btn"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:bg-[var(--primary-hover)] transition-all shadow-md shadow-[#FD1843]/25 disabled:opacity-70"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Request</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
