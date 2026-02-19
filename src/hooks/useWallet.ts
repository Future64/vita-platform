"use client";

import { useState, useCallback, useEffect } from "react";
import { api, ApiError } from "@/lib/api";
import { useApiQuery } from "./useApiQuery";
import { MOCK_WALLET } from "@/lib/mockBourse";
import type { WalletData, Transaction } from "@/types/bourse";
import { vitaWs } from "@/lib/websocket";
import type { WsBalanceUpdate } from "@/lib/websocket";

interface UseWalletReturn {
  balance: number;
  transactions: Transaction[];
  emissionAujourdHui: boolean;
  prochaineEmission: string;
  totalRecu: number;
  totalEnvoye: number;
  totalEmissions: number;
  loading: boolean;
  error: string | null;
  isMock: boolean;
  sendVita: (toId: string, amount: string, note?: string) => Promise<boolean>;
  claimEmission: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useWallet(accountId?: string): UseWalletReturn {
  const [sendError, setSendError] = useState<string | null>(null);
  const [liveBalance, setLiveBalance] = useState<number | null>(null);

  // Listen for real-time balance updates via WebSocket
  useEffect(() => {
    return vitaWs.on("balance_update", (data: WsBalanceUpdate) => {
      const newBalance = parseFloat(data.nouvelle_balance);
      if (!isNaN(newBalance)) {
        setLiveBalance(newBalance);
      }
    });
  }, []);

  const { data, loading, error, isMock, refresh } = useApiQuery<WalletData>({
    queryFn: async () => {
      if (!accountId) {
        // Try to get current user's account from auth/me
        const me = await api.getMe();
        const acctId = me.id;
        const [txs] = await Promise.all([
          api.getTransactions(acctId, 20, 0),
        ]);

        const solde = me.solde_vita ? parseFloat(me.solde_vita) : 0;
        // Map API transactions to frontend format
        const transactions: Transaction[] = (txs as Array<{
          id: string;
          tx_type: string;
          from_account_id?: string;
          to_account_id?: string;
          amount: string;
          note?: string;
          created_at: string;
        }>).map((tx) => ({
          id: tx.id,
          type: tx.tx_type === "emission" ? "emission" : tx.from_account_id === acctId ? "envoi" : "reception",
          montant: parseFloat(tx.amount),
          date: tx.created_at,
          contrepartie: tx.tx_type === "emission" ? undefined : (tx.from_account_id === acctId ? tx.to_account_id : tx.from_account_id) || undefined,
          motif: tx.note || undefined,
          statut: "confirmee" as const,
        }));

        const totalEmissions = transactions.filter((t) => t.type === "emission").reduce((sum, t) => sum + t.montant, 0);
        const totalRecu = transactions.filter((t) => t.type === "reception").reduce((sum, t) => sum + t.montant, 0);
        const totalEnvoye = transactions.filter((t) => t.type === "envoi").reduce((sum, t) => sum + t.montant, 0);

        const now = new Date();
        const nextMidnight = new Date(now);
        nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
        nextMidnight.setUTCHours(0, 0, 0, 0);

        return {
          solde,
          emissionAujourdHui: false,
          prochaineEmission: nextMidnight.toISOString(),
          totalRecu,
          totalEnvoye,
          totalEmissions,
          transactions,
        };
      }

      // Fetch with explicit account ID
      const [acct, txs] = await Promise.all([
        api.getAccount(accountId) as Promise<{ balance: string }>,
        api.getTransactions(accountId, 20, 0),
      ]);

      const transactions: Transaction[] = (txs as Array<{
        id: string;
        tx_type: string;
        from_account_id?: string;
        to_account_id?: string;
        amount: string;
        note?: string;
        created_at: string;
      }>).map((tx) => ({
        id: tx.id,
        type: tx.tx_type === "emission" ? "emission" : tx.from_account_id === accountId ? "envoi" : "reception",
        montant: parseFloat(tx.amount),
        date: tx.created_at,
        contrepartie: tx.tx_type === "emission" ? undefined : (tx.from_account_id === accountId ? tx.to_account_id : tx.from_account_id) || undefined,
        motif: tx.note || undefined,
        statut: "confirmee" as const,
      }));

      const solde = parseFloat(acct.balance);
      const totalEmissions = transactions.filter((t) => t.type === "emission").reduce((sum, t) => sum + t.montant, 0);
      const totalRecu = transactions.filter((t) => t.type === "reception").reduce((sum, t) => sum + t.montant, 0);
      const totalEnvoye = transactions.filter((t) => t.type === "envoi").reduce((sum, t) => sum + t.montant, 0);

      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setUTCDate(nextMidnight.getUTCDate() + 1);
      nextMidnight.setUTCHours(0, 0, 0, 0);

      return {
        solde,
        emissionAujourdHui: false,
        prochaineEmission: nextMidnight.toISOString(),
        totalRecu,
        totalEnvoye,
        totalEmissions,
        transactions,
      };
    },
    mockFn: () => MOCK_WALLET,
  });

  const sendVita = useCallback(
    async (toId: string, amount: string, note?: string): Promise<boolean> => {
      setSendError(null);
      try {
        const me = await api.getMe();
        await api.transfer({
          from_id: me.id,
          to_id: toId,
          amount,
          note,
        });
        await refresh();
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          setSendError(err.message);
        } else {
          setSendError("Erreur lors du transfert");
        }
        return false;
      }
    },
    [refresh]
  );

  const claimEmissionFn = useCallback(async (): Promise<boolean> => {
    try {
      await api.claimEmission();
      await refresh();
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setSendError(err.message);
      }
      return false;
    }
  }, [refresh]);

  return {
    balance: liveBalance ?? data?.solde ?? 0,
    transactions: data?.transactions ?? [],
    emissionAujourdHui: data?.emissionAujourdHui ?? false,
    prochaineEmission: data?.prochaineEmission ?? "",
    totalRecu: data?.totalRecu ?? 0,
    totalEnvoye: data?.totalEnvoye ?? 0,
    totalEmissions: data?.totalEmissions ?? 0,
    loading,
    error: error || sendError,
    isMock,
    sendVita,
    claimEmission: claimEmissionFn,
    refresh,
  };
}
