// src/stores/notificationStore.ts (enhanced)
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
  addNotifications: (notifications: Notification[]) => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => void;
  deleteNotification: (notificationId: string) => Promise<void>;
  sendMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  markMessageAsRead: (messageId: string) => void;
  fetchNotifications: (filters?: any) => Promise<void>;
  getNotificationById: (id: string) => Notification | undefined;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      conversations: [],
      unreadCount: 0,

      addNotification: (notification) =>
        set((state) => {
          // Check if notification already exists
          const exists = state.notifications.some(
            (n) => n.id === notification.id
          );
          if (exists) {
            return state;
          }

          return {
            notifications: [notification, ...state.notifications],
            unreadCount: notification.isRead
              ? state.unreadCount
              : state.unreadCount + 1,
          };
        }),

      addNotifications: (notifications) =>
        set((state) => {
          // Filter out duplicates
          const existingIds = new Set(state.notifications.map((n) => n.id));
          const newNotifications = notifications.filter(
            (n) => !existingIds.has(n.id)
          );

          const newUnreadCount = newNotifications.filter(
            (n) => !n.isRead
          ).length;

          return {
            notifications: [...newNotifications, ...state.notifications],
            unreadCount: state.unreadCount + newUnreadCount,
          };
        }),

      markAsRead: async (notificationId) => {
        try {
          await notificationService.markAsRead(notificationId);
          set((state) => {
            const notification = state.notifications.find(
              (n) => n.id === notificationId
            );
            if (notification && !notification.isRead) {
              return {
                notifications: state.notifications.map((notif) =>
                  notif.id === notificationId
                    ? { ...notif, isRead: true }
                    : notif
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
              };
            }
            return state;
          });
        } catch (error: unknown) {
          console.error("Failed to mark notification as read:", error);
          throw error;
        }
      },

      markAllAsRead: async () => {
        try {
          // In a real app, you would have an endpoint to mark all as read
          const unreadNotifications = get().notifications.filter(
            (n) => !n.isRead
          );

          // You could batch these requests or have a single endpoint
          await Promise.all(
            unreadNotifications.map((n) => notificationService.markAsRead(n.id))
          );

          set((state) => ({
            notifications: state.notifications.map((notif) => ({
              ...notif,
              isRead: true,
            })),
            unreadCount: 0,
          }));
        } catch (error: unknown) {
          console.error("Failed to mark all notifications as read:", error);
          throw error;
        }
      },

      deleteNotification: async (notificationId) => {
        try {
          await notificationService.delete(notificationId);
          set((state) => {
            const notification = state.notifications.find(
              (n) => n.id === notificationId
            );
            const wasUnread = notification && !notification.isRead;

            return {
              notifications: state.notifications.filter(
                (n) => n.id !== notificationId
              ),
              unreadCount: wasUnread
                ? Math.max(0, state.unreadCount - 1)
                : state.unreadCount,
            };
          });
        } catch (error: unknown) {
          console.error("Failed to delete notification:", error);
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
                      updatedAt: new Date().toISOString(),
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
            if (conv.lastMessage.id === messageId && !conv.lastMessage.isRead) {
              return {
                ...conv,
                lastMessage: { ...conv.lastMessage, isRead: true },
                unreadCount: Math.max(0, conv.unreadCount - 1),
              };
            }
            return conv;
          }),
        })),

      fetchNotifications: async (filters = {}) => {
        try {
          const response = await notificationService.getAll(filters);
          const notifications = response.data;
          const unreadCount = notifications.filter(
            (n: Notification) => !n.isRead
          ).length;

          set({ notifications, unreadCount });
        } catch (error: unknown) {
          console.error("Failed to fetch notifications:", error);
          throw error;
        }
      },

      getNotificationById: (id: string) => {
        return get().notifications.find((n) => n.id === id);
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
