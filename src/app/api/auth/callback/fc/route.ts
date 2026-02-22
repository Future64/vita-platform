// DEPRECATED — Redirige vers /api/auth/callback/franceconnect
//
// Cette route est conservee pour compatibilite.
// Le nouveau flux utilise GET /api/auth/callback/franceconnect

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const search = request.nextUrl.search;
  return NextResponse.redirect(
    `${origin}/api/auth/callback/franceconnect${search}`,
    308
  );
}
