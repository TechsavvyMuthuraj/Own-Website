"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Video,
  Calendar,
  Clock,
  Users,
  Play,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Radio,
  ArrowRight,
  MessageSquare,
  Copy,
  Check,
  Send,
  HelpCircle,
} from "lucide-react";
import { ZoomMeeting, MeetingType } from "@/lib/meetings/meeting-types";
import { playPopSound } from "@/lib/sound";

export default function PublicMeetingsPage() {
  const [meetings, setMeetings] = useState<ZoomMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Booking Form State
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [attendeePhone, setAttendeePhone] = useState("");
  const [topicNotes, setTopicNotes] = useState("");
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(18, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<any | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const fetchMeetings = async () => {
    try {
      const res = await fetch("/api/meetings");
      const data = await res.json();
      if (res.ok && Array.isArray(data.meetings)) {
        setMeetings(data.meetings);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendee_name: attendeeName,
          attendee_email: attendeeEmail,
          attendee_phone: attendeePhone,
          topic_notes: topicNotes,
          preferred_date: preferredDate,
          meeting_id: selectedMeetingId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to book meeting");

      setSubmitSuccess(data.registration || { success: true });
      playPopSound();
    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyMeetingDetails = (m: ZoomMeeting) => {
    const text = `NammaTech Zoom Session: ${m.title}
Host: ${m.host_name}
Date & Time: ${new Date(m.scheduled_start).toLocaleString()}
Join Link: ${m.join_url}
Meeting ID: ${m.meeting_id || "Direct URL"}
Passcode: ${m.passcode || "None"}`;

    navigator.clipboard.writeText(text);
    setCopiedId(m.id);
    setTimeout(() => setCopiedId(null), 2500);
    playPopSound();
  };

  const liveMeeting = meetings.find((m) => m.status === "live");
  const upcomingMeetings = meetings.filter((m) => m.status === "scheduled");

  return (
    <div className="min-h-screen pt-28 sm:pt-32 lg:pt-36 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Hero Header */}
      <div className="relative rounded-3xl p-6 sm:p-10 border border-black/10 dark:border-white/10 bg-gradient-to-br from-amber-500/10 via-neutral-900 to-rose-500/10 shadow-2xl overflow-hidden backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              Direct Founder & Specialist Calls
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/80">
              Encrypted Zoom HD
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] tracking-tight">
            Schedule a Live Zoom Call with NammaTech
          </h1>

          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
            Get personalized 1-on-1 technical assistance, discuss 4K cinema release masterings, review code architecture, or request custom verified software repacks directly with Muthuraj C.
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <a
              href="#book-session"
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black tracking-wide shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Book 1-on-1 Session</span>
            </a>

            <Link
              href="/community"
              className="px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Community Hub</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 🔴 LIVE NOW BROADCAST BANNER (When a call is currently live) */}
      {liveMeeting && (
        <div className="relative rounded-3xl p-6 sm:p-8 border-2 border-rose-500/60 bg-gradient-to-r from-rose-950/60 via-black to-neutral-950 shadow-2xl shadow-rose-500/20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500 text-white flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  Live Meeting In Progress
                </span>
                <span className="text-xs text-rose-300/80 font-mono">
                  Hosted by {liveMeeting.host_name}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">
                {liveMeeting.title}
              </h2>

              {liveMeeting.description && (
                <p className="text-xs sm:text-sm text-zinc-300 max-w-xl">
                  {liveMeeting.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1 font-mono">
                {liveMeeting.meeting_id && (
                  <span>
                    ID: <strong className="text-white">{liveMeeting.meeting_id}</strong>
                  </span>
                )}
                {liveMeeting.passcode && (
                  <span>
                    Passcode: <strong className="text-amber-400">{liveMeeting.passcode}</strong>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <a
                href={liveMeeting.join_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-500/40 flex items-center gap-2 transition-all active:scale-95 animate-pulse"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Join Live Zoom Now ↗</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Scheduled Sessions + Booking Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upcoming Scheduled Sessions */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-[var(--foreground)] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              <span>Upcoming Scheduled Meetings</span>
            </h2>
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">
              {upcomingMeetings.length} Available
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-[var(--muted-foreground)] border border-black/10 dark:border-white/10 rounded-3xl">
              Loading scheduled meetings...
            </div>
          ) : upcomingMeetings.length === 0 ? (
            <div className="p-8 rounded-3xl border border-dashed border-black/10 dark:border-white/10 text-center space-y-3">
              <Video className="w-8 h-8 text-zinc-500 mx-auto" />
              <p className="text-sm font-bold text-[var(--foreground)]">
                No Pre-Scheduled Masterclasses Right Now
              </p>
              <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
                You can book an on-demand 1-on-1 private Zoom consultation directly with our team using the form.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMeetings.map((m) => (
                <div
                  key={m.id}
                  className="rounded-3xl border border-black/10 dark:border-white/10 bg-[var(--card)]/90 backdrop-blur-xl p-5 shadow-xl space-y-3 hover:border-amber-500/40 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {m.meeting_type.replace("_", " ")}
                        </span>
                        <span className="text-[11px] text-[var(--muted-foreground)]">
                          Hosted by {m.host_name}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)] group-hover:text-amber-500 transition-colors">
                        {m.title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyMeetingDetails(m)}
                      title="Copy meeting details"
                      className="p-1.5 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 text-xs transition-colors cursor-pointer"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                      )}
                    </button>
                  </div>

                  {m.description && (
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                      {m.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/5 dark:border-white/10 flex-wrap text-xs">
                    <div className="flex items-center gap-3 text-[11px] text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1 font-semibold text-[var(--foreground)]">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {new Date(m.scheduled_start).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>•</span>
                      <span>{m.duration_minutes} Mins</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMeetingId(m.id);
                          const el = document.getElementById("book-session");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold text-[var(--foreground)] transition-colors cursor-pointer"
                      >
                        Register
                      </button>

                      <a
                        href={m.join_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Join Call ↗</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Book 1-on-1 Consultation Form */}
        <div id="book-session" className="lg:col-span-5">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-[var(--card)]/90 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                  Priority Booking
                </span>
              </div>
              <h2 className="text-xl font-black text-[var(--foreground)]">
                Book a 1-on-1 Consultation
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Request a dedicated private Zoom call with Muthuraj C. You will receive an instant meeting confirmation pass.
              </p>
            </div>

            {submitSuccess ? (
              <div className="rounded-2xl p-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Session Booked Successfully!</span>
                </div>
                <p className="text-xs text-emerald-300/90 leading-relaxed">
                  Vanakkam! Your consultation pass has been reserved. Please check your email for the meeting invitation.
                </p>
                <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 text-xs font-mono space-y-1 text-white">
                  <p><strong>Host:</strong> Muthuraj C</p>
                  <p><strong>Join Link:</strong> https://zoom.us/j/8492049102</p>
                  <p><strong>Passcode:</strong> nammatech</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(null)}
                  className="w-full py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs shadow-md mt-2 cursor-pointer"
                >
                  Book Another Session
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookMeeting} className="space-y-3.5">
                {bookingError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {bookingError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--foreground)]">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Kumar"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--foreground)] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--foreground)]">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--foreground)] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--foreground)]">WhatsApp / Mobile (Optional)</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={attendeePhone}
                    onChange={(e) => setAttendeePhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--foreground)] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--foreground)]">Preferred Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--foreground)] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--foreground)]">Consultation Topic / Requirements</label>
                  <textarea
                    rows={3}
                    placeholder="What software tools, 4K audio setup, or coding issue would you like to solve during the call?"
                    value={topicNotes}
                    onChange={(e) => setTopicNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--foreground)] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black text-xs shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Reserving Slot..." : "Confirm & Book Zoom Call"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
