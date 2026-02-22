// DEPRECATED — Redirige vers /api/auth/initiate/franceconnect
//
// Cette route est conservee pour compatibilite.
// Le nouveau flux utilise GET /api/auth/initiate/franceconnect

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;
  return NextResponse.redirect(
    `${origin}/api/auth/initiate/franceconnect`,
    308
  );
}

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  return NextResponse.redirect(
    `${origin}/api/auth/initiate/franceconnect`,
    308
  );
}
