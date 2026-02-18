import type { ParameterChangeProposal } from "@/types/parameters";

// ============================================================
// DOLÉANCES
// ============================================================

export type DoleanceCategorie =
  | "economie"
  | "gouvernance"
  | "technique"
  | "social"
  | "ecologie"
  | "education"
  | "sante"
  | "autre";

export interface Doleance {
  id: string;
  titre: string;
  description: string;
  auteur: { id: string; username: string; prenom: string; nom: string; initiales: string };
  dateCreation: string;
  categorie: DoleanceCategorie;
  soutiens: number;
  seuilProposition: number;
  statut: "ouverte" | "seuil_atteint" | "convertie" | "fermee";
  propositionId?: string;
  commentaires: number;
}

const CATEGORIE_COLORS: Record<DoleanceCategorie, "orange" | "violet" | "cyan" | "pink" | "green" | "blue" | "red" | "yellow"> = {
  economie: "orange",
  gouvernance: "violet",
  technique: "cyan",
  social: "pink",
  ecologie: "green",
  education: "blue",
  sante: "red",
  autre: "yellow",
};

const CATEGORIE_LABELS: Record<DoleanceCategorie, string> = {
  economie: "Économie",
  gouvernance: "Gouvernance",
  technique: "Technique",
  social: "Social",
  ecologie: "Écologie",
  education: "Éducation",
  sante: "Santé",
  autre: "Autre",
};

export { CATEGORIE_COLORS, CATEGORIE_LABELS };

