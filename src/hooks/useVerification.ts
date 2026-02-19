"use client";

import { useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { useApiQuery } from "./useApiQuery";
import { MOCK_DEMANDES_VERIFICATION, MOCK_DEMANDES_PARRAINAGE } from "@/lib/mockVerification";
import type { DemandeVerification, DemandeParrainage, AttestationParrain } from "@/types/verification";

interface VerificationData {
  demande: DemandeVerification | null;
  demandesRecues: DemandeParrainage[];
  compteur: { en_attente: number; total: number };
}

interface UseVerificationReturn {
  demande: DemandeVerification | null;
  demandesRecues: DemandeParrainage[];
  compteur: { en_attente: number; total: number };
  loading: boolean;
  error: string | null;
  isMock: boolean;
  creerDemande: (data: Record<string, unknown>) => Promise<boolean>;
  attester: (parrainageId: string, attestation: AttestationParrain) => Promise<boolean>;
  refuser: (parrainageId: string, raison?: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useVerification(userId?: string): UseVerificationReturn {
  const { data, loading, error, isMock, refresh } = useApiQuery<VerificationData>({
    queryFn: async () => {
      const [demande, parrainages, compteur] = await Promise.all([
        api.getDemandeActive().catch(() => null),
        api.getParrainagesRecus().catch(() => []),
        api.getCompteurParrainages().catch(() => ({ en_attente: 0, total: 0 })),
      ]);
      return {
        demande: demande as DemandeVerification | null,
        demandesRecues: parrainages as unknown as DemandeParrainage[],
        compteur,
      };
    },
    mockFn: () => {
      const demande = userId
        ? MOCK_DEMANDES_VERIFICATION.find((d) => d.demandeurId === userId) ?? null
        : null;
      const demandesRecues = userId
        ? MOCK_DEMANDES_PARRAINAGE.filter((d) => d.parrainId === userId)
        : [];
      const enAttente = demandesRecues.filter((d) => d.statut === "en_attente").length;
      return {
        demande,
        demandesRecues,
        compteur: { en_attente: enAttente, total: demandesRecues.length },
      };
    },
  });

  const creerDemande = useCallback(
    async (demandeData: Record<string, unknown>): Promise<boolean> => {
      try {
        await api.createDemandeVerification(demandeData);
        await refresh();
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          console.error("[VITA] Create demande error:", err.message);
        }
        return false;
      }
    },
    [refresh]
  );

  const attester = useCallback(
    async (parrainageId: string, attestation: AttestationParrain): Promise<boolean> => {
      try {
        await api.attester(parrainageId, attestation as unknown as Record<string, unknown>);
        await refresh();
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          console.error("[VITA] Attester error:", err.message);
        }
        return false;
      }
    },
    [refresh]
  );

  const refuser = useCallback(
    async (parrainageId: string, raison?: string): Promise<boolean> => {
      try {
        await api.refuserParrainage(parrainageId, raison ? { raison } : undefined);
        await refresh();
        return true;
      } catch (err) {
        if (err instanceof ApiError) {
          console.error("[VITA] Refuser error:", err.message);
        }
        return false;
      }
    },
    [refresh]
  );

  return {
    demande: data?.demande ?? null,
    demandesRecues: data?.demandesRecues ?? [],
    compteur: data?.compteur ?? { en_attente: 0, total: 0 },
    loading,
    error,
    isMock,
    creerDemande,
    attester,
    refuser,
    refresh,
  };
}
