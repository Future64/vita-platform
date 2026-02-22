import { describe, it, expect } from 'vitest';
import {
  getProvidersForCountry,
  getAllCountryCodes,
  hasEidProvider,
  COUNTRY_PROVIDERS_MAP,
  COUNTRY_DISPLAY_NAMES,
} from './country-map';

// ══════════════════════════════════════════════════════════════════
// getProvidersForCountry
// ══════════════════════════════════════════════════════════════════

describe('getProvidersForCountry', () => {
  it('FR → FranceConnect, pas de WoT', () => {
    const providers = getProvidersForCountry('FR');
    expect(providers.length).toBeGreaterThanOrEqual(1);

    const fc = providers.find((p) => p.provider === 'franceconnect');
    expect(fc).toBeDefined();
    expect(fc!.category).toBe('state');
    expect(fc!.assuranceLevel).toBe('substantial');

    // Aucun Web of Trust
    const wot = providers.find((p) => p.provider === 'web_of_trust');
    expect(wot).toBeUndefined();
  });

  it('US → Stripe Identity avec prix', () => {
    const providers = getProvidersForCountry('US');
    expect(providers.length).toBeGreaterThanOrEqual(1);

    const stripe = providers.find((p) => p.provider === 'stripe_identity');
    expect(stripe).toBeDefined();
    expect(stripe!.category).toBe('paid');
    expect(stripe!.price).toBeDefined();
    expect(stripe!.price!.amount).toBe(200);
    expect(stripe!.price!.currency).toBe('EUR');
  });

  it('XX (pays inconnu) → Stripe Identity fallback', () => {
    const providers = getProvidersForCountry('XX');
    expect(providers.length).toBe(1);
    expect(providers[0].provider).toBe('stripe_identity');
    expect(providers[0].price).toBeDefined();
  });

  it('aucun provider n\'a provider === "web_of_trust"', () => {
    const allCodes = getAllCountryCodes();
    for (const code of allCodes) {
      const providers = getProvidersForCountry(code);
      const wot = providers.find((p) => p.provider === 'web_of_trust');
      expect(wot).toBeUndefined();
    }
  });

  it('DE → Signicat nPA (high)', () => {
    const providers = getProvidersForCountry('DE');
    const npa = providers.find((p) => p.methodId === 'npa');
    expect(npa).toBeDefined();
    expect(npa!.assuranceLevel).toBe('high');
    expect(npa!.category).toBe('state');
  });

  it('les nouveaux pays Signicat (PT, ES, AT) sont presents', () => {
    const pt = getProvidersForCountry('PT');
    expect(pt.some((p) => p.methodId === 'autenticacao')).toBe(true);

    const es = getProvidersForCountry('ES');
    expect(es.some((p) => p.methodId === 'clave')).toBe(true);

    const at = getProvidersForCountry('AT');
    expect(at.some((p) => p.methodId === 'id-austria')).toBe(true);
    expect(at.find((p) => p.methodId === 'id-austria')!.assuranceLevel).toBe('high');
  });

  it('CH → SwissID via Signicat', () => {
    const ch = getProvidersForCountry('CH');
    expect(ch.some((p) => p.methodId === 'swissid')).toBe(true);
  });

  it('SG → Singpass via Signicat', () => {
    const sg = getProvidersForCountry('SG');
    expect(sg.some((p) => p.methodId === 'singpass')).toBe(true);
  });

  it('les providers sont tries par categorie (state > banking > paid)', () => {
    const nl = getProvidersForCountry('NL');
    // NL a state (digiid), banking (idin)
    const categories = nl.map((p) => p.category);
    const stateIndex = categories.indexOf('state');
    const bankingIndex = categories.indexOf('banking');
    if (stateIndex !== -1 && bankingIndex !== -1) {
      expect(stateIndex).toBeLessThan(bankingIndex);
    }
  });

  it('gere le case-insensitive (fr, Fr, fR)', () => {
    const lower = getProvidersForCountry('fr');
    const upper = getProvidersForCountry('FR');
    const mixed = getProvidersForCountry('fR');
    expect(lower).toEqual(upper);
    expect(lower).toEqual(mixed);
  });
});

// ══════════════════════════════════════════════════════════════════
// hasEidProvider
// ══════════════════════════════════════════════════════════════════

describe('hasEidProvider', () => {
  it('retourne true pour FR (FranceConnect)', () => {
    expect(hasEidProvider('FR')).toBe(true);
  });

  it('retourne true pour DE (Signicat nPA)', () => {
    expect(hasEidProvider('DE')).toBe(true);
  });

  it('retourne false pour US (Stripe Identity uniquement)', () => {
    expect(hasEidProvider('US')).toBe(false);
  });

  it('retourne false pour un pays inconnu', () => {
    expect(hasEidProvider('ZZ')).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════
// getAllCountryCodes
// ══════════════════════════════════════════════════════════════════

describe('getAllCountryCodes', () => {
  it('retourne un tableau non vide', () => {
    const codes = getAllCountryCodes();
    expect(codes.length).toBeGreaterThan(0);
  });

  it('contient FR, DE, US, JP', () => {
    const codes = getAllCountryCodes();
    expect(codes).toContain('FR');
    expect(codes).toContain('DE');
    expect(codes).toContain('US');
    expect(codes).toContain('JP');
  });

  it('est trie alphabetiquement par nom affiche', () => {
    const codes = getAllCountryCodes();
    const names = codes.map((c) => COUNTRY_DISPLAY_NAMES[c] || c);
    const sorted = [...names].sort((a, b) => a.localeCompare(b, 'fr'));
    expect(names).toEqual(sorted);
  });
});

// ══════════════════════════════════════════════════════════════════
// COUNTRY_DISPLAY_NAMES
// ══════════════════════════════════════════════════════════════════

describe('COUNTRY_DISPLAY_NAMES', () => {
  it('tous les pays de la map ont un nom affiche', () => {
    const codes = Object.keys(COUNTRY_PROVIDERS_MAP);
    for (const code of codes) {
      expect(COUNTRY_DISPLAY_NAMES[code]).toBeDefined();
    }
  });
});
