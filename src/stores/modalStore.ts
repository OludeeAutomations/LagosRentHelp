// stores/modalStore.ts
import { create } from "zustand";

interface LoginModalState {
  isOpen: boolean;
  message: string;
  retryAction: (() => Promise<unknown>) | null;
  openLoginModal: (
    message?: string,
    retryAction?: () => Promise<unknown>,
  ) => void;
  closeLoginModal: () => void;
  executeRetry: () => Promise<unknown>;
}

export const useLoginModalStore = create<LoginModalState>((set, get) => ({
  isOpen: false,
  message: "Your session has expired. Please login again.",
  retryAction: null,

  openLoginModal: (
    message = "Your session has expired. Please login again.",
    retryAction,
  ) => {
    set({
      isOpen: true,
      message,
      retryAction: retryAction || null,
    });
  },

  closeLoginModal: () => {
    set({
      isOpen: false,
      message: "Your session has expired. Please login again.",
      retryAction: null,
    });
  },

  executeRetry: async () => {
    const { retryAction } = get();
    if (retryAction) {
      return retryAction();
    }
    return Promise.resolve();
  },
}));
