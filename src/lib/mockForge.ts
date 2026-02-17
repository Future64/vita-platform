// Mock data for the Forge module (Git-like legislative versioning)

export interface ForgeUser {
  id: string;
  name: string;
  initials: string;
  commits: number;
  projects: number;
}

export interface ForgeProject {
  id: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  watchers: number;
  branches: number;
  openMRs: number;
  contributors: number;
  license: string;
  lastUpdate: string;
  created: string;
  status: "active" | "archived" | "draft";
}

export interface ForgeBranch {
  id: string;
  name: string;
  projectId: string;
  commits: number;
  lastUpdate: string;
  protected: boolean;
  author: string;
  authorInitials: string;
  aheadMain: number;
  behindMain: number;
}

export interface ForgeCommit {
  hash: string;
  message: string;
  description?: string;
  author: string;
  authorInitials: string;
  date: string;
  dateIso: string;
  branch: string;
  additions: number;
  deletions: number;
  filesChanged: number;
}

export interface ForgeMergeRequest {
  id: string;
  number: number;
  title: string;
  description: string;
  project: string;
  projectId: string;
  author: string;
  authorInitials: string;
  sourceBranch: string;
  targetBranch: string;
  status: "open" | "voting" | "approved" | "merged" | "rejected" | "closed";
  votes: { approve: number; reject: number; abstain: number };
  totalVotes: number;
  quorum: number;
  requiredMajority: number;
  hasConflicts: boolean;
  additions: number;
  deletions: number;
  filesChanged: number;
  comments: ForgeComment[];
  created: string;
  createdIso: string;
  updated: string;
}

export interface ForgeComment {
  id: string;
  author: string;
  authorInitials: string;
  content: string;
  date: string;
  lineRef?: number;
  filePath?: string;
  replyTo?: string;
}

export interface ForgeDiffFile {
  filePath: string;
  type: "add" | "modify" | "delete";
  additions: number;
  deletions: number;
  lines: ForgeDiffLine[];
}

export interface ForgeDiffLine {
  type: "context" | "add" | "remove";
  lineOld?: number;
  lineNew?: number;
  content: string;
}

// ============================================================
// MOCK USERS
// ============================================================

export const FORGE_USERS: ForgeUser[] = [
  { id: "u1", name: "Marie Dupont", initials: "MD", commits: 247, projects: 12 },
  { id: "u2", name: "Jean Martin", initials: "JM", commits: 189, projects: 8 },
  { id: "u3", name: "Sophie Chen", initials: "SC", commits: 156, projects: 6 },
  { id: "u4", name: "Alex Rivera", initials: "AR", commits: 98, projects: 5 },
  { id: "u5", name: "Fatima Benali", initials: "FB", commits: 72, projects: 4 },
  { id: "u6", name: "Luca Moretti", initials: "LM", commits: 63, projects: 3 },
];

// ============================================================
// PROJECTS
// ============================================================

export const FORGE_PROJECTS: ForgeProject[] = [
  {
    id: "constitution-v3",
    name: "Constitution v3.0",
    description: "Révision majeure de la constitution avec nouveaux articles sur l'IA et les droits numériques",
    language: "Markdown",
    stars: 247,
    forks: 45,
    watchers: 89,
    branches: 4,
    openMRs: 2,
    contributors: 34,
    license: "CC BY-SA 4.0",
    lastUpdate: "il y a 2h",
    created: "2023-09-15",
    status: "active",
  },
  {
    id: "voting-system",
    name: "Système de Vote v2",
    description: "Amélioration du système de vote avec délégation progressive et quorum dynamique",
    language: "TypeScript",
    stars: 321,
    forks: 67,
    watchers: 112,
    branches: 3,
    openMRs: 1,
    contributors: 42,
    license: "MIT",
    lastUpdate: "il y a 1j",
    created: "2024-01-10",
    status: "active",
  },
];

// ============================================================
// BRANCHES (per project)
// ============================================================

