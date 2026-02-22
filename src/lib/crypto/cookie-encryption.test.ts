import { describe, it, expect } from 'vitest';
import { encryptCookie, decryptCookie } from './cookie-encryption';

const TEST_SECRET = 'a'.repeat(64); // 64 chars hex — valid secret

describe('cookie-encryption', () => {
  it('round-trip encrypt/decrypt', async () => {
    const data = { foo: 'bar', count: 42, nested: { ok: true } };
    const encrypted = await encryptCookie(data, TEST_SECRET);
    const decrypted = await decryptCookie(encrypted, TEST_SECRET);

    expect(decrypted).toEqual(data);
  });

  it('encrypted output is base64url format', async () => {
    const encrypted = await encryptCookie({ test: true }, TEST_SECRET);

    expect(encrypted).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(encrypted.length).toBeGreaterThan(20);
  });

  it('different encryptions of same data produce different ciphertexts', async () => {
    const data = { same: 'data' };
    const e1 = await encryptCookie(data, TEST_SECRET);
    const e2 = await encryptCookie(data, TEST_SECRET);

    // Due to random IV, these should be different
    expect(e1).not.toBe(e2);
  });

  it('wrong secret fails to decrypt', async () => {
    const data = { secret: 'info' };
    const encrypted = await encryptCookie(data, TEST_SECRET);
    const wrongSecret = 'b'.repeat(64);

    await expect(decryptCookie(encrypted, wrongSecret)).rejects.toThrow();
  });

  it('tampered data fails to decrypt', async () => {
    const data = { integrity: 'check' };
    const encrypted = await encryptCookie(data, TEST_SECRET);

    // Tamper with the ciphertext — flip a character
    const tampered = encrypted.slice(0, 20) +
      (encrypted[20] === 'A' ? 'B' : 'A') +
      encrypted.slice(21);

    await expect(decryptCookie(tampered, TEST_SECRET)).rejects.toThrow();
  });

  it('empty string fails to decrypt', async () => {
    await expect(decryptCookie('', TEST_SECRET)).rejects.toThrow();
  });

  it('too short data fails to decrypt', async () => {
    await expect(decryptCookie('abc', TEST_SECRET)).rejects.toThrow();
  });

  it('handles unicode data correctly', async () => {
    const data = { name: 'Jean-Pierre', emoji: 'Ѵ', accents: 'cafe' };
    const encrypted = await encryptCookie(data, TEST_SECRET);
    const decrypted = await decryptCookie(encrypted, TEST_SECRET);

    expect(decrypted).toEqual(data);
  });

  it('handles large payloads', async () => {
    const data = { large: 'x'.repeat(10000) };
    const encrypted = await encryptCookie(data, TEST_SECRET);
    const decrypted = await decryptCookie(encrypted, TEST_SECRET);

    expect(decrypted).toEqual(data);
  });
});
