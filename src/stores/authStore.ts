// src/store/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, Agent } from "@/types";
import { authService, type RegisterData } from "@/services/authService";
import { userService } from "@/services/userService";

interface AuthState {
  validateAuth: () => Promise<boolean>;
  user: User | null;
  agent: Agent | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setAgent: (agent: Agent | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAccessToken: (token: string | null) => void;

  // Auth Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (userData: any) => Promise<void>;
  register: (
    userData: RegisterData
  ) => Promise<{ success: boolean; requiresVerification?: boolean }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;

  verifyEmail: (userId: string, token: string) => Promise<any>;
  resendVerificationEmail: (userId: string) => Promise<void>; // ✅ Added this
  fetchUserData: () => Promise<void>;
}

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

        // If not supposedly authenticated, nothing to validate
        if (!isAuthenticated || !user || !accessToken) {
          return false;
        }

        try {
          const result = await authService.validateToken();

          if (result.valid && result.user) {
            // Token is valid AND user exists in database
            // Update with fresh user data
            set({ user: result.user });
            return true;
          } else {
            // Token invalid or user deleted
            throw new Error("Authentication failed");
          }
        } catch (error) {
          // User deleted or token expired - LOGOUT
          console.log("🔴 User deleted or token expired, logging out...");
          get().logout();
          return false;
        }
      },

      register: async (userData: RegisterData) => {
        set({ loading: true, error: null });

        try {
          const response = await authService.register(userData);

          // Check if response.data exists, otherwise use response directly
          const data = response.data || response;
          const { user } = data;

          console.log("Registration response:", data);

          if (!user && !data.success) {
            throw new Error("Registration failed: No user data returned");
          }

          return { success: true };
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create account";

          set({
            error: errorMessage,
            loading: false, // Ensure loading is turned off
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

          // ✅ Handle both cases: direct data or axios response
          const data = response.data || response;

          console.log("🔍 Using data:", data);

          const { user, accessToken, agentData } = data;

          if (!user || !accessToken) {
            console.error("❌ Missing data in:", data);
            throw new Error("Invalid response from server");
          }

          set({
            user,
            accessToken,
            agent: agentData || null,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          console.log("✅ Login successful - Agent data:", agentData);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to login";

          set({
            error: errorMessage,
            loading: false,
            user: null,
            accessToken: null,
            agent: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      loginWithGoogle: async (userData: any) => {
        set({ loading: true, error: null });

        try {
          const response = await authService.loginWithGoogle(userData);

          // ✅ Handle both cases: direct data or axios response
          const data = response.data || response;

          console.log("🔍 Using data:", data);

          const { user, accessToken, agentData } = data;

          if (!user || !accessToken) {
            console.error("❌ Missing data in:", data);
            throw new Error("Invalid response from server");
          }

          set({
            user,
            accessToken,
            agent: agentData || null,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          console.log("✅ Login successful - Agent data:", agentData);
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to login";

          set({
            error: errorMessage,
            loading: false,
            user: null,
            accessToken: null,
            agent: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          agent: null,
          accessToken: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
        authService.logout().catch(console.error);
      },

      updateProfile: async (updates: Partial<User>) => {
        set({ error: null });

        try {
          const response = await authService.updateProfile(updates);
          const updatedUser = response.data || response; // Handle both response structures

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

      verifyEmail: async (userId: string, token: string) => {
        try {
          console.log("🔄 AuthStore: Starting email verification...");
          set({ loading: true, error: null });

          const response = await authService.verifyEmail(userId, token);

          console.log("✅ AuthStore: Verification successful:", response);
          set({ loading: false });
          return response;
        } catch (error: any) {
          console.log("❌ AuthStore: Verification error:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Email verification failed";
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      // ✅ ADDED: Resend Email Verification Logic (Not Identity Verification)
      resendVerificationEmail: async (userId: string) => {
        set({ loading: true, error: null });
        try {
          await authService.resendVerificationEmail(userId);
          set({ loading: false });
        } catch (error: any) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to resend email";
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      fetchUserData: async () => {
        set({ loading: true, error: null });

        try {
          // Assuming userService.getProfile returns the user object directly or { data: user }
          const userResponse = await userService.getProfile();

          // Normalize response
          const user = userResponse.data || userResponse;
          const agentData = userResponse.agentData || null;

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

          // Only logout on auth errors, not network errors
          if (
            error instanceof Error &&
            (error.message.includes("401") || error.message.includes("403"))
          ) {
            get().logout();
          }
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Wait for app to load, then validate token
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
    }
  )
);
