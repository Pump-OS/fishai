"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types";

const GUEST_KEY = "fishai-guest-profile";

interface GuestProfile {
  id: string;
  username: string;
  display_name: string;
  is_guest: true;
}

function generateGuestId(): string {
  return "guest-" + Math.random().toString(36).substring(2, 10);
}

function loadGuest(): GuestProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveGuest(guest: GuestProfile) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
}

function clearGuest() {
  localStorage.removeItem(GUEST_KEY);
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: check Supabase auth first, then fall back to guest
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      try {
        const supabase = createClient();
        const { data: { user: supaUser } } = await supabase.auth.getUser();
        setUser(supaUser);

        if (supaUser) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", supaUser.id)
            .single();
          setProfile(data);
        }

        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
              const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();
              setProfile(data);
              // Clear guest if real user signs in
              clearGuest();
              setGuestProfile(null);
            } else {
              setProfile(null);
            }
          }
        );
        subscription = sub;
      } catch {
        // Supabase not configured
      }

      // If no Supabase user, check for guest
      if (!user) {
        const guest = loadGuest();
        if (guest) setGuestProfile(guest);
      }

      setLoading(false);
    };

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Login/Password auth (Supabase email+password under the hood) ───
  const signUp = useCallback(async (login: string, password: string) => {
    try {
      const supabase = createClient();
      // Use login as pseudo-email for Supabase
      const email = login.includes("@") ? login : `${login}@fishai.app`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: login },
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch {
      return { error: "Registration failed. Try again, survivor." };
    }
  }, []);

  const signIn = useCallback(async (login: string, password: string) => {
    try {
      const supabase = createClient();
      const email = login.includes("@") ? login : `${login}@fishai.app`;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch {
      return { error: "Login failed. The NPC doesn't recognize you." };
    }
  }, []);

  // ─── Guest mode ─────────────────────────────────────────────────────
  const continueAsGuest = useCallback(() => {
    const guest: GuestProfile = {
      id: generateGuestId(),
      username: "guest_" + Math.random().toString(36).substring(2, 6),
      display_name: "Guest Survivor",
      is_guest: true,
    };
    saveGuest(guest);
    setGuestProfile(guest);
  }, []);

  // ─── Sign out ───────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch { /* ignore */ }
    setUser(null);
    setProfile(null);
    clearGuest();
    setGuestProfile(null);
  }, []);

  // ─── Computed values ────────────────────────────────────────────────
  const isGuest = !user && !!guestProfile;
  const isAuthenticated = !!user || !!guestProfile;

  const displayName = profile?.display_name
    || guestProfile?.display_name
    || "Angler";

  const displayProfile: Partial<Profile> & { is_guest?: boolean } | null =
    profile
      ? profile
      : guestProfile
        ? {
            id: guestProfile.id,
            username: guestProfile.username,
            display_name: guestProfile.display_name,
            is_pro: false,
            total_score: 0,
            catch_count: 0,
            avatar_url: null,
            bio: null,
            wallet_address: null,
            is_guest: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : null;

  return {
    user,
    profile: displayProfile as Profile | null,
    loading,
    isGuest,
    isAuthenticated,
    displayName,
    signIn,
    signUp,
    continueAsGuest,
    signOut,
  };
}
