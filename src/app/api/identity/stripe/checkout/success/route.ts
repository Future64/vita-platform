// API Route — Apres paiement Stripe, lancer la verification Stripe Identity
//
// GET /api/identity/stripe/checkout/success?session_id=cs_xxx
//
// Ce handler :
//   1. Verifie que le paiement est complete (payment_status === 'paid')
//   2. Cree une VerificationSession Stripe Identity (document + selfie)
//   3. Stocke { vsId, checkoutId, countryCode } dans un cookie chiffre
//   4. Redirige vers l'UI Stripe Identity

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { encryptCookie, getSessionSecret } from '@/lib/crypto/cookie-encryption';

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-01-28.clover',
  });
}

interface StripeIdentitySession {
  verificationSessionId: string;
  checkoutSessionId: string;
  countryCode: string;
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;

  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return redirectWithError(origin, 'Identifiant de session manquant');
    }

    // 1. Verifier le paiement
    const checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== 'paid') {
      return redirectWithError(origin, 'Paiement non confirme');
    }

    const countryCode = (checkoutSession.metadata?.countryCode || '').toUpperCase();

    // 2. Creer la VerificationSession Stripe Identity
    const verificationSession = await getStripe().identity.verificationSessions.create({
      type: 'document',
      options: {
        document: {
          require_matching_selfie: true,
        },
      },
      metadata: {
        checkoutSessionId: sessionId,
        countryCode,
        purpose: 'vita_identity_verification',
      },
      return_url: `${origin}/auth/register?verifying=true`,
    });

    if (!verificationSession.url) {
      throw new Error('Stripe Identity n\'a pas retourne d\'URL de verification');
    }

    // 3. Stocker les infos dans un cookie chiffre
    const sessionData: StripeIdentitySession = {
      verificationSessionId: verificationSession.id,
      checkoutSessionId: sessionId,
      countryCode,
    };

    const secret = getSessionSecret();
    const encrypted = await encryptCookie(sessionData, secret);

    const response = NextResponse.redirect(verificationSession.url);

    response.cookies.set('stripe_identity_session', encrypted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1 heure
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[Stripe Identity Success]', err);
    return redirectWithError(
      origin,
      err instanceof Error ? err.message : 'Erreur lors du lancement de la verification'
    );
  }
}

function redirectWithError(origin: string, message: string): NextResponse {
  const url = new URL('/auth/register', origin);
  url.searchParams.set('error', 'init_failed');
  url.searchParams.set('message', message);
  return NextResponse.redirect(url);
}
