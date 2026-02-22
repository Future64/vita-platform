// Utilitaire de chiffrement AES-256-GCM pour cookies httpOnly
//
// Utilise la Web Crypto API (compatible Node.js 18+ et edge runtimes).
// Le format chiffre : base64url(iv || ciphertext || tag)

// ── Secret de session ──────────────────────────────────────────

export function getSessionSecret(): string {
  const secret = process.env.VITA_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      'VITA_SESSION_SECRET is not defined. ' +
      'Set it in .env.local (min 32 characters, random hex).'
    );
  }
  if (secret.length < 32) {
    throw new Error(
      'VITA_SESSION_SECRET must be at least 32 characters long.'
    );
  }
  return secret;
}

// ── Derive une cle AES-256 depuis le secret ──────────────────

async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('vita-cookie-v1'),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// ── Base64url helpers ────────────────────────────────────────

function base64UrlEncode(buffer: Uint8Array): string {
  let binary = '';
  for (const byte of buffer) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ── API publique ─────────────────────────────────────────────

/**
 * Chiffre un objet JSON en AES-256-GCM et retourne une chaine base64url.
 */
export async function encryptCookie(data: unknown, secret: string): Promise<string> {
  const key = await deriveKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(data));

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );

  // Concatener iv + ciphertext (le tag est inclus dans le ciphertext par WebCrypto)
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return base64UrlEncode(combined);
}

/**
 * Dechiffre une chaine base64url AES-256-GCM et retourne l'objet JSON.
 */
export async function decryptCookie<T = unknown>(encrypted: string, secret: string): Promise<T> {
  const key = await deriveKey(secret);
  const combined = base64UrlDecode(encrypted);

  if (combined.length < 13) {
    throw new Error('Cookie data too short');
  }

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(plaintext)) as T;
}