export const MOCK_DOLEANCES: Doleance[] = [
  {
    id: "dol-1",
    titre: "Manque de transparence sur les frais de matériaux",
    description: "Les artisans et producteurs ne disposent d'aucun outil pour voir la décomposition des frais de matériaux dans les transactions de services. Cela crée un flou dans la valorisation du travail manuel et empêche les citoyens de comprendre le coût réel des produits.",
    auteur: { id: "u1", username: "pierre_art", prenom: "Pierre", nom: "Durand", initiales: "PD" },
    dateCreation: "il y a 2j",
    categorie: "economie",
    soutiens: 87,
    seuilProposition: 100,
    statut: "seuil_atteint",
    commentaires: 34,
  },
  {
    id: "dol-2",
    titre: "Besoin d'un mécanisme de médiation entre citoyens",
    description: "En cas de litige sur une transaction ou un service rendu, il n'existe aucun processus de médiation. Les citoyens doivent résoudre seuls leurs différends, ce qui peut mener à des situations injustes et des transactions contestées sans recours.",
    auteur: { id: "u2", username: "amina.kante", prenom: "Amina", nom: "Kanté", initiales: "AK" },
    dateCreation: "il y a 4j",
    categorie: "gouvernance",
    soutiens: 102,
    seuilProposition: 100,
    statut: "seuil_atteint",
    commentaires: 56,
  },
  {
    id: "dol-3",
    titre: "Le calculateur ne prend pas en compte le travail nocturne",
    description: "Le coefficient multiplicateur pour le travail de nuit n'est pas appliqué dans le calculateur de services. Les travailleurs de nuit (santé, sécurité, production) sont donc sous-valorisés par rapport aux horaires de jour.",
    auteur: { id: "u3", username: "carlos.sp", prenom: "Carlos", nom: "Santos", initiales: "CS" },
    dateCreation: "il y a 1j",
    categorie: "technique",
    soutiens: 45,
    seuilProposition: 100,
    statut: "ouverte",
    commentaires: 18,
  },
  {
    id: "dol-4",
    titre: "Accès limité pour les personnes âgées sans smartphone",
    description: "Mon père de 72 ans ne peut pas utiliser le système VITA car tout passe par une application mobile. Il faudrait une alternative accessible : kiosques physiques, numéro de téléphone, ou terminaux dans les mairies.",
    auteur: { id: "u4", username: "juliette_42", prenom: "Juliette", nom: "Martin", initiales: "JM" },
    dateCreation: "il y a 6j",
    categorie: "social",
    soutiens: 73,
    seuilProposition: 100,
    statut: "ouverte",
    commentaires: 41,
  },
  {
    id: "dol-5",
    titre: "Empreinte carbone des transactions non mesurée",
    description: "Le système VITA devrait intégrer un indicateur d'empreinte carbone pour chaque transaction, afin de sensibiliser les citoyens à l'impact environnemental de leurs échanges et encourager les circuits courts.",
    auteur: { id: "u5", username: "yuki.node", prenom: "Yuki", nom: "Tanaka", initiales: "YT" },
    dateCreation: "il y a 3j",
    categorie: "ecologie",
    soutiens: 28,
    seuilProposition: 100,
    statut: "ouverte",
    commentaires: 12,
  },
  {
    id: "dol-6",
    titre: "Pas de programme de formation au système VITA en zone rurale",
    description: "Dans les zones rurales du Sénégal, du Brésil et de l'Inde, les citoyens n'ont accès à aucune formation sur le fonctionnement du système VITA. Il faudrait des ateliers itinérants ou des formations via radio.",
    auteur: { id: "u6", username: "moussa.dk", prenom: "Moussa", nom: "Diop", initiales: "MD" },
    dateCreation: "il y a 5j",
    categorie: "education",
    soutiens: 156,
    seuilProposition: 100,
    statut: "convertie",
    propositionId: "prop-agora-125",
    commentaires: 67,
  },
  {
    id: "dol-7",
    titre: "Temps de vérification ZK-proof trop long",
    description: "La vérification d'identité par ZK-proof prend en moyenne 48h, ce qui est frustrant pour les nouveaux citoyens impatients de commencer. Peut-on optimiser le processus ou offrir un accès partiel en attendant ?",
    auteur: { id: "u7", username: "lena.zk", prenom: "Lena", nom: "Müller", initiales: "LM" },
    dateCreation: "il y a 8j",
    categorie: "technique",
    soutiens: 62,
    seuilProposition: 100,
    statut: "ouverte",
    commentaires: 29,
  },
  {
    id: "dol-8",
    titre: "Manque de soutien psychologique pour les citoyens isolés",
    description: "Certains citoyens, notamment les personnes âgées ou les migrants récents, se sentent isolés dans le système. Un dispositif d'accompagnement humain (pas seulement technique) serait bénéfique.",
    auteur: { id: "u8", username: "priya_dev", prenom: "Priya", nom: "Sharma", initiales: "PS" },
    dateCreation: "il y a 10j",
    categorie: "sante",
    soutiens: 19,
    seuilProposition: 100,
    statut: "ouverte",
    commentaires: 8,
  },
  {
    id: "dol-9",
    titre: "Les notifications de vote arrivent trop tard",
    description: "Je reçois les notifications de nouveaux votes seulement 2-3 jours après leur ouverture. Pour les votes courts (7 jours), ça réduit considérablement le temps de réflexion et la participation.",
    auteur: { id: "u9", username: "hans.b", prenom: "Hans", nom: "Braun", initiales: "HB" },
    dateCreation: "il y a 7j",
    categorie: "gouvernance",
    soutiens: 54,
    seuilProposition: 100,
    statut: "ouverte",
    commentaires: 22,
  },
  {
    id: "dol-10",
    titre: "Impossible de fractionner un paiement en plusieurs fois",
    description: "Pour les services ou biens de valeur élevée (formations longues, matériel médical), il n'y a pas de mécanisme de paiement échelonné. Un système de paiement en N fois sans frais serait très utile.",
    auteur: { id: "u10", username: "fatou.sn", prenom: "Fatou", nom: "Ndiaye", initiales: "FN" },
    dateCreation: "il y a 2j",
    categorie: "economie",
    soutiens: 38,
    seuilProposition: 100,
    statut: "ouverte",
    commentaires: 15,
  },
  {
    id: "dol-11",
    titre: "Pas de comptabilité pour les associations",
    description: "Les associations et collectifs utilisant VITA n'ont pas d'outil de comptabilité adapté. Ils doivent tout gérer manuellement, ce qui limite l'adoption par les structures organisées.",
    auteur: { id: "u11", username: "sophie.dao", prenom: "Sophie", nom: "Daouda", initiales: "SD" },
    dateCreation: "il y a 12j",
    categorie: "autre",
    soutiens: 3,
    seuilProposition: 100,
    statut: "fermee",
    commentaires: 2,
  },
  {
    id: "dol-12",
    titre: "Le mode offline ne fonctionne pas sur les anciens téléphones",
    description: "Les téléphones Android de version inférieure à 8 ne peuvent pas utiliser le mode offline. Or dans beaucoup de pays en développement, ces appareils sont encore majoritaires.",
    auteur: { id: "u12", username: "marcus.gov", prenom: "Marcus", nom: "Johnson", initiales: "MJ" },
    dateCreation: "il y a 3j",
    categorie: "technique",
    soutiens: 41,
    seuilProposition: 100,
    statut: "ouverte",
    commentaires: 19,
  },
];

