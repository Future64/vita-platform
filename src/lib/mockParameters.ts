import type { SystemParameter, ParameterCategory } from "@/types/parameters";

// ============================================================
// PARAMETRES IMMUABLES — constitutionnels, non modifiables
// ============================================================

const IMMUTABLE_PARAMETERS: SystemParameter[] = [
  {
    id: "param-imm-001",
    name: "Emission quotidienne universelle",
    description:
      "Chaque etre humain verifie recoit exactement 1 Ѵ par jour. Ce parametre est constitutionnel et ne peut etre modifie par aucun vote, amendement ou decision administrative.",
    category: "immuable",
    currentValue: 1,
    unit: "Ѵ/jour/personne",
    history: [
      {
        id: "chg-imm-001-init",
        date: "2025-01-01",
        oldValue: 0,
        newValue: 1,
        proposedBy: "systeme",
        justification: "Valeur fondatrice inscrite dans la Constitution VITA, Titre I, Article 1.",
        status: "initial",
      },
    ],
    technicalDocSection: "emission-quotidienne",
  },
  {
    id: "param-imm-002",
    name: "Non-retroactivite",
    description:
      "Aucune emission retroactive n'est possible. Tout le monde part de zero au moment de sa verification. Les jours anterieurs a la verification ne generent aucune emission.",
    category: "immuable",
    currentValue: true,
    history: [
      {
        id: "chg-imm-002-init",
        date: "2025-01-01",
        oldValue: false,
        newValue: true,
        proposedBy: "systeme",
        justification: "Principe constitutionnel fondateur : egalite de depart.",
        status: "initial",
      },
    ],
    technicalDocSection: "non-retroactivite",
  },
  {
    id: "param-imm-003",
    name: "Confidentialite des transactions",
    description:
      "La vie privee des transactions entre individus est garantie. Le systeme ne permet pas la surveillance de masse des flux financiers personnels.",
    category: "immuable",
    currentValue: true,
    history: [
      {
        id: "chg-imm-003-init",
        date: "2025-01-01",
        oldValue: false,
        newValue: true,
        proposedBy: "systeme",
        justification: "Droit fondamental a la vie privee financiere, Constitution Titre I, Article 3.",
        status: "initial",
      },
    ],
    technicalDocSection: "confidentialite-transactions",
  },
  {
    id: "param-imm-004",
    name: "Unicite du compte",
    description:
      "Une personne physique ne peut posseder qu'un seul compte VITA. L'unicite est garantie par la verification d'identite via Zero-Knowledge Proofs.",
    category: "immuable",
    currentValue: true,
    history: [
      {
        id: "chg-imm-004-init",
        date: "2025-01-01",
        oldValue: false,
        newValue: true,
        proposedBy: "systeme",
        justification: "Principe d'egalite : un humain = un compte = un vote.",
        status: "initial",
      },
    ],
    technicalDocSection: "unicite-compte",
  },
  {
    id: "param-imm-005",
    name: "Non-destructibilite du solde",
    description:
      "Aucune autorite ne peut confisquer, geler ou detruire le solde d'un utilisateur verifie. Seules les transactions volontaires et les penalites prevues par la loi s'appliquent.",
    category: "immuable",
    currentValue: true,
    history: [
      {
        id: "chg-imm-005-init",
        date: "2025-01-01",
        oldValue: false,
        newValue: true,
        proposedBy: "systeme",
        justification: "Protection constitutionnelle de la propriete VITA.",
        status: "initial",
      },
    ],
    technicalDocSection: "non-destructibilite",
  },
];

// ============================================================
// PARAMETRES DE GOUVERNANCE — modifiables par vote
// ============================================================

