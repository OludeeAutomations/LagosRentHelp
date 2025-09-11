// src/services/propertyService.ts
import { api, ApiResponse } from "./api";
import { Property, SearchFilters } from "@/types";

export interface PropertyFilters extends Partial<SearchFilters> {
  page?: number;
  limit?: number;
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
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/properties?${queryString}` : "/properties";

    return api.get<Property[]>(endpoint);
  },

  getById: async (id: string): Promise<ApiResponse<Property>> => {
    return api.get<Property>(`/properties/${id}`);
  },

  create: async (
    propertyData: FormData // Changed from object to FormData
  ): Promise<ApiResponse<Property>> => {
    return api.post<Property>(
      "/properties",
      propertyData
      // REMOVE the headers completely - let the browser set it automatically
    );
  },

  update: async (
    id: string,
    updates: Partial<Property> | FormData // Accept both for updates
  ): Promise<ApiResponse<Property>> => {
    const config =
      updates instanceof FormData
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};

    return api.put<Property>(`/properties/${id}`, updates, config);
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