export const FORGE_BRANCHES: Record<string, ForgeBranch[]> = {
  "constitution-v3": [
    {
      id: "br-main-c",
      name: "main",
      projectId: "constitution-v3",
      commits: 247,
      lastUpdate: "il y a 2h",
      protected: true,
      author: "Marie Dupont",
      authorInitials: "MD",
      aheadMain: 0,
      behindMain: 0,
    },
    {
      id: "br-ai-ethics",
      name: "feature/ai-ethics",
      projectId: "constitution-v3",
      commits: 15,
      lastUpdate: "il y a 3h",
      protected: false,
      author: "Marie Dupont",
      authorInitials: "MD",
      aheadMain: 5,
      behindMain: 1,
    },
    {
      id: "br-digital-rights",
      name: "feature/digital-rights",
      projectId: "constitution-v3",
      commits: 23,
      lastUpdate: "il y a 1j",
      protected: false,
      author: "Jean Martin",
      authorInitials: "JM",
      aheadMain: 8,
      behindMain: 2,
    },
    {
      id: "br-typos",
      name: "fix/article-9-typos",
      projectId: "constitution-v3",
      commits: 3,
      lastUpdate: "il y a 2j",
      protected: false,
      author: "Sophie Chen",
      authorInitials: "SC",
      aheadMain: 2,
      behindMain: 0,
    },
  ],
  "voting-system": [
    {
      id: "br-main-v",
      name: "main",
      projectId: "voting-system",
      commits: 189,
      lastUpdate: "il y a 1j",
      protected: true,
      author: "Alex Rivera",
      authorInitials: "AR",
      aheadMain: 0,
      behindMain: 0,
    },
    {
      id: "br-delegation",
      name: "feature/delegation-progressive",
      projectId: "voting-system",
      commits: 12,
      lastUpdate: "il y a 5h",
      protected: false,
      author: "Sophie Chen",
      authorInitials: "SC",
      aheadMain: 6,
      behindMain: 0,
    },
    {
      id: "br-quorum",
      name: "feature/dynamic-quorum",
      projectId: "voting-system",
      commits: 8,
      lastUpdate: "il y a 2j",
      protected: false,
      author: "Fatima Benali",
      authorInitials: "FB",
      aheadMain: 3,
      behindMain: 1,
    },
  ],
};

// ============================================================
// COMMITS (per branch)
// ============================================================

