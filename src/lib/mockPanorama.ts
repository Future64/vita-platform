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
// DONNÉES ÉCONOMIE (page /panorama/economy)
// ============================================================

export interface ServiceEchange {
  nom: string;
  volume: number;
  transactions: number;
  tendance: number; // % variation
}

export interface GiniComparison {
  pays: string;
  gini: number;
  drapeau: string;
}

export interface WealthDistribution {
  tranche: string;
  pourcentage: number;
}

export interface EconomyData {
  masseMonetaire: {
    total: number;
    variation30j: number; // %
    historique: TimeSeriesPoint[];
    emissionQuotidienne: number;
    vitesseCirculation: number;
    volumeMoyen24h: number;
  };
  transactions: {
    total24h: number;
    volume24h: number;
    moyenneMontant: number;
    tempsMedian: string;
    parType: { type: string; pourcentage: number; color: string }[];
    historique: TransactionSeriesPoint[];
  };
  services: ServiceEchange[];
  egalite: {
    gini: number;
    ratioMaxMin: number;
    medianePatrimoine: number;
    comparaisonPays: GiniComparison[];
    distributionRichesse: WealthDistribution[];
  };
}

// Historique masse monétaire 30j
const masseHistorique = dates.map((date, i) => ({
  date,
  value: masseSeries[i],
}));

// Répartition par type de transaction
const TX_PAR_TYPE = [
  { type: "Services", pourcentage: 62, color: "#8b5cf6" },
  { type: "Biens", pourcentage: 23, color: "#ec4899" },
  { type: "Dons", pourcentage: 8, color: "#06b6d4" },
  { type: "Autres", pourcentage: 7, color: "#64748b" },
];

// Services les plus échangés
const SERVICES_ECHANGES: ServiceEchange[] = [
  { nom: "Éducation & formation", volume: 342_100, transactions: 87_200, tendance: 12.3 },
  { nom: "Santé & bien-être", volume: 287_400, transactions: 72_100, tendance: 8.7 },
  { nom: "Alimentation", volume: 245_800, transactions: 156_300, tendance: 3.2 },
  { nom: "Transport", volume: 198_300, transactions: 94_500, tendance: -1.4 },
  { nom: "Logement", volume: 176_200, transactions: 23_400, tendance: 5.6 },
  { nom: "Technologie", volume: 143_700, transactions: 48_900, tendance: 18.9 },
  { nom: "Culture & loisirs", volume: 98_400, transactions: 67_200, tendance: 7.1 },
  { nom: "Artisanat", volume: 72_100, transactions: 34_600, tendance: 14.2 },
];

// Comparaison Gini
const GINI_COMPARAISON: GiniComparison[] = [
  { pays: "VITA", gini: 0.12, drapeau: "Ѵ" },
  { pays: "Danemark", gini: 0.28, drapeau: "🇩🇰" },
  { pays: "France", gini: 0.32, drapeau: "🇫🇷" },
  { pays: "États-Unis", gini: 0.41, drapeau: "🇺🇸" },
  { pays: "Brésil", gini: 0.53, drapeau: "🇧🇷" },
  { pays: "Afrique du Sud", gini: 0.63, drapeau: "🇿🇦" },
];

// Distribution de la richesse
const WEALTH_DISTRIBUTION: WealthDistribution[] = [
  { tranche: "0-10 Ѵ", pourcentage: 8 },
  { tranche: "10-30 Ѵ", pourcentage: 22 },
  { tranche: "30-50 Ѵ", pourcentage: 35 },
  { tranche: "50-80 Ѵ", pourcentage: 24 },
  { tranche: "80-120 Ѵ", pourcentage: 9 },
  { tranche: "120+ Ѵ", pourcentage: 2 },
];

export const ECONOMY_DATA: EconomyData = {
  masseMonetaire: {
    total: 52_341_207,
    variation30j: 7.2,
    historique: masseHistorique,
    emissionQuotidienne: 1_247_893,
    vitesseCirculation: 2.4,
    volumeMoyen24h: 2_341_207,
  },
  transactions: {
    total24h: 847_293,
    volume24h: 2_341_207,
    moyenneMontant: 2.76,
    tempsMedian: "1.2s",
    parType: TX_PAR_TYPE,
    historique: dates.map((date, i) => ({
      date,
      count: txCountSeries[i],
      volume: txVolumeSeries[i],
    })),
  },
  services: SERVICES_ECHANGES,
  egalite: {
    gini: 0.12,
    ratioMaxMin: 3.2,
    medianePatrimoine: 42.0,
    comparaisonPays: GINI_COMPARAISON,
    distributionRichesse: WEALTH_DISTRIBUTION,
  },
};

// ============================================================
// DONNÉES CITOYENS (page /panorama/citizens)
// ============================================================

