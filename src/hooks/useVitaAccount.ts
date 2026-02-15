"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { VitaAccount, VitaTransaction, EmissionLogEntry } from "@/types/vita";
import {
  getAccount,
  createAccount,
  verifyAccount,
  claimEmission,
  getTransactions,
  getEmissionHistory,
  healthCheck,
  ApiError,
} from "@/lib/vita-api";

const STORAGE_KEY = "vita_account_id";
const POLL_INTERVAL = 30_000; // 30 seconds

interface UseVitaAccountReturn {
  account: VitaAccount | null;
  balance: string;
  transactions: VitaTransaction[];
  emissions: EmissionLogEntry[];
  loading: boolean;
  error: string | null;
  /** true if the backend is reachable */
  connected: boolean;
  /** Refresh account data from the API */
  refresh: () => Promise<void>;
  /** Create a new account and store it */
  setup: (displayName?: string) => Promise<void>;
  /** Claim the daily emission for today */
  claim: () => Promise<void>;
}

export function useVitaAccount(): UseVitaAccountReturn {
  const [account, setAccount] = useState<VitaAccount | null>(null);
  const [transactions, setTransactions] = useState<VitaTransaction[]>([]);
  const [emissions, setEmissions] = useState<EmissionLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get stored account ID
  const getStoredId = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  }, []);

  // Fetch all account data
  const fetchAccount = useCallback(async (id: string) => {
    try {
      const [acc, txs, ems] = await Promise.all([
        getAccount(id),
        getTransactions(id, 20, 0),
        getEmissionHistory(id),
      ]);
      setAccount(acc);
      setTransactions(txs);
      setEmissions(ems);
      setConnected(true);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          // Account was deleted or doesn't exist anymore
          localStorage.removeItem(STORAGE_KEY);
          setAccount(null);
          setError("Compte introuvable. Créez un nouveau compte.");
        } else {
          setError(err.message);
        }
        setConnected(true); // API is reachable, just an error
      } else {
        setConnected(false);
        setError("Impossible de contacter le serveur VITA");
      }
    }
  }, []);

  // Refresh — public method
  const refresh = useCallback(async () => {
    const id = getStoredId();
    if (!id) {
      setLoading(false);
      return;
    }
    await fetchAccount(id);
  }, [getStoredId, fetchAccount]);

  // Setup — create account
  const setup = useCallback(async (displayName?: string) => {
    setLoading(true);
    setError(null);
    try {
      const created = await createAccount(displayName);
      localStorage.setItem(STORAGE_KEY, created.id);
      // Verify immediately for prototype
      await verifyAccount(created.id);
      // Fetch full account data
      await fetchAccount(created.id);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setConnected(true);
      } else {
        setConnected(false);
        setError("Impossible de contacter le serveur VITA");
      }
    } finally {
      setLoading(false);
    }
  }, [fetchAccount]);

  // Claim daily emission
  const claim = useCallback(async () => {
    const id = getStoredId();
    if (!id) return;
    try {
      await claimEmission(id);
      await fetchAccount(id);
    } catch (err) {
      if (err instanceof ApiError) {
        // EMISSION_ALREADY_CLAIMED is not an error to show
        if (err.code !== "EMISSION_ALREADY_CLAIMED") {
          setError(err.message);
        }
      } else {
        setError("Impossible de contacter le serveur VITA");
      }
    }
  }, [getStoredId, fetchAccount]);

  // Initial load
  useEffect(() => {
    const id = getStoredId();
    if (id) {
      fetchAccount(id).finally(() => setLoading(false));
    } else {
      // No account yet — check if backend is reachable
      healthCheck()
        .then(() => setConnected(true))
        .catch(() => setConnected(false))
        .finally(() => setLoading(false));
    }
  }, [getStoredId, fetchAccount]);

  // Polling
  useEffect(() => {
    const id = getStoredId();
    if (!id) return;

    pollRef.current = setInterval(() => {
      fetchAccount(id);
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [getStoredId, fetchAccount]);

  return {
    account,
    balance: account?.balance ?? "0",
    transactions,
    emissions,
    loading,
    error,
    connected,
    refresh,
    setup,
    claim,
  };
}
