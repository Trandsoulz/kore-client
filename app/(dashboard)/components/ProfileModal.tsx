"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, User, Building2, ChevronRight, Check } from "lucide-react";
import { useAuthStore, UserProfile } from "@/app/store/auth";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const nigerianBanks = [
  "Access Bank",
  "First Bank",
  "GTBank",
  "UBA",
  "Zenith Bank",
  "Stanbic IBTC",
  "Fidelity Bank",
  "Union Bank",
  "Sterling Bank",
  "Wema Bank",
  "Polaris Bank",
  "Keystone Bank",
  "FCMB",
  "Ecobank",
  "Citibank",
];

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const router = useRouter();
  const { user, completeProfile } = useAuthStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    dob: "",
    gender: "",
    phone: "",
    address: "",
    bvn: "",
    bankName: "",
    accountNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^0[789]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid Nigerian phone number";
    }
    if (!formData.address) newErrors.address = "Address is required";
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

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    completeProfile(formData);
    setIsSubmitting(false);
    
    // Redirect to onboarding (rules engine) first, then close modal
    router.push("/dashboard/onboarding");
    
    // Small delay to ensure navigation starts before modal closes
    setTimeout(() => {
      onClose();
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
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
                  Residential Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main Street, Lagos"
                  className={`w-full px-4 py-3 bg-background border ${errors.address ? "border-red-500" : "border-border"} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50`}
                />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
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
                <select
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className={`w-full px-4 py-3 bg-background border ${errors.bankName ? "border-red-500" : "border-border"} rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50`}
                >
                  <option value="">Select your bank</option>
                  {nigerianBanks.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
                {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
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

              {formData.bankName && formData.accountNumber.length === 10 && (
                <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-xl">
                  <div className="flex items-center gap-2 text-secondary">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Account Verified</span>
                  </div>
                  <p className="text-sm text-muted mt-1">
                    {user?.name?.toUpperCase()} - {formData.bankName}
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
              onClick={() => setStep(1)}
              className="px-6 py-2.5 text-muted hover:text-foreground font-medium transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step === 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold transition-colors"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Complete Setup
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
