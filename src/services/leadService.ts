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

export const leadService = {
  create: async (
    leadData: Omit<Lead, "id" | "timestamp">
  ): Promise<ApiResponse<Lead>> => {
    return api.post<Lead>("/leads", leadData);
  },

  getAll: async (filters: LeadFilters = {}): Promise<ApiResponse<Lead[]>> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/leads?${queryString}` : "/leads";

    return api.get<Lead[]>(endpoint);
  },

  getById: async (id: string): Promise<ApiResponse<Lead>> => {
    return api.get<Lead>(`/leads/${id}`);
  },

  update: async (
    id: string,
    updates: Partial<Lead>
  ): Promise<ApiResponse<Lead>> => {
    return api.patch<Lead>(`/leads/${id}`, updates);
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return api.delete<{ message: string }>(`/leads/${id}`);
  },
};
