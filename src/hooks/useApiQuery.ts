"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ApiError } from "@/lib/api";

// Generic hook for API queries with mock fallback
// Handles loading, error, and refresh state

interface UseApiQueryOptions<T> {
  queryFn: () => Promise<T>;
  mockFn?: () => T;
  enabled?: boolean;
}

interface UseApiQueryReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isMock: boolean;
  refresh: () => Promise<void>;
}

export function useApiQuery<T>({
  queryFn,
  mockFn,
  enabled = true,
}: UseApiQueryOptions<T>): UseApiQueryReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      if (mountedRef.current) {
        setData(result);
        setIsMock(false);
      }
    } catch (err) {
      if (!mountedRef.current) return;

      // Network error — try mock fallback
      if (err instanceof TypeError || (err instanceof ApiError && err.status === 0)) {
        if (mockFn) {
          console.warn("[VITA] Backend indisponible, utilisation des donnees mock");
          setData(mockFn());
          setIsMock(true);
          return;
        }
      }

      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Connexion au serveur impossible");
        if (mockFn) {
          setData(mockFn());
          setIsMock(true);
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [queryFn, mockFn, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  return { data, loading, error, isMock, refresh: fetchData };
}
