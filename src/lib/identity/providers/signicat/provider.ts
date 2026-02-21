// Signicat — Provider VITA
//
// Signicat est un agregateur OIDC europeen qui expose 10+ methodes eID
// via une API OIDC standard. La methode est selectionnee via acr_values.
//
// Endpoints sandbox :
//   - Authorize : https://preprod.signicat.com/oidc/authorize
//   - Token     : https://preprod.signicat.com/oidc/token
//   - UserInfo  : https://preprod.signicat.com/oidc/userinfo
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
import { getMethodsForCountry, getMethodById, getSupportedCountries } from './methods';
import type { SignicatMethod } from './methods';

// ── Erreurs specifiques Signicat ─────────────────────────────────

export type SignicatErrorCode =
  | 'token_expired'
  | 'user_cancelled'
  | 'invalid_state'
  | 'already_registered'
  | 'token_exchange_failed'
  | 'userinfo_failed'
  | 'invalid_id_token'
  | 'unsupported_country'
  | 'invalid_method';

export class SignicatError extends Error {
  constructor(
    public readonly code: SignicatErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'SignicatError';
  }
}

// ── Configuration ────────────────────────────────────────────────

const SIGNICAT_DEFAULT_BASE_URL = 'https://preprod.signicat.com/oidc';

function getSignicatBaseUrl(): string {
  return process.env.SIGNICAT_BASE_URL || SIGNICAT_DEFAULT_BASE_URL;
}

// ── Resultat etendu avec methode selectionnee ────────────────────

export interface SignicatAuthorizeParams extends AuthorizeParams {
  /** Methode eID selectionnee (ex: 'nbid', 'spid') */
  methodId: string;
}

export interface SignicatAuthorizeResult extends AuthorizeResult {
  /** Methode eID utilisee */
  methodId: string;
}

export interface SignicatCallbackParams extends CallbackParams {
  /** Methode eID utilisee lors de l'authorize */
  methodId: string;
}

// ── Provider ─────────────────────────────────────────────────────

export class SignicatProvider implements IdentityProvider {
  get config(): IdentityProviderConfig {
    return {
      id: 'signicat',
      displayName: 'Signicat',
      supportedCountries: getSupportedCountries(),
      isOAuth: true,
      baseUrl: getSignicatBaseUrl(),
      assuranceLevels: ['low', 'substantial', 'high'],
    };
  }

  private get clientId(): string {
    const id = process.env.SIGNICAT_CLIENT_ID;
    if (!id) throw new SignicatError('invalid_method', 'SIGNICAT_CLIENT_ID is not configured');
    return id;
  }

  private get clientSecret(): string {
    const secret = process.env.SIGNICAT_CLIENT_SECRET;
    if (!secret) throw new SignicatError('invalid_method', 'SIGNICAT_CLIENT_SECRET is not configured');
    return secret;
  }

  supportsCountry(countryCode: string): boolean {
    return getMethodsForCountry(countryCode).length > 0;
  }

  /**
   * Retourne les methodes eID disponibles pour un pays,
   * triees par niveau de confiance (eIDAS substantiel/high avant low).
   */
  getAvailableMethods(countryCode: string): SignicatMethod[] {
    return getMethodsForCountry(countryCode);
  }

  /**
   * Genere l'URL d'autorisation Signicat OIDC.
   *
   * Le parametre acr_values selectionne la methode eID.
   * Le methodId DOIT etre stocke en session pour le callback.
   */
  async authorize(params: AuthorizeParams): Promise<SignicatAuthorizeResult> {
    const signicatParams = params as SignicatAuthorizeParams;
    const methodId = signicatParams.methodId;

    // Validation de la methode
    const method = methodId ? getMethodById(methodId) : undefined;
    if (!method) {
      // Fallback : prendre la meilleure methode pour le pays
      const methods = getMethodsForCountry(params.countryCode);
      if (methods.length === 0) {
        throw new SignicatError(
          'unsupported_country',
          `Aucune methode eID disponible pour le pays ${params.countryCode}`
        );
      }
      return this.buildAuthorizeResult(params, methods[0]);
    }

    // Verification que la methode est bien disponible pour le pays
    if (!method.countries.includes(params.countryCode.toUpperCase())) {
      throw new SignicatError(
        'invalid_method',
        `La methode ${methodId} n'est pas disponible pour ${params.countryCode}`
      );
    }

    return this.buildAuthorizeResult(params, method);
  }

  private buildAuthorizeResult(
    params: AuthorizeParams,
    method: SignicatMethod
  ): SignicatAuthorizeResult {
    const url = new URL(`${this.config.baseUrl}/authorize`);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', this.clientId);
    url.searchParams.set('redirect_uri', params.redirectUri);
    url.searchParams.set('scope', 'openid');
    url.searchParams.set('state', params.state);
    url.searchParams.set('nonce', params.nonce);
    // Methode eID selectionnee
    url.searchParams.set('acr_values', `urn:signicat:oidc:method:${method.id}`);

    return {
      authorizationUrl: url.toString(),
      providerId: 'signicat',
      state: params.state,
      methodId: method.id,
    };
  }

