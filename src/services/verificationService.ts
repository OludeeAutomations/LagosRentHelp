// src/services/verificationService.ts
import { api } from "./api";

export interface VerificationData {
  idType: string;
  idNumber: string;
  selfieImage: File;
  dateOfBirth?: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  data?: {
    verificationId: string;
    status: string;
    idType: string;
    idNumberMasked: string;
  };
  error?: string;
}

export interface VerificationStatus {
  verificationStatus: "not_verified" | "pending" | "verified" | "rejected";
  idType?: string;
  submittedAt?: string;
  verifiedAt?: string;
  dojahStatus?: string;
  idNumber?: string;
}

export const verificationService = {
  /**
   * Submit verification documents to backend
   */
  submitVerification: async (
    verificationData: VerificationData
  ): Promise<VerificationResponse> => {
    const formData = new FormData();
    formData.append("idType", verificationData.idType);
    formData.append("idNumber", verificationData.idNumber);

    if (verificationData.dateOfBirth) {
      formData.append("dateOfBirth", verificationData.dateOfBirth);
    }

    formData.append("selfie", verificationData.selfieImage);

    try {
      const response = await api.post("/verification/submit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("Verification submission error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to submit verification"
      );
    }
  },

  /**
   * Check verification status
   */
  checkVerificationStatus: async (): Promise<{
    success: boolean;
    data: VerificationStatus;
  }> => {
    try {
      const response = await api.get("/verification/status");
      return response.data;
    } catch (error: any) {
      console.error("Verification status check error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to check verification status"
      );
    }
  },

  /**
   * Get verification history
   */
  getVerificationHistory: async () => {
    try {
      const response = await api.get("/verification/history");
      return response.data;
    } catch (error: any) {
      console.error("Verification history error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to fetch verification history"
      );
    }
  },
};
