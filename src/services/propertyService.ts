// src/services/propertyService.ts
import { api, ApiResponse } from "./api";
import { Property, SearchFilters } from "@/types";
import { supabase } from "@/lib/supabase";

export interface PropertyFilters extends Partial<SearchFilters> {
  page?: number;
  limit?: number;
  approvalStatus?: string;
  includeOwned?: boolean;
  status?: Property["status"];
}

export interface PropertyApprovalPayload {
  approvalStatus: "approved" | "rejected";
  approvalNote?: string;
}

export const PUBLIC_PROPERTY_COLUMNS = `
  id,
  title,
  description,
  price,
  location,
  total_package_price,
  type,
  listing_type,
  bedrooms,
  bathrooms,
  area,
  amenities,
  images,
  status,
  approval_status,
  views,
  likes,
  rating,
  review_count,
  coordinates,
  available_from,
  minimum_stay,
  created_at,
  updated_at
`;

export type PublicPropertyRow = {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  total_package_price: number | null;
  type: Property["type"];
  listing_type: Property["listingType"];
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string[] | null;
  images: string[] | null;
  status: Property["status"];
  approval_status: Property["approvalStatus"];
  views: number | null;
  likes: number | null;
  rating: number | null;
  review_count: number | null;
  coordinates: Property["coordinates"] | null;
  available_from: string | null;
  minimum_stay: number | null;
  created_at: string;
  updated_at: string;
};

export const mapPublicProperty = (row: PublicPropertyRow): Property => ({
  _id: row.id,
  title: row.title,
  description: row.description,
  price: Number(row.price),
  location: row.location,
  totalPackagePrice: Number(row.total_package_price || 0),
  type: row.type,
  listingType: row.listing_type,
  bedrooms: row.bedrooms,
  bathrooms: row.bathrooms,
  area: Number(row.area),
  amenities: row.amenities || [],
  images: row.images || [],
  status: row.status,
  approvalStatus: row.approval_status,
  isFeatured: false,
  views: row.views || 0,
  likes: row.likes || 0,
  coordinates: row.coordinates || undefined,
  availableFrom: row.available_from || undefined,
  minimumStay: row.minimum_stay || undefined,
  createdAt: row.created_at,
});

export const propertyService = {
  getAll: async (
    filters: PropertyFilters = {}
  ): Promise<ApiResponse<Property[]>> => {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, filters.limit || 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("properties")
      .select(PUBLIC_PROPERTY_COLUMNS, { count: "exact" })
      .eq("approval_status", "approved")
      .range(from, to);

    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }
    if (filters.type) query = query.eq("type", filters.type);
    if (filters.category) query = query.eq("type", filters.category);
    if (filters.listingType) {
      query = query.eq("listing_type", filters.listingType);
    }
    if (filters.minPrice) query = query.gte("price", filters.minPrice);
    if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
    if (filters.bedrooms) query = query.gte("bedrooms", filters.bedrooms);
    if (filters.bathrooms) query = query.gte("bathrooms", filters.bathrooms);
    if (filters.amenities?.length) {
      query = query.contains("amenities", filters.amenities);
    }
    if (filters.status) query = query.eq("status", filters.status);

    switch (filters.sortBy) {
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "most_viewed":
        query = query.order("views", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    return {
      success: true,
      data: (data as PublicPropertyRow[]).map(mapPublicProperty),
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    };
  },

  getById: async (id: string): Promise<ApiResponse<Property>> => {
    const { data, error } = await supabase
      .from("properties")
      .select(PUBLIC_PROPERTY_COLUMNS)
      .eq("id", id)
      .eq("approval_status", "approved")
      .single();

    if (error) throw new Error(`Failed to fetch property: ${error.message}`);

    return {
      success: true,
      data: mapPublicProperty(data as PublicPropertyRow),
    };
  },

  getManageAll: async (): Promise<ApiResponse<Property[]>> => {
    const response = await api.get<ApiResponse<Property[]>>("/properties/manage");
    return response.data;
  },

  getManageById: async (id: string): Promise<ApiResponse<Property>> => {
    const response = await api.get<ApiResponse<Property>>(
      `/properties/manage/${id}`,
    );
    return response.data;
  },

  create: async (propertyData: FormData): Promise<ApiResponse<Property>> => {
    const response = await api.post<ApiResponse<Property>>(
      "/properties",
      propertyData,
    );
    return response.data;
  },

  update: async (
    id: string,
    updates: Partial<Property> | FormData
  ): Promise<ApiResponse<Property>> => {
    const response = await api.put<ApiResponse<Property>>(
      `/properties/${id}`,
      updates,
    );
    return response.data;
  },

  updateApproval: async (
    id: string,
    payload: PropertyApprovalPayload
  ): Promise<ApiResponse<Property>> => {
    const response = await api.patch<ApiResponse<Property>>(
      `/properties/${id}/approval`,
      payload,
    );
    return response.data;
  },

  deactivate: async (id: string): Promise<ApiResponse<Property>> => {
    const response = await api.put<ApiResponse<Property>>(
      `/properties/${id}/deactivate`,
      {},
    );
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `/properties/${id}`,
    );
    return response.data;
  },

  toggleFavorite: async (
    propertyId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post<ApiResponse<{ message: string }>>(
      "/users/favorites",
      { propertyId },
    );
    return response.data;
  },

  removeFavorite: async (
    propertyId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete<ApiResponse<{ message: string }>>(
      `/users/favorites/${propertyId}`,
    );
    return response.data;
  },

  getFavorites: async (): Promise<string[]> => {
    if (typeof window === "undefined") return [];
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.favorites || [];
  },
};
