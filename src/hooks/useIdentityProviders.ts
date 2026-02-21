"use client";

import { useMemo } from 'react';
import {
  getProvidersForCountry,
  type IdentityProviderEntry,
  type ProviderStatus,
} from '@/lib/identity/providers/country-map';

// ── Types ────────────────────────────────────────────────────────

export interface IdentityProviderOption extends IdentityProviderEntry {
  /** Identifiant unique pour la cle React (provider + methodId) */
  key: string;
}

export interface UseIdentityProvidersReturn {
  /** Tous les providers pour le pays, tries par priorite */
  providers: IdentityProviderOption[];
  /** Providers disponibles (status = 'available') */
  available: IdentityProviderOption[];
  /** Providers a venir (status = 'coming_soon') */
  comingSoon: IdentityProviderOption[];
  /** Y a-t-il au moins un provider eID disponible (hors Web of Trust) ? */
  hasEid: boolean;
  /** Y a-t-il un Web of Trust dans la liste ? (toujours true) */
  hasWebOfTrust: boolean;
}

// ── Hook ─────────────────────────────────────────────────────────

/**
 * Retourne les providers d'identite disponibles pour un pays.
 *
 * Trie par priorite : etatique > bancaire > autre > Web of Trust.
 * Distingue les providers disponibles de ceux a venir.
 *
 * @param countryCode - Code ISO 3166-1 alpha-2 (ex: "FR", "DE", "")
 *
 * @example
 * const { providers, available, hasEid } = useIdentityProviders('FR');
 * // providers = [FranceConnect (available), Web of Trust (available)]
 * // hasEid = true
 */
export function useIdentityProviders(countryCode: string): UseIdentityProvidersReturn {
  return useMemo(() => {
    if (!countryCode) {
      return {
        providers: [],
        available: [],
        comingSoon: [],
        hasEid: false,
        hasWebOfTrust: false,
      };
    }

    const entries = getProvidersForCountry(countryCode);

    const providers: IdentityProviderOption[] = entries.map((entry) => ({
      ...entry,
      key: entry.methodId
        ? `${entry.provider}-${entry.methodId}`
        : entry.provider,
    }));

    const available = providers.filter((p) => p.status === 'available');
    const comingSoon = providers.filter((p) => p.status === 'coming_soon');
    const hasEid = available.some((p) => p.category !== 'fallback');
    const hasWebOfTrust = providers.some((p) => p.provider === 'web_of_trust');

    return { providers, available, comingSoon, hasEid, hasWebOfTrust };
  }, [countryCode]);
}
