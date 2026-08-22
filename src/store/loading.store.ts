import { create } from "zustand";

interface LoadingStore {
  /**
   * Global loading state.
   */
  isLoading: boolean;

  /**
   * Loading message.
   */
  message: string | null;

  /**
   * Show loading.
   */
  show: (message?: string) => void;

  /**
   * Hide loading.
   */
  hide: () => void;

  /**
   * Set loading state.
   */
  setLoading: (loading: boolean, message?: string | null) => void;

  /**
   * Reset state.
   */
  reset: () => void;
}

const initialState = {
  isLoading: false,
  message: null,
};

export const useLoadingStore = create<LoadingStore>((set) => ({
  ...initialState,

  show: (message = "") =>
    set({
      isLoading: true,
      message,
    }),

  hide: () => set(initialState),

  setLoading: (loading, message = null) =>
    set({
      isLoading: loading,
      message,
    }),

  reset: () => set(initialState),
}));
