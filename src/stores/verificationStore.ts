// src/stores/verificationStore.ts
import { create } from "zustand";
import {
  verificationService,
  type VerificationData,
  type VerificationStatus,
} from "@/services/verificationService";

interface VerificationState {
  // State
  loading: boolean;
  error: string | null;
  verificationStatus: VerificationStatus | null;
  verificationHistory: any[];

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setVerificationStatus: (status: VerificationStatus | null) => void;
  setVerificationHistory: (history: any[]) => void;

  // Async Actions
  submitVerification: (verificationData: VerificationData) => Promise<void>;
  checkVerificationStatus: () => Promise<void>;
  resendVerification: () => Promise<void>; // ✅ Added this
  fetchVerificationHistory: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useVerificationStore = create<VerificationState>((set, get) => ({
  // Initial State
  loading: false,
  error: null,
  verificationStatus: null,
  verificationHistory: [],

  // Synchronous Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setVerificationStatus: (verificationStatus) => set({ verificationStatus }),
  setVerificationHistory: (verificationHistory) => set({ verificationHistory }),

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      loading: false,
      error: null,
      verificationStatus: null,
      verificationHistory: [],
    }),

  // Async Actions
  submitVerification: async (verificationData: VerificationData) => {
    set({ loading: true, error: null });

    try {
      const response = await verificationService.submitVerification(
        verificationData
      );

      if (response.success) {
        set({
          loading: false,
          error: null,
        });

        // Refresh verification status after submission
        await get().checkVerificationStatus();
      } else {
        throw new Error(response.message || "Verification submission failed");
      }
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Failed to submit verification",
      });
      throw error;
    }
  },

  checkVerificationStatus: async () => {
    set({ loading: true, error: null });

    try {
      const response = await verificationService.checkVerificationStatus();

      if (response.success) {
        set({
          verificationStatus: response.data,
          loading: false,
          error: null,
        });
      } else {
        throw new Error("Failed to fetch verification status");
      }
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Failed to check verification status",
      });
      throw error;
    }
  },

  // ✅ ADDED: Resend/Reset Verification Action
  resendVerification: async () => {
    set({ loading: true, error: null });

    try {
      const response = await verificationService.resendVerification();

      if (response.success) {
        set({
          loading: false,
          error: null,
          // Update status to unverified so the UI knows to show the form again
          verificationStatus: {
            ...get().verificationStatus,
            verificationStatus: "not_verified",
          } as VerificationStatus,
        });

        // Optional: Fetch fresh status
        await get().checkVerificationStatus();
      } else {
        throw new Error(response.message || "Failed to reset verification");
      }
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Failed to reset verification",
      });
      throw error;
    }
  },

  fetchVerificationHistory: async () => {
    set({ loading: true, error: null });

    try {
      const response = await verificationService.getVerificationHistory();

      if (response.success) {
        set({
          verificationHistory: response.data,
          loading: false,
          error: null,
        });
      } else {
        throw new Error("Failed to fetch verification history");
      }
    } catch (error: any) {
      set({
        loading: false,
        error: error.message || "Failed to fetch verification history",
      });
      throw error;
    }
  },
}));