export const FORGE_COMMITS: Record<string, ForgeCommit[]> = {
  "br-ai-ethics": [
    {
      hash: "a3f2b1c",
      message: "Ajout article 47 : Éthique de l'IA et gouvernance",
      description: "Nouvel article définissant les principes fondamentaux de l'utilisation de l'IA dans le cadre VITA.",
      author: "Marie Dupont",
      authorInitials: "MD",
      date: "il y a 3h",
      dateIso: "2025-01-15T10:00:00Z",
      branch: "feature/ai-ethics",
      additions: 42,
      deletions: 3,
      filesChanged: 2,
    },
    {
      hash: "b5c8d2e",
      message: "Ajout section sur la transparence algorithmique",
      author: "Marie Dupont",
      authorInitials: "MD",
      date: "il y a 6h",
      dateIso: "2025-01-15T07:00:00Z",
      branch: "feature/ai-ethics",
      additions: 28,
      deletions: 0,
      filesChanged: 1,
    },
    {
      hash: "c9d3e4f",
      message: "Définition des droits face aux décisions automatisées",
      author: "Jean Martin",
      authorInitials: "JM",
      date: "il y a 1j",
      dateIso: "2025-01-14T14:00:00Z",
      branch: "feature/ai-ethics",
      additions: 35,
      deletions: 2,
      filesChanged: 1,
    },
    {
      hash: "d1e5f6a",
      message: "Ajout préambule sur le droit à l'explication",
      author: "Sophie Chen",
      authorInitials: "SC",
      date: "il y a 2j",
      dateIso: "2025-01-13T16:00:00Z",
      branch: "feature/ai-ethics",
      additions: 18,
      deletions: 0,
      filesChanged: 1,
    },
    {
      hash: "e2f6a7b",
      message: "Création de la branche et structure initiale",
      author: "Marie Dupont",
      authorInitials: "MD",
      date: "il y a 4j",
      dateIso: "2025-01-11T09:00:00Z",
      branch: "feature/ai-ethics",
      additions: 12,
      deletions: 0,
      filesChanged: 3,
    },
  ],
  "br-digital-rights": [
    {
      hash: "f3a7b8c",
      message: "Mise à jour article 12 : Droits numériques",
      author: "Jean Martin",
      authorInitials: "JM",
      date: "il y a 1j",
      dateIso: "2025-01-14T11:00:00Z",
      branch: "feature/digital-rights",
      additions: 56,
      deletions: 12,
      filesChanged: 3,
    },
    {
      hash: "g4b8c9d",
      message: "Ajout droit à la portabilité des données",
      author: "Jean Martin",
      authorInitials: "JM",
      date: "il y a 2j",
      dateIso: "2025-01-13T09:00:00Z",
      branch: "feature/digital-rights",
      additions: 24,
      deletions: 0,
      filesChanged: 1,
    },
    {
      hash: "h5c9d0e",
      message: "Clarification du droit à l'oubli numérique",
      author: "Fatima Benali",
      authorInitials: "FB",
      date: "il y a 3j",
      dateIso: "2025-01-12T15:00:00Z",
      branch: "feature/digital-rights",
      additions: 19,
      deletions: 7,
      filesChanged: 1,
    },
  ],
  "br-typos": [
    {
      hash: "i6d0e1f",
      message: "Correction typo paragraphe 3",
      author: "Sophie Chen",
      authorInitials: "SC",
      date: "il y a 2j",
      dateIso: "2025-01-13T10:00:00Z",
      branch: "fix/article-9-typos",
      additions: 2,
      deletions: 2,
      filesChanged: 1,
    },
    {
      hash: "j7e1f2a",
      message: "Fix ponctuation et majuscules",
      author: "Sophie Chen",
      authorInitials: "SC",
      date: "il y a 3j",
      dateIso: "2025-01-12T08:00:00Z",
      branch: "fix/article-9-typos",
      additions: 4,
      deletions: 4,
      filesChanged: 1,
    },
  ],
  "br-delegation": [
    {
      hash: "k8f2a3b",
      message: "Implémentation délégation transitive",
      description: "Permet de déléguer son vote à un délégué qui peut lui-même déléguer.",
      author: "Sophie Chen",
      authorInitials: "SC",
      date: "il y a 5h",
      dateIso: "2025-01-15T08:00:00Z",
      branch: "feature/delegation-progressive",
      additions: 87,
      deletions: 12,
      filesChanged: 4,
    },
    {
      hash: "l9a3b4c",
      message: "Ajout limite de profondeur de délégation",
      author: "Sophie Chen",
      authorInitials: "SC",
      date: "il y a 1j",
      dateIso: "2025-01-14T10:00:00Z",
      branch: "feature/delegation-progressive",
      additions: 23,
      deletions: 5,
      filesChanged: 2,
    },
    {
      hash: "m0b4c5d",
      message: "Tests unitaires délégation",
      author: "Alex Rivera",
      authorInitials: "AR",
      date: "il y a 2j",
      dateIso: "2025-01-13T14:00:00Z",
      branch: "feature/delegation-progressive",
      additions: 145,
      deletions: 0,
      filesChanged: 3,
    },
  ],
  "br-quorum": [
    {
      hash: "n1c5d6e",
      message: "Calcul dynamique du quorum basé sur la participation",
      author: "Fatima Benali",
      authorInitials: "FB",
      date: "il y a 2j",
      dateIso: "2025-01-13T16:00:00Z",
      branch: "feature/dynamic-quorum",
      additions: 64,
      deletions: 18,
      filesChanged: 3,
    },
    {
      hash: "o2d6e7f",
      message: "Seuil minimum de quorum configurable",
      author: "Fatima Benali",
      authorInitials: "FB",
      date: "il y a 3j",
      dateIso: "2025-01-12T11:00:00Z",
      branch: "feature/dynamic-quorum",
      additions: 31,
      deletions: 8,
      filesChanged: 2,
    },
  ],
};

