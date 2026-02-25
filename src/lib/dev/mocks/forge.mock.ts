import type { ForgeProject, ForgeProjectDetail, ForgeCommit, ForgeMergeRequest, ForgeMergeRequestDetail, ForgeContributor } from "@/lib/vita-api";

export const forgeProjects: ForgeProject[] = [
  {
    id: "proj-1",
    title: "Revision Article 5 — Unite de compte",
    description: "Clarifier les regles de l'unite de compte et les cas limites.",
    codex_ref: 5,
    default_branch: "branch-main-1",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    branch_count: 3,
    mr_count: 1,
    contributor_count: 4,
  },
  {
    id: "proj-2",
    title: "Proposition : Credit mutualise",
    description: "Definir les modalites du credit sans interet entre Citoyens VITA.",
    codex_ref: null,
    default_branch: "branch-main-2",
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    branch_count: 2,
    mr_count: 2,
    contributor_count: 7,
  },
  {
    id: "proj-3",
    title: "Reglement interieur de l'Agora",
    description: "Formaliser les procedures de deliberation et les delais de vote.",
    codex_ref: null,
    default_branch: "branch-main-3",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    branch_count: 1,
    mr_count: 0,
    contributor_count: 2,
  },
];

export const forgeProjectDetail: ForgeProjectDetail = {
  project: forgeProjects[0],
  branches: [
    {
      id: "branch-main-1",
      project_id: "proj-1",
      name: "main",
      is_default: true,
      head_commit_id: "commit-main-5",
      created_by: "u1",
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: "branch-2",
      project_id: "proj-1",
      name: "proposition/alice/clarifier-seuils",
      is_default: false,
      head_commit_id: "commit-3",
      created_by: "u1",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: "branch-3",
      project_id: "proj-1",
      name: "proposition/bob/ajout-perimetre",
      is_default: false,
      head_commit_id: "commit-bob-1",
      created_by: "u2",
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ],
};

export const forgeBranchCommits: ForgeCommit[] = [
  {
    id: "commit-3",
    branch_id: "branch-2",
    author_id: "u1",
    message: "Ajout limite transitivite 3 niveaux",
    content: "Article 5 — Unite de compte\n\nLe VITA (symbole Ѵ) est l'unite de compte du systeme.\n\n1 Ѵ = 1 journee d'existence verifiee.\n\nLa transitivite est limitee a 3 niveaux maximum.",
    parent_id: "commit-2",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    author_name: "alice",
  },
  {
    id: "commit-2",
    branch_id: "branch-2",
    author_id: "u1",
    message: "Correction suite retours de bob",
    content: "Article 5 — Unite de compte\n\nLe VITA (symbole Ѵ) est l'unite de compte du systeme.\n\n1 Ѵ = 1 journee d'existence verifiee.",
    parent_id: "commit-1",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    author_name: "alice",
  },
  {
    id: "commit-1",
    branch_id: "branch-2",
    author_id: "u1",
    message: "Redaction initiale de la proposition",
    content: "Article 5 — Unite de compte\n\nLe VITA est l'unite de compte du systeme.",
    parent_id: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    author_name: "alice",
  },
];

export const forgeProjectMRs: ForgeMergeRequest[] = [
  {
    id: "mr-1",
    project_id: "proj-1",
    source_branch_id: "branch-2",
    target_branch_id: "branch-main-1",
    title: "Clarifier les seuils et la transitivite",
    description: "Limiter la transitivite a 3 niveaux max et preciser les cas de suspension.",
    author_id: "u1",
    status: "open",
    votes_for: 14,
    votes_against: 3,
    merged_by: null,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    author_name: "alice",
    source_branch_name: "proposition/alice/clarifier-seuils",
    target_branch_name: "main",
  },
];

export const forgeMRDetail: ForgeMergeRequestDetail = {
  merge_request: forgeProjectMRs[0],
  source_content: "Article 5 — Unite de compte\n\nLe VITA (symbole Ѵ) est l'unite de compte du systeme.\n\n1 Ѵ = 1 journee d'existence verifiee.\n\nLa transitivite est limitee a 3 niveaux maximum.",
  target_content: "Article 5 — Unite de compte\n\nLe VITA (symbole Ѵ) est l'unite de compte du systeme.\n\n1 Ѵ = 1 journee d'existence verifiee.",
  comments: [
    {
      id: "c1",
      merge_request_id: "mr-1",
      author_id: "u2",
      content: "Tres bien, mais je suggere de preciser '3 niveaux directs' pour eviter toute ambiguite.",
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      author_name: "bob",
    },
    {
      id: "c2",
      merge_request_id: "mr-1",
      author_id: "u1",
      content: "Bonne remarque, je vais reformuler.",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      author_name: "alice",
    },
    {
      id: "c3",
      merge_request_id: "mr-1",
      author_id: "u3",
      content: "Je suis favorable a cette modification. La transitivite illimitee creait des problemes de legitimite.",
      created_at: new Date(Date.now() - 43200000).toISOString(),
      author_name: "claire",
    },
  ],
};

export const forgeProjectContributors: ForgeContributor[] = [
  { author_id: "u1", project_id: "proj-1", display_name: "alice", commit_count: 8, mr_count: 1, last_active: new Date(Date.now() - 3600000).toISOString() },
  { author_id: "u2", project_id: "proj-1", display_name: "bob", commit_count: 3, mr_count: 1, last_active: new Date(Date.now() - 7200000).toISOString() },
  { author_id: "u3", project_id: "proj-1", display_name: "claire", commit_count: 2, mr_count: 0, last_active: new Date(Date.now() - 86400000).toISOString() },
  { author_id: "u4", project_id: "proj-1", display_name: "david", commit_count: 1, mr_count: 0, last_active: new Date(Date.now() - 2 * 86400000).toISOString() },
];
