import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  SignicatProvider,
  SignicatError,
} from './provider';
import type { SignicatAuthorizeParams, SignicatCallbackParams } from './provider';
import {
  getMethodsForCountry,
  getMethodById,
  getSupportedCountries,
  SIGNICAT_METHODS,
} from './methods';

// ── Helpers ──────────────────────────────────────────────────────

function encodeJwtSegment(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload);
  const base64 = btoa(json);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildMockJwt(payload: Record<string, unknown>): string {
  const header = encodeJwtSegment({ alg: 'RS256', typ: 'JWT' });
  const body = encodeJwtSegment(payload);
  const signature = 'mock-signature';
  return `${header}.${body}.${signature}`;
}

// ── Setup ────────────────────────────────────────────────────────

const MOCK_SUB = 'signicat-sub-98765';
const MOCK_STATE = 'random-state-xyz';
const MOCK_CODE = 'auth-code-abc';
const MOCK_REDIRECT_URI = 'http://localhost:3000/api/auth/callback/signicat';

let provider: SignicatProvider;

beforeEach(() => {
  vi.stubEnv('SIGNICAT_CLIENT_ID', 'test-signicat-client');
  vi.stubEnv('SIGNICAT_CLIENT_SECRET', 'test-signicat-secret');
  vi.stubEnv('SIGNICAT_BASE_URL', 'https://signicat.test/oidc');
  vi.stubEnv('VITA_NULLIFIER_SECRET', 'b'.repeat(32));

  provider = new SignicatProvider();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

// ══════════════════════════════════════════════════════════════════
// METHODS MAPPING
// ══════════════════════════════════════════════════════════════════

describe('methods', () => {
  it('retourne les methodes pour la Norvege (nbid)', () => {
    const methods = getMethodsForCountry('NO');
    expect(methods.length).toBeGreaterThanOrEqual(1);
    expect(methods[0].id).toBe('nbid');
    expect(methods[0].assuranceLevel).toBe('substantial');
  });

  it('retourne les methodes pour les Pays-Bas (idin + digiid), triees par confiance', () => {
    const methods = getMethodsForCountry('NL');
    expect(methods.length).toBe(2);
    // DigiD (substantial) avant iDIN (low)
    expect(methods[0].id).toBe('digiid');
    expect(methods[0].assuranceLevel).toBe('substantial');
    expect(methods[1].id).toBe('idin');
    expect(methods[1].assuranceLevel).toBe('low');
  });

  it('retourne nPA pour l\'Allemagne avec niveau high', () => {
    const methods = getMethodsForCountry('DE');
    expect(methods.length).toBe(1);
    expect(methods[0].id).toBe('npa');
    expect(methods[0].assuranceLevel).toBe('high');
  });

  it('retourne Smart-ID pour les trois pays baltes', () => {
    for (const country of ['EE', 'LV', 'LT']) {
      const methods = getMethodsForCountry(country);
      expect(methods.length).toBeGreaterThanOrEqual(1);
      expect(methods.some((m) => m.id === 'smartid')).toBe(true);
    }
  });

  it('retourne un tableau vide pour un pays non supporte', () => {
    const methods = getMethodsForCountry('US');
    expect(methods).toEqual([]);
  });

  it('est insensible a la casse', () => {
    const upper = getMethodsForCountry('NO');
    const lower = getMethodsForCountry('no');
    expect(upper).toEqual(lower);
  });

  it('getMethodById retourne la bonne methode', () => {
    const method = getMethodById('spid');
    expect(method).toBeDefined();
    expect(method!.displayName).toBe('SPID');
    expect(method!.countries).toContain('IT');
  });

  it('getMethodById retourne undefined pour un id inconnu', () => {
    expect(getMethodById('unknown')).toBeUndefined();
  });

  it('getSupportedCountries retourne tous les pays', () => {
    const countries = getSupportedCountries();
    expect(countries).toContain('NO');
    expect(countries).toContain('SE');
    expect(countries).toContain('FI');
    expect(countries).toContain('DK');
    expect(countries).toContain('BE');
    expect(countries).toContain('DE');
    expect(countries).toContain('NL');
    expect(countries).toContain('IT');
    expect(countries).toContain('EE');
    expect(countries).toContain('LV');
    expect(countries).toContain('LT');
  });

  it('couvre les 10 methodes eID demandees', () => {
    const expectedIds = ['nbid', 'sbid', 'fbid', 'mitid', 'itsme', 'npa', 'idin', 'digiid', 'spid', 'smartid'];
    for (const id of expectedIds) {
      expect(SIGNICAT_METHODS.some((m) => m.id === id)).toBe(true);
    }
  });
});

// ══════════════════════════════════════════════════════════════════
// SUPPORTS COUNTRY
// ══════════════════════════════════════════════════════════════════

describe('supportsCountry', () => {
  it('supporte les pays avec methodes eID', () => {
    expect(provider.supportsCountry('NO')).toBe(true);
    expect(provider.supportsCountry('SE')).toBe(true);
    expect(provider.supportsCountry('DE')).toBe(true);
    expect(provider.supportsCountry('IT')).toBe(true);
    expect(provider.supportsCountry('NL')).toBe(true);
  });

  it('ne supporte pas les pays sans methode', () => {
    expect(provider.supportsCountry('US')).toBe(false);
    expect(provider.supportsCountry('BR')).toBe(false);
    expect(provider.supportsCountry('JP')).toBe(false);
  });

  it('est insensible a la casse', () => {
    expect(provider.supportsCountry('no')).toBe(true);
    expect(provider.supportsCountry('de')).toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════════
// GET AVAILABLE METHODS
// ══════════════════════════════════════════════════════════════════

describe('getAvailableMethods', () => {
  it('retourne les methodes triees par confiance', () => {
    const methods = provider.getAvailableMethods('NL');
    expect(methods.length).toBe(2);
    // substantial avant low
    expect(methods[0].assuranceLevel).toBe('substantial');
    expect(methods[1].assuranceLevel).toBe('low');
  });

  it('retourne un tableau vide pour un pays non supporte', () => {
    expect(provider.getAvailableMethods('XX')).toEqual([]);
  });
});

// ══════════════════════════════════════════════════════════════════
// AUTHORIZE
// ══════════════════════════════════════════════════════════════════

describe('authorize', () => {
  it('genere une URL d\'autorisation valide avec acr_values', async () => {
    const result = await provider.authorize({
      countryCode: 'NO',
      redirectUri: MOCK_REDIRECT_URI,
      state: MOCK_STATE,
      nonce: 'nonce-123',
      methodId: 'nbid',
    } as SignicatAuthorizeParams);

    expect(result.providerId).toBe('signicat');
    expect(result.state).toBe(MOCK_STATE);
    expect(result.methodId).toBe('nbid');

    const url = new URL(result.authorizationUrl);
    expect(url.origin + url.pathname).toBe('https://signicat.test/oidc/authorize');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('client_id')).toBe('test-signicat-client');
    expect(url.searchParams.get('redirect_uri')).toBe(MOCK_REDIRECT_URI);
    expect(url.searchParams.get('scope')).toBe('openid');
    expect(url.searchParams.get('state')).toBe(MOCK_STATE);
    expect(url.searchParams.get('nonce')).toBe('nonce-123');
    expect(url.searchParams.get('acr_values')).toBe('urn:signicat:oidc:method:nbid');
  });

  it('utilise la meilleure methode si methodId n\'est pas fourni', async () => {
    const result = await provider.authorize({
      countryCode: 'NL',
      redirectUri: MOCK_REDIRECT_URI,
      state: MOCK_STATE,
      nonce: 'nonce-456',
    });

    // DigiD (substantial) est prefere a iDIN (low)
    expect(result.methodId).toBe('digiid');
    const url = new URL(result.authorizationUrl);
    expect(url.searchParams.get('acr_values')).toBe('urn:signicat:oidc:method:digiid');
  });

  it('echoue si le pays n\'est pas supporte', async () => {
    await expect(
      provider.authorize({
        countryCode: 'US',
        redirectUri: MOCK_REDIRECT_URI,
        state: MOCK_STATE,
        nonce: 'nonce-789',
      })
    ).rejects.toThrow(SignicatError);

    try {
      await provider.authorize({
        countryCode: 'US',
        redirectUri: MOCK_REDIRECT_URI,
        state: MOCK_STATE,
        nonce: 'nonce-789',
      });
    } catch (err) {
      expect((err as SignicatError).code).toBe('unsupported_country');
    }
  });

  it('echoue si la methode ne correspond pas au pays', async () => {
    await expect(
      provider.authorize({
        countryCode: 'NO',
        redirectUri: MOCK_REDIRECT_URI,
        state: MOCK_STATE,
        nonce: 'nonce-xyz',
        methodId: 'spid', // SPID = Italie, pas Norvege
      } as SignicatAuthorizeParams)
    ).rejects.toThrow(SignicatError);

    try {
      await provider.authorize({
        countryCode: 'NO',
        redirectUri: MOCK_REDIRECT_URI,
        state: MOCK_STATE,
        nonce: 'nonce-xyz',
        methodId: 'spid',
      } as SignicatAuthorizeParams);
    } catch (err) {
      expect((err as SignicatError).code).toBe('invalid_method');
    }
  });

  it('echoue si SIGNICAT_CLIENT_ID est manquant', async () => {
    vi.stubEnv('SIGNICAT_CLIENT_ID', '');

    const freshProvider = new SignicatProvider();
    await expect(
      freshProvider.authorize({
        countryCode: 'NO',
        redirectUri: MOCK_REDIRECT_URI,
        state: MOCK_STATE,
        nonce: 'nonce-000',
        methodId: 'nbid',
      } as SignicatAuthorizeParams)
    ).rejects.toThrow('SIGNICAT_CLIENT_ID');
  });
});

// ══════════════════════════════════════════════════════════════════
// HANDLE CALLBACK
// ══════════════════════════════════════════════════════════════════

describe('handleCallback', () => {
  function mockFetchSuccess(acr = 'urn:signicat:oidc:method:nbid:substantial') {
    const idToken = buildMockJwt({
      sub: MOCK_SUB,
      acr,
      nonce: 'nonce-123',
    });

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const urlStr = typeof url === 'string' ? url : url.toString();

      if (urlStr.includes('/token')) {
        return new Response(JSON.stringify({
          access_token: 'mock-access-token',
          id_token: idToken,
          token_type: 'Bearer',
        }), { status: 200 });
      }

      if (urlStr.includes('/userinfo')) {
        return new Response(JSON.stringify({
          sub: MOCK_SUB,
          signicat_country: 'NO',
        }), { status: 200 });
      }

      return new Response('Not found', { status: 404 });
    });
  }

  it('retourne le sub et le niveau eIDAS sans donnees personnelles', async () => {
    mockFetchSuccess();

    const result = await provider.handleCallback({
      code: MOCK_CODE,
      state: MOCK_STATE,
      redirectUri: MOCK_REDIRECT_URI,
      providerId: 'signicat',
      methodId: 'nbid',
    } as SignicatCallbackParams);

    expect(result.sub).toBe(MOCK_SUB);
    expect(result.providerId).toBe('signicat');
    expect(result.countryCode).toBe('NO');
    expect(result.assuranceLevel).toBe('substantial');
    expect(result.verifiedAt).toBeInstanceOf(Date);

    // Aucune donnee personnelle
    const resultKeys = Object.keys(result);
    expect(resultKeys).not.toContain('given_name');
    expect(resultKeys).not.toContain('family_name');
    expect(resultKeys).not.toContain('email');
  });

  it('detecte le niveau high depuis acr', async () => {
    mockFetchSuccess('urn:signicat:oidc:method:npa:high');

    const result = await provider.handleCallback({
      code: MOCK_CODE,
      state: MOCK_STATE,
      redirectUri: MOCK_REDIRECT_URI,
      providerId: 'signicat',
      methodId: 'npa',
    } as SignicatCallbackParams);

    expect(result.assuranceLevel).toBe('high');
  });

  it('fallback sur le niveau de la methode si acr absent', async () => {
    const idToken = buildMockJwt({ sub: MOCK_SUB, nonce: 'nonce-123' }); // pas d'acr

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr.includes('/token')) {
        return new Response(JSON.stringify({
          access_token: 'mock-access-token',
          id_token: idToken,
        }), { status: 200 });
      }
      if (urlStr.includes('/userinfo')) {
        return new Response(JSON.stringify({
          sub: MOCK_SUB,
          signicat_country: 'DE',
        }), { status: 200 });
      }
      return new Response('', { status: 404 });
    });

    const result = await provider.handleCallback({
      code: MOCK_CODE,
      state: MOCK_STATE,
      redirectUri: MOCK_REDIRECT_URI,
      providerId: 'signicat',
      methodId: 'npa', // nPA = high
    } as SignicatCallbackParams);

    expect(result.assuranceLevel).toBe('high');
  });

  it('lance user_cancelled si le code est absent', async () => {
    try {
      await provider.handleCallback({
        code: '',
        state: MOCK_STATE,
        redirectUri: MOCK_REDIRECT_URI,
        providerId: 'signicat',
        methodId: 'nbid',
      } as SignicatCallbackParams);
    } catch (err) {
      expect(err).toBeInstanceOf(SignicatError);
      expect((err as SignicatError).code).toBe('user_cancelled');
    }
  });

  it('lance invalid_state si le state est absent', async () => {
    try {
      await provider.handleCallback({
        code: MOCK_CODE,
        state: '',
        redirectUri: MOCK_REDIRECT_URI,
        providerId: 'signicat',
        methodId: 'nbid',
      } as SignicatCallbackParams);
    } catch (err) {
      expect(err).toBeInstanceOf(SignicatError);
      expect((err as SignicatError).code).toBe('invalid_state');
    }
  });

  it('lance token_expired si le token est expire', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('{"error":"expired_token"}', { status: 400 })
    );

    try {
      await provider.handleCallback({
        code: MOCK_CODE,
        state: MOCK_STATE,
        redirectUri: MOCK_REDIRECT_URI,
        providerId: 'signicat',
        methodId: 'nbid',
      } as SignicatCallbackParams);
    } catch (err) {
      expect(err).toBeInstanceOf(SignicatError);
      expect((err as SignicatError).code).toBe('token_expired');
    }
  });

  it('lance token_exchange_failed si le token endpoint echoue', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Server error', { status: 500 })
    );

    try {
      await provider.handleCallback({
        code: MOCK_CODE,
        state: MOCK_STATE,
        redirectUri: MOCK_REDIRECT_URI,
        providerId: 'signicat',
        methodId: 'nbid',
      } as SignicatCallbackParams);
    } catch (err) {
      expect(err).toBeInstanceOf(SignicatError);
      expect((err as SignicatError).code).toBe('token_exchange_failed');
    }
  });

  it('lance userinfo_failed si /userinfo echoue', async () => {
    const idToken = buildMockJwt({ sub: MOCK_SUB, acr: 'substantial' });

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr.includes('/token')) {
        return new Response(JSON.stringify({
          access_token: 'mock-access-token',
          id_token: idToken,
        }), { status: 200 });
      }
      if (urlStr.includes('/userinfo')) {
        return new Response('Unauthorized', { status: 401 });
      }
      return new Response('', { status: 404 });
    });

    try {
      await provider.handleCallback({
        code: MOCK_CODE,
        state: MOCK_STATE,
        redirectUri: MOCK_REDIRECT_URI,
        providerId: 'signicat',
        methodId: 'nbid',
      } as SignicatCallbackParams);
    } catch (err) {
      expect(err).toBeInstanceOf(SignicatError);
      expect((err as SignicatError).code).toBe('userinfo_failed');
    }
  });

  it('deduit le pays depuis la methode si signicat_country absent', async () => {
    const idToken = buildMockJwt({ sub: MOCK_SUB, acr: 'substantial' });

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr.includes('/token')) {
        return new Response(JSON.stringify({
          access_token: 'mock-access-token',
          id_token: idToken,
        }), { status: 200 });
      }
      if (urlStr.includes('/userinfo')) {
        // Pas de signicat_country
        return new Response(JSON.stringify({ sub: MOCK_SUB }), { status: 200 });
      }
      return new Response('', { status: 404 });
    });

    const result = await provider.handleCallback({
      code: MOCK_CODE,
      state: MOCK_STATE,
      redirectUri: MOCK_REDIRECT_URI,
      providerId: 'signicat',
      methodId: 'spid', // SPID = Italie uniquement
    } as SignicatCallbackParams);

    expect(result.countryCode).toBe('IT');
  });
});

