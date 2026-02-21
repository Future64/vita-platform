// Mapping pays → providers d'identite pour VITA
//
// Ce fichier definit la constante COUNTRY_PROVIDERS_MAP qui associe
// chaque pays a la liste des providers disponibles, dans l'ordre
// de priorite : etatique > bancaire > autre > Web of Trust fallback.
//
// Utilise par :
//   - useIdentityProviders() hook
//   - CountryIdentitySelector composant
//   - Tests unitaires

import type { IdentityProviderId, AssuranceLevel } from './types';

// ── Types ────────────────────────────────────────────────────────

export type ProviderCategory = 'state' | 'banking' | 'other' | 'fallback';
export type ProviderStatus = 'available' | 'coming_soon';

export interface IdentityProviderEntry {
  /** Provider backend (franceconnect, signicat, web_of_trust) */
  provider: IdentityProviderId;
  /** Methode Signicat (ex: 'nbid', 'spid') — absent pour FC et WoT */
  methodId?: string;
  /** Nom affiche dans l'UI */
  displayName: string;
  /** Description courte */
  description: string;
  /** Niveau eIDAS */
  assuranceLevel: AssuranceLevel;
  /** Categorie pour le tri (state > banking > other > fallback) */
  category: ProviderCategory;
  /** Statut : disponible ou a venir */
  status: ProviderStatus;
}

// ── Noms des pays (ISO 3166-1 alpha-2 → nom francais) ───────────

export const COUNTRY_DISPLAY_NAMES: Record<string, string> = {
  // Pays avec providers specifiques
  FR: 'France',
  DE: 'Allemagne',
  BE: 'Belgique',
  DK: 'Danemark',
  NO: 'Norvege',
  SE: 'Suede',
  FI: 'Finlande',
  EE: 'Estonie',
  LV: 'Lettonie',
  LT: 'Lituanie',
  IT: 'Italie',
  NL: 'Pays-Bas',
  // Autres pays UE (eidas-generic)
  AT: 'Autriche',
  BG: 'Bulgarie',
  HR: 'Croatie',
  CY: 'Chypre',
  CZ: 'Tchequie',
  GR: 'Grece',
  HU: 'Hongrie',
  IE: 'Irlande',
  LU: 'Luxembourg',
  MT: 'Malte',
  PL: 'Pologne',
  PT: 'Portugal',
  RO: 'Roumanie',
  SK: 'Slovaquie',
  SI: 'Slovenie',
  ES: 'Espagne',
  // EEE hors UE
  IS: 'Islande',
  CH: 'Suisse',
  GB: 'Royaume-Uni',
};

// ── Web of Trust (fallback universel) ────────────────────────────

const WEB_OF_TRUST_ENTRY: IdentityProviderEntry = {
  provider: 'web_of_trust',
  displayName: 'Parrainage (Web of Trust)',
  description: 'Verification par parrainage de membres VITA verifies',
  assuranceLevel: 'low',
  category: 'fallback',
  status: 'available',
};

// ── Mapping pays → providers ─────────────────────────────────────

