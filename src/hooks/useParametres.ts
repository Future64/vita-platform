"use client";

import { api } from "@/lib/api";
import { useApiQuery } from "./useApiQuery";
import { SYSTEM_PARAMETERS } from "@/lib/mockParameters";
import type { SystemParameter } from "@/types/parameters";

interface UseParametresReturn {
  parametres: SystemParameter[];
  loading: boolean;
  error: string | null;
  isMock: boolean;
  refresh: () => Promise<void>;
}

export function useParametres(): UseParametresReturn {
  const { data, loading, error, isMock, refresh } = useApiQuery<SystemParameter[]>({
    queryFn: async () => {
      const result = await api.getParametres();
      return result as unknown as SystemParameter[];
    },
    mockFn: () => SYSTEM_PARAMETERS,
  });

  return {
    parametres: data ?? [],
    loading,
    error,
    isMock,
    refresh,
  };
}
