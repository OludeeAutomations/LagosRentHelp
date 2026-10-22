import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { create } from "zustand";
import { areaReviewsSupabase } from "@/lib/areaReviewsSupabase";

export interface AreaReviewsAccount {
  id: string;
  email: string;
  name: string;
}

interface AreaReviewsAuthState {
  user: AreaReviewsAccount | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => () => void;
  setSession: (session: Session | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (returnTo?: string) => Promise<void>;
  signUp: (details: { name: string; email: string; phone: string; password: string }) => Promise<{ requiresVerification: boolean }>;
  signOut: () => Promise<void>;
}

const mapAccount = (user: SupabaseUser): AreaReviewsAccount => ({
  id: user.id,
  email: user.email || "",
  name: String(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Resident"),
});

export const useAreaReviewsAuthStore = create<AreaReviewsAuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  setSession: (session) => set({ user: session ? mapAccount(session.user) : null, loading: false, initialized: true }),

  initialize: () => {
    let active = true;
    void areaReviewsSupabase.auth.getSession()
      .then(({ data }) => {
        if (active) set({ user: data.session ? mapAccount(data.session.user) : null, loading: false, initialized: true });
      })
      .catch(() => {
        if (active) set({ user: null, loading: false, initialized: true });
      });

    const { data: { subscription } } = areaReviewsSupabase.auth.onAuthStateChange((_event, session) => {
      if (active) set({ user: session ? mapAccount(session.user) : null, loading: false, initialized: true });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  },

  signIn: async (email, password) => {
    set({ loading: true });
    const { data, error } = await areaReviewsSupabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      set({ loading: false });
      throw new Error(error.message);
    }
    set({ user: mapAccount(data.user), loading: false, initialized: true });
  },

  signInWithGoogle: async (returnTo = "/area-reviews") => {
    set({ loading: true });
    const safeReturnTo = returnTo.startsWith("/area-reviews")
      && !returnTo.startsWith("/area-reviews/login")
      && !returnTo.startsWith("/area-reviews/register")
      && !returnTo.startsWith("/area-reviews/auth/")
      ? returnTo
      : "/area-reviews";
    localStorage.setItem("area_reviews_oauth_return_to", safeReturnTo);
    const { error } = await areaReviewsSupabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/area-reviews/auth/callback`,
      },
    });
    if (error) {
      localStorage.removeItem("area_reviews_oauth_return_to");
      set({ loading: false });
      throw new Error(error.message);
    }
  },

  signUp: async ({ name, email, phone, password }) => {
    set({ loading: true });
    const { data, error } = await areaReviewsSupabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/area-reviews/auth/callback`,
        data: {
          full_name: name.trim(),
          name: name.trim(),
          phone: phone.trim(),
          account_type: "user",
        },
      },
    });
    if (error) {
      set({ loading: false });
      throw new Error(error.message);
    }
    if (data.user && data.user.identities?.length === 0) {
      set({ loading: false });
      throw new Error("An account already exists for this email. Please sign in instead.");
    }
    set({ user: data.session ? mapAccount(data.session.user) : null, loading: false, initialized: true });
    return { requiresVerification: !data.session };
  },

  signOut: async () => {
    await areaReviewsSupabase.auth.signOut({ scope: "local" });
    set({ user: null, loading: false, initialized: true });
  },
}));
