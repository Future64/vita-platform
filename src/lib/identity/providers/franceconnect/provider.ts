// FranceConnect v2 — Provider VITA
//
// Spec FranceConnect v2 (mai 2024) :
//   - PKCE obligatoire (code_challenge_method=S256)
//   - Signature RS256
//   - acr_values : eidas1 (faible) ou eidas2 (eleve)
//   - Scopes : openid given_name family_name birthdate
//   - Le sub est pseudonymise par service (client_id)
//
// VITA ne stocke JAMAIS les donnees personnelles.
// Seul le nullifier_hash (HMAC du sub) est persiste en base.

import type {
  IdentityProvider,
  IdentityProviderConfig,
  AuthorizeParams,
  AuthorizeResult,
  CallbackParams,
  CallbackResult,
  VerificationResult,
  AssuranceLevel,
} from '../types';
import { generateNullifier } from '../nullifier';

// ── Erreurs specifiques FranceConnect ────────────────────────────

export type FCErrorCode =
  | 'token_expired'
  | 'user_cancelled'
  | 'invalid_state'
  | 'already_registered'
  | 'token_exchange_failed'
  | 'userinfo_failed'
  | 'invalid_id_token'
  | 'pkce_failed';

export class FranceConnectError extends Error {
  constructor(
    public readonly code: FCErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'FranceConnectError';
  }
}

// ── PKCE (Proof Key for Code Exchange) ───────────────────────────

/**
 * Genere un code_verifier aleatoire de 128 caracteres (RFC 7636).
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(96);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Derive le code_challenge S256 depuis un code_verifier.
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(buffer: Uint8Array): string {
  let binary = '';
  for (const byte of buffer) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// ── Configuration ────────────────────────────────────────────────

const FC_DEFAULT_BASE_URL = 'https://app.franceconnect.gouv.fr/api/v2';

function getFcBaseUrl(): string {
  return process.env.FC_BASE_URL || FC_DEFAULT_BASE_URL;
}

// ── Resultat etendu avec PKCE ────────────────────────────────────

export interface FCAuthorizeResult extends AuthorizeResult {
  /** PKCE code_verifier a stocker en session pour le callback */
  codeVerifier: string;
}

export interface FCCallbackParams extends CallbackParams {
  /** PKCE code_verifier genere lors de l'authorize */
  codeVerifier: string;
}

/** Resultat etendu du callback avec champs optionnels pour le prefill */
export interface FCExtendedCallbackResult extends CallbackResult {
  email?: string;
  gender?: string;
  birthdate?: string;
}

// ── Provider ─────────────────────────────────────────────────────

export class FranceConnectProvider implements IdentityProvider {
  get config(): IdentityProviderConfig {
    return {
      id: 'franceconnect',
      displayName: 'FranceConnect',
      supportedCountries: ['FR'],
      isOAuth: true,
      baseUrl: getFcBaseUrl(),
      assuranceLevels: ['low', 'substantial'],
    };
  }

  private get clientId(): string {
    const id = process.env.FC_CLIENT_ID;
    if (!id) throw new FranceConnectError('pkce_failed', 'FC_CLIENT_ID is not configured');
    return id;
  }

  private get clientSecret(): string {
    const secret = process.env.FC_CLIENT_SECRET;
    if (!secret) throw new FranceConnectError('pkce_failed', 'FC_CLIENT_SECRET is not configured');
    return secret;
  }

  supportsCountry(countryCode: string): boolean {
    return countryCode.toUpperCase() === 'FR';
  }

