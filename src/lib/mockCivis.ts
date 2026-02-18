// Mock data for the Civis module (Activity + Achievements)

// ============================================================
// USER ACTIVITY
// ============================================================

export type ActivityType =
  | "vote"
  | "proposition"
  | "commentaire"
  | "transaction_envoi"
  | "transaction_reception"
  | "emission"
  | "delegation"
  | "modification_profil"
  | "soutien_doleance"
  | "revision"
  | "demande_integration"
  | "relecture";

export interface UserActivity {
  id: string;
  type: ActivityType;
  titre: string;
  description?: string;
  date: string;
  dateIso: string;
  lien?: string;
  metadata?: Record<string, string | number>;
}

export const ACTIVITY_TYPE_CONFIG: Record<
  ActivityType,
  { label: string; color: string; iconName: string }
> = {
  vote: { label: "Vote", color: "text-cyan-500", iconName: "Vote" },
  proposition: { label: "Proposition", color: "text-orange-500", iconName: "FileText" },
  commentaire: { label: "Commentaire", color: "text-blue-500", iconName: "MessageCircle" },
  transaction_envoi: { label: "Envoi", color: "text-red-500", iconName: "ArrowUpRight" },
  transaction_reception: { label: "Réception", color: "text-green-500", iconName: "ArrowDownLeft" },
  emission: { label: "Émission", color: "text-violet-500", iconName: "Coins" },
  delegation: { label: "Délégation", color: "text-cyan-500", iconName: "Users" },
  modification_profil: { label: "Profil", color: "text-[var(--text-muted)]", iconName: "Edit" },
  soutien_doleance: { label: "Soutien", color: "text-pink-500", iconName: "Heart" },
  revision: { label: "Révision", color: "text-pink-500", iconName: "GitCommit" },
  demande_integration: { label: "Demande d'intégration", color: "text-violet-500", iconName: "GitPullRequest" },
  relecture: { label: "Relecture", color: "text-green-500", iconName: "CheckCircle" },
};

