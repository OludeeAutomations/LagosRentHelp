import { create } from "zustand";
import { Agent, AgentProfileResponse } from "@/types";
import { agentService } from "@/services/agentService";

interface AgentState {
  agents: Agent[];
  verifiedAgents: Agent[];
  loading: boolean;
  error: string | null;
  agentProfile: AgentProfileResponse | null; // Changed from agent to agentProfile

  // Actions
  setAgents: (agents: Agent[]) => void;
  verifyAgent: (agentId: string) => Promise<void>;
  rejectAgent: (agentId: string) => void;
  fetchAgents: () => Promise<void>;
  fetchAgentById: (agentId: string) => Promise<void>;
  clearAgent: () => void;
}

export const useAgentStore = create<AgentState>()((set) => ({
  agents: [],
  verifiedAgents: [],
  loading: false,
  error: null,
  agentProfile: null,

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
      // First update the agent's verification status via API
      // Assuming you have an updateProfile method that can handle verification status
      await agentService.updateProfile(agentId, {
        verificationStatus: "verified",
      } as Partial<Agent>);

      // Then update the local state
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
      // Update the agent's verification status via API
      await agentService.updateProfile(agentId, {
        verificationStatus: "rejected",
      } as Partial<Agent>);

      // Then update the local state
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
      const response = await agentService.getProfile(agentId);
      set({
        agentProfile: response.data, // Store the entire profile response
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
}));
