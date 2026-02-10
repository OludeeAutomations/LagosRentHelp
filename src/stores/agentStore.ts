/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { Agent, AgentProfileResponse } from "@/types";
import { agentService, ApiResponse } from "@/services/agentService";

interface Subscription {
  status: string;
  trialStartsAt?: Date;
  trialEndsAt?: Date;
  currentPeriodEnd?: Date;
  plan?: string;
}

interface AgentState {
  agents: Agent[];
  verifiedAgents: Agent[];
  loading: boolean;
  isLoading: boolean;
  subscription: Subscription | null;
  error: string | null;
  agentProfile: AgentProfileResponse | null;

  setAgents: (agents: Agent[]) => void;
  verifyAgent: (agentId: string) => Promise<void>;
  rejectAgent: (agentId: string) => Promise<void>;
  fetchAgents: () => Promise<void>;
  fetchAgentById: (agentId: string) => Promise<void>;
  clearAgent: () => void;
  fetchSubscriptionStatus: () => Promise<void>;
  applyReferralCode: (code: string) => Promise<void>;
  validateReferralCode: (
    code: string
  ) => Promise<ApiResponse<{ agentName: string }>>;
  submitAgentApplication: (formData: FormData) => Promise<ApiResponse<any>>;
  fetchAgentProfile: () => Promise<void>;
  updateAgentProfile: (data: Partial<Agent>) => Promise<void>;
}

export const useAgentStore = create<AgentState>()((set, get) => ({
  agents: [],
  verifiedAgents: [],
  loading: false,
  isLoading: false,
  error: null,
  agentProfile: null,
  subscription: null,

  setAgents: (agents) =>
    set({
      agents,
      verifiedAgents: agents.filter(
        (agent) => agent.verificationStatus === "verified"
      ),
    }),
  //
  submitAgentApplication: async (formData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await agentService.submitApplication(formData);
      if (!response.success)
        throw new Error(response.error || "Application failed");

      // ✅ Update auth store with the new agent data
      const { useAuthStore } = await import("@/stores/authStore");
      useAuthStore.getState().setAgent(response.data.agent); // or whatever the agent data is

      return response;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to submit application";
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAgentProfile: async () => {
    set({ loading: true, error: null });
    try {
      console.log("🔄 Starting agent profile fetch...");
      const response = await agentService.getAgentProfile();

      console.log("📊 Raw API response:", response);
      console.log("🔍 Response success:", response.success);
      console.log("📦 Response data:", response.data);

      if (response.success) {
        // Debug the structure
        console.log("👤 Agent data in response:", response.data);
        console.log("🏠 Properties data:", response.data);
        console.log("📈 Stats data:", response.data.stats);

        // Update local store
        set({
          agentProfile: response, // Store the full response which matches AgentProfileResponse
        });

        // Also update auth store
        const { useAuthStore } = await import("@/stores/authStore");

        if (response.data && response.data.agent) {
          console.log("✅ Updating auth store with agent:", response.data.agent);
          useAuthStore.getState().setAgent(response.data.agent);
        } else {
          console.warn("⚠️ No agent data found in response");
        }
      } else {
        throw new Error("Failed to fetch agent profile");
      }
    } catch (error: any) {
      console.error("❌ Error in fetchAgentProfile:", error);
      if (error.response) {
        console.error("Backend Error Data:", error.response.data);
        console.error("Backend Status:", error.response.status);
      }
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updateAgentProfile: async (data: Partial<Agent>) => {
    set({ loading: true, error: null });
    try {
      const { useAuthStore } = await import("@/stores/authStore");
      const currentAgent = useAuthStore.getState().agent;

      if (!currentAgent?._id) throw new Error("No active agent found");

      await agentService.updateProfile(currentAgent._id, data);

      // Refresh profile to get latest data
      await get().fetchAgentProfile();
    } catch (error: any) {
      set({ error: error.message || "Failed to update profile", loading: false });
      throw error;
    }
  },

  verifyAgent: async (agentId: string) => {
    set({ loading: true, error: null });
    try {
      await agentService.updateProfile(agentId, {
        verificationStatus: "verified",
      });

      set((state) => {
        const updatedAgents = state.agents.map((agent) =>
          (agent._id) === agentId
            ? { ...agent, verificationStatus: "verified" as const }
            : agent
        );
        return {
          agents: updatedAgents,
          verifiedAgents: updatedAgents.filter(
            (agent) => agent.verificationStatus === "verified"
          ),
          loading: false,
        };
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to verify agent",
        loading: false,
      });
      throw error;
    }
  },

  rejectAgent: async (agentId: string) => {
    set({ loading: true, error: null });
    try {
      await agentService.updateProfile(agentId, {
        verificationStatus: "rejected",
      });

      set((state) => {
        const updatedAgents = state.agents.map((agent) =>
          (agent._id) === agentId
            ? { ...agent, verificationStatus: "rejected" as const }
            : agent
        );
        return {
          agents: updatedAgents,
          verifiedAgents: updatedAgents.filter(
            (agent) => agent.verificationStatus === "verified"
          ),
          loading: false,
        };
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to reject agent",
        loading: false,
      });
      throw error;
    }
  },

  fetchAgentById: async (agentId: string) => {
    set({ loading: true, error: null });
    try {
      const profile = await agentService.getProfile(agentId);
      set({ agentProfile: profile, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch agent",
        loading: false,
      });
      throw error;
    }
  },

  clearAgent: () => set({ agentProfile: null }),

  fetchAgents: async () => {
    set({ loading: true, error: null });
    try {
      const agents = await agentService.getAll();
      set({
        agents,
        verifiedAgents: agents.filter(
          (a) => a.verificationStatus === "verified"
        ),
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch agents",
        loading: false,
      });
    }
  },

  fetchSubscriptionStatus: async () => {
    set({ loading: true });
    try {
      const res = await agentService.getSubscriptionStatus();
      set({ subscription: res.data, loading: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch subscription status",
        loading: false,
      });
    }
  },

  applyReferralCode: async (code: string) => {
    set({ loading: true });
    try {
      await agentService.applyReferralCode(code);
      await get().fetchSubscriptionStatus();
    } catch (error: any) {
      set({
        error: error.message || "Failed to apply referral code",
      });
    } finally {
      set({ loading: false });
    }
  },

  validateReferralCode: async (code: string) => {
    try {
      return await agentService.validateReferralCode(code);
    } catch (error: any) {
      throw new Error(error.message || "Failed to validate referral code");
    }
  },
}));
