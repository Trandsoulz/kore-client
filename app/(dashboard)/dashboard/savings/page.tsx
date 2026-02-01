"use client";

import { useState } from "react";
import Image from "next/image";
import {
  PiggyBank,
  Plus,
  Check,
  ExternalLink,
  TrendingUp,
  Info,
  X,
  Building2,
} from "lucide-react";
import { useRulesStore } from "@/app/store/rules";
import { usePartnersStore, Partner } from "@/app/store/partners";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value);
};

// Partner logo component with fallback
function PartnerLogo({ partner, size = "md" }: { partner: Partner; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  };

  return (
    <div className={`${sizeClasses[size]} rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0`}>
      <Image
        src={partner.logo}
        alt={partner.name}
        width={size === "lg" ? 56 : size === "md" ? 48 : 32}
        height={size === "lg" ? 56 : size === "md" ? 48 : 32}
        className="w-full h-full object-contain p-1"
      />
    </div>
  );
}

export default function SavingsPage() {
  const { rules } = useRulesStore();
  const { partners, connectPartner, disconnectPartner } = usePartnersStore();
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const savingsPartners = partners.filter((p) => p.type === "savings");
  const connectedPartners = savingsPartners.filter((p) => p.connected);
  
  const monthlyAllocation = rules?.amountPerFrequency && rules?.bucketAllocation?.savings
    ? (rules.amountPerFrequency * rules.bucketAllocation.savings) / 100
    : 0;

  const handleConnect = async (partner: Partner) => {
    setIsConnecting(true);
    // Simulate API connection
    await new Promise((resolve) => setTimeout(resolve, 1500));
    connectPartner(partner.id);
    setIsConnecting(false);
    setSelectedPartner(null);
  };

  const handleDisconnect = async (partnerId: string) => {
    disconnectPartner(partnerId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Savings</h1>
          <p className="text-muted mt-1">
            Manage your automated savings with trusted partners
          </p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-xl">
          <PiggyBank className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted">Monthly allocation:</span>
          <span className="font-semibold text-primary">
            {formatCurrency(monthlyAllocation)}
          </span>
          <span className="text-xs text-muted">
            ({rules?.bucketAllocation.savings || 0}%)
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-muted mb-1">Total Saved</p>
          <p className="text-2xl font-bold text-foreground">₦0.00</p>
          <p className="text-xs text-secondary mt-2">+0% this month</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-muted mb-1">Connected Partners</p>
          <p className="text-2xl font-bold text-foreground">{connectedPartners.length}</p>
          <p className="text-xs text-muted mt-2">of {savingsPartners.length} available</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-muted mb-1">Next Auto-save</p>
          <p className="text-2xl font-bold text-foreground">--</p>
          <p className="text-xs text-muted mt-2">Set up a partner to start</p>
        </div>
      </div>

      {/* Connected Partners */}
      {connectedPartners.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Connected Partners
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedPartners.map((partner) => (
              <div
                key={partner.id}
                className="bg-card border border-secondary/30 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <PartnerLogo partner={partner} size="md" />
                    <div>
                      <h3 className="font-semibold text-foreground">{partner.name}</h3>
                      <p className="text-xs text-secondary">Connected</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDisconnect(partner.id)}
                    className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Balance</span>
                  <span className="font-medium text-foreground">₦0.00</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted">Returns</span>
                  <span className="font-medium text-secondary">{partner.returns}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Partners */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {connectedPartners.length > 0 ? "Add More Partners" : "Choose a Savings Partner"}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savingsPartners
            .filter((p) => !p.connected)
            .map((partner) => (
              <div
                key={partner.id}
                className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors flex flex-col h-full"
              >
                {/* Header with logo and name */}
                <div className="flex items-center gap-3 mb-3">
                  <PartnerLogo partner={partner} size="md" />
                  <h3 className="font-semibold text-foreground">{partner.name}</h3>
                </div>

                {/* Description with fixed height */}
                <p className="text-sm text-muted h-12 line-clamp-2 mb-4">
                  {partner.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {partner.features.slice(0, 3).map((feature, i) => (
                    <span
                      key={i}
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Stats - pushed to bottom */}
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div>
                      <span className="text-muted">Min: </span>
                      <span className="text-foreground">{formatCurrency(partner.minAmount)}</span>
                    </div>
                    {partner.returns && (
                      <div className="flex items-center gap-1 text-secondary">
                        <TrendingUp className="w-4 h-4" />
                        <span>{partner.returns}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedPartner(partner)}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-2.5 rounded-xl font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Connect
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Connection Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isConnecting && setSelectedPartner(null)}
          />
          <div className="relative w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <PartnerLogo partner={selectedPartner} size="lg" />
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    Connect {selectedPartner.name}
                  </h3>
                  <p className="text-sm text-muted">
                    Link your account to automate savings
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-foreground font-medium mb-1">
                      What happens when you connect:
                    </p>
                    <ul className="text-muted space-y-1">
                      <li>• Kore will send {formatCurrency(monthlyAllocation)} to {selectedPartner.name}</li>
                      <li>• Funds are deposited based on your schedule</li>
                      <li>• You can disconnect anytime</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-medium text-foreground">Features</h4>
                {selectedPartner.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted">
                    <Check className="w-4 h-4 text-secondary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPartner(null)}
                  disabled={isConnecting}
                  className="flex-1 py-3 border border-border rounded-xl font-medium text-foreground hover:bg-card transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConnect(selectedPartner)}
                  disabled={isConnecting}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isConnecting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Connect Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
