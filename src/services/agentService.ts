import { api } from "./api";
import { Agent, AgentProfileResponse, AgentStats } from "@/types";

export interface AgentApplicationData {
  bio: string;
  address: string;
  governmentId: File;
  idPhoto: File;
  whatsappNumber: string;
}

// Define a generic API response shape (if your API always wraps responses)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export const agentService = {
  // ✅ Get agent by ID
  async getProfile(agentId: string): Promise<AgentProfileResponse> {
    const res = await api.get<AgentProfileResponse>(`/agents/${agentId}`);
    return res.data;
  },

  // ✅ Get authenticated agent profile
  async getAgentProfile(): Promise<AgentProfileResponse> {
    const res = await api.get<AgentProfileResponse>("/agents/profile");
    return res.data;
  },

  // ✅ Get all agents
  async getAll(): Promise<Agent[]> {
    const res = await api.get<Agent[]>("/agents");
    return res.data;
  },

  // ✅ Update agent profile (fixed: use agentId)
  async updateProfile(
    agentId: string,
    updates: Partial<Agent>
  ): Promise<Agent> {
    const res = await api.put<Agent>(`/agents/${agentId}`, updates);
    return res.data;
  },

  // ✅ Submit agent application
  async submitApplication(formData: FormData): Promise<ApiResponse<any>> {
    const res = await api.post<ApiResponse<any>>("/agents/apply", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // ✅ Verification status
  async getVerificationStatus(): Promise<ApiResponse<any>> {
    const res = await api.get<ApiResponse<any>>("/agents/verify/status");
    return res.data;
  },

  async resubmitVerification(formData: FormData): Promise<ApiResponse<any>> {
    const res = await api.post<ApiResponse<any>>(
      "/agents/verify/resubmit",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  },

  async getSubscriptionStatus(): Promise<ApiResponse<any>> {
    const res = await api.get<ApiResponse<any>>("/agents/subscription/status");
    return res.data;
  },

  async applyReferralCode(code: string): Promise<ApiResponse<void>> {
    const res = await api.post<ApiResponse<void>>("/agents/referral/apply", {
      referralCode: code,
    });
    return res.data;
  },

  async validateReferralCode(
    code: string
  ): Promise<ApiResponse<{ agentName: string }>> {
    const res = await api.get<ApiResponse<{ agentName: string }>>(
      `/agents/referral/validate?code=${code}`
    );
    return res.data;
  },

  async getStats(agentId: string): Promise<AgentStats> {
    const res = await api.get<AgentStats>(`/agents/${agentId}/stats`);
    return res.data;
  },
};
