import { api, ApiResponse } from "./api";
import { Notification } from "@/types";

export interface NotificationFilters {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export const notificationService = {
  getAll: async (
    filters: NotificationFilters = {}
  ): Promise<ApiResponse<Notification[]>> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString
      ? `/notifications?${queryString}`
      : "/notifications";

    return api.get<Notification[]>(endpoint);
  },

  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    return api.patch<Notification>(`/notifications/${id}/read`);
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return api.delete<{ message: string }>(`/notifications/${id}`);
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get<Notification[]>(
        "/notifications?isRead=false"
      );
      return response.data.length;
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
      return 0;
    }
  },
};