export const COUNTRY_PROVIDERS_MAP: Record<string, IdentityProviderEntry[]> = {
  // ── France ──
  FR: [
    {
      provider: 'franceconnect',
      displayName: 'FranceConnect',
      description: 'Service d\'identite numerique de l\'Etat francais',
      assuranceLevel: 'substantial',
      category: 'state',
      status: 'available',
    },
    WEB_OF_TRUST_ENTRY,
  ],

  // ── Allemagne ──
  DE: [
    {
      provider: 'signicat',
      methodId: 'npa',
      displayName: 'nPA (eID card)',
      description: 'Carte d\'identite electronique allemande',
      assuranceLevel: 'high',
      category: 'state',
      status: 'available',
    },
    WEB_OF_TRUST_ENTRY,
  ],

  // ── Belgique ──
  BE: [
    {
      provider: 'signicat',
      methodId: 'itsme',
      displayName: 'itsme',
      description: 'Identite numerique belge',
      assuranceLevel: 'substantial',
      category: 'state',
      status: 'available',
    },
    WEB_OF_TRUST_ENTRY,
  ],

  // ── Danemark ──
  DK: [
    {
      provider: 'signicat',
      methodId: 'mitid',
      displayName: 'MitID',
      description: 'Identite numerique danoise',
      assuranceLevel: 'substantial',
      category: 'state',
      status: 'available',
    },
    WEB_OF_TRUST_ENTRY,
  ],

  // ── Norvege ──
  NO: [
    {
      provider: 'signicat',
      methodId: 'nbid',
      displayName: 'BankID',
      description: 'BankID norvegien',
      assuranceLevel: 'substantial',
      category: 'banking',
      status: 'available',
    },
    WEB_OF_TRUST_ENTRY,
  ],

  // ── Suede ──
  SE: [
    {
      provider: 'signicat',
      methodId: 'sbid',
      displayName: 'BankID',
      description: 'BankID suedois',
      assuranceLevel: 'substantial',
      category: 'banking',
      status: 'available',
    },
    WEB_OF_TRUST_ENTRY,
  ],

  // ── Finlande ──
  FI: [
    {
      provider: 'signicat',
      methodId: 'fbid',
      displayName: 'BankID',
      description: 'BankID finlandais',
      assuranceLevel: 'substantial',
      category: 'banking',
      status: 'available',
    },
    WEB_OF_TRUST_ENTRY,
  ],

  // ── Estonie ──
  EE: [
    {
      provider: 'signicat',
      methodId: 'smartid',
      displayName: 'Smart-ID',
      description: 'Smart-ID estonien',
      assuranceLevel: 'substantial',
      category: 'state',
      status: 'available',
    },
    WEB_OF_TRUST_ENTRY,
  ],

  // ── Lettonie ──
  LV: [
    {
      provider: 'signicat',
      methodId: 'smartid',
      displayName: 'Smart-ID',
      description: 'Smart-ID letton',
      assuranceLevel: 'substantial',
      category: 'state',
      status: 'available',
    },
    WEB_OF_TRUST_ENTRY,
  ],

  // ── Lituanie ──
  LT: [
    {
      provider: 'signicat',
      methodId: 'smartid',
      displayName: 'Smart-ID',
      description: 'Smart-ID lituanien',
      assuranceLevel: 'substantial',
      category: 'state',
      status: 'available',
    },
    WEB_OF_TRUST_ENTRY,
  ],

  // ── Italie ──
  IT: [
    {
      provider: 'signicat',
      methodId: 'spid',
      displayName: 'SPID',
      description: 'Identite numerique publique italienne',
      assuranceLevel: 'substantial',
      category: 'state',
      status: 'available',
    },
    WEB_OF_TRUST_ENTRY,
  ],

  // ── Pays-Bas ──
  NL: [
    {
      provider: 'signicat',
      methodId: 'digiid',
      displayName: 'DigiD',
      description: 'Identite numerique neerlandaise',
      assuranceLevel: 'substantial',
      category: 'state',
      status: 'available',
    },
    {
      provider: 'signicat',
      methodId: 'idin',
      displayName: 'iDIN',
      description: 'Verification bancaire neerlandaise',
      assuranceLevel: 'low',
      category: 'banking',
      status: 'available',
    },
    WEB_OF_TRUST_ENTRY,
  ],
};

// ── Pays UE sans methode specifique (eidas-generic, a venir) ────

const EU_EIDAS_GENERIC_COUNTRIES = [
  'AT', 'BG', 'HR', 'CY', 'CZ', 'GR', 'HU', 'IE',
  'LU', 'MT', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES',
  'IS', 'CH', 'GB',
];

for (const cc of EU_EIDAS_GENERIC_COUNTRIES) {
  COUNTRY_PROVIDERS_MAP[cc] = [
    {
      provider: 'signicat',
      methodId: 'eidas-generic',
      displayName: 'eIDAS',
      description: 'Identite numerique europeenne (bientot disponible)',
      assuranceLevel: 'substantial',
      category: 'state',
      status: 'coming_soon',
    },
    WEB_OF_TRUST_ENTRY,
  ];
}

// ── Ordre de priorite des categories ─────────────────────────────

const CATEGORY_ORDER: Record<ProviderCategory, number> = {
  state: 0,
  banking: 1,
  other: 2,
  fallback: 3,
};

// ── API publique ─────────────────────────────────────────────────

/**
 * Retourne les providers disponibles pour un pays, tries par
 * categorie (state > banking > other > fallback).
 *
 * Si le pays n'est pas dans la map, retourne WebOfTrust seul.
 */
export function getProvidersForCountry(countryCode: string): IdentityProviderEntry[] {
  const code = countryCode.toUpperCase();
  const entries = COUNTRY_PROVIDERS_MAP[code] || [WEB_OF_TRUST_ENTRY];

  return [...entries].sort(
    (a, b) => CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category]
  );
}

/**
 * Retourne tous les codes pays disponibles dans la map,
 * tries alphabetiquement par nom affiche.
 */
export function getAllCountryCodes(): string[] {
  return Object.keys(COUNTRY_PROVIDERS_MAP).sort((a, b) => {
    const nameA = COUNTRY_DISPLAY_NAMES[a] || a;
    const nameB = COUNTRY_DISPLAY_NAMES[b] || b;
    return nameA.localeCompare(nameB, 'fr');
  });
}

/**
 * Verifie si un pays a au moins un provider eID disponible
 * (hors Web of Trust).
 */
export function hasEidProvider(countryCode: string): boolean {
  const code = countryCode.toUpperCase();
  const entries = COUNTRY_PROVIDERS_MAP[code];
  if (!entries) return false;
  return entries.some((e) => e.status === 'available' && e.category !== 'fallback');
}
