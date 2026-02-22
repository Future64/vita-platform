// Donnees de pre-remplissage stockees dans le cookie chiffre vita_prefill
// apres une verification d'identite reussie (FranceConnect, Signicat, etc.)
//
// Ce cookie est httpOnly — la page client le lit via GET /api/auth/prefill

export interface IdentityPrefillData {
  nullifierHash: string;
  provider: 'franceconnect' | 'signicat' | 'stripe_identity';
  countryCode: string;
  /** ISO 8601 timestamp */
  verifiedAt: string;
  assuranceLevel: 'low' | 'substantial' | 'high';
  suggestedEmail?: string;
  suggestedPseudo?: string;
  gender?: string;
  isAdult?: boolean;
}
