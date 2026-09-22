"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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

        setUser(currentUser);

        if (currentUser) {
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
        await fetchProfile(current.id);
      } else {
        setProfile(null);
        if (typeof window !== "undefined") {
          try {
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
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setProfile(null);

    if (typeof window !== "undefined") {
      try {
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
