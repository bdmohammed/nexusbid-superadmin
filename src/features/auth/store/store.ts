import { create } from 'zustand';

import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

interface AuthActions {
  setAuthenticated: (value: boolean) => void;
  initialize: (user: User | null) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,

  setAuthenticated: (value) =>
    set({
      isAuthenticated: value,
    }),

  initialize: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isInitializing: false,
    }),
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isInitializing: false,
    }),
}));
