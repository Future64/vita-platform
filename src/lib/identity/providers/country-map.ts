// Mapping pays → providers d'identite pour VITA
//
// Ce fichier definit la constante COUNTRY_PROVIDERS_MAP qui associe
// chaque pays a la liste des providers disponibles, dans l'ordre
// de priorite : etatique > bancaire > autre > payant (Stripe Identity).
//
// Aucun parrainage. Aucune exception.
//
// Utilise par :
//   - useIdentityProviders() hook
//   - CountryIdentitySelector composant
//   - Tests unitaires

import type { IdentityProviderId, AssuranceLevel } from './types';

// ── Types ────────────────────────────────────────────────────────

export type ProviderCategory = 'state' | 'banking' | 'other' | 'paid';
export type ProviderStatus = 'available' | 'coming_soon';

export interface IdentityProviderEntry {
  /** Provider backend (franceconnect, signicat, stripe_identity) */
  provider: IdentityProviderId;
  /** Methode Signicat (ex: 'nbid', 'spid') — absent pour FC et Stripe */
  methodId?: string;
  /** Nom affiche dans l'UI */
  displayName: string;
  /** Description courte */
  description: string;
  /** Niveau eIDAS */
  assuranceLevel: AssuranceLevel;
  /** Categorie pour le tri (state > banking > other > paid) */
  category: ProviderCategory;
  /** Statut : disponible ou a venir */
  status: ProviderStatus;
  /** Prix de la verification (si payante) */
  price?: { amount: number; currency: string };
}

// ── Noms des pays (ISO 3166-1 alpha-2 → nom francais) ───────────

export const COUNTRY_DISPLAY_NAMES: Record<string, string> = {
  // Pays avec providers eID specifiques
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
  // Nouveaux pays Signicat
  PT: 'Portugal',
  ES: 'Espagne',
  AT: 'Autriche',
  CH: 'Suisse',
  LU: 'Luxembourg',
  SG: 'Singapour',
  AU: 'Australie',
  BR: 'Bresil',
  IN: 'Inde',
  CA: 'Canada',
  // Pays Stripe Identity (sans eID)
  US: 'Etats-Unis',
  GB: 'Royaume-Uni',
  MA: 'Maroc',
  SN: 'Senegal',
  CI: 'Cote d\'Ivoire',
  CM: 'Cameroun',
  MX: 'Mexique',
  AR: 'Argentine',
  CO: 'Colombie',
  CL: 'Chili',
  PE: 'Perou',
  VN: 'Vietnam',
  PH: 'Philippines',
  TH: 'Thailande',
  ID: 'Indonesie',
  MY: 'Malaisie',
  JP: 'Japon',
  KR: 'Coree du Sud',
  TW: 'Taiwan',
  HK: 'Hong Kong',
  ZA: 'Afrique du Sud',
  NG: 'Nigeria',
  KE: 'Kenya',
  GH: 'Ghana',
  TZ: 'Tanzanie',
  EG: 'Egypte',
  DZ: 'Algerie',
  TN: 'Tunisie',
  TR: 'Turquie',
  IL: 'Israel',
  AE: 'Emirats arabes unis',
  SA: 'Arabie saoudite',
  QA: 'Qatar',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  NZ: 'Nouvelle-Zelande',
  UA: 'Ukraine',
  RU: 'Russie',
  PL: 'Pologne',
  CZ: 'Tchequie',
  RO: 'Roumanie',
  HU: 'Hongrie',
  BG: 'Bulgarie',
  HR: 'Croatie',
  RS: 'Serbie',
  IE: 'Irlande',
  IS: 'Islande',
  GR: 'Grece',
  SK: 'Slovaquie',
  SI: 'Slovenie',
  CY: 'Chypre',
  MT: 'Malte',
};

// ── Stripe Identity (verification payante universelle) ──────────