// ============================================================
// DIFF FILES (for MRs)
// ============================================================

export const FORGE_DIFFS: Record<string, ForgeDiffFile[]> = {
  "mr-1": [
    {
      filePath: "articles/article-47-ia-ethique.md",
      type: "add",
      additions: 42,
      deletions: 0,
      lines: [
        { type: "add", lineNew: 1, content: "# Article 47 : Éthique de l'Intelligence Artificielle" },
        { type: "add", lineNew: 2, content: "" },
        { type: "add", lineNew: 3, content: "## Section 1 — Principes fondamentaux" },
        { type: "add", lineNew: 4, content: "" },
        { type: "add", lineNew: 5, content: "1. Tout système d'intelligence artificielle utilisé dans le cadre" },
        { type: "add", lineNew: 6, content: "   de VITA doit respecter les droits fondamentaux des citoyens." },
        { type: "add", lineNew: 7, content: "" },
        { type: "add", lineNew: 8, content: "2. Les décisions automatisées impactant les droits individuels" },
        { type: "add", lineNew: 9, content: "   doivent être explicables et contestables." },
        { type: "add", lineNew: 10, content: "" },
        { type: "add", lineNew: 11, content: "3. L'utilisation de l'IA pour la surveillance de masse est" },
        { type: "add", lineNew: 12, content: "   strictement interdite dans l'écosystème VITA." },
        { type: "add", lineNew: 13, content: "" },
        { type: "add", lineNew: 14, content: "## Section 2 — Transparence algorithmique" },
        { type: "add", lineNew: 15, content: "" },
        { type: "add", lineNew: 16, content: "1. Tout algorithme ayant un impact sur la distribution de Ѵ" },
        { type: "add", lineNew: 17, content: "   doit être open-source et auditable par tout citoyen." },
        { type: "add", lineNew: 18, content: "" },
        { type: "add", lineNew: 19, content: "2. Un registre public des algorithmes en production doit être" },
        { type: "add", lineNew: 20, content: "   maintenu et mis à jour en temps réel." },
      ],
    },
    {
      filePath: "articles/index.md",
      type: "modify",
      additions: 2,
      deletions: 1,
      lines: [
        { type: "context", lineOld: 45, lineNew: 45, content: "- Article 45 : Droit à l'environnement" },
        { type: "context", lineOld: 46, lineNew: 46, content: "- Article 46 : Protection des données personnelles" },
        { type: "remove", lineOld: 47, content: "" },
        { type: "add", lineNew: 47, content: "- Article 47 : Éthique de l'Intelligence Artificielle" },
        { type: "add", lineNew: 48, content: "" },
      ],
    },
  ],
  "mr-2": [
    {
      filePath: "articles/article-12-droits-numeriques.md",
      type: "modify",
      additions: 24,
      deletions: 8,
      lines: [
        { type: "context", lineOld: 1, lineNew: 1, content: "# Article 12 : Droits Numériques" },
        { type: "context", lineOld: 2, lineNew: 2, content: "" },
        { type: "context", lineOld: 3, lineNew: 3, content: "## Section 1 — Droit à la vie privée numérique" },
        { type: "context", lineOld: 4, lineNew: 4, content: "" },
        { type: "remove", lineOld: 5, content: "1. Chaque citoyen a droit à la protection de ses données." },
        { type: "add", lineNew: 5, content: "1. Chaque citoyen dispose d'un droit inaliénable à la protection" },
        { type: "add", lineNew: 6, content: "   de ses données personnelles et de sa vie privée numérique." },
        { type: "context", lineOld: 6, lineNew: 7, content: "" },
        { type: "remove", lineOld: 7, content: "2. Les transactions VITA sont privées par défaut." },
        { type: "add", lineNew: 8, content: "2. Les transactions VITA sont privées par défaut. Aucune entité," },
        { type: "add", lineNew: 9, content: "   publique ou privée, ne peut accéder aux détails d'une transaction" },
        { type: "add", lineNew: 10, content: "   sans le consentement explicite des parties concernées." },
        { type: "context", lineOld: 8, lineNew: 11, content: "" },
        { type: "context", lineOld: 9, lineNew: 12, content: "## Section 2 — Droit à la portabilité" },
        { type: "context", lineOld: 10, lineNew: 13, content: "" },
        { type: "remove", lineOld: 11, content: "1. Les données personnelles sont portables." },
        { type: "add", lineNew: 14, content: "1. Tout citoyen peut exporter l'intégralité de ses données" },
        { type: "add", lineNew: 15, content: "   personnelles dans un format ouvert et interopérable." },
        { type: "add", lineNew: 16, content: "" },
        { type: "add", lineNew: 17, content: "2. Le droit à la portabilité inclut l'historique complet des" },
        { type: "add", lineNew: 18, content: "   transactions, votes et contributions." },
        { type: "context", lineOld: 12, lineNew: 19, content: "" },
        { type: "context", lineOld: 13, lineNew: 20, content: "## Section 3 — Droit à l'oubli numérique" },
        { type: "context", lineOld: 14, lineNew: 21, content: "" },
        { type: "remove", lineOld: 15, content: "1. Tout citoyen peut demander la suppression de ses données." },
        { type: "add", lineNew: 22, content: "1. Tout citoyen peut exercer son droit à l'oubli numérique," },
        { type: "add", lineNew: 23, content: "   sous réserve des obligations légales de conservation." },
        { type: "add", lineNew: 24, content: "" },
        { type: "add", lineNew: 25, content: "2. Les données supprimées doivent l'être de manière irréversible" },
        { type: "add", lineNew: 26, content: "   et vérifiable cryptographiquement." },
      ],
    },
    {
      filePath: "propositions/portabilite-spec.md",
      type: "add",
      additions: 18,
      deletions: 0,
      lines: [
        { type: "add", lineNew: 1, content: "# Spécification : Portabilité des données" },
        { type: "add", lineNew: 2, content: "" },
        { type: "add", lineNew: 3, content: "## Format d'export" },
        { type: "add", lineNew: 4, content: "" },
        { type: "add", lineNew: 5, content: "Les données exportées utiliseront le format JSON-LD" },
        { type: "add", lineNew: 6, content: "avec le schéma VITA standard v2." },
        { type: "add", lineNew: 7, content: "" },
        { type: "add", lineNew: 8, content: "## Données incluses" },
        { type: "add", lineNew: 9, content: "" },
        { type: "add", lineNew: 10, content: "- Profil utilisateur (anonymisé)" },
        { type: "add", lineNew: 11, content: "- Historique des transactions" },
        { type: "add", lineNew: 12, content: "- Historique des votes" },
        { type: "add", lineNew: 13, content: "- Contributions aux projets" },
        { type: "add", lineNew: 14, content: "- Paramètres de délégation" },
      ],
    },
  ],
  "mr-3": [
    {
      filePath: "src/delegation/transitive.ts",
      type: "add",
      additions: 45,
      deletions: 0,
      lines: [
        { type: "add", lineNew: 1, content: "/**" },
        { type: "add", lineNew: 2, content: " * Délégation transitive du vote" },
        { type: "add", lineNew: 3, content: " * Permet à un délégué de re-déléguer" },
        { type: "add", lineNew: 4, content: " */" },
        { type: "add", lineNew: 5, content: "" },
        { type: "add", lineNew: 6, content: "export interface DelegationChain {" },
        { type: "add", lineNew: 7, content: "  from: string;       // ID du citoyen" },
        { type: "add", lineNew: 8, content: "  to: string;         // ID du délégué" },
        { type: "add", lineNew: 9, content: "  depth: number;      // Profondeur dans la chaîne" },
        { type: "add", lineNew: 10, content: "  maxDepth: number;   // Profondeur max autorisée" },
        { type: "add", lineNew: 11, content: "  domain?: string;    // Domaine de la délégation" },
        { type: "add", lineNew: 12, content: "  expiresAt?: Date;   // Date d'expiration" },
        { type: "add", lineNew: 13, content: "}" },
        { type: "add", lineNew: 14, content: "" },
        { type: "add", lineNew: 15, content: "const MAX_DELEGATION_DEPTH = 3;" },
        { type: "add", lineNew: 16, content: "" },
        { type: "add", lineNew: 17, content: "export function canDelegate(chain: DelegationChain): boolean {" },
        { type: "add", lineNew: 18, content: "  return chain.depth < chain.maxDepth" },
        { type: "add", lineNew: 19, content: "    && chain.depth < MAX_DELEGATION_DEPTH;" },
        { type: "add", lineNew: 20, content: "}" },
      ],
    },
    {
      filePath: "src/delegation/resolver.ts",
      type: "modify",
      additions: 18,
      deletions: 5,
      lines: [
        { type: "context", lineOld: 1, lineNew: 1, content: "import { Vote, DelegatedVote } from '../types';" },
        { type: "remove", lineOld: 2, content: "import { findDelegate } from './simple';" },
        { type: "add", lineNew: 2, content: "import { findDelegate } from './transitive';" },
        { type: "add", lineNew: 3, content: "import { DelegationChain, canDelegate } from './transitive';" },
        { type: "context", lineOld: 3, lineNew: 4, content: "" },
        { type: "remove", lineOld: 4, content: "export function resolveVote(userId: string): Vote {" },
        { type: "remove", lineOld: 5, content: "  const delegate = findDelegate(userId);" },
        { type: "remove", lineOld: 6, content: "  if (!delegate) return getUserVote(userId);" },
        { type: "add", lineNew: 5, content: "export function resolveVote(userId: string, domain?: string): Vote {" },
        { type: "add", lineNew: 6, content: "  const chain = buildDelegationChain(userId, domain);" },
        { type: "add", lineNew: 7, content: "  if (!chain || !canDelegate(chain)) {" },
        { type: "add", lineNew: 8, content: "    return getUserVote(userId);" },
        { type: "add", lineNew: 9, content: "  }" },
        { type: "context", lineOld: 7, lineNew: 10, content: "" },
        { type: "remove", lineOld: 8, content: "  return { ...getUserVote(delegate.id), delegated: true };" },
        { type: "add", lineNew: 11, content: "  const finalDelegate = resolveChain(chain);" },
        { type: "add", lineNew: 12, content: "  return {" },
        { type: "add", lineNew: 13, content: "    ...getUserVote(finalDelegate.id)," },
        { type: "add", lineNew: 14, content: "    delegated: true," },
        { type: "add", lineNew: 15, content: "    delegationDepth: chain.depth," },
        { type: "add", lineNew: 16, content: "  };" },
        { type: "context", lineOld: 9, lineNew: 17, content: "}" },
      ],
    },
  ],
};

