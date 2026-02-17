// Mock data for the Panorama (global dashboard)

export interface ActivityItem {
  id: string;
  type: "inscription" | "transaction" | "vote" | "proposition" | "parametre";
  titre: string;
  date: string;
  details?: string;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface TransactionSeriesPoint {
  date: string;
  count: number;
  volume: number;
}

export interface PanoramaData {
  // Population
  populationMondiale: number;
  utilisateursVerifies: number;
  utilisateursEnAttente: number;
  tauxAdoption: number;

  // Monétaire
  masseMonetaireTotal: number;
  emissionsAujourdHui: number;
  transactionsAujourdHui: number;
  volumeTransactions: number;
  moyenneTransactions: number;

  // Gouvernance
  propositionsActives: number;
  tauxParticipation: number;
  propositionsAdoptees30j: number;
  deleguesActifs: number;

  // Égalité
  indiceGini: number;
  ratioMaxMin: number;
  medianePatrimoine: number;

  // Historiques (30 jours)
  historiqueUtilisateurs: TimeSeriesPoint[];
  historiqueMasseMonetaire: TimeSeriesPoint[];
  historiqueTransactions: TransactionSeriesPoint[];
  historiqueParticipation: TimeSeriesPoint[];

  // Activité récente
  activiteRecente: ActivityItem[];

  // Top pays
  topPays: { pays: string; drapeau: string; utilisateurs: number }[];
}

// ============================================================
// HELPERS POUR GÉNÉRER DES DONNÉES
// ============================================================

function generateDates(days: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(
      d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
    );
  }
  return dates;
}

function generateGrowingSeries(
  base: number,
  dailyGrowth: number,
  noise: number,
  days: number
): number[] {
  const values: number[] = [];
  let current = base;
  for (let i = 0; i < days; i++) {
    const jitter = 1 + (Math.random() - 0.5) * noise;
    current += dailyGrowth * jitter;
    values.push(Math.round(current));
  }
  return values;
}

// ============================================================
// CONSTANTES
// ============================================================

const DAYS = 30;
const dates = generateDates(DAYS);

// Utilisateurs : croissance ~3000/jour depuis une base ~1,160,000
const userSeries = generateGrowingSeries(1_160_000, 2_930, 0.3, DAYS);

// Masse monétaire : croissance = utilisateurs vérifiés par jour
const masseSeries = generateGrowingSeries(48_500_000, 1_247_893 * 0.0008 + 1_200_000 * 0.001, 0.15, DAYS);

// Transactions : ~800K-900K/jour avec du bruit
const txCountSeries = generateGrowingSeries(780_000, 2_200, 0.4, DAYS);
const txVolumeSeries = txCountSeries.map(
  (count) => Math.round(count * 2.76 * (1 + (Math.random() - 0.5) * 0.1))
);

// Participation aux votes : oscillant autour de 62-68%
const participationSeries: number[] = [];
let partBase = 62;
for (let i = 0; i < DAYS; i++) {
  partBase += (Math.random() - 0.45) * 1.5;
  partBase = Math.max(55, Math.min(72, partBase));
  participationSeries.push(parseFloat(partBase.toFixed(1)));
}

// ============================================================
// ACTIVITÉ RÉCENTE
// ============================================================

const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: "a1",
    type: "inscription",
    titre: "1 247 nouvelles vérifications",
    date: "il y a 2 min",
    details: "Pic d'inscriptions depuis le Brésil",
  },
  {
    id: "a2",
    type: "transaction",
    titre: "Volume record : 2.34M Ѵ",
    date: "il y a 8 min",
    details: "Dépassement du record journalier",
  },
  {
    id: "a3",
    type: "vote",
    titre: "Vote en cours : Révision PPA",
    date: "il y a 15 min",
    details: "67% pour, 2 jours restants",
  },
  {
    id: "a4",
    type: "proposition",
    titre: "Nouvelle proposition soumise",
    date: "il y a 23 min",
    details: "Fonds d'urgence climatique — 856 soutiens",
  },
  {
    id: "a5",
    type: "inscription",
    titre: "Cap franchi : 1.24M utilisateurs",
    date: "il y a 45 min",
  },
  {
    id: "a6",
    type: "transaction",
    titre: "847 293 transactions aujourd'hui",
    date: "il y a 1h",
  },
  {
    id: "a7",
    type: "parametre",
    titre: "Mise à jour seuil de quorum",
    date: "il y a 2h",
    details: "Passage de 25% à 20% après vote",
  },
  {
    id: "a8",
    type: "vote",
    titre: "Proposition adoptée : Art. 47 IA",
    date: "il y a 3h",
    details: "82% pour, quorum atteint",
  },
  {
    id: "a9",
    type: "inscription",
    titre: "432 vérifications (Sénégal)",
    date: "il y a 4h",
  },
  {
    id: "a10",
    type: "transaction",
    titre: "Émission quotidienne terminée",
    date: "il y a 6h",
    details: "1 247 893 Ѵ distribués à 00:00 UTC",
  },
];

// ============================================================
// RANDOM ACTIVITY GENERATOR (pour le live feed)
// ============================================================

const RANDOM_ACTIVITIES: Omit<ActivityItem, "id" | "date">[] = [
  { type: "inscription", titre: "23 nouvelles vérifications" },
  { type: "transaction", titre: "Volume en hausse de 2.1%" },
  { type: "vote", titre: "Nouveau vote enregistré" },
  { type: "inscription", titre: "Vérification ZK-proof réussie" },
  { type: "transaction", titre: "Transaction de 12.5 Ѵ confirmée" },
  { type: "vote", titre: "Quorum atteint pour proposition #42" },
  { type: "proposition", titre: "Nouvelle proposition en cosignature" },
  { type: "inscription", titre: "8 inscriptions (Inde)" },
  { type: "transaction", titre: "Émission de 1 Ѵ traitée" },
  { type: "parametre", titre: "Vérification santé système" },
];