const STRIPE_IDENTITY_ENTRY: IdentityProviderEntry = {
  provider: 'stripe_identity',
  displayName: 'Verification d\'identite',
  description: 'Scan de document d\'identite + selfie',
  assuranceLevel: 'substantial',
  category: 'paid',
  status: 'available',
  price: { amount: 200, currency: 'EUR' },
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
  ],

  // ── Portugal ──
  PT: [
    {
      provider: 'signicat',
      methodId: 'autenticacao',
      displayName: 'Autenticacao.gov',
      description: 'Identite numerique portugaise',
      assuranceLevel: 'substantial',
      category: 'state',
      status: 'available',
    },
  ],

  // ── Espagne ──
  ES: [
    {
      provider: 'signicat',
      methodId: 'clave',
      displayName: 'Cl@ve',
      description: 'Identite numerique espagnole',
      assuranceLevel: 'substantial',
      category: 'state',
      status: 'available',
    },
  ],

  // ── Autriche ──
  AT: [
    {
      provider: 'signicat',
      methodId: 'id-austria',
      displayName: 'ID Austria',
      description: 'Identite numerique autrichienne',
      assuranceLevel: 'high',
      category: 'state',
      status: 'available',
    },
  ],

  // ── Suisse ──
  CH: [
    {
      provider: 'signicat',
      methodId: 'swissid',
      displayName: 'SwissID',
      description: 'Identite numerique suisse',
      assuranceLevel: 'substantial',
      category: 'state',
      status: 'available',
    },
  ],

  // ── Luxembourg ──
  LU: [
    {
      provider: 'signicat',
      methodId: 'luxtrust',
      displayName: 'LuxTrust',
      description: 'Identite numerique luxembourgeoise',
      assuranceLevel: 'substantial',
      category: 'state',
      status: 'available',
    },
  ],

  // ── Singapour ──
  SG: [
    {
      provider: 'signicat',
      methodId: 'singpass',
      displayName: 'Singpass',
      description: 'Identite numerique singapourienne',
      assuranceLevel: 'substantial',
      category: 'state',
      status: 'available',
    },
  ],

  // ── Australie ──
  AU: [
    {
      provider: 'signicat',
      methodId: 'mygovid',
      displayName: 'myGovID',
      description: 'Identite numerique australienne',
      assuranceLevel: 'substantial',
      category: 'state',
      status: 'available',
    },
  ],

  // ── Bresil ──
  BR: [
    {
      provider: 'signicat',
      methodId: 'govbr',
      displayName: 'Gov.br',
      description: 'Identite numerique bresilienne',
      assuranceLevel: 'substantial',
      category: 'state',
      status: 'available',
    },
  ],

  // ── Inde ──
  IN: [
    {
      provider: 'signicat',
      methodId: 'aadhaar',
      displayName: 'Aadhaar',
      description: 'Identite numerique indienne',
      assuranceLevel: 'substantial',
      category: 'state',
      status: 'available',
    },
  ],

  // ── Canada ──
  CA: [
    {
      provider: 'signicat',
      methodId: 'signinca',
      displayName: 'Sign-In Canada',
      description: 'Identite numerique canadienne',
      assuranceLevel: 'substantial',
      category: 'state',
      status: 'available',
    },
  ],
};

// ── Pays sans eID — Stripe Identity uniquement ──────────────────

const STRIPE_ONLY_COUNTRIES = [
  'US', 'GB', 'MA', 'SN', 'CI', 'CM', 'MX', 'AR', 'CO', 'CL', 'PE',
  'VN', 'PH', 'TH', 'ID', 'MY', 'JP', 'KR', 'TW', 'HK',
  'ZA', 'NG', 'KE', 'GH', 'TZ', 'EG', 'DZ', 'TN',
  'TR', 'IL', 'AE', 'SA', 'QA', 'PK', 'BD', 'NZ', 'UA', 'RU',
  'PL', 'CZ', 'RO', 'HU', 'BG', 'HR', 'RS', 'IE', 'IS', 'GR',
  'SK', 'SI', 'CY', 'MT',
];

for (const cc of STRIPE_ONLY_COUNTRIES) {
  if (!COUNTRY_PROVIDERS_MAP[cc]) {
    COUNTRY_PROVIDERS_MAP[cc] = [STRIPE_IDENTITY_ENTRY];
  }
}

// ── Stripe Identity universel ────────────────────────────────────
// Stripe Identity est disponible comme alternative pour TOUS les pays,
// y compris ceux qui ont deja un provider eID national.
// L'utilisateur choisit librement entre les deux.

for (const cc of Object.keys(COUNTRY_PROVIDERS_MAP)) {
  const hasStripe = COUNTRY_PROVIDERS_MAP[cc].some(
    (e) => e.provider === 'stripe_identity'
  );
  if (!hasStripe) {
    COUNTRY_PROVIDERS_MAP[cc].push(STRIPE_IDENTITY_ENTRY);
  }
}

// ── Ordre de priorite des categories ─────────────────────────────

const CATEGORY_ORDER: Record<ProviderCategory, number> = {
  state: 0,
  banking: 1,
  other: 2,
  paid: 3,
};

// ── API publique ─────────────────────────────────────────────────

/**
 * Retourne les providers disponibles pour un pays, tries par
 * categorie (state > banking > other > paid).
 *
 * Si le pays n'est pas dans la map, retourne Stripe Identity seul.
 */
export function getProvidersForCountry(countryCode: string): IdentityProviderEntry[] {
  const code = countryCode.toUpperCase();
  const entries = COUNTRY_PROVIDERS_MAP[code] || [STRIPE_IDENTITY_ENTRY];

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
 * (hors Stripe Identity payant).
 */
export function hasEidProvider(countryCode: string): boolean {
  const code = countryCode.toUpperCase();
  const entries = COUNTRY_PROVIDERS_MAP[code];
  if (!entries) return false;
  return entries.some((e) => e.status === 'available' && e.category !== 'paid');
}
