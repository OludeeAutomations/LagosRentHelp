import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Agent, User } from "@/types";
import { authService, type RegisterData } from "@/services/authService";
import { userService } from "@/services/userService";
import { useLoginModalStore } from "@/stores/modalStore";
import { normalizeAuthPayload } from "./authStore.helpers";

interface AuthState {
  validateAuth: () => Promise<boolean>;
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
  loginWithGoogle: (userData: unknown) => Promise<void>;
  register: (
    userData: RegisterData,
  ) => Promise<{ success: boolean; requiresVerification?: boolean }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  verifyEmail: (userId: string, token: string) => Promise<unknown>;
  resendVerificationEmail: (userId: string) => Promise<void>;
  fetchUserData: () => Promise<void>;
}

const createAuthenticatedState = (
  user: User,
  accessToken: string,
  agent: Agent | null,
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
      loading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAgent: (agent) => set({ agent }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setAccessToken: (accessToken) => set({ accessToken }),

      validateAuth: async (): Promise<boolean> => {
        const { user, accessToken, isAuthenticated } = get();

        if (!isAuthenticated || !user || !accessToken) {
          return false;
        }

        try {
          const result = await authService.validateToken();

          if (result.valid && result.user) {
            set({ user: result.user });
            return true;
          }

          throw new Error("Authentication failed");
        } catch {
          get().logout();
          useLoginModalStore
            .getState()
            .openLoginModal(
              "Your session has expired. Please login again to continue.",
              async () => {
                await get().fetchUserData();
              },
            );
          return false;
        }
      },

      register: async (userData: RegisterData) => {
        set({ loading: true, error: null });

        try {
          const response = await authService.register(userData);
          const data = response.data || response;

          if (!data.user && !data.success) {
            throw new Error("Registration failed: No user data returned");
          }

          return { success: true };
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create account";

          set({
            error: errorMessage,
            loading: false,
          });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      login: async (email: string, password: string) => {
        set({ loading: true, error: null });

        try {
          const response = await authService.login(email, password);
          const { user, accessToken, agent } = normalizeAuthPayload(response);
          set(createAuthenticatedState(user, accessToken, agent));
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to login";
          set(createLoggedOutState(errorMessage));
          throw error;
        }
      },

      loginWithGoogle: async (userData: unknown) => {
        set({ loading: true, error: null });

        try {
          const response = await authService.loginWithGoogle(
            userData as object,
          );
          const { user, accessToken, agent } = normalizeAuthPayload(response);
          set(createAuthenticatedState(user, accessToken, agent));
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to login";
          set(createLoggedOutState(errorMessage));
          throw error;
        }
      },

      logout: () => {
        set(createLoggedOutState());
        authService.logout();
      },

      updateProfile: async (updates: Partial<User>) => {
        set({ error: null });

        try {
          const response = await authService.updateProfile(updates);
          const updatedUser = response.data || response;

          set((state) => ({
            user: state.user ? { ...state.user, ...updatedUser } : null,
          }));
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update profile";
          set({ error: errorMessage });
          throw error;
        }
      },

      changePassword: async (oldPassword: string, newPassword: string) => {
        set({ loading: true, error: null });

        try {
          await authService.changePassword(oldPassword, newPassword);
          set({ loading: false, error: null });
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to change password";
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      verifyEmail: async (userId: string, token: string) => {
        try {
          set({ loading: true, error: null });
          const response = await authService.verifyEmail(userId, token);
          set({ loading: false });
          return response;
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Email verification failed";
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      resendVerificationEmail: async (userId: string) => {
        set({ loading: true, error: null });
        try {
          await authService.resendVerificationEmail(userId);
          set({ loading: false });
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to resend email";
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      fetchUserData: async () => {
        set({ loading: true, error: null });

        try {
          const userResponse = await userService.getProfile();
          const responseData = userResponse as {
            data?: User;
            agentData?: Agent | null;
          };
          const user = responseData.data || (userResponse as unknown as User);
          const agentData = responseData.agentData || null;

          set({
            user,
            agent: user.role === "agent" ? agentData : null,
            loading: false,
            error: null,
          });
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch user data";

          set({
            error: errorMessage,
            loading: false,
          });

          if (
            error instanceof Error &&
            (error.message.includes("401") || error.message.includes("403"))
          ) {
            get().logout();
            useLoginModalStore
              .getState()
              .openLoginModal(
                "Your session has expired. Please login again to continue.",
                async () => {
                  await get().fetchUserData();
                },
              );
          }
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          setTimeout(() => {
            state.validateAuth();
          }, 1000);
        }
      },
      partialize: (state) => ({
        user: state.user,
        agent: state.agent,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

if (typeof window !== "undefined") {
  window.addEventListener("auth-token-refresh", (event: Event) => {
    const token = (event as CustomEvent<string>).detail;
    if (token) {
      useAuthStore.getState().setAccessToken(token);
    }
  });

  window.addEventListener("auth-logout", () => {
    useAuthStore.getState().logout();
  });
}
