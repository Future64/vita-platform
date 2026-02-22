import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  FranceConnectProvider,
  FranceConnectError,
  generateCodeVerifier,
  generateCodeChallenge,
} from './provider';
import type { FCCallbackParams } from './provider';

// ── Helpers ──────────────────────────────────────────────────────

/** Encode un objet JSON en segment JWT base64url */
function encodeJwtSegment(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload);
  const base64 = btoa(json);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Construit un JWT factice avec le payload donne */
function buildMockJwt(payload: Record<string, unknown>): string {
  const header = encodeJwtSegment({ alg: 'RS256', typ: 'JWT' });
  const body = encodeJwtSegment(payload);
  const signature = 'mock-signature';
  return `${header}.${body}.${signature}`;
}

// ── Setup ────────────────────────────────────────────────────────

const MOCK_SUB = 'fc-sub-unique-12345';
const MOCK_STATE = 'random-state-abc';
const MOCK_CODE = 'auth-code-xyz';
const MOCK_REDIRECT_URI = 'http://localhost:3000/api/auth/callback/fc';

let provider: FranceConnectProvider;

beforeEach(() => {
  vi.stubEnv('FC_CLIENT_ID', 'test-client-id');
  vi.stubEnv('FC_CLIENT_SECRET', 'test-client-secret');
  vi.stubEnv('FC_BASE_URL', 'https://fc.test/api/v2');
  vi.stubEnv('VITA_NULLIFIER_SECRET', 'a'.repeat(32));

  provider = new FranceConnectProvider();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

// ══════════════════════════════════════════════════════════════════
// PKCE
// ══════════════════════════════════════════════════════════════════

describe('PKCE', () => {
  it('genere un code_verifier de longueur suffisante', () => {
    const verifier = generateCodeVerifier();
    expect(verifier.length).toBeGreaterThanOrEqual(43);
    expect(verifier.length).toBeLessThanOrEqual(128);
    // Base64url : uniquement [A-Za-z0-9_-]
    expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('genere des code_verifier uniques', () => {
    const v1 = generateCodeVerifier();
    const v2 = generateCodeVerifier();
    expect(v1).not.toBe(v2);
  });

  it('derive un code_challenge S256 deterministe', async () => {
    const verifier = 'test-verifier-fixed';
    const c1 = await generateCodeChallenge(verifier);
    const c2 = await generateCodeChallenge(verifier);
    expect(c1).toBe(c2);
    // Base64url format
    expect(c1).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('produit des challenges differents pour des verifiers differents', async () => {
    const c1 = await generateCodeChallenge('verifier-a');
    const c2 = await generateCodeChallenge('verifier-b');
    expect(c1).not.toBe(c2);
  });
});

// ══════════════════════════════════════════════════════════════════
// AUTHORIZE
// ══════════════════════════════════════════════════════════════════

describe('authorize', () => {
  it('genere une URL d\'autorisation FC valide avec PKCE', async () => {
    const result = await provider.authorize({
      countryCode: 'FR',
      redirectUri: MOCK_REDIRECT_URI,
      state: MOCK_STATE,
      nonce: 'nonce-123',
    });

    expect(result.providerId).toBe('franceconnect');
    expect(result.state).toBe(MOCK_STATE);
    expect(result.codeVerifier).toBeDefined();
    expect(result.codeVerifier.length).toBeGreaterThan(40);

    const url = new URL(result.authorizationUrl);
    expect(url.origin + url.pathname).toBe('https://fc.test/api/v2/authorize');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('client_id')).toBe('test-client-id');
    expect(url.searchParams.get('redirect_uri')).toBe(MOCK_REDIRECT_URI);
    expect(url.searchParams.get('scope')).toBe('openid given_name family_name birthdate email gender');
    expect(url.searchParams.get('state')).toBe(MOCK_STATE);
    expect(url.searchParams.get('nonce')).toBe('nonce-123');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('code_challenge')).toBeTruthy();
    expect(url.searchParams.get('acr_values')).toBe('eidas1');
  });

  it('echoue si FC_CLIENT_ID est manquant', async () => {
    vi.stubEnv('FC_CLIENT_ID', '');

    const freshProvider = new FranceConnectProvider();
    await expect(freshProvider.authorize({
      countryCode: 'FR',
      redirectUri: MOCK_REDIRECT_URI,
      state: MOCK_STATE,
      nonce: 'nonce-123',
    })).rejects.toThrow('FC_CLIENT_ID');
  });
});

// ══════════════════════════════════════════════════════════════════
// HANDLE CALLBACK
// ══════════════════════════════════════════════════════════════════

describe('handleCallback', () => {
  function mockFetchSuccess() {
    const idToken = buildMockJwt({ sub: MOCK_SUB, acr: 'eidas1', nonce: 'nonce-123' });

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
          email: 'jean@example.fr',
          gender: 'male',
          birthdate: '1990-05-15',
        }), { status: 200 });
      }

      return new Response('Not found', { status: 404 });
    });
  }

  it('retourne le sub, le niveau eIDAS, et les champs prefill', async () => {
    mockFetchSuccess();

    const result = await provider.handleCallback({
      code: MOCK_CODE,
      state: MOCK_STATE,
      redirectUri: MOCK_REDIRECT_URI,
      providerId: 'franceconnect',
      codeVerifier: 'test-verifier',
    } as FCCallbackParams);

    expect(result.sub).toBe(MOCK_SUB);
    expect(result.providerId).toBe('franceconnect');
    expect(result.countryCode).toBe('FR');
    expect(result.assuranceLevel).toBe('low');
    expect(result.verifiedAt).toBeInstanceOf(Date);

    // Extended fields for prefill (not stored in DB)
    expect(result.email).toBe('jean@example.fr');
    expect(result.gender).toBe('male');
    expect(result.birthdate).toBe('1990-05-15');

    // Verification : aucune donnee personnelle non-attendue
    const resultKeys = Object.keys(result);
    expect(resultKeys).not.toContain('given_name');
    expect(resultKeys).not.toContain('family_name');
  });

  it('lance user_cancelled si le code est absent', async () => {
    await expect(
      provider.handleCallback({
        code: '',
        state: MOCK_STATE,
        redirectUri: MOCK_REDIRECT_URI,
        providerId: 'franceconnect',
        codeVerifier: 'test-verifier',
      } as FCCallbackParams)
    ).rejects.toThrow(FranceConnectError);

    try {
      await provider.handleCallback({
        code: '',
        state: MOCK_STATE,
        redirectUri: MOCK_REDIRECT_URI,
        providerId: 'franceconnect',
        codeVerifier: 'test-verifier',
      } as FCCallbackParams);
    } catch (err) {
      expect((err as FranceConnectError).code).toBe('user_cancelled');
    }
  });

  it('lance invalid_state si le state est absent', async () => {
    try {
      await provider.handleCallback({
        code: MOCK_CODE,
        state: '',
        redirectUri: MOCK_REDIRECT_URI,
        providerId: 'franceconnect',
        codeVerifier: 'test-verifier',
      } as FCCallbackParams);
    } catch (err) {
      expect(err).toBeInstanceOf(FranceConnectError);
      expect((err as FranceConnectError).code).toBe('invalid_state');
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
        providerId: 'franceconnect',
        codeVerifier: 'test-verifier',
      } as FCCallbackParams);
    } catch (err) {
      expect(err).toBeInstanceOf(FranceConnectError);
      expect((err as FranceConnectError).code).toBe('token_expired');
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
        providerId: 'franceconnect',
        codeVerifier: 'test-verifier',
      } as FCCallbackParams);
    } catch (err) {
      expect(err).toBeInstanceOf(FranceConnectError);
      expect((err as FranceConnectError).code).toBe('token_exchange_failed');
    }
  });

  it('lance userinfo_failed si /userinfo echoue', async () => {
    const idToken = buildMockJwt({ sub: MOCK_SUB, acr: 'eidas1' });

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
      return new Response('Not found', { status: 404 });
    });

    try {
      await provider.handleCallback({
        code: MOCK_CODE,
        state: MOCK_STATE,
        redirectUri: MOCK_REDIRECT_URI,
        providerId: 'franceconnect',
        codeVerifier: 'test-verifier',
      } as FCCallbackParams);
    } catch (err) {
      expect(err).toBeInstanceOf(FranceConnectError);
      expect((err as FranceConnectError).code).toBe('userinfo_failed');
    }
  });

  it('inclut le code_verifier PKCE dans la requete token', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const idToken = buildMockJwt({ sub: MOCK_SUB, acr: 'eidas1' });

    fetchSpy.mockImplementation(async (url) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr.includes('/token')) {
        return new Response(JSON.stringify({
          access_token: 'mock-access-token',
          id_token: idToken,
        }), { status: 200 });
      }
      if (urlStr.includes('/userinfo')) {
        return new Response(JSON.stringify({ sub: MOCK_SUB }), { status: 200 });
      }
      return new Response('', { status: 404 });
    });

    await provider.handleCallback({
      code: MOCK_CODE,
      state: MOCK_STATE,
      redirectUri: MOCK_REDIRECT_URI,
      providerId: 'franceconnect',
      codeVerifier: 'my-pkce-verifier',
    } as FCCallbackParams);

    // Verifie que le fetch vers /token inclut code_verifier
    const tokenCall = fetchSpy.mock.calls.find(
      (call) => (typeof call[0] === 'string' ? call[0] : '').includes('/token')
    );
    expect(tokenCall).toBeDefined();
    const body = (tokenCall![1] as RequestInit).body as URLSearchParams;
    expect(body.get('code_verifier')).toBe('my-pkce-verifier');
  });
});