// ============================================================
// MERGE REQUESTS
// ============================================================

export const FORGE_MERGE_REQUESTS: ForgeMergeRequest[] = [
  {
    id: "mr-1",
    number: 42,
    title: "Ajout article 47 sur l'IA éthique",
    description: `## Résumé

Cette merge request ajoute un nouvel article à la constitution VITA traitant de l'éthique de l'intelligence artificielle.

## Changements proposés

- **Article 47** : Définit les principes fondamentaux de l'utilisation de l'IA
- **Transparence algorithmique** : Obligation de rendre les algorithmes auditables
- **Droit à l'explication** : Les citoyens peuvent demander une explication de toute décision automatisée

## Justification

L'essor de l'IA dans les processus décisionnels nécessite un cadre constitutionnel clair pour protéger les droits des citoyens.`,
    project: "Constitution v3.0",
    projectId: "constitution-v3",
    author: "Marie Dupont",
    authorInitials: "MD",
    sourceBranch: "feature/ai-ethics",
    targetBranch: "main",
    status: "voting",
    votes: { approve: 12, reject: 2, abstain: 3 },
    totalVotes: 17,
    quorum: 25,
    requiredMajority: 66,
    hasConflicts: false,
    additions: 44,
    deletions: 1,
    filesChanged: 2,
    comments: [
      {
        id: "c1",
        author: "Jean Martin",
        authorInitials: "JM",
        content: "Excellent travail ! La section sur la transparence algorithmique est particulièrement bien rédigée. Je suggère d'ajouter une mention explicite sur les sanctions en cas de non-respect.",
        date: "il y a 2h",
      },
      {
        id: "c2",
        author: "Sophie Chen",
        authorInitials: "SC",
        content: "Je suis d'accord avec Jean. Il faudrait aussi préciser la notion de « décision automatisée » — est-ce que les recommandations entrent dans cette catégorie ?",
        date: "il y a 1h",
        replyTo: "c1",
      },
      {
        id: "c3",
        author: "Marie Dupont",
        authorInitials: "MD",
        content: "Bons points tous les deux. Je prépare un commit pour clarifier ces aspects. Pour la question de Sophie : je propose de définir qu'une « décision automatisée » est toute action sans intervention humaine ayant un impact juridique ou économique sur un citoyen.",
        date: "il y a 45min",
        replyTo: "c2",
      },
      {
        id: "c4",
        author: "Alex Rivera",
        authorInitials: "AR",
        content: "Suggestion sur la section 2 ligne 17 : remplacer « auditable par tout citoyen » par « auditable publiquement » pour plus de clarté.",
        date: "il y a 30min",
        filePath: "articles/article-47-ia-ethique.md",
        lineRef: 17,
      },
    ],
    created: "il y a 3h",
    createdIso: "2025-01-15T10:30:00Z",
    updated: "il y a 30min",
  },
  {
    id: "mr-2",
    number: 41,
    title: "Mise à jour droits numériques (article 12)",
    description: `## Résumé

Révision complète de l'article 12 sur les droits numériques, avec ajout du droit à la portabilité et clarification du droit à l'oubli.

## Changements

- Reformulation plus précise des droits existants
- Ajout du droit à la portabilité des données
- Clarification du droit à l'oubli numérique avec conditions
- Spécification technique du format d'export

## Impact

Ces changements renforcent les protections des citoyens et alignent la constitution avec les meilleures pratiques internationales.`,
    project: "Constitution v3.0",
    projectId: "constitution-v3",
    author: "Jean Martin",
    authorInitials: "JM",
    sourceBranch: "feature/digital-rights",
    targetBranch: "main",
    status: "open",
    votes: { approve: 8, reject: 1, abstain: 0 },
    totalVotes: 9,
    quorum: 25,
    requiredMajority: 66,
    hasConflicts: false,
    additions: 42,
    deletions: 8,
    filesChanged: 2,
    comments: [
      {
        id: "c5",
        author: "Fatima Benali",
        authorInitials: "FB",
        content: "Le format JSON-LD est un bon choix pour la portabilité. Est-ce qu'on a envisagé aussi le format W3C Verifiable Credentials ?",
        date: "il y a 5h",
      },
      {
        id: "c6",
        author: "Jean Martin",
        authorInitials: "JM",
        content: "C'est une bonne idée. Je vais ajouter une note dans la spec pour mentionner cette option comme alternative future.",
        date: "il y a 4h",
        replyTo: "c5",
      },
    ],
    created: "il y a 1j",
    createdIso: "2025-01-14T11:00:00Z",
    updated: "il y a 4h",
  },
  {
    id: "mr-3",
    number: 38,
    title: "Feature: Délégation transitive du vote",
    description: `## Résumé

Implémentation de la délégation transitive : un délégué peut à son tour déléguer les votes qui lui ont été confiés, avec une limite de profondeur configurable.

## Détails techniques

- Nouvelle structure \`DelegationChain\` pour modéliser les chaînes
- Profondeur max par défaut : 3 niveaux
- Résolution automatique de la chaîne au moment du vote
- Tests unitaires couvrant les cas limites`,
    project: "Système de Vote v2",
    projectId: "voting-system",
    author: "Sophie Chen",
    authorInitials: "SC",
    sourceBranch: "feature/delegation-progressive",
    targetBranch: "main",
    status: "approved",
    votes: { approve: 15, reject: 1, abstain: 2 },
    totalVotes: 18,
    quorum: 20,
    requiredMajority: 66,
    hasConflicts: false,
    additions: 63,
    deletions: 5,
    filesChanged: 2,
    comments: [
      {
        id: "c7",
        author: "Alex Rivera",
        authorInitials: "AR",
        content: "La limite de profondeur à 3 me semble raisonnable. Très bonne implémentation.",
        date: "il y a 1j",
      },
    ],
    created: "il y a 2j",
    createdIso: "2025-01-13T14:00:00Z",
    updated: "il y a 1j",
  },
];

