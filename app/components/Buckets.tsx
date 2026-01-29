import {
  PiggyBank,
  Home,
  TrendingUp,
  CreditCard,
  Receipt,
  Building,
  Wallet,
  Shield,
} from "lucide-react";

const buckets = [
  {
    icon: PiggyBank,
    name: "Savings",
    description:
      "Build your emergency fund and reach savings goals automatically with our partner savings providers.",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    available: true,
  },
  {
    icon: TrendingUp,
    name: "Investments",
    description:
      "Grow your wealth with Money Market Funds, stocks, and other investment vehicles from trusted partners.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    borderColor: "border-secondary/30",
    available: true,
  },
  {
    icon: Home,
    name: "Rent",
    description:
      "Never miss rent again. Accumulate payments gradually and send directly to your landlord or escrow.",
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/30",
    available: true,
  },
  {
    icon: CreditCard,
    name: "Loans",
    description:
      "Automate loan repayments. Set it and forget it – Kore ensures your installments are always on time.",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    available: true,
  },
  {
    icon: Receipt,
    name: "Tax",
    description:
      "Plan ahead for PAYE or self-assessed taxes. Kore estimates and sets aside your tax obligations.",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    available: true,
  },
  {
    icon: Wallet,
    name: "Subscriptions",
    description:
      "Pay for electricity, internet, cable TV, phone data, and more – all automated through Kore.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    available: true,
  },
  {
    icon: Building,
    name: "Pensions",
    description:
      "Secure your retirement. Contribute to your pension fund automatically every month.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    available: false,
  },
  {
    icon: Shield,
    name: "Insurance",
    description:
      "Stay protected. Automate your insurance premium payments for health, life, and property.",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30",
    available: false,
  },
];

export default function Buckets() {
  return (
    <section id="buckets" className="py-20 md:py-28 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-accent bg-accent/10 px-4 py-1.5 rounded-full mb-4">
            Financial Buckets
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            One Account, Multiple Goals
          </h2>
          <p className="text-lg text-muted">
            Split your income across different financial buckets. Each bucket
            has its own rules, partners, and purpose.
          </p>
        </div>

        {/* Buckets Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {buckets.map((bucket, index) => (
            <div
              key={index}
              className={`relative bg-background border ${bucket.borderColor} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group ${!bucket.available ? "opacity-70" : ""}`}
            >
              {!bucket.available && (
                <span className="absolute top-3 right-3 text-xs font-medium text-muted bg-muted/10 px-2 py-1 rounded-full">
                  Coming Soon
                </span>
              )}
              <div
                className={`w-12 h-12 ${bucket.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <bucket.icon className={`w-6 h-6 ${bucket.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {bucket.name}
              </h3>
              <p className="text-sm text-muted">{bucket.description}</p>
            </div>
          ))}
        </div>

        {/* Allocation Preview */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-background border border-border rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-foreground mb-4 text-center">
              Example Monthly Allocation
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted w-24">Savings</span>
                <div className="flex-1 h-6 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full flex items-center justify-end pr-2"
                    style={{ width: "35%" }}
                  >
                    <span className="text-xs text-white font-medium">35%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted w-24">Investments</span>
                <div className="flex-1 h-6 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded-full flex items-center justify-end pr-2"
                    style={{ width: "25%" }}
                  >
                    <span className="text-xs text-white font-medium">25%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted w-24">Rent</span>
                <div className="flex-1 h-6 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full flex items-center justify-end pr-2"
                    style={{ width: "25%" }}
                  >
                    <span className="text-xs text-white font-medium">25%</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted w-24">Subscriptions</span>
                <div className="flex-1 h-6 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full flex items-center justify-end pr-2"
                    style={{ width: "15%" }}
                  >
                    <span className="text-xs text-white font-medium">15%</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted text-center mt-4">
              Your allocations must add up to 100%. Adjust anytime in your
              dashboard.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
