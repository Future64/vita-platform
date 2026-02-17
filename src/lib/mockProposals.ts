import type { ParameterChangeProposal } from "@/types/parameters";

// Types pour les propositions Agora
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

export function getProposalById(id: string): AgoraProposal | undefined {
  return MOCK_PROPOSALS.find((p) => p.id === id);
}

export function getParameterProposals(): AgoraProposal[] {
  return MOCK_PROPOSALS.filter((p) => p.type === "modification_parametre");
}

export function getProposalsForParameter(parameterId: string): AgoraProposal[] {
  return MOCK_PROPOSALS.filter(
    (p) => p.parameterProposal?.parameterId === parameterId
  );
}
