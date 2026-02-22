// API Route — Polling du statut de verification Stripe Identity
//
// GET /api/identity/stripe/status
//
// Lit le cookie stripe_identity_session, interroge Stripe Identity,
// et retourne le statut de la verification.
//
// Si verified → genere nullifier, verifie unicite, cree vita_prefill cookie
// Si duplicate → lance remboursement auto
// Si cancelled → lance remboursement auto

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { decryptCookie, encryptCookie, getSessionSecret } from '@/lib/crypto/cookie-encryption';
import { generateNullifier } from '@/lib/identity/providers/nullifier';
import type { IdentityPrefillData } from '@/types/identity-prefill';

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-01-28.clover',
  });
}

const VITA_API_URL = process.env.NEXT_PUBLIC_VITA_API_URL || 'http://localhost:8080/api/v1';

interface StripeIdentitySession {
  verificationSessionId: string;
  checkoutSessionId: string;
  countryCode: string;
}

export async function GET(request: NextRequest) {
  try {
    // 1. Lire le cookie chiffre
    const sessionCookie = request.cookies.get('stripe_identity_session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { status: 'error', message: 'Session de verification absente ou expiree' },
        { status: 400 }
      );
    }

    const secret = getSessionSecret();
    let session: StripeIdentitySession;

    try {
      session = await decryptCookie<StripeIdentitySession>(sessionCookie.value, secret);
    } catch {
      return NextResponse.json(
        { status: 'error', message: 'Session corrompue' },
        { status: 400 }
      );
    }

    // 2. Interroger Stripe Identity
    const verification = await getStripe().identity.verificationSessions.retrieve(
      session.verificationSessionId
    );

    // 3. Traiter le statut
    if (verification.status === 'verified') {
      return await handleVerified(request, session, verification, secret);
    }

    if (verification.status === 'canceled') {
      await refundCheckout(session.checkoutSessionId);

      const response = NextResponse.json({
        status: 'cancelled',
        message: 'Verification annulee. Un remboursement a ete initie.',
      });
      response.cookies.delete('stripe_identity_session');
      return response;
    }

    // requires_input = echec, l'utilisateur doit recommencer
    if (verification.status === 'requires_input') {
      return NextResponse.json({
        status: 'requires_input',
        message: 'La verification a echoue. Veuillez reessayer.',
      });
    }

    // processing = en cours
    return NextResponse.json({ status: 'processing' });
  } catch (err) {
    console.error('[Stripe Status]', err);
    return NextResponse.json(
      { status: 'error', message: 'Erreur lors de la verification du statut' },
      { status: 500 }
    );
  }
}

// ── Verified handler ──────────────────────────────────────────

async function handleVerified(
  request: NextRequest,
  session: StripeIdentitySession,
  verification: Stripe.Identity.VerificationSession,
  secret: string,
): Promise<NextResponse> {
  // Generer le nullifier depuis l'ID de verification Stripe
  const nullifierHash = await generateNullifier(
    verification.id,
    'stripe_identity'
  );

  // Verifier unicite cote backend Rust
  const jwt = request.cookies.get('vita_token')?.value;

  const verifyResponse = await fetch(`${VITA_API_URL}/identity/verify-provider`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    body: JSON.stringify({
      nullifier_hash: nullifierHash,
      provider: 'stripe_identity',
      country_code: session.countryCode,
      assurance_level: 'substantial',
    }),
  });

  if (!verifyResponse.ok) {
    const errorBody = await verifyResponse.json().catch(() => ({}));
    const errorCode = (errorBody as Record<string, string>).code;

    if (verifyResponse.status === 409 || errorCode === 'nullifier_exists') {
      // Doublon — remboursement auto
      await refundCheckout(session.checkoutSessionId);

      const response = NextResponse.json({
        status: 'duplicate',
        message: 'Cette identite est deja associee a un compte VITA. Un remboursement a ete initie.',
      });
      response.cookies.delete('stripe_identity_session');
      return response;
    }

    throw new Error(
      (errorBody as Record<string, string>).message || 'Erreur de verification d\'unicite'
    );
  }

  // Creer le cookie prefill
  const prefill: IdentityPrefillData = {
    nullifierHash,
    provider: 'stripe_identity',
    countryCode: session.countryCode,
    verifiedAt: new Date().toISOString(),
    assuranceLevel: 'substantial',
  };

  const encrypted = await encryptCookie(prefill, secret);

  const response = NextResponse.json({ status: 'verified' });

  response.cookies.set('vita_prefill', encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1800, // 30 minutes
    path: '/',
  });

  response.cookies.delete('stripe_identity_session');

  return response;
}

// ── Remboursement ─────────────────────────────────────────────

async function refundCheckout(checkoutSessionId: string): Promise<void> {
  try {
    const session = await getStripe().checkout.sessions.retrieve(checkoutSessionId);

    if (session.payment_intent && typeof session.payment_intent === 'string') {
      await getStripe().refunds.create({
        payment_intent: session.payment_intent,
      });
      console.log(`[Stripe Refund] Remboursement initie pour ${checkoutSessionId}`);
    }
  } catch (err) {
    console.error('[Stripe Refund] Erreur de remboursement:', err);
  }
}
