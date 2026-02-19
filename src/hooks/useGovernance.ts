"use client";

import { useCallback, useEffect } from "react";
import { api, ApiError } from "@/lib/api";
import { useApiQuery } from "./useApiQuery";
import {
  MOCK_DOLEANCES,
  ALL_PROPOSALS,
} from "@/lib/mockProposals";
import { vitaWs } from "@/lib/websocket";
import type { WsVoteUpdate } from "@/lib/websocket";

// Re-export types from mockProposals for compatibility
import type { Doleance } from "@/lib/mockProposals";

interface GovernanceData {
  propositions: unknown[];
  doleances: Doleance[];
}

interface UseGovernanceReturn {
  propositions: unknown[];
  doleances: Doleance[];
  loading: boolean;
  error: string | null;
  isMock: boolean;
  voter: (propositionId: string, choix: "pour" | "contre" | "abstention") => Promise<boolean>;
  creerProposition: (data: Record<string, unknown>) => Promise<boolean>;
  creerDoleance: (data: Record<string, unknown>) => Promise<boolean>;
  soutenirDoleance: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useGovernance(filters?: Record<string, unknown>): UseGovernanceReturn {
  const { data, loading, error, isMock, refresh } = useApiQuery<GovernanceData>({
    queryFn: async () => {
      const [propositions, doleances] = await Promise.all([
        api.getPropositions(filters),
        api.getDoleances(filters),
      ]);
      return {
        propositions,
        doleances: doleances as unknown as Doleance[],
      };
    },
    mockFn: () => ({
      propositions: ALL_PROPOSALS as unknown[],
      doleances: MOCK_DOLEANCES,
    }),
  });

  // Listen for real-time vote updates via WebSocket — trigger refresh
  useEffect(() => {
    return vitaWs.on("vote_update", (_data: WsVoteUpdate) => {
      refresh();
    });
  }, [refresh]);

  const voter = useCallback(
    async (propositionId: string, choix: "pour" | "contre" | "abstention"): Promise<boolean> => {
      try {
        await api.voter(propositionId, choix);
        await refresh();
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          console.error("[VITA] Vote error:", err.message);
        }
        return false;
      }
    },
    [refresh]
  );

  const creerProposition = useCallback(
    async (propData: Record<string, unknown>): Promise<boolean> => {
      try {
        await api.createProposition(propData);
        await refresh();
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          console.error("[VITA] Create proposition error:", err.message);
        }
        return false;
      }
    },
    [refresh]
  );

  const creerDoleance = useCallback(
    async (dolData: Record<string, unknown>): Promise<boolean> => {
      try {
        await api.createDoleance(dolData);
        await refresh();
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          console.error("[VITA] Create doleance error:", err.message);
        }
        return false;
      }
    },
    [refresh]
  );

  const soutenirDoleanceFn = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await api.soutenirDoleance(id);
        await refresh();
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          console.error("[VITA] Soutenir doleance error:", err.message);
        }
        return false;
      }
    },
    [refresh]
  );

  return {
    propositions: data?.propositions ?? [],
    doleances: data?.doleances ?? [],
    loading,
    error,
    isMock,
    voter,
    creerProposition,
    creerDoleance,
    soutenirDoleance: soutenirDoleanceFn,
    refresh,
  };
}
