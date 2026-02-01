/**
 * API Service Layer for Kore Backend
 * Base URL: https://koreapi.onrender.com/api/
 */

const API_BASE_URL = "https://koreapi.onrender.com/api";

// Token management
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kore-access-token");
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kore-refresh-token");
};

export const setTokens = (access: string, refresh: string): void => {
  localStorage.setItem("kore-access-token", access);
  localStorage.setItem("kore-refresh-token", refresh);
};

export const clearTokens = (): void => {
  localStorage.removeItem("kore-access-token");
  localStorage.removeItem("kore-refresh-token");
};

// API Error class
export class ApiError extends Error {
  status: number;
  data: Record<string, unknown>;

  constructor(message: string, status: number, data: Record<string, unknown> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Refresh token and retry request
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data = await response.json();
    localStorage.setItem("kore-access-token", data.access);
    return data.access;
  } catch {
    clearTokens();
    return null;
  }
};

// Main fetch wrapper with auth
interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export const apiFetch = async <T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> => {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  // Add auth header if authenticated
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  // If unauthorized, try to refresh token
  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
      });
    }
  }

  // Handle non-JSON responses
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    const errorData = isJson ? await response.json() : { message: response.statusText };
    const errorMessage = 
      errorData.detail || 
      errorData.message || 
      errorData.error ||
      Object.values(errorData).flat().join(", ") ||
      "An error occurred";
    throw new ApiError(errorMessage, response.status, errorData);
  }

  return isJson ? response.json() : ({} as T);
};

// ===== AUTH API =====

export interface SignupRequest {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface MeResponse {
  id: number;
  name: string;
  email: string;
  profile: {
    is_completed: boolean;
  };
}

export const authApi = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await apiFetch<AuthResponse>("/auth/signup/", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    });
    setTokens(response.tokens.access, response.tokens.refresh);
    return response;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiFetch<AuthResponse>("/auth/login/", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    });
    setTokens(response.tokens.access, response.tokens.refresh);
    return response;
  },

  me: async (): Promise<MeResponse> => {
    return apiFetch<MeResponse>("/auth/me/");
  },

  logout: (): void => {
    clearTokens();
  },
};

// ===== PROFILE API =====

export interface ProfileResponse {
  email: string;
  first_name: string;
  surname: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  bank_name: string;
  bank_code: string;
  is_completed: boolean;
}

export interface PersonalInfoRequest {
  first_name: string;
  surname: string;
  phone_number: string;
  date_of_birth: string;
  gender: string; // M, F, or O
}

export interface BankInfoRequest {
  account_number: string;
  bank_name: string;
  bank_code: string;
  bvn: string;
}

export interface ProfileSubmitResponse {
  status: "verified" | "failed";
  message: string;
  profile?: {
    is_completed: boolean;
    bank_name: string;
    bank_code: string;
  };
  error?: string;
  provider_response?: Record<string, unknown>;
}

