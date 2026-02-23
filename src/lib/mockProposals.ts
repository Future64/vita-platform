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
// DÉBATS
// ============================================================

export type CategorieDebat =
  | "argument_pour"
  | "argument_contre"
  | "question"
  | "proposition_amendement"
  | "technique"
  | "general";

export interface Message {
  id: string;
  auteur: { id: string; username: string; prenom: string; nom: string };
  contenu: string;
  date: string;
  modifie: boolean;
  reactions: {
    approuve: number;
    pertinent: number;
    desaccord: number;
  };
  reponseA?: string;
}

export interface FilDiscussion {
  id: string;
  sujet: string;
  auteur: { id: string; username: string; prenom: string; nom: string };
  dateCreation: string;
  messages: Message[];
  epingle: boolean;
  resolu: boolean;
  categorie: CategorieDebat;
}

export interface Debat {
  propositionId: string;
  fils: FilDiscussion[];
  synthese: {
    argumentsPour: string[];
    argumentsContre: string[];
    questionsEnSuspens: string[];
  };
  statistiques: {
    totalMessages: number;
    participants: number;
    dernierMessage: string;
  };
}

const DEBATS: Record<string, Debat> = {
  // Proposition prop-agora-115: "Modification : Durée de vote 14j → 21j"
  "prop-agora-115": {
    propositionId: "prop-agora-115",
    fils: [
      {
        id: "fil-1",
        sujet: "Résumé des arguments principaux",
        auteur: { id: "mod-1", username: "moderateur_agora", prenom: "Équipe", nom: "Modération" },
        dateCreation: "2025-12-06",
        epingle: true,
        resolu: false,
        categorie: "general",
        messages: [
          {
            id: "msg-1-1",
            auteur: { id: "mod-1", username: "moderateur_agora", prenom: "Équipe", nom: "Modération" },
            contenu: "Ce fil résume les arguments clés de chaque côté du débat sur l'extension de la durée de vote de 14 à 21 jours. Merci de consulter les fils dédiés pour les détails.\n\n**Pour** : meilleure inclusivité internationale, plus de temps de réflexion, participation accrue des zones à faible connectivité.\n**Contre** : ralentissement du processus démocratique, risque de fatigue des votants, coût opérationnel.\n\nCe résumé est mis à jour régulièrement.",
            date: "il y a 9j",
            modifie: true,
            reactions: { approuve: 45, pertinent: 32, desaccord: 2 },
          },
          {
            id: "msg-1-2",
            auteur: { id: "u-sophie", username: "sophie.chen", prenom: "Sophie", nom: "Chen" },
            contenu: "Merci pour ce résumé clair. Je suggère d'ajouter aussi les données de participation par fuseau horaire que Carlos a partagées dans le fil dédié.",
            date: "il y a 7j",
            modifie: false,
            reactions: { approuve: 12, pertinent: 8, desaccord: 0 },
            reponseA: "msg-1-1",
          },
        ],
      },
      {
        id: "fil-2",
        sujet: "Pourquoi 21 jours est mieux que 14",
        auteur: { id: "u-carlos", username: "carlos.sp", prenom: "Carlos", nom: "Santos" },
        dateCreation: "2025-12-06",
        epingle: false,
        resolu: false,
        categorie: "argument_pour",
        messages: [
          {
            id: "msg-2-1",
            auteur: { id: "u-carlos", username: "carlos.sp", prenom: "Carlos", nom: "Santos" },
            contenu: "J'ai analysé les données de participation des 10 derniers votes. Les citoyens en Asie du Sud-Est et en Afrique subsaharienne votent principalement entre le jour 8 et le jour 13. Avec 14 jours, ils ont à peine le temps de prendre connaissance du vote et de se décider.\n\nAvec 21 jours, on aurait une semaine supplémentaire qui permettrait d'atteindre les zones à faible connectivité où les gens ne se connectent qu'une fois par semaine au centre communautaire.",
            date: "il y a 9j",
            modifie: false,
            reactions: { approuve: 34, pertinent: 28, desaccord: 5 },
          },
          {
            id: "msg-2-2",
            auteur: { id: "u-amina", username: "amina.kante", prenom: "Amina", nom: "Kanté" },
            contenu: "Je confirme ! Au Sénégal, dans ma communauté, les gens accèdent à internet principalement le week-end au marché. 14 jours = seulement 2 week-ends possibles. 21 jours = 3 week-ends, ça change tout pour l'inclusion.",
            date: "il y a 8j",
            modifie: false,
            reactions: { approuve: 56, pertinent: 41, desaccord: 1 },
            reponseA: "msg-2-1",
          },
          {
            id: "msg-2-3",
            auteur: { id: "u-lena", username: "lena.zk", prenom: "Lena", nom: "Müller" },
            contenu: "D'un point de vue technique, l'extension à 21 jours n'a quasiment aucun coût additionnel sur le système. Les votes sont stockés de manière incrémentale et le comptage final ne se fait qu'à la clôture.",
            date: "il y a 7j",
            modifie: false,
            reactions: { approuve: 18, pertinent: 22, desaccord: 3 },
          },
          {
            id: "msg-2-4",
            auteur: { id: "u-jean", username: "jean.mart", prenom: "Jean", nom: "Martin" },
            contenu: "L'argument de l'inclusion est fort. Mais ne pourrait-on pas plutôt investir dans l'infrastructure de connectivité plutôt que d'allonger les délais ? Ce serait traiter la cause plutôt que le symptôme.",
            date: "il y a 5j",
            modifie: false,
            reactions: { approuve: 15, pertinent: 19, desaccord: 8 },
          },
          {
            id: "msg-2-5",
            auteur: { id: "u-carlos", username: "carlos.sp", prenom: "Carlos", nom: "Santos" },
            contenu: "Jean, l'amélioration de l'infrastructure est un projet à long terme (et nécessaire !), mais 21 jours est une mesure qu'on peut appliquer immédiatement et qui bénéficie à des millions de personnes dès maintenant. Les deux approches ne sont pas exclusives.",
            date: "il y a 4j",
            modifie: false,
            reactions: { approuve: 29, pertinent: 15, desaccord: 2 },
            reponseA: "msg-2-4",
          },
        ],
      },
      {
        id: "fil-3",
        sujet: "Risque de ralentir le processus démocratique",
        auteur: { id: "u-hans", username: "hans.b", prenom: "Hans", nom: "Braun" },
        dateCreation: "2025-12-07",
        epingle: false,
        resolu: false,
        categorie: "argument_contre",
        messages: [
          {
            id: "msg-3-1",
            auteur: { id: "u-hans", username: "hans.b", prenom: "Hans", nom: "Braun" },
            contenu: "21 jours, c'est 3 semaines. Avec le temps de délibération (minimum 48h) et la collecte de cosignatures, une proposition peut prendre plus de 5 semaines avant d'être adoptée. Dans un monde qui bouge vite, c'est un luxe qu'on ne peut pas toujours se permettre.\n\nJe pense qu'on devrait plutôt garder 14 jours par défaut et avoir un mécanisme de prolongation optionnel pour les votes complexes.",
            date: "il y a 8j",
            modifie: false,
            reactions: { approuve: 23, pertinent: 17, desaccord: 12 },
          },
          {
            id: "msg-3-2",
            auteur: { id: "u-priya", username: "priya_dev", prenom: "Priya", nom: "Sharma" },
            contenu: "Hans soulève un point important. Mais en pratique, la majorité des votes atteignent déjà le quorum au jour 10. L'extension à 21 jours ne rallonge que les votes qui en ont besoin — les autres seraient clôturés plus tôt si on ajoutait un mécanisme de clôture anticipée quand le quorum est largement dépassé.",
            date: "il y a 6j",
            modifie: false,
            reactions: { approuve: 31, pertinent: 26, desaccord: 4 },
            reponseA: "msg-3-1",
          },
          {
            id: "msg-3-3",
            auteur: { id: "u-marcus", username: "marcus.gov", prenom: "Marcus", nom: "Johnson" },
            contenu: "Je suis d'accord avec Hans sur le principe, mais pas sur la conclusion. Les décisions qui affectent 10 millions de personnes méritent 3 semaines de réflexion. La rapidité ne devrait pas primer sur la qualité de la démocratie.",
            date: "il y a 5j",
            modifie: false,
            reactions: { approuve: 27, pertinent: 14, desaccord: 9 },
          },
          {
            id: "msg-3-4",
            auteur: { id: "u-hans", username: "hans.b", prenom: "Hans", nom: "Braun" },
            contenu: "L'idée de Priya d'une clôture anticipée est intéressante. Si on combinait les deux : 21 jours max, mais clôture possible au jour 14 si le quorum est atteint à 150% ? Ça résoudrait les deux problèmes.",
            date: "il y a 3j",
            modifie: false,
            reactions: { approuve: 38, pertinent: 29, desaccord: 3 },
            reponseA: "msg-3-2",
          },
        ],
      },
      {
        id: "fil-4",
        sujet: "Peut-on avoir des statistiques de participation au jour 7 vs jour 14 ?",
        auteur: { id: "u-yuki", username: "yuki.node", prenom: "Yuki", nom: "Tanaka" },
        dateCreation: "2025-12-08",
        epingle: false,
        resolu: true,
        categorie: "question",
        messages: [
          {
            id: "msg-4-1",
            auteur: { id: "u-yuki", username: "yuki.node", prenom: "Yuki", nom: "Tanaka" },
            contenu: "Quelqu'un aurait-il accès aux statistiques détaillées de participation par jour pour les votes récents ? Je voudrais voir la courbe d'accumulation des votes pour mieux comprendre l'impact potentiel de l'extension.",
            date: "il y a 7j",
            modifie: false,
            reactions: { approuve: 14, pertinent: 21, desaccord: 0 },
          },
          {
            id: "msg-4-2",
            auteur: { id: "u-carlos", username: "carlos.sp", prenom: "Carlos", nom: "Santos" },
            contenu: "Voici les chiffres des 5 derniers votes (moyenne) :\n- Jour 1-3 : 15% de la participation finale\n- Jour 4-7 : 35%\n- Jour 8-10 : 25%\n- Jour 11-14 : 25%\n\nDonc 50% des votes arrivent dans la deuxième semaine. On peut raisonnablement estimer que 10-15% supplémentaires arriveraient dans une 3ème semaine.",
            date: "il y a 6j",
            modifie: false,
            reactions: { approuve: 42, pertinent: 38, desaccord: 1 },
            reponseA: "msg-4-1",
          },
          {
            id: "msg-4-3",
            auteur: { id: "u-yuki", username: "yuki.node", prenom: "Yuki", nom: "Tanaka" },
            contenu: "Merci Carlos, c'est exactement ce dont j'avais besoin. Ces chiffres confirment que l'extension aurait un impact significatif sur l'inclusion. Je marque ce fil comme résolu.",
            date: "il y a 5j",
            modifie: false,
            reactions: { approuve: 8, pertinent: 5, desaccord: 0 },
            reponseA: "msg-4-2",
          },
        ],
      },
    ],
    synthese: {
      argumentsPour: [
        "Meilleure inclusion des citoyens en zones à faible connectivité (accès hebdomadaire uniquement)",
        "Les données montrent que 50% des votes arrivent dans la 2ème semaine — une 3ème semaine ajouterait 10-15% de participation",
        "Coût technique quasi nul pour le système",
        "Permet 3 week-ends d'accès au lieu de 2 pour les communautés rurales",
      ],
      argumentsContre: [
        "Rallonge le cycle complet d'une proposition à plus de 5 semaines",
        "Risque de fatigue des votants sur les longues périodes",
        "La rapidité est parfois nécessaire pour les décisions urgentes",
      ],
      questionsEnSuspens: [
        "Possibilité d'un mécanisme de clôture anticipée si le quorum est largement dépassé (150%) ?",
        "Faut-il différencier la durée selon le type de proposition (standard vs constitutionnelle) ?",
      ],
    },
    statistiques: {
      totalMessages: 14,
      participants: 8,
      dernierMessage: "il y a 3j",
    },
  },

  // Proposition 1: "Révision du coefficient PPA"
  "1": {
    propositionId: "1",
    fils: [
      {
        id: "fil-5",
        sujet: "Impact sur les zones à fort coût de vie",
        auteur: { id: "u-sophie", username: "sophie.chen", prenom: "Sophie", nom: "Chen" },
        dateCreation: "2025-12-02",
        epingle: false,
        resolu: false,
        categorie: "argument_pour",
        messages: [
          {
            id: "msg-5-1",
            auteur: { id: "u-sophie", username: "sophie.chen", prenom: "Sophie", nom: "Chen" },
            contenu: "La révision du coefficient PPA est cruciale pour les citoyens vivant dans des zones à fort coût de vie. À Tokyo, 1 Ѵ permet d'acheter un café, alors qu'à Dakar on peut acheter un repas complet. Sans ajustement, le système perpétue les inégalités géographiques.",
            date: "il y a 12j",
            modifie: false,
            reactions: { approuve: 67, pertinent: 45, desaccord: 8 },
          },
          {
            id: "msg-5-2",
            auteur: { id: "u-fatou", username: "fatou.sn", prenom: "Fatou", nom: "Ndiaye" },
            contenu: "Je comprends l'argument, mais attention : un coefficient PPA trop généreux pour les zones chères risque de créer un afflux de « migration numérique » où les gens prétendent vivre dans des zones chères pour bénéficier du coefficient.",
            date: "il y a 11j",
            modifie: false,
            reactions: { approuve: 34, pertinent: 52, desaccord: 6 },
            reponseA: "msg-5-1",
          },
          {
            id: "msg-5-3",
            auteur: { id: "u-lena", username: "lena.zk", prenom: "Lena", nom: "Müller" },
            contenu: "Fatou soulève un point important. La vérification ZK-proof pourrait inclure une preuve de localisation anonymisée — on peut prouver qu'on est dans une zone géographique sans révéler son adresse exacte.",
            date: "il y a 10j",
            modifie: false,
            reactions: { approuve: 43, pertinent: 38, desaccord: 2 },
            reponseA: "msg-5-2",
          },
        ],
      },
      {
        id: "fil-6",
        sujet: "Proposition d'amendement : coefficient trimestriel plutôt qu'annuel",
        auteur: { id: "u-marcus", username: "marcus.gov", prenom: "Marcus", nom: "Johnson" },
        dateCreation: "2025-12-03",
        epingle: false,
        resolu: false,
        categorie: "proposition_amendement",
        messages: [
          {
            id: "msg-6-1",
            auteur: { id: "u-marcus", username: "marcus.gov", prenom: "Marcus", nom: "Johnson" },
            contenu: "Je propose un amendement : plutôt qu'un coefficient PPA révisé annuellement (comme dans la proposition actuelle), on devrait le réviser trimestriellement. Les prix fluctuent rapidement dans certaines régions, et un coefficient annuel est trop lent à s'adapter.\n\nConcrètement : utiliser les données de l'ONU et de la Banque Mondiale mises à jour chaque trimestre pour recalculer automatiquement les coefficients.",
            date: "il y a 11j",
            modifie: false,
            reactions: { approuve: 28, pertinent: 35, desaccord: 12 },
          },
          {
            id: "msg-6-2",
            auteur: { id: "u-priya", username: "priya_dev", prenom: "Priya", nom: "Sharma" },
            contenu: "Techniquement faisable. Les APIs de la Banque Mondiale sont gratuites et fournissent des données trimestrielles. On pourrait automatiser le calcul avec un smart contract qui met à jour le coefficient en fonction des données entrantes.",
            date: "il y a 10j",
            modifie: false,
            reactions: { approuve: 22, pertinent: 30, desaccord: 4 },
            reponseA: "msg-6-1",
          },
          {
            id: "msg-6-3",
            auteur: { id: "u-hans", username: "hans.b", prenom: "Hans", nom: "Braun" },
            contenu: "Attention au risque de volatilité excessive. Un changement trimestriel signifie que le pouvoir d'achat d'un citoyen peut varier significativement d'un trimestre à l'autre, ce qui nuit à la prévisibilité.",
            date: "il y a 9j",
            modifie: false,
            reactions: { approuve: 19, pertinent: 25, desaccord: 7 },
          },
          {
            id: "msg-6-4",
            auteur: { id: "u-marcus", username: "marcus.gov", prenom: "Marcus", nom: "Johnson" },
            contenu: "Hans, on pourrait limiter la variation max à ±5% par trimestre pour éviter les chocs. C'est un bon compromis entre réactivité et stabilité.",
            date: "il y a 8j",
            modifie: true,
            reactions: { approuve: 36, pertinent: 20, desaccord: 3 },
            reponseA: "msg-6-3",
          },
        ],
      },
      {
        id: "fil-7",
        sujet: "Quelle source de données pour le calcul PPA ?",
        auteur: { id: "u-lena", username: "lena.zk", prenom: "Lena", nom: "Müller" },
        dateCreation: "2025-12-04",
        epingle: false,
        resolu: false,
        categorie: "technique",
        messages: [
          {
            id: "msg-7-1",
            auteur: { id: "u-lena", username: "lena.zk", prenom: "Lena", nom: "Müller" },
            contenu: "Question technique : quelle source de données utilise-t-on exactement pour le calcul PPA ? Les données de la Banque Mondiale (ICP) sont les plus complètes mais elles ont 1-2 ans de retard. Le FMI publie des estimations plus récentes mais moins granulaires.",
            date: "il y a 10j",
            modifie: false,
            reactions: { approuve: 15, pertinent: 28, desaccord: 0 },
          },
          {
            id: "msg-7-2",
            auteur: { id: "u-carlos", username: "carlos.sp", prenom: "Carlos", nom: "Santos" },
            contenu: "On pourrait combiner les deux : données ICP de la Banque Mondiale comme base, ajustées par les estimations trimestrielles du FMI. C'est ce que font la plupart des organisations internationales.",
            date: "il y a 9j",
            modifie: false,
            reactions: { approuve: 20, pertinent: 18, desaccord: 1 },
            reponseA: "msg-7-1",
          },
        ],
      },
    ],
    synthese: {
      argumentsPour: [
        "Corrige les inégalités de pouvoir d'achat entre zones géographiques",
        "Données techniques disponibles via APIs de la Banque Mondiale et du FMI",
        "La vérification ZK-proof peut inclure une preuve de localisation anonymisée",
      ],
      argumentsContre: [
        "Risque de « migration numérique » pour bénéficier de coefficients avantageux",
        "Un coefficient trimestriel pourrait créer de la volatilité dans le pouvoir d'achat",
      ],
      questionsEnSuspens: [
        "Quelle fréquence de révision du coefficient : annuelle ou trimestrielle (avec plafond ±5%) ?",
      ],
    },
    statistiques: {
      totalMessages: 9,
      participants: 6,
      dernierMessage: "il y a 8j",
    },
  },
};

