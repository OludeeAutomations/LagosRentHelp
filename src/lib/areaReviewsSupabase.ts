import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase configuration for Area Reviews.");
}

// Area Reviews deliberately uses a different browser storage key. It shares
// the same user identity database, but not the landlord/main-site login session.
export const areaReviewsSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "lagosrenthelp-area-reviews-auth",
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: "pkce",
    persistSession: true,
  },
});
