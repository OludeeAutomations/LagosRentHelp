import { create } from "zustand";
import { Agent, AgentProfileResponse, ApiResponse } from "@/types"; // Added ApiResponse import
import { agentService } from "@/services/agentService";

// Define the subscription type
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
  subscription: Subscription | null;
  error: string | null;
  agentProfile: AgentProfileResponse | null;

  // Actions
  setAgents: (agents: Agent[]) => void;
  verifyAgent: (agentId: string) => Promise<void>;
  rejectAgent: (agentId: string) => void;
  fetchAgents: () => Promise<void>;
  fetchAgentById: (agentId: string) => Promise<void>;
  clearAgent: () => void;
  fetchSubscriptionStatus: () => Promise<void>;
  applyReferralCode: (code: string) => Promise<void>;
  validateReferralCode: (
    code: string
  ) => Promise<ApiResponse<{ agentName: string }>>;
}

export const useAgentStore = create<AgentState>()((set, get) => ({
  // Added get function
  agents: [],
  verifiedAgents: [],
  loading: false,
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

  verifyAgent: async (agentId: string) => {
    set({ loading: true, error: null });
    try {
      await agentService.updateProfile(agentId, {
        verificationStatus: "verified",
      } as Partial<Agent>);

      set((state) => {
        const updatedAgents = state.agents.map((agent) =>
          agent.id === agentId
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to verify agent";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  rejectAgent: async (agentId: string) => {
    set({ loading: true, error: null });
    try {
      await agentService.updateProfile(agentId, {
        verificationStatus: "rejected",
      } as Partial<Agent>);

      set((state) => {
        const updatedAgents = state.agents.map((agent) =>
          agent.id === agentId
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reject agent";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  fetchAgentById: async (agentId: string) => {
    set({ loading: true, error: null });
    try {
      console.log("Getting agent profile")
      const response = await agentService.getProfile(agentId);
      set({
        agentProfile: response.data,
        loading: false,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch agent";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  clearAgent: () => {
    set({ agentProfile: null });
  },

  fetchAgents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await agentService.getAll();
      const agents = response.data;

      set({
        agents,
        verifiedAgents: agents.filter(
          (agent: Agent) => agent.verificationStatus === "verified"
        ),
        loading: false,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch agents";
      set({ error: errorMessage, loading: false });
    }
  },

  fetchSubscriptionStatus: async () => {
    set({ loading: true });
    try {
      // You need to add this method to your agentService
      const response = await agentService.getSubscriptionStatus();
      set({ subscription: response.data, loading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch subscription status";
      set({ error: errorMessage, loading: false });
    }
  },

  applyReferralCode: async (code: string) => {
    set({ loading: true });
    try {
      // You need to add this method to your agentService
      await agentService.applyReferralCode(code);
      // Refresh status using the get function from store
      await get().fetchSubscriptionStatus();
      set({ loading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to apply referral code";
      set({ error: errorMessage, loading: false });
    }
  },

  validateReferralCode: async (code: string) => {
    try {
      // You need to add this method to your agentService
      return await agentService.validateReferralCode(code);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to validate referral code";
      throw new Error(errorMessage);
    }
  },
}));