// ============================================================
// Types pour les propositions Agora
// ============================================================

export interface AgoraProposal {
  id: string;
  title: string;
  description: string;
  domain: string;
  domainColor: "orange" | "green" | "cyan" | "violet" | "pink" | "red" | "yellow" | "blue";
  status: "cosigning" | "deliberation" | "voting" | "adopted" | "rejected" | "applied";
  statusLabel: string;
  statusColor: "green" | "cyan" | "violet" | "orange" | "red" | "pink" | "yellow" | "blue";
  author: { name: string; initials: string; color?: "cyan" | "primary" };
  votesFor?: number;
  votesAgainst?: number;
  votesAbstain?: number;
  totalVotes?: number;
  date: string;
  createdAt: string;
  votingEndsAt?: string;
  comments: number;
  supporters: number;
  // Parameter-specific fields
  type?: "modification_parametre";
  parameterProposal?: ParameterChangeProposal;
}

// Mock proposals - includes standard proposals + parameter proposals
export const MOCK_PROPOSALS: AgoraProposal[] = [
  {
    id: "1",
    title: "Revision du coefficient PPA",
    description: "Adapter le coefficient selon les variations regionales.",
    domain: "Economie",
    domainColor: "orange",
    status: "voting",
    statusLabel: "Vote",
    statusColor: "green",
    author: { name: "Marie D.", initials: "MD" },
    votesFor: 3247,
    votesAgainst: 1523,
    votesAbstain: 234,
    totalVotes: 5004,
    date: "2j",
    createdAt: "2025-12-01",
    votingEndsAt: "2025-12-15",
    comments: 127,
    supporters: 856,
  },
  {
    id: "2",
    title: "Fonds urgence climatique",
    description: "Financement collectif pour actions climatiques.",
    domain: "Environnement",
    domainColor: "green",
    status: "deliberation",
    statusLabel: "Deliberation",
    statusColor: "cyan",
    author: { name: "Lucas T.", initials: "LT", color: "cyan" },
    date: "5j",
    createdAt: "2025-11-28",
    comments: 45,
    supporters: 312,
  },
  {
    id: "prop-agora-115",
    title: "Modification : Duree de vote 14j → 21j",
    description: "Proposition d'extension de la duree de vote standard de 14 a 21 jours pour ameliorer la participation internationale.",
    domain: "Parametre",
    domainColor: "orange",
    status: "voting",
    statusLabel: "Vote",
    statusColor: "green",
    author: { name: "Sophie C.", initials: "SC" },
    votesFor: 2840,
    votesAgainst: 1960,
    votesAbstain: 450,
    totalVotes: 5250,
    date: "3j",
    createdAt: "2025-12-05",
    votingEndsAt: "2025-12-19",
    comments: 89,
    supporters: 520,
    type: "modification_parametre",
    parameterProposal: {
      type: "modification_parametre",
      parameterId: "param-gov-001",
      parameterName: "Duree de vote standard",
      currentValue: 14,
      proposedValue: 21,
      allowedRange: { min: 3, max: 90 },
      justification: "La duree actuelle de 14 jours reste insuffisante pour les citoyens dans les fuseaux horaires eloignes et les zones a connectivite limitee. Une extension a 21 jours permettrait une meilleure representation globale.",
      requiredQuorum: 25,
      requiredThreshold: 60,
      technicalDocLink: "/codex/technique/systeme-vote",
    },
  },
  {
    id: "prop-agora-118",
    title: "Modification : Contribution pot commun 2% → 3%",
    description: "Augmentation de la contribution au pot commun pour financer les programmes d'education VITA.",
    domain: "Parametre",
    domainColor: "orange",
    status: "deliberation",
    statusLabel: "Deliberation",
    statusColor: "cyan",
    author: { name: "Jean M.", initials: "JM" },
    date: "1j",
    createdAt: "2025-12-12",
    comments: 34,
    supporters: 180,
    type: "modification_parametre",
    parameterProposal: {
      type: "modification_parametre",
      parameterId: "param-gov-008",
      parameterName: "Contribution au pot commun",
      currentValue: 2,
      proposedValue: 3,
      allowedRange: { min: 0, max: 10 },
      justification: "Les fonds collectifs actuels sont insuffisants pour financer les programmes d'education et de formation des nouveaux citoyens. Une augmentation a 3% permettrait de lancer le programme VITA Education vote en Agora.",
      requiredQuorum: 30,
      requiredThreshold: 66,
      technicalDocLink: "/codex/technique/transactions",
    },
  },
  {
    id: "prop-agora-120",
    title: "Modification : Delai de carence 7j → 14j",
    description: "Extension du delai de carence pour les nouveaux citoyens afin de renforcer la securite anti-fraude.",
    domain: "Parametre",
    domainColor: "orange",
    status: "cosigning",
    statusLabel: "Cosignatures",
    statusColor: "orange",
    author: { name: "Ahmed K.", initials: "AK" },
    date: "8h",
    createdAt: "2025-12-14",
    comments: 12,
    supporters: 35,
    type: "modification_parametre",
    parameterProposal: {
      type: "modification_parametre",
      parameterId: "param-gov-007",
      parameterName: "Delai de carence nouveau citoyen",
      currentValue: 7,
      proposedValue: 14,
      allowedRange: { min: 0, max: 90 },
      justification: "Plusieurs cas de comptes frauduleux ont ete detectes pendant la periode de carence de 7 jours. Un delai de 14 jours donnerait plus de temps aux auditeurs pour verifier les nouvelles inscriptions.",
      requiredQuorum: 25,
      requiredThreshold: 60,
      technicalDocLink: "/codex/technique/roles-permissions",
    },
  },
];

