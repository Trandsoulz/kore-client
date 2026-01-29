import Link from "next/link";
import { ArrowRight, Play, Shield, Zap, TrendingUp } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span className="text-sm text-primary font-medium">
                Automate Your Finances
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Your Money,{" "}
              <span className="text-primary">
                Working for You
              </span>{" "}
              Automatically
            </h1>

            <p className="text-lg md:text-xl text-muted mb-8 max-w-xl mx-auto lg:mx-0">
              Set your financial rules once, and let Kore automatically save,
              invest, pay rent, and manage your money. No more missed savings or
              forgotten bills.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-semibold transition-all hover:scale-105 shadow-lg shadow-primary/25"
              >
                Start Automating
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 bg-card border border-border hover:border-primary/50 text-foreground px-8 py-3 rounded-full font-semibold transition-colors">
                <Play className="w-5 h-5 text-primary" />
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-10">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Shield className="w-5 h-5 text-secondary" />
                Bank-level Security
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Zap className="w-5 h-5 text-accent" />
                Instant Setup
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <TrendingUp className="w-5 h-5 text-primary" />
                Smart Automation
              </div>
            </div>
          </div>

          {/* Right Content - Hero Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative animate-float">
              {/* Main Card */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-2xl max-w-md mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted">Monthly Automation</p>
                    <p className="text-2xl font-bold text-foreground">
                      ₦150,000
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted">Savings</span>
                      <span className="text-foreground font-medium">
                        ₦50,000
                      </span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: "33%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted">Investments</span>
                      <span className="text-foreground font-medium">
                        ₦40,000
                      </span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary rounded-full"
                        style={{ width: "27%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted">Rent</span>
                      <span className="text-foreground font-medium">
                        ₦40,000
                      </span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: "27%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted">Subscriptions</span>
                      <span className="text-foreground font-medium">
                        ₦20,000
                      </span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: "13%" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-6 flex items-center justify-between bg-secondary/10 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      Auto-debit Active
                    </span>
                  </div>
                  <span className="text-xs text-secondary font-medium bg-secondary/20 px-2 py-1 rounded-full">
                    Every Friday
                  </span>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-card border border-border rounded-xl p-3 shadow-lg animate-pulse-glow">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Saved this month</p>
                    <p className="text-sm font-semibold text-green-500">
                      +₦50,000
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
