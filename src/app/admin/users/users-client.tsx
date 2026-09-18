"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Crown,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
  X,
  UserCheck,
  Activity,
  Filter,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  is_online: boolean;
  last_seen_at: string | null;
  last_sign_in_at: string | null;
  created_at: string;
  email_confirmed: boolean;
  email_confirmed_at: string | null;
  orders_count: number;
  downloads_count: number;
  provider: string;
  phone: string | null;
}

interface UserStats {
  total_users: number;
  online_users: number;
  admin_users: number;
  verified_users: number;
}

export function UsersClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total_users: 0,
    online_users: 0,
    admin_users: 0,
    verified_users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [presenceFilter, setPresenceFilter] = useState<string>("ALL");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
        setStats(
          data.stats || {
            total_users: 0,
            online_users: 0,
            admin_users: 0,
            verified_users: 0,
          }
        );
      } else {
        setMessage({ type: "error", text: data.error || "Failed to load users" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Failed to fetch users" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Auto-refresh presence every 30 seconds
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateRole = async (userId: string, newRole: "USER" | "ADMIN" | "SUPER_ADMIN") => {
    try {
      setUpdatingId(userId);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `User role updated to ${newRole} successfully!` });
        // Update local state
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        if (selectedUser?.id === userId) {
          setSelectedUser((prev) => (prev ? { ...prev, role: newRole } : null));
        }
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update role" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Error updating role" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!deletingUser) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: `User ${deletingUser.email} has been permanently deleted.`,
        });
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
        setStats((prev) => ({
          ...prev,
          total_users: Math.max(0, prev.total_users - 1),
          online_users: deletingUser.is_online
            ? Math.max(0, prev.online_users - 1)
            : prev.online_users,
        }));
        if (selectedUser?.id === deletingUser.id) {
          setSelectedUser(null);
        }
        setIsDeleteModalOpen(false);
        setDeletingUser(null);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to delete user." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Error deleting user." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleConfirm = async (userId: string, confirmed: boolean) => {
    try {
      setUpdatingId(userId);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: confirmed
            ? "User account confirmed & approved successfully!"
            : "User confirmation revoked.",
        });
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, email_confirmed: confirmed } : u
          )
        );
        setStats((prev) => ({
          ...prev,
          verified_users: confirmed
            ? prev.verified_users + 1
            : Math.max(0, prev.verified_users - 1),
        }));
        if (selectedUser?.id === userId) {
          setSelectedUser((prev) => (prev ? { ...prev, email_confirmed: confirmed } : null));
        }
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update confirmation status." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Error updating confirmation." });
    } finally {
      setUpdatingId(null);
    }
  };

  const formatTimeAgo = (timestamp: string | null) => {
    if (!timestamp) return "Never";
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

    const matchesPresence =
      presenceFilter === "ALL" ||
      (presenceFilter === "ONLINE" && u.is_online) ||
      (presenceFilter === "OFFLINE" && !u.is_online);

    return matchesSearch && matchesRole && matchesPresence;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            Users & Verification
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
            Real-time directory of all registered NammaTech accounts, activity presence, roles, and verification status.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchUsers}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--secondary)] text-xs font-semibold text-[var(--foreground)] transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-500" : ""}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh Presence"}</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 border ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button type="button" onClick={() => setMessage(null)} className="p-1 hover:opacity-70">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--muted-foreground)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
            {stats.total_users}
          </div>
          <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
            Registered on NammaTech
          </p>
        </div>

        {/* Online Now */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--muted-foreground)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Online Now</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
              {stats.online_users}
            </span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
            Active in the last 5 minutes
          </p>
        </div>

        {/* Admins */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--muted-foreground)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Administrators</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
            {stats.admin_users}
          </div>
          <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
            Admins & Super Admins
          </p>
        </div>

        {/* Email Verified */}
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--muted-foreground)] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Verified Accounts</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)]">
            {stats.verified_users}
          </div>
          <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
            Confirmed email addresses
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or user UUID..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>

          {/* Presence Filter */}
          <select
            value={presenceFilter}
            onChange={(e) => setPresenceFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="ONLINE">🟢 Online Now</option>
            <option value="OFFLINE">⚪ Offline</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border)] bg-[var(--secondary)]/50 text-[var(--muted-foreground)] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4">Activity</th>
                <th className="py-3.5 px-4">Joined / Last Seen</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--muted-foreground)]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                      <span>Loading NammaTech user directory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[var(--muted-foreground)]">
                    No users match your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-[var(--secondary)]/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedUser(u)}
                    >
                      {/* User Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FD1843] to-[#ff4d6d] flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                            {u.full_name ? u.full_name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-[var(--foreground)] truncate">
                              {u.full_name}
                            </span>
                            <span className="text-[11px] text-[var(--muted-foreground)] truncate">
                              {u.email}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] font-mono text-[var(--muted-foreground)] truncate max-w-[120px]">
                                {u.id}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyId(u.id);
                                }}
                                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                                title="Copy UID"
                              >
                                {copiedId === u.id ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Online/Offline Status */}
                      <td className="py-3.5 px-4">
                        {u.is_online ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--secondary)] text-[var(--muted-foreground)] border border-[var(--border)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted-foreground)]/50"></span>
                            Offline ({formatTimeAgo(u.last_seen_at)})
                          </span>
                        )}
                      </td>

                      {/* Role Column */}
                      <td className="py-3.5 px-4">
                        {u.role === "SUPER_ADMIN" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-sm">
                            <Crown className="w-3 h-3 text-amber-500" />
                            SUPER ADMIN
                          </span>
                        ) : u.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                            <ShieldCheck className="w-3 h-3" />
                            ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                            USER
                          </span>
                        )}
                      </td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-4">
                        {u.email_confirmed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirmed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Unconfirmed</span>
                          </span>
                        )}
                      </td>

                      {/* Activity Stats */}
                      <td className="py-3.5 px-4 text-[11px] text-[var(--muted-foreground)]">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1" title="Orders Count">
                            <ShoppingBag className="w-3 h-3 text-indigo-500" />
                            <span>{u.orders_count}</span>
                          </span>
                          <span className="flex items-center gap-1" title="Downloads Count">
                            <Download className="w-3 h-3 text-cyan-500" />
                            <span>{u.downloads_count}</span>
                          </span>
                        </div>
                      </td>

                      {/* Joined Date & Last Sign In */}
                      <td className="py-3.5 px-4 text-[11px] text-[var(--muted-foreground)]">
                        <div>
                          <span>Joined {new Date(u.created_at).toLocaleDateString()}</span>
                          <div className="text-[10px] opacity-75">
                            Active: {formatTimeAgo(u.last_sign_in_at)}
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={u.role}
                            disabled={updatingId === u.id}
                            onChange={(e) =>
                              handleUpdateRole(
                                u.id,
                                e.target.value as "USER" | "ADMIN" | "SUPER_ADMIN"
                              )
                            }
                            className="px-2 py-1 text-[11px] rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none"
                          >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                          </select>

                          {!u.email_confirmed ? (
                            <button
                              type="button"
                              disabled={updatingId === u.id}
                              onClick={() => handleToggleConfirm(u.id, true)}
                              title="Confirm & Approve Account"
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-all shadow-xs"
                            >
                              {updatingId === u.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              <span>Approve</span>
                            </button>
                          ) : (
                            <span
                              title="Confirmed & Approved"
                              className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 px-1"
                            >
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span>Approved</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-[var(--border)] hover:bg-[var(--secondary)] text-[var(--foreground)]"
                          >
                            Verify
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeletingUser(u);
                              setIsDeleteModalOpen(true);
                            }}
                            title="Delete User"
                            className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Drawer / Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FD1843] to-[#ff4d6d] flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {selectedUser.full_name ? selectedUser.full_name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--foreground)]">
                    {selectedUser.full_name}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)]">{selectedUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status & Role Badges */}
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-[var(--secondary)]/60 border border-[var(--border)]">
              {selectedUser.is_online ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Online Now
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-[var(--muted-foreground)]">
                  Offline ({formatTimeAgo(selectedUser.last_seen_at)})
                </span>
              )}

              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                {selectedUser.role}
              </span>

              {selectedUser.email_confirmed ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Email Confirmed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Email Pending
                </span>
              )}
            </div>

            {/* Dossier Grid */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <span className="text-[var(--muted-foreground)]">User ID (UUID)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-[var(--foreground)] truncate max-w-[200px]">
                    {selectedUser.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyId(selectedUser.id)}
                    className="p-1 hover:text-[var(--primary)]"
                    title="Copy"
                  >
                    {copiedId === selectedUser.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <span className="text-[var(--muted-foreground)]">Auth Provider</span>
                <span className="font-medium text-[var(--foreground)] uppercase">
                  {selectedUser.provider}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <span className="text-[var(--muted-foreground)]">Last Sign-In Timestamp</span>
                <span className="font-medium text-[var(--foreground)]">
                  {selectedUser.last_sign_in_at
                    ? new Date(selectedUser.last_sign_in_at).toLocaleString()
                    : "No login recorded"}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)]">
                <span className="text-[var(--muted-foreground)]">Account Created</span>
                <span className="font-medium text-[var(--foreground)]">
                  {new Date(selectedUser.created_at).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-center">
                  <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider block">
                    Completed Orders
                  </span>
                  <span className="text-lg font-bold text-[var(--foreground)]">
                    {selectedUser.orders_count}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-center">
                  <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider block">
                    Downloads Recorded
                  </span>
                  <span className="text-lg font-bold text-[var(--foreground)]">
                    {selectedUser.downloads_count}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Approval & Verification Status in Drawer */}
            <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--secondary)]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold text-[var(--foreground)] block">
                  Admin Approval Status:
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  {selectedUser.email_confirmed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approved & Confirmed (Active)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <AlertCircle className="w-4 h-4 animate-pulse" />
                      <span>Pending Admin Approval (Unconfirmed)</span>
                    </span>
                  )}
                </div>
              </div>

              {!selectedUser.email_confirmed ? (
                <button
                  type="button"
                  disabled={updatingId === selectedUser.id}
                  onClick={() => handleToggleConfirm(selectedUser.id, true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {updatingId === selectedUser.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Approve & Confirm Account</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={updatingId === selectedUser.id}
                  onClick={() => handleToggleConfirm(selectedUser.id, false)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold transition-all disabled:opacity-50"
                >
                  <span>Revoke Approval</span>
                </button>
              )}
            </div>

            {/* Quick Role Actions in Drawer */}
            <div className="pt-2 border-t border-[var(--border)] flex flex-col gap-2">
              <span className="text-[11px] font-semibold text-[var(--foreground)]">
                Admin Role Assignment:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={selectedUser.role === "USER" || updatingId === selectedUser.id}
                  onClick={() => handleUpdateRole(selectedUser.id, "USER")}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedUser.role === "USER"
                      ? "bg-slate-500/15 border-slate-500/30 text-slate-500 cursor-not-allowed"
                      : "border-[var(--border)] hover:bg-[var(--secondary)] text-[var(--foreground)]"
                  }`}
                >
                  Set as User
                </button>
                <button
                  type="button"
                  disabled={selectedUser.role === "ADMIN" || updatingId === selectedUser.id}
                  onClick={() => handleUpdateRole(selectedUser.id, "ADMIN")}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedUser.role === "ADMIN"
                      ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-500 cursor-not-allowed"
                      : "border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                  }`}
                >
                  Make Admin
                </button>
                <button
                  type="button"
                  disabled={selectedUser.role === "SUPER_ADMIN" || updatingId === selectedUser.id}
                  onClick={() => handleUpdateRole(selectedUser.id, "SUPER_ADMIN")}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedUser.role === "SUPER_ADMIN"
                      ? "bg-purple-500/15 border-purple-500/30 text-purple-500 cursor-not-allowed"
                      : "border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400"
                  }`}
                >
                  Make Super Admin
                </button>
              </div>
            </div>

            {/* Danger Zone in Drawer */}
            <div className="pt-3 border-t border-red-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-red-600 dark:text-red-400 block">
                  Permanently Remove User
                </span>
                <span className="text-[10px] text-[var(--muted-foreground)]">
                  Deletes auth credentials, profile data, and active sessions.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDeletingUser(selectedUser);
                  setIsDeleteModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {isDeleteModalOpen && deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-[var(--card)] p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-bold text-sm">Confirm Permanent User Deletion</h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingUser(null);
                }}
                className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs leading-relaxed space-y-1">
              <p>
                Are you sure you want to permanently delete user <strong>{deletingUser.email}</strong> (
                {deletingUser.full_name || "No name"})?
              </p>
              <p className="text-[11px] opacity-90 font-mono">
                UID: {deletingUser.id}
              </p>
            </div>

            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              This action will remove the user from Supabase Auth and cascade delete all their profile data and access tokens. This action cannot be reversed.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingUser(null);
                }}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--secondary)] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDeleteUser}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
