import type { SearchResult, SearchResultType } from "@/types/search";
import {
  ALL_PROPOSALS,
  MOCK_DOLEANCES,
  MOCK_ARCHIVES,
} from "@/lib/mockProposals";
import { TECHNICAL_DOCS, REGISTER_ENTRIES } from "@/lib/mockCodex";
import { SYSTEM_PARAMETERS } from "@/lib/mockParameters";
import { ADMIN_USERS } from "@/lib/mockAdmin";
import {
  FORGE_PROJECTS,
  ALL_DEMANDES_INTEGRATION,
  ALL_REVISIONS,
} from "@/lib/mockForge";

// ============================================================
// NORMALIZE — remove accents, lowercase
// ============================================================

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ============================================================
// STATIC PAGES — always present for quick navigation
// ============================================================

const PAGE_RESULTS: SearchResult[] = [
  {
    id: "page-panorama",
    type: "page",
    titre: "Panorama",
    description: "Tableau de bord global",
    lien: "/panorama",
    icone: "BarChart3",
    couleur: "#8b5cf6",
    score: 0,
  },
  {
    id: "page-agora",
    type: "page",
    titre: "Agora",
    description: "Espace democratique",
    lien: "/agora",
    icone: "Vote",
    couleur: "#f59e0b",
    score: 0,
  },
  {
    id: "page-codex",
    type: "page",
    titre: "Codex",
    description: "Constitution et documentation",
    lien: "/codex",
    icone: "BookOpen",
    couleur: "#3b82f6",
    score: 0,
  },
  {
    id: "page-forge",
    type: "page",
    titre: "Forge",
    description: "Redaction collaborative",
    lien: "/forge",
    icone: "Hammer",
    couleur: "#ec4899",
    score: 0,
  },
  {
    id: "page-civis",
    type: "page",
    titre: "Civis",
    description: "Mon profil",
    lien: "/civis",
    icone: "User",
    couleur: "#10b981",
    score: 0,
  },
  {
    id: "page-bourse",
    type: "page",
    titre: "Bourse",
    description: "Portefeuille VITA",
    lien: "/bourse",
    icone: "Wallet",
    couleur: "#06b6d4",
    score: 0,
  },
  {
    id: "page-calculateur",
    type: "page",
    titre: "Calculateur de valorisation",
    description: "Calculer le prix d'un service",
    lien: "/bourse/calculateur",
    icone: "Calculator",
    couleur: "#06b6d4",
    score: 0,
  },
  {
    id: "page-notifications",
    type: "page",
    titre: "Notifications",
    description: "Centre de notifications",
    lien: "/notifications",
    icone: "Bell",
    couleur: "#f59e0b",
    score: 0,
  },
  {
    id: "page-parametres",
    type: "page",
    titre: "Parametres",
    description: "Parametres du compte",
    lien: "/parametres",
    icone: "Settings",
    couleur: "#64748b",
    score: 0,
  },
  {
    id: "page-administration",
    type: "page",
    titre: "Administration",
    description: "Panneau d'administration",
    lien: "/administration",
    icone: "Shield",
    couleur: "#ef4444",
    score: 0,
  },
];

// ============================================================
// BUILD INDEX — lazy singleton
// ============================================================

let cachedIndex: SearchResult[] | null = null;

