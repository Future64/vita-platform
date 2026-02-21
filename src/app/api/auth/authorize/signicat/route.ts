// API Route — Signicat authorize
//
// POST /api/auth/authorize/signicat
//
// Genere l'URL d'autorisation Signicat pour la methode eID choisie,
// stocke le state + methodId dans un cookie de session,
// et retourne l'URL pour la redirection cote client.
//
// En mode dev (sans SIGNICAT_CLIENT_ID), simule le flux avec un mock.

import { NextRequest, NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV !== 'production';
const hasSignicatCredentials = !!process.env.SIGNICAT_CLIENT_ID;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countryCode, methodId } = body as {
      countryCode: string;
      methodId?: string;
    };
    const returnTo = body.returnTo || '/civis/verification';
    const origin = request.nextUrl.origin;

    if (!countryCode) {
      return NextResponse.json(
        { error: 'countryCode est requis' },
        { status: 400 }
      );
    }

    // ── Mode mock (dev sans credentials) ────────────────────────
    if (isDev && !hasSignicatCredentials) {
      const mockNullifier = await generateMockNullifier('signicat');

      const redirectUrl = new URL(returnTo, origin);
      redirectUrl.searchParams.set('verified', 'true');
      redirectUrl.searchParams.set('provider', 'signicat');
      redirectUrl.searchParams.set('nullifier_hash', mockNullifier);
      redirectUrl.searchParams.set('country', countryCode);

      return NextResponse.json({
        authorizationUrl: redirectUrl.toString(),
      });
    }

    // ── Mode production (vrais credentials) ─────────────────────
    const { SignicatProvider } = await import(
      '@/lib/identity/providers/signicat/provider'
    );
    const { SignicatAuthorizeParams } = await import(
      '@/lib/identity/providers/signicat/provider'
    ).then((m) => ({ SignicatAuthorizeParams: undefined, ...m }));

    const provider = new SignicatProvider();

    if (!provider.supportsCountry(countryCode)) {
      return NextResponse.json(
        { error: `Le pays ${countryCode} n'est pas supporte par Signicat` },
        { status: 400 }
      );
    }

    const redirectUri = `${origin}/api/auth/callback/signicat`;
    const state = generateRandom(32);
    const nonce = generateRandom(16);

    const result = await provider.authorize({
      countryCode,
      redirectUri,
      state,
      nonce,
      methodId: methodId || '',
    } as Parameters<typeof provider.authorize>[0] & { methodId: string });

    const session = JSON.stringify({
      state,
      methodId: result.methodId,
      nonce,
      redirectUri,
      countryCode,
      returnTo,
    });

    const response = NextResponse.json({
      authorizationUrl: result.authorizationUrl,
    });

    response.cookies.set('signicat_session', session, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[Signicat Authorize]', err);
    return NextResponse.json(
      { error: "Impossible d'initier la verification Signicat" },
      { status: 500 }
    );
  }
}

// ── Helpers ─────────────────────────────────────────────────────

function generateRandom(bytes: number): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function generateMockNullifier(provider: string): Promise<string> {
  try {
    const { generateNullifier } = await import(
      '@/lib/identity/providers/nullifier'
    );
    return await generateNullifier(
      `mock-dev-user-${Date.now()}`,
      provider as 'signicat'
    );
  } catch {
    const data = new TextEncoder().encode(
      `mock-${provider}-${Date.now()}-${Math.random()}`
    );
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
