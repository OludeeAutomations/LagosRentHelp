import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Notification, Message, Conversation } from "@/types";
import { notificationService } from "@/services/notificationService";

interface NotificationState {
  notifications: Notification[];
  conversations: Conversation[];
  unreadCount: number;

  // Actions
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  clearNotifications: () => void;
  sendMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  markMessageAsRead: (messageId: string) => void;
  fetchNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      conversations: [],
      unreadCount: 0,

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        })),

      markAsRead: async (notificationId) => {
        try {
          await notificationService.markAsRead(notificationId);
          set((state) => ({
            notifications: state.notifications.map((notif) =>
              notif.id === notificationId ? { ...notif, isRead: true } : notif
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }));
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to mark notification as read";
          throw error;
        }
      },

      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),

      sendMessage: (messageData) =>
        set((state) => {
          const newMessage: Message = {
            ...messageData,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            isRead: false,
          };

          const conversationId = [messageData.senderId, messageData.receiverId]
            .sort()
            .join("_");
          const existingConversation = state.conversations.find(
            (conv) => conv.id === conversationId
          );

          if (existingConversation) {
            return {
              conversations: state.conversations.map((conv) =>
                conv.id === conversationId
                  ? {
                      ...conv,
                      lastMessage: newMessage,
                      unreadCount: conv.unreadCount + 1,
                    }
                  : conv
              ),
            };
          } else {
            const newConversation: Conversation = {
              id: conversationId,
              participantIds: [messageData.senderId, messageData.receiverId],
              lastMessage: newMessage,
              unreadCount: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            return { conversations: [newConversation, ...state.conversations] };
          }
        }),

      markMessageAsRead: (messageId) =>
        set((state) => ({
          conversations: state.conversations.map((conv) => {
            if (conv.lastMessage.id === messageId) {
              return {
                ...conv,
                lastMessage: { ...conv.lastMessage, isRead: true },
                unreadCount: Math.max(0, conv.unreadCount - 1),
              };
            }
            return conv;
          }),
        })),

      fetchNotifications: async () => {
        try {
          const response = await notificationService.getAll();
          const unreadCount = response.data.filter(
            (n: Notification) => !n.isRead
          ).length;
          set({ notifications: response.data, unreadCount });
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch notifications";
          throw error;
        }
      },
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notifications: state.notifications,
        conversations: state.conversations,
      }),
    }
  )
);
