// Couche d'abstraction Identity Provider pour VITA
//
// Selectionne automatiquement le provider adapte selon le pays
// de l'utilisateur. Gere le flux OAuth2/OIDC complet et retourne
// uniquement un nullifier hash — jamais l'identite brute.
//
// Providers disponibles :
//   - FranceConnect v2    → France
//   - Signicat            → Europe + 35 pays (agregateur eIDAS)
//   - Web of Trust        → Fallback universel (parrainage VITA)

import type {
  IdentityProvider,
  IdentityProviderId,
  IdentityProviderConfig,
  AuthorizeParams,
  AuthorizeResult,
  CallbackParams,
  CallbackResult,
  VerificationResult,
  AssuranceLevel,
  ZkProofData,
} from './types';
import { generateNullifier } from './nullifier';

// ══════════════════════════════════════════════════════════════════
// FRANCECONNECT V2
// ══════════════════════════════════════════════════════════════════

const FRANCECONNECT_CONFIG: IdentityProviderConfig = {
  id: 'franceconnect',
  displayName: 'FranceConnect',
  supportedCountries: ['FR'],
  isOAuth: true,
  baseUrl: process.env.FRANCECONNECT_BASE_URL || 'https://auth.franceconnect.gouv.fr/api/v2',
  assuranceLevels: ['substantial', 'high'],
};

class FranceConnectProvider implements IdentityProvider {
  readonly config = FRANCECONNECT_CONFIG;

  private get clientId(): string {
    const id = process.env.FRANCECONNECT_CLIENT_ID;
    if (!id) throw new Error('FRANCECONNECT_CLIENT_ID is not configured');
    return id;
  }

  private get clientSecret(): string {
    const secret = process.env.FRANCECONNECT_CLIENT_SECRET;
    if (!secret) throw new Error('FRANCECONNECT_CLIENT_SECRET is not configured');
    return secret;
  }

  supportsCountry(countryCode: string): boolean {
    return this.config.supportedCountries.includes(countryCode.toUpperCase());
  }

