import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Agent, User } from "@/types";
import { toast } from "sonner";
import {
  authService,
  mapSupabaseSession,
  type RegisterData,
} from "@/services/authService";
import { supabase } from "@/lib/supabase";

interface AuthState {
  validateAuth: () => Promise<boolean>;
  initializeAuth: () => () => void;
  user: User | null;
  agent: Agent | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setAgent: (agent: Agent | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAccessToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (accountType?: RegisterData["role"]) => Promise<void>;
  register: (
    userData: RegisterData,
  ) => Promise<{
    success: boolean;
    requiresVerification?: boolean;
    error?: string;
  }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  verifyEmail: (userId?: string, token?: string) => Promise<{
    success: boolean;
    message: string;
  }>;
  resendVerificationEmail: (userId?: string) => Promise<void>;
  fetchUserData: () => Promise<void>;
}

const createAuthenticatedState = (
  user: User,
  accessToken: string,
  agent: Agent | null = null,
) => ({
  user,
  accessToken,
  agent,
  isAuthenticated: true,
  loading: false,
  error: null,
});

const createLoggedOutState = (error: string | null = null) => ({
  error,
  loading: false,
  user: null,
  accessToken: null,
  agent: null,
  isAuthenticated: false,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      agent: null,
      accessToken: null,
      isAuthenticated: false,
      loading: true,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
      setAgent: (agent) => set({ agent }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setAccessToken: (accessToken) => set({ accessToken }),

      initializeAuth: () => {
        let remoteValidationRunning = false;

        const clearDeletedAccountSession = async () => {
          try {
            await supabase.auth.signOut({ scope: "local" });
          } finally {
            set(createLoggedOutState("This account is no longer available."));
            toast.error("This account has been deleted. You have been signed out.", {
              id: "deleted-account-session",
            });
          }
        };

        const validateRemoteAccount = async () => {
          if (remoteValidationRunning || !get().isAuthenticated) return;
          remoteValidationRunning = true;
          try {
            const { data, error } = await supabase.auth.getUser();
            const invalidSession =
              !data.user &&
              (!error ||
                error.status === 401 ||
                error.status === 403 ||
                ["user_not_found", "session_not_found", "refresh_token_not_found"].includes(error.code || ""));

            if (invalidSession) await clearDeletedAccountSession();
          } finally {
            remoteValidationRunning = false;
          }
        };

        void get().validateAuth();

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (!session) {
            set(createLoggedOutState());
            return;
          }

          // Profile services update the store after metadata changes. Running
          // ensure_my_profile here too races the completion RPC and can try to
          // create the same public user twice.
          if (event === "USER_UPDATED") {
            set({ accessToken: session.access_token });
            return;
          }

          // Run profile hydration after Supabase finishes processing the auth
          // event to avoid nested auth-client calls inside the callback.
          window.setTimeout(() => {
            void mapSupabaseSession(session)
              .then((auth) => {
                set(createAuthenticatedState(auth.user, auth.accessToken));
              })
              .catch(() => void validateRemoteAccount());
          }, 0);
        });

        const validateWhenVisible = () => {
          if (document.visibilityState === "visible") void validateRemoteAccount();
        };
        const handleExternalLogout = () => set(createLoggedOutState());
        const validationInterval = window.setInterval(() => {
          void validateRemoteAccount();
        }, 30_000);

        window.addEventListener("focus", validateRemoteAccount);
        window.addEventListener("online", validateRemoteAccount);
        window.addEventListener("auth-logout", handleExternalLogout);
        document.addEventListener("visibilitychange", validateWhenVisible);

        return () => {
          subscription.unsubscribe();
          window.clearInterval(validationInterval);
          window.removeEventListener("focus", validateRemoteAccount);
          window.removeEventListener("online", validateRemoteAccount);
          window.removeEventListener("auth-logout", handleExternalLogout);
          document.removeEventListener("visibilitychange", validateWhenVisible);
        };
      },

      validateAuth: async (): Promise<boolean> => {
        const result = await authService.validateToken();
        if (!result.valid || !result.user || !result.accessToken) {
          if (result.reason === "temporary_error") {
            set({ loading: false });
            return Boolean(get().user);
          }

          try {
            await supabase.auth.signOut({ scope: "local" });
          } catch {
            // Clearing the application state below still ends local access.
          }
          set(createLoggedOutState());
          if (result.reason === "account_missing") {
            toast.error("This account has been deleted. You have been signed out.", {
              id: "deleted-account-session",
            });
          }
          return false;
        }

        set(createAuthenticatedState(result.user, result.accessToken));
        return true;
      },

      register: async (userData) => {
        set({ loading: true, error: null });

        try {
          const result = await authService.register(userData);
          if (result.auth) {
            set(
              createAuthenticatedState(
                result.auth.user,
                result.auth.accessToken,
              ),
            );
          }
          return result;
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Failed to create account";
          set({ error: message, loading: false });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const result = await authService.login(email, password);
          set(createAuthenticatedState(result.user, result.accessToken));
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Failed to login";
          set(createLoggedOutState(message));
          throw error;
        }
      },

      loginWithGoogle: async (accountType) => {
        set({ loading: true, error: null });
        try {
          await authService.loginWithGoogle(accountType);
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Failed to login";
          set({ loading: false, error: message });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } finally {
          set(createLoggedOutState());
        }
      },

      updateProfile: async (updates) => {
        set({ error: null });
        try {
          const updatedUser = await authService.updateProfile(updates);
          set({ user: updatedUser });
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Failed to update profile";
          set({ error: message });
          throw error;
        }
      },

      changePassword: async (oldPassword, newPassword) => {
        set({ loading: true, error: null });
        try {
          await authService.changePassword(oldPassword, newPassword);
          set({ loading: false });
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "Failed to change password";
          set({ loading: false, error: message });
          throw error;
        }
      },

      verifyEmail: async () => authService.verifyEmail(),

      resendVerificationEmail: async () => {
        await authService.resendVerificationEmail();
      },

      fetchUserData: async () => {
        set({ loading: true, error: null });
        const valid = await get().validateAuth();
        if (!valid) set({ loading: false });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        agent: state.agent,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