function buildIndex(): SearchResult[] {
  if (cachedIndex) return cachedIndex;

  const index: SearchResult[] = [...PAGE_RESULTS];

  // --- Propositions (active + archives) ---
  for (const p of ALL_PROPOSALS) {
    index.push({
      id: `prop-${p.id}`,
      type: "proposition",
      titre: p.title,
      description: p.description,
      lien: `/agora/${p.id}`,
      icone: "FileText",
      couleur: "#8b5cf6",
      metadata: {
        statut: p.statusLabel,
        auteur: `@${p.author.name}`,
        date: p.date,
        badge: p.domain,
      },
      score: 0,
    });
  }

  for (const a of MOCK_ARCHIVES) {
    index.push({
      id: `arch-${a.id}`,
      type: "proposition",
      titre: a.title,
      description: a.description,
      lien: `/agora/archives`,
      icone: "Archive",
      couleur: a.resultat === "adopte" ? "#10b981" : "#ef4444",
      metadata: {
        statut: a.resultat === "adopte" ? "Adopte" : "Rejete",
        date: a.dateFin,
        badge: a.domain,
      },
      score: 0,
    });
  }

  // --- Doleances ---
  for (const d of MOCK_DOLEANCES) {
    index.push({
      id: `dol-${d.id}`,
      type: "doleance",
      titre: d.titre,
      description: d.description,
      lien: `/agora/grievances`,
      icone: "Scroll",
      couleur: "#f59e0b",
      metadata: {
        statut: d.statut === "ouverte" ? "Ouverte" : d.statut === "seuil_atteint" ? "Seuil atteint" : d.statut === "convertie" ? "Convertie" : "Fermee",
        auteur: `@${d.auteur.username}`,
        date: d.dateCreation,
      },
      score: 0,
    });
  }

  // --- Citoyens ---
  for (const u of ADMIN_USERS) {
    index.push({
      id: `user-${u.id}`,
      type: "citoyen",
      titre: `${u.prenom} ${u.nom}`,
      description: `@${u.username} · ${u.pays} · ${u.role}`,
      lien: `/civis`,
      icone: "User",
      couleur: "#10b981",
      metadata: {
        statut: u.statut === "actif" ? "Actif" : u.statut === "suspendu" ? "Suspendu" : "En attente",
        auteur: `@${u.username}`,
        date: u.dateInscription,
      },
      score: 0,
    });
  }

  // --- Parametres systeme ---
  for (const p of SYSTEM_PARAMETERS) {
    index.push({
      id: `param-${p.id}`,
      type: "parametre",
      titre: p.name,
      description: p.description,
      lien: `/codex/parametres-systeme/${p.id}`,
      icone: "SlidersHorizontal",
      couleur: p.category === "immuable" ? "#ef4444" : p.category === "gouvernance" ? "#8b5cf6" : "#06b6d4",
      metadata: {
        statut: p.category === "immuable" ? "Immuable" : p.category === "gouvernance" ? "Gouvernance" : "Technique",
        badge: p.unit || undefined,
      },
      score: 0,
    });
  }

  // --- Documentation technique ---
  for (const doc of TECHNICAL_DOCS) {
    index.push({
      id: `doc-${doc.id}`,
      type: "documentation",
      titre: doc.title,
      description: doc.sections.map((s) => s.title).join(" · "),
      lien: `/codex/technique/${doc.slug}`,
      icone: "BookOpen",
      couleur: "#3b82f6",
      metadata: {
        date: doc.lastUpdated,
        badge: `v${doc.version}`,
      },
      score: 0,
    });
  }

  // --- Registre des changements ---
  for (const entry of REGISTER_ENTRIES) {
    index.push({
      id: `reg-${entry.id}`,
      type: "documentation",
      titre: entry.title,
      description: entry.description,
      lien: `/codex/registre`,
      icone: "History",
      couleur: "#3b82f6",
      metadata: {
        statut: entry.status === "adopted" ? "Adopte" : entry.status === "applied" ? "Applique" : entry.status === "rejected" ? "Rejete" : "Propose",
        date: entry.date,
        auteur: entry.author,
      },
      score: 0,
    });
  }

  // --- Projets Forge ---
  for (const proj of FORGE_PROJECTS) {
    index.push({
      id: `proj-${proj.id}`,
      type: "revision",
      titre: proj.name,
      description: proj.description,
      lien: `/forge/project/${proj.id}`,
      icone: "GitBranch",
      couleur: "#ec4899",
      metadata: {
        statut: proj.status === "active" ? "Actif" : proj.status === "archived" ? "Archive" : "Brouillon",
        date: proj.lastUpdate,
      },
      score: 0,
    });
  }

  // --- Demandes d'integration (merge requests) ---
  for (const di of ALL_DEMANDES_INTEGRATION) {
    index.push({
      id: `di-${di.id}`,
      type: "demande_integration",
      titre: `#${di.number} ${di.title}`,
      description: di.description,
      lien: `/forge/project/${di.project}/mr/${di.id}`,
      icone: "GitMerge",
      couleur: di.status === "open" ? "#10b981" : di.status === "integrated" ? "#8b5cf6" : "#ef4444",
      metadata: {
        statut: di.status === "open" ? "Ouverte" : di.status === "integrated" ? "Integree" : di.status === "approved" ? "Approuvee" : di.status === "voting" ? "En vote" : "Fermee",
        auteur: di.author,
        date: di.created,
      },
      score: 0,
    });
  }

  // --- Revisions (commits) — only index recent ones ---
  for (const rev of ALL_REVISIONS.slice(0, 20)) {
    index.push({
      id: `rev-${rev.ref}`,
      type: "revision",
      titre: rev.message,
      description: `${rev.ref.slice(0, 7)} · ${rev.author} · ${rev.additions}+ ${rev.deletions}-`,
      lien: `/forge/commits`,
      icone: "GitCommit",
      couleur: "#ec4899",
      metadata: {
        auteur: rev.author,
        date: rev.date,
      },
      score: 0,
    });
  }

  cachedIndex = index;
  return index;
}

// ============================================================
// SEARCH FUNCTION
// ============================================================

export function search(
  query: string,
  filters?: SearchResultType[]
): SearchResult[] {
  const index = buildIndex();
  const q = normalize(query.trim());

  if (!q) return [];

  const scored: SearchResult[] = [];

  for (const item of index) {
    if (filters && filters.length > 0 && !filters.includes(item.type)) {
      continue;
    }

    let score = 0;
    const titreNorm = normalize(item.titre);
    const descNorm = item.description ? normalize(item.description) : "";
    const auteurNorm = item.metadata?.auteur
      ? normalize(item.metadata.auteur)
      : "";

    // Exact title match
    if (titreNorm === q) {
      score = 100;
    } else if (titreNorm.startsWith(q)) {
      score = 85;
    } else if (titreNorm.includes(q)) {
      score = 70;
    }

    // Description match
    if (score === 0 && descNorm.includes(q)) {
      score = 40;
    }

    // Author match
    if (score === 0 && auteurNorm.includes(q)) {
      score = 35;
    }

    // Boost for description match on top of title match
    if (score >= 70 && descNorm.includes(q)) {
      score += 10;
    }

    // Pages get a small boost for navigation convenience
    if (item.type === "page" && score > 0) {
      score += 5;
    }

    if (score > 0) {
      scored.push({ ...item, score });
    }
  }

  // Sort by score descending, then alphabetically by title
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.titre.localeCompare(b.titre);
  });

  return scored.slice(0, 20);
}

// ============================================================
// QUICK ACCESS — pages for empty-state display
// ============================================================

export function getQuickAccessPages(): SearchResult[] {
  return PAGE_RESULTS.slice(0, 6);
}
