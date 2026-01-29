import { create } from "zustand";
import { persist } from "zustand/middleware";

export type IncomeType = "salary" | "variable";
export type DebitFrequency = "anytime" | "weekends" | "weekly_friday" | "month_end" | "month_start" | "bi_weekly";
export type RiskTolerance = "conservative" | "moderate" | "aggressive";

export interface BucketAllocation {
  savings: number;
  investments: number;
  pensions: number;
  insurance: number;
}

export interface UserRules {
  // Income Information
  incomeType: IncomeType;
  monthlyAmount: number;
  badMonthIncome: number;
  goodMonthIncome: number;
  
  // Debit Preferences
  debitFrequency: DebitFrequency;
  preferredDebitDay?: number; // 1-31 for specific day
  
  // Financial Goals
  hasEmergencyFund: boolean;
  emergencyFundTarget?: number;
  primaryGoal: "build_savings" | "grow_wealth" | "debt_free" | "retirement";
  
  // Risk & Investment
  riskTolerance: RiskTolerance;
  
  // Bucket Allocation (must equal 100%)
  bucketAllocation: BucketAllocation;
  
  // Notifications
  notifyOnDebit: boolean;
  notifyOnAllocation: boolean;
  weeklyReport: boolean;
}

interface RulesState {
  rules: UserRules | null;
  onboardingComplete: boolean;
  setRules: (rules: UserRules) => void;
  updateRules: (updates: Partial<UserRules>) => void;
  completeOnboarding: () => void;
  resetRules: () => void;
}

const defaultRules: UserRules = {
  incomeType: "salary",
  monthlyAmount: 0,
  badMonthIncome: 0,
  goodMonthIncome: 0,
  debitFrequency: "month_end",
  hasEmergencyFund: false,
  primaryGoal: "build_savings",
  riskTolerance: "moderate",
  bucketAllocation: {
    savings: 40,
    investments: 30,
    pensions: 20,
    insurance: 10,
  },
  notifyOnDebit: true,
  notifyOnAllocation: true,
  weeklyReport: true,
};

export const useRulesStore = create<RulesState>()(
  persist(
    (set) => ({
      rules: null,
      onboardingComplete: false,
      setRules: (rules) => set({ rules }),
      updateRules: (updates) =>
        set((state) => ({
          rules: state.rules ? { ...state.rules, ...updates } : { ...defaultRules, ...updates },
        })),
      completeOnboarding: () => set({ onboardingComplete: true }),
      resetRules: () => set({ rules: null, onboardingComplete: false }),
    }),
    {
      name: "kore-rules",
      version: 2,
      migrate: (persistedState, version) => {
        // Reset rules on version upgrade to fix stale onboardingComplete
        if (version < 2) {
          return { rules: null, onboardingComplete: false };
        }
        return persistedState as RulesState;
      },
    }
  )
);
