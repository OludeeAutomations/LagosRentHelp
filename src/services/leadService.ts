// services/leadService.ts - Simplified version
import { api, ApiResponse } from "./api";
import { Lead } from "@/types";

export interface LeadFilters {
  agentId?: string;
  propertyId?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateLeadData {
  agentId: string;
  type: "whatsapp" | "phone" | "message";
  propertyId?: string;
}

export const leadService = {
  // Create new lead
  create: async (leadData: CreateLeadData): Promise<ApiResponse<Lead>> => {
    const response = await api.post("/leads", leadData);
    return response.data;
  },

  // Check if user has already contacted an agent
  hasUserContactedAgent: async (
    agentId: string
  ): Promise<ApiResponse<{ hasContacted: boolean }>> => {
    const response = await api.get(`/leads/check/${agentId}`);
    return response.data;
  },

  // Get all leads with filters
  getAll: async (filters: LeadFilters = {}): Promise<ApiResponse<Lead[]>> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/leads?${queryString}` : "/leads";

    const response = await api.get(endpoint);
    return response.data;
  },

  // Get lead by ID
  getById: async (id: string): Promise<ApiResponse<Lead>> => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  // Get agent's leads
  getAgentLeads: async (
    agentId: string,
    filters: Partial<LeadFilters> = {}
  ): Promise<ApiResponse<Lead[]>> => {
    return leadService.getAll({ agentId, ...filters });
  },

  // Update lead
  update: async (
    id: string,
    updates: Partial<Lead>
  ): Promise<ApiResponse<Lead>> => {
    const response = await api.patch(`/leads/${id}`, updates);
    return response.data;
  },

  // Delete lead
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },

  // Get user's leads (leads they created)
  getUserLeads: async (): Promise<ApiResponse<Lead[]>> => {
    const response = await api.get("/leads/my-leads");
    return response.data;
  },
};
