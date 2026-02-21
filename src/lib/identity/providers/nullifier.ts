// Generation de nullifier hash pour la verification d'identite VITA
//
// Le nullifier est un hash HMAC-SHA256 unique par couple (sub, provider).
// Il permet de garantir "1 personne = 1 compte" sans stocker l'identite.
//
// Proprietes :
//   - Deterministe : meme (sub, provider) → meme nullifier
//   - Irreversible : impossible de retrouver le sub depuis le hash
//   - Isole par provider : empeche le cross-service tracking
//   - Lie au secret applicatif : inutilisable sans la cle VITA

import type { IdentityProviderId } from './types';

// ── Secret applicatif ────────────────────────────────────────────

function getNullifierSecret(): string {
  const secret = process.env.VITA_NULLIFIER_SECRET;
  if (!secret) {
    throw new Error(
      'VITA_NULLIFIER_SECRET is not defined. ' +
      'Set it in .env.local (min 32 characters, random hex).'
    );
  }
  if (secret.length < 32) {
    throw new Error(
      'VITA_NULLIFIER_SECRET must be at least 32 characters long.'
    );
  }
  return secret;
}

// ── HMAC-SHA256 implementation ───────────────────────────────────

/**
 * Calcule un HMAC-SHA256 via la Web Crypto API (Node.js 18+).
 * Fonctionne dans Node.js et dans les edge runtimes.
 */
async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ── API publique ─────────────────────────────────────────────────

/**
 * Genere un nullifier hash unique pour un couple (sub, provider).
 *
 * Le message signe est : "vita-nullifier-v1:{provider}:{sub}"
 * Le prefixe versionne permet de migrer le schema si necessaire.
 *
 * @param sub - Subject identifier retourne par le provider OAuth/OIDC
 * @param provider - Identifiant du provider (franceconnect, signicat, web_of_trust)
 * @returns Hash hexadecimal de 64 caracteres (SHA-256)
 *
 * @example
 * const hash = await generateNullifier("abc123", "franceconnect");
 * // → "a3f8e1c2d4b5..." (64 hex chars)
 */
export async function generateNullifier(
  sub: string,
  provider: IdentityProviderId
): Promise<string> {
  if (!sub || sub.trim().length === 0) {
    throw new Error('Subject identifier (sub) cannot be empty');
  }

  const secret = getNullifierSecret();
  const message = `vita-nullifier-v1:${provider}:${sub}`;

  return hmacSha256(secret, message);
}

/**
 * Verifie qu'un nullifier hash est au format attendu.
 * Utile pour la validation cote API avant insertion en base.
 */
export function isValidNullifierHash(hash: string): boolean {
  return /^[0-9a-f]{64}$/.test(hash);
}
