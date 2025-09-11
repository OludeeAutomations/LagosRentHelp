import { api, ApiResponse } from "./api";
import { Review } from "@/types";

export interface CreateReviewData {
  propertyId: string;
  agentId: string;
  rating: number;
  comment: string;
}

export const reviewService = {
  create: async (
    reviewData: CreateReviewData
  ): Promise<ApiResponse<Review>> => {
    return api.post<Review>("/reviews", reviewData);
  },

  getByProperty: async (propertyId: string): Promise<ApiResponse<Review[]>> => {
    return api.get<Review[]>(`/reviews/property/${propertyId}`);
  },

  update: async (
    id: string,
    updates: Partial<Review>
  ): Promise<ApiResponse<Review>> => {
    return api.put<Review>(`/reviews/${id}`, updates);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/reviews/${id}`);
  },
};
