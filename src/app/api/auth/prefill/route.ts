// API Route — Lecture unique du cookie prefill chiffre
//
// GET /api/auth/prefill
//
// Le cookie vita_prefill est httpOnly → la page client ne peut pas le lire.
// Cette route le dechiffre, retourne le JSON, puis SUPPRIME le cookie.
// C'est un token a usage unique : une seule lecture, puis il disparait.

import { NextRequest, NextResponse } from 'next/server';
import { decryptCookie, getSessionSecret } from '@/lib/crypto/cookie-encryption';
import type { IdentityPrefillData } from '@/types/identity-prefill';

export async function GET(request: NextRequest) {
  const prefillCookie = request.cookies.get('vita_prefill');

  if (!prefillCookie?.value) {
    return NextResponse.json({ prefill: null });
  }

  try {
    const secret = getSessionSecret();
    const data = await decryptCookie<IdentityPrefillData>(prefillCookie.value, secret);

    // Retourner les donnees prefill et supprimer le cookie (usage unique)
    const response = NextResponse.json({ prefill: data });
    response.cookies.delete('vita_prefill');
    return response;
  } catch (err) {
    console.error('[Prefill] Erreur dechiffrement:', err);
    const response = NextResponse.json({ prefill: null });
    response.cookies.delete('vita_prefill');
    return response;
  }
}
