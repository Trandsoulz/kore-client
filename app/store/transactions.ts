import { create } from "zustand";
import { persist } from "zustand/middleware";
import { 
  transactionsApi, 
  Transaction as ApiTransaction,
  TransactionListItem,
  TransactionSummary,
  TransactionFilters 
} from "@/app/lib/api";

// UI-friendly transaction interface (mapped from API response)
export interface Transaction {
  id: string;
  reference: string;
  type: "debit" | "credit";
  description: string;
  amount: number;
  date: string;
  time: string;
  bucket: "savings" | "investments" | "pensions" | "insurance" | "spending";
  status: "completed" | "pending" | "failed" | "processing";
  partner?: string;
  partnerLogo?: string;
  bankName?: string;
  bankAccount?: string;
  narration?: string;
  fee?: number;
}

interface TransactionsState {
  // State
  transactions: Transaction[];
  summary: TransactionSummary | null;
  isLoading: boolean;
  error: string | null;
  
  // API Actions
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  fetchTransactionByRef: (reference: string) => Promise<Transaction | null>;
  fetchSummary: (period?: 'today' | 'week' | 'month' | 'year' | 'all') => Promise<void>;
  
  // Legacy sync actions for backward compatibility
  addTransaction: (tx: Omit<Transaction, "id" | "reference">) => void;
  getTransactionByRef: (reference: string) => Transaction | undefined;
  getTotalDebited: () => number;
  getTotalAllocated: () => number;
  getMonthlyTotal: () => number;
  
  // Helpers
  clearError: () => void;
}

// Helper to map API response to UI Transaction interface
const mapApiTransactionToUI = (apiTx: TransactionListItem | ApiTransaction): Transaction => {
  const createdAt = new Date(apiTx.created_at);
  
  // Map transaction_type to UI type
  const typeMap: Record<string, "debit" | "credit"> = {
    'DEBIT': 'debit',
    'CREDIT': 'credit',
    'REVERSAL': 'credit', // Reversals are credits
  };
  
  // Map status to UI status
  const statusMap: Record<string, "completed" | "pending" | "failed" | "processing"> = {
    'SUCCESSFUL': 'completed',
    'PENDING': 'pending',
    'PROCESSING': 'processing',
    'FAILED': 'failed',
    'REVERSED': 'failed',
  };
  
  // Map bucket to UI bucket
  const bucketMap: Record<string, "savings" | "investments" | "pensions" | "insurance" | "spending"> = {
    'SAVINGS': 'savings',
    'INVESTMENTS': 'investments',
    'PENSIONS': 'pensions',
    'INSURANCE': 'insurance',
    'SPENDING': 'spending',
  };
  
  return {
    id: apiTx.reference, // Use reference as ID
    reference: apiTx.reference,
    type: typeMap[apiTx.transaction_type] || 'debit',
    description: apiTx.description || `${apiTx.transaction_type} transaction`,
    amount: parseFloat(apiTx.amount),
    date: createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    bucket: bucketMap[apiTx.bucket] || 'savings',
    status: statusMap[apiTx.status] || 'pending',
    narration: 'narration' in apiTx ? apiTx.narration : undefined,
    fee: 0, // Fee not tracked in current API
  };
};

const generateReference = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 100).toString().padStart(2, "0");
  return `KOR-TXN-${dateStr}${random}`;
};

export const useTransactionsStore = create<TransactionsState>()(
  persist(
    (set, get) => ({
      // State
      transactions: [],
      summary: null,
      isLoading: false,
      error: null,
      
      // API Actions
      fetchTransactions: async (filters?: TransactionFilters) => {
        set({ isLoading: true, error: null });
        try {
          const response = await transactionsApi.getTransactions(filters);
          const transactions = response.results.map(mapApiTransactionToUI);
          set({ transactions, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch transactions';
          set({ error: message, isLoading: false });
          throw error;
        }
      },
      
      fetchTransactionByRef: async (reference: string) => {
        set({ isLoading: true, error: null });
        try {
          const apiTx = await transactionsApi.getTransaction(reference);
          const transaction = mapApiTransactionToUI(apiTx);
          set({ isLoading: false });
          return transaction;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch transaction';
          set({ error: message, isLoading: false });
          return null;
        }
      },
      
      fetchSummary: async (period: 'today' | 'week' | 'month' | 'year' | 'all' = 'month') => {
        set({ isLoading: true, error: null });
        try {
          const summary = await transactionsApi.getSummary(period);
          set({ summary, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to fetch summary';
          set({ error: message, isLoading: false });
          throw error;
        }
      },
      
      // Legacy sync actions for backward compatibility
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
      
      getTotalDebited: () => {
        // If we have summary, use it; otherwise calculate from transactions
        const summary = get().summary;
        if (summary) {
          return parseFloat(summary.total_debited) || 0;
        }
        return get()
          .transactions.filter((tx) => tx.type === "debit" && tx.status === "completed")
          .reduce((sum, tx) => sum + tx.amount, 0);
      },
      
      getTotalAllocated: () => {
        const summary = get().summary;
        if (summary) {
          // Total allocated = total debited (money that was moved out for savings/investments)
          return parseFloat(summary.total_debited) || 0;
        }
        return get()
          .transactions.filter((tx) => tx.status === "completed")
          .reduce((sum, tx) => sum + tx.amount, 0);
      },
      
      getMonthlyTotal: () => {
        // If we have monthly summary, use it
        const summary = get().summary;
        if (summary && summary.period === 'month') {
          return parseFloat(summary.total_debited) || 0;
        }
        
        // Otherwise calculate from transactions
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
      
      // Helpers
      clearError: () => set({ error: null }),
    }),
    {
      name: "kore-transactions",
      partialize: (state) => ({
        // Only persist transactions, not loading/error state
        transactions: state.transactions,
        summary: state.summary,
      }),
    }
  )
);
