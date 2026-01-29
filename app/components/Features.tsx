import {
  Zap,
  Shield,
  Brain,
  Repeat,
  Bell,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Automation",
    description:
      "Set your rules once and let Kore handle the rest. Automatic deductions, payments, and allocations.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Shield,
    title: "Non-Custodial",
    description:
      "We never hold your money. Funds flow directly to your savings, investments, and payment destinations.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: Brain,
    title: "Smart Rules Engine",
    description:
      "Percentage-based, fixed amount, or threshold-based rules. You decide how your money moves.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Repeat,
    title: "Flexible Scheduling",
    description:
      "Daily, weekly, monthly, or balance-triggered. Kore adapts to your income patterns.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    description:
      "Stay informed with instant updates on every transaction and allocation made on your behalf.",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    icon: Lock,
    title: "Bank-Level Security",
    description:
      "AES-256 encryption, secure mandates, and full audit trails. Your financial data is protected.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
            Why Kore?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Financial Automation, Reimagined
          </h2>
          <p className="text-lg text-muted">
            Whether you earn a steady salary or variable income, Kore adapts to
            your financial life and automates everything.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-background border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
            >
              <div
                className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
