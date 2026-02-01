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
  AlertCircle,
  PiggyBank,
  ShoppingBag,
  Shield,
  Receipt,
  Loader2,
  ExternalLink,
  FileCheck,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/app/store/auth";
import {
  useRulesStore,
  DebitFrequency,
  BucketAllocation,
} from "@/app/store/rules";
import { useMandateStore } from "@/app/store/mandate";

const TOTAL_STEPS = 6;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { createRule, onboardingComplete, isLoading, error } = useRulesStore();
  const { 
    mandate, 
    createMandate, 
    startPolling, 
    isPolling,
    hasActiveMandate,
    needsActivation,
  } = useMandateStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [mandateCreated, setMandateCreated] = useState(false);

  // Form state - aligned with backend API
  const [monthlyMaxDebit, setMonthlyMaxDebit] = useState<string>("");
  const [singleMaxDebit, setSingleMaxDebit] = useState<string>("");
  const [frequency, setFrequency] = useState<DebitFrequency>("MONTHLY");
  const [amountPerFrequency, setAmountPerFrequency] = useState<string>("");
  const [failureAction, setFailureAction] = useState<"RETRY" | "SKIP" | "NOTIFY">("NOTIFY");
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>("");
  const [bucketAllocation, setBucketAllocation] = useState<BucketAllocation>({
    savings: 50,
    investments: 30,
    spending: 10,
    emergency: 10,
    bills: 0,
  });

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
      case 1: // Debit Limits
        if (!monthlyMaxDebit || parseFloat(monthlyMaxDebit) <= 0) {
          newErrors.monthlyMaxDebit = "Enter a valid monthly limit";
        }
        if (!singleMaxDebit || parseFloat(singleMaxDebit) <= 0) {
          newErrors.singleMaxDebit = "Enter a valid single transaction limit";
        }
        if (parseFloat(singleMaxDebit) > parseFloat(monthlyMaxDebit)) {
          newErrors.singleMaxDebit = "Single limit cannot exceed monthly limit";
        }
        break;

      case 2: // Frequency & Amount
        if (!frequency) {
          newErrors.frequency = "Select a debit frequency";
        }
        if (!amountPerFrequency || parseFloat(amountPerFrequency) <= 0) {
          newErrors.amountPerFrequency = "Enter a valid amount";
        }
        if (parseFloat(amountPerFrequency) > parseFloat(singleMaxDebit)) {
          newErrors.amountPerFrequency = "Amount cannot exceed single transaction limit";
        }
        break;

      case 3: // Bucket Allocation
        if (totalAllocation !== 100) {
          newErrors.bucketAllocation = `Allocation must equal 100% (currently ${totalAllocation}%)`;
        }
        break;

      case 4: // Failure Handling
        if (!failureAction) {
          newErrors.failureAction = "Select what happens if a debit fails";
        }
        break;

      case 5: // Date Range
        if (!startDate) {
          newErrors.startDate = "Select a start date";
        }
        if (endDate && new Date(endDate) <= new Date(startDate)) {
          newErrors.endDate = "End date must be after start date";
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
    setApiError(null);

    try {
      await createRule({
        monthlyMaxDebit: parseFloat(monthlyMaxDebit),
        singleMaxDebit: parseFloat(singleMaxDebit),
        frequency,
        amountPerFrequency: parseFloat(amountPerFrequency),
        bucketAllocation,
        failureAction,
        startDate,
        endDate: endDate || null,
      });
      
      // Move to mandate creation step
      setCurrentStep(6);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save rules";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMandate = async () => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      await createMandate();
      setMandateCreated(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create mandate";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefreshMandateStatus = async () => {
    try {
      await startPolling(3000, 20);
      // If mandate is now active, redirect to dashboard
      if (hasActiveMandate()) {
        router.push("/dashboard");
      }
    } catch {
      // Error handled in store
    }
  };

  const handleSkipMandate = () => {
    router.push("/dashboard");
  };

  const handleFinish = () => {
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
            <span>Step {currentStep} of {TOTAL_STEPS}</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i < currentStep ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
          
          {/* API Error */}
          {apiError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-500 text-sm">{apiError}</p>
            </div>
          )}

          {/* Step 1: Debit Limits */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Set your debit limits</h2>
                  <p className="text-muted">Control how much we can debit from your account</p>
                </div>
              </div>

              {/* Monthly Max Debit */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Maximum total amount per month
                </label>
                <p className="text-sm text-muted mb-3">
                  What is the maximum total amount we are allowed to debit from your account per month?
                </p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">₦</span>
                  <input
                    type="number"
                    value={monthlyMaxDebit}
                    onChange={(e) => setMonthlyMaxDebit(e.target.value)}
                    placeholder="e.g. 100,000"
                    className="w-full pl-8 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                {errors.monthlyMaxDebit && (
                  <p className="text-red-500 text-sm mt-1">{errors.monthlyMaxDebit}</p>
                )}
              </div>

              {/* Single Max Debit */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Maximum per transaction
                </label>
                <p className="text-sm text-muted mb-3">
                  What is the maximum amount we can debit in a single transaction?
                </p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">₦</span>
                  <input
                    type="number"
                    value={singleMaxDebit}
                    onChange={(e) => setSingleMaxDebit(e.target.value)}
                    placeholder="e.g. 50,000"
                    className="w-full pl-8 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                {errors.singleMaxDebit && (
                  <p className="text-red-500 text-sm mt-1">{errors.singleMaxDebit}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Frequency & Amount */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Debit frequency</h2>
                  <p className="text-muted">How often should we debit your account?</p>
                </div>
              </div>

              {/* Frequency Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Select frequency
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { value: "DAILY", label: "Daily", desc: "Every day" },
                    { value: "WEEKLY", label: "Weekly", desc: "Once a week" },
                    { value: "MONTHLY", label: "Monthly", desc: "Once a month" },
                    { value: "CUSTOM", label: "Custom", desc: "Custom schedule" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFrequency(option.value as DebitFrequency)}
                      className={`p-4 border rounded-xl text-left transition-all ${
                        frequency === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="text-sm text-muted">{option.desc}</p>
                    </button>
                  ))}
                </div>
                {errors.frequency && (
                  <p className="text-red-500 text-sm mt-1">{errors.frequency}</p>
                )}
              </div>

              {/* Amount Per Frequency */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Amount per {frequency.toLowerCase()} debit
                </label>
                <p className="text-sm text-muted mb-3">
                  How much should we debit during each {frequency.toLowerCase()} cycle?
                </p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">₦</span>
                  <input
                    type="number"
                    value={amountPerFrequency}
                    onChange={(e) => setAmountPerFrequency(e.target.value)}
                    placeholder={`e.g. ${frequency === "DAILY" ? "2,000" : frequency === "WEEKLY" ? "10,000" : "50,000"}`}
                    className="w-full pl-8 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                {errors.amountPerFrequency && (
                  <p className="text-red-500 text-sm mt-1">{errors.amountPerFrequency}</p>
                )}
                {amountPerFrequency && (
                  <p className="text-sm text-muted mt-2">
                    That&apos;s {formatCurrency(parseFloat(amountPerFrequency) || 0)} per {frequency.toLowerCase()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Bucket Allocation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Allocate your buckets</h2>
                  <p className="text-muted">Split your debits across financial goals (must equal 100%)</p>
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
                  { key: "savings", label: "Savings", icon: PiggyBank, color: "bg-primary", desc: "Emergency fund & short-term goals" },
                  { key: "investments", label: "Investments", icon: TrendingUp, color: "bg-secondary", desc: "Stocks, funds & long-term growth" },
                  { key: "spending", label: "Spending", icon: ShoppingBag, color: "bg-purple-500", desc: "Discretionary & lifestyle" },
                  { key: "emergency", label: "Emergency Fund", icon: Shield, color: "bg-orange-500", desc: "6 months expenses reserve" },
                  { key: "bills", label: "Bills", icon: Receipt, color: "bg-blue-500", desc: "Recurring payments & utilities" },
                ].map((bucket) => (
                  <div key={bucket.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 ${bucket.color} rounded-lg flex items-center justify-center`}>
                          <bucket.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <span className="font-medium text-foreground">{bucket.label}</span>
                          <p className="text-xs text-muted">{bucket.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">
                          {bucketAllocation[bucket.key as keyof BucketAllocation]}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateBucket(
                            bucket.key as keyof BucketAllocation,
                            bucketAllocation[bucket.key as keyof BucketAllocation] - 5
                          )
                        }
                        className="w-10 h-10 rounded-lg border border-border hover:bg-muted/10 flex items-center justify-center text-lg font-medium"
                      >
                        -
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={bucketAllocation[bucket.key as keyof BucketAllocation]}
                        onChange={(e) =>
                          updateBucket(bucket.key as keyof BucketAllocation, parseInt(e.target.value))
                        }
                        className="flex-1 h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                      />
                      <button
                        onClick={() =>
                          updateBucket(
                            bucket.key as keyof BucketAllocation,
                            bucketAllocation[bucket.key as keyof BucketAllocation] + 5
                          )
                        }
                        className="w-10 h-10 rounded-lg border border-border hover:bg-muted/10 flex items-center justify-center text-lg font-medium"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {errors.bucketAllocation && (
                <p className="text-red-500 text-sm">{errors.bucketAllocation}</p>
              )}
            </div>
          )}

          {/* Step 4: Failure Handling */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">If a debit fails</h2>
                  <p className="text-muted">What should happen if a scheduled debit fails?</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    value: "RETRY",
                    label: "Retry Later",
                    desc: "We'll try again later when funds are available",
                  },
                  {
                    value: "SKIP",
                    label: "Skip & Continue",
                    desc: "Skip this cycle and continue with the next scheduled debit",
                  },
                  {
                    value: "NOTIFY",
                    label: "Notify Only",
                    desc: "Just send me a notification, I'll handle it manually",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFailureAction(option.value as "RETRY" | "SKIP" | "NOTIFY")}
                    className={`w-full p-4 border rounded-xl text-left transition-all ${
                      failureAction === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{option.label}</p>
                        <p className="text-sm text-muted mt-1">{option.desc}</p>
                      </div>
                      {failureAction === option.value && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Date Range */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Schedule dates</h2>
                  <p className="text-muted">When should we start and stop pulling funds?</p>
                </div>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Date
                </label>
                <p className="text-sm text-muted mb-3">
                  When should we start pulling funds from your account?
                </p>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                )}
              </div>

              {/* End Date (Optional) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  End Date <span className="text-muted font-normal">(optional)</span>
                </label>
                <p className="text-sm text-muted mb-3">
                  When should we stop? Leave empty for no end date.
                </p>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                )}
              </div>

              {/* Summary */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-2">
                <h3 className="font-medium text-foreground">Summary</h3>
                <ul className="text-sm text-muted space-y-1">
                  <li>• Monthly limit: {formatCurrency(parseFloat(monthlyMaxDebit) || 0)}</li>
                  <li>• Per transaction: {formatCurrency(parseFloat(singleMaxDebit) || 0)}</li>
                  <li>• Frequency: {frequency.charAt(0) + frequency.slice(1).toLowerCase()}</li>
                  <li>• Amount: {formatCurrency(parseFloat(amountPerFrequency) || 0)} per {frequency.toLowerCase()}</li>
                  <li>• Starting: {new Date(startDate).toLocaleDateString()}</li>
                  {endDate && <li>• Ending: {new Date(endDate).toLocaleDateString()}</li>}
                </ul>
              </div>
            </div>
          )}

          {/* Step 6: Mandate Setup */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Authorize Direct Debit</h2>
                  <p className="text-muted">Set up automatic debit from your bank account</p>
                </div>
              </div>

              {/* Rules saved successfully */}
              <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="font-medium text-foreground">Savings rules saved!</p>
                    <p className="text-sm text-muted">Now authorize automatic debits from your account.</p>
                  </div>
                </div>
              </div>

              {/* API Error */}
              {apiError && (
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-500">{apiError}</p>
                  </div>
                </div>
              )}

              {/* Mandate not created yet */}
              {!mandateCreated && !mandate && (
                <div className="space-y-4">
                  <div className="p-6 bg-background border border-border rounded-xl text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Create Direct Debit Mandate</h3>
                    <p className="text-muted text-sm mb-6 max-w-md mx-auto">
                      This authorizes Kore to automatically debit your bank account according to your 
                      savings rules. You&apos;ll be redirected to your bank to confirm.
                    </p>
                    <button
                      onClick={handleCreateMandate}
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <FileCheck className="w-4 h-4" />
                          Create Mandate
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handleSkipMandate}
                    className="w-full text-center text-muted hover:text-foreground text-sm py-2"
                  >
                    Skip for now - I&apos;ll do this later
                  </button>
                </div>
              )}

              {/* Mandate created - pending activation */}
              {(mandateCreated || mandate) && mandate?.status === "PENDING" && mandate?.activation_url && (
                <div className="space-y-4">
                  <div className="p-6 bg-accent/5 border border-accent/20 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                        <ExternalLink className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Complete Bank Authorization</h3>
                        <p className="text-muted text-sm mb-4">
                          Click the button below to authorize the direct debit on your bank&apos;s platform. 
                          Once complete, return here and click &quot;Refresh Status&quot;.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <a
                            href={mandate.activation_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open Bank Portal
                          </a>
                          <button
                            onClick={handleRefreshMandateStatus}
                            disabled={isPolling}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-xl font-medium text-foreground hover:bg-muted/10 transition-colors disabled:opacity-50"
                          >
                            {isPolling ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Checking...
                              </>
                            ) : (
                              "Refresh Status"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleFinish}
                    className="w-full text-center text-muted hover:text-foreground text-sm py-2"
                  >
                    I&apos;ll complete activation later
                  </button>
                </div>
              )}

              {/* Mandate is active */}
              {mandate?.status === "ACTIVE" && (
                <div className="space-y-4">
                  <div className="p-6 bg-secondary/5 border border-secondary/20 rounded-xl text-center">
                    <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-secondary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Mandate Activated!</h3>
                    <p className="text-muted text-sm mb-6">
                      Your direct debit is now active. Kore will automatically save money 
                      according to your rules.
                    </p>
                    <button
                      onClick={handleFinish}
                      className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              )}

              {/* Mandate failed */}
              {mandate?.status === "FAILED" && (
                <div className="space-y-4">
                  <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center shrink-0">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">Mandate Creation Failed</h3>
                        <p className="text-muted text-sm mb-4">
                          We couldn&apos;t create your direct debit mandate. This might be due to a 
                          temporary issue with your bank.
                        </p>
                        <button
                          onClick={handleCreateMandate}
                          disabled={isSubmitting}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Retrying...
                            </>
                          ) : (
                            "Try Again"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSkipMandate}
                    className="w-full text-center text-muted hover:text-foreground text-sm py-2"
                  >
                    Skip for now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 6 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              {currentStep > 1 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-2 text-muted hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || totalAllocation !== 100}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      Save & Continue
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