// ============================================================
// HISTORIQUE DES PROPOSITIONS
// ============================================================

export type TypeEvenement =
  | "creation"
  | "modification"
  | "commentaire_clos"
  | "passage_discussion"
  | "passage_vote"
  | "vote_cloture"
  | "resultat"
  | "application"
  | "appel"
  | "modification_texte"
  | "ajout_document"
  | "changement_categorie"
  | "soutien_seuil"
  | "assignation_relecteur";

export interface EvenementHistorique {
  id: string;
  type: TypeEvenement;
  date: string;
  acteur?: { id: string; username: string; prenom: string; nom: string };
  titre: string;
  description: string;
  details?: {
    avant?: string;
    apres?: string;
    pour?: number;
    contre?: number;
    abstention?: number;
    participation?: number;
    quorumRequis?: number;
    seuilRequis?: number;
    adopte?: boolean;
    soutiens?: number;
    seuilAtteint?: boolean;
    ancienneCategorie?: string;
    nouvelleCategorie?: string;
  };
}

export interface PropositionHistorique {
  propositionId: string;
  etapeActuelle: "creation" | "discussion" | "vote" | "resultat" | "application";
  evenements: EvenementHistorique[];
}

const HISTORIQUES: Record<string, PropositionHistorique> = {
  // Proposition prop-agora-115: "Modification : Durée de vote 14j → 21j" (en cours de vote)
  "prop-agora-115": {
    propositionId: "prop-agora-115",
    etapeActuelle: "vote",
    evenements: [
      {
        id: "evt-115-1",
        type: "creation",
        date: "5 déc. 2025, 09:15",
        acteur: { id: "u-sophie-c", username: "sophie.c", prenom: "Sophie", nom: "C." },
        titre: "Proposition créée",
        description: "Proposition créée suite à l'analyse des taux de participation par fuseau horaire sur les 10 derniers votes.",
      },
      {
        id: "evt-115-2",
        type: "passage_discussion",
        date: "5 déc. 2025, 09:15",
        titre: "Période de discussion ouverte",
        description: "Période de discussion ouverte pour 48 heures minimum. Les citoyens peuvent commenter et proposer des amendements.",
      },
      {
        id: "evt-115-3",
        type: "ajout_document",
        date: "6 déc. 2025, 14:30",
        acteur: { id: "u-sophie-c", username: "sophie.c", prenom: "Sophie", nom: "C." },
        titre: "Document ajouté",
        description: "Ajout de l'analyse statistique des taux de participation par jour et par zone géographique.",
      },
      {
        id: "evt-115-4",
        type: "assignation_relecteur",
        date: "6 déc. 2025, 16:00",
        acteur: { id: "mod-1", username: "moderateur_agora", prenom: "Équipe", nom: "Modération" },
        titre: "Relecteurs assignés",
        description: "2 relecteurs assignés : @carlos.sp et @amina.kante pour examiner la proposition et ses impacts.",
      },
      {
        id: "evt-115-5",
        type: "modification_texte",
        date: "7 déc. 2025, 11:20",
        acteur: { id: "u-sophie-c", username: "sophie.c", prenom: "Sophie", nom: "C." },
        titre: "Texte modifié",
        description: "Précision ajoutée sur l'impact pour les votes urgents : les votes de type « urgence » conserveraient une durée de 7 jours.",
        details: {
          avant: "Extension de la durée de vote standard de 14 à 21 jours pour tous les types de propositions.",
          apres: "Extension de la durée de vote standard de 14 à 21 jours. Les votes de type « urgence » conservent une durée de 7 jours, et les votes constitutionnels passent à 30 jours.",
        },
      },
      {
        id: "evt-115-6",
        type: "soutien_seuil",
        date: "8 déc. 2025, 08:45",
        titre: "Seuil de soutiens atteint",
        description: "Le seuil de 100 cosignatures a été atteint. La proposition est éligible au passage en vote.",
        details: {
          soutiens: 156,
          seuilAtteint: true,
        },
      },
      {
        id: "evt-115-7",
        type: "passage_vote",
        date: "9 déc. 2025, 00:00",
        titre: "Vote ouvert",
        description: "Période de discussion terminée. Vote ouvert pour 14 jours (jusqu'au 23 décembre 2025). Quorum requis : 25%, seuil d'adoption : 60%.",
      },
    ],
  },

  // Proposition 1: "Révision du coefficient PPA" (en cours de vote aussi)
  "1": {
    propositionId: "1",
    etapeActuelle: "vote",
    evenements: [
      {
        id: "evt-1-1",
        type: "creation",
        date: "1 déc. 2025, 10:00",
        acteur: { id: "u-marie", username: "marie.d", prenom: "Marie", nom: "D." },
        titre: "Proposition créée",
        description: "Proposition soumise pour adapter le coefficient PPA selon les variations régionales du coût de la vie.",
      },
      {
        id: "evt-1-2",
        type: "passage_discussion",
        date: "1 déc. 2025, 10:00",
        titre: "Période de discussion ouverte",
        description: "Période de discussion ouverte pour un minimum de 48 heures.",
      },
      {
        id: "evt-1-3",
        type: "modification_texte",
        date: "3 déc. 2025, 09:30",
        acteur: { id: "u-marie", username: "marie.d", prenom: "Marie", nom: "D." },
        titre: "Texte modifié",
        description: "Ajout de précisions sur la méthode de calcul des coefficients et les sources de données utilisées.",
        details: {
          avant: "Adapter le coefficient PPA en utilisant les données publiques disponibles.",
          apres: "Adapter le coefficient PPA en utilisant les données ICP de la Banque Mondiale, ajustées trimestriellement par les estimations du FMI. Variation maximale de ±5% par trimestre.",
        },
      },
      {
        id: "evt-1-4",
        type: "modification_texte",
        date: "5 déc. 2025, 15:45",
        acteur: { id: "u-marie", username: "marie.d", prenom: "Marie", nom: "D." },
        titre: "Texte modifié",
        description: "Intégration de la suggestion de vérification ZK-proof pour la localisation.",
        details: {
          avant: "La localisation du citoyen sera déclarée sur l'honneur.",
          apres: "La localisation du citoyen sera vérifiée par une preuve ZK anonymisée confirmant la zone géographique sans révéler l'adresse exacte.",
        },
      },
      {
        id: "evt-1-5",
        type: "passage_vote",
        date: "7 déc. 2025, 00:00",
        titre: "Vote ouvert",
        description: "Période de discussion terminée. Vote ouvert pour 14 jours. Quorum requis : 20%, seuil d'adoption : 50%.",
      },
      {
        id: "evt-1-6",
        type: "vote_cloture",
        date: "21 déc. 2025, 00:00",
        titre: "Vote clôturé",
        description: "Période de vote terminée. Dépouillement en cours.",
      },
      {
        id: "evt-1-7",
        type: "resultat",
        date: "21 déc. 2025, 00:05",
        titre: "Résultat proclamé : Adoptée",
        description: "La proposition a été adoptée avec 64.9% des votes favorables et un taux de participation de 50.0%.",
        details: {
          pour: 3247,
          contre: 1523,
          abstention: 234,
          participation: 50.0,
          quorumRequis: 20,
          seuilRequis: 50,
          adopte: true,
        },
      },
      {
        id: "evt-1-8",
        type: "application",
        date: "22 déc. 2025, 08:00",
        titre: "Modification appliquée",
        description: "Le nouveau coefficient PPA est entré en vigueur. Les soldes seront ajustés progressivement sur 7 jours.",
      },
    ],
  },
};

// ============================================================
// HELPERS
// ============================================================

export function getProposalById(id: string): AgoraProposal | undefined {
  return ALL_PROPOSALS.find((p) => p.id === id);
}

export function getDoleanceById(id: string): Doleance | undefined {
  return MOCK_DOLEANCES.find((d) => d.id === id);
}

export function getArchiveById(id: string): ArchivedProposal | undefined {
  return MOCK_ARCHIVES.find((a) => a.id === id);
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

export function getDebatsForProposal(propositionId: string): Debat | undefined {
  return DEBATS[propositionId];
}

export function getHistoriqueForProposal(propositionId: string): PropositionHistorique | undefined {
  return HISTORIQUES[propositionId];
}
