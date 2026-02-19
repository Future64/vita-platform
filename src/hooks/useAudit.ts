"use client";

import { useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { useApiQuery } from "./useApiQuery";
import { AUDIT_LOGS, AUDIT_STATS } from "@/lib/mockAdmin";

interface AuditLog {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details?: string;
  hash?: string;
  previous_hash?: string;
}

interface AuditData {
  logs: AuditLog[];
  status: {
    total_entries: number;
    chain_valid: boolean;
    last_verified: string | null;
  };
}

interface UseAuditReturn {
  logs: AuditLog[];
  status: AuditData["status"];
  loading: boolean;
  error: string | null;
  isMock: boolean;
  verifyIntegrity: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useAudit(filters?: Record<string, unknown>): UseAuditReturn {
  const { data, loading, error, isMock, refresh } = useApiQuery<AuditData>({
    queryFn: async () => {
      const [logs, status] = await Promise.all([
        api.getAuditLogs(filters),
        api.getAuditStatus(),
      ]);
      return {
        logs: logs as unknown as AuditLog[],
        status: status as AuditData["status"],
      };
    },
    mockFn: () => ({
      logs: AUDIT_LOGS as unknown as AuditLog[],
      status: {
        total_entries: AUDIT_LOGS.length,
        chain_valid: AUDIT_STATS?.integrite ?? true,
        last_verified: null,
      },
    }),
  });

  const verifyIntegrity = useCallback(async (): Promise<boolean> => {
    try {
      const result = await api.verifyAuditIntegrity() as { valid: boolean };
      await refresh();
      return result.valid;
    } catch (err) {
      if (err instanceof ApiError) {
        console.error("[VITA] Verify integrity error:", err.message);
      }
      return false;
    }
  }, [refresh]);

  return {
    logs: data?.logs ?? [],
    status: data?.status ?? { total_entries: 0, chain_valid: true, last_verified: null },
    loading,
    error,
    isMock,
    verifyIntegrity,
    refresh,
  };
}