// ============================================================
// FILE TREES (per project)
// ============================================================

export const FORGE_FILE_TREES: Record<string, { name: string; type: "file" | "dir"; size?: string; items?: number }[]> = {
  "constitution-v3": [
    { name: "README.md", type: "file", size: "2.4 KB" },
    { name: "CONTRIBUTING.md", type: "file", size: "1.8 KB" },
    { name: "articles/", type: "dir", items: 47 },
    { name: "propositions/", type: "dir", items: 12 },
    { name: "LICENSE", type: "file", size: "1.1 KB" },
  ],
  "voting-system": [
    { name: "README.md", type: "file", size: "3.1 KB" },
    { name: "CONTRIBUTING.md", type: "file", size: "1.2 KB" },
    { name: "src/", type: "dir", items: 24 },
    { name: "tests/", type: "dir", items: 18 },
    { name: "docs/", type: "dir", items: 6 },
    { name: "package.json", type: "file", size: "0.8 KB" },
    { name: "tsconfig.json", type: "file", size: "0.4 KB" },
    { name: "LICENSE", type: "file", size: "1.1 KB" },
  ],
};

// ============================================================
// HELPERS
// ============================================================

export function getProject(id: string): ForgeProject | undefined {
  return FORGE_PROJECTS.find((p) => p.id === id);
}