export const MOCK_ACTIVITIES: UserActivity[] = [
  // Aujourd'hui
  {
    id: "act-01",
    type: "vote",
    titre: "A voté Pour sur « Réforme du système de délégation »",
    date: "il y a 1h",
    dateIso: "2025-01-15T13:00:00Z",
    lien: "/agora/prop-3",
  },
  {
    id: "act-02",
    type: "emission",
    titre: "A reçu 1 Ѵ — Émission quotidienne",
    date: "il y a 6h",
    dateIso: "2025-01-15T08:00:00Z",
  },
  {
    id: "act-03",
    type: "commentaire",
    titre: "A commenté sur « Ajout du coefficient de rareté »",
    description: "Le coefficient proposé semble trop élevé pour les métiers de base...",
    date: "il y a 8h",
    dateIso: "2025-01-15T06:00:00Z",
    lien: "/agora/prop-5",
  },
  {
    id: "act-04",
    type: "revision",
    titre: "A créé une révision sur Constitution VITA v3",
    description: "Ajout article 47 : Éthique de l'IA et gouvernance",
    date: "il y a 10h",
    dateIso: "2025-01-15T04:00:00Z",
    lien: "/forge/project/constitution-v3",
  },
  // Hier
  {
    id: "act-05",
    type: "transaction_envoi",
    titre: "A envoyé 3.5 Ѵ à @carlos_silva",
    description: "Cours de guitare",
    date: "il y a 1j",
    dateIso: "2025-01-14T18:00:00Z",
    lien: "/bourse/historique",
  },
  {
    id: "act-06",
    type: "vote",
    titre: "A voté Contre sur « Augmentation du pot commun à 15% »",
    date: "il y a 1j",
    dateIso: "2025-01-14T14:00:00Z",
    lien: "/agora/prop-7",
  },
  {
    id: "act-07",
    type: "emission",
    titre: "A reçu 1 Ѵ — Émission quotidienne",
    date: "il y a 1j",
    dateIso: "2025-01-14T08:00:00Z",
  },
  {
    id: "act-08",
    type: "relecture",
    titre: "A approuvé la DI « Article 12 — Portabilité des données »",
    date: "il y a 1j",
    dateIso: "2025-01-14T10:00:00Z",
    lien: "/forge/project/constitution-v3/mr/mr-2",
  },
  {
    id: "act-09",
    type: "soutien_doleance",
    titre: "A soutenu la doléance « Médiation des conflits de voisinage »",
    date: "il y a 1j",
    dateIso: "2025-01-14T09:00:00Z",
    lien: "/agora/grievances",
  },
  // Il y a 2 jours
  {
    id: "act-10",
    type: "proposition",
    titre: "A créé la proposition « Fonds de solidarité communautaire »",
    description: "Création d'un fonds alimenté par 2% des transactions pour soutenir les projets locaux.",
    date: "il y a 2j",
    dateIso: "2025-01-13T16:00:00Z",
    lien: "/agora/prop-12",
  },
  {
    id: "act-11",
    type: "emission",
    titre: "A reçu 1 Ѵ — Émission quotidienne",
    date: "il y a 2j",
    dateIso: "2025-01-13T08:00:00Z",
  },
  {
    id: "act-12",
    type: "transaction_reception",
    titre: "A reçu 2 Ѵ de @amina.b",
    description: "Remboursement repas partagé",
    date: "il y a 2j",
    dateIso: "2025-01-13T12:00:00Z",
    lien: "/bourse/historique",
  },
  {
    id: "act-13",
    type: "commentaire",
    titre: "A commenté sur « Droit à l'oubli numérique »",
    date: "il y a 2j",
    dateIso: "2025-01-13T11:00:00Z",
    lien: "/agora/prop-8",
  },
  // Il y a 3 jours
  {
    id: "act-14",
    type: "vote",
    titre: "A voté Pour sur « Réduction des frais de transaction »",
    date: "il y a 3j",
    dateIso: "2025-01-12T15:00:00Z",
    lien: "/agora/prop-2",
  },
  {
    id: "act-15",
    type: "demande_integration",
    titre: "A créé la DI « Ajout article 47 — IA éthique »",
    date: "il y a 3j",
    dateIso: "2025-01-12T14:00:00Z",
    lien: "/forge/project/constitution-v3/mr/mr-1",
  },
  {
    id: "act-16",
    type: "emission",
    titre: "A reçu 1 Ѵ — Émission quotidienne",
    date: "il y a 3j",
    dateIso: "2025-01-12T08:00:00Z",
  },
  {
    id: "act-17",
    type: "transaction_envoi",
    titre: "A envoyé 1.5 Ѵ à @lucas.d",
    description: "Café et croissant",
    date: "il y a 3j",
    dateIso: "2025-01-12T10:00:00Z",
    lien: "/bourse/historique",
  },
  // Il y a 4-5 jours
  {
    id: "act-18",
    type: "delegation",
    titre: "A délégué son vote à @amina.b pour le domaine Éducation",
    date: "il y a 4j",
    dateIso: "2025-01-11T16:00:00Z",
  },
  {
    id: "act-19",
    type: "vote",
    titre: "A voté Abstention sur « Modification du quorum dynamique »",
    date: "il y a 4j",
    dateIso: "2025-01-11T14:00:00Z",
    lien: "/agora/prop-9",
  },
  {
    id: "act-20",
    type: "emission",
    titre: "A reçu 1 Ѵ — Émission quotidienne",
    date: "il y a 4j",
    dateIso: "2025-01-11T08:00:00Z",
  },
  {
    id: "act-21",
    type: "revision",
    titre: "A créé une révision sur Système de Vote v2",
    description: "Tests unitaires pour le module de délégation",
    date: "il y a 5j",
    dateIso: "2025-01-10T15:00:00Z",
    lien: "/forge/project/voting-system",
  },
  {
    id: "act-22",
    type: "transaction_reception",
    titre: "A reçu 5 Ѵ de @jp.moreau",
    description: "Consultation audit indépendant",
    date: "il y a 5j",
    dateIso: "2025-01-10T12:00:00Z",
    lien: "/bourse/historique",
  },
  {
    id: "act-23",
    type: "emission",
    titre: "A reçu 1 Ѵ — Émission quotidienne",
    date: "il y a 5j",
    dateIso: "2025-01-10T08:00:00Z",
  },
  // Il y a 6-10 jours
  {
    id: "act-24",
    type: "commentaire",
    titre: "A commenté sur « Système de tags pour les propositions »",
    date: "il y a 6j",
    dateIso: "2025-01-09T14:00:00Z",
    lien: "/agora/prop-6",
  },
  {
    id: "act-25",
    type: "vote",
    titre: "A voté Pour sur « Protection environnementale numérique »",
    date: "il y a 7j",
    dateIso: "2025-01-08T16:00:00Z",
    lien: "/agora/prop-10",
  },
  {
    id: "act-26",
    type: "modification_profil",
    titre: "A mis à jour sa biographie",
    date: "il y a 7j",
    dateIso: "2025-01-08T10:00:00Z",
    lien: "/civis",
  },
  {
    id: "act-27",
    type: "soutien_doleance",
    titre: "A soutenu la doléance « Accès aux soins de santé mentale »",
    date: "il y a 8j",
    dateIso: "2025-01-07T14:00:00Z",
    lien: "/agora/grievances",
  },
  {
    id: "act-28",
    type: "transaction_envoi",
    titre: "A envoyé 8 Ѵ à @sakura.t",
    description: "Cours de japonais (2h)",
    date: "il y a 9j",
    dateIso: "2025-01-06T11:00:00Z",
    lien: "/bourse/historique",
  },
  {
    id: "act-29",
    type: "relecture",
    titre: "A rejeté la DI « Refactor redistribution »",
    description: "Demande de clarification sur le module de validation.",
    date: "il y a 10j",
    dateIso: "2025-01-05T16:00:00Z",
    lien: "/forge/project/voting-system/mr/mr-6",
  },
  {
    id: "act-30",
    type: "vote",
    titre: "A voté Pour sur « Simplification du module de redistribution »",
    date: "il y a 10j",
    dateIso: "2025-01-05T14:00:00Z",
    lien: "/agora/prop-4",
  },
  // Il y a 11-20 jours
  {
    id: "act-31",
    type: "proposition",
    titre: "A créé la proposition « Transparence algorithmique »",
    description: "Obligation de rendre publics tous les algorithmes ayant un impact sur les citoyens.",
    date: "il y a 12j",
    dateIso: "2025-01-03T15:00:00Z",
    lien: "/agora/prop-11",
  },
  {
    id: "act-32",
    type: "revision",
    titre: "A créé une révision sur Constitution VITA v3",
    description: "Création de la version de travail feature/ai-ethics",
    date: "il y a 14j",
    dateIso: "2025-01-01T10:00:00Z",
    lien: "/forge/project/constitution-v3",
  },
  {
    id: "act-33",
    type: "vote",
    titre: "A voté Pour sur « Guide du contributeur »",
    date: "il y a 15j",
    dateIso: "2024-12-31T14:00:00Z",
    lien: "/agora/prop-1",
  },
  {
    id: "act-34",
    type: "transaction_envoi",
    titre: "A envoyé 5 Ѵ à @fondation_vita",
    description: "Don au fonds d'aide",
    date: "il y a 18j",
    dateIso: "2024-12-28T10:00:00Z",
    lien: "/bourse/historique",
  },
  {
    id: "act-35",
    type: "commentaire",
    titre: "A commenté sur « Calcul du coefficient de service »",
    date: "il y a 20j",
    dateIso: "2024-12-26T14:00:00Z",
    lien: "/agora/prop-3",
  },
];

