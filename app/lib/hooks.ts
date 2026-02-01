/**
 * Custom hooks for API data fetching
 */

import { useState, useEffect } from "react";
import { banksApi, type Bank } from "@/app/lib/api";

export function useBanks() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        setIsLoading(true);
        const data = await banksApi.getBanks();
        setBanks(data);
        setError(null);
      } catch (err) {
        setError("Failed to load banks");
        console.error("Failed to fetch banks:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanks();
  }, []);

  return { banks, isLoading, error };
}
