"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const supabase = createClient();

const SESSION_LIVENESS_KEY = "nammatech_session_alive";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const minimizeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, full_name, avatar_url, updated_at")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        // ── 30-MINUTE INACTIVITY CHECK ON INIT ──
        // If currentUser exists but 30 minutes of idle inactivity have elapsed,
        // log out for security. Otherwise, update last active and preserve multi-tab session.
        if (currentUser && typeof window !== "undefined") {
          const storedLastActive = localStorage.getItem("nammatech_last_active_time");
          if (storedLastActive) {
            const parsed = parseInt(storedLastActive, 10);
            if (!isNaN(parsed) && Date.now() - parsed >= 30 * 60 * 1000) {
              console.warn("Session expired after 30 minutes of inactivity: auto-signing out.");
              try {
                localStorage.removeItem("nammatech_last_active_time");
              } catch {}
              await supabase.auth.signOut();
              setUser(null);
              setProfile(null);
              setLoading(false);
              return;
            }
          }
          localStorage.setItem("nammatech_last_active_time", String(Date.now()));
        }

        setUser(currentUser);

        if (currentUser) {
          if (typeof window !== "undefined") {
            localStorage.setItem("nammatech_last_active_time", String(Date.now()));
          }
          await fetchProfile(currentUser.id);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      const current = session?.user ?? null;
      setUser(current);
      if (current) {
        if (typeof window !== "undefined") {
          localStorage.setItem("nammatech_last_active_time", String(Date.now()));
        }
        await fetchProfile(current.id);
      } else {
        setProfile(null);
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("nammatech_last_active_time");
            localStorage.removeItem("nammatech_support_session_id_v2");
            localStorage.removeItem("nammatech_support_session_id");
            localStorage.removeItem("nammatech_support_username");
            localStorage.removeItem("nammatech_support_email");
            localStorage.removeItem("nammatech_support_category");
            localStorage.removeItem("nammatech_support_user_id");
          } catch {}
          window.dispatchEvent(new CustomEvent("nammatech-user-signed-out"));
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ── 30-MINUTE INACTIVITY SESSION TIMER ──
  // User is kept logged in while actively interacting (mouse, key, scroll, touch).
  // If user minimizes the site, hides the tab, or remains idle for 30 minutes, they are automatically logged out.
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
    const SESSION_LAST_ACTIVE_KEY = "nammatech_last_active_time";

    const getStoredLastActive = (): number => {
      if (typeof window === "undefined") return Date.now();
      const val = localStorage.getItem(SESSION_LAST_ACTIVE_KEY);
      if (val) {
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      return Date.now();
    };

    let lastActive = getStoredLastActive();
    localStorage.setItem(SESSION_LAST_ACTIVE_KEY, String(lastActive));

    let lastThrottleWrite = 0;
    const recordUserActivity = () => {
      const now = Date.now();
      lastActive = now;
      // Throttle localStorage writes to at most once every 5 seconds for smooth performance
      if (now - lastThrottleWrite > 5000) {
        lastThrottleWrite = now;
        localStorage.setItem(SESSION_LAST_ACTIVE_KEY, String(now));
      }
    };

    const performInactivityLogout = async () => {
      console.warn("Session expired after 30 minutes of inactivity. Logging out.");
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(SESSION_LIVENESS_KEY);
        try {
          localStorage.removeItem(SESSION_LAST_ACTIVE_KEY);
          localStorage.removeItem("nammatech_support_session_id_v2");
          localStorage.removeItem("nammatech_support_session_id");
          localStorage.removeItem("nammatech_support_username");
          localStorage.removeItem("nammatech_support_email");
          localStorage.removeItem("nammatech_support_category");
          localStorage.removeItem("nammatech_support_user_id");
        } catch {}
      }
      try {
        await supabase.auth.signOut();
      } catch {}
      setUser(null);
      setProfile(null);
      if (typeof window !== "undefined") {
        window.location.href = "/?logged_out=inactivity_30m";
      }
    };

    const checkInactivity = () => {
      const stored = getStoredLastActive();
      const effectiveLastActive = Math.max(lastActive, stored);
      const elapsed = Date.now() - effectiveLastActive;

      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        performInactivityLogout();
      }
    };

    // Periodic check every 10 seconds while tab is open
    const intervalId = setInterval(checkInactivity, 10000);

    // Immediate check when tab visibility changes or window receives focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // User restored or switched back to tab: check if 30 minutes have passed
        checkInactivity();
      }
    };

    const handleFocus = () => {
      checkInactivity();
    };

    // User activity event listeners: any interaction resets the timer
    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, recordUserActivity, { passive: true });
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(intervalId);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, recordUserActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user]);

  // Presence heartbeat for real-time online status
  useEffect(() => {
    if (!user) return;

    const sendHeartbeat = async () => {
      try {
        await fetch("/api/user/heartbeat", { method: "POST" });
      } catch {
        // silent heartbeat
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 60000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const signOut = async () => {
    if (minimizeTimerRef.current) {
      clearTimeout(minimizeTimerRef.current);
      minimizeTimerRef.current = null;
    }
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setProfile(null);

    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(SESSION_LIVENESS_KEY);
        localStorage.removeItem("nammatech_last_active_time");
        localStorage.removeItem("nammatech_support_session_id_v2");
        localStorage.removeItem("nammatech_support_session_id");
        localStorage.removeItem("nammatech_support_username");
        localStorage.removeItem("nammatech_support_email");
        localStorage.removeItem("nammatech_support_category");
        localStorage.removeItem("nammatech_support_user_id");
        localStorage.removeItem("nammatech_active_specialist_session");
        localStorage.removeItem("nammatech_specialist_last_active_time");
        sessionStorage.clear();
      } catch {}

      window.dispatchEvent(new CustomEvent("nammatech-user-signed-out"));

      // Clean refresh to home page clearing all in-memory state
      window.location.href = "/";
    }
  };

  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "techsavvy.muthuraj.dev@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  const isConfiguredAdmin = Boolean(user?.email && adminEmails.includes(user.email.toLowerCase()));
  const isAdmin = isConfiguredAdmin || profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
