import { api, ApiResponse } from "./api";
import { User } from "@/types";

export const userService = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    return api.get<User>("/users/profile");
  },

  updateProfile: async (updates: Partial<User>): Promise<ApiResponse<User>> => {
    return api.put<User>("/users/profile", updates);
  },

  addFavorite: async (propertyId: string): Promise<ApiResponse<User>> => {
    return api.post<User>("/users/favorites", { propertyId });
  },

  removeFavorite: async (propertyId: string): Promise<ApiResponse<User>> => {
    return api.delete<User>(`/users/favorites/${propertyId}`);
  },

  getFavorites: async (): Promise<string[]> => {
    try {
      const response = await api.get<User>("/users/profile");
      return response.data.favorites || [];
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      return [];
    }
  },
};