// Activity heatmap — 16 weeks × 7 days
export const CIVIS_ACTIVITY_HEATMAP: number[][] = [
  [0, 1, 0, 2, 1, 0, 0],
  [1, 0, 3, 1, 0, 0, 0],
  [0, 2, 1, 0, 1, 0, 0],
  [1, 0, 0, 2, 3, 0, 0],
  [2, 1, 0, 1, 0, 0, 0],
  [0, 0, 2, 1, 1, 0, 0],
  [1, 3, 0, 0, 2, 0, 0],
  [0, 1, 2, 1, 0, 0, 0],
  [2, 0, 1, 3, 1, 1, 0],
  [1, 2, 0, 0, 2, 0, 0],
  [0, 1, 3, 2, 0, 0, 0],
  [3, 0, 1, 0, 2, 0, 0],
  [1, 2, 0, 3, 1, 0, 0],
  [0, 1, 2, 1, 3, 0, 0],
  [2, 3, 1, 0, 1, 0, 0],
  [3, 2, 1, 4, 0, 0, 0], // current week
];

// ============================================================
// REWARDS / ACHIEVEMENTS
// ============================================================

export type RecompenseCategorie =
  | "participation"
  | "gouvernance"
  | "communaute"
  | "economie"
  | "forge"
  | "special";

export interface Recompense {
  id: string;
  nom: string;
  description: string;
  icone: string; // emoji
  dateObtention: string | null;
  categorie: RecompenseCategorie;
  niveau?: "bronze" | "argent" | "or";
  progression?: {
    actuel: number;
    objectif: number;
    unite: string;
  };
  rare: boolean;
}

