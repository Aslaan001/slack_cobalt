import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserState } from '../types';

interface AuthStore extends UserState {
  setUser: (userId: string, hasTokenRotation: boolean) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      userId: null,
      isAuthenticated: false,
      hasTokenRotation: false,
      setUser: (userId: string, hasTokenRotation: boolean) =>
        set({ userId, isAuthenticated: true, hasTokenRotation }),
      clearUser: () =>
        set({ userId: null, isAuthenticated: false, hasTokenRotation: false }),
    }),
    {
      name: 'slack-auth-storage',
    }
  )
);