export interface DemographicAge {
  tranche: string;
  pourcentage: number;
  count: number;
}

export interface ContinentDistribution {
  continent: string;
  pourcentage: number;
  color: string;
}

export interface LangueDistribution {
  langue: string;
  pourcentage: number;
}

export interface TopContributeur {
  rang: number;
  pseudo: string;
  initiales: string;
  propositions: number;
  votes: number;
  reputation: number;
  couleur: string;
}

export interface NouveauCitoyen {
  pseudo: string;
  date: string;
  pays: string;
  drapeau: string;
}

export interface ContributionDay {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface CitizensData {
  overview: {
    totalVerifies: number;
    enAttente: number;
    actifs7j: number;
    actifs30j: number;
    croissance30j: number; // %
    historiqueTotal: TimeSeriesPoint[];
    historiqueNouveaux: TimeSeriesPoint[];
  };
  demographics: {
    parAge: DemographicAge[];
    parContinent: ContinentDistribution[];
    parLangue: LangueDistribution[];
  };
  topContributeurs: TopContributeur[];
  nouveaux: NouveauCitoyen[];
  activite: {
    inscriptions24h: number;
    verificationsEnCours: number;
    txParUtilisateur: number;
    contributionMap: ContributionDay[];
  };
}

// Nouveaux utilisateurs par jour (30j)
const nouveauxSeries = generateGrowingSeries(2_800, 45, 0.5, DAYS);

// Démographie par âge
const DEMO_AGE: DemographicAge[] = [
  { tranche: "18-24", pourcentage: 28, count: 349_410 },
  { tranche: "25-34", pourcentage: 34, count: 424_284 },
  { tranche: "35-44", pourcentage: 19, count: 237_100 },
  { tranche: "45-54", pourcentage: 11, count: 137_268 },
  { tranche: "55-64", pourcentage: 6, count: 74_874 },
  { tranche: "65+", pourcentage: 2, count: 24_957 },
];

// Distribution par continent
const DEMO_CONTINENT: ContinentDistribution[] = [
  { continent: "Europe", pourcentage: 38, color: "#8b5cf6" },
  { continent: "Amérique du Sud", pourcentage: 19, color: "#ec4899" },
  { continent: "Asie", pourcentage: 24, color: "#06b6d4" },
  { continent: "Afrique", pourcentage: 14, color: "#f59e0b" },
  { continent: "Amérique du Nord", pourcentage: 4, color: "#10b981" },
  { continent: "Océanie", pourcentage: 1, color: "#64748b" },
];

// Langues
const DEMO_LANGUES: LangueDistribution[] = [
  { langue: "Français", pourcentage: 24 },
  { langue: "Portugais", pourcentage: 18 },
  { langue: "Hindi", pourcentage: 14 },
  { langue: "Anglais", pourcentage: 12 },
  { langue: "Espagnol", pourcentage: 10 },
  { langue: "Allemand", pourcentage: 8 },
  { langue: "Japonais", pourcentage: 7 },
  { langue: "Autres", pourcentage: 7 },
];

// Top contributeurs
const TOP_CONTRIBUTEURS: TopContributeur[] = [
  { rang: 1, pseudo: "SophieDAO", initiales: "SD", propositions: 23, votes: 847, reputation: 98.2, couleur: "#8b5cf6" },
  { rang: 2, pseudo: "MarcusGov", initiales: "MG", propositions: 19, votes: 812, reputation: 96.7, couleur: "#ec4899" },
  { rang: 3, pseudo: "AishaVITA", initiales: "AV", propositions: 17, votes: 793, reputation: 95.1, couleur: "#06b6d4" },
  { rang: 4, pseudo: "TomBuilder", initiales: "TB", propositions: 15, votes: 756, reputation: 93.8, couleur: "#10b981" },
  { rang: 5, pseudo: "YukiNode", initiales: "YN", propositions: 14, votes: 701, reputation: 91.2, couleur: "#f59e0b" },
  { rang: 6, pseudo: "LenaZK", initiales: "LZ", propositions: 12, votes: 689, reputation: 89.4, couleur: "#f97316" },
  { rang: 7, pseudo: "CarlosETH", initiales: "CE", propositions: 11, votes: 654, reputation: 87.9, couleur: "#a855f7" },
  { rang: 8, pseudo: "FatouSN", initiales: "FS", propositions: 10, votes: 621, reputation: 86.3, couleur: "#14b8a6" },
];

// Nouveaux arrivants
const NOUVEAUX_CITOYENS: NouveauCitoyen[] = [
  { pseudo: "@juliette_42", date: "il y a 3 min", pays: "France", drapeau: "🇫🇷" },
  { pseudo: "@carlos.sp", date: "il y a 7 min", pays: "Brésil", drapeau: "🇧🇷" },
  { pseudo: "@priya_dev", date: "il y a 12 min", pays: "Inde", drapeau: "🇮🇳" },
  { pseudo: "@moussa.dk", date: "il y a 18 min", pays: "Sénégal", drapeau: "🇸🇳" },
  { pseudo: "@hans.b", date: "il y a 24 min", pays: "Allemagne", drapeau: "🇩🇪" },
];

// Heatmap contributions (7 colonnes × 4 lignes = 28 cellules)
function generateContributionMap(): ContributionDay[] {
  const days: ContributionDay[] = [];
  const now = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    const rand = Math.random();
    let level: 0 | 1 | 2 | 3 | 4;
    if (rand < 0.1) level = 0;
    else if (rand < 0.3) level = 1;
    else if (rand < 0.6) level = 2;
    else if (rand < 0.85) level = 3;
    else level = 4;
    days.push({ date: dateStr, level });
  }
  return days;
}

