import axios from "axios";
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

      // 🔍 ADD THIS DEBUG LOG
      console.log("Registration response received:", {
        fullResponse: response,
        data: response.data,
        userInResponse: response.data.user,
        accessTokenInResponse: response.data.accessToken,
      });

      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage = error.response?.data?.error || error.message;
        console.error("Registration error:", backendMessage);
        throw new Error(backendMessage);
      }

      // Non-Axios error
      throw new Error("An unexpected error occurred");
    }
  },

  verifyEmail: async (userId: string, token: string) => {
    try {
      const response = await api.get(`/auth/verify-email/${userId}/${token}`);
      return response.data; // This should be { success: true, message: "..." }
    } catch (error: any) {
      // Make sure this only throws on actual errors, not on success responses
      throw new Error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Email verification failed"
      );
    }
  },

  sendPasswordResetEmail: async (email: string) => {
    return api.post(`/auth/forgot-password`, { email: email });
  },

  resetPassword: async (userId: string, token: string, password: string) => {
    return api.post(`/auth/reset-password`, {
      userId,
      token,
      password,
      confirmPassword: password,
    });
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
  validateToken: async (): Promise<{ valid: boolean; user?: User }> => {
    try {
      const response = await api.get("/auth/validate");
      console.log("Token validation response:", response);
      return {
        valid: true,
        user: response.data.user,
      };
    } catch (error) {
      return {
        valid: false,
      };
    }
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
