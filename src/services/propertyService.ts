// src/services/propertyService.ts
import { api, ApiResponse } from "./api";
import { Property, SearchFilters } from "@/types";

export interface PropertyFilters extends Partial<SearchFilters> {
  page?: number;
  limit?: number;
  approvalStatus?: string;
  includeOwned?: boolean;
}

export interface PropertyApprovalPayload {
  approvalStatus: "approved" | "rejected";
  approvalNote?: string;
}

export const propertyService = {
  getAll: async (
    filters: PropertyFilters = {}
  ): Promise<ApiResponse<Property[]>> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v.toString()));
        } else if (typeof value === "boolean") {
          params.append(key, value ? "true" : "false");
        } else {
          params.append(key, value.toString());
        }
      }
    });

    // Add default filter to show approved properties
    if (!params.has("approvalStatus")) {
      params.append("approvalStatus", "approved");
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/properties?${queryString}` : "/properties";

    return api.get<Property[]>(endpoint);
  },

  getById: async (id: string): Promise<ApiResponse<Property>> => {
    try {
      const response = await api.get<ApiResponse<Property>>(
        `/properties/${id}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch property: ${error.message}`);
    }
  },

  getManageAll: async (): Promise<ApiResponse<Property[]>> => {
    return api.get<Property[]>("/properties/manage");
  },

  getManageById: async (id: string): Promise<ApiResponse<Property>> => {
    return api.get<Property>(`/properties/manage/${id}`);
  },

  create: async (propertyData: FormData): Promise<ApiResponse<Property>> => {
    return api.post<Property>("/properties", propertyData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  update: async (
    id: string,
    updates: Partial<Property> | FormData
  ): Promise<ApiResponse<Property>> => {
    const config =
      updates instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};

    return api.put<Property>(`/properties/${id}`, updates, config);
  },

  updateApproval: async (
    id: string,
    payload: PropertyApprovalPayload
  ): Promise<ApiResponse<Property>> => {
    return api.patch<Property>(`/properties/${id}/approval`, payload);
  },

  deactivate: async (id: string): Promise<ApiResponse<Property>> => {
    return api.put<Property>(`/properties/${id}/deactivate`, {});
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return api.delete<{ message: string }>(`/properties/${id}`);
  },

  toggleFavorite: async (
    propertyId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    return api.post<{ message: string }>("/users/favorites", { propertyId });
  },

  removeFavorite: async (
    propertyId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    return api.delete<{ message: string }>(`/users/favorites/${propertyId}`);
  },

  getFavorites: async (): Promise<string[]> => {
    if (typeof window === "undefined") return [];
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.favorites || [];
  },
};
