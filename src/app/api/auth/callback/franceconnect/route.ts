// API Route — FranceConnect v2 callback handler
//
// GET /api/auth/callback/franceconnect?code=...&state=...
//
// Ce handler :
//   1. Verifie le state (anti-CSRF) via le cookie fc_session
//   2. Echange le code contre un token (PKCE)
//   3. Fetch /userinfo avec l'access_token
//   4. Genere le nullifier_hash (HMAC-SHA256)
//   5. Verifie unicite cote backend Rust
//   6. Chiffre IdentityPrefillData dans cookie vita_prefill
//   7. Redirige vers /auth/register
//
// JAMAIS de donnees personnelles stockees en base.

import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'node:crypto';
import { FC_URLS, FC_CONFIG } from '@/lib/identity/franceconnect/config';
import { encryptCookie, getSessionSecret } from '@/lib/crypto/cookie-encryption';
import type { IdentityPrefillData } from '@/types/identity-prefill';

const VITA_API_URL = process.env.NEXT_PUBLIC_VITA_API_URL || 'http://localhost:8080/api/v1';

// ── Session shape ─────────────────────────────────────────────

interface FCSession {
  state: string;
  nonce: string;
  codeVerifier: string;
  redirectUri: string;
}

// ── Nullifier generation ──────────────────────────────────────

function generateNullifierHash(sub: string): string {
  const secret = process.env.VITA_HMAC_SECRET || process.env.VITA_NULLIFIER_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('VITA_HMAC_SECRET non configure (min 32 chars)');
  }
  const message = `vita-nullifier-v1:franceconnect:${sub}`;
  return createHmac('sha256', secret).update(message).digest('hex');
}

// ── JWT payload decode (sans verification — signature verifiee cote Rust) ──

function decodeJwtPayload(jwt: string): Record<string, unknown> {
  const parts = jwt.split('.');
  if (parts.length !== 3) throw new Error('Format JWT invalide');
  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
}

// ── Route GET ─────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const origin = request.nextUrl.origin;

  // ── Erreur retournee par FranceConnect ─────────────────────

  if (error) {
    const errorDesc = searchParams.get('error_description') || 'Erreur inconnue';
    if (error === 'access_denied') {
      return redirectWithError(origin, 'user_cancelled', 'Authentification annulee');
    }
    return redirectWithError(origin, 'token_exchange_failed', errorDesc);
  }

  // ── Validation des parametres ──────────────────────────────

  if (!code || !state) {
    return redirectWithError(origin, 'invalid_state', 'Parametres manquants (code ou state)');
  }

  // ── Recuperation de la session fc_session ──────────────────

  const sessionCookie = request.cookies.get('fc_session');
  if (!sessionCookie?.value) {
    return redirectWithError(origin, 'invalid_state', 'Session FranceConnect expiree ou absente');
  }

  let session: FCSession;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    return redirectWithError(origin, 'invalid_state', 'Session corrompue');
  }

  // Verification anti-CSRF
  if (session.state !== state) {
    return redirectWithError(origin, 'invalid_state', 'State ne correspond pas — tentative CSRF potentielle');
  }

  try {
    // ── 1. Echange code → token (avec PKCE) ─────────────────

    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: session.redirectUri,
      client_id: FC_CONFIG.clientId,
      client_secret: FC_CONFIG.clientSecret,
      code_verifier: session.codeVerifier,
    });

    const tokenResponse = await fetch(FC_URLS.token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody,
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      if (tokenResponse.status === 400 && errorBody.includes('expired')) {
        return redirectWithError(origin, 'token_exchange_failed', "Le code d'autorisation a expire. Veuillez recommencer.");
      }
      throw new Error(`Token exchange echoue (${tokenResponse.status}): ${errorBody}`);
    }

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error('Reponse token incomplete (access_token manquant)');
    }

    // ── 2. Decode id_token pour le niveau eIDAS ─────────────

    let acr = '';
    if (tokenData.id_token) {
      try {
        const payload = decodeJwtPayload(tokenData.id_token);
        acr = (payload.acr as string) || '';
      } catch {
        // Non bloquant — on continue avec acr vide
      }
    }

    const assuranceLevel = acr === 'eidas2' ? 'substantial' : 'low';

    // ── 3. Fetch /userinfo ──────────────────────────────────

    const userinfoResponse = await fetch(FC_URLS.userinfo, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userinfoResponse.ok) {
      throw new Error(`Userinfo echoue (${userinfoResponse.status})`);
    }

    const userinfo = await userinfoResponse.json();

    if (!userinfo.sub) {
      throw new Error('Claim sub manquant dans la reponse userinfo');
    }

    // ── 4. Generer le nullifier hash ────────────────────────

    const nullifierHash = generateNullifierHash(userinfo.sub);

    // ── 5. Verifier unicite cote backend Rust ───────────────

    const jwt = request.cookies.get('vita_token')?.value;

    const verifyResponse = await fetch(`${VITA_API_URL}/identity/verify-provider`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify({
        nullifier_hash: nullifierHash,
        provider: 'franceconnect',
        country_code: 'FR',
        assurance_level: assuranceLevel,
      }),
    });

    if (!verifyResponse.ok) {
      const errorBody = await verifyResponse.json().catch(() => ({}));
      const errorCode = (errorBody as Record<string, string>).code;

      if (verifyResponse.status === 409 || errorCode === 'nullifier_exists') {
        return redirectWithError(origin, 'already_registered', 'Cette identite est deja associee a un compte VITA');
      }

      return redirectWithError(
        origin,
        'token_exchange_failed',
        (errorBody as Record<string, string>).message || "Erreur lors de la verification d'unicite"
      );
    }

    // ── 6. Calculer isAdult depuis birthdate ────────────────

    let isAdult: boolean | undefined;
    if (typeof userinfo.birthdate === 'string') {
      const birth = new Date(userinfo.birthdate);
      const now = new Date();
      const age = now.getFullYear() - birth.getFullYear();
      const monthDiff = now.getMonth() - birth.getMonth();
      isAdult =
        age > 18 ||
        (age === 18 &&
          (monthDiff > 0 || (monthDiff === 0 && now.getDate() >= birth.getDate())));
    }

    // ── 7. Construire et chiffrer le prefill ────────────────

    const prefill: IdentityPrefillData = {
      nullifierHash,
      provider: 'franceconnect',
      countryCode: 'FR',
      verifiedAt: new Date().toISOString(),
      assuranceLevel,
      suggestedEmail: typeof userinfo.email === 'string' ? userinfo.email : undefined,
      gender: typeof userinfo.gender === 'string' ? userinfo.gender : undefined,
      isAdult,
    };

    const secret = getSessionSecret();
    const encrypted = await encryptCookie(prefill, secret);

    const redirectUrl = new URL('/auth/register', origin);
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set('vita_prefill', encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1800, // 30 minutes
      path: '/',
    });

    // Supprimer le cookie de session FC
    response.cookies.delete('fc_session');

    return response;
  } catch (err) {
    console.error('[FC Callback]', err);
    return redirectWithError(
      origin,
      'token_exchange_failed',
      err instanceof Error ? err.message : 'Erreur inattendue lors de la verification'
    );
  }
}

// ── Helper ───────────────────────────────────────────────────

function redirectWithError(origin: string, code: string, message: string): NextResponse {
  const url = new URL('/auth/register', origin);
  url.searchParams.set('error', code);
  url.searchParams.set('message', message);

  const response = NextResponse.redirect(url);
  response.cookies.delete('fc_session');
  response.cookies.delete('vita_prefill');
  return response;
}