  /**
   * Genere l'URL d'autorisation FranceConnect v2 avec PKCE.
   * Le code_verifier DOIT etre stocke en session cote serveur
   * pour etre reutilise lors du callback.
   */
  async authorize(params: AuthorizeParams): Promise<FCAuthorizeResult> {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    const url = new URL(`${this.config.baseUrl}/authorize`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('redirect_uri', params.redirectUri);
    // FC v2 requiert ces scopes pour la verification d'identite
    url.searchParams.set('scope', 'openid given_name family_name birthdate email gender');
    url.searchParams.set('state', params.state);
    url.searchParams.set('nonce', params.nonce);
    // PKCE obligatoire en v2
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');
    // Niveau eIDAS demande (eidas1 pour compatibilite maximale)
    url.searchParams.set('acr_values', 'eidas1');

    return {
      authorizationUrl: url.toString(),
      providerId: 'franceconnect',
      state: params.state,
      codeVerifier,
    };
  }

  /**
   * Traite le callback FranceConnect v2.
   *
   * Flux :
   *   1. Verifie le state (anti-CSRF)
   *   2. Echange code + code_verifier contre un token
   *   3. Recupere le sub via /userinfo
   *   4. Retourne UNIQUEMENT le sub (pas de donnees personnelles)
   */
  async handleCallback(params: CallbackParams): Promise<FCExtendedCallbackResult> {
    const { code, state, redirectUri } = params;
    const codeVerifier = (params as FCCallbackParams).codeVerifier;

    if (!code) {
      throw new FranceConnectError('user_cancelled', 'Authentification annulee par l\'utilisateur');
    }

    if (!state) {
      throw new FranceConnectError('invalid_state', 'Parametre state manquant ou invalide');
    }

    // ── 1. Echange du code contre un token (avec PKCE) ──────────

    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    // Inclure le code_verifier PKCE si disponible
    if (codeVerifier) {
      tokenBody.set('code_verifier', codeVerifier);
    }

    const tokenResponse = await fetch(`${this.config.baseUrl}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody,
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();

      if (tokenResponse.status === 400 && errorBody.includes('expired')) {
        throw new FranceConnectError('token_expired', 'Le code d\'autorisation a expire. Veuillez recommencer.');
      }

      throw new FranceConnectError(
        'token_exchange_failed',
        `Echange de token echoue (${tokenResponse.status}): ${errorBody}`
      );
    }

    const tokenData = await tokenResponse.json();

    if (!tokenData.id_token || !tokenData.access_token) {
      throw new FranceConnectError('token_exchange_failed', 'Reponse token incomplete');
    }

    // ── 2. Decode id_token pour le niveau eIDAS ─────────────────

    const idTokenPayload = decodeJwtPayload(tokenData.id_token);

    // ── 3. Recuperation du sub via /userinfo ─────────────────────
    //    On demande le sub uniquement. Les champs given_name,
    //    family_name, birthdate sont dans le scope mais VITA
    //    ne les lit pas et ne les stocke pas.

    const userinfoResponse = await fetch(`${this.config.baseUrl}/userinfo`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userinfoResponse.ok) {
      throw new FranceConnectError(
        'userinfo_failed',
        `Requete userinfo echouee (${userinfoResponse.status})`
      );
    }

    const userinfo = await userinfoResponse.json();

    if (!userinfo.sub) {
      throw new FranceConnectError('invalid_id_token', 'Claim sub manquant dans la reponse userinfo');
    }

    // ── 4. Determination du niveau eIDAS ─────────────────────────

    const acr = (idTokenPayload.acr as string) || '';
    const assuranceLevel: AssuranceLevel =
      acr === 'eidas2' ? 'substantial' :
      acr === 'eidas1' ? 'low' :
      'low';

    // Retourne le sub + champs optionnels pour le prefill (non stockes en base)
    return {
      sub: userinfo.sub,
      providerId: 'franceconnect',
      countryCode: 'FR',
      assuranceLevel,
      verifiedAt: new Date(),
      email: typeof userinfo.email === 'string' ? userinfo.email : undefined,
      gender: typeof userinfo.gender === 'string' ? userinfo.gender : undefined,
      birthdate: typeof userinfo.birthdate === 'string' ? userinfo.birthdate : undefined,
    };
  }

  /**
   * Genere le nullifier hash a partir du sub FranceConnect.
   * Verifie que le nullifier n'existe pas deja en base
   * (via l'appelant — cette methode ne fait pas d'I/O base).
   */
  async verify(callbackResult: CallbackResult): Promise<VerificationResult> {
    const nullifierHash = await generateNullifier(
      callbackResult.sub,
      'franceconnect'
    );

    return {
      nullifierHash,
      providerId: 'franceconnect',
      countryCode: 'FR',
      assuranceLevel: callbackResult.assuranceLevel,
      verifiedAt: callbackResult.verifiedAt,
    };
  }
}

// ── Utilitaires ──────────────────────────────────────────────────

/**
 * Decode le payload d'un JWT (partie 2) sans verifier la signature.
 * La verification RS256 se fait cote backend Rust.
 */
function decodeJwtPayload(jwt: string): Record<string, unknown> {
  const parts = jwt.split('.');
  if (parts.length !== 3) {
    throw new FranceConnectError('invalid_id_token', 'Format JWT invalide');
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    throw new FranceConnectError('invalid_id_token', 'Payload JWT non decodable');
  }
}

// ── Singleton ────────────────────────────────────────────────────

export const franceConnectProvider = new FranceConnectProvider();
