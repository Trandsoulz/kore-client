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
