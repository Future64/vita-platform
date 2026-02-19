// Types pour la recherche globale VITA

export type SearchResultType =
  | "proposition"
  | "doleance"
  | "citoyen"
  | "parametre"
  | "documentation"
  | "transaction"
  | "revision"
  | "demande_integration"
  | "recompense"
  | "page";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  titre: string;
  description?: string;
  lien: string;
  icone: string;
  couleur: string;
  metadata?: {
    statut?: string;
    auteur?: string;
    date?: string;
    badge?: string;
  };
  score: number;
}
