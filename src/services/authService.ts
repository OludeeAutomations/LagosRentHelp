import { api, ApiResponse } from "./api";
import { User, LoginResponse } from "@/types";

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  avatar?: string;
}

export const authService = {
  login: async (
    email: string,
    password: string
  ): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error instanceof Error ? error.message : "Login failed");
    }
  },

  register: async (
    userData: RegisterData
  ): Promise<ApiResponse<LoginResponse>> => {
    try {
      // Ensure all required fields are present
      const registrationData = {
        name: userData.name?.trim() || "",
        email: userData.email?.trim().toLowerCase() || "",
        phone: userData.phone?.trim() || "",
        password: userData.password || "",
        role: userData.role || "user",
        ...(userData.avatar && { avatar: userData.avatar }),
      };

      console.log("Sending registration data:", registrationData);

      const response = await api.post<LoginResponse>(
        "/auth/register",
        registrationData
      );
      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Registration failed"
      );
    }
  },

  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  },

  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  },

  updateProfile: async (updates: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const response = await api.put<User>("/users/profile", updates);
      return response;
    } catch (error) {
      console.error("Update profile error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Profile update failed"
      );
    }
  },
};
