// Signicat — Mapping pays/methodes eID
//
// Chaque methode eID est identifiee par un identifiant Signicat
// (utilise comme acr_values dans la requete OIDC) et associee a :
//   - Un ou plusieurs pays (ISO 3166-1 alpha-2)
//   - Un niveau eIDAS (low, substantial, high)
//   - Un nom affichable pour l'UI
//
// Source : documentation Signicat OIDC
// https://developer.signicat.com/docs/identification/methods

import type { AssuranceLevel } from '../types';

// ── Types ────────────────────────────────────────────────────────

export interface SignicatMethod {
  /** Identifiant Signicat (utilise dans acr_values) */
  id: string;
  /** Nom affichable */
  displayName: string;
  /** Pays supportes (codes ISO) */
  countries: string[];
  /** Niveau eIDAS */
  assuranceLevel: AssuranceLevel;
  /** Description courte pour l'UI */
  description: string;
}

// ── Methodes eID disponibles ─────────────────────────────────────

export const SIGNICAT_METHODS: SignicatMethod[] = [
  {
    id: 'nbid',
    displayName: 'BankID',
    countries: ['NO'],
    assuranceLevel: 'substantial',
    description: 'BankID norvegien',
  },
  {
    id: 'sbid',
    displayName: 'BankID',
    countries: ['SE'],
    assuranceLevel: 'substantial',
    description: 'BankID suedois',
  },
  {
    id: 'fbid',
    displayName: 'BankID',
    countries: ['FI'],
    assuranceLevel: 'substantial',
    description: 'BankID finlandais',
  },
  {
    id: 'mitid',
    displayName: 'MitID',
    countries: ['DK'],
    assuranceLevel: 'substantial',
    description: 'MitID danois',
  },
  {
    id: 'itsme',
    displayName: 'itsme',
    countries: ['BE'],
    assuranceLevel: 'substantial',
    description: 'itsme belge',
  },
  {
    id: 'npa',
    displayName: 'nPA (eID card)',
    countries: ['DE'],
    assuranceLevel: 'high',
    description: 'Carte d\'identite electronique allemande',
  },
  {
    id: 'idin',
    displayName: 'iDIN',
    countries: ['NL'],
    assuranceLevel: 'low',
    description: 'iDIN neerlandais (verification bancaire)',
  },
  {
    id: 'digiid',
    displayName: 'DigiD',
    countries: ['NL'],
    assuranceLevel: 'substantial',
    description: 'DigiD neerlandais',
  },
  {
    id: 'spid',
    displayName: 'SPID',
    countries: ['IT'],
    assuranceLevel: 'substantial',
    description: 'SPID italien (identite numerique publique)',
  },
  {
    id: 'smartid',
    displayName: 'Smart-ID',
    countries: ['EE', 'LV', 'LT'],
    assuranceLevel: 'substantial',
    description: 'Smart-ID balte (Estonie, Lettonie, Lituanie)',
  },
];

// ── Ordre de priorite des niveaux eIDAS ──────────────────────────

const ASSURANCE_ORDER: Record<AssuranceLevel, number> = {
  high: 3,
  substantial: 2,
  low: 1,
};

// ── API publique ─────────────────────────────────────────────────

/**
 * Retourne les methodes eID disponibles pour un pays,
 * triees par niveau de confiance decroissant (high > substantial > low).
 */
export function getMethodsForCountry(countryCode: string): SignicatMethod[] {
  const code = countryCode.toUpperCase();
  return SIGNICAT_METHODS
    .filter((m) => m.countries.includes(code))
    .sort((a, b) => ASSURANCE_ORDER[b.assuranceLevel] - ASSURANCE_ORDER[a.assuranceLevel]);
}

/**
 * Retourne une methode par son identifiant Signicat.
 */
export function getMethodById(methodId: string): SignicatMethod | undefined {
  return SIGNICAT_METHODS.find((m) => m.id === methodId);
}

/**
 * Retourne tous les codes pays supportes par au moins une methode.
 */
export function getSupportedCountries(): string[] {
  const countries = new Set<string>();
  for (const method of SIGNICAT_METHODS) {
    for (const country of method.countries) {
      countries.add(country);
    }
  }
  return Array.from(countries).sort();
}

/**
 * Noms des pays pour l'affichage (ISO → nom).
 */
export const COUNTRY_NAMES: Record<string, string> = {
  NO: 'Norvege',
  SE: 'Suede',
  FI: 'Finlande',
  DK: 'Danemark',
  BE: 'Belgique',
  DE: 'Allemagne',
  NL: 'Pays-Bas',
  IT: 'Italie',
  EE: 'Estonie',
  LV: 'Lettonie',
  LT: 'Lituanie',
};
