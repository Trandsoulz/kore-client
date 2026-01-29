import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-20 md:py-28 bg-primary/5 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Automate Your{" "}
            <span className="text-primary">
              Financial Future?
            </span>
          </h2>

          <p className="text-lg md:text-xl text-muted mb-8 max-w-2xl mx-auto">
            Join thousands of Nigerians who are building wealth on autopilot.
            Set your rules today and let Kore do the heavy lifting.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-primary/25"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-background border border-border hover:border-primary/50 text-foreground px-8 py-4 rounded-full font-semibold text-lg transition-colors"
            >
              Talk to Sales
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-xl mx-auto">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">
                10K+
              </p>
              <p className="text-sm text-muted">Active Users</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">
                ₦2B+
              </p>
              <p className="text-sm text-muted">Money Moved</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground">
                99.9%
              </p>
              <p className="text-sm text-muted">Uptime</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
