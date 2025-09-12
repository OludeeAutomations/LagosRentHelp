import { api, ApiResponse } from "./api";
import { Agent } from "@/types";
import { AgentProfileResponse, AgentStats } from "@/types";

export interface AgentApplicationData {
  bio: string;
  address: string;
  governmentId: File;
  idPhoto: File;
  whatsappNumber: string;
}

export const agentService = {
  getProfile: async (
    agentId: string
  ): Promise<ApiResponse<AgentProfileResponse>> => {
    return api.get<AgentProfileResponse>(`/agents/${agentId}`);
  },

  updateProfile: async (
    agentId: string,
    updates: Partial<Agent>
  ): Promise<ApiResponse<Agent>> => {
    return api.put<Agent>("/agents/profile", updates);
  },

  getAll: async (): Promise<ApiResponse<Agent[]>> => {
    return api.get<Agent[]>("/agents");
  },

  submitApplication: async (
    formData: FormData
  ): Promise<ApiResponse<Agent>> => {
    const token = localStorage.getItem("token");
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    const response = await fetch(`${baseURL}/agents/apply`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // ⚠️ don’t set Content-Type manually, browser will add boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Application submission failed");
    }

    return response.json();
  },
  getSubscriptionStatus: async (): Promise<ApiResponse<any>> => {
    return api.get("/agents/subscription/status");
  },

  applyReferralCode: async (code: string): Promise<ApiResponse<void>> => {
    return api.post("/agents/referral/apply", { referralCode: code });
  },

  validateReferralCode: async (
    code: string
  ): Promise<ApiResponse<{ agentName: string }>> => {
    return api.get(`/agents/referral/validate?code=${code}`);
  },
  // optional if you still want a standalone stats fetch
  getStats: async (agentId: string): Promise<ApiResponse<AgentStats>> => {
    return api.get<AgentStats>(`/agents/${agentId}/stats`);
  },
};
// Add to your agentService