// Additional proposals to reach 10+ with varied statuses
export const MORE_PROPOSALS: AgoraProposal[] = [
  {
    id: "prop-agora-125",
    title: "Programme de formation VITA en zone rurale",
    description: "Mise en place d'ateliers itinerants et de formations via radio pour initier les populations rurales au systeme VITA dans 15 pays prioritaires.",
    domain: "Education",
    domainColor: "blue",
    status: "deliberation",
    statusLabel: "Deliberation",
    statusColor: "cyan",
    author: { name: "Moussa D.", initials: "MD" },
    date: "3j",
    createdAt: "2025-12-10",
    comments: 23,
    supporters: 245,
  },
  {
    id: "prop-agora-126",
    title: "Systeme de mediation citoyenne",
    description: "Creation d'un mecanisme de mediation entre citoyens pour resoudre les litiges lies aux transactions et services, avec des mediateurs elus et formes.",
    domain: "Gouvernance",
    domainColor: "violet",
    status: "deliberation",
    statusLabel: "Deliberation",
    statusColor: "cyan",
    author: { name: "Amina K.", initials: "AK", color: "cyan" },
    date: "2j",
    createdAt: "2025-12-11",
    comments: 67,
    supporters: 378,
  },
  {
    id: "prop-agora-127",
    title: "Indicateur d'empreinte carbone par transaction",
    description: "Integration d'un calcul automatique de l'empreinte carbone pour chaque transaction, favorisant les circuits courts et l'economie locale.",
    domain: "Environnement",
    domainColor: "green",
    status: "cosigning",
    statusLabel: "Cosignatures",
    statusColor: "orange",
    author: { name: "Yuki T.", initials: "YT" },
    date: "1j",
    createdAt: "2025-12-13",
    comments: 8,
    supporters: 67,
  },
  {
    id: "prop-agora-128",
    title: "Accessibilite pour les personnes agees",
    description: "Deploiement de bornes physiques dans les mairies et centres communautaires pour permettre aux personnes sans smartphone d'acceder au systeme VITA.",
    domain: "Social",
    domainColor: "pink",
    status: "voting",
    statusLabel: "Vote",
    statusColor: "green",
    author: { name: "Juliette M.", initials: "JM" },
    votesFor: 4102,
    votesAgainst: 876,
    votesAbstain: 312,
    totalVotes: 5290,
    date: "5j",
    createdAt: "2025-12-08",
    votingEndsAt: "2025-12-22",
    comments: 95,
    supporters: 612,
  },
  {
    id: "prop-agora-129",
    title: "Paiement echelonne pour les services de valeur elevee",
    description: "Permettre le fractionnement des paiements en 3, 6 ou 12 fois sans frais pour les services ou biens depassant 50 Ѵ.",
    domain: "Economie",
    domainColor: "orange",
    status: "deliberation",
    statusLabel: "Deliberation",
    statusColor: "cyan",
    author: { name: "Fatou N.", initials: "FN" },
    date: "4j",
    createdAt: "2025-12-09",
    comments: 31,
    supporters: 189,
  },
];

