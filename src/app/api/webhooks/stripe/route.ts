// API Route — Webhook Stripe (backup)
//
// POST /api/webhooks/stripe
//
// Verifie la signature du webhook et traite les evenements Stripe Identity.
// Route de backup — le flux principal utilise le polling (GET /api/identity/stripe/status).

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-01-28.clover',
  });
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET non configure');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  try {
    // Lire le body brut (pas JSON.parse) pour la verification de signature
    const rawBody = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const stripe = getStripe();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      console.error('[Stripe Webhook] Signature invalide:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Traiter les evenements
    switch (event.type) {
      case 'identity.verification_session.canceled': {
        const session = event.data.object as Stripe.Identity.VerificationSession;
        const checkoutSessionId = session.metadata?.checkoutSessionId;

        if (checkoutSessionId) {
          await refundCheckout(checkoutSessionId);
          console.log(`[Stripe Webhook] Verification annulee, remboursement pour ${checkoutSessionId}`);
        }
        break;
      }

      default:
        // Evenement non gere — on l'ignore silencieusement
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Stripe Webhook]', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

// ── Remboursement ─────────────────────────────────────────────

async function refundCheckout(checkoutSessionId: string): Promise<void> {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);

    if (session.payment_intent && typeof session.payment_intent === 'string') {
      await stripe.refunds.create({
        payment_intent: session.payment_intent,
      });
    }
  } catch (err) {
    console.error('[Stripe Webhook Refund] Erreur:', err);
  }
}
