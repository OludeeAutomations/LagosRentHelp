import { create } from "zustand";
import { Property, SearchFilters } from "@/types";
import { propertyService } from "@/services/propertyService";
import { userService } from "@/services/userService";

interface PropertyState {
  properties: Property[];
  filteredProperties: Property[];
  featuredProperties: Property[];
  userFavorites: string[];
  searchFilters: SearchFilters;
  loading: boolean;
  error: string | null;

  // Actions
  setProperties: (properties: Property[]) => void;
  addProperty: (propertyData: FormData) => Promise<void>;
  updateProperty: (
    id: string,
    updates: Partial<Property> | FormData
  ) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  toggleFavorite: (propertyId: string) => Promise<void>;
  filterProperties: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  fetchProperties: (filters?: SearchFilters) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  getPropertyById: (id: string) => Promise<Property | null>; // Added this function
}

export const usePropertyStore = create<PropertyState>()((set, get) => ({
  properties: [],
  filteredProperties: [],
  featuredProperties: [],
  userFavorites: [],
  searchFilters: {
    location: "",
    type: "",
    listingType: "",
    minPrice: 0,
    maxPrice: 10000000,
    bedrooms: 0,
    amenities: [],
    sortBy: "newest",
    page: 1,
    limit: 10,
  },
  loading: false,
  error: null,

  // Add this function to your store
  getPropertyById: async (id: string): Promise<Property | null> => {
    try {
      const response = await propertyService.getById(id);
      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch property";
      console.error(errorMessage);
      return null;
    }
  },

  setProperties: (properties) =>
    set({
      properties,
      filteredProperties: properties,
      featuredProperties: properties.filter((prop) => prop.isFeatured),
    }),

  addProperty: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await propertyService.create(formData);
      set((state) => {
        const newProperties = [...state.properties, response.data];
        return {
          properties: newProperties,
          filteredProperties: newProperties,
          featuredProperties: newProperties.filter((prop) => prop.isFeatured),
          loading: false,
        };
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create property";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateProperty: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await propertyService.update(id, updates);
      set((state) => {
        const updatedProperties = state.properties.map((prop) =>
          prop._id === id ? { ...prop, ...response.data } : prop
        );
        return {
          properties: updatedProperties,
          filteredProperties: updatedProperties,
          featuredProperties: updatedProperties.filter(
            (prop) => prop.isFeatured
          ),
          loading: false,
        };
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update property";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteProperty: async (id) => {
    set({ loading: true, error: null });
    try {
      await propertyService.delete(id);
      set((state) => {
        const filteredProperties = state.properties.filter(
          (prop) => prop._id !== id
        );
        return {
          properties: filteredProperties,
          filteredProperties: filteredProperties,
          featuredProperties: filteredProperties.filter(
            (prop) => prop.isFeatured
          ),
          loading: false,
        };
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete property";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  toggleFavorite: async (propertyId) => {
    try {
      const currentFavorites = get().userFavorites;
      if (currentFavorites.includes(propertyId)) {
        await userService.removeFavorite(propertyId);
        set((state) => ({
          userFavorites: state.userFavorites.filter((id) => id !== propertyId),
        }));
      } else {
        await userService.addFavorite(propertyId);
        set((state) => ({
          userFavorites: [...state.userFavorites, propertyId],
        }));
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update favorites";
      set({ error: errorMessage });
      throw error;
    }
  },

  filterProperties: (filters) =>
    set((state) => {
      const newFilters = { ...state.searchFilters, ...filters };
      const filtered = state.properties.filter((property) => {
        return (
          (!newFilters.location ||
            property.location
              .toLowerCase()
              .includes(newFilters.location.toLowerCase())) &&
          (!newFilters.type || property.type === newFilters.type) &&
          property.price >= newFilters.minPrice &&
          property.price <= newFilters.maxPrice &&
          (!newFilters.bedrooms || property.bedrooms >= newFilters.bedrooms) &&
          (!newFilters.amenities?.length ||
            newFilters.amenities.every((amenity) =>
              property.amenities.includes(amenity)
            ))
        );
      });

      const sortedProperties = [...filtered];
      switch (newFilters.sortBy) {
        case "price_asc":
          sortedProperties.sort((a, b) => a.price - b.price);
          break;
        case "price_desc":
          sortedProperties.sort((a, b) => b.price - a.price);
          break;
        case "newest":
          sortedProperties.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case "oldest":
          sortedProperties.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          break;
      }

      return {
        filteredProperties: sortedProperties,
        searchFilters: newFilters,
      };
    }),

  clearFilters: () =>
    set((state) => ({
      filteredProperties: state.properties,
      searchFilters: {
        location: "",
        type: "",
        listingType: "",
        minPrice: 0,
        maxPrice: 10000000,
        bedrooms: 0,
        amenities: [],
        sortBy: "newest",
        page: 1,
        limit: 10,
      },
    })),

  fetchProperties: async (filters) => {
    set({ loading: true, error: null });
    try {
      const response = await propertyService.getAll(filters);
      set({
        properties: response.data,
        filteredProperties: response.data,
        featuredProperties: response.data.filter(
          (prop: Property) => prop.isFeatured
        ),
        loading: false,
      });
      if (filters) get().filterProperties(filters);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch properties";
      set({ error: errorMessage, loading: false });
    }
  },

  fetchFavorites: async () => {
    try {
      const favorites = await userService.getFavorites();
      set({ userFavorites: favorites });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch favorites";
      set({ error: errorMessage });
    }
  },
}));
