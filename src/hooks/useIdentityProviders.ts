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
  /** Providers eID nationaux disponibles (hors Stripe Identity) */
  nationalProviders: IdentityProviderOption[];
  /** Provider Stripe Identity (si disponible) */
  stripeProvider: IdentityProviderOption | null;
  /** Y a-t-il au moins un provider eID disponible (hors Stripe Identity payant) ? */
  hasEid: boolean;
  /** Le pays requiert-il un paiement pour la verification ? (Stripe Identity disponible) */
  requiresPayment: boolean;
}

// ── Hook ─────────────────────────────────────────────────────────

/**
 * Retourne les providers d'identite disponibles pour un pays.
 *
 * Trie par priorite : etatique > bancaire > autre > payant.
 * Distingue les providers disponibles de ceux a venir.
 * Separe les providers nationaux de Stripe Identity pour le double-choix.
 *
 * @param countryCode - Code ISO 3166-1 alpha-2 (ex: "FR", "DE", "")
 *
 * @example
 * const { nationalProviders, stripeProvider, hasEid } = useIdentityProviders('FR');
 * // nationalProviders = [FranceConnect]
 * // stripeProvider = Stripe Identity
 * // hasEid = true
 */
export function useIdentityProviders(countryCode: string): UseIdentityProvidersReturn {
  return useMemo(() => {
    if (!countryCode) {
      return {
        providers: [],
        available: [],
        comingSoon: [],
        nationalProviders: [],
        stripeProvider: null,
        hasEid: false,
        requiresPayment: false,
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
    const nationalProviders = available.filter((p) => p.provider !== 'stripe_identity');
    const stripeProvider = available.find((p) => p.provider === 'stripe_identity') || null;
    const hasEid = available.some((p) => p.category !== 'paid');
    const requiresPayment = available.some((p) => !!p.price);

    return { providers, available, comingSoon, nationalProviders, stripeProvider, hasEid, requiresPayment };
  }, [countryCode]);
}
