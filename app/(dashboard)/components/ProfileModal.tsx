"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, User, Building2, ChevronRight, Check, AlertCircle, Loader2 } from "lucide-react";
import { useAuthStore, UserProfile } from "@/app/store/auth";
import { useBanks } from "@/app/lib/hooks";
import { profileApi, type ApiError } from "@/app/lib/api";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Form data structure (frontend format)
interface ProfileFormData {
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

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const router = useRouter();
  const { user, completeProfile, updateUser } = useAuthStore();
  const { banks, isLoading: banksLoading, error: banksError, refresh: refreshBanks } = useBanks();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "success" | "failed">("idle");
  
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    surname: "",
    dob: "",
    gender: "",
    phone: "",
    bvn: "",
    bankName: "",
    bankCode: "",
    accountNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Parse user name into first name and surname on mount
  useEffect(() => {
    if (user?.name) {
      const nameParts = user.name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const surname = nameParts.slice(1).join(" ") || "";
      setFormData(prev => ({ ...prev, firstName, surname }));
    }
  }, [user?.name]);

  if (!isOpen) return null;

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.surname.trim()) newErrors.surname = "Surname is required";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^0[789]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid Nigerian phone number";
    }
    if (!formData.bvn) {
      newErrors.bvn = "BVN is required";
    } else if (!/^\d{11}$/.test(formData.bvn)) {
      newErrors.bvn = "BVN must be 11 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankName) newErrors.bankName = "Select a bank";
    if (!formData.accountNumber) {
      newErrors.accountNumber = "Account number is required";
    } else if (!/^\d{10}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = "Account number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBankChange = (bankName: string) => {
    const selectedBank = banks.find(b => b.name === bankName);
    setFormData({
      ...formData,
      bankName,
      bankCode: selectedBank?.code || "",
    });
  };

  const handleNext = async () => {
    if (!validateStep1()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      // Save personal info to backend (draft)
      await profileApi.updatePersonalInfo({
        first_name: formData.firstName,
        surname: formData.surname,
        phone_number: formData.phone,
        date_of_birth: formData.dob,
        gender: formData.gender === "male" ? "M" : formData.gender === "female" ? "F" : "O",
      });
      
      setStep(2);
    } catch (err) {
      const error = err as ApiError;
      setApiError(error.message || "Failed to save personal information");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsSubmitting(true);
    setApiError(null);
    setVerificationStatus("verifying");

    try {
      // Save bank info to backend (draft)
      await profileApi.updateBankInfo({
        account_number: formData.accountNumber,
        bank_name: formData.bankName,
        bank_code: formData.bankCode,
        bvn: formData.bvn,
      });

      // Submit for verification with OnePipe
      const result = await profileApi.submitProfile();

      if (result.status === "verified") {
        setVerificationStatus("success");
        
        // Update local state
        const profile: UserProfile = {
          firstName: formData.firstName,
          surname: formData.surname,
          dob: formData.dob,
          gender: formData.gender,
          phone: formData.phone,
          bvn: "", // Don't store locally
          bankName: formData.bankName,
          bankCode: formData.bankCode,
          accountNumber: "", // Don't store locally
        };
        
        completeProfile(profile);
        updateUser({ profileComplete: true });
        
        // Redirect to onboarding after short delay
        setTimeout(() => {
          router.push("/dashboard/onboarding");
          onClose();
        }, 1500);
      } else {
        setVerificationStatus("failed");
        setApiError(result.message || "Bank verification failed. Please check your details.");
      }
    } catch (err) {
      const error = err as ApiError;
      setVerificationStatus("failed");
      setApiError(error.message || "Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">Complete Your Profile</h2>
            <p className="text-sm text-muted mt-1">
              Step {step} of 2: {step === 1 ? "Personal Information" : "Bank Information"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted hover:text-foreground hover:bg-card rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? "bg-primary" : "bg-border"}`} />
            <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? "bg-primary" : "bg-border"}`} />
          </div>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-500 text-sm">{apiError}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-5">
          {step === 1 ? (
            <>
              {/* Step 1: Personal Info */}
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{user?.name}</p>
                  <p className="text-sm text-muted">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="John"
                    className={`w-full px-4 py-3 bg-background border ${errors.firstName ? "border-red-500" : "border-border"} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50`}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Surname
                  </label>
                  <input
                    type="text"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    placeholder="Doe"
                    className={`w-full px-4 py-3 bg-background border ${errors.surname ? "border-red-500" : "border-border"} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50`}
                  />
                  {errors.surname && <p className="text-red-500 text-xs mt-1">{errors.surname}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className={`w-full px-4 py-3 bg-background border ${errors.dob ? "border-red-500" : "border-border"} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50`}
                  />
                  {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className={`w-full px-4 py-3 bg-background border ${errors.gender ? "border-red-500" : "border-border"} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50`}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="08012345678"
                  className={`w-full px-4 py-3 bg-background border ${errors.phone ? "border-red-500" : "border-border"} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50`}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  BVN (Bank Verification Number)
                </label>
                <input
                  type="text"
                  value={formData.bvn}
                  onChange={(e) => setFormData({ ...formData, bvn: e.target.value.replace(/\D/g, "").slice(0, 11) })}
                  placeholder="12345678901"
                  className={`w-full px-4 py-3 bg-background border ${errors.bvn ? "border-red-500" : "border-border"} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50`}
                />
                {errors.bvn && <p className="text-red-500 text-xs mt-1">{errors.bvn}</p>}
                <p className="text-xs text-muted mt-1">Your BVN is required for identity verification</p>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Bank Info */}
              <div className="flex items-center gap-3 p-3 bg-secondary/5 rounded-xl">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Bank Account</p>
                  <p className="text-sm text-muted">This account will be used for debits</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bank Name
                </label>
                {/* Banks list endpoint: https://koreapi.onrender.com/api/banks/ */}
                <select
                  value={formData.bankName}
                  onChange={(e) => handleBankChange(e.target.value)}
                  disabled={banksLoading}
                  className={`w-full px-4 py-3 bg-background border ${errors.bankName ? "border-red-500" : "border-border"} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50`}
                >
                  <option value="">{banksLoading ? "Loading banks..." : "Select your bank"}</option>
                  {banks.map((bank) => (
                    <option key={bank.code} value={bank.name}>
                      {bank.name}
                    </option>
                  ))}
                </select>
                {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
                {banksError && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-500">
                    <p>Failed to load banks.</p>
                    <button
                      onClick={refreshBanks}
                      className="underline text-red-500 hover:text-red-700"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  placeholder="0123456789"
                  className={`w-full px-4 py-3 bg-background border ${errors.accountNumber ? "border-red-500" : "border-border"} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50`}
                />
                {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
              </div>

              {/* Verification Status */}
              {verificationStatus === "verifying" && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex items-center gap-2 text-primary">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-medium">Verifying your bank account...</span>
                  </div>
                  <p className="text-sm text-muted mt-1">
                    This may take a few seconds
                  </p>
                </div>
              )}

              {verificationStatus === "success" && (
                <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-xl">
                  <div className="flex items-center gap-2 text-secondary">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Account Verified Successfully!</span>
                  </div>
                  <p className="text-sm text-muted mt-1">
                    Redirecting to onboarding...
                  </p>
                </div>
              )}

              {verificationStatus === "failed" && (
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Verification Failed</span>
                  </div>
                  <p className="text-sm text-muted mt-1">
                    Please check your details and try again
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-card/50">
          {step === 2 ? (
            <button
              onClick={() => {
                setStep(1);
                setVerificationStatus("idle");
                setApiError(null);
              }}
              disabled={isSubmitting || verificationStatus === "success"}
              className="px-6 py-2.5 text-muted hover:text-foreground font-medium transition-colors disabled:opacity-50"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step === 1 ? (
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || verificationStatus === "success"}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Verify & Complete
                  <Check className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
