"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  ExternalLink,
  Receipt,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  Share2,
  Loader2,
} from "lucide-react";
import { useTransactionsStore, Transaction } from "@/app/store/transactions";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(value);
};

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  processing: {
    label: "Processing",
    icon: Clock,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
};

const bucketLabels: Record<string, { label: string; color: string }> = {
  savings: { label: "Savings", color: "text-primary" },
  investments: { label: "Investments", color: "text-secondary" },
  pensions: { label: "Pensions", color: "text-accent" },
  insurance: { label: "Insurance", color: "text-muted" },
  spending: { label: "Spending", color: "text-foreground" },
};

export default function TransactionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { getTransactionByRef, fetchTransactionByRef, isLoading } = useTransactionsStore();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [copied, setCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadTransaction = async () => {
      const ref = params.ref as string;
      
      // First try to get from store
      let tx: Transaction | null | undefined = getTransactionByRef(ref);
      
      // If not found, fetch from API
      if (!tx) {
        tx = await fetchTransactionByRef(ref);
      }
      
      if (tx) {
        setTransaction(tx);
      } else {
        setNotFound(true);
      }
    };
    
    loadTransaction();
  }, [params.ref, getTransactionByRef, fetchTransactionByRef]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (isLoading && !transaction) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-6" />
          <p className="text-muted">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound || !transaction) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-20 h-20 bg-muted/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Receipt className="w-10 h-10 text-muted" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Transaction not found
          </h3>
          <p className="text-muted mb-6">
            The transaction you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.push("/dashboard/transactions")}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
          >
            View All Transactions
          </button>
        </div>
      </div>
    );
  }

  const status = statusConfig[transaction.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const bucket = bucketLabels[transaction.bucket] || { label: transaction.bucket, color: "text-foreground" };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Transactions</span>
      </button>

      {/* Main Card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-6">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg}`}>
              <StatusIcon className={`w-4 h-4 ${status.color}`} />
              <span className={`text-sm font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
            <button
              className="p-2 hover:bg-muted/10 rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="w-5 h-5 text-muted" />
            </button>
          </div>

          <div className="text-center">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                transaction.type === "credit" ? "bg-secondary/10" : "bg-primary/10"
              }`}
            >
              {transaction.type === "credit" ? (
                <ArrowDownLeft className="w-8 h-8 text-secondary" />
              ) : (
                <ArrowUpRight className="w-8 h-8 text-primary" />
              )}
            </div>
            <p className="text-muted mb-2">{transaction.description}</p>
            <p
              className={`text-4xl font-bold ${
                transaction.type === "credit" ? "text-secondary" : "text-foreground"
              }`}
            >
              {transaction.type === "credit" ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </p>
            {transaction.fee !== undefined && transaction.fee > 0 && (
              <p className="text-sm text-muted mt-2">
                Fee: {formatCurrency(transaction.fee)}
              </p>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          {/* Reference */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted" />
              <span className="text-muted">Reference</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-foreground">
                {transaction.reference}
              </span>
              <button
                onClick={() => copyToClipboard(transaction.reference)}
                className="p-1.5 hover:bg-muted/10 rounded-lg transition-colors"
                title="Copy"
              >
                <Copy className={`w-4 h-4 ${copied ? "text-secondary" : "text-muted"}`} />
              </button>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted" />
              <span className="text-muted">Date & Time</span>
            </div>
            <span className="text-foreground">
              {transaction.date} at {transaction.time}
            </span>
          </div>

          {/* Bucket */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-muted" />
              <span className="text-muted">Bucket</span>
            </div>
            <span className={`font-medium ${bucket.color}`}>{bucket.label}</span>
          </div>

          {/* Partner */}
          {transaction.partner && (
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-muted" />
                <span className="text-muted">Partner</span>
              </div>
              <div className="flex items-center gap-2">
                {transaction.partnerLogo && (
                  <div className="w-6 h-6 rounded-lg overflow-hidden bg-muted/10 flex items-center justify-center">
                    <Image
                      src={transaction.partnerLogo}
                      alt={transaction.partner}
                      width={24}
                      height={24}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <span className="text-foreground">{transaction.partner}</span>
              </div>
            </div>
          )}

          {/* Bank Account */}
          {transaction.bankName && (
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-muted" />
                <span className="text-muted">Payment Method</span>
              </div>
              <span className="text-foreground">
                {transaction.bankName} {transaction.bankAccount}
              </span>
            </div>
          )}

          {/* Narration */}
          {transaction.narration && (
            <div className="py-3">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-5 h-5 text-muted" />
                <span className="text-muted">Narration</span>
              </div>
              <p className="text-foreground bg-background rounded-xl p-3 text-sm">
                {transaction.narration}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border bg-background">
          <div className="flex gap-3">
            <button
              onClick={() => copyToClipboard(transaction.reference)}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-border rounded-xl font-medium text-foreground hover:bg-card transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy Reference
            </button>
            {transaction.partner && (
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors">
                <ExternalLink className="w-4 h-4" />
                View in {transaction.partner.split(" ")[0]}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold text-foreground mb-2">Need help?</h3>
        <p className="text-sm text-muted mb-4">
          If you have any questions about this transaction, please contact our support team.
        </p>
        <button className="text-sm text-primary font-medium hover:underline">
          Contact Support
        </button>
      </div>
    </div>
  );
}
