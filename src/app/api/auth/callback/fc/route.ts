// API Route — FranceConnect v2 callback handler
//
// GET /api/auth/callback/fc?code=...&state=...
//
// Ce handler :
//   1. Verifie le state (anti-CSRF) via le cookie de session
//   2. Echange le code contre un token FranceConnect
//   3. Extrait le sub (identifiant pseudonymise)
//   4. Genere le nullifier_hash (HMAC-SHA256)
//   5. Verifie que le nullifier n'est pas deja enregistre
//   6. Envoie le nullifier au backend Rust pour enregistrement
//   7. Redirige vers /civis/verification?success=true
//
// JAMAIS de donnees personnelles en transit ou en stockage.

import { NextRequest, NextResponse } from 'next/server';
import { FranceConnectProvider, FranceConnectError } from '@/lib/identity/providers/franceconnect/provider';
import type { FCCallbackParams } from '@/lib/identity/providers/franceconnect/provider';

const VITA_API_URL = process.env.NEXT_PUBLIC_VITA_API_URL || 'http://localhost:8080/api/v1';
const provider = new FranceConnectProvider();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // ── Erreur retournee par FranceConnect ─────────────────────────

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

  // ── Recuperation de la session (state + PKCE verifier) ─────────

  const sessionCookie = request.cookies.get('fc_session');
  if (!sessionCookie?.value) {
    return redirectWithError('invalid_state', 'Session expirée ou invalide');
  }

  let session: { state: string; codeVerifier: string; nonce: string; redirectUri: string; returnTo?: string };
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    return redirectWithError('invalid_state', 'Session corrompue');
  }

  // Verification anti-CSRF
  if (session.state !== state) {
    return redirectWithError('invalid_state', 'State ne correspond pas — tentative CSRF potentielle');
  }

  // ── Flux FranceConnect ─────────────────────────────────────────

  try {
    // 1. Echange code → token → sub
    const callbackResult = await provider.handleCallback({
      code,
      state,
      redirectUri: session.redirectUri,
      providerId: 'franceconnect',
      codeVerifier: session.codeVerifier,
    } as FCCallbackParams);

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

    // 4. Succes — nettoyer le cookie de session et rediriger
    const returnTo = session.returnTo || '/civis/verification';
    const successUrl = new URL(returnTo, request.url);

    if (returnTo.includes('/auth/register')) {
      // Inscription : passer les params de verification dans l'URL
      successUrl.searchParams.set('verified', 'true');
      successUrl.searchParams.set('provider', verificationResult.providerId);
      successUrl.searchParams.set('nullifier_hash', verificationResult.nullifierHash);
      successUrl.searchParams.set('country', verificationResult.countryCode);
    } else {
      successUrl.searchParams.set('success', 'true');
    }

    const response = NextResponse.redirect(successUrl);
    response.cookies.delete('fc_session');
    return response;

  } catch (err) {
    if (err instanceof FranceConnectError) {
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
  response.cookies.delete('fc_session');
  return response;
}
