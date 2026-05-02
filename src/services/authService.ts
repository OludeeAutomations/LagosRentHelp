import axios, { AxiosResponse } from "axios";
import { api } from "./api";
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
    password: string,
  ): Promise<AxiosResponse<LoginResponse>> => {
    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Login failed. Please check your credentials.";
      throw new Error(message);
    }
  },

  loginWithGoogle: async (
    userData: object,
  ): Promise<AxiosResponse<LoginResponse>> => {
    try {
      const response = await api.post<LoginResponse>("/auth/google", userData);
      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";
      throw new Error(message);
    }
  },

  register: async (
    userData: RegisterData,
  ): Promise<AxiosResponse<LoginResponse>> => {
    try {
      const registrationData = {
        name: userData.name?.trim() || "",
        email: userData.email?.trim().toLowerCase() || "",
        phone: userData.phone?.trim() || "",
        password: userData.password || "",
        role: userData.role || "user",
        ...(userData.avatar && { avatar: userData.avatar }),
      };

      const response = await api.post<LoginResponse>(
        "/auth/register",
        registrationData,
      );
      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage =
          error.response?.data?.error ||
          "Registration failed. Please try again.";
        throw new Error(backendMessage);
      }

      throw new Error("An unexpected error occurred.");
    }
  },

  verifyEmail: async (
    userId: string,
    token: string,
  ): Promise<AxiosResponse<unknown>> => {
    try {
      const response = await api.get(`/auth/verify-email/${userId}/${token}`);
      return response.data; // This should be { success: true, message: "..." }
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { error?: string; message?: string } };
      };
      throw new Error(
        axiosError.response?.data?.error ||
          axiosError.response?.data?.message ||
          "Email verification failed",
      );
    }
  },
  resendVerificationEmail: async (userId: string) => {
    const response = await api.post("/auth/resend-verification", { userId });
    return response.data;
  },
  sendPasswordResetEmail: async (email: string) => {
    return api.post(`/auth/forgot-password`, { email: email });
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    return api.post(`/auth/change-password`, {
      oldPassword,
      newPassword,
      confirmPassword: newPassword,
    });
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
      return {
        valid: true,
        user: response.data.user,
      };
    } catch {
      return {
        valid: false,
      };
    }
  },
  updateProfile: async (
    updates: Partial<User>,
  ): Promise<AxiosResponse<User>> => {
    try {
      const response = await api.put<User>("/users/profile", updates);
      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Profile update failed. Please try again.";
      throw new Error(message);
    }
  },
};
