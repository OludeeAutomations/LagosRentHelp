import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, Agent } from "@/types";
import { authService, type RegisterData } from "@/services/authService";
import { userService } from "@/services/userService";
import { agentService } from "@/services/agentService";

interface AuthState {
  user: User | null;
  agent: Agent | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setAgent: (agent: Agent | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Auth Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;

  // Agent Onboarding
  submitAgentApplication: (applicationData: {
    bio: string;
    address: string;
    governmentId: File;
    idPhoto: File;
    whatsappNumber: string;
  }) => Promise<void>;

  // Data Fetching
  fetchUserData: () => Promise<void>;

  // Initialize auth state from localStorage
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      agent: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAgent: (agent) => set({ agent }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Initialize auth state from localStorage
      initializeAuth: () => {
        try {
          const token = localStorage.getItem("token");
          const userData = localStorage.getItem("user");

          if (token && userData) {
            const user = JSON.parse(userData);
            set({ user, isAuthenticated: true });
          }
        } catch (error) {
          console.error("Error initializing auth state:", error);
        }
      },

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.login(email, password);

          // Store token in localStorage
          if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }

          if(response.data.user.role == "agent"){
            set({ agent: response.data.agentData, loading: false });
          }

          set({
            user: response.data.user,
            isAuthenticated: true,
            loading: false,
          });

          
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to login";
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.register(userData);

          // Store token in localStorage
          if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }

          set({
            user: response.data.user,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to create account";
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({
          user: null,
          agent: null,
          isAuthenticated: false,
        });
      },

      updateProfile: async (updates) => {
        try {
          const response = await authService.updateProfile(updates);

          // Update stored user data
          if (response.data) {
            localStorage.setItem("user", JSON.stringify(response.data));
          }

          set((state) => ({
            user: state.user ? { ...state.user, ...response.data } : null,
          }));
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to update profile";
          set({ error: errorMessage });
          throw error;
        }
      },

      submitAgentApplication: async (applicationData) => {
        set({ loading: true, error: null });
        try {
          const response = await agentService.submitApplication(
            applicationData
          );
          set({ agent: response.data, loading: false });
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to submit application";
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      fetchUserData: async () => {
        set({ loading: true, error: null });
        try {
          const [userResponse, favoritesResponse] = await Promise.all([
            userService.getProfile(),
            userService.getFavorites(),
          ]);

          // Update localStorage with latest user data
          localStorage.setItem("user", JSON.stringify(userResponse.data));
          
          if(userResponse.data.role == "agent"){
            set({ agent: userResponse.agentData, loading: false });
          }
          set({
            user: userResponse.data,
            loading: false,
          });

        
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch user data";
          set({ error: errorMessage, loading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        agent: state.agent,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