export const CITIZENS_DATA: CitizensData = {
  overview: {
    totalVerifies: 1_247_893,
    enAttente: 38_472,
    actifs7j: 892_341,
    actifs30j: 1_087_234,
    croissance30j: 7.8,
    historiqueTotal: dates.map((date, i) => ({ date, value: userSeries[i] })),
    historiqueNouveaux: dates.map((date, i) => ({ date, value: nouveauxSeries[i] })),
  },
  demographics: {
    parAge: DEMO_AGE,
    parContinent: DEMO_CONTINENT,
    parLangue: DEMO_LANGUES,
  },
  topContributeurs: TOP_CONTRIBUTEURS,
  nouveaux: NOUVEAUX_CITOYENS,
  activite: {
    inscriptions24h: 3_247,
    verificationsEnCours: 1_892,
    txParUtilisateur: 4.7,
    contributionMap: generateContributionMap(),
  },
};

// ============================================================
// DONNÉES VOTES (page /panorama/votes)
// ============================================================

export interface VoteEnCours {
  id: string;
  titre: string;
  description: string;
  type: string;
  typeBadge: "orange" | "green" | "cyan" | "violet" | "pink" | "blue";
  pour: number;
  contre: number;
  abstention: number;
  totalVotants: number;
  quorum: number;
  tempsRestant: string;
  auteur: string;
}

export interface VoteResultat {
  id: string;
  titre: string;
  type: string;
  typeBadge: "orange" | "green" | "cyan" | "violet" | "pink" | "blue";
  resultat: "adopte" | "rejete";
  pour: number;
  contre: number;
  totalVotants: number;
  dateFin: string;
}

export interface VoteTypeDistribution {
  type: string;
  count: number;
  color: string;
}

export interface JourParticipation {
  jour: string;
  participation: number;
}

export interface VotesData {
  overview: {
    votesActifs: number;
    totalVotants: number;
    tauxParticipation: number;
    propositionsEnAttente: number;
    historiqueParticipation: TimeSeriesPoint[];
  };
  enCours: VoteEnCours[];
  resultats: VoteResultat[];
  statistiques: {
    parType: VoteTypeDistribution[];
    parJour: JourParticipation[];
  };
}

