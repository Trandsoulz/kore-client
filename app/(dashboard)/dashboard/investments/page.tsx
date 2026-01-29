"use client";

import { useState } from "react";
import Image from "next/image";
import {
  TrendingUp,
  Plus,
  Check,
  ExternalLink,
  Info,
  X,
  BarChart3,
  Shield,
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
    <div className={`${sizeClasses[size]} rounded-xl bg-secondary/10 flex items-center justify-center overflow-hidden shrink-0`}>
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

const riskLabels = {
  conservative: { label: "Low Risk", color: "text-secondary", bg: "bg-secondary/10" },
  moderate: { label: "Medium Risk", color: "text-primary", bg: "bg-primary/10" },
  aggressive: { label: "High Risk", color: "text-accent", bg: "bg-accent/10" },
};

export default function InvestmentsPage() {
  const { rules } = useRulesStore();
  const { partners, connectPartner, disconnectPartner } = usePartnersStore();
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const investmentPartners = partners.filter((p) => p.type === "investments");
  const connectedPartners = investmentPartners.filter((p) => p.connected);

  const monthlyAllocation = rules
    ? (rules.monthlyAmount * rules.bucketAllocation.investments) / 100
    : 0;

  const riskProfile = rules?.riskTolerance || "moderate";

  const handleConnect = async (partner: Partner) => {
    setIsConnecting(true);
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
          <h1 className="text-2xl font-bold text-foreground">Investments</h1>
          <p className="text-muted mt-1">
            Grow your wealth with automated investments
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${riskLabels[riskProfile].bg} px-3 py-1.5 rounded-lg`}>
            <Shield className={`w-4 h-4 ${riskLabels[riskProfile].color}`} />
            <span className={`text-sm font-medium ${riskLabels[riskProfile].color}`}>
              {riskLabels[riskProfile].label}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-xl">
            <TrendingUp className="w-5 h-5 text-secondary" />
            <span className="text-sm text-muted">Monthly:</span>
            <span className="font-semibold text-secondary">
              {formatCurrency(monthlyAllocation)}
            </span>
            <span className="text-xs text-muted">
              ({rules?.bucketAllocation.investments || 0}%)
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-muted mb-1">Portfolio Value</p>
          <p className="text-2xl font-bold text-foreground">₦0.00</p>
          <p className="text-xs text-secondary mt-2">+0% all time</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-muted mb-1">Connected Partners</p>
          <p className="text-2xl font-bold text-foreground">{connectedPartners.length}</p>
          <p className="text-xs text-muted mt-2">of {investmentPartners.length} available</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-sm text-muted mb-1">Estimated Returns</p>
          <p className="text-2xl font-bold text-foreground">--</p>
          <p className="text-xs text-muted mt-2">Connect a partner to see projection</p>
        </div>
      </div>

      {/* Risk Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 ${riskLabels[riskProfile].bg} rounded-xl flex items-center justify-center`}>
            <BarChart3 className={`w-6 h-6 ${riskLabels[riskProfile].color}`} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Your Investment Profile</h3>
            <p className="text-sm text-muted">Based on your risk tolerance assessment</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-background rounded-xl">
            <p className="text-muted mb-1">Risk Level</p>
            <p className={`font-semibold capitalize ${riskLabels[riskProfile].color}`}>
              {riskProfile}
            </p>
          </div>
          <div className="p-4 bg-background rounded-xl">
            <p className="text-muted mb-1">Recommended</p>
            <p className="font-semibold text-foreground">
              {riskProfile === "conservative" && "Money Market Funds"}
              {riskProfile === "moderate" && "Balanced Funds"}
              {riskProfile === "aggressive" && "Equity Funds"}
            </p>
          </div>
          <div className="p-4 bg-background rounded-xl">
            <p className="text-muted mb-1">Expected Returns</p>
            <p className="font-semibold text-secondary">
              {riskProfile === "conservative" && "8-12% p.a."}
              {riskProfile === "moderate" && "12-18% p.a."}
              {riskProfile === "aggressive" && "15-30%+ p.a."}
            </p>
          </div>
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
                    <PartnerLogo partner={partner} />
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
                  <span className="text-muted">Invested</span>
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
          {connectedPartners.length > 0 ? "Add More Partners" : "Choose an Investment Partner"}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {investmentPartners
            .filter((p) => !p.connected)
            .map((partner) => (
              <div
                key={partner.id}
                className="bg-card border border-border rounded-2xl p-5 hover:border-secondary/30 transition-colors flex flex-col"
              >
                <div className="flex items-start gap-3 mb-3">
                  <PartnerLogo partner={partner} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{partner.name}</h3>
                    <p className="text-sm text-muted mt-1 h-10 line-clamp-2">{partner.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {partner.features.slice(0, 3).map((feature, i) => (
                    <span
                      key={i}
                      className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

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
                  className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-white py-2.5 rounded-xl font-medium transition-colors mt-auto"
                >
                  <Plus className="w-4 h-4" />
                  Connect
                </button>
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
                    Link your account to start investing
                  </p>
                </div>
              </div>

              <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-foreground font-medium mb-1">
                      What happens when you connect:
                    </p>
                    <ul className="text-muted space-y-1">
                      <li>• Kore will invest {formatCurrency(monthlyAllocation)} via {selectedPartner.name}</li>
                      <li>• Investments are made based on your schedule</li>
                      <li>• Returns: {selectedPartner.returns}</li>
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
                  className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
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
