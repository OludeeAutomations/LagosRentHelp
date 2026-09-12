import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types";

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "user" | "landlord";
  avatar?: string;
}

export interface SupabaseAuthResult {
  accessToken: string;
  user: User;
}

const allowedRoles: User["role"][] = [
  "user",
  "landlord",
  "agent",
  "admin",
  "super_admin",
];

const PRIMARY_ADMIN_EMAIL = "info@lagosrenthelp.ng";

const getRole = (authUser: SupabaseUser): User["role"] => {
  // user_metadata is editable by the user, so elevated roles must only come
  // from trusted app_metadata.
  const candidate = authUser.app_metadata?.role;
  if (candidate === "agent") return "landlord";
  if (allowedRoles.includes(candidate)) return candidate;

  // This is only an interface hint before the database profile is resolved.
  // Supabase RLS never trusts user_metadata for authorization.
  return authUser.user_metadata?.account_type === "landlord"
    ? "landlord"
    : "user";
};

const getAuthAvatar = (authUser: SupabaseUser): string | undefined => {
  const metadataAvatar =
    authUser.user_metadata?.avatar_url ||
    authUser.user_metadata?.picture ||
    authUser.user_metadata?.avatar;
  if (metadataAvatar) return metadataAvatar;

  const googleIdentity = authUser.identities?.find(
    (identity) => identity.provider === "google",
  );
  return (
    googleIdentity?.identity_data?.avatar_url ||
    googleIdentity?.identity_data?.picture
  );
};

export const mapSupabaseUser = (authUser: SupabaseUser): User => ({
  _id: authUser.id,
  name:
    authUser.user_metadata?.full_name ||
    authUser.user_metadata?.name ||
    authUser.email?.split("@")[0] ||
    "User",
  email: authUser.email || "",
  phone: authUser.phone || authUser.user_metadata?.phone || "",
  avatar: getAuthAvatar(authUser),
  displayAvatar: getAuthAvatar(authUser),
  role: getRole(authUser),
  favorites: [],
  searchHistory: [],
  createdAt: authUser.created_at,
  emailVerified: Boolean(authUser.email_confirmed_at),
  phoneVerified: Boolean(authUser.phone_confirmed_at),
});

type DatabaseProfile = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string | null;
  role?: User["role"];
  created_at?: string;
};

const resolveSupabaseUser = async (authUser: SupabaseUser): Promise<User> => {
  const fallback = mapSupabaseUser(authUser);
  let { data, error } = await supabase.rpc(
    authUser.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL
      ? "claim_primary_admin"
      : "ensure_my_profile",
  );

  // Keep sign-in compatible while the administrator migration is being
  // installed. The database remains the source of truth for elevated roles.
  if (error && authUser.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL) {
    ({ data, error } = await supabase.rpc("ensure_my_profile"));
  }

  // The fallback keeps authentication usable until the landlord SQL migration
  // has been installed. Database writes remain protected by RLS.
  if (error || !data || typeof data !== "object") return fallback;

  const profile = data as DatabaseProfile;
  const databaseRole = profile.role === "agent" ? "landlord" : profile.role;

  return {
    ...fallback,
    _id: profile.id || fallback._id,
    name: profile.name || fallback.name,
    email: profile.email || fallback.email,
    phone: profile.phone || fallback.phone,
    avatar: profile.avatar || fallback.avatar,
    displayAvatar: profile.avatar || fallback.displayAvatar,
    role:
      databaseRole && allowedRoles.includes(databaseRole)
        ? databaseRole
        : fallback.role,
    createdAt: profile.created_at || fallback.createdAt,
  };
};

export const mapSupabaseSession = async (
  session: Session,
): Promise<SupabaseAuthResult> => ({
  accessToken: session.access_token,
  user: await resolveSupabaseUser(session.user),
});

const DUPLICATE_PHONE_MESSAGE =
  "This phone number is already linked to another account. Use a different number or sign in to the existing account.";

const isDuplicatePhoneError = (error: {
  message: string;
  code?: string;
  details?: string;
}) => {
  const databaseMessage = `${error.message} ${error.details || ""}`;
  return (
    databaseMessage.includes("users_phone_key") ||
    (error.code === "23505" && databaseMessage.toLowerCase().includes("phone"))
  );
};

