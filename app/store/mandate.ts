import { create } from "zustand";
import { persist } from "zustand/middleware";
import { 
  mandateApi, 
  Mandate, 
  MandateStatus,
  MandateCreateResponse,
  ApiError 
} from "@/app/lib/api";

interface MandateState {
  // State
  mandate: Mandate | null;
  isLoading: boolean;
  isPolling: boolean;
  error: string | null;
  
  // Actions
  fetchMandate: () => Promise<Mandate | null>;
  createMandate: () => Promise<MandateCreateResponse>;
  cancelMandate: () => Promise<void>;
  startPolling: (intervalMs?: number, maxAttempts?: number) => Promise<Mandate>;
  stopPolling: () => void;
  
  // Helpers
  clearError: () => void;
  reset: () => void;
  
  // Computed
  hasActiveMandate: () => boolean;
  isPending: () => boolean;
  needsActivation: () => boolean;
}

// Polling control
let pollingAbortController: AbortController | null = null;

export const useMandateStore = create<MandateState>()(
  persist(
    (set, get) => ({
      // Initial state
      mandate: null,
      isLoading: false,
      isPolling: false,
      error: null,
      
      // Fetch current mandate
      fetchMandate: async () => {
        set({ isLoading: true, error: null });
        try {
          const mandate = await mandateApi.getMyMandate();
          set({ mandate, isLoading: false });
          return mandate;
        } catch (error) {
          if (error instanceof ApiError && error.status === 404) {
            // No mandate exists - that's okay
            set({ mandate: null, isLoading: false });
            return null;
          }
          const message = error instanceof Error ? error.message : "Failed to fetch mandate";
          set({ error: message, isLoading: false });
          throw error;
        }
      },
      
      // Create new mandate
      createMandate: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await mandateApi.create();
          
          // Create a partial mandate object from the response
          const mandate: Mandate = {
            id: response.id,
            status: response.status,
            request_ref: response.request_ref,
            activation_url: response.activation_url,
            mandate_reference: null,
            subscription_id: null,
            created_at: new Date().toISOString(),
            cancelled_at: null,
            provider_response_code: null,
          };
          
          set({ mandate, isLoading: false });
          return response;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to create mandate";
          set({ error: message, isLoading: false });
          throw error;
        }
      },
      
      // Cancel active mandate
      cancelMandate: async () => {
        set({ isLoading: true, error: null });
        try {
          await mandateApi.cancel();
          
          // Update local state
          const currentMandate = get().mandate;
          if (currentMandate) {
            set({ 
              mandate: { 
                ...currentMandate, 
                status: "CANCELLED",
                cancelled_at: new Date().toISOString(),
              }, 
              isLoading: false 
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to cancel mandate";
          set({ error: message, isLoading: false });
          throw error;
        }
      },
      
      // Start polling for mandate status changes
      startPolling: async (intervalMs = 3000, maxAttempts = 20) => {
        // Stop any existing polling
        get().stopPolling();
        
        set({ isPolling: true, error: null });
        pollingAbortController = new AbortController();
        
        try {
          const mandate = await mandateApi.pollStatus(intervalMs, maxAttempts);
          set({ mandate, isPolling: false });
          return mandate;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Polling failed";
          set({ error: message, isPolling: false });
          throw error;
        }
      },
      
      // Stop polling
      stopPolling: () => {
        if (pollingAbortController) {
          pollingAbortController.abort();
          pollingAbortController = null;
        }
        set({ isPolling: false });
      },
      
      // Clear error
      clearError: () => set({ error: null }),
      
      // Reset store
      reset: () => {
        get().stopPolling();
        set({ 
          mandate: null, 
          isLoading: false, 
          isPolling: false, 
          error: null 
        });
      },
      
      // Check if user has an active mandate
      hasActiveMandate: () => {
        const mandate = get().mandate;
        return mandate?.status === "ACTIVE";
      },
      
      // Check if mandate is pending activation
      isPending: () => {
        const mandate = get().mandate;
        return mandate?.status === "PENDING";
      },
      
      // Check if mandate needs user to complete activation
      needsActivation: () => {
        const mandate = get().mandate;
        return mandate?.status === "PENDING" && !!mandate.activation_url;
      },
    }),
    {
      name: "kore-mandate",
      partialize: (state) => ({
        // Only persist the mandate, not loading/polling states
        mandate: state.mandate,
      }),
    }
  )
);
