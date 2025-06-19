// src/hooks/useSession.js
import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClient.js";

export function useSession() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  // on mount: get the current session
  useEffect(() => {
    console.log("useSession: useEffect triggered - attempting to get session.");
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("useSession: Error getting session initially:", error.message);
        return;
      }
      setSession(data.session);
      if (data.session) {
        console.log("useSession: Initial session found. User ID:", data.session.user.id);
        initUser(data.session.user);
      } else {
        console.log("useSession: No initial session found.");
      }
    });

    // subscribe to any future changes (login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log("useSession: Auth state changed. Event:", _event);
      setSession(newSession);
      if (newSession) {
        console.log("useSession: New session found from auth state change. User ID:", newSession.user.id);
        initUser(newSession.user);
      } else {
        console.log("useSession: No session found from auth state change (user logged out or session expired).");
        setRole(null);
        setUser(null);
      }
    });

    return () => {
      console.log("useSession: Cleaning up auth state change subscription.");
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array means this runs once on mount

  // helper to fetch user info + role
  const initUser = async (u) => {
    // Before attempting to fetch profile, confirm we have a user object
    if (!u || !u.id) {
      console.warn("initUser: Attempted to fetch profile without a valid user object or user ID.");
      setRole(null);
      setUser(null);
      return;
    }

    console.log("initUser: Attempting to fetch profile for user ID:", u.id);
    setUser({ id: u.id, email: u.email });

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", u.id)
        .single(); // Using .single() implies you expect one row

      if (error) {
        console.error("initUser: Failed to fetch profile role. Error message:", error.message);
        console.error("initUser: Full error object:", error); // Log the full error object for more details
        setRole(null);
        return;
      }

      if (!profile) {
        console.warn("initUser: No profile data returned from query for user ID:", u.id);
        setRole(null);
        return;
      }

      console.log("initUser: Successfully fetched profile. User role:", profile.role);
      setRole(profile.role);

    } catch (e) {
      console.error("initUser: An unexpected error occurred during profile fetch:", e.message);
      console.error("initUser: Full unexpected error object:", e);
      setRole(null);
    }
  };

  return { session, user, role };
}