// ══════════════════════════════════════════════════════════════════
// VERIFY (nullifier generation)
// ══════════════════════════════════════════════════════════════════

describe('verify', () => {
  it('genere un nullifier hash valide (64 hex chars)', async () => {
    const result = await provider.verify({
      sub: MOCK_SUB,
      providerId: 'franceconnect',
      countryCode: 'FR',
      assuranceLevel: 'substantial',
      verifiedAt: new Date(),
    });

    expect(result.nullifierHash).toMatch(/^[0-9a-f]{64}$/);
    expect(result.providerId).toBe('franceconnect');
    expect(result.countryCode).toBe('FR');
    expect(result.assuranceLevel).toBe('substantial');
  });

  it('produit le meme nullifier pour le meme sub', async () => {
    const r1 = await provider.verify({
      sub: MOCK_SUB,
      providerId: 'franceconnect',
      countryCode: 'FR',
      assuranceLevel: 'substantial',
      verifiedAt: new Date(),
    });

    const r2 = await provider.verify({
      sub: MOCK_SUB,
      providerId: 'franceconnect',
      countryCode: 'FR',
      assuranceLevel: 'low',
      verifiedAt: new Date(),
    });

    expect(r1.nullifierHash).toBe(r2.nullifierHash);
  });

  it('produit des nullifiers differents pour des subs differents', async () => {
    const r1 = await provider.verify({
      sub: 'sub-user-a',
      providerId: 'franceconnect',
      countryCode: 'FR',
      assuranceLevel: 'substantial',
      verifiedAt: new Date(),
    });

    const r2 = await provider.verify({
      sub: 'sub-user-b',
      providerId: 'franceconnect',
      countryCode: 'FR',
      assuranceLevel: 'substantial',
      verifiedAt: new Date(),
    });

    expect(r1.nullifierHash).not.toBe(r2.nullifierHash);
  });

  it('ne contient aucune donnee personnelle dans le resultat', async () => {
    const result = await provider.verify({
      sub: MOCK_SUB,
      providerId: 'franceconnect',
      countryCode: 'FR',
      assuranceLevel: 'substantial',
      verifiedAt: new Date(),
    });

    const json = JSON.stringify(result);
    expect(json).not.toContain(MOCK_SUB);
    expect(json).not.toContain('given_name');
    expect(json).not.toContain('family_name');
    expect(json).not.toContain('birthdate');
  });
});

