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

  // Store callbacks in refs to avoid re-creating fetchData on every render.
  // Without this, inline queryFn/mockFn create a new fetchData every render,
  // which triggers the useEffect, causing an infinite fetch loop.
  const queryFnRef = useRef(queryFn);
  queryFnRef.current = queryFn;
  const mockFnRef = useRef(mockFn);
  mockFnRef.current = mockFn;

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await queryFnRef.current();
      if (mountedRef.current) {
        setData(result);
        setIsMock(false);
      }
    } catch (err) {
      if (!mountedRef.current) return;

      // Network error — try mock fallback
      if (err instanceof TypeError || (err instanceof ApiError && err.status === 0)) {
        if (mockFnRef.current) {
          console.warn("[VITA] Backend indisponible, utilisation des donnees mock");
          setData(mockFnRef.current());
          setIsMock(true);
          return;
        }
      }

      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Connexion au serveur impossible");
        if (mockFnRef.current) {
          setData(mockFnRef.current());
          setIsMock(true);
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [enabled]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]);

  return { data, loading, error, isMock, refresh: fetchData };
}
