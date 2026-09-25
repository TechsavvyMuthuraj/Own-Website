"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Video,
  Calendar,
  Clock,
  Users,
  Plus,
  Play,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Radio,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Shield,
  Layers,
  Phone,
  Mail,
  FileText,
  Pencil,
} from "lucide-react";
import { ZoomMeeting, ZoomRegistration, MeetingStatus, MeetingType } from "@/lib/meetings/meeting-types";
import { playPopSound } from "@/lib/sound";

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<ZoomMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal & Edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<ZoomMeeting | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Attendees drawer
  const [selectedMeetingForAttendees, setSelectedMeetingForAttendees] = useState<ZoomMeeting | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingType, setMeetingType] = useState<MeetingType>("consultation");
  const [hostName, setHostName] = useState("Muthuraj C");
  const [hostEmail, setHostEmail] = useState("contact@techsavvymuthuraj.dev");
  const [joinUrl, setJoinUrl] = useState("https://zoom.us/j/8492049102");
  const [meetingId, setMeetingId] = useState("849 204 9102");
  const [passcode, setPasscode] = useState("nammatech");
  const [scheduledStart, setScheduledStart] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [maxParticipants, setMaxParticipants] = useState(50);
  const [status, setStatus] = useState<MeetingStatus>("scheduled");

  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/meetings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load meetings");
      setMeetings(data.meetings || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const openCreateModal = () => {
    setEditingMeeting(null);
    resetForm();
    setFormError(null);
    setIsModalOpen(true);
    playPopSound();
  };

  const openEditModal = (m: ZoomMeeting) => {
    setEditingMeeting(m);
    setTitle(m.title);
    setDescription(m.description || "");
    setMeetingType(m.meeting_type);
    setHostName(m.host_name);
    setHostEmail(m.host_email);
    setJoinUrl(m.join_url);
    setMeetingId(m.meeting_id || "");
    setPasscode(m.passcode || "");
    try {
      const d = new Date(m.scheduled_start);
      // format YYYY-MM-DDTHH:mm in local time for datetime-local input
      const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setScheduledStart(localIso);
    } catch {
      setScheduledStart(new Date().toISOString().slice(0, 16));
    }
    setDurationMinutes(m.duration_minutes);
    setMaxParticipants(m.max_participants);
    setStatus(m.status);
    setFormError(null);
    setIsModalOpen(true);
    playPopSound();
  };

  const handleSaveMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        title,
        description,
        meeting_type: meetingType,
        host_name: hostName,
        host_email: hostEmail,
        join_url: joinUrl,
        meeting_url: joinUrl,
        meeting_id: meetingId,
        passcode,
        scheduled_start: scheduledStart,
        duration_minutes: durationMinutes,
        max_participants: maxParticipants,
        status,
      };

      if (editingMeeting) {
        const res = await fetch(`/api/admin/meetings/${editingMeeting.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update meeting");

        setMeetings((prev) =>
          prev.map((item) => (item.id === editingMeeting.id ? data.meeting : item))
        );
      } else {
        const res = await fetch("/api/admin/meetings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create meeting");

        setMeetings((prev) => [data.meeting, ...prev]);
      }

      setIsModalOpen(false);
      setEditingMeeting(null);
      resetForm();
      playPopSound();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, nextStatus: MeetingStatus) => {
    try {
      const res = await fetch(`/api/admin/meetings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setMeetings((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: nextStatus } : m))
        );
        playPopSound();
      }
    } catch {}
  };

  const handleDeleteMeeting = async (id: string, meetingTitle: string) => {
    if (!confirm(`Are you sure you want to delete the meeting: "${meetingTitle}"?`)) return;
    try {
      const res = await fetch(`/api/admin/meetings/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMeetings((prev) => prev.filter((m) => m.id !== id));
        playPopSound();
      }
    } catch {}
  };

  const copyInvitation = (m: ZoomMeeting) => {
    const text = `Topic: ${m.title}
Host: ${m.host_name} (${m.host_email})
Time: ${new Date(m.scheduled_start).toLocaleString()} (${m.duration_minutes} mins)

Join Zoom Meeting:
${m.join_url}

Meeting ID: ${m.meeting_id || "Direct Link"}
Passcode: ${m.passcode || "No passcode"}

Powered by NammaTech Community & Technical Support.`;

    navigator.clipboard.writeText(text);
    setCopiedId(m.id);
    setTimeout(() => setCopiedId(null), 2500);
    playPopSound();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setMeetingType("consultation");
    setHostName("Muthuraj C");
    setJoinUrl("https://zoom.us/j/8492049102");
    setMeetingId("849 204 9102");
    setPasscode("nammatech");
    const d = new Date();
    d.setHours(d.getHours() + 2, 0, 0, 0);
    setScheduledStart(d.toISOString().slice(0, 16));
    setDurationMinutes(45);
    setMaxParticipants(50);
    setStatus("scheduled");
  };

  const filteredMeetings = meetings.filter((m) => {
    const matchesStatus = filterStatus === "all" || m.status === filterStatus;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.host_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.meeting_id && m.meeting_id.includes(searchQuery));
    return matchesStatus && matchesSearch;
  });

  const liveCount = meetings.filter((m) => m.status === "live").length;
  const scheduledCount = meetings.filter((m) => m.status === "scheduled").length;
  const completedCount = meetings.filter((m) => m.status === "completed").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              Live Stage & Zoom Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] mt-1 tracking-tight">
            Zoom & Video Call Manager
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)]">
            Schedule 1-on-1 consultations, community masterclasses, and manage Zoom invites directly from NammaTech admin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <a
            href="https://zoom.us/start/videomeeting"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-bold text-[var(--foreground)] flex items-center gap-2 transition-all active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>Open Zoom Web ↗</span>
          </a>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black tracking-wide shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl border border-black/10 dark:border-white/10 bg-[var(--card)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span>Total Calls</span>
            <Video className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-[var(--foreground)]">{meetings.length}</p>
        </div>

        <div className="p-4 rounded-3xl border border-black/10 dark:border-white/10 bg-[var(--card)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-rose-400">
            <span>Live Now</span>
            <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-rose-400">{liveCount}</p>
        </div>

        <div className="p-4 rounded-3xl border border-black/10 dark:border-white/10 bg-[var(--card)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-400">
            <span>Upcoming Scheduled</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-400">{scheduledCount}</p>
        </div>

        <div className="p-4 rounded-3xl border border-black/10 dark:border-white/10 bg-[var(--card)] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{completedCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl border border-black/10 dark:border-white/10 bg-[var(--card)] shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {["all", "live", "scheduled", "completed", "cancelled"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                filterStatus === st
                  ? "bg-amber-500 text-black shadow-xs"
                  : "hover:bg-black/5 dark:hover:bg-white/5 text-[var(--muted-foreground)]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search by topic, host, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:border-amber-500/50 text-[var(--foreground)]"
          />
        </div>
      </div>

      {/* Meetings List */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-[var(--muted-foreground)]">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading scheduled video calls...
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-black/10 dark:border-white/10 text-center space-y-3">
          <Video className="w-10 h-10 text-zinc-500 mx-auto" />
          <p className="text-sm font-bold text-[var(--foreground)]">No Zoom Meetings Found</p>
          <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
            {searchQuery
              ? "No meetings match your search query."
              : "Schedule your first Zoom session or 1-on-1 consultation for NammaTech members."}
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md cursor-pointer transition-all active:scale-95"
          >
            Schedule Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMeetings.map((m) => {
            const isLive = m.status === "live";
            const isScheduled = m.status === "scheduled";
            const isCompleted = m.status === "completed";
            const isCancelled = m.status === "cancelled";

            return (
              <div
                key={m.id}
                className={`relative rounded-3xl border p-5 shadow-xl transition-all space-y-4 flex flex-col justify-between ${
                  isLive
                    ? "border-rose-500/50 bg-gradient-to-br from-rose-500/10 via-black/[0.02] to-transparent shadow-rose-500/10"
                    : "border-black/10 dark:border-white/10 bg-[var(--card)]/90 backdrop-blur-xl"
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            isLive
                              ? "bg-rose-500 text-white animate-pulse"
                              : isScheduled
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : isCompleted
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-zinc-500/20 text-zinc-400"
                          }`}
                        >
                          {m.status}
                        </span>

                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-black/5 dark:bg-white/10 text-[var(--muted-foreground)]">
                          {m.meeting_type.replace("_", " ")}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[var(--foreground)] leading-snug">
                        {m.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* EDIT AND UPDATE OPTION */}
                      <button
                        type="button"
                        onClick={() => openEditModal(m)}
                        title="Edit and update meeting details"
                        className="p-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/30 text-[var(--muted-foreground)] text-xs transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="sr-only">Edit Meeting</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => copyInvitation(m)}
                        title="Copy meeting invite"
                        className="p-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 text-xs transition-colors cursor-pointer"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMeeting(m.id, m.title)}
                        title="Delete meeting"
                        className="p-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-rose-500/20 hover:text-rose-400 text-zinc-400 text-xs transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {m.description && (
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                      {m.description}
                    </p>
                  )}

                  {/* Meeting Details Pill Box */}
                  <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-[var(--muted-foreground)] uppercase">Scheduled Time</p>
                      <p className="font-semibold text-[var(--foreground)] text-[11px] truncate">
                        {new Date(m.scheduled_start).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[10px] text-[var(--muted-foreground)] uppercase">Duration</p>
                      <p className="font-semibold text-[var(--foreground)] text-[11px]">
                        {m.duration_minutes} Minutes
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[10px] text-[var(--muted-foreground)] uppercase">Meeting ID</p>
                      <p className="font-mono text-[11px] font-bold text-amber-500">
                        {m.meeting_id || "Direct Link"}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[10px] text-[var(--muted-foreground)] uppercase">Passcode</p>
                      <p className="font-mono text-[11px] text-[var(--foreground)]">
                        {m.passcode || "None"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {/* Status Toggle Quick Buttons */}
                    {isScheduled && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(m.id, "live")}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-all cursor-pointer"
                      >
                        Go Live 🔴
                      </button>
                    )}

                    {isLive && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(m.id, "completed")}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white transition-all cursor-pointer"
                      >
                        Finish Call ✓
                      </button>
                    )}

                    {!isCompleted && !isCancelled && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(m.id, "cancelled")}
                        className="px-2 py-1 rounded-xl text-[10px] text-zinc-400 hover:text-rose-400 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={m.join_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-3 py-1.5 rounded-xl text-xs font-black tracking-wide flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
                        isLive
                          ? "bg-rose-500 text-white animate-pulse"
                          : "bg-amber-500 hover:bg-amber-400 text-black"
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isLive ? "Join Live Call" : "Start Meeting"}</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-black/10 dark:border-white/10 bg-[var(--card)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-[var(--foreground)]">
                  {editingMeeting ? "Edit & Update Zoom Meeting" : "Schedule Zoom Meeting"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveMeeting} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--foreground)]">Meeting Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP 1-on-1 Architecture Review with Muthuraj C"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--foreground)] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--foreground)]">Meeting Type</label>
                  <select
                    value={meetingType}
                    onChange={(e) => setMeetingType(e.target.value as MeetingType)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--foreground)] focus:outline-none"
                  >
                    <option value="consultation">1-on-1 Consultation</option>
                    <option value="technical_support">Technical Support</option>
                    <option value="vip_session">VIP Direct Session</option>
                    <option value="workshop">Community Masterclass</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--foreground)]">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MeetingStatus)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--foreground)] focus:outline-none"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="live">Live Now</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--foreground)]">Host Name</label>
                  <input
                    type="text"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--foreground)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--foreground)]">Host Email</label>
                  <input
                    type="email"
                    value={hostEmail}
                    onChange={(e) => setHostEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--foreground)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--foreground)]">Zoom Join URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://zoom.us/j/..."
                  value={joinUrl}
                  onChange={(e) => setJoinUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--foreground)] focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--foreground)]">Meeting ID</label>
                  <input
                    type="text"
                    placeholder="849 204 9102"
                    value={meetingId}
                    onChange={(e) => setMeetingId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--foreground)] focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--foreground)]">Passcode</label>
                  <input
                    type="text"
                    placeholder="nammatech"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--foreground)] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-[var(--foreground)]">Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledStart}
                    onChange={(e) => setScheduledStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--foreground)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--foreground)]">Duration (Mins)</label>
                  <input
                    type="number"
                    min="15"
                    max="300"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--foreground)] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--foreground)]">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Meeting agenda, preparation notes, or prerequisites..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--foreground)] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 text-[var(--muted-foreground)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  {isSubmitting
                    ? editingMeeting
                      ? "Updating Meeting..."
                      : "Scheduling Meeting..."
                    : editingMeeting
                    ? "Save & Update Meeting"
                    : "Schedule Meeting Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