  async authorize(params: AuthorizeParams): Promise<AuthorizeResult> {
    const url = new URL(`${this.config.baseUrl}/authorize`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('redirect_uri', params.redirectUri);
    url.searchParams.set('scope', 'openid');
    url.searchParams.set('state', params.state);
    url.searchParams.set('nonce', params.nonce);
    // FranceConnect v2 : acr_values pour le niveau eIDAS
    url.searchParams.set('acr_values', 'eidas2 eidas3');

    return {
      authorizationUrl: url.toString(),
      providerId: 'franceconnect',
      state: params.state,
    };
  }

  async handleCallback(params: CallbackParams): Promise<CallbackResult> {
    // Echange du code contre un token
    const tokenResponse = await fetch(`${this.config.baseUrl}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: params.code,
        redirect_uri: params.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new Error(`FranceConnect token exchange failed: ${error}`);
    }

    const tokenData = await tokenResponse.json();

    // Extraction du sub depuis le id_token (JWT decode sans verification
    // complete ici — la verification de signature se fait cote backend Rust)
    const idTokenPayload = decodeJwtPayload(tokenData.id_token);

    // Recuperation du userinfo pour confirmer le sub
    const userinfoResponse = await fetch(`${this.config.baseUrl}/userinfo`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userinfoResponse.ok) {
      throw new Error('FranceConnect userinfo request failed');
    }

    const userinfo = await userinfoResponse.json();

    // Determination du niveau eIDAS
    const acr = idTokenPayload.acr || '';
    const assuranceLevel: AssuranceLevel =
      acr === 'eidas3' ? 'high' :
      acr === 'eidas2' ? 'substantial' :
      'low';

    return {
      sub: userinfo.sub,
      providerId: 'franceconnect',
      countryCode: 'FR',
      assuranceLevel,
      verifiedAt: new Date(),
    };
  }

  async verify(callbackResult: CallbackResult): Promise<VerificationResult> {
    const nullifierHash = await generateNullifier(
      callbackResult.sub,
      callbackResult.providerId
    );

    return {
      nullifierHash,
      providerId: callbackResult.providerId,
      countryCode: callbackResult.countryCode,
      assuranceLevel: callbackResult.assuranceLevel,
      verifiedAt: callbackResult.verifiedAt,
    };
  }
}

// ══════════════════════════════════════════════════════════════════
// SIGNICAT (agregateur europeen — 35+ pays)
// ══════════════════════════════════════════════════════════════════

// Pays couverts par Signicat (eID nationales + BankID nordiques)
const SIGNICAT_COUNTRIES = [
  // Nordiques (BankID)
  'NO', 'SE', 'FI', 'DK',
  // Europe de l'Ouest
  'DE', 'NL', 'BE', 'LU', 'AT', 'CH', 'IT', 'ES', 'PT',
  // Europe de l'Est
  'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'HR', 'SI',
  // Baltes
  'EE', 'LV', 'LT',
  // Iles britanniques
  'GB', 'IE',
  // Autres
  'GR', 'CY', 'MT', 'IS',
];

const SIGNICAT_CONFIG: IdentityProviderConfig = {
  id: 'signicat',
  displayName: 'Signicat',
  supportedCountries: SIGNICAT_COUNTRIES,
  isOAuth: true,
  baseUrl: process.env.SIGNICAT_BASE_URL || 'https://id.signicat.com/oidc',
  assuranceLevels: ['low', 'substantial', 'high'],
};

class SignicatProvider implements IdentityProvider {
  readonly config = SIGNICAT_CONFIG;

  private get clientId(): string {
    const id = process.env.SIGNICAT_CLIENT_ID;
    if (!id) throw new Error('SIGNICAT_CLIENT_ID is not configured');
    return id;
  }

  private get clientSecret(): string {
    const secret = process.env.SIGNICAT_CLIENT_SECRET;
    if (!secret) throw new Error('SIGNICAT_CLIENT_SECRET is not configured');
    return secret;
  }

  supportsCountry(countryCode: string): boolean {
    return this.config.supportedCountries.includes(countryCode.toUpperCase());
  }

  async authorize(params: AuthorizeParams): Promise<AuthorizeResult> {
    const url = new URL(`${this.config.baseUrl}/authorize`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('redirect_uri', params.redirectUri);
    url.searchParams.set('scope', 'openid');
    url.searchParams.set('state', params.state);
    url.searchParams.set('nonce', params.nonce);
    // Signicat : prefixer le pays pour selectionner la methode eID
    url.searchParams.set('login_hint', `country:${params.countryCode.toLowerCase()}`);
    // Niveau eIDAS demande
    url.searchParams.set('acr_values', 'urn:signicat:oidc:method:eidas-substantial');

    return {
      authorizationUrl: url.toString(),
      providerId: 'signicat',
      state: params.state,
    };
  }

  async handleCallback(params: CallbackParams): Promise<CallbackResult> {
    const tokenResponse = await fetch(`${this.config.baseUrl}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: params.code,
        redirect_uri: params.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new Error(`Signicat token exchange failed: ${error}`);
    }

    const tokenData = await tokenResponse.json();
    const idTokenPayload = decodeJwtPayload(tokenData.id_token);

    // Signicat userinfo
    const userinfoResponse = await fetch(`${this.config.baseUrl}/userinfo`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userinfoResponse.ok) {
      throw new Error('Signicat userinfo request failed');
    }

    const userinfo = await userinfoResponse.json();

    // Signicat retourne le pays dans le claim signicat_country ou via le sub
    const countryCode = (
      userinfo.signicat_country ||
      idTokenPayload.signicat_country ||
      ''
    ).toUpperCase();

    // Determination du niveau d'assurance
    const acr = idTokenPayload.acr || '';
    const assuranceLevel: AssuranceLevel =
      acr.includes('high') ? 'high' :
      acr.includes('substantial') ? 'substantial' :
      'low';

    return {
      sub: userinfo.sub,
      providerId: 'signicat',
      countryCode,
      assuranceLevel,
      verifiedAt: new Date(),
    };
  }

  async verify(callbackResult: CallbackResult): Promise<VerificationResult> {
    const nullifierHash = await generateNullifier(
      callbackResult.sub,
      callbackResult.providerId
    );

    return {
      nullifierHash,
      providerId: callbackResult.providerId,
      countryCode: callbackResult.countryCode,
      assuranceLevel: callbackResult.assuranceLevel,
      verifiedAt: callbackResult.verifiedAt,
    };
  }
}

// ══════════════════════════════════════════════════════════════════
// WEB OF TRUST (fallback pour les pays sans eID)
// ══════════════════════════════════════════════════════════════════

const WEB_OF_TRUST_CONFIG: IdentityProviderConfig = {
  id: 'web_of_trust',
  displayName: 'Web of Trust (Parrainage)',
  // Universel : couvre tous les pays non supportes par les autres providers
  supportedCountries: ['*'],
  isOAuth: false,
  baseUrl: '',
  assuranceLevels: ['low', 'substantial'],
};

class WebOfTrustProvider implements IdentityProvider {
  readonly config = WEB_OF_TRUST_CONFIG;

  supportsCountry(): boolean {
    // Fallback universel — accepte tous les pays
    return true;
  }