// ══════════════════════════════════════════════════════════════════
// VERIFY (nullifier generation)
// ══════════════════════════════════════════════════════════════════

describe('verify', () => {
  it('genere un nullifier hash valide (64 hex chars)', async () => {
    const result = await provider.verify({
      sub: MOCK_SUB,
      providerId: 'signicat',
      countryCode: 'NO',
      assuranceLevel: 'substantial',
      verifiedAt: new Date(),
    });

    expect(result.nullifierHash).toMatch(/^[0-9a-f]{64}$/);
    expect(result.providerId).toBe('signicat');
    expect(result.countryCode).toBe('NO');
  });

  it('produit le meme nullifier pour le meme sub', async () => {
    const r1 = await provider.verify({
      sub: MOCK_SUB,
      providerId: 'signicat',
      countryCode: 'NO',
      assuranceLevel: 'substantial',
      verifiedAt: new Date(),
    });

    const r2 = await provider.verify({
      sub: MOCK_SUB,
      providerId: 'signicat',
      countryCode: 'NO',
      assuranceLevel: 'low',
      verifiedAt: new Date(),
    });

    expect(r1.nullifierHash).toBe(r2.nullifierHash);
  });

  it('produit des nullifiers differents pour des subs differents', async () => {
    const r1 = await provider.verify({
      sub: 'sub-user-a',
      providerId: 'signicat',
      countryCode: 'NO',
      assuranceLevel: 'substantial',
      verifiedAt: new Date(),
    });

    const r2 = await provider.verify({
      sub: 'sub-user-b',
      providerId: 'signicat',
      countryCode: 'NO',
      assuranceLevel: 'substantial',
      verifiedAt: new Date(),
    });

    expect(r1.nullifierHash).not.toBe(r2.nullifierHash);
  });

  it('ne contient aucune donnee personnelle dans le resultat', async () => {
    const result = await provider.verify({
      sub: MOCK_SUB,
      providerId: 'signicat',
      countryCode: 'NO',
      assuranceLevel: 'substantial',
      verifiedAt: new Date(),
    });

    const json = JSON.stringify(result);
    expect(json).not.toContain(MOCK_SUB);
    expect(json).not.toContain('given_name');
    expect(json).not.toContain('family_name');
  });
});

