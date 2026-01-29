import { UserPlus, Settings, CreditCard, Sparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up with your email or social login. Complete your profile with personal and bank information.",
    color: "bg-primary",
  },
  {
    number: "02",
    icon: Settings,
    title: "Set Your Rules",
    description:
      "Tell us how much to collect, when, and how to split it across savings, investments, rent, and more.",
    color: "bg-secondary",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Authorize Your Mandate",
    description:
      "Grant Kore permission to debit your account. You stay in control with spending limits and schedules.",
    color: "bg-accent",
  },
  {
    number: "04",
    icon: Sparkles,
    title: "Watch It Work",
    description:
      "Sit back while Kore automatically allocates your money to the right places. Track everything in real-time.",
    color: "bg-purple-500",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-secondary bg-secondary/10 px-4 py-1.5 rounded-full mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Get Started in Minutes
          </h2>
          <p className="text-lg text-muted">
            From signup to full automation in just four simple steps. No complex
            setup or hidden fees.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border transform -translate-y-1/2 z-0" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-background border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 h-full">
                  {/* Step Number */}
                  <div
                    className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                  >
                    <step.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Number Badge */}
                  <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
                    Step {step.number}
                  </span>

                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
