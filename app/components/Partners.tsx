const partners = {
  savings: [
    { name: "Piggyvest", category: "Savings" },
    { name: "Cowrywise", category: "Savings" },
  ],
  investments: [
    { name: "Stanbic MMF", category: "Money Market Funds" },
    { name: "GT Fund Managers", category: "Money Market Funds" },
  ],
  payments: [
    { name: "PayWithAccount", category: "Payment Infrastructure" },
    { name: "OnePipe", category: "Financial API" },
  ],
};

export default function Partners() {
  return (
    <section id="partners" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-sm font-semibold text-purple-500 bg-purple-500/10 px-4 py-1.5 rounded-full mb-4">
            Our Partners
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Powered by Trusted Financial Partners
          </h2>
          <p className="text-lg text-muted">
            Kore partners with leading financial institutions to ensure your
            money is safe and your automations are seamless.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Savings Partners */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full" />
              Savings Partners
            </h3>
            <div className="space-y-4">
              {partners.savings.map((partner, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">
                      {partner.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{partner.name}</p>
                    <p className="text-sm text-muted">{partner.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investment Partners */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary rounded-full" />
              Investment Partners
            </h3>
            <div className="space-y-4">
              {partners.investments.map((partner, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border"
                >
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <span className="text-secondary font-bold text-lg">
                      {partner.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{partner.name}</p>
                    <p className="text-sm text-muted">{partner.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Partners */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full" />
              Payment Infrastructure
            </h3>
            <div className="space-y-4">
              {partners.payments.map((partner, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border"
                >
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                    <span className="text-accent font-bold text-lg">
                      {partner.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{partner.name}</p>
                    <p className="text-sm text-muted">{partner.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center">
          <p className="text-muted text-sm">
            All partners are regulated and licensed financial institutions in Nigeria
          </p>
        </div>
      </div>
    </section>
  );
}