// ══════════════════════════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════════════════════════

describe('config', () => {
  it('utilise l\'URL de base depuis SIGNICAT_BASE_URL', () => {
    expect(provider.config.baseUrl).toBe('https://signicat.test/oidc');
  });

  it('utilise le default si SIGNICAT_BASE_URL absent', () => {
    vi.stubEnv('SIGNICAT_BASE_URL', '');

    const freshProvider = new SignicatProvider();
    expect(freshProvider.config.baseUrl).toBe('https://preprod.signicat.com/oidc');
  });

  it('expose les bons niveaux d\'assurance', () => {
    expect(provider.config.assuranceLevels).toContain('low');
    expect(provider.config.assuranceLevels).toContain('substantial');
    expect(provider.config.assuranceLevels).toContain('high');
  });
});

// ══════════════════════════════════════════════════════════════════
// FLUX COMPLET (authorize → callback → verify)
// ══════════════════════════════════════════════════════════════════

describe('flux complet', () => {
  it('execute le flux authorize → callback → verify pour BankID NO', async () => {
    // 1. Authorize
    const authResult = await provider.authorize({
      countryCode: 'NO',
      redirectUri: MOCK_REDIRECT_URI,
      state: MOCK_STATE,
      nonce: 'nonce-full-flow',
      methodId: 'nbid',
    } as SignicatAuthorizeParams);

    expect(authResult.authorizationUrl).toContain('authorize');
    expect(authResult.methodId).toBe('nbid');

    // 2. Callback (mock Signicat responses)
    const idToken = buildMockJwt({
      sub: MOCK_SUB,
      acr: 'urn:signicat:oidc:method:nbid:substantial',
      nonce: 'nonce-full-flow',
    });

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr.includes('/token')) {
        return new Response(JSON.stringify({
          access_token: 'access-token',
          id_token: idToken,
        }), { status: 200 });
      }
      if (urlStr.includes('/userinfo')) {
        return new Response(JSON.stringify({
          sub: MOCK_SUB,
          signicat_country: 'NO',
        }), { status: 200 });
      }
      return new Response('', { status: 404 });
    });

    const callbackResult = await provider.handleCallback({
      code: MOCK_CODE,
      state: MOCK_STATE,
      redirectUri: MOCK_REDIRECT_URI,
      providerId: 'signicat',
      methodId: 'nbid',
    } as SignicatCallbackParams);

    expect(callbackResult.sub).toBe(MOCK_SUB);
    expect(callbackResult.countryCode).toBe('NO');

    // 3. Verify
    const verification = await provider.verify(callbackResult);

    expect(verification.nullifierHash).toMatch(/^[0-9a-f]{64}$/);
    expect(verification.providerId).toBe('signicat');
    expect(verification.countryCode).toBe('NO');
    expect(verification.nullifierHash).not.toContain(MOCK_SUB);
  });
});
