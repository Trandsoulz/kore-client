"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Wallet,
  Calendar,
  TrendingUp,
  PieChart,
  Bell,
  Target,
  Briefcase,
  Coins,
  ShieldCheck,
  PiggyBank,
  Building,
  Shield,
  CreditCard,
  Landmark,
  ExternalLink,
  Smartphone,
} from "lucide-react";
import { useAuthStore } from "@/app/store/auth";
import {
  useRulesStore,
  IncomeType,
  DebitFrequency,
  RiskTolerance,
  BucketAllocation,
} from "@/app/store/rules";

const TOTAL_STEPS = 7;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { setRules, completeOnboarding, onboardingComplete } = useRulesStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form state
  const [incomeType, setIncomeType] = useState<IncomeType>("salary");
  const [monthlyAmount, setMonthlyAmount] = useState<string>("");
  const [badMonthIncome, setBadMonthIncome] = useState<string>("");
  const [goodMonthIncome, setGoodMonthIncome] = useState<string>("");
  const [debitFrequency, setDebitFrequency] = useState<DebitFrequency>("month_end");
  const [hasEmergencyFund, setHasEmergencyFund] = useState<boolean | null>(null);
  const [emergencyFundTarget, setEmergencyFundTarget] = useState<string>("");
  const [primaryGoal, setPrimaryGoal] = useState<string>("");
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>("moderate");
  const [bucketAllocation, setBucketAllocation] = useState<BucketAllocation>({
    savings: 40,
    investments: 30,
    pensions: 20,
    insurance: 10,
  });
  const [notifyOnDebit, setNotifyOnDebit] = useState(true);
  const [notifyOnAllocation, setNotifyOnAllocation] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  
  // Mandate setup state
  const [mandateType, setMandateType] = useState<"direct_debit" | "card" | "skip" | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [isSettingUpMandate, setIsSettingUpMandate] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (mounted && onboardingComplete) {
      router.push("/dashboard");
    }
  }, [mounted, onboardingComplete, router]);

  const totalAllocation = Object.values(bucketAllocation).reduce((a, b) => a + b, 0);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Income Type & Amount
        if (!monthlyAmount || parseFloat(monthlyAmount) <= 0) {
          newErrors.monthlyAmount = "Enter a valid amount";
        }
        if (incomeType === "variable") {
          if (!badMonthIncome || parseFloat(badMonthIncome) <= 0) {
            newErrors.badMonthIncome = "Enter your minimum monthly income";
          }
          if (!goodMonthIncome || parseFloat(goodMonthIncome) <= 0) {
            newErrors.goodMonthIncome = "Enter your maximum monthly income";
          }
          if (parseFloat(goodMonthIncome) < parseFloat(badMonthIncome)) {
            newErrors.goodMonthIncome = "Good month should be higher than bad month";
          }
        }
        break;

      case 2: // Debit Frequency
        if (!debitFrequency) {
          newErrors.debitFrequency = "Select when to debit";
        }
        break;

      case 3: // Emergency Fund & Goals
        if (hasEmergencyFund === null) {
          newErrors.hasEmergencyFund = "Select an option";
        }
        if (!primaryGoal) {
          newErrors.primaryGoal = "Select your primary goal";
        }
        break;

      case 4: // Risk Tolerance
        if (!riskTolerance) {
          newErrors.riskTolerance = "Select your risk tolerance";
        }
        break;

      case 5: // Bucket Allocation
        if (totalAllocation !== 100) {
          newErrors.bucketAllocation = `Allocation must equal 100% (currently ${totalAllocation}%)`;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    const rules = {
      incomeType,
      monthlyAmount: parseFloat(monthlyAmount) || 0,
      badMonthIncome: parseFloat(badMonthIncome) || 0,
      goodMonthIncome: parseFloat(goodMonthIncome) || 0,
      debitFrequency,
      hasEmergencyFund: hasEmergencyFund || false,
      emergencyFundTarget: parseFloat(emergencyFundTarget) || undefined,
      primaryGoal: primaryGoal as "build_savings" | "grow_wealth" | "debt_free" | "retirement",
      riskTolerance,
      bucketAllocation,
      notifyOnDebit,
      notifyOnAllocation,
      weeklyReport,
    };

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setRules(rules);
    completeOnboarding();
    setIsSubmitting(false);
    
    // Move to mandate setup step
    setCurrentStep(7);
  };

  const handleMandateSetup = async () => {
    if (mandateType === "skip") {
      router.push("/dashboard");
      return;
    }

    if (mandateType === "direct_debit" && (!selectedBank || !accountNumber)) {
      setErrors({ mandate: "Please enter your bank details" });
      return;
    }

    setIsSettingUpMandate(true);

    // Simulate mandate setup API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSettingUpMandate(false);
    router.push("/dashboard");
  };

  const updateBucket = (bucket: keyof BucketAllocation, value: number) => {
    setBucketAllocation((prev) => ({
      ...prev,
      [bucket]: Math.max(0, Math.min(100, value)),
    }));
  };

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">Kore</span>
          <div className="flex items-center gap-2 text-sm text-muted">
            {currentStep < 7 ? (
              <span>Step {currentStep} of 6</span>
            ) : (
              <span>Almost done!</span>
            )}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {currentStep < 7 && (
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="flex gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i < currentStep ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
      )}

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
          {/* Step 1: Income Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Tell us about your income</h2>
                  <p className="text-muted">This helps us customize your automation rules</p>
                </div>
              </div>

              {/* Income Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  What type of income do you earn?
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    {
                      value: "salary",
                      label: "Fixed Salary",
                      desc: "I earn the same amount monthly",
                      icon: Briefcase,
                    },
                    {
                      value: "variable",
                      label: "Variable Income",
                      desc: "Freelancer, gig worker, business owner",
                      icon: Coins,
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setIncomeType(option.value as IncomeType)}
                      className={`p-4 border rounded-xl text-left transition-all ${
                        incomeType === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <option.icon
                        className={`w-6 h-6 mb-2 ${
                          incomeType === option.value ? "text-primary" : "text-muted"
                        }`}
                      />
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="text-sm text-muted">{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Amount */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {incomeType === "salary"
                    ? "How much do you earn monthly?"
                    : "How much should we collect monthly on average?"}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">₦</span>
                  <input
                    type="text"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="150,000"
                    className={`w-full pl-8 pr-4 py-3 bg-background border ${
                      errors.monthlyAmount ? "border-red-500" : "border-border"
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50`}
                  />
                </div>
                {errors.monthlyAmount && (
                  <p className="text-red-500 text-sm mt-1">{errors.monthlyAmount}</p>
                )}
              </div>

              {/* Variable Income Range */}
              {incomeType === "variable" && (
                <div className="grid sm:grid-cols-2 gap-4 p-4 bg-accent/5 rounded-xl border border-accent/20">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      On a bad month, I earn at least
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">₦</span>
                      <input
                        type="text"
                        value={badMonthIncome}
                        onChange={(e) => setBadMonthIncome(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="80,000"
                        className={`w-full pl-8 pr-4 py-3 bg-background border ${
                          errors.badMonthIncome ? "border-red-500" : "border-border"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50`}
                      />
                    </div>
                    {errors.badMonthIncome && (
                      <p className="text-red-500 text-sm mt-1">{errors.badMonthIncome}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      On a good month, I earn up to
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">₦</span>
                      <input
                        type="text"
                        value={goodMonthIncome}
                        onChange={(e) => setGoodMonthIncome(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="300,000"
                        className={`w-full pl-8 pr-4 py-3 bg-background border ${
                          errors.goodMonthIncome ? "border-red-500" : "border-border"
                        } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50`}
                      />
                    </div>
                    {errors.goodMonthIncome && (
                      <p className="text-red-500 text-sm mt-1">{errors.goodMonthIncome}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Debit Timing */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">When should we debit?</h2>
                  <p className="text-muted">Choose when Kore collects from your account</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    value: "month_start",
                    label: "Beginning of the month",
                    desc: "1st - 3rd of every month",
                  },
                  {
                    value: "month_end",
                    label: "End of the month",
                    desc: "25th - 28th of every month",
                  },
                  {
                    value: "weekly_friday",
                    label: "Every Friday",
                    desc: "Weekly debits for gradual savings",
                  },
                  {
                    value: "bi_weekly",
                    label: "Bi-weekly",
                    desc: "Every two weeks",
                  },
                  {
                    value: "weekends",
                    label: "Weekends only",
                    desc: "Saturday or Sunday each week",
                  },
                  {
                    value: "anytime",
                    label: "Anytime (Smart debit)",
                    desc: "Kore chooses the best time based on your balance",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDebitFrequency(option.value as DebitFrequency)}
                    className={`w-full p-4 border rounded-xl text-left transition-all flex items-center justify-between ${
                      debitFrequency === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="text-sm text-muted">{option.desc}</p>
                    </div>
                    {debitFrequency === option.value && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
              {errors.debitFrequency && (
                <p className="text-red-500 text-sm">{errors.debitFrequency}</p>
              )}
            </div>
          )}

          {/* Step 3: Financial Goals */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Your financial goals</h2>
                  <p className="text-muted">Help us understand what matters most to you</p>
                </div>
              </div>

              {/* Emergency Fund */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Do you have an emergency fund (3-6 months of expenses)?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: true, label: "Yes, I do" },
                    { value: false, label: "No, not yet" },
                  ].map((option) => (
                    <button
                      key={String(option.value)}
                      onClick={() => setHasEmergencyFund(option.value)}
                      className={`p-4 border rounded-xl text-center transition-all ${
                        hasEmergencyFund === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <p className="font-medium text-foreground">{option.label}</p>
                    </button>
                  ))}
                </div>
                {errors.hasEmergencyFund && (
                  <p className="text-red-500 text-sm mt-1">{errors.hasEmergencyFund}</p>
                )}
              </div>

              {hasEmergencyFund === false && (
                <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/20">
                  <p className="text-sm text-foreground mb-2">
                    💡 We recommend building an emergency fund first. How much would you like to save?
                  </p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">₦</span>
                    <input
                      type="text"
                      value={emergencyFundTarget}
                      onChange={(e) => setEmergencyFundTarget(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="500,000"
                      className="w-full pl-8 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              )}

              {/* Primary Goal */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  What&apos;s your primary financial goal?
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    {
                      value: "build_savings",
                      label: "Build Savings",
                      desc: "Save for short-term goals",
                      icon: PiggyBank,
                    },
                    {
                      value: "grow_wealth",
                      label: "Grow Wealth",
                      desc: "Invest for long-term growth",
                      icon: TrendingUp,
                    },
                    {
                      value: "debt_free",
                      label: "Become Debt-Free",
                      desc: "Pay off loans faster",
                      icon: ShieldCheck,
                    },
                    {
                      value: "retirement",
                      label: "Plan for Retirement",
                      desc: "Secure my future",
                      icon: Building,
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPrimaryGoal(option.value)}
                      className={`p-4 border rounded-xl text-left transition-all ${
                        primaryGoal === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <option.icon
                        className={`w-6 h-6 mb-2 ${
                          primaryGoal === option.value ? "text-primary" : "text-muted"
                        }`}
                      />
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="text-sm text-muted">{option.desc}</p>
                    </button>
                  ))}
                </div>
                {errors.primaryGoal && (
                  <p className="text-red-500 text-sm mt-1">{errors.primaryGoal}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Risk Tolerance */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Investment preferences</h2>
                  <p className="text-muted">How comfortable are you with investment risk?</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    value: "conservative",
                    label: "Conservative",
                    desc: "Low risk, stable returns. Prefer savings and money market funds.",
                    returns: "5-10% yearly",
                    color: "text-secondary",
                  },
                  {
                    value: "moderate",
                    label: "Moderate",
                    desc: "Balanced approach. Mix of stable and growth investments.",
                    returns: "10-18% yearly",
                    color: "text-primary",
                  },
                  {
                    value: "aggressive",
                    label: "Aggressive",
                    desc: "Higher risk for higher returns. Stocks, equity funds, crypto.",
                    returns: "18-30%+ yearly",
                    color: "text-accent",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setRiskTolerance(option.value as RiskTolerance)}
                    className={`w-full p-4 border rounded-xl text-left transition-all ${
                      riskTolerance === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-sm text-muted mt-1">{option.desc}</p>
                      </div>
                      <span className={`text-sm font-medium ${option.color}`}>
                        {option.returns}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Bucket Allocation */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Allocate your buckets</h2>
                  <p className="text-muted">Split {formatCurrency(parseFloat(monthlyAmount) || 0)} across your financial goals</p>
                </div>
              </div>

              {/* Total Indicator */}
              <div
                className={`p-4 rounded-xl border ${
                  totalAllocation === 100
                    ? "bg-secondary/5 border-secondary/20"
                    : "bg-red-500/5 border-red-500/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Total Allocation</span>
                  <span
                    className={`text-lg font-bold ${
                      totalAllocation === 100 ? "text-secondary" : "text-red-500"
                    }`}
                  >
                    {totalAllocation}%
                  </span>
                </div>
                {totalAllocation !== 100 && (
                  <p className="text-sm text-red-500 mt-1">
                    {totalAllocation < 100
                      ? `Add ${100 - totalAllocation}% more`
                      : `Remove ${totalAllocation - 100}%`}
                  </p>
                )}
              </div>

              {/* Bucket Sliders */}
              <div className="space-y-6">
                {[
                  { key: "savings", label: "Savings", icon: PiggyBank, color: "bg-primary" },
                  { key: "investments", label: "Investments", icon: TrendingUp, color: "bg-secondary" },
                  { key: "pensions", label: "Pensions", icon: Building, color: "bg-blue-500" },
                  { key: "insurance", label: "Insurance", icon: Shield, color: "bg-teal-500" },
                ].map((bucket) => (
                  <div key={bucket.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 ${bucket.color} rounded-lg flex items-center justify-center`}>
                          <bucket.icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-foreground">{bucket.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted text-sm">
                          {formatCurrency(
                            ((parseFloat(monthlyAmount) || 0) *
                              bucketAllocation[bucket.key as keyof BucketAllocation]) /
                              100
                          )}
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={bucketAllocation[bucket.key as keyof BucketAllocation]}
                          onChange={(e) =>
                            updateBucket(
                              bucket.key as keyof BucketAllocation,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-16 px-2 py-1 text-center border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <span className="text-foreground font-medium">%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={bucketAllocation[bucket.key as keyof BucketAllocation]}
                      onChange={(e) =>
                        updateBucket(
                          bucket.key as keyof BucketAllocation,
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full accent-primary"
                    />
                  </div>
                ))}
              </div>

              {errors.bucketAllocation && (
                <p className="text-red-500 text-sm">{errors.bucketAllocation}</p>
              )}
            </div>
          )}

          {/* Step 6: Notifications */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Notification preferences</h2>
                  <p className="text-muted">Stay informed about your financial automations</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: "notifyOnDebit",
                    label: "Notify me when debited",
                    desc: "Get alerted when money is collected from your account",
                    value: notifyOnDebit,
                    setValue: setNotifyOnDebit,
                  },
                  {
                    key: "notifyOnAllocation",
                    label: "Notify me on allocations",
                    desc: "Get alerted when money is distributed to your buckets",
                    value: notifyOnAllocation,
                    setValue: setNotifyOnAllocation,
                  },
                  {
                    key: "weeklyReport",
                    label: "Weekly summary report",
                    desc: "Receive a weekly email with your financial summary",
                    value: weeklyReport,
                    setValue: setWeeklyReport,
                  },
                ].map((option) => (
                  <div
                    key={option.key}
                    className="flex items-center justify-between p-4 border border-border rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="text-sm text-muted">{option.desc}</p>
                    </div>
                    <button
                      onClick={() => option.setValue(!option.value)}
                      className={`w-12 h-7 rounded-full transition-colors relative ${
                        option.value ? "bg-primary" : "bg-border"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                          option.value ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
                <h3 className="font-semibold text-foreground mb-4">Your Rules Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Monthly collection</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(parseFloat(monthlyAmount) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Debit timing</span>
                    <span className="font-medium text-foreground capitalize">
                      {debitFrequency.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Risk profile</span>
                    <span className="font-medium text-foreground capitalize">{riskTolerance}</span>
                  </div>
                  <hr className="border-border my-2" />
                  <div className="flex justify-between">
                    <span className="text-muted">Savings</span>
                    <span className="font-medium text-foreground">{bucketAllocation.savings}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Investments</span>
                    <span className="font-medium text-foreground">{bucketAllocation.investments}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Pensions</span>
                    <span className="font-medium text-foreground">{bucketAllocation.pensions}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Insurance</span>
                    <span className="font-medium text-foreground">{bucketAllocation.insurance}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Mandate Setup */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Rules Activated! 🎉
                </h2>
                <p className="text-muted">
                  Now let&apos;s set up how Kore will collect money from your account
                </p>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-6">
                <p className="text-sm text-foreground">
                  <strong>Why set up a mandate?</strong> A mandate allows Kore to automatically 
                  debit your account based on your rules. This ensures your savings and investments 
                  happen consistently without you having to remember.
                </p>
              </div>

              <div className="space-y-4">
                {/* Direct Debit Option */}
                <button
                  onClick={() => setMandateType("direct_debit")}
                  className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                    mandateType === "direct_debit"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      mandateType === "direct_debit" ? "bg-primary text-white" : "bg-muted/10"
                    }`}>
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">Direct Debit Mandate</h3>
                        <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs font-medium rounded-full">
                          Recommended
                        </span>
                      </div>
                      <p className="text-sm text-muted mt-1">
                        Link your bank account for seamless automatic debits. Most reliable option.
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-secondary" /> No failed transactions
                        </span>
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-secondary" /> Bank-level security
                        </span>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      mandateType === "direct_debit" ? "border-primary bg-primary" : "border-muted"
                    }`}>
                      {mandateType === "direct_debit" && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </button>

                {/* Direct Debit Form */}
                {mandateType === "direct_debit" && (
                  <div className="ml-16 space-y-4 p-4 bg-background rounded-xl border border-border animate-in slide-in-from-top-2">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Select Bank
                      </label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full p-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="">Choose your bank</option>
                        <option value="access">Access Bank</option>
                        <option value="gtb">GTBank</option>
                        <option value="firstbank">First Bank</option>
                        <option value="uba">UBA</option>
                        <option value="zenith">Zenith Bank</option>
                        <option value="kuda">Kuda Bank</option>
                        <option value="opay">OPay</option>
                        <option value="palmpay">PalmPay</option>
                        <option value="moniepoint">Moniepoint</option>
                        <option value="sterling">Sterling Bank</option>
                        <option value="fcmb">FCMB</option>
                        <option value="fidelity">Fidelity Bank</option>
                        <option value="wema">Wema Bank</option>
                        <option value="stanbic">Stanbic IBTC</option>
                        <option value="union">Union Bank</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        placeholder="Enter 10-digit account number"
                        className="w-full p-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    {errors.mandate && (
                      <p className="text-sm text-red-500">{errors.mandate}</p>
                    )}
                    <p className="text-xs text-muted">
                      You&apos;ll be redirected to your bank to authorize the mandate
                    </p>
                  </div>
                )}

                {/* Card Option */}
                <button
                  onClick={() => setMandateType("card")}
                  className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                    mandateType === "card"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      mandateType === "card" ? "bg-primary text-white" : "bg-muted/10"
                    }`}>
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Card Authorization</h3>
                      <p className="text-sm text-muted mt-1">
                        Use your debit card for recurring charges. Quick setup but may have higher failure rates.
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Smartphone className="w-3 h-3" /> Works with all cards
                        </span>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      mandateType === "card" ? "border-primary bg-primary" : "border-muted"
                    }`}>
                      {mandateType === "card" && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </button>

                {/* Card form hint */}
                {mandateType === "card" && (
                  <div className="ml-16 p-4 bg-background rounded-xl border border-border animate-in slide-in-from-top-2">
                    <p className="text-sm text-muted">
                      You&apos;ll be redirected to a secure payment page to authorize your card.
                    </p>
                  </div>
                )}

                {/* Skip Option */}
                <button
                  onClick={() => setMandateType("skip")}
                  className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                    mandateType === "skip"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      mandateType === "skip" ? "bg-primary text-white" : "bg-muted/10"
                    }`}>
                      <ArrowRight className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">Skip for Now</h3>
                      <p className="text-sm text-muted mt-1">
                        Set up payment method later. You won&apos;t be able to use auto-debit features until you do.
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      mandateType === "skip" ? "border-primary bg-primary" : "border-muted"
                    }`}>
                      {mandateType === "skip" && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </button>
              </div>

              {/* Continue Button for Step 7 */}
              <div className="pt-6">
                <button
                  onClick={handleMandateSetup}
                  disabled={!mandateType || isSettingUpMandate}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-4 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {isSettingUpMandate ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Setting up...
                    </>
                  ) : mandateType === "skip" ? (
                    <>
                      Continue to Dashboard
                      <ArrowRight className="w-5 h-5" />
                    </>
                  ) : mandateType === "card" ? (
                    <>
                      Continue to Payment
                      <ExternalLink className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      Set Up Direct Debit
                      <ExternalLink className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          {currentStep < 7 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-muted hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 6 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || totalAllocation !== 100}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Activate My Rules
                    <Check className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
