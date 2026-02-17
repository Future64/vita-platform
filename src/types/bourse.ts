// Types pour le module Bourse (portefeuille VITA)

export type TransactionType = "emission" | "envoi" | "reception";

export type TransactionStatus = "confirmee" | "en_attente" | "echouee";

export interface Transaction {
  id: string;
  type: TransactionType;
  montant: number;
  date: string; // ISO 8601
  contrepartie?: string; // nom ou identifiant
  motif?: string;
  statut: TransactionStatus;
}

export interface WalletData {
  solde: number;
  emissionAujourdHui: boolean;
  prochaineEmission: string; // ISO 8601 (prochain minuit UTC)
  totalRecu: number;
  totalEnvoye: number;
  totalEmissions: number;
  transactions: Transaction[];
}

export interface ValuationResult {
  tempsBase: number;
  coeffFormation: number;
  coeffPenibilite: number;
  coeffResponsabilite: number;
  coeffRarete: number;
  coutMateriaux: number;
  total: number;
}