// Combine all proposals for search
export const ALL_PROPOSALS: AgoraProposal[] = [...MOCK_PROPOSALS, ...MORE_PROPOSALS];

// ============================================================
// ARCHIVES — Propositions terminées (adoptées ou rejetées)
// ============================================================

export interface ArchivedProposal {
  id: string;
  title: string;
  description: string;
  domain: string;
  domainColor: "orange" | "green" | "cyan" | "violet" | "pink" | "red" | "yellow" | "blue";
  type?: "modification_parametre" | "standard" | "constitutionnel";
  resultat: "adopte" | "rejete";
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalVotes: number;
  participation: number; // %
  dateFin: string;
  author: { name: string; initials: string };
  applique?: boolean; // for parameter changes
}

export const MOCK_ARCHIVES: ArchivedProposal[] = [
  {
    id: "arch-1",
    title: "Mise a jour du seuil de quorum",
    description: "Passage du seuil de quorum de 25% a 20% pour les votes standards.",
    domain: "Gouvernance",
    domainColor: "violet",
    type: "modification_parametre",
    resultat: "adopte",
    votesFor: 6234,
    votesAgainst: 1876,
    votesAbstain: 322,
    totalVotes: 8432,
    participation: 67.5,
    dateFin: "il y a 2j",
    author: { name: "Sophie C.", initials: "SC" },
    applique: true,
  },
  {
    id: "arch-2",
    title: "Subvention recherche ZK-proofs",
    description: "Allocation de 100 000 Ѵ du pot commun pour financer la recherche sur l'amelioration des preuves zero-knowledge.",
    domain: "Technique",
    domainColor: "cyan",
    resultat: "adopte",
    votesFor: 5891,
    votesAgainst: 2102,
    votesAbstain: 221,
    totalVotes: 8214,
    participation: 65.7,
    dateFin: "il y a 4j",
    author: { name: "Lena M.", initials: "LM" },
  },
  {
    id: "arch-3",
    title: "Limite retrait quotidien a 50 Ѵ",
    description: "Plafonnement des retraits quotidiens a 50 Ѵ pour limiter les risques en cas de compromission de compte.",
    domain: "Economie",
    domainColor: "orange",
    type: "modification_parametre",
    resultat: "rejete",
    votesFor: 2456,
    votesAgainst: 4789,
    votesAbstain: 409,
    totalVotes: 7654,
    participation: 61.2,
    dateFin: "il y a 5j",
    author: { name: "Carlos S.", initials: "CS" },
  },
  {
    id: "arch-4",
    title: "Charte ethique des donnees VITA",
    description: "Adoption d'une charte imposant la transparence totale sur l'utilisation des metadonnees anonymisees du systeme.",
    domain: "Gouvernance",
    domainColor: "violet",
    type: "constitutionnel",
    resultat: "adopte",
    votesFor: 7123,
    votesAgainst: 892,
    votesAbstain: 330,
    totalVotes: 8345,
    participation: 66.8,
    dateFin: "il y a 7j",
    author: { name: "Amina K.", initials: "AK" },
    applique: true,
  },
  {
    id: "arch-5",
    title: "Extension duree mode offline a 120h",
    description: "Augmentation de la duree maximale du mode offline de 72h a 120h pour les zones a faible connectivite.",
    domain: "Technique",
    domainColor: "cyan",
    type: "modification_parametre",
    resultat: "rejete",
    votesFor: 3102,
    votesAgainst: 4567,
    votesAbstain: 222,
    totalVotes: 7891,
    participation: 63.1,
    dateFin: "il y a 9j",
    author: { name: "Hans B.", initials: "HB" },
  },
  {
    id: "arch-6",
    title: "Fonds solidarite intercontinental",
    description: "Creation d'un fonds de 500 000 Ѵ pour aider les communautes en difficulte dans les pays en developpement.",
    domain: "Social",
    domainColor: "pink",
    resultat: "adopte",
    votesFor: 6789,
    votesAgainst: 1234,
    votesAbstain: 433,
    totalVotes: 8456,
    participation: 67.6,
    dateFin: "il y a 12j",
    author: { name: "Fatou N.", initials: "FN" },
  },
  {
    id: "arch-7",
    title: "Reduction penalites mode offline",
    description: "Diminution des penalites de 0.1% a 0.05% par jour de depassement pour les transactions offline.",
    domain: "Economie",
    domainColor: "orange",
    type: "modification_parametre",
    resultat: "rejete",
    votesFor: 2890,
    votesAgainst: 5123,
    votesAbstain: 221,
    totalVotes: 8234,
    participation: 65.9,
    dateFin: "il y a 14j",
    author: { name: "Pierre D.", initials: "PD" },
  },
  {
    id: "arch-8",
    title: "Programme pilote agriculture urbaine",
    description: "Lancement d'un programme pilote subventionne pour l'agriculture urbaine dans 10 villes, finance par le pot commun.",
    domain: "Environnement",
    domainColor: "green",
    resultat: "adopte",
    votesFor: 5432,
    votesAgainst: 2678,
    votesAbstain: 345,
    totalVotes: 8455,
    participation: 67.6,
    dateFin: "il y a 18j",
    author: { name: "Yuki T.", initials: "YT" },
  },
  {
    id: "arch-9",
    title: "Reconnaissance des diplomes VITA",
    description: "Mise en place d'un systeme de certification des competences acquises via le reseau VITA, reconnu par les institutions partenaires.",
    domain: "Education",
    domainColor: "blue",
    resultat: "adopte",
    votesFor: 6102,
    votesAgainst: 1456,
    votesAbstain: 287,
    totalVotes: 7845,
    participation: 62.8,
    dateFin: "il y a 22j",
    author: { name: "Priya S.", initials: "PS" },
  },
  {
    id: "arch-10",
    title: "Coefficient travail penible x1.5",
    description: "Augmentation du coefficient multiplicateur pour les metiers penibles de x1.3 a x1.5.",
    domain: "Economie",
    domainColor: "orange",
    type: "modification_parametre",
    resultat: "adopte",
    votesFor: 5678,
    votesAgainst: 2345,
    votesAbstain: 198,
    totalVotes: 8221,
    participation: 65.8,
    dateFin: "il y a 28j",
    author: { name: "Marcus J.", initials: "MJ" },
    applique: true,
  },
];

// ============================================================
// HELPERS
// ============================================================

export function getProposalById(id: string): AgoraProposal | undefined {
  return ALL_PROPOSALS.find((p) => p.id === id);
}

export function getParameterProposals(): AgoraProposal[] {
  return ALL_PROPOSALS.filter((p) => p.type === "modification_parametre");
}

export function getProposalsForParameter(parameterId: string): AgoraProposal[] {
  return ALL_PROPOSALS.filter(
    (p) => p.parameterProposal?.parameterId === parameterId
  );
}

export function getProposalsInDiscussion(): AgoraProposal[] {
  return ALL_PROPOSALS.filter((p) => p.status === "deliberation" || p.status === "cosigning");
}

export function getProposalsVoting(): AgoraProposal[] {
  return ALL_PROPOSALS.filter((p) => p.status === "voting");
}
