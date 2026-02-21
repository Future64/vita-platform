// API Route — Signicat OIDC callback handler
//
// GET /api/auth/callback/signicat?code=...&state=...
//
// Ce handler :
//   1. Verifie le state (anti-CSRF) via le cookie de session
//   2. Echange le code contre un token Signicat
//   3. Extrait le sub (identifiant pseudonymise)
//   4. Genere le nullifier_hash (HMAC-SHA256)
//   5. Envoie le nullifier au backend Rust pour enregistrement
//   6. Redirige vers /civis/verification?success=true
//
// JAMAIS de donnees personnelles en transit ou en stockage.

import { NextRequest, NextResponse } from 'next/server';
import { SignicatProvider, SignicatError } from '@/lib/identity/providers/signicat/provider';
import type { SignicatCallbackParams } from '@/lib/identity/providers/signicat/provider';

const VITA_API_URL = process.env.NEXT_PUBLIC_VITA_API_URL || 'http://localhost:8080/api/v1';
const provider = new SignicatProvider();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // ── Erreur retournee par Signicat ───────────────────────────────

  if (error) {
    const errorDesc = searchParams.get('error_description') || 'Erreur inconnue';

    if (error === 'access_denied') {
      return redirectWithError('user_cancelled', 'Authentification annulee');
    }

    return redirectWithError('token_exchange_failed', errorDesc);
  }

  // ── Validation des parametres ──────────────────────────────────

  if (!code || !state) {
    return redirectWithError('invalid_state', 'Parametres manquants');
  }

  // ── Recuperation de la session ─────────────────────────────────

  const sessionCookie = request.cookies.get('signicat_session');
  if (!sessionCookie?.value) {
    return redirectWithError('invalid_state', 'Session expiree ou invalide');
  }

  let session: { state: string; methodId: string; nonce: string; redirectUri: string; countryCode: string };
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    return redirectWithError('invalid_state', 'Session corrompue');
  }

  // Verification anti-CSRF
  if (session.state !== state) {
    return redirectWithError('invalid_state', 'State ne correspond pas — tentative CSRF potentielle');
  }

  // ── Flux Signicat ──────────────────────────────────────────────

  try {
    // 1. Echange code → token → sub
    const callbackResult = await provider.handleCallback({
      code,
      state,
      redirectUri: session.redirectUri,
      providerId: 'signicat',
      methodId: session.methodId,
    } as SignicatCallbackParams);

    // 2. Generation du nullifier hash
    const verificationResult = await provider.verify(callbackResult);

    // 3. Enregistrement cote backend Rust
    const jwt = request.cookies.get('vita_token')?.value;

    const registerResponse = await fetch(
      `${VITA_API_URL}/identity/verify-provider`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
        body: JSON.stringify({
          nullifier_hash: verificationResult.nullifierHash,
          provider: verificationResult.providerId,
          country_code: verificationResult.countryCode,
          assurance_level: verificationResult.assuranceLevel,
        }),
      }
    );

    if (!registerResponse.ok) {
      const errorBody = await registerResponse.json().catch(() => ({}));
      const errorCode = (errorBody as Record<string, string>).code;

      if (registerResponse.status === 409 || errorCode === 'nullifier_exists') {
        return redirectWithError('already_registered', 'Cette identite est deja associee a un compte VITA');
      }

      return redirectWithError(
        'token_exchange_failed',
        (errorBody as Record<string, string>).message || 'Erreur d\'enregistrement'
      );
    }

    // 4. Succes — nettoyer le cookie et rediriger
    const response = NextResponse.redirect(
      new URL('/civis/verification?success=true', request.url)
    );
    response.cookies.delete('signicat_session');
    return response;

  } catch (err) {
    if (err instanceof SignicatError) {
      return redirectWithError(err.code, err.message);
    }
    return redirectWithError('token_exchange_failed', 'Erreur inattendue lors de la verification');
  }
}

// ── Helper ───────────────────────────────────────────────────────

function redirectWithError(code: string, message: string): NextResponse {
  const url = new URL('/civis/verification', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  url.searchParams.set('error', code);
  url.searchParams.set('message', message);

  const response = NextResponse.redirect(url);
  response.cookies.delete('signicat_session');
  return response;
}
