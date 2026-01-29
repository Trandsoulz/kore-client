"use client";

import {
  PiggyBank,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { useAuthStore } from "@/app/store/auth";

const stats = [
  {
    label: "Total Savings",
    value: "₦0.00",
    change: "+0%",
    icon: PiggyBank,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Investments",
    value: "₦0.00",
    change: "+0%",
    icon: TrendingUp,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    label: "Total Automated",
    value: "₦0.00",
    change: "This month",
    icon: Wallet,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
];

const recentTransactions: {
  id: string;
  type: "credit" | "debit";
  description: string;
  amount: string;
  date: string;
  bucket: string;
}[] = [];

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      {!user?.profileComplete && (
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl">👋</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Complete Your Profile</h3>
              <p className="text-sm text-muted mt-1">
                Finish setting up your profile to start automating your finances.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-sm text-muted">{stat.change}</span>
            </div>
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Set Up Savings", href: "/dashboard/savings", icon: PiggyBank, color: "bg-primary" },
            { label: "Start Investing", href: "/dashboard/investments", icon: TrendingUp, color: "bg-secondary" },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors group"
            >
              <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                {action.label}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
          <a
            href="/dashboard/transactions"
            className="text-sm text-primary hover:underline font-medium"
          >
            View All
          </a>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {recentTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-muted/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-muted" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">No transactions yet</h3>
              <p className="text-sm text-muted">
                Your automated transactions will appear here once you set up your rules.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-background transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        tx.type === "credit" ? "bg-secondary/10" : "bg-primary/10"
                      }`}
                    >
                      {tx.type === "credit" ? (
                        <ArrowDownLeft className="w-5 h-5 text-secondary" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{tx.description}</p>
                      <p className="text-sm text-muted">{tx.bucket}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        tx.type === "credit" ? "text-secondary" : "text-foreground"
                      }`}
                    >
                      {tx.type === "credit" ? "+" : "-"}{tx.amount}
                    </p>
                    <p className="text-sm text-muted">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
