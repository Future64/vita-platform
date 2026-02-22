// API Route — FranceConnect initiate
//
// GET /api/auth/initiate/franceconnect
//
// Le bouton FC fait : window.location.href = '/api/auth/initiate/franceconnect'
//
// 1. Genere state + nonce + PKCE (code_verifier / code_challenge S256)
// 2. Stocke {state, nonce, codeVerifier} dans cookie fc_session (httpOnly)
// 3. Redirige vers FranceConnect /authorize

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'node:crypto';
import { FC_URLS, FC_CONFIG } from '@/lib/identity/franceconnect/config';

// ── PKCE helpers (Node crypto) ────────────────────────────────

function base64url(buffer: Buffer): string {
  return buffer.toString('base64url');
}

function generateCodeVerifier(): string {
  return base64url(randomBytes(32));
}

function generateCodeChallenge(verifier: string): string {
  return base64url(createHash('sha256').update(verifier).digest());
}

// ── Route GET ─────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  try {
    // Verifier que les credentials FC sont configures
    if (!FC_CONFIG.clientId) {
      throw new Error(
        'FC_CLIENT_ID non configure. Ajoutez vos credentials FranceConnect dans .env.local.'
      );
    }

    // Generer state, nonce et PKCE
    const state = randomBytes(32).toString('hex');
    const nonce = randomBytes(16).toString('hex');
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    const redirectUri =
      FC_CONFIG.callbackUrl || `${origin}/api/auth/callback/franceconnect`;

    // Construire l'URL d'autorisation FranceConnect
    const authorizeUrl = new URL(FC_URLS.authorize);
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('client_id', FC_CONFIG.clientId);
    authorizeUrl.searchParams.set('redirect_uri', redirectUri);
    authorizeUrl.searchParams.set('scope', FC_CONFIG.scopes);
    authorizeUrl.searchParams.set('state', state);
    authorizeUrl.searchParams.set('nonce', nonce);
    authorizeUrl.searchParams.set('acr_values', 'eidas1');
    authorizeUrl.searchParams.set('code_challenge', codeChallenge);
    authorizeUrl.searchParams.set('code_challenge_method', 'S256');

    // Stocker la session dans un cookie httpOnly
    const session = JSON.stringify({
      state,
      nonce,
      codeVerifier,
      redirectUri,
    });

    const response = NextResponse.redirect(authorizeUrl.toString());

    response.cookies.set('fc_session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[FC Initiate]', err);

    const errorUrl = new URL('/auth/register', origin);
    errorUrl.searchParams.set('error', 'init_failed');
    errorUrl.searchParams.set(
      'message',
      err instanceof Error ? err.message : "Impossible d'initier FranceConnect"
    );

    const response = NextResponse.redirect(errorUrl);
    response.cookies.delete('vita_prefill');
    return response;
  }
}