export const CATEGORIE_RECOMPENSE_LABELS: Record<RecompenseCategorie, string> = {
  participation: "Participation",
  gouvernance: "Gouvernance",
  communaute: "Communauté",
  economie: "Économie",
  forge: "Forge",
  special: "Spécial",
};

export const CATEGORIE_RECOMPENSE_COLORS: Record<RecompenseCategorie, string> = {
  participation: "#8b5cf6",
  gouvernance: "#06b6d4",
  communaute: "#ec4899",
  economie: "#10b981",
  forge: "#f59e0b",
  special: "#f43f5e",
};

export const MOCK_RECOMPENSES: Recompense[] = [
  // --- Participation ---
  {
    id: "rw-01",
    nom: "Premier pas",
    description: "A voté pour la première fois",
    icone: "\u{1F5F3}\u{FE0F}",
    dateObtention: "2025-01-05",
    categorie: "participation",
    rare: false,
  },
  {
    id: "rw-02",
    nom: "Voix qui compte",
    description: "10 votes effectués",
    icone: "\u{1F4E3}",
    dateObtention: "2025-01-10",
    categorie: "participation",
    progression: { actuel: 10, objectif: 10, unite: "votes" },
    rare: false,
  },
  {
    id: "rw-03",
    nom: "Citoyen engagé",
    description: "50 votes effectués",
    icone: "\u{1F3C5}",
    dateObtention: null,
    categorie: "participation",
    niveau: "bronze",
    progression: { actuel: 34, objectif: 50, unite: "votes" },
    rare: false,
  },
  {
    id: "rw-04",
    nom: "Pilier démocratique",
    description: "200 votes effectués",
    icone: "\u{1F3DB}\u{FE0F}",
    dateObtention: null,
    categorie: "participation",
    niveau: "or",
    progression: { actuel: 34, objectif: 200, unite: "votes" },
    rare: false,
  },
  {
    id: "rw-05",
    nom: "Assidu",
    description: "Connecté 30 jours consécutifs",
    icone: "\u{1F525}",
    dateObtention: "2025-01-12",
    categorie: "participation",
    progression: { actuel: 30, objectif: 30, unite: "jours" },
    rare: false,
  },
  {
    id: "rw-06",
    nom: "Marathonien",
    description: "Connecté 100 jours consécutifs",
    icone: "\u{1F3C3}",
    dateObtention: null,
    categorie: "participation",
    progression: { actuel: 42, objectif: 100, unite: "jours" },
    rare: false,
  },
  // --- Gouvernance ---
  {
    id: "rw-07",
    nom: "La parole est à vous",
    description: "Première proposition créée",
    icone: "\u{1F4DD}",
    dateObtention: "2025-01-08",
    categorie: "gouvernance",
    rare: false,
  },
  {
    id: "rw-08",
    nom: "Force de proposition",
    description: "5 propositions créées",
    icone: "\u{1F4DA}",
    dateObtention: null,
    categorie: "gouvernance",
    progression: { actuel: 3, objectif: 5, unite: "propositions" },
    rare: false,
  },
  {
    id: "rw-09",
    nom: "Visionnaire",
    description: "Une proposition adoptée avec plus de 80% de pour",
    icone: "\u{1F52E}",
    dateObtention: "2025-01-14",
    categorie: "gouvernance",
    rare: false,
  },
  {
    id: "rw-10",
    nom: "Délégué du peuple",
    description: "Recevoir 10 délégations de vote",
    icone: "\u{1F91D}",
    dateObtention: null,
    categorie: "gouvernance",
    progression: { actuel: 4, objectif: 10, unite: "délégations" },
    rare: false,
  },
  // --- Communauté ---
  {
    id: "rw-11",
    nom: "Bienvenue !",
    description: "A complété son profil à 100%",
    icone: "\u{1F44B}",
    dateObtention: "2025-01-02",
    categorie: "communaute",
    rare: false,
  },
  {
    id: "rw-12",
    nom: "Ambassadeur",
    description: "A parrainé 3 nouveaux citoyens",
    icone: "\u{1F310}",
    dateObtention: null,
    categorie: "communaute",
    progression: { actuel: 1, objectif: 3, unite: "parrainages" },
    rare: false,
  },
  {
    id: "rw-13",
    nom: "Porte-voix",
    description: "20 commentaires constructifs",
    icone: "\u{1F4AC}",
    dateObtention: "2025-01-11",
    categorie: "communaute",
    progression: { actuel: 20, objectif: 20, unite: "commentaires" },
    rare: false,
  },
  {
    id: "rw-14",
    nom: "Mentor",
    description: "A répondu à 10 questions de nouveaux membres",
    icone: "\u{1F393}",
    dateObtention: null,
    categorie: "communaute",
    progression: { actuel: 6, objectif: 10, unite: "réponses" },
    rare: false,
  },
  // --- Économie ---
  {
    id: "rw-15",
    nom: "Première transaction",
    description: "A envoyé ses premiers Ѵ",
    icone: "\u{1F4B8}",
    dateObtention: "2025-01-04",
    categorie: "economie",
    rare: false,
  },
  {
    id: "rw-16",
    nom: "Échangeur actif",
    description: "50 transactions effectuées",
    icone: "\u{1F4B1}",
    dateObtention: "2025-01-13",
    categorie: "economie",
    progression: { actuel: 50, objectif: 50, unite: "transactions" },
    rare: false,
  },
  {
    id: "rw-17",
    nom: "Économiste",
    description: "A utilisé le calculateur de valorisation 10 fois",
    icone: "\u{1F4CA}",
    dateObtention: null,
    categorie: "economie",
    progression: { actuel: 3, objectif: 10, unite: "utilisations" },
    rare: false,
  },
  {
    id: "rw-18",
    nom: "Généreux",
    description: "A fait un don de plus de 5 Ѵ",
    icone: "\u{2764}\u{FE0F}",
    dateObtention: "2025-01-09",
    categorie: "economie",
    rare: false,
  },
  // --- Forge ---
  {
    id: "rw-19",
    nom: "Architecte",
    description: "Première révision dans la Forge",
    icone: "\u{1F3D7}\u{FE0F}",
    dateObtention: "2025-01-06",
    categorie: "forge",
    rare: false,
  },
  {
    id: "rw-20",
    nom: "Bâtisseur",
    description: "10 révisions dans la Forge",
    icone: "\u{1F9F1}",
    dateObtention: null,
    categorie: "forge",
    progression: { actuel: 7, objectif: 10, unite: "révisions" },
    rare: false,
  },
  {
    id: "rw-21",
    nom: "Gardien du code",
    description: "5 relectures de demandes d'intégration",
    icone: "\u{1F6E1}\u{FE0F}",
    dateObtention: null,
    categorie: "forge",
    progression: { actuel: 2, objectif: 5, unite: "relectures" },
    rare: false,
  },
  // --- Spécial ---
  {
    id: "rw-22",
    nom: "Pionnier",
    description: "Parmi les 10 000 premiers inscrits",
    icone: "\u{1F680}",
    dateObtention: "2025-01-01",
    categorie: "special",
    rare: true,
  },
  {
    id: "rw-23",
    nom: "Fondateur",
    description: "Parmi les 100 premiers inscrits",
    icone: "\u{2B50}",
    dateObtention: null,
    categorie: "special",
    progression: { actuel: 0, objectif: 1, unite: "rang" },
    rare: true,
  },
  {
    id: "rw-24",
    nom: "Étoile montante",
    description: "Top 10 contributeurs du mois",
    icone: "\u{1F31F}",
    dateObtention: "2025-01-15",
    categorie: "special",
    rare: true,
  },
];

// ============================================================
// HELPERS
// ============================================================

export function getActivities(): UserActivity[] {
  return MOCK_ACTIVITIES;
}

export function getRecompenses(): Recompense[] {
  return MOCK_RECOMPENSES;
}

export function groupActivitiesByDay(
  activities: UserActivity[]
): { day: string; dateIso: string; activities: UserActivity[] }[] {
  const groups: Record<
    string,
    { day: string; dateIso: string; activities: UserActivity[] }
  > = {};

  for (const a of activities) {
    const d = new Date(a.dateIso);
    const key = d.toISOString().slice(0, 10);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );

    let day: string;
    if (diffDays === 0) day = "Aujourd'hui";
    else if (diffDays === 1) day = "Hier";
    else day = `Il y a ${diffDays} jours`;

    if (!groups[key]) {
      groups[key] = { day, dateIso: key, activities: [] };
    }
    groups[key].activities.push(a);
  }

  return Object.values(groups).sort((a, b) =>
    b.dateIso.localeCompare(a.dateIso)
  );
}
