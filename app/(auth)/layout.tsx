import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary/5 flex-col justify-between p-12">
        <Link href="/" className="text-2xl font-bold text-primary">
          Kore
        </Link>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-foreground">
            Automate your financial future
          </h1>
          <p className="text-lg text-muted max-w-md">
            Set your rules once, and let Kore automatically save, invest, 
            pay rent, and manage your money.
          </p>
          
          <div className="flex items-center gap-4 pt-8">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-medium text-primary"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted">
              <span className="font-semibold text-foreground">10,000+</span> users automating their finances
            </p>
          </div>
        </div>
        
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} Kore. All rights reserved.
        </p>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
