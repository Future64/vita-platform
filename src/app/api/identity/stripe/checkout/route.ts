// API Route — Creation d'une session Stripe Checkout pour la verification d'identite
//
// POST /api/identity/stripe/checkout
// Body: { countryCode: string }
//
// Cree une session Stripe Checkout a 2€ pour la verification d'identite.
// Retourne { checkoutUrl } → le client fait window.location.href = checkoutUrl

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2026-01-28.clover',
  });
}

const PRICE_CENTS = parseInt(process.env.STRIPE_IDENTITY_PRICE_EUR || '200', 10);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countryCode } = body;

    if (!countryCode || typeof countryCode !== 'string') {
      return NextResponse.json(
        { error: 'countryCode requis' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[Stripe Checkout] STRIPE_SECRET_KEY non configure');
      return NextResponse.json(
        { error: 'Service de paiement non configure' },
        { status: 503 }
      );
    }

    const origin = request.nextUrl.origin;

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: PRICE_CENTS,
            product_data: {
              name: 'Verification d\'identite VITA',
              description: 'Scan de document d\'identite + selfie via Stripe Identity',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        countryCode: countryCode.toUpperCase(),
        purpose: 'identity_verification',
      },
      success_url: `${origin}/api/identity/stripe/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/auth/register?error=payment_cancelled&message=${encodeURIComponent('Paiement annule. Vous pouvez reessayer.')}`,
    });

    if (!session.url) {
      throw new Error('Stripe n\'a pas retourne d\'URL de checkout');
    }

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error('[Stripe Checkout]', err);
    return NextResponse.json(
      { error: 'Erreur lors de la creation de la session de paiement' },
      { status: 500 }
    );
  }
}
