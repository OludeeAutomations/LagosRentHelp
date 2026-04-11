import { api, ApiResponse } from "./api";
import { ManageableUser, Property, User } from "@/types";

export interface CreateAdminData {
  name: string;
  email: string;
  phone: string;
  password: string;
  avatar?: string;
}

export interface AdminListFilters {
  search?: string;
  role?: "admin" | "super_admin";
}

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

 fetchFavorites: async (): Promise<any> => {
    try {
      const response = await api.get<{ success: boolean; data: Property[] }>("/users/favorites");
      return response.data; // <- the array of favorite properties
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      return [];
    }
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

  getManageableUsers: async (): Promise<ApiResponse<ManageableUser[]>> => {
    return api.get<ManageableUser[]>("/users/manageable");
  },

  getAdmins: async (
    filters: AdminListFilters = {}
  ): Promise<ApiResponse<User[]>> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const endpoint = queryString
      ? `/users/admins?${queryString}`
      : "/users/admins";

    return api.get<User[]>(endpoint);
  },

  createAdmin: async (
    payload: CreateAdminData
  ): Promise<ApiResponse<User>> => {
    return api.post<User>("/users/admins", payload);
  },

  deleteAdmin: async (userId: string): Promise<ApiResponse<{ success: boolean }>> => {
    return api.delete<{ success: boolean }>(`/users/admins/${userId}`);
  },

  promoteAdmin: async (userId: string): Promise<ApiResponse<User>> => {
    return api.patch<User>(`/users/admins/${userId}/promote`);
  },

  updateUserProfileById: async (
    userId: string,
    updates: Partial<User>
  ): Promise<ApiResponse<User>> => {
    return api.put<User>(`/users/${userId}/profile`, updates);
  },
};