export const profileApi = {
  getProfile: async (): Promise<ProfileResponse> => {
    return apiFetch<ProfileResponse>("/profile/me/");
  },

  updatePersonalInfo: async (data: PersonalInfoRequest): Promise<PersonalInfoRequest> => {
    return apiFetch<PersonalInfoRequest>("/profile/personal/", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  updateBankInfo: async (data: BankInfoRequest): Promise<{ bank_name: string; bank_code: string }> => {
    return apiFetch<{ bank_name: string; bank_code: string }>("/profile/bank/", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  submitProfile: async (): Promise<ProfileSubmitResponse> => {
    return apiFetch<ProfileSubmitResponse>("/profile/submit/", {
      method: "POST",
    });
  },
};

// ===== BANKS API =====

export interface Bank {
  name: string;
  code: string;
}

export interface BanksResponse {
  banks?: Bank[];
  stale?: boolean;
}

export const banksApi = {
  getBanks: async (): Promise<Bank[]> => {
    const response = await apiFetch<Bank[] | BanksResponse>("/banks/", {
      skipAuth: true,
    });
    // Handle both array and object response formats
    if (Array.isArray(response)) {
      return response;
    }
    return response.banks || [];
  },
};

// ===== RULES ENGINE API =====

export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
export type FailureAction = "RETRY" | "SKIP" | "NOTIFY";
export type BucketType = "SAVINGS" | "INVESTMENTS" | "BILLS" | "EMERGENCY" | "SPENDING" | "CUSTOM";

export interface BucketAllocation {
  bucket: BucketType;
  custom_bucket_name?: string;
  percentage: number;
}

export interface DebitRuleRequest {
  monthly_max_debit: number;
  single_max_debit: number;
  frequency: Frequency;
  amount_per_frequency: number;
  allocations: BucketAllocation[];
  failure_action: FailureAction;
  start_date: string; // YYYY-MM-DD
  end_date?: string | null;
}

export interface DebitRuleResponse {
  id: number;
  monthly_max_debit: string;
  single_max_debit: string;
  frequency: Frequency;
  amount_per_frequency: string;
  allocations: BucketAllocation[];
  failure_action: FailureAction;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const rulesApi = {
  // Get active debit rule
  getActiveRule: async (): Promise<DebitRuleResponse | null> => {
    try {
      return await apiFetch<DebitRuleResponse>("/rules-engine/");
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Create new debit rule
  createRule: async (data: DebitRuleRequest): Promise<DebitRuleResponse> => {
    return apiFetch<DebitRuleResponse>("/rules-engine/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update active debit rule
  updateRule: async (data: Partial<DebitRuleRequest>): Promise<DebitRuleResponse> => {
    return apiFetch<DebitRuleResponse>("/rules-engine/", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Deactivate active debit rule
  deactivateRule: async (): Promise<{ detail: string }> => {
    return apiFetch<{ detail: string }>("/rules-engine/", {
      method: "DELETE",
    });
  },

  // Get all rules history
  getRulesHistory: async (): Promise<DebitRuleResponse[]> => {
    return apiFetch<DebitRuleResponse[]>("/rules-engine/history/");
  },
};

// ===== TRANSACTIONS API =====

export type TransactionType = "DEBIT" | "CREDIT" | "REVERSAL";
export type TransactionStatus = "PENDING" | "PROCESSING" | "SUCCESSFUL" | "FAILED" | "REVERSED";

export interface Transaction {
  id: number;
  reference: string;
  transaction_type: TransactionType;
  status: TransactionStatus;
  amount: string;
  bucket: BucketType | "";
  bucket_display: string | null;
  custom_bucket_name: string;
  description: string;
  narration: string;
  request_ref: string;
  provider_reference: string;
  failure_reason: string;
  created_at: string;
  completed_at: string | null;
}

export interface TransactionListItem {
  id: number;
  reference: string;
  transaction_type: TransactionType;
  status: TransactionStatus;
  amount: string;
  bucket: BucketType | "";
  bucket_display: string | null;
  description: string;
  created_at: string;
}

export interface TransactionListResponse {
  count: number;
  limit: number;
  offset: number;
  results: TransactionListItem[];
}

export interface TransactionSummary {
  period: string;
  total_debited: string;
  total_credited: string;
  transaction_count: number;
  by_bucket: Record<string, { total: number; count: number }>;
  by_status: Record<string, number>;
}

export interface TransactionFilters {
  status?: TransactionStatus;
  type?: TransactionType;
  bucket?: BucketType;
  limit?: number;
  offset?: number;
}

export const transactionsApi = {
  // Get list of transactions
  getTransactions: async (filters?: TransactionFilters): Promise<TransactionListResponse> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.bucket) params.append("bucket", filters.bucket);
    if (filters?.limit) params.append("limit", String(filters.limit));
    if (filters?.offset) params.append("offset", String(filters.offset));
    
    const queryString = params.toString();
    const endpoint = queryString ? `/transactions/?${queryString}` : "/transactions/";
    
    return apiFetch<TransactionListResponse>(endpoint);
  },

  // Get single transaction by reference
  getTransaction: async (reference: string): Promise<Transaction> => {
    return apiFetch<Transaction>(`/transactions/${reference}/`);
  },

  // Get transaction summary/analytics
  getSummary: async (period?: "today" | "week" | "month" | "year" | "all"): Promise<TransactionSummary> => {
    const endpoint = period ? `/transactions/summary/?period=${period}` : "/transactions/summary/";
    return apiFetch<TransactionSummary>(endpoint);
  },
};

// ==================== MANDATE API ====================

export type MandateStatus = "PENDING" | "ACTIVE" | "CANCELLED" | "FAILED" | "EXPIRED";

export interface Mandate {
  id: number;
  status: MandateStatus;
  mandate_reference: string | null;
  subscription_id: string | null;
  request_ref: string;
  activation_url: string | null;
  created_at: string;
  cancelled_at: string | null;
  provider_response_code: string | null;
}

export interface MandateCreateResponse {
  id: number;
  status: MandateStatus;
  request_ref: string;
  activation_url: string | null;
}

export const mandateApi = {
  /**
   * Create a new mandate for the authenticated user.
   * Requires: completed profile and active rules engine.
   * Returns activation URL for user to authorize the mandate.
   */
  create: async (): Promise<MandateCreateResponse> => {
    return apiFetch<MandateCreateResponse>("/mandates/create/", {
      method: "POST",
    });
  },

  /**
   * Get the user's current/latest mandate.
   * Used to check mandate status and display in settings.
   */
  getMyMandate: async (): Promise<Mandate> => {
    return apiFetch<Mandate>("/mandates/me/");
  },

  /**
   * Cancel the user's active mandate.
   * Stops all future automated debits.
   */
  cancel: async (): Promise<{ message: string; mandate_status: string }> => {
    return apiFetch<{ message: string; mandate_status: string }>("/mandates/cancel/", {
      method: "POST",
    });
  },

  /**
   * Poll mandate status until it changes from PENDING.
   * Useful after user completes activation URL flow.
   * 
   * @param intervalMs - Polling interval in milliseconds (default 3000)
   * @param maxAttempts - Maximum polling attempts (default 20)
   * @returns Promise that resolves when status changes or rejects on timeout
   */
  pollStatus: async (
    intervalMs: number = 3000,
    maxAttempts: number = 20
  ): Promise<Mandate> => {
    let attempts = 0;
    
    return new Promise((resolve, reject) => {
      const poll = async () => {
        attempts++;
        
        try {
          const mandate = await mandateApi.getMyMandate();
          
          // If status is no longer PENDING, we're done
          if (mandate.status !== "PENDING") {
            resolve(mandate);
            return;
          }
          
          // Check if we've exhausted attempts
          if (attempts >= maxAttempts) {
            reject(new Error("Mandate activation timeout. Please try again."));
            return;
          }
          
          // Continue polling
          setTimeout(poll, intervalMs);
        } catch (error) {
          // If 404, mandate doesn't exist yet - keep polling
          if (error instanceof ApiError && error.status === 404 && attempts < maxAttempts) {
            setTimeout(poll, intervalMs);
            return;
          }
          reject(error);
        }
      };
      
      // Start polling
      poll();
    });
  },
};
