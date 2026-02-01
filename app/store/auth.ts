import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  authApi,
  profileApi,
  clearTokens,
  getAccessToken,
  type AuthResponse,
  type MeResponse,
  type ProfileResponse,
  type ApiError,
} from "@/app/lib/api";

export interface UserProfile {
  firstName: string;
  surname: string;
  dob: string;
  gender: string;
  phone: string;
  bvn: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  profileComplete: boolean;
  profile?: UserProfile;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateUser: (updates: Partial<User>) => void;
  completeProfile: (profile: UserProfile) => void;
  fetchCurrentUser: () => Promise<void>;
  fetchProfile: () => Promise<ProfileResponse | null>;
  checkAuth: () => boolean;
}

// Helper to convert backend profile to frontend format
const mapProfileResponse = (profile: ProfileResponse): UserProfile => ({
  firstName: profile.first_name || "",
  surname: profile.surname || "",
  dob: profile.date_of_birth || "",
  gender: profile.gender || "",
  phone: profile.phone_number || "",
  bvn: "", // Never returned from API (encrypted)
  bankName: profile.bank_name || "",
  bankCode: profile.bank_code || "",
  accountNumber: "", // Never returned from API (encrypted)
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authApi.login({ email, password });
          set({
            user: {
              id: response.user.id,
              name: response.user.name,
              email: response.user.email,
              profileComplete: false, // Will be updated by fetchCurrentUser
            },
            isAuthenticated: true,
            isLoading: false,
          });
          // Fetch profile status
          await get().fetchCurrentUser();
        } catch (err) {
          const error = err as ApiError;
          set({
            isLoading: false,
            error: error.message || "Login failed. Please check your credentials.",
          });
          throw error;
        }
      },

      signup: async (fullName: string, email: string, password: string, confirmPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          const response: AuthResponse = await authApi.signup({
            full_name: fullName,
            email,
            password,
            confirm_password: confirmPassword,
          });
          set({
            user: {
              id: response.user.id,
              name: response.user.name,
              email: response.user.email,
              profileComplete: false,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          const error = err as ApiError;
          set({
            isLoading: false,
            error: error.message || "Signup failed. Please try again.",
          });
          throw error;
        }
      },

      logout: () => {
        authApi.logout();
        set({ user: null, isAuthenticated: false, error: null });
      },

      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),

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

      fetchCurrentUser: async () => {
        try {
          const response: MeResponse = await authApi.me();
          set((state) => ({
            user: state.user
              ? {
                  ...state.user,
                  id: response.id,
                  name: response.name,
                  email: response.email,
                  profileComplete: response.profile?.is_completed ?? false,
                }
              : null,
          }));
        } catch {
          // Token might be invalid, clear auth
          get().logout();
        }
      },

      fetchProfile: async () => {
        try {
          const profile = await profileApi.getProfile();
          if (profile.is_completed) {
            set((state) => ({
              user: state.user
                ? {
                    ...state.user,
                    profileComplete: true,
                    profile: mapProfileResponse(profile),
                  }
                : null,
            }));
          }
          return profile;
        } catch {
          return null;
        }
      },

      checkAuth: () => {
        const token = getAccessToken();
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return false;
        }
        return get().isAuthenticated;
      },
    }),
    {
      name: "kore-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