const GOVERNANCE_PARAMETERS: SystemParameter[] = [
  {
    id: "param-gov-001",
    name: "Duree de vote standard",
    description: "Duree par defaut d'un vote sur une proposition dans l'Agora.",
    category: "gouvernance",
    currentValue: 14,
    unit: "jours",
    allowedRange: { min: 3, max: 90 },
    requiredQuorum: 25,
    requiredThreshold: 60,
    lastModified: "2025-09-15",
    lastModifiedByVote: "prop-agora-042",
    history: [
      {
        id: "chg-gov-001-init",
        date: "2025-01-01",
        oldValue: 0,
        newValue: 7,
        proposedBy: "systeme",
        justification: "Valeur initiale du systeme.",
        status: "initial",
      },
      {
        id: "chg-gov-001-mod1",
        date: "2025-09-15",
        oldValue: 7,
        newValue: 14,
        proposalId: "prop-agora-042",
        voteResult: {
          pour: 3842,
          contre: 1256,
          abstention: 890,
          participation: 28.4,
        },
        proposedBy: "usr-002-citoyen",
        justification:
          "La duree de 7 jours s'est averee insuffisante pour permettre une deliberation approfondie. Les citoyens dans des fuseaux horaires eloignes n'avaient pas toujours le temps de participer.",
        status: "adopted",
      },
    ],
    technicalDocSection: "duree-votes",
  },
  {
    id: "param-gov-002",
    name: "Quorum standard",
    description: "Pourcentage minimum de participation requis pour qu'un vote soit valide.",
    category: "gouvernance",
    currentValue: 25,
    unit: "%",
    allowedRange: { min: 5, max: 75 },
    requiredQuorum: 30,
    requiredThreshold: 66,
    history: [
      {
        id: "chg-gov-002-init",
        date: "2025-01-01",
        oldValue: 0,
        newValue: 25,
        proposedBy: "systeme",
        justification: "Valeur initiale assurant un minimum de legitimite democratique.",
        status: "initial",
      },
    ],
    technicalDocSection: "quorum",
  },
  {
    id: "param-gov-003",
    name: "Seuil d'adoption standard",
    description: "Pourcentage de votes favorables necessaire pour qu'une proposition soit adoptee.",
    category: "gouvernance",
    currentValue: 60,
    unit: "%",
    allowedRange: { min: 50, max: 90 },
    requiredQuorum: 30,
    requiredThreshold: 66,
    history: [
      {
        id: "chg-gov-003-init",
        date: "2025-01-01",
        oldValue: 0,
        newValue: 60,
        proposedBy: "systeme",
        justification: "Majorite qualifiee a 60% pour eviter les changements fragiles.",
        status: "initial",
      },
    ],
    technicalDocSection: "seuil-adoption",
  },
  {
    id: "param-gov-004",
    name: "Seuil d'adoption constitutionnel",
    description:
      "Pourcentage de votes favorables pour modifier les parametres de gouvernance eux-memes (meta-parametres).",
    category: "gouvernance",
    currentValue: 75,
    unit: "%",
    allowedRange: { min: 66, max: 95 },
    requiredQuorum: 40,
    requiredThreshold: 75,
    history: [
      {
        id: "chg-gov-004-init",
        date: "2025-01-01",
        oldValue: 0,
        newValue: 75,
        proposedBy: "systeme",
        justification: "Super-majorite requise pour les modifications structurelles.",
        status: "initial",
      },
    ],
    technicalDocSection: "seuil-constitutionnel",
  },
  {
    id: "param-gov-005",
    name: "Duree mandat administrateur",
    description: "Duree du mandat des administrateurs elus par la communaute.",
    category: "gouvernance",
    currentValue: 180,
    unit: "jours",
    allowedRange: { min: 30, max: 730 },
    requiredQuorum: 30,
    requiredThreshold: 60,
    history: [
      {
        id: "chg-gov-005-init",
        date: "2025-01-01",
        oldValue: 0,
        newValue: 180,
        proposedBy: "systeme",
        justification: "Mandat de 6 mois comme compromis entre stabilite et renouvellement.",
        status: "initial",
      },
    ],
    technicalDocSection: "mandats-elus",
  },
  {
    id: "param-gov-006",
    name: "Nombre maximum de delegations",
    description: "Nombre maximal de citoyens dont un delegue peut recevoir la delegation de vote.",
    category: "gouvernance",
    currentValue: 100,
    unit: "personnes",
    allowedRange: { min: 10, max: 10000 },
    requiredQuorum: 25,
    requiredThreshold: 60,
    history: [
      {
        id: "chg-gov-006-init",
        date: "2025-01-01",
        oldValue: 0,
        newValue: 100,
        proposedBy: "systeme",
        justification: "Limite pour eviter la concentration excessive de pouvoir.",
        status: "initial",
      },
    ],
    technicalDocSection: "delegation-vote",
  },
  {
    id: "param-gov-007",
    name: "Delai de carence nouveau citoyen",
    description:
      "Delai minimum entre la verification d'identite et l'acces complet aux fonctionnalites (vote, propositions).",
    category: "gouvernance",
    currentValue: 7,
    unit: "jours",
    allowedRange: { min: 0, max: 90 },
    requiredQuorum: 25,
    requiredThreshold: 60,
    history: [
      {
        id: "chg-gov-007-init",
        date: "2025-01-01",
        oldValue: 0,
        newValue: 7,
        proposedBy: "systeme",
        justification: "Periode d'observation pour les nouveaux comptes.",
        status: "initial",
      },
    ],
    technicalDocSection: "carence-nouveau",
  },
  {
    id: "param-gov-008",
    name: "Contribution au pot commun",
    description:
      "Pourcentage de chaque transaction preleve pour le pot commun de redistribution.",
    category: "gouvernance",
    currentValue: 2,
    unit: "%",
    allowedRange: { min: 0, max: 10 },
    requiredQuorum: 30,
    requiredThreshold: 66,
    lastModified: "2025-11-20",
    lastModifiedByVote: "prop-agora-089",
    history: [
      {
        id: "chg-gov-008-init",
        date: "2025-01-01",
        oldValue: 0,
        newValue: 1,
        proposedBy: "systeme",
        justification: "Contribution initiale minimale.",
        status: "initial",
      },
      {
        id: "chg-gov-008-mod1",
        date: "2025-11-20",
        oldValue: 1,
        newValue: 2,
        proposalId: "prop-agora-089",
        voteResult: {
          pour: 5120,
          contre: 2340,
          abstention: 1200,
          participation: 32.1,
        },
        proposedBy: "usr-003-moderateur",
        justification:
          "Augmentation a 2% pour financer les projets collectifs environnementaux votes en Agora.",
        status: "adopted",
      },
    ],
    technicalDocSection: "pot-commun",
  },
  {
    id: "param-gov-009",
    name: "Seuil de cosignatures pour propositions",
    description:
      "Nombre minimum de cosignatures necessaires pour qu'une proposition soit soumise au vote.",
    category: "gouvernance",
    currentValue: 50,
    unit: "cosignatures",
    allowedRange: { min: 5, max: 1000 },
    requiredQuorum: 25,
    requiredThreshold: 60,
    history: [
      {
        id: "chg-gov-009-init",
        date: "2025-01-01",
        oldValue: 0,
        newValue: 50,
        proposedBy: "systeme",
        justification: "Filtre anti-spam : 50 citoyens doivent soutenir une proposition avant vote.",
        status: "initial",
      },
    ],
    technicalDocSection: "cosignatures",
  },
  {
    id: "param-gov-010",
    name: "Periode de deliberation",
    description:
      "Duree obligatoire de deliberation avant le debut du vote sur une proposition.",
    category: "gouvernance",
    currentValue: 7,
    unit: "jours",
    allowedRange: { min: 1, max: 60 },
    requiredQuorum: 25,
    requiredThreshold: 60,
    history: [
      {
        id: "chg-gov-010-init",
        date: "2025-01-01",
        oldValue: 0,
        newValue: 7,
        proposedBy: "systeme",
        justification: "Permettre le debat avant le vote.",
        status: "initial",
      },
    ],
    technicalDocSection: "deliberation",
  },
  {
    id: "param-gov-011",
    name: "Frequence de reverification",
    description:
      "Intervalle entre les preuves de vie periodiques (re-verification ZK-proof).",
    category: "gouvernance",
    currentValue: 365,
    unit: "jours",
    allowedRange: { min: 30, max: 730 },
    requiredQuorum: 30,
    requiredThreshold: 66,
    history: [
      {
        id: "chg-gov-011-init",
        date: "2025-01-01",
        oldValue: 0,
        newValue: 365,
        proposedBy: "systeme",
        justification: "Re-verification annuelle pour maintenir l'integrite du systeme.",
        status: "initial",
      },
    ],
    technicalDocSection: "reverification",
  },
  {
    id: "param-gov-012",
    name: "Nombre de signataires pour arret d'urgence",
    description:
      "Nombre de super-administrateurs requis pour declencher un arret d'urgence du systeme (multi-signature).",
    category: "gouvernance",
    currentValue: 3,
    unit: "sur 5",
    allowedRange: { min: 2, max: 5 },
    requiredQuorum: 40,
    requiredThreshold: 75,
    history: [
      {
        id: "chg-gov-012-init",
        date: "2025-01-01",
        oldValue: 0,
        newValue: 3,
        proposedBy: "systeme",
        justification: "Multi-signature 3/5 pour l'arret d'urgence.",
        status: "initial",
      },
    ],
    technicalDocSection: "arret-urgence",
  },
  {
    id: "param-gov-013",
    name: "Duree de suspension maximale",
    description: "Duree maximale de suspension d'un compte avant revue obligatoire.",
    category: "gouvernance",
    currentValue: 30,
    unit: "jours",
    allowedRange: { min: 1, max: 365 },
    requiredQuorum: 25,
    requiredThreshold: 60,
    history: [
      {
        id: "chg-gov-013-init",
        date: "2025-01-01",
        oldValue: 0,
        newValue: 30,
        proposedBy: "systeme",
        justification: "Limite la duree de suspension pour proteger les droits des citoyens.",
        status: "initial",
      },
    ],
    technicalDocSection: "suspension-comptes",
  },
];