  async authorize(): Promise<null> {
    // Pas de flux OAuth — le parrainage est gere par le systeme interne
    return null;
  }

  async handleCallback(params: CallbackParams): Promise<CallbackResult> {
    // Pour le web of trust, le "sub" est l'identifiant interne VITA
    // du compte verifie par parrainage. Le code contient le
    // demande_verification_id.
    return {
      sub: params.code,
      providerId: 'web_of_trust',
      countryCode: params.state, // Utilise pour passer le country code
      assuranceLevel: 'low',
      verifiedAt: new Date(),
    };
  }

  async verify(callbackResult: CallbackResult): Promise<VerificationResult> {
    const nullifierHash = await generateNullifier(
      callbackResult.sub,
      callbackResult.providerId
    );

    const zkProof: ZkProofData = {
      scheme: 'web_of_trust',
      proof: callbackResult.sub,
      publicInputs: [nullifierHash],
      generatedAt: new Date().toISOString(),
    };

    return {
      nullifierHash,
      providerId: callbackResult.providerId,
      countryCode: callbackResult.countryCode,
      assuranceLevel: callbackResult.assuranceLevel,
      verifiedAt: callbackResult.verifiedAt,
      zkProof,
    };
  }
}

// ══════════════════════════════════════════════════════════════════
// REGISTRE DES PROVIDERS & SELECTION PAR PAYS
// ══════════════════════════════════════════════════════════════════

/** Singletons des providers */
const providers: Record<IdentityProviderId, IdentityProvider> = {
  franceconnect: new FranceConnectProvider(),
  signicat: new SignicatProvider(),
  web_of_trust: new WebOfTrustProvider(),
};

/**
 * Ordre de priorite pour la selection du provider :
 *   1. Provider specifique au pays (ex: FranceConnect pour FR)
 *   2. Agregateur multi-pays (Signicat pour l'Europe)
 *   3. Web of Trust (fallback universel)
 */
const PROVIDER_PRIORITY: IdentityProviderId[] = [
  'franceconnect',
  'signicat',
  'web_of_trust',
];

/**
 * Selectionne le provider le plus adapte pour un pays donne.
 *
 * @param countryCode - Code ISO 3166-1 alpha-2 (ex: "FR", "DE", "US")
 * @returns Le provider selectionne (toujours defini grace au fallback web_of_trust)
 *
 * @example
 * getProviderForCountry("FR") // → FranceConnectProvider
 * getProviderForCountry("DE") // → SignicatProvider
 * getProviderForCountry("BR") // → WebOfTrustProvider
 */
export function getProviderForCountry(countryCode: string): IdentityProvider {
  const code = countryCode.toUpperCase();

  for (const providerId of PROVIDER_PRIORITY) {
    const provider = providers[providerId];
    // Ignore le wildcard '*' sauf pour le dernier (web_of_trust)
    if (provider.config.supportedCountries.includes(code)) {
      return provider;
    }
  }

  // Fallback : web of trust (accepte '*')
  return providers.web_of_trust;
}

/**
 * Retourne un provider par son identifiant.
 */
export function getProvider(id: IdentityProviderId): IdentityProvider {
  return providers[id];
}

/**
 * Liste tous les providers disponibles.
 */
export function getAllProviders(): IdentityProvider[] {
  return Object.values(providers);
}

/**
 * Retourne les providers disponibles pour un pays donne,
 * tries par ordre de priorite.
 */
export function getAvailableProviders(countryCode: string): IdentityProvider[] {
  const code = countryCode.toUpperCase();
  return PROVIDER_PRIORITY
    .map((id) => providers[id])
    .filter((p) => p.supportsCountry(code));
}

// ══════════════════════════════════════════════════════════════════
// UTILITAIRES
// ══════════════════════════════════════════════════════════════════

/**
 * Decode le payload d'un JWT sans verifier la signature.
 * La verification cryptographique DOIT se faire cote backend Rust
 * (via jsonwebtoken ou openssl).
 */
function decodeJwtPayload(jwt: string): Record<string, string> {
  const parts = jwt.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const payload = parts[1];
  // Base64url → Base64 standard
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const json = atob(base64);

  return JSON.parse(json);
}

// ── Re-exports ───────────────────────────────────────────────────

export type {
  IdentityProvider,
  IdentityProviderId,
  IdentityProviderConfig,
  AuthorizeParams,
  AuthorizeResult,
  CallbackParams,
  CallbackResult,
  VerificationResult,
  AssuranceLevel,
  ZkProofData,
  IdentityVerificationRecord,
} from './types';

export { generateNullifier, isValidNullifierHash } from './nullifier';
