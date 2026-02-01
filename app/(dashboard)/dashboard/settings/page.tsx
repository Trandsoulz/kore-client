"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  User,
  CreditCard,
  Bell,
  Shield,
  Sliders,
  Link as LinkIcon,
  HelpCircle,
  LogOut,
  ChevronRight,
  Check,
  Edit2,
  Plus,
  Trash2,
  AlertTriangle,
  Smartphone,
  Mail,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/app/store/auth";
import { useRulesStore } from "@/app/store/rules";
import { usePartnersStore } from "@/app/store/partners";

export default function SettingsPage() {
  const { user, logout, fetchProfile } = useAuthStore();
  const { rules, resetRules } = useRulesStore();
  const { partners } = usePartnersStore();
  const [activeSection, setActiveSection] = useState("profile");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Fetch profile from API on mount
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoadingProfile(true);
      await fetchProfile();
      setIsLoadingProfile(false);
    };
    loadProfile();
  }, [fetchProfile]);

  const profile = user?.profile;
  const connectedPartners = partners.filter((p) => p.connected);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const sections = [
    { id: "profile", label: "Profile", icon: User },
    { id: "bank", label: "Bank Accounts", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "rules", label: "Rules & Allocation", icon: Sliders },
    { id: "partners", label: "Connected Partners", icon: LinkIcon },
    { id: "security", label: "Security", icon: Shield },
    { id: "help", label: "Help & Support", icon: HelpCircle },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 shrink-0">
          <nav className="bg-card border border-border rounded-2xl p-2 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeSection === section.id
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-muted/10"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
            <hr className="border-border my-2" />
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Log Out</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Profile Section */}
          {activeSection === "profile" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">
                    Personal Information
                  </h2>
                  <button className="flex items-center gap-2 text-primary text-sm font-medium hover:underline">
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                </div>

                {isLoadingProfile ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                        {user?.name?.charAt(0) || profile?.firstName?.charAt(0) || "U"}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">
                          {profile?.firstName && profile?.surname 
                            ? `${profile.firstName} ${profile.surname}` 
                            : user?.name || "User"}
                        </h3>
                        <p className="text-muted">{user?.email || "user@example.com"}</p>
                        {user?.profileComplete && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-secondary/10 text-secondary text-xs font-medium rounded-full">
                            <Check className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-background rounded-xl">
                        <p className="text-sm text-muted mb-1">Full Name</p>
                        <p className="font-medium text-foreground">
                          {profile?.firstName && profile?.surname 
                            ? `${profile.firstName} ${profile.surname}` 
                            : user?.name || "Not set"}
                        </p>
                      </div>
                      <div className="p-4 bg-background rounded-xl">
                        <p className="text-sm text-muted mb-1">Phone Number</p>
                        <p className="font-medium text-foreground">
                          {profile?.phone || "Not set"}
                        </p>
                      </div>
                      <div className="p-4 bg-background rounded-xl">
                        <p className="text-sm text-muted mb-1">Date of Birth</p>
                        <p className="font-medium text-foreground">
                          {profile?.dob || "Not set"}
                        </p>
                      </div>
                      <div className="p-4 bg-background rounded-xl">
                        <p className="text-sm text-muted mb-1">Profile Status</p>
                        <div className="flex items-center gap-2">
                          {user?.profileComplete ? (
                            <>
                              <Check className="w-4 h-4 text-secondary" />
                              <span className="font-medium text-secondary">Verified</span>
                            </>
                          ) : (
                            <span className="font-medium text-muted">Not verified</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Bank Accounts Section */}
          {activeSection === "bank" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Linked Bank Accounts
                    </h2>
                    <p className="text-sm text-muted mt-1">
                      Manage bank accounts for automated debits
                    </p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Account
                  </button>
                </div>

                <div className="space-y-3">
                  {profile?.bankName ? (
                    <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {profile.bankName}
                          </p>
                          <p className="text-sm text-muted">
                            ****{profile.accountNumber?.slice(-4)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full">
                          Primary
                        </span>
                        <button className="p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-muted mx-auto mb-3" />
                      <p className="text-muted">No bank account linked yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      id: "email",
                      label: "Email Notifications",
                      description: "Receive transaction alerts via email",
                      icon: Mail,
                      enabled: true,
                    },
                    {
                      id: "push",
                      label: "Push Notifications",
                      description: "Get instant updates on your phone",
                      icon: Smartphone,
                      enabled: true,
                    },
                    {
                      id: "sms",
                      label: "SMS Notifications",
                      description: "Receive text message alerts",
                      icon: MessageSquare,
                      enabled: false,
                    },
                  ].map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <div
                        key={notification.id}
                        className="flex items-center justify-between p-4 bg-background rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {notification.label}
                            </p>
                            <p className="text-sm text-muted">
                              {notification.description}
                            </p>
                          </div>
                        </div>
                        <button
                          className={`relative w-12 h-7 rounded-full transition-colors ${
                            notification.enabled ? "bg-primary" : "bg-muted/30"
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              notification.enabled
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Alert Types
                </h2>
                <div className="space-y-3">
                  {[
                    "Successful transactions",
                    "Failed transactions",
                    "Weekly summaries",
                    "Monthly reports",
                    "Partner updates",
                    "Security alerts",
                  ].map((alert) => (
                    <label
                      key={alert}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="text-foreground">{alert}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rules & Allocation Section */}
          {activeSection === "rules" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Debit Schedule
                    </h2>
                    <p className="text-sm text-muted mt-1">
                      When Kore debits your account
                    </p>
                  </div>
                  <button className="flex items-center gap-2 text-primary text-sm font-medium hover:underline">
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-background rounded-xl">
                    <p className="text-sm text-muted mb-1">Income Type</p>
                    <p className="font-medium text-foreground capitalize">
                      {rules?.incomeType || "Not set"}
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-xl">
                    <p className="text-sm text-muted mb-1">Monthly Amount</p>
                    <p className="font-medium text-foreground">
                      {rules?.monthlyAmount
                        ? formatCurrency(rules.monthlyAmount)
                        : "Not set"}
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-xl">
                    <p className="text-sm text-muted mb-1">Debit Frequency</p>
                    <p className="font-medium text-foreground capitalize">
                      {rules?.debitFrequency?.replace(/_/g, " ") || "Not set"}
                    </p>
                  </div>
                  <div className="p-4 bg-background rounded-xl">
                    <p className="text-sm text-muted mb-1">Preferred Debit Day</p>
                    <p className="font-medium text-foreground">
                      {rules?.preferredDebitDay || "Auto"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Bucket Allocation
                    </h2>
                    <p className="text-sm text-muted mt-1">
                      How your money is distributed
                    </p>
                  </div>
                  <button className="flex items-center gap-2 text-primary text-sm font-medium hover:underline">
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                </div>

                <div className="space-y-4">
                  {rules?.bucketAllocation &&
                    Object.entries(rules.bucketAllocation).map(([bucket, percentage]) => (
                      <div key={bucket} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground capitalize">
                            {bucket}
                          </span>
                          <span className="text-muted">{percentage}%</span>
                        </div>
                        <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              bucket === "savings"
                                ? "bg-primary"
                                : bucket === "investments"
                                ? "bg-secondary"
                                : bucket === "spending"
                                ? "bg-accent"
                                : "bg-muted"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Connected Partners Section */}
          {activeSection === "partners" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">
                  Connected Partners ({connectedPartners.length})
                </h2>

                {connectedPartners.length === 0 ? (
                  <div className="text-center py-8">
                    <LinkIcon className="w-12 h-12 text-muted mx-auto mb-3" />
                    <p className="text-muted">No partners connected yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {connectedPartners.map((partner) => (
                      <div
                        key={partner.id}
                        className="flex items-center justify-between p-4 bg-background rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-muted/10 flex items-center justify-center overflow-hidden">
                            <Image
                              src={partner.logo}
                              alt={partner.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-contain p-1"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {partner.name}
                            </p>
                            <p className="text-sm text-muted capitalize">
                              {partner.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full">
                            Connected
                          </span>
                          <ChevronRight className="w-5 h-5 text-muted" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">
                  Security Settings
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                    <div>
                      <p className="font-medium text-foreground">Password</p>
                      <p className="text-sm text-muted">
                        Last changed 30 days ago
                      </p>
                    </div>
                    <button className="px-4 py-2 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-card transition-colors">
                      Change
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-foreground">
                          Two-Factor Authentication
                        </p>
                        <p className="text-sm text-muted">
                          Add an extra layer of security
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors">
                      Enable
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background rounded-xl">
                    <div>
                      <p className="font-medium text-foreground">
                        Active Sessions
                      </p>
                      <p className="text-sm text-muted">
                        Manage your logged-in devices
                      </p>
                    </div>
                    <button className="px-4 py-2 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-card transition-colors">
                      View
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-500 mb-1">
                      Danger Zone
                    </h3>
                    <p className="text-sm text-muted mb-4">
                      Once you delete your account, there is no going back.
                      Please be certain.
                    </p>
                    <button className="px-4 py-2 border border-red-500 text-red-500 rounded-xl text-sm font-medium hover:bg-red-500/10 transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          {activeSection === "help" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-6">
                  Help & Support
                </h2>

                <div className="space-y-3">
                  {[
                    {
                      title: "FAQs",
                      description: "Find answers to common questions",
                    },
                    {
                      title: "Contact Support",
                      description: "Get help from our support team",
                    },
                    {
                      title: "Report a Bug",
                      description: "Help us improve Kore",
                    },
                    {
                      title: "Feature Request",
                      description: "Suggest new features",
                    },
                  ].map((item) => (
                    <button
                      key={item.title}
                      className="w-full flex items-center justify-between p-4 bg-background rounded-xl hover:bg-muted/10 transition-colors text-left"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="text-sm text-muted">{item.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Legal
                </h2>
                <div className="space-y-2">
                  <button className="text-primary hover:underline text-sm">
                    Terms of Service
                  </button>
                  <button className="block text-primary hover:underline text-sm">
                    Privacy Policy
                  </button>
                </div>
              </div>

              <div className="text-center text-sm text-muted">
                <p>Kore v1.0.0</p>
                <p className="mt-1">© 2026 Kore. All rights reserved.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="relative w-full max-w-sm bg-background border border-border rounded-2xl shadow-2xl p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Log Out?
              </h3>
              <p className="text-muted">
                Are you sure you want to log out of your account?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 border border-border rounded-xl font-medium text-foreground hover:bg-card transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetRules();
                  logout();
                  window.location.href = "/login";
                }}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
