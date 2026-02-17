// Types pour le Codex — navigation, documentation technique, registre

export interface CodexSection {
  id: string;
  type: 'constitution' | 'loi' | 'parametre' | 'technique' | 'registre';
  title: string;
  icon: string;
  children?: CodexSection[];
  path: string;
}

export interface TechnicalDoc {
  id: string;
  title: string;
  slug: string;
  icon: string;
  lastUpdated: string;
  version: string;
  sections: TechnicalDocSection[];
}

export interface TechnicalDocSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface RegisterEntry {
  id: string;
  date: string;
  type: 'constitutionnel' | 'legislatif' | 'parametre' | 'technique';
  title: string;
  description: string;
  proposalId?: string;
  voteResult?: { pour: number; contre: number; participation: number };
  status: 'proposed' | 'adopted' | 'rejected' | 'applied' | 'appeal';
  author: string;
  diff?: { before: string; after: string };
}
