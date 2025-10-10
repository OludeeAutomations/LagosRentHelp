// src/stores/userStore.ts
import { create } from "zustand";
import { userService } from "@/services/userService";

interface UserStore {
  favorites: any[];             // List of favorite properties
  loading: boolean;             // Loading state
  error: string;                // Error message
  fetchFavorites: () => Promise<void>;       // Fetch all favorites
  addFavorite: (propertyId: string) => Promise<void>;    // Add a favorite
  removeFavorite: (propertyId: string) => Promise<void>; // Remove a favorite
}

export const useUserStore = create<UserStore>((set) => ({
  favorites: [],
  loading: false,
  error: "",
  
  fetchFavorites: async () => {
    set({ loading: true, error: "" });
    try {
      const favs = await userService.getFavorites();
      set({ favorites: favs });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch favorites" });
    } finally {
      set({ loading: false });
    }
  },

  addFavorite: async (propertyId: string) => {
    set({ loading: true, error: "" });
    try {
      await userService.addFavorite(propertyId);
      set((state) => ({ favorites: [...state.favorites, propertyId] }));
    } catch (err: any) {
      set({ error: err.message || "Failed to add favorite" });
    } finally {
      set({ loading: false });
    }
  },

  removeFavorite: async (propertyId: string) => {
    set({ loading: true, error: "" });
    try {
      await userService.removeFavorite(propertyId);
      set((state) => ({
        favorites: state.favorites.filter((id) => id !== propertyId),
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to remove favorite" });
    } finally {
      set({ loading: false });
    }
  },
}));
