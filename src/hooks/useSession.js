// src/hooks/useSession.js
import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClient.js";

export function useSession() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  // on mount: get the current session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) initUser(data.session.user);
    });

    // subscribe to any future changes (login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) initUser(newSession.user);
      else {
        setRole(null);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // helper to fetch user info + role
  const initUser = async (u) => {
    setUser({ id: u.id, email: u.email });
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", u.id)
      .single();
    setRole(profile.role);
  };

  return { session, user, role };
}