const VOTES_EN_COURS: VoteEnCours[] = [
  {
    id: "vc1",
    titre: "Révision du coefficient PPA",
    description: "Ajuster les parités de pouvoir d'achat pour mieux refléter les réalités locales",
    type: "Économie",
    typeBadge: "orange",
    pour: 3_247,
    contre: 1_523,
    abstention: 234,
    totalVotants: 5_004,
    quorum: 8_000,
    tempsRestant: "2j 14h",
    auteur: "SophieDAO",
  },
  {
    id: "vc2",
    titre: "Fonds d'urgence climatique",
    description: "Créer un fonds de 500 000 Ѵ pour les catastrophes environnementales",
    type: "Environnement",
    typeBadge: "green",
    pour: 2_891,
    contre: 1_102,
    abstention: 241,
    totalVotants: 4_234,
    quorum: 8_000,
    tempsRestant: "5j 8h",
    auteur: "MarcusGov",
  },
  {
    id: "vc3",
    titre: "Article 47 : Éthique de l'IA",
    description: "Encadrer l'utilisation de l'IA dans les processus de vérification",
    type: "Gouvernance",
    typeBadge: "violet",
    pour: 4_521,
    contre: 987,
    abstention: 384,
    totalVotants: 5_892,
    quorum: 6_000,
    tempsRestant: "1j 2h",
    auteur: "AishaVITA",
  },
  {
    id: "vc4",
    titre: "Plafond transactions offline",
    description: "Augmenter le plafond de 10 Ѵ à 15 Ѵ par transaction offline",
    type: "Technique",
    typeBadge: "cyan",
    pour: 1_876,
    contre: 2_134,
    abstention: 302,
    totalVotants: 4_312,
    quorum: 8_000,
    tempsRestant: "4j 19h",
    auteur: "TomBuilder",
  },
  {
    id: "vc5",
    titre: "Programme éducation numérique",
    description: "Financer des ateliers de formation au système VITA dans 20 pays",
    type: "Éducation",
    typeBadge: "pink",
    pour: 3_654,
    contre: 456,
    abstention: 279,
    totalVotants: 4_389,
    quorum: 6_000,
    tempsRestant: "6j 11h",
    auteur: "YukiNode",
  },
  {
    id: "vc6",
    titre: "Transparence des audits",
    description: "Publier les rapports d'audit mensuels en accès libre",
    type: "Gouvernance",
    typeBadge: "violet",
    pour: 5_102,
    contre: 312,
    abstention: 198,
    totalVotants: 5_612,
    quorum: 6_000,
    tempsRestant: "3j 7h",
    auteur: "LenaZK",
  },
  {
    id: "vc7",
    titre: "Coefficient travail pénible",
    description: "Revaloriser le coefficient multiplicateur pour les travaux dangereux de ×1.3 à ×1.5",
    type: "Économie",
    typeBadge: "orange",
    pour: 2_789,
    contre: 1_456,
    abstention: 567,
    totalVotants: 4_812,
    quorum: 8_000,
    tempsRestant: "7j 0h",
    auteur: "CarlosETH",
  },
];

const VOTES_RESULTATS: VoteResultat[] = [
  { id: "vr1", titre: "Mise à jour seuil de quorum", type: "Gouvernance", typeBadge: "violet", resultat: "adopte", pour: 6_234, contre: 1_876, totalVotants: 8_432, dateFin: "il y a 2j" },
  { id: "vr2", titre: "Subvention recherche ZK-proofs", type: "Technique", typeBadge: "cyan", resultat: "adopte", pour: 5_891, contre: 2_102, totalVotants: 8_214, dateFin: "il y a 4j" },
  { id: "vr3", titre: "Limite retrait quotidien", type: "Économie", typeBadge: "orange", resultat: "rejete", pour: 2_456, contre: 4_789, totalVotants: 7_654, dateFin: "il y a 5j" },
  { id: "vr4", titre: "Charte éthique des données", type: "Gouvernance", typeBadge: "violet", resultat: "adopte", pour: 7_123, contre: 892, totalVotants: 8_345, dateFin: "il y a 7j" },
  { id: "vr5", titre: "Extension durée offline", type: "Technique", typeBadge: "cyan", resultat: "rejete", pour: 3_102, contre: 4_567, totalVotants: 7_891, dateFin: "il y a 9j" },
  { id: "vr6", titre: "Fonds solidarité intercontinental", type: "Social", typeBadge: "pink", resultat: "adopte", pour: 6_789, contre: 1_234, totalVotants: 8_456, dateFin: "il y a 12j" },
  { id: "vr7", titre: "Réduction pénalités offline", type: "Économie", typeBadge: "orange", resultat: "rejete", pour: 2_890, contre: 5_123, totalVotants: 8_234, dateFin: "il y a 14j" },
];

const VOTE_TYPE_DISTRIBUTION: VoteTypeDistribution[] = [
  { type: "Économie", count: 24, color: "#f59e0b" },
  { type: "Gouvernance", count: 18, color: "#8b5cf6" },
  { type: "Technique", count: 14, color: "#06b6d4" },
  { type: "Social", count: 10, color: "#ec4899" },
  { type: "Environnement", count: 8, color: "#10b981" },
  { type: "Éducation", count: 6, color: "#f97316" },
];

const JOUR_PARTICIPATION: JourParticipation[] = [
  { jour: "Lun", participation: 72 },
  { jour: "Mar", participation: 68 },
  { jour: "Mer", participation: 74 },
  { jour: "Jeu", participation: 65 },
  { jour: "Ven", participation: 58 },
  { jour: "Sam", participation: 45 },
  { jour: "Dim", participation: 41 },
];

export const VOTES_DATA: VotesData = {
  overview: {
    votesActifs: 7,
    totalVotants: 34_255,
    tauxParticipation: 64.7,
    propositionsEnAttente: 12,
    historiqueParticipation: dates.map((date, i) => ({
      date,
      value: participationSeries[i],
    })),
  },
  enCours: VOTES_EN_COURS,
  resultats: VOTES_RESULTATS,
  statistiques: {
    parType: VOTE_TYPE_DISTRIBUTION,
    parJour: JOUR_PARTICIPATION,
  },
};

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
