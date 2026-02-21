// API Route — FranceConnect authorize
//
// POST /api/auth/authorize/fc
//
// Genere l'URL d'autorisation FranceConnect avec PKCE,
// stocke le state + codeVerifier dans un cookie de session,
// et retourne l'URL pour la redirection cote client.
//
// En mode dev (sans FC_CLIENT_ID), simule le flux avec un mock.

import { NextRequest, NextResponse } from 'next/server';
import { generateNullifier } from '@/lib/identity/providers/nullifier';

const isDev = process.env.NODE_ENV !== 'production';
const hasFcCredentials = !!process.env.FC_CLIENT_ID;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const returnTo = body.returnTo || '/civis/verification';
    const origin = request.nextUrl.origin;

    // ── Mode mock (dev sans credentials) ────────────────────────
    if (isDev && !hasFcCredentials) {
      const mockNullifier = await generateMockNullifier('franceconnect');

      const redirectUrl = new URL(returnTo, origin);
      redirectUrl.searchParams.set('verified', 'true');
      redirectUrl.searchParams.set('provider', 'franceconnect');
      redirectUrl.searchParams.set('nullifier_hash', mockNullifier);
      redirectUrl.searchParams.set('country', 'FR');

      return NextResponse.json({
        authorizationUrl: redirectUrl.toString(),
      });
    }

    // ── Mode production (vrais credentials) ─────────────────────
    const { FranceConnectProvider } = await import(
      '@/lib/identity/providers/franceconnect/provider'
    );
    const provider = new FranceConnectProvider();

    const callbackUrl = body.callbackUrl || '/api/auth/callback/fc';
    const redirectUri = callbackUrl.startsWith('http')
      ? callbackUrl
      : `${origin}${callbackUrl}`;

    const state = generateRandom(32);
    const nonce = generateRandom(16);

    const result = await provider.authorize({
      countryCode: 'FR',
      redirectUri,
      state,
      nonce,
    });

    const session = JSON.stringify({
      state,
      codeVerifier: result.codeVerifier,
      nonce,
      redirectUri,
      returnTo,
    });

    const response = NextResponse.json({
      authorizationUrl: result.authorizationUrl,
    });

    response.cookies.set('fc_session', session, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[FC Authorize]', err);
    return NextResponse.json(
      { error: "Impossible d'initier la verification FranceConnect" },
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
    return await generateNullifier(`mock-dev-user-${Date.now()}`, provider as 'franceconnect');
  } catch {
    // Si VITA_NULLIFIER_SECRET n'est pas configure, generer un hash simple
    const data = new TextEncoder().encode(`mock-${provider}-${Date.now()}-${Math.random()}`);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