// ============================================================
// PARAMETRES TECHNIQUES — modifiables par les administrateurs
// ============================================================

const TECHNICAL_PARAMETERS: SystemParameter[] = [
  {
    id: "param-tech-001",
    name: "Montant maximum transaction offline",
    description: "Montant maximum autorise pour une transaction hors ligne.",
    category: "technique",
    currentValue: 10,
    unit: "Ѵ",
    allowedRange: { min: 1, max: 100 },
    requiredQuorum: 25,
    requiredThreshold: 60,
    history: [
      {
        id: "chg-tech-001-init",
        date: "2025-01-01",
        oldValue: 0,
        newValue: 10,
        proposedBy: "systeme",
        justification: "Limite anti-fraude pour les transactions offline.",
        status: "initial",
      },
    ],
    technicalDocSection: "transactions-offline",
  },
  {
    id: "param-tech-002",
    name: "Nombre max de transactions offline",
    description: "Nombre maximum de transactions offline avant synchronisation obligatoire.",
    category: "technique",
    currentValue: 5,
    unit: "transactions",
    allowedRange: { min: 1, max: 50 },
    requiredQuorum: 25,
    requiredThreshold: 60,
    history: [
      {
        id: "chg-tech-002-init",
        date: "2025-01-01",
        oldValue: 0,
        newValue: 5,
        proposedBy: "systeme",
        justification: "Limite le nombre de transactions offline pour reduire les risques de double depense.",
        status: "initial",
      },
    ],
    technicalDocSection: "transactions-offline",
  },
  {
    id: "param-tech-003",
    name: "Duree max mode offline",
    description: "Duree maximale autorisee en mode deconnecte avant penalite.",
    category: "technique",
    currentValue: 72,
    unit: "heures",
    allowedRange: { min: 1, max: 720 },
    requiredQuorum: 25,
    requiredThreshold: 60,
    history: [
      {
        id: "chg-tech-003-init",
        date: "2025-01-01",
        oldValue: 0,
        newValue: 72,
        proposedBy: "systeme",
        justification: "3 jours de mode offline pour les zones sans connectivite.",
        status: "initial",
      },
    ],
    technicalDocSection: "transactions-offline",
  },
  {
    id: "param-tech-004",
    name: "Taux de penalite offline",
    description: "Penalite appliquee par jour de depassement du mode offline.",
    category: "technique",
    currentValue: 0.1,
    unit: "%/jour",
    allowedRange: { min: 0, max: 5 },
    requiredQuorum: 25,
    requiredThreshold: 60,
    history: [
      {
        id: "chg-tech-004-init",
        date: "2025-01-01",
        oldValue: 0,
        newValue: 0.1,
        proposedBy: "systeme",
        justification: "Penalite dissuasive mais proportionnee.",
        status: "initial",
      },
    ],
    technicalDocSection: "transactions-offline",
  },
  {
    id: "param-tech-005",
    name: "Heure d'emission quotidienne",
    description: "Heure UTC a laquelle l'emission quotidienne de 1 Ѵ est creditee.",
    category: "technique",
    currentValue: "00:00 UTC",
    history: [
      {
        id: "chg-tech-005-init",
        date: "2025-01-01",
        oldValue: "",
        newValue: "00:00 UTC",
        proposedBy: "systeme",
        justification: "Emission a minuit UTC pour coherence globale.",
        status: "initial",
      },
    ],
    technicalDocSection: "emission-quotidienne",
  },
  {
    id: "param-tech-006",
    name: "Precision decimale",
    description: "Nombre de decimales utilisees pour les montants en Ѵ.",
    category: "technique",
    currentValue: 2,
    unit: "decimales",
    allowedRange: { min: 0, max: 8 },
    requiredQuorum: 30,
    requiredThreshold: 66,
    lastModified: "2025-08-10",
    lastModifiedByVote: "prop-agora-035",
    history: [
      {
        id: "chg-tech-006-init",
        date: "2025-01-01",
        oldValue: 0,
        newValue: 4,
        proposedBy: "systeme",
        justification: "Precision initiale a 4 decimales.",
        status: "initial",
      },
      {
        id: "chg-tech-006-mod1",
        date: "2025-08-10",
        oldValue: 4,
        newValue: 2,
        proposalId: "prop-agora-035",
        voteResult: {
          pour: 4210,
          contre: 1890,
          abstention: 950,
          participation: 26.8,
        },
        proposedBy: "usr-005-auditeur",
        justification:
          "Simplification de l'affichage. 2 decimales suffisent pour les transactions courantes. La precision interne reste a 8 decimales.",
        status: "adopted",
      },
    ],
    technicalDocSection: "precision-decimale",
  },
];

// ============================================================
// EXPORT — tous les parametres regroupes
// ============================================================

export const SYSTEM_PARAMETERS: SystemParameter[] = [
  ...IMMUTABLE_PARAMETERS,
  ...GOVERNANCE_PARAMETERS,
  ...TECHNICAL_PARAMETERS,
];

export const PARAMETERS_BY_CATEGORY: Record<ParameterCategory, SystemParameter[]> = {
  immuable: IMMUTABLE_PARAMETERS,
  gouvernance: GOVERNANCE_PARAMETERS,
  technique: TECHNICAL_PARAMETERS,
};

export const CATEGORY_METADATA: Record<
  ParameterCategory,
  { label: string; description: string; color: string; icon: string }
> = {
  immuable: {
    label: "Immuable",
    description: "Parametres constitutionnels qui ne peuvent pas etre modifies",
    color: "#ef4444",
    icon: "Shield",
  },
  gouvernance: {
    label: "Gouvernance",
    description: "Parametres modifiables par vote collectif dans l'Agora",
    color: "#8b5cf6",
    icon: "Vote",
  },
  technique: {
    label: "Technique",
    description: "Parametres techniques du systeme",
    color: "#06b6d4",
    icon: "Settings",
  },
};