export function generateRandomActivity(): ActivityItem {
  const template =
    RANDOM_ACTIVITIES[Math.floor(Math.random() * RANDOM_ACTIVITIES.length)];
  return {
    ...template,
    id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: "à l'instant",
  };
}

// ============================================================
// DONNÉES PANORAMA
// ============================================================

export const PANORAMA_DATA: PanoramaData = {
  // Population
  populationMondiale: 8_100_000_000,
  utilisateursVerifies: 1_247_893,
  utilisateursEnAttente: 38_472,
  tauxAdoption: 0.0154,

  // Monétaire
  masseMonetaireTotal: 52_341_207,
  emissionsAujourdHui: 1_247_893,
  transactionsAujourdHui: 847_293,
  volumeTransactions: 2_341_207,
  moyenneTransactions: 2.76,

  // Gouvernance
  propositionsActives: 7,
  tauxParticipation: 64.7,
  propositionsAdoptees30j: 12,
  deleguesActifs: 1_423,

  // Égalité
  indiceGini: 0.12,
  ratioMaxMin: 3.2,
  medianePatrimoine: 42.0,

  // Historiques
  historiqueUtilisateurs: dates.map((date, i) => ({
    date,
    value: userSeries[i],
  })),
  historiqueMasseMonetaire: dates.map((date, i) => ({
    date,
    value: masseSeries[i],
  })),
  historiqueTransactions: dates.map((date, i) => ({
    date,
    count: txCountSeries[i],
    volume: txVolumeSeries[i],
  })),
  historiqueParticipation: dates.map((date, i) => ({
    date,
    value: participationSeries[i],
  })),

  // Activité récente
  activiteRecente: ACTIVITY_ITEMS,

  // Top pays
  topPays: [
    { pays: "France", drapeau: "🇫🇷", utilisateurs: 187_432 },
    { pays: "Brésil", drapeau: "🇧🇷", utilisateurs: 156_891 },
    { pays: "Inde", drapeau: "🇮🇳", utilisateurs: 142_307 },
    { pays: "Allemagne", drapeau: "🇩🇪", utilisateurs: 98_456 },
    { pays: "Japon", drapeau: "🇯🇵", utilisateurs: 87_234 },
    { pays: "Nigéria", drapeau: "🇳🇬", utilisateurs: 76_543 },
    { pays: "États-Unis", drapeau: "🇺🇸", utilisateurs: 72_189 },
    { pays: "Indonésie", drapeau: "🇮🇩", utilisateurs: 65_432 },
    { pays: "Mexique", drapeau: "🇲🇽", utilisateurs: 54_321 },
    { pays: "Sénégal", drapeau: "🇸🇳", utilisateurs: 48_765 },
  ],
};

// ============================================================
// VOTES EN COURS (pour la section gouvernance)
// ============================================================

export interface ActiveVote {
  id: string;
  titre: string;
  domaine: string;
  domaineBadge: "orange" | "green" | "cyan" | "violet" | "pink";
  votePour: number;
  voteContre: number;
  totalVotes: number;
  quorum: number;
  tempsRestant: string;
}

export const ACTIVE_VOTES: ActiveVote[] = [
  {
    id: "v1",
    titre: "Révision du coefficient PPA",
    domaine: "Économie",
    domaineBadge: "orange",
    votePour: 3247,
    voteContre: 1523,
    totalVotes: 5004,
    quorum: 8000,
    tempsRestant: "2j 14h",
  },
  {
    id: "v2",
    titre: "Fonds d'urgence climatique",
    domaine: "Environnement",
    domaineBadge: "green",
    votePour: 2891,
    voteContre: 1102,
    totalVotes: 4234,
    quorum: 8000,
    tempsRestant: "5j 8h",
  },
  {
    id: "v3",
    titre: "Article 47 : Éthique de l'IA",
    domaine: "Gouvernance",
    domaineBadge: "violet",
    votePour: 4521,
    voteContre: 987,
    totalVotes: 5892,
    quorum: 6000,
    tempsRestant: "1j 2h",
  },
  {
    id: "v4",
    titre: "Plafond transactions offline",
    domaine: "Technique",
    domaineBadge: "cyan",
    votePour: 1876,
    voteContre: 2134,
    totalVotes: 4312,
    quorum: 8000,
    tempsRestant: "4j 19h",
  },
  {
    id: "v5",
    titre: "Programme éducation numérique",
    domaine: "Éducation",
    domaineBadge: "pink",
    votePour: 3654,
    voteContre: 456,
    totalVotes: 4389,
    quorum: 6000,
    tempsRestant: "6j 11h",
  },
];

// ============================================================
// MÉTRIQUES SYSTÈME (admin)
// ============================================================

export interface SystemHealth {
  apiResponseMs: number;
  dbStatus: "ok" | "degraded" | "down";
  emissionQueue: { processed: number; total: number };
  lastBackup: string;
  uptime30j: number;
}

export const SYSTEM_HEALTH: SystemHealth = {
  apiResponseMs: 42,
  dbStatus: "ok",
  emissionQueue: { processed: 1_247_893, total: 1_247_893 },
  lastBackup: "il y a 2h",
  uptime30j: 99.97,
};
