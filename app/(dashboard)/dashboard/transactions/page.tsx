"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Download,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { useTransactionsStore } from "@/app/store/transactions";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value);
};

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: "text-secondary",
  },
  pending: {
    icon: Clock,
    color: "text-accent",
  },
  failed: {
    icon: XCircle,
    color: "text-red-500",
  },
};

export default function TransactionsPage() {
  const { transactions, getTotalDebited, getTotalAllocated, getMonthlyTotal } =
    useTransactionsStore();

  const totalDebited = getTotalDebited();
  const totalAllocated = getTotalAllocated();
  const monthlyTotal = getMonthlyTotal();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted mt-1">
            View all your automated transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-card transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-card transition-colors">
            <Calendar className="w-4 h-4" />
            Date Range
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted mb-1">Total Debited</p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(totalDebited)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted mb-1">Total Allocated</p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(totalAllocated)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted mb-1">This Month</p>
          <p className="text-xl font-bold text-foreground">
            {formatCurrency(monthlyTotal)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-sm text-muted mb-1">Transactions</p>
          <p className="text-xl font-bold text-foreground">{transactions.length}</p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-muted/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Receipt className="w-10 h-10 text-muted" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No transactions yet
            </h3>
            <p className="text-muted max-w-md mx-auto">
              Once you connect a savings or investment partner and your first automated
              debit occurs, your transactions will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-6 gap-4 px-6 py-4 bg-background border-b border-border text-sm font-medium text-muted">
              <span className="col-span-2">Transaction</span>
              <span>Bucket</span>
              <span>Partner</span>
              <span>Date</span>
              <span className="text-right">Amount</span>
            </div>

            {/* Transactions */}
            <div className="divide-y divide-border">
              {transactions.map((tx) => {
                const StatusIcon = statusConfig[tx.status].icon;
                const statusColor = statusConfig[tx.status].color;

                return (
                  <Link
                    key={tx.id}
                    href={`/dashboard/transactions/${tx.reference}`}
                    className="grid sm:grid-cols-6 gap-4 px-6 py-4 hover:bg-background transition-colors items-center group"
                  >
                    <div className="col-span-2 flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === "credit"
                            ? "bg-secondary/10"
                            : "bg-primary/10"
                        }`}
                      >
                        {tx.type === "credit" ? (
                          <ArrowDownLeft className="w-5 h-5 text-secondary" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted sm:hidden">{tx.date}</span>
                          <StatusIcon className={`w-3.5 h-3.5 ${statusColor}`} />
                          <span className={`text-xs ${statusColor} capitalize`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-sm text-foreground capitalize">
                        {tx.bucket}
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      {tx.partnerLogo && (
                        <div className="w-5 h-5 rounded overflow-hidden bg-muted/10 flex items-center justify-center shrink-0">
                          <Image
                            src={tx.partnerLogo}
                            alt={tx.partner || ""}
                            width={20}
                            height={20}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <span className="text-sm text-muted truncate">
                        {tx.partner || "-"}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-sm text-muted">{tx.date}</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <div className="text-right">
                        <span
                          className={`font-semibold ${
                            tx.type === "credit"
                              ? "text-secondary"
                              : "text-foreground"
                          }`}
                        >
                          {tx.type === "credit" ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
