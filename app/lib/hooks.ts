/**
 * Custom hooks for API data fetching
 */

import { useState, useEffect } from "react";
import { banksApi, type Bank } from "@/app/lib/api";

export function useBanks() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Banks API endpoint: https://koreapi.onrender.com/api/banks/
  // Note: `banksApi.getBanks()` calls this endpoint via the shared API client (`app/lib/api.ts`).
  // The hook below fetches banks using that helper and exposes a `refresh` function.
  const fetchBanks = async () => {
    try {
      setIsLoading(true);
      const data = await banksApi.getBanks();
      console.log("Banks API response:", data);
      console.log("Number of banks loaded:", Array.isArray(data) ? data.length : 0);
      setBanks(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch banks:", err);
      console.error("Full error object:", JSON.stringify(err, null, 2));
      setError("Failed to load banks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  return { banks, isLoading, error, refresh: fetchBanks };
}