// ══════════════════════════════════════════════════════════════════
// SUPPORTS COUNTRY
// ══════════════════════════════════════════════════════════════════

describe('supportsCountry', () => {
  it('supporte FR', () => {
    expect(provider.supportsCountry('FR')).toBe(true);
    expect(provider.supportsCountry('fr')).toBe(true);
  });

  it('ne supporte pas les autres pays', () => {
    expect(provider.supportsCountry('DE')).toBe(false);
    expect(provider.supportsCountry('US')).toBe(false);
    expect(provider.supportsCountry('GB')).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════
// FLUX COMPLET (authorize → callback → verify)
// ══════════════════════════════════════════════════════════════════

describe('flux complet', () => {
  it('execute le flux authorize → callback → verify', async () => {
    // 1. Authorize
    const authResult = await provider.authorize({
      countryCode: 'FR',
      redirectUri: MOCK_REDIRECT_URI,
      state: MOCK_STATE,
      nonce: 'nonce-full-flow',
    });

    expect(authResult.authorizationUrl).toContain('authorize');
    expect(authResult.codeVerifier).toBeDefined();

    // 2. Callback (mock FC responses)
    const idToken = buildMockJwt({ sub: MOCK_SUB, acr: 'eidas1', nonce: 'nonce-full-flow' });

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      if (urlStr.includes('/token')) {
        return new Response(JSON.stringify({
          access_token: 'access-token',
          id_token: idToken,
        }), { status: 200 });
      }
      if (urlStr.includes('/userinfo')) {
        return new Response(JSON.stringify({ sub: MOCK_SUB }), { status: 200 });
      }
      return new Response('', { status: 404 });
    });

    const callbackResult = await provider.handleCallback({
      code: MOCK_CODE,
      state: MOCK_STATE,
      redirectUri: MOCK_REDIRECT_URI,
      providerId: 'franceconnect',
      codeVerifier: authResult.codeVerifier,
    } as FCCallbackParams);

    expect(callbackResult.sub).toBe(MOCK_SUB);

    // 3. Verify
    const verification = await provider.verify(callbackResult);

    expect(verification.nullifierHash).toMatch(/^[0-9a-f]{64}$/);
    expect(verification.providerId).toBe('franceconnect');
    expect(verification.countryCode).toBe('FR');

    // Le nullifier ne doit pas contenir le sub en clair
    expect(verification.nullifierHash).not.toContain(MOCK_SUB);
  });
});