const throwIfError = (
  error: { message: string; code?: string; details?: string } | null,
) => {
  if (!error) return;

  if (isDuplicatePhoneError(error)) {
    throw new Error(DUPLICATE_PHONE_MESSAGE);
  }

  throw new Error(error.message);
};

export const authService = {
  login: async (email: string, password: string): Promise<SupabaseAuthResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    throwIfError(error);

    if (!data.session) throw new Error("Supabase did not create a session.");
    return await mapSupabaseSession(data.session);
  },

  loginWithGoogle: async (
    accountType?: RegisterData["role"],
  ): Promise<void> => {
    if (accountType) {
      localStorage.setItem("pending_account_type", accountType);
    } else {
      localStorage.removeItem("pending_account_type");
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) localStorage.removeItem("pending_account_type");
    throwIfError(error);
  },

  completeUserProfile: async (name: string, phone: string): Promise<User> => {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase.rpc("complete_user_profile", {
      p_name: name.trim(),
      p_phone: phone.trim(),
    });
    throwIfError(error);

    // Persist display metadata only after the public profile transaction has
    // accepted the submitted phone number.
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        ...(currentUser?.user_metadata || {}),
        full_name: name.trim(),
        name: name.trim(),
        phone: phone.trim(),
      },
    });
    throwIfError(authError);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No signed-in user was found.");
    const profile = data as DatabaseProfile;
    const mapped = mapSupabaseUser(user);
    return {
      ...mapped,
      _id: profile.id || mapped._id,
      name: profile.name || mapped.name,
      phone: profile.phone || mapped.phone,
      role: profile.role || mapped.role,
    };
  },

  register: async (userData: RegisterData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: userData.name.trim(),
          name: userData.name.trim(),
          phone: userData.phone.trim(),
          account_type: userData.role,
        },
      },
    });
    throwIfError(error);

    return {
      success: true,
      requiresVerification: !data.session,
      auth: data.session ? await mapSupabaseSession(data.session) : undefined,
    };
  },

  sendPasswordResetEmail: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: `${window.location.origin}/reset-password` },
    );
    throwIfError(error);
  },

  resetPassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    throwIfError(error);
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    throwIfError(userError);

    const email = userData.user?.email;
    if (!email) throw new Error("No email is associated with this account.");

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: oldPassword,
    });
    throwIfError(loginError);

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    throwIfError(error);
  },

  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    throwIfError(error);
  },

  validateToken: async (): Promise<{
    valid: boolean;
    user?: User;
    accessToken?: string;
    reason?: "no_session" | "account_missing" | "temporary_error";
  }> => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) return { valid: false, reason: "no_session" };

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      const accountMissing =
        !error ||
        error.status === 401 ||
        error.status === 403 ||
        ["user_not_found", "session_not_found", "refresh_token_not_found"].includes(error.code || "");
      return {
        valid: false,
        reason: accountMissing ? "account_missing" : "temporary_error",
      };
    }

    return {
      valid: true,
      user: await resolveSupabaseUser(data.user),
      accessToken: session.access_token,
    };
  },

  updateProfile: async (updates: Partial<User>): Promise<User> => {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...(updates.name !== undefined && {
          full_name: updates.name,
          name: updates.name,
        }),
        ...(updates.phone !== undefined && { phone: updates.phone }),
        ...(updates.avatar !== undefined && { avatar_url: updates.avatar }),
      },
    });
    throwIfError(error);
    if (!data.user) throw new Error("Profile update did not return a user.");
    return await resolveSupabaseUser(data.user);
  },

  verifyEmail: async () => {
    const { data, error } = await supabase.auth.getUser();
    throwIfError(error);
    return {
      success: Boolean(data.user?.email_confirmed_at),
      message: data.user?.email_confirmed_at
        ? "Email verified successfully."
        : "Email verification is still pending.",
    };
  },

  resendVerificationEmail: async () => {
    const { data, error: userError } = await supabase.auth.getUser();
    throwIfError(userError);
    const email = data.user?.email;
    if (!email) throw new Error("Please sign in again to resend verification.");

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    throwIfError(error);
  },
};
