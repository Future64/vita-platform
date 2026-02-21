// Types pour la couche d'abstraction Identity Provider
// Aucune donnee personnelle ne transite au-dela du callback OAuth

// ── Providers supportes ──────────────────────────────────────────

export type IdentityProviderId =
  | 'franceconnect'   // FranceConnect v2
  | 'signicat'        // Signicat (agregateur europeen, 35+ pays)
  | 'web_of_trust';   // Parrainage / Web of Trust (fallback pays sans eID)

// ── Configuration d'un provider ──────────────────────────────────

export interface IdentityProviderConfig {
  /** Identifiant unique du provider */
  id: IdentityProviderId;
  /** Nom affiche dans l'UI */
  displayName: string;
  /** Pays couverts (codes ISO 3166-1 alpha-2) */
  supportedCountries: string[];
  /** Le provider utilise-t-il OAuth2/OIDC ? */
  isOAuth: boolean;
  /** URL de base de l'API du provider */
  baseUrl: string;
  /** Niveaux de confiance (eIDAS ou equivalent) */
  assuranceLevels: AssuranceLevel[];
}

export type AssuranceLevel = 'low' | 'substantial' | 'high';

// ── Flux OAuth2/OIDC ─────────────────────────────────────────────

export interface AuthorizeParams {
  /** Code pays ISO de l'utilisateur (pour selectionner le provider) */
  countryCode: string;
  /** URL de retour apres authentification */
  redirectUri: string;
  /** Nonce anti-CSRF genere cote client */
  state: string;
  /** Nonce OIDC pour validation du id_token */
  nonce: string;
}

export interface AuthorizeResult {
  /** URL vers laquelle rediriger l'utilisateur */
  authorizationUrl: string;
  /** Provider selectionne */
  providerId: IdentityProviderId;
  /** State renvoye pour verification */
  state: string;
}

export interface CallbackParams {
  /** Code d'autorisation retourne par le provider */
  code: string;
  /** State retourne (a comparer avec celui de AuthorizeParams) */
  state: string;
  /** URI de callback (doit correspondre a celle de l'authorize) */
  redirectUri: string;
  /** Provider utilise */
  providerId: IdentityProviderId;
}

export interface CallbackResult {
  /** Subject identifier retourne par le provider (sub claim) */
  sub: string;
  /** Provider qui a emis la verification */
  providerId: IdentityProviderId;
  /** Code pays ISO de l'utilisateur */
  countryCode: string;
  /** Niveau de confiance de la verification */
  assuranceLevel: AssuranceLevel;
  /** Timestamp de la verification */
  verifiedAt: Date;
}

// ── Resultat final de verification ───────────────────────────────

export interface VerificationResult {
  /** Hash nullifier unique (HMAC-SHA256 du sub+provider) */
  nullifierHash: string;
  /** Identifiant du provider utilise */
  providerId: IdentityProviderId;
  /** Code pays ISO */
  countryCode: string;
  /** Niveau de confiance */
  assuranceLevel: AssuranceLevel;
  /** Timestamp de verification */
  verifiedAt: Date;
  /** Preuve ZK optionnelle (pour stockage dans identity_verifications.zk_proof) */
  zkProof?: ZkProofData;
}

export interface ZkProofData {
  /** Schema de preuve utilise */
  scheme: 'groth16' | 'plonk' | 'web_of_trust';
  /** Preuve serialisee */
  proof: string;
  /** Inputs publics */
  publicInputs: string[];
  /** Timestamp de generation */
  generatedAt: string;
}

// ── Interface commune a tous les providers ────────────────────────

export interface IdentityProvider {
  /** Configuration du provider */
  readonly config: IdentityProviderConfig;

  /**
   * Genere l'URL d'autorisation OAuth2/OIDC.
   * Pour les providers non-OAuth (web_of_trust), retourne null.
   */
  authorize(params: AuthorizeParams): Promise<AuthorizeResult | null>;

  /**
   * Traite le callback OAuth2/OIDC apres redirection.
   * Echange le code contre un token, extrait le sub, et retourne
   * les informations minimales necessaires.
   * JAMAIS de donnees personnelles dans le retour.
   */
  handleCallback(params: CallbackParams): Promise<CallbackResult>;

  /**
   * Verifie une identite et retourne le resultat avec nullifier.
   * C'est le point d'entree principal pour la verification complete.
   * Pour OAuth: enchaine authorize → callback → verify.
   * Pour web_of_trust: verifie via le systeme de parrainage.
   */
  verify(callbackResult: CallbackResult): Promise<VerificationResult>;

  /**
   * Verifie si le provider supporte un pays donne.
   */
  supportsCountry(countryCode: string): boolean;
}

// ── Enregistrement en base ───────────────────────────────────────

export interface IdentityVerificationRecord {
  id: string;
  vitaAccountId: string;
  nullifierHash: string;
  provider: IdentityProviderId;
  countryCode: string;
  verifiedAt: Date;
  zkProof?: ZkProofData;
}
