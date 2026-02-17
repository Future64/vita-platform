import type { StoredUser } from "@/types/auth";

// Mot de passe par defaut pour tous les mocks : "vita2025"
// Hash simplifie (localStorage only, pas de vrai hashing cote client)
const DEFAULT_PASSWORD_HASH = "vita2025";

function defaultPreferences() {
  return {
    theme: 'dark' as const,
    langue: 'fr',
    notifications: {
      email: true,
      push: true,
      propositions: true,
      votes: true,
      transactions: true,
      systeme: true,
    },
    confidentialite: {
      profilPublic: true,
      afficherSolde: false,
      afficherActivite: true,
      afficherReputation: true,
    },
    accessibilite: {
      tailleTexte: 'normal' as const,
      contraste: 'normal' as const,
      animationsReduites: false,
    },
  };
}

export const MOCK_USERS: StoredUser[] = [
  {
    id: "usr-001-dieu",
    prenom: "Maxim",
    nom: "Dassonneville",
    username: "maxim",
    email: "maxim@vita.world",
    passwordHash: DEFAULT_PASSWORD_HASH,
    dateNaissance: "1995-03-15",
    pays: "France",
    role: "dieu",
    bio: "Fondateur de VITA. Architecte du systeme de gouvernance mondiale.",
    dateInscription: "2025-01-01",
    profession: "Architecte systeme",
    centresInteret: ["gouvernance", "economie", "technologie", "philosophie"],
    langues: ["fr", "en"],
    reseauxSociaux: { github: "maximd" },
    preferences: defaultPreferences(),
    soldeVita: 420,
    joursActifs: 420,
    propositionsCreees: 12,
    votesEffectues: 48,
    scoreReputation: 98,
  },
  {
    id: "usr-002-citoyen",
    prenom: "Amina",
    nom: "Benali",
    username: "amina.b",
    email: "amina@vita.world",
    passwordHash: DEFAULT_PASSWORD_HASH,
    dateNaissance: "1990-07-22",
    pays: "Maroc",
    role: "citoyen",
    bio: "Enseignante et citoyenne engagee. Convaincue par la democratie directe.",
    dateInscription: "2025-02-10",
    profession: "Enseignante",
    centresInteret: ["education", "social", "culture"],
    langues: ["fr", "ar", "en"],
    preferences: defaultPreferences(),
    soldeVita: 310,
    joursActifs: 310,
    propositionsCreees: 5,
    votesEffectues: 32,
    scoreReputation: 85,
  },
  {
    id: "usr-003-moderateur",
    prenom: "Lucas",
    nom: "Durand",
    username: "lucas.d",
    email: "lucas@vita.world",
    passwordHash: DEFAULT_PASSWORD_HASH,
    dateNaissance: "1988-11-03",
    pays: "Belgique",
    role: "moderateur",
    bio: "Moderateur communautaire. Gardien du debat constructif.",
    dateInscription: "2025-01-20",
    profession: "Juriste",
    centresInteret: ["droit", "gouvernance", "ethique"],
    langues: ["fr", "nl", "en"],
    preferences: defaultPreferences(),
    soldeVita: 380,
    joursActifs: 380,
    propositionsCreees: 8,
    votesEffectues: 41,
    scoreReputation: 92,
  },
  {
    id: "usr-004-nouveau",
    prenom: "Sakura",
    nom: "Tanaka",
    username: "sakura.t",
    email: "sakura@vita.world",
    passwordHash: DEFAULT_PASSWORD_HASH,
    dateNaissance: "2000-04-18",
    pays: "Japon",
    role: "nouveau",
    bio: "Etudiante en sciences politiques. Decouvre VITA.",
    dateInscription: "2025-12-01",
    profession: "Etudiante",
    centresInteret: ["politique", "technologie", "environnement"],
    langues: ["ja", "en", "fr"],
    preferences: defaultPreferences(),
    soldeVita: 15,
    joursActifs: 15,
    propositionsCreees: 0,
    votesEffectues: 0,
    scoreReputation: 10,
  },
  {
    id: "usr-005-auditeur",
    prenom: "Jean-Pierre",
    nom: "Moreau",
    username: "jp.moreau",
    email: "jpmoreau@vita.world",
    passwordHash: DEFAULT_PASSWORD_HASH,
    dateNaissance: "1975-09-12",
    pays: "Suisse",
    role: "auditeur",
    bio: "Expert-comptable. Auditeur independant du systeme VITA.",
    dateInscription: "2025-03-05",
    profession: "Expert-comptable",
    centresInteret: ["finance", "audit", "transparence"],
    langues: ["fr", "de", "en"],
    preferences: defaultPreferences(),
    soldeVita: 290,
    joursActifs: 290,
    propositionsCreees: 2,
    votesEffectues: 18,
    scoreReputation: 88,
  },
];

// Seed localStorage si vide
export function seedMockUsers(): void {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem("vita_users");
  if (!existing) {
    localStorage.setItem("vita_users", JSON.stringify(MOCK_USERS));
  }
}
