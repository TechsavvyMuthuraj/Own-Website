"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Headphones,
  UserPlus,
  ShieldCheck,
  Zap,
  Clock,
  Mail,
  Phone,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  ExternalLink,
  MessageSquare,
  Users,
  Sparkles,
  Search,
  Check,
  Star,
  Activity,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import type { SupportTeamMember } from "@/app/api/admin/support-team/route";

const ALL_SPECIALIZATIONS = [
  "Software Installation",
  "Game Crash / Error",
  "Broken Download Link",
  "VIP Access & Billing",
  "Software Request",
  "Hardware & DLL Diagnostics",
  "Direct Drive Mirroring",
  "Security & False Positives",
];

export function SupportTeamClient({ initialTeam }: { initialTeam: SupportTeamMember[] }) {
  const { showToast, confirm } = useToast();

  const [team, setTeam] = useState<SupportTeamMember[]>(initialTeam);
  const [activeTab, setActiveTab] = useState<"roster" | "intercom" | "schedule">("roster");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ON_DUTY" | "BUSY" | "OFF_DUTY">("ALL");

  // Create Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<SupportTeamMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Technical Support Specialist",
    shiftHours: "9:00 AM - 6:00 PM IST",
    phone: "",
    dutyStatus: "ON_DUTY",
    specializations: ["Software Installation", "Game Crash / Error"],
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "Technical Support Specialist",
    shiftHours: "9:00 AM - 6:00 PM IST",
    phone: "",
    dutyStatus: "ON_DUTY",
    specializations: ["Software Installation"],
  });

  const handleOpenEdit = (member: SupportTeamMember) => {
    setEditingMember(member);
    setEditFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      shiftHours: member.shiftHours || "9:00 AM - 6:00 PM IST",
      phone: member.phone || "",
      dutyStatus: member.dutyStatus,
      specializations: member.specializations?.length ? [...member.specializations] : ["Software Installation"],
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/support-team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingMember.id,
          name: editFormData.name,
          email: editFormData.email,
          role: editFormData.role,
          shiftHours: editFormData.shiftHours,
          phone: editFormData.phone,
          dutyStatus: editFormData.dutyStatus,
          specializations: editFormData.specializations,
        }),
      });
      if (res.ok) {
        showToast({
          type: "success",
          title: "Profile Updated",
          message: `${editFormData.name}'s specialist profile has been updated.`,
        });
        setEditingMember(null);
        refreshTeam();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast({ type: "error", message: err.error || "Failed to update profile." });
      }
    } catch {
      showToast({ type: "error", message: "Network error updating specialist profile." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch updated team roster
  const refreshTeam = async () => {
    try {
      const res = await fetch("/api/admin/support-team");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.team)) {
          setTeam(data.team);
        }
      }
    } catch {}
  };

  // Toggle duty status
  const handleUpdateStatus = async (id: string, newStatus: "ON_DUTY" | "BUSY" | "OFF_DUTY") => {
    // Optimistic
    setTeam((prev) =>
      prev.map((m) => (m.id === id ? { ...m, dutyStatus: newStatus } : m))
    );

    try {
      const res = await fetch("/api/admin/support-team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, dutyStatus: newStatus }),
      });
      if (res.ok) {
        showToast({
          type: "success",
          title: "Status Updated",
          message: `Specialist status changed to ${newStatus.replace("_", " ")}.`,
        });
      } else {
        refreshTeam();
      }
    } catch {
      refreshTeam();
    }
  };

  // Delete team member
  const handleDeleteMember = (id: string, name: string) => {
    confirm({
      title: "Remove Support Specialist?",
      message: `Are you sure you want to remove ${name} from the active technical support team roster?`,
      confirmText: "Remove Specialist",
      cancelText: "Keep",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/support-team?id=${encodeURIComponent(id)}`, {
            method: "DELETE",
          });
          if (res.ok) {
            setTeam((prev) => prev.filter((m) => m.id !== id));
            showToast({
              type: "success",
              title: "Specialist Removed",
              message: `${name} was removed from the team roster.`,
            });
          } else {
            const err = await res.json().catch(() => ({}));
            showToast({ type: "error", message: err.error || "Failed to remove member." });
          }
        } catch {
          showToast({ type: "error", message: "Network error removing member." });
        }
      },
    });
  };

  // Create member submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast({ type: "error", message: "Name and Email are required." });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/support-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setTeam(data.team || [data.member, ...team]);
        showToast({
          type: "success",
          title: "Specialist Account Created! 🚀",
          message: `${formData.name} is now registered on the technical support team.`,
        });
        setIsCreateOpen(false);
        setFormData({
          name: "",
          email: "",
          role: "Technical Support Specialist",
          shiftHours: "9:00 AM - 6:00 PM IST",
          phone: "",
          dutyStatus: "ON_DUTY",
          specializations: ["Software Installation", "Game Crash / Error"],
        });
      } else {
        const err = await res.json();
        showToast({ type: "error", message: err.error || "Failed to create specialist." });
      }
    } catch {
      showToast({ type: "error", message: "Network error creating account." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSpecialization = (spec: string) => {
    setFormData((prev) => {
      const exists = prev.specializations.includes(spec);
      return {
        ...prev,
        specializations: exists
          ? prev.specializations.filter((s) => s !== spec)
          : [...prev.specializations, spec],
      };
    });
  };

  // Filtered roster
  const filteredTeam = team.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || m.dutyStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onDutyCount = team.filter((m) => m.dutyStatus === "ON_DUTY").length;
  const busyCount = team.filter((m) => m.dutyStatus === "BUSY").length;

  return (
    <div className="space-y-8 max-w-7xl pb-16">
      {/* ── 1. HEADER BANNER (Doppelrand Double-Bezel Architecture) ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-gradient-to-br from-white via-slate-50/80 to-white dark:from-neutral-950 dark:via-neutral-900/90 dark:to-neutral-950 backdrop-blur-2xl shadow-xs dark:shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-500/15 dark:via-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            Live Support Infrastructure
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-neutral-950 shadow-md shadow-emerald-500/20">
              <Headphones className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span>Technical Support Team &amp; Roster</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
            Manage specialist accounts, monitor real-time duty availability, and coordinate 1-on-1 troubleshooting desks.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            href="/technicalsupport"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-bold text-cyan-700 dark:text-cyan-300 hover:text-cyan-900 dark:hover:text-white transition-all shadow-xs"
          >
            <Headphones className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Specialist Console</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 opacity-70" />
          </Link>

          <Link
            href="/admin/messages"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-all shadow-xs"
          >
            <MessageSquare className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            <span>Intercom Desk</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 text-xs font-extrabold shadow-md shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Specialist</span>
          </button>
        </div>
      </div>

      {/* ── 2. METRICS STATS BAR ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/40 backdrop-blur-xl space-y-1 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Specialists On Duty</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {onDutyCount} <span className="text-sm font-semibold text-neutral-400 dark:text-neutral-500">/ {team.length}</span>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Ready to accept sessions</p>
        </div>

        <div className="p-5 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/40 backdrop-blur-xl space-y-1 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Specialists In Chat</span>
            <Activity className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">{busyCount}</div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Actively troubleshooting</p>
        </div>

        <div className="p-5 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/40 backdrop-blur-xl space-y-1 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Avg Response Speed</span>
            <Zap className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          </div>
          <div className="text-3xl font-black text-sky-600 dark:text-sky-400 font-mono">&lt; 1.8m</div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Socket turnaround</p>
        </div>

        <div className="p-5 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/40 backdrop-blur-xl space-y-1 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 text-xs font-bold uppercase tracking-wider">
            <span>Satisfaction Score</span>
            <Star className="w-4 h-4 text-amber-500 dark:text-yellow-400 fill-current" />
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-yellow-400 font-mono">4.96 <span className="text-xs text-neutral-400 dark:text-neutral-500 font-sans">/ 5.0</span></div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">780+ resolved sessions</p>
        </div>
      </div>

      {/* ── 3. SEARCH & CONTROLS ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/40 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search specialists by name, email, or role..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 shadow-inner"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
          {(["ALL", "ON_DUTY", "BUSY", "OFF_DUTY"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. SPECIALISTS ROSTER GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeam.map((member) => (
          <div
            key={member.id}
            className="p-6 rounded-3xl border border-neutral-200/90 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 hover:bg-neutral-50/70 dark:hover:bg-neutral-900/70 hover:border-emerald-500/40 transition-all shadow-xs dark:shadow-lg flex flex-col justify-between space-y-4 relative group"
          >
            {/* Top Row: Avatar & Status Switcher */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black text-lg shadow-xs">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-neutral-900 dark:text-white truncate flex items-center gap-1.5">
                      <span>{member.name}</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    </h3>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(member)}
                    title="Edit specialist profile"
                    className="p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteMember(member.id, member.name)}
                    title="Remove specialist"
                    className="p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Role Title */}
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400/90 mb-2">
                {member.role}
              </div>

              {/* Shift Hours & Phone */}
              <div className="space-y-1 text-[11px] text-neutral-600 dark:text-neutral-400 mb-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
                  <span className="truncate">{member.shiftHours}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
                    <span className="font-mono">{member.phone}</span>
                  </div>
                )}
              </div>

              {/* Specialization Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {member.specializations.map((spec) => (
                  <span
                    key={spec}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/90 dark:border-neutral-700/60 text-neutral-700 dark:text-neutral-300"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Row: Duty Status Selector & Direct Action */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    member.dutyStatus === "ON_DUTY"
                      ? "bg-emerald-500 dark:bg-emerald-400 animate-pulse"
                      : member.dutyStatus === "BUSY"
                      ? "bg-amber-500 dark:bg-amber-400 animate-pulse"
                      : "bg-neutral-400 dark:bg-neutral-600"
                  }`}
                />
                <select
                  value={member.dutyStatus}
                  onChange={(e) => handleUpdateStatus(member.id, e.target.value as any)}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="ON_DUTY">🟢 ON DUTY</option>
                  <option value="BUSY">🟡 BUSY / IN CHAT</option>
                  <option value="OFF_DUTY">⚪ OFF DUTY</option>
                </select>
              </div>

              {member.phone && (
                <a
                  href={`https://wa.me/${member.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(member.name)},%20Support%20Dispatch%20Alert.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-colors"
                  title="Ping on WhatsApp"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── 5. CREATE SPECIALIST MODAL ── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 sm:p-8 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <UserPlus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                    Create Support Specialist Account
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Add a technical support engineer to the troubleshooting roster.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Specialist Full Name <span className="text-emerald-500 dark:text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Arun Kumar"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Email Address <span className="text-emerald-500 dark:text-emerald-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="arun.techsupport@nammatech.dev"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Role &amp; Title
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Senior Software Specialist"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Shift Coverage Hours
                  </label>
                  <input
                    type="text"
                    value={formData.shiftHours}
                    onChange={(e) => setFormData({ ...formData, shiftHours: e.target.value })}
                    placeholder="9:00 AM - 6:00 PM IST"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    WhatsApp / Direct Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98401 23456"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Initial Duty Status
                  </label>
                  <select
                    value={formData.dutyStatus}
                    onChange={(e) => setFormData({ ...formData, dutyStatus: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="ON_DUTY">🟢 ON DUTY</option>
                    <option value="BUSY">🟡 BUSY / IN CHAT</option>
                    <option value="OFF_DUTY">⚪ OFF DUTY</option>
                  </select>
                </div>
              </div>

              {/* Specializations Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  Assigned Specialization Desks:
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  {ALL_SPECIALIZATIONS.map((spec) => {
                    const isChecked = formData.specializations.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialization(spec)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs font-medium transition-all ${
                          isChecked
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800"
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                            isChecked ? "bg-emerald-500 border-emerald-400" : "border-neutral-300 dark:border-neutral-600"
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 text-neutral-950 stroke-[3]" />}
                        </div>
                        <span className="truncate">{spec}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-neutral-950 font-bold text-xs shadow-md shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Registering..." : "Add to Team Roster"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 6. EDIT SPECIALIST PROFILE MODAL ── */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 sm:p-8 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                  <Edit2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                    Edit Specialist Profile
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Update profile credentials, shift coverage, and duty parameters.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Specialist Full Name <span className="text-cyan-600 dark:text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    placeholder="e.g. Arun Kumar"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Email Address <span className="text-cyan-600 dark:text-cyan-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    placeholder="arun.techsupport@nammatech.dev"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Role &amp; Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    placeholder="e.g. Senior Software Specialist"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Shift Coverage Hours
                  </label>
                  <input
                    type="text"
                    value={editFormData.shiftHours}
                    onChange={(e) => setEditFormData({ ...editFormData, shiftHours: e.target.value })}
                    placeholder="9:00 AM - 6:00 PM IST"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    WhatsApp / Direct Phone
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder="+91 99448 75726"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Duty Availability Status
                  </label>
                  <select
                    value={editFormData.dutyStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, dutyStatus: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="ON_DUTY">🟢 ON DUTY</option>
                    <option value="BUSY">🟡 BUSY / IN CHAT</option>
                    <option value="OFF_DUTY">⚪ OFF DUTY</option>
                  </select>
                </div>
              </div>

              {/* Specializations Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  Assigned Specialization Desks:
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  {ALL_SPECIALIZATIONS.map((spec) => {
                    const isChecked = editFormData.specializations.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => {
                          setEditFormData((prev) => {
                            const exists = prev.specializations.includes(spec);
                            return {
                              ...prev,
                              specializations: exists
                                ? prev.specializations.filter((s) => s !== spec)
                                : [...prev.specializations, spec],
                            };
                          });
                        }}
                        className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs font-medium transition-all cursor-pointer ${
                          isChecked
                            ? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30"
                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800"
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                            isChecked ? "bg-cyan-500 border-cyan-400" : "border-neutral-300 dark:border-neutral-600"
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 text-neutral-950 stroke-[3]" />}
                        </div>
                        <span className="truncate">{spec}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-neutral-950 font-bold text-xs shadow-md shadow-cyan-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Updating..." : "Save Profile Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