export function getBranches(projectId: string): ForgeBranch[] {
  return FORGE_BRANCHES[projectId] ?? [];
}

export function getBranch(branchId: string): ForgeBranch | undefined {
  for (const branches of Object.values(FORGE_BRANCHES)) {
    const found = branches.find((b) => b.id === branchId);
    if (found) return found;
  }
  return undefined;
}

export function getCommits(branchId: string): ForgeCommit[] {
  return FORGE_COMMITS[branchId] ?? [];
}

export function getMergeRequestsForProject(projectId: string): ForgeMergeRequest[] {
  return FORGE_MERGE_REQUESTS.filter((mr) => mr.projectId === projectId);
}

export function getMergeRequest(mrId: string): ForgeMergeRequest | undefined {
  return FORGE_MERGE_REQUESTS.find((mr) => mr.id === mrId);
}

export function getDiffs(mrId: string): ForgeDiffFile[] {
  return FORGE_DIFFS[mrId] ?? [];
}

export function getFileTree(projectId: string) {
  return FORGE_FILE_TREES[projectId] ?? [];
}

export const LANGUAGE_COLORS: Record<string, string> = {
  Markdown: "text-cyan-500",
  Python: "text-blue-500",
  TypeScript: "text-violet-500",
  React: "text-cyan-500",
  Rust: "text-orange-500",
};
