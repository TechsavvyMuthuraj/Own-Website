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

        // ── AUTO-LOGOUT ON BROWSER/TAB CLOSE ──
        // sessionStorage is automatically cleared by the browser when the tab or window is closed.
        // If currentUser is cached in Supabase storage but sessionStorage has no liveness token,
        // it means the user closed the website previously. We immediately log them out for security.
        if (currentUser && typeof window !== "undefined") {
          const isAlive = sessionStorage.getItem(SESSION_LIVENESS_KEY);
          if (!isAlive) {
            console.warn("Website was previously closed: auto-terminating session for security.");
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            setLoading(false);
            return;
          }
        }

        setUser(currentUser);

        if (currentUser) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(SESSION_LIVENESS_KEY, "true");
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
          sessionStorage.setItem(SESSION_LIVENESS_KEY, "true");
        }
        await fetchProfile(current.id);
      } else {
        setProfile(null);
        if (typeof window !== "undefined") {
          try {
            sessionStorage.removeItem(SESSION_LIVENESS_KEY);
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

  // ── AUTO-LOGOUT ON WEBSITE MINIMIZE OR WINDOW CLOSE ──
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Document is hidden / window is minimized
        // 1.5 second timeout: ensures intentional minimize logs out,
        // while allowing an instant accidental click to recover.
        if (minimizeTimerRef.current) clearTimeout(minimizeTimerRef.current);
        minimizeTimerRef.current = setTimeout(async () => {
          console.warn("Website was minimized or hidden: auto-logging out session.");
          if (typeof window !== "undefined") {
            sessionStorage.removeItem(SESSION_LIVENESS_KEY);
            try {
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
            window.location.href = "/?logged_out=minimized";
          }
        }, 1500);
      } else {
        // Window was restored/un-minimized before timeout expired
        if (minimizeTimerRef.current) {
          clearTimeout(minimizeTimerRef.current);
          minimizeTimerRef.current = null;
        }
      }
    };

    const handlePageHide = () => {
      // Browser tab/window is closing
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(SESSION_LIVENESS_KEY);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);

    return () => {
      if (minimizeTimerRef.current) {
        clearTimeout(minimizeTimerRef.current);
        minimizeTimerRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
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
        localStorage.removeItem("nammatech_support_session_id_v2");
        localStorage.removeItem("nammatech_support_session_id");
        localStorage.removeItem("nammatech_support_username");
        localStorage.removeItem("nammatech_support_email");
        localStorage.removeItem("nammatech_support_category");
        localStorage.removeItem("nammatech_support_user_id");
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
