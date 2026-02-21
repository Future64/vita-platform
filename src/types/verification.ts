// Types pour le flux de verification d'identite VITA

export type StatutDemande = 'en_attente' | 'en_cours' | 'validee' | 'rejetee' | 'expiree';
export type StatutParrainage = 'en_attente' | 'accepte' | 'refuse' | 'revoque';

export interface AttestationParrain {
  commentaire: string;
  connaitDepuis: string; // ex: "2 ans", "6 mois"
  contexte: string; // ex: "Collegue de travail", "Ami proche", "Voisin"
  engagement: boolean; // Le parrain certifie sur l'honneur
}

export interface Parrainage {
  id: string;
  parrainId: string;
  parrainUsername: string;
  filleulId: string;
  filleulUsername: string;
  demandeVerifId: string;
  statut: StatutParrainage;
  dateCreation: string;
  dateReponse?: string;
  attestation?: AttestationParrain;
}

export interface DemandeVerification {
  id: string;
  demandeurId: string;
  demandeurUsername: string;
  statut: StatutDemande;
  methode: 'parrainage' | 'zkp' | 'document';
  dateCreation: string;
  dateExpiration: string; // 30 jours apres creation
  parrainagesIds: string[];
  niveauConfiance: number; // 0-100, augmente avec chaque attestation
}

export interface DemandeParrainage {
  id: string;
  demandeVerifId: string;
  demandeurId: string;
  demandeurUsername: string;
  demandeurPrenom: string;
  parrainId: string;
  parrainUsername: string;
  dateCreation: string;
  statut: StatutParrainage;
  attestation?: AttestationParrain;
}

export const PARRAINS_REQUIS = 3;
export const CONFIANCE_PAR_PARRAIN = 28; // ~85 pour 3 parrains
export const DUREE_VERIFICATION_JOURS = 14; // 14 jours (Web of Trust)
export const COOLDOWN_PARRAINAGE_JOURS = 30; // 30 jours entre attestations
export const DUREE_VALIDITE_JOURS = 365;

// ── Web of Trust types ──────────────────────────────────────────

export interface CooldownStatus {
  canAttest: boolean;
  lastAttestation: string | null;
  availableAt: string | null;
  cooldownDays: number;
}

export interface RevocationResult {
  revoked: boolean;
  parrainageId: string;
  verificationInvalidated: boolean;
}
