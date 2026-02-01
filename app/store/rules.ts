import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  rulesApi,
  DebitRuleRequest,
  DebitRuleResponse,
  Frequency,
  FailureAction,
  BucketType,
  BucketAllocation as ApiBucketAllocation,
} from "@/app/lib/api";

export type IncomeType = "salary" | "variable";
export type DebitFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
export type RiskTolerance = "conservative" | "moderate" | "aggressive";

export interface BucketAllocation {
  savings: number;
  investments: number;
  spending: number;
  emergency: number;
  bills: number;
}

export interface UserRules {
  // Limits
  monthlyMaxDebit: number;
  singleMaxDebit: number;
  
  // Frequency
  frequency: DebitFrequency;
  amountPerFrequency: number;
  
  // Bucket Allocation (must equal 100%)
  bucketAllocation: BucketAllocation;
  
  // Failure handling
  failureAction: "RETRY" | "SKIP" | "NOTIFY";
  
  // Date range
  startDate: string;
  endDate?: string | null;
  
  // Legacy fields (for UI state only)
  incomeType?: IncomeType;
  monthlyAmount?: number;
  riskTolerance?: RiskTolerance;
  notifyOnDebit?: boolean;
}

interface RulesState {
  rules: UserRules | null;
  activeRule: DebitRuleResponse | null;
  onboardingComplete: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Local state management
  setRules: (rules: UserRules) => void;
  updateRules: (updates: Partial<UserRules>) => void;
  completeOnboarding: () => void;
  resetRules: () => void;
  
  // API actions
  fetchActiveRule: () => Promise<DebitRuleResponse | null>;
  createRule: (rules: UserRules) => Promise<DebitRuleResponse>;
  updateActiveRule: (updates: Partial<UserRules>) => Promise<DebitRuleResponse>;
  deactivateRule: () => Promise<void>;
  fetchRulesHistory: () => Promise<DebitRuleResponse[]>;
}

// Convert frontend rules to API format
const toApiFormat = (rules: UserRules): DebitRuleRequest => {
  const allocations: ApiBucketAllocation[] = [];
  
  if (rules.bucketAllocation.savings > 0) {
    allocations.push({ bucket: "SAVINGS", percentage: rules.bucketAllocation.savings });
  }
  if (rules.bucketAllocation.investments > 0) {
    allocations.push({ bucket: "INVESTMENTS", percentage: rules.bucketAllocation.investments });
  }
  if (rules.bucketAllocation.spending > 0) {
    allocations.push({ bucket: "SPENDING", percentage: rules.bucketAllocation.spending });
  }
  if (rules.bucketAllocation.emergency > 0) {
    allocations.push({ bucket: "EMERGENCY", percentage: rules.bucketAllocation.emergency });
  }
  if (rules.bucketAllocation.bills > 0) {
    allocations.push({ bucket: "BILLS", percentage: rules.bucketAllocation.bills });
  }
  
  return {
    monthly_max_debit: rules.monthlyMaxDebit,
    single_max_debit: rules.singleMaxDebit,
    frequency: rules.frequency,
    amount_per_frequency: rules.amountPerFrequency,
    allocations,
    failure_action: rules.failureAction,
    start_date: rules.startDate,
    end_date: rules.endDate || null,
  };
};

// Convert API response to frontend format
const fromApiFormat = (response: DebitRuleResponse): UserRules => {
  const bucketAllocation: BucketAllocation = {
    savings: 0,
    investments: 0,
    spending: 0,
    emergency: 0,
    bills: 0,
  };
  
  response.allocations.forEach((alloc) => {
    const bucket = alloc.bucket.toLowerCase() as keyof BucketAllocation;
    if (bucket in bucketAllocation) {
      bucketAllocation[bucket] = alloc.percentage;
    }
  });
  
  return {
    monthlyMaxDebit: parseFloat(response.monthly_max_debit),
    singleMaxDebit: parseFloat(response.single_max_debit),
    frequency: response.frequency,
    amountPerFrequency: parseFloat(response.amount_per_frequency),
    bucketAllocation,
    failureAction: response.failure_action,
    startDate: response.start_date,
    endDate: response.end_date,
  };
};

const defaultRules: UserRules = {
  monthlyMaxDebit: 50000,
  singleMaxDebit: 10000,
  frequency: "MONTHLY",
  amountPerFrequency: 50000,
  bucketAllocation: {
    savings: 40,
    investments: 30,
    spending: 20,
    emergency: 10,
    bills: 0,
  },
  failureAction: "NOTIFY",
  startDate: new Date().toISOString().split("T")[0],
  endDate: null,
  incomeType: "salary",
  monthlyAmount: 0,
  riskTolerance: "moderate",
  notifyOnDebit: true,
};

export const useRulesStore = create<RulesState>()(
  persist(
    (set, get) => ({
      rules: null,
      activeRule: null,
      onboardingComplete: false,
      isLoading: false,
      error: null,
      
      setRules: (rules) => set({ rules }),
      
      updateRules: (updates) =>
        set((state) => ({
          rules: state.rules ? { ...state.rules, ...updates } : { ...defaultRules, ...updates },
        })),
      
      completeOnboarding: () => set({ onboardingComplete: true }),
      
      resetRules: () => set({ rules: null, activeRule: null, onboardingComplete: false }),
      
      // Fetch active rule from API
      fetchActiveRule: async () => {
        set({ isLoading: true, error: null });
        try {
          const activeRule = await rulesApi.getActiveRule();
          if (activeRule) {
            const rules = fromApiFormat(activeRule);
            set({ activeRule, rules, onboardingComplete: true, isLoading: false });
          } else {
            set({ activeRule: null, isLoading: false });
          }
          return activeRule;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to fetch rules";
          set({ error: message, isLoading: false });
          return null;
        }
      },
      
      // Create new rule via API
      createRule: async (rules: UserRules) => {
        set({ isLoading: true, error: null });
        try {
          const payload = toApiFormat(rules);
          const activeRule = await rulesApi.createRule(payload);
          set({ activeRule, rules, onboardingComplete: true, isLoading: false });
          return activeRule;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to create rule";
          set({ error: message, isLoading: false });
          throw error;
        }
      },
      
      // Update active rule via API
      updateActiveRule: async (updates: Partial<UserRules>) => {
        set({ isLoading: true, error: null });
        try {
          const currentRules = get().rules || defaultRules;
          const updatedRules = { ...currentRules, ...updates };
          const payload = toApiFormat(updatedRules);
          const activeRule = await rulesApi.updateRule(payload);
          set({ activeRule, rules: updatedRules, isLoading: false });
          return activeRule;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to update rule";
          set({ error: message, isLoading: false });
          throw error;
        }
      },
      
      // Deactivate rule via API
      deactivateRule: async () => {
        set({ isLoading: true, error: null });
        try {
          await rulesApi.deactivateRule();
          set({ activeRule: null, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to deactivate rule";
          set({ error: message, isLoading: false });
          throw error;
        }
      },
      
      // Fetch rules history
      fetchRulesHistory: async () => {
        set({ isLoading: true, error: null });
        try {
          const history = await rulesApi.getRulesHistory();
          set({ isLoading: false });
          return history;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to fetch history";
          set({ error: message, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "kore-rules",
      version: 3,
      migrate: (persistedState, version) => {
        // Reset rules on version upgrade
        if (version < 3) {
          return { rules: null, activeRule: null, onboardingComplete: false, isLoading: false, error: null };
        }
        return persistedState as RulesState;
      },
      partialize: (state) => ({
        rules: state.rules,
        onboardingComplete: state.onboardingComplete,
      }),
    }
  )
);
