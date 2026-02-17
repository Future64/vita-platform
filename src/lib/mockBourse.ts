import type { Transaction, WalletData, ValuationResult } from "@/types/bourse";

// --- Mock users for search ---

export interface MockUser {
  id: string;
  nom: string;
  username: string;
  verifie: boolean;
}

export const MOCK_USERS: MockUser[] = [
  { id: "u-001", nom: "Marie Dupont", username: "@marie", verifie: true },
  { id: "u-002", nom: "Jean Martin", username: "@jean", verifie: true },
  { id: "u-003", nom: "Aisha Ndiaye", username: "@aisha", verifie: true },
  { id: "u-004", nom: "Lucas Bernard", username: "@lucas", verifie: true },
  { id: "u-005", nom: "Sophie Leclerc", username: "@sophie", verifie: true },
  { id: "u-006", nom: "Omar Benali", username: "@omar", verifie: true },
  { id: "u-007", nom: "Camille Roux", username: "@camille", verifie: false },
  { id: "u-008", nom: "Yuki Tanaka", username: "@yuki", verifie: true },
];

// --- Transactions mock ---

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

function today(): string {
  const d = new Date();
  d.setHours(0, 1, 0, 0);
  return d.toISOString();
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "tx-001", type: "emission", montant: 1, date: today(), statut: "confirmee" },
  { id: "tx-002", type: "envoi", montant: 3.5, date: daysAgo(1), contrepartie: "Marie Dupont", motif: "Cours de yoga", statut: "confirmee" },
  { id: "tx-003", type: "reception", montant: 5.0, date: daysAgo(1), contrepartie: "Jean Martin", motif: "Réparation vélo", statut: "confirmee" },
  { id: "tx-004", type: "emission", montant: 1, date: daysAgo(1), statut: "confirmee" },
  { id: "tx-005", type: "envoi", montant: 1.2, date: daysAgo(2), contrepartie: "Aisha Ndiaye", motif: "Pain artisanal", statut: "confirmee" },
  { id: "tx-006", type: "reception", montant: 8.0, date: daysAgo(2), contrepartie: "Sophie Leclerc", motif: "Plomberie urgente", statut: "confirmee" },
  { id: "tx-007", type: "emission", montant: 1, date: daysAgo(2), statut: "confirmee" },
  { id: "tx-008", type: "envoi", montant: 2.0, date: daysAgo(3), contrepartie: "Lucas Bernard", motif: "Livraison colis", statut: "confirmee" },
  { id: "tx-009", type: "reception", montant: 0.5, date: daysAgo(4), contrepartie: "Omar Benali", motif: "Café partagé", statut: "confirmee" },
  { id: "tx-010", type: "emission", montant: 1, date: daysAgo(3), statut: "confirmee" },
  { id: "tx-011", type: "envoi", montant: 15.0, date: daysAgo(5), contrepartie: "Camille Roux", motif: "Cours de guitare (5 séances)", statut: "confirmee" },
  { id: "tx-012", type: "reception", montant: 2.5, date: daysAgo(6), contrepartie: "Yuki Tanaka", motif: "Traduction document", statut: "confirmee" },
  { id: "tx-013", type: "emission", montant: 1, date: daysAgo(4), statut: "confirmee" },
  { id: "tx-014", type: "emission", montant: 1, date: daysAgo(5), statut: "confirmee" },
  { id: "tx-015", type: "envoi", montant: 0.8, date: daysAgo(7), contrepartie: "Marie Dupont", motif: "Prêt de livre", statut: "confirmee" },
  { id: "tx-016", type: "reception", montant: 12.0, date: daysAgo(8), contrepartie: "Jean Martin", motif: "Développement site web", statut: "confirmee" },
  { id: "tx-017", type: "emission", montant: 1, date: daysAgo(6), statut: "confirmee" },
  { id: "tx-018", type: "emission", montant: 1, date: daysAgo(7), statut: "confirmee" },
  { id: "tx-019", type: "envoi", montant: 4.0, date: daysAgo(10), contrepartie: "Sophie Leclerc", motif: "Ménage 3h", statut: "confirmee" },
  { id: "tx-020", type: "emission", montant: 1, date: daysAgo(8), statut: "confirmee" },
];

// --- Wallet data ---

export const MOCK_WALLET: WalletData = {
  solde: 42,
  emissionAujourdHui: true,
  prochaineEmission: (() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 1);
    d.setUTCHours(0, 0, 0, 0);
    return d.toISOString();
  })(),
  totalRecu: 28.0,
  totalEnvoye: 26.5,
  totalEmissions: 42,
  transactions: MOCK_TRANSACTIONS,
};

// --- Valuation presets ---

export interface ValuationPreset {
  nom: string;
  description: string;
  heures: number;
  minutes: number;
  F: number;
  P: number;
  R: number;
  L: number;
  M: number;
}

export const VALUATION_PRESETS: ValuationPreset[] = [
  {
    nom: "Ménage 3h",
    description: "Nettoyage d'un appartement standard",
    heures: 3,
    minutes: 0,
    F: 0,
    P: 0.1,
    R: 0,
    L: 0,
    M: 0.02,
  },
  {
    nom: "Cours particulier maths 1h",
    description: "Enseignement niveau lycée/université",
    heures: 1,
    minutes: 0,
    F: 0.4,
    P: 0,
    R: 0.1,
    L: 0.1,
    M: 0,
  },
  {
    nom: "Plomberie urgence 2h",
    description: "Intervention sur fuite avec pièces",
    heures: 2,
    minutes: 0,
    F: 0.3,
    P: 0.2,
    R: 0.2,
    L: 0.2,
    M: 0.15,
  },
  {
    nom: "Chirurgie 4h",
    description: "Intervention chirurgicale complexe",
    heures: 4,
    minutes: 0,
    F: 0.5,
    P: 0.2,
    R: 0.4,
    L: 0.3,
    M: 0.5,
  },
  {
    nom: "Récolte agricole 8h",
    description: "Récolte manuelle sur une journée",
    heures: 8,
    minutes: 0,
    F: 0.1,
    P: 0.4,
    R: 0,
    L: 0,
    M: 0,
  },
];

// --- Helper: compute valuation ---

export function computeValuation(
  heures: number,
  minutes: number,
  F: number,
  P: number,
  R: number,
  L: number,
  M: number
): ValuationResult {
  const T = (heures + minutes / 60) / 16;
  const multiplier = 1 + F + P + R + L;
  const total = T * multiplier + M;
  return {
    tempsBase: T,
    coeffFormation: F,
    coeffPenibilite: P,
    coeffResponsabilite: R,
    coeffRarete: L,
    coutMateriaux: M,
    total,
  };
}

// --- Helper: search users ---

export function searchUsers(query: string): MockUser[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  return MOCK_USERS.filter(
    (u) =>
      u.nom.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
  );
}
