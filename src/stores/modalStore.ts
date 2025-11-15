// stores/modalStore.ts
import { create } from "zustand";

interface LoginModalState {
  isOpen: boolean;
  message: string;
  retryAction: (() => void) | null;
  openLoginModal: (message?: string, retryAction?: () => void) => void;
  closeLoginModal: () => void;
  executeRetry: () => void;
}

export const useLoginModalStore = create<LoginModalState>((set, get) => ({
  isOpen: false,
  message: "Your session has expired. Please login again.",
  retryAction: null,

  openLoginModal: (
    message = "Your session has expired. Please login again.",
    retryAction
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

  executeRetry: () => {
    const { retryAction } = get();
    if (retryAction) {
      retryAction();
    }
  },
}));
