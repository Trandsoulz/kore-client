import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Transaction {
  id: string;
  reference: string;
  type: "debit" | "credit";
  description: string;
  amount: number;
  date: string;
  time: string;
  bucket: "savings" | "investments" | "pensions" | "insurance" | "spending";
  status: "completed" | "pending" | "failed";
  partner?: string;
  partnerLogo?: string;
  bankName?: string;
  bankAccount?: string;
  narration?: string;
  fee?: number;
}

interface TransactionsState {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, "id" | "reference">) => void;
  getTransactionByRef: (reference: string) => Transaction | undefined;
  getTotalDebited: () => number;
  getTotalAllocated: () => number;
  getMonthlyTotal: () => number;
}

// Sample transactions for demo
const sampleTransactions: Transaction[] = [
  {
    id: "1",
    reference: "KOR-TXN-2026012901",
    type: "debit",
    description: "Auto-save to Piggyvest",
    amount: 25000,
    date: "Jan 29, 2026",
    time: "09:00 AM",
    bucket: "savings",
    status: "completed",
    partner: "Piggyvest",
    partnerLogo: "/piggyvest.png",
    bankName: "Kuda Bank",
    bankAccount: "****4521",
    narration: "Kore automated savings - January Week 4",
    fee: 0,
  },
  {
    id: "2",
    reference: "KOR-TXN-2026012902",
    type: "debit",
    description: "Investment to Risevest",
    amount: 15000,
    date: "Jan 29, 2026",
    time: "09:05 AM",
    bucket: "investments",
    status: "completed",
    partner: "Risevest",
    partnerLogo: "/risevest.png",
    bankName: "Kuda Bank",
    bankAccount: "****4521",
    narration: "Kore automated investment - January Week 4",
    fee: 0,
  },
  {
    id: "3",
    reference: "KOR-TXN-2026012201",
    type: "debit",
    description: "Auto-save to Cowrywise",
    amount: 20000,
    date: "Jan 22, 2026",
    time: "09:00 AM",
    bucket: "savings",
    status: "completed",
    partner: "Cowrywise",
    partnerLogo: "/cowrywise.png",
    bankName: "Kuda Bank",
    bankAccount: "****4521",
    narration: "Kore automated savings - January Week 3",
    fee: 0,
  },
  {
    id: "4",
    reference: "KOR-TXN-2026012202",
    type: "debit",
    description: "Investment to Bamboo",
    amount: 10000,
    date: "Jan 22, 2026",
    time: "09:05 AM",
    bucket: "investments",
    status: "completed",
    partner: "Bamboo",
    partnerLogo: "/bamboo.jpeg",
    bankName: "Kuda Bank",
    bankAccount: "****4521",
    narration: "Kore automated investment - January Week 3",
    fee: 0,
  },
  {
    id: "5",
    reference: "KOR-TXN-2026011501",
    type: "debit",
    description: "Auto-save to Piggyvest",
    amount: 25000,
    date: "Jan 15, 2026",
    time: "09:00 AM",
    bucket: "savings",
    status: "completed",
    partner: "Piggyvest",
    partnerLogo: "/piggyvest.png",
    bankName: "Kuda Bank",
    bankAccount: "****4521",
    narration: "Kore automated savings - January Week 2",
    fee: 0,
  },
  {
    id: "6",
    reference: "KOR-TXN-2026011502",
    type: "debit",
    description: "Investment to Stanbic MMF",
    amount: 30000,
    date: "Jan 15, 2026",
    time: "09:05 AM",
    bucket: "investments",
    status: "completed",
    partner: "Stanbic IBTC MMF",
    partnerLogo: "/stanbic.jpeg",
    bankName: "Kuda Bank",
    bankAccount: "****4521",
    narration: "Kore automated investment - January Week 2",
    fee: 0,
  },
  {
    id: "7",
    reference: "KOR-TXN-2026010801",
    type: "debit",
    description: "Auto-save to Kuda",
    amount: 15000,
    date: "Jan 8, 2026",
    time: "09:00 AM",
    bucket: "savings",
    status: "completed",
    partner: "Kuda Bank",
    partnerLogo: "/kuda.png",
    bankName: "Kuda Bank",
    bankAccount: "****4521",
    narration: "Kore automated savings - January Week 1",
    fee: 0,
  },
  {
    id: "8",
    reference: "KOR-TXN-2026010802",
    type: "debit",
    description: "Investment to GT Fund Managers",
    amount: 20000,
    date: "Jan 8, 2026",
    time: "09:05 AM",
    bucket: "investments",
    status: "pending",
    partner: "GT Fund Managers MMF",
    partnerLogo: "/gtbank.png",
    bankName: "Kuda Bank",
    bankAccount: "****4521",
    narration: "Kore automated investment - January Week 1",
    fee: 0,
  },
  {
    id: "9",
    reference: "KOR-TXN-2026010101",
    type: "debit",
    description: "Auto-save to Piggyvest",
    amount: 25000,
    date: "Jan 1, 2026",
    time: "09:00 AM",
    bucket: "savings",
    status: "failed",
    partner: "Piggyvest",
    partnerLogo: "/piggyvest.png",
    bankName: "Kuda Bank",
    bankAccount: "****4521",
    narration: "Kore automated savings - New Year",
    fee: 0,
  },
  {
    id: "10",
    reference: "KOR-TXN-2025122501",
    type: "debit",
    description: "Auto-save to Cowrywise",
    amount: 20000,
    date: "Dec 25, 2025",
    time: "09:00 AM",
    bucket: "savings",
    status: "completed",
    partner: "Cowrywise",
    partnerLogo: "/cowrywise.png",
    bankName: "Kuda Bank",
    bankAccount: "****4521",
    narration: "Kore automated savings - Christmas Week",
    fee: 0,
  },
];

const generateReference = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 100).toString().padStart(2, "0");
  return `KOR-TXN-${dateStr}${random}`;
};

export const useTransactionsStore = create<TransactionsState>()(
  persist(
    (set, get) => ({
      transactions: sampleTransactions,
      addTransaction: (tx) =>
        set((state) => ({
          transactions: [
            {
              ...tx,
              id: (state.transactions.length + 1).toString(),
              reference: generateReference(),
            },
            ...state.transactions,
          ],
        })),
      getTransactionByRef: (reference) =>
        get().transactions.find((tx) => tx.reference === reference),
      getTotalDebited: () =>
        get()
          .transactions.filter((tx) => tx.type === "debit" && tx.status === "completed")
          .reduce((sum, tx) => sum + tx.amount, 0),
      getTotalAllocated: () =>
        get()
          .transactions.filter((tx) => tx.status === "completed")
          .reduce((sum, tx) => sum + tx.amount, 0),
      getMonthlyTotal: () => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        return get()
          .transactions.filter((tx) => {
            const txDate = new Date(tx.date);
            return (
              txDate.getMonth() === currentMonth &&
              txDate.getFullYear() === currentYear &&
              tx.status === "completed"
            );
          })
          .reduce((sum, tx) => sum + tx.amount, 0);
      },
    }),
    {
      name: "kore-transactions",
    }
  )
);
