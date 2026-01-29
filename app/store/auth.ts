import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  dob: string;
  gender: string;
  phone: string;
  address: string;
  bvn: string;
  bankName: string;
  accountNumber: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profileComplete: boolean;
  profile?: UserProfile;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
  completeProfile: (profile: UserProfile) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setLoading: (isLoading) => set({ isLoading }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      completeProfile: (profile) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, profile, profileComplete: true }
            : null,
        })),
    }),
    {
      name: "kore-auth",
    }
  )
);