  /**
   * Traite le callback Signicat OIDC.
   *
   * Flux :
   *   1. Echange code contre un token
   *   2. Decode id_token pour le niveau eIDAS
   *   3. Recupere le sub via /userinfo
   *   4. Retourne UNIQUEMENT le sub (pas de donnees personnelles)
   */
  async handleCallback(params: CallbackParams): Promise<CallbackResult> {
    const { code, state, redirectUri } = params;
    const methodId = (params as SignicatCallbackParams).methodId;

    if (!code) {
      throw new SignicatError('user_cancelled', 'Authentification annulee par l\'utilisateur');
    }

    if (!state) {
      throw new SignicatError('invalid_state', 'Parametre state manquant ou invalide');
    }

    // ── 1. Echange du code contre un token ───────────────────────

    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const tokenResponse = await fetch(`${this.config.baseUrl}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody,
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();

      if (tokenResponse.status === 400 && errorBody.includes('expired')) {
        throw new SignicatError('token_expired', 'Le code d\'autorisation a expire. Veuillez recommencer.');
      }

      throw new SignicatError(
        'token_exchange_failed',
        `Echange de token echoue (${tokenResponse.status}): ${errorBody}`
      );
    }

    const tokenData = await tokenResponse.json();

    if (!tokenData.id_token || !tokenData.access_token) {
      throw new SignicatError('token_exchange_failed', 'Reponse token incomplete');
    }

    // ── 2. Decode id_token pour le niveau eIDAS ──────────────────

    const idTokenPayload = decodeJwtPayload(tokenData.id_token);

    // ── 3. Recuperation du sub via /userinfo ──────────────────────

    const userinfoResponse = await fetch(`${this.config.baseUrl}/userinfo`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userinfoResponse.ok) {
      throw new SignicatError(
        'userinfo_failed',
        `Requete userinfo echouee (${userinfoResponse.status})`
      );
    }

    const userinfo = await userinfoResponse.json();

    if (!userinfo.sub) {
      throw new SignicatError('invalid_id_token', 'Claim sub manquant dans la reponse userinfo');
    }

    // ── 4. Determination du niveau eIDAS ─────────────────────────

    const acr = (idTokenPayload.acr as string) || '';
    let assuranceLevel: AssuranceLevel = 'low';

    if (acr.includes('high')) {
      assuranceLevel = 'high';
    } else if (acr.includes('substantial')) {
      assuranceLevel = 'substantial';
    } else if (methodId) {
      // Fallback : utiliser le niveau declare par la methode
      const method = getMethodById(methodId);
      if (method) {
        assuranceLevel = method.assuranceLevel;
      }
    }

    // Determination du pays depuis le claim ou la methode
    const countryCode = resolveCountryCode(userinfo, idTokenPayload, methodId);

    return {
      sub: userinfo.sub,
      providerId: 'signicat',
      countryCode,
      assuranceLevel,
      verifiedAt: new Date(),
    };
  }

  /**
   * Genere le nullifier hash a partir du sub Signicat.
   */
  async verify(callbackResult: CallbackResult): Promise<VerificationResult> {
    const nullifierHash = await generateNullifier(
      callbackResult.sub,
      'signicat'
    );

    return {
      nullifierHash,
      providerId: 'signicat',
      countryCode: callbackResult.countryCode,
      assuranceLevel: callbackResult.assuranceLevel,
      verifiedAt: callbackResult.verifiedAt,
    };
  }
}

// ── Utilitaires ──────────────────────────────────────────────────

/**
 * Decode le payload d'un JWT (partie 2) sans verifier la signature.
 * La verification se fait cote backend Rust.
 */
function decodeJwtPayload(jwt: string): Record<string, unknown> {
  const parts = jwt.split('.');
  if (parts.length !== 3) {
    throw new SignicatError('invalid_id_token', 'Format JWT invalide');
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    throw new SignicatError('invalid_id_token', 'Payload JWT non decodable');
  }
}

/**
 * Determine le code pays a partir des claims userinfo/id_token
 * ou de la methode eID utilisee.
 */
function resolveCountryCode(
  userinfo: Record<string, unknown>,
  idTokenPayload: Record<string, unknown>,
  methodId?: string
): string {
  // 1. Claim explicite signicat
  const fromClaim = (userinfo.signicat_country || idTokenPayload.signicat_country) as string | undefined;
  if (fromClaim) return fromClaim.toUpperCase();

  // 2. Deduction depuis la methode eID
  if (methodId) {
    const method = getMethodById(methodId);
    if (method && method.countries.length === 1) {
      return method.countries[0];
    }
  }

  return '';
}

// ── Singleton ────────────────────────────────────────────────────

export const signicatProvider = new SignicatProvider();
