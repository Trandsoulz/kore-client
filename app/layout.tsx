import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kore - Automate Your Financial Future",
  description: "Kore is a financial automation platform that helps you save, invest, and manage your money automatically. Set your rules, we handle the rest.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
