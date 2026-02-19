import type { StoredUser, IdentiteVerifiee, IdentitePublique, IdentiteProfessionnelle, UserPreferences } from "@/types/auth";
import { buildUserFromIdentity } from "@/types/auth";

// Mot de passe par defaut pour tous les mocks : "vita2025"
const DEFAULT_PASSWORD_HASH = "vita2025";

function defaultPreferences(): UserPreferences {
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

// --- Identites verifiees ---

const identiteMaxim: IdentiteVerifiee = {
  nomLegal: 'Dassonneville',
  prenomLegal: 'Maxim',
  dateNaissance: '1995-03-15',
  nationalite: 'Francaise',
  paysResidence: 'France',
  statut: 'verifie',
  dateVerification: '2025-01-01T00:00:00Z',
  dateExpiration: '2026-01-01T00:00:00Z',
  methodeVerification: 'zkp',
  niveauConfiance: 100,
  historiqueVerifications: [
    { date: '2025-01-01', methode: 'Zero-Knowledge Proof (fondateur)', statut: 'accepte' },
  ],
};

const identiteAmina: IdentiteVerifiee = {
  nomLegal: 'Benali',
  prenomLegal: 'Amina',
  dateNaissance: '1990-07-22',
  nationalite: 'Marocaine',
  paysResidence: 'Maroc',
  statut: 'verifie',
  dateVerification: '2025-12-15T10:30:00Z',
  dateExpiration: '2026-12-15T10:30:00Z',
  methodeVerification: 'parrainage',
  parrains: [
    { username: 'maxim', dateAttestation: '2025-12-14' },
    { username: 'lucas.d', dateAttestation: '2025-12-15' },
    { username: 'jp.moreau', dateAttestation: '2025-12-15' },
  ],
  niveauConfiance: 85,
  historiqueVerifications: [
    { date: '2025-12-15', methode: 'Parrainage (3/3)', statut: 'accepte' },
  ],
};

const identiteLucas: IdentiteVerifiee = {
  nomLegal: 'Durand',
  prenomLegal: 'Lucas',
  dateNaissance: '1988-11-03',
  nationalite: 'Belge',
  paysResidence: 'Belgique',
  statut: 'verifie',
  dateVerification: '2025-02-20T14:00:00Z',
  dateExpiration: '2026-02-20T14:00:00Z',
  methodeVerification: 'parrainage',
  parrains: [
    { username: 'maxim', dateAttestation: '2025-02-19' },
    { username: 'amina.b', dateAttestation: '2025-02-20' },
    { username: 'jp.moreau', dateAttestation: '2025-02-20' },
  ],
  niveauConfiance: 90,
  historiqueVerifications: [
    { date: '2025-02-20', methode: 'Parrainage (3/3)', statut: 'accepte' },
  ],
};

const identiteSakura: IdentiteVerifiee = {
  nomLegal: 'Tanaka',
  prenomLegal: 'Sakura',
  dateNaissance: '2000-04-18',
  nationalite: 'Japonaise',
  paysResidence: 'Japon',
  statut: 'en_cours',
  methodeVerification: 'parrainage',
  parrains: [
    { username: 'amina.b', dateAttestation: '2025-12-02' },
  ],
  niveauConfiance: 20,
  historiqueVerifications: [],
};

const identiteAlex: IdentiteVerifiee = {
  nomLegal: 'Martin',
  prenomLegal: 'Alexandre',
  dateNaissance: '1998-06-25',
  nationalite: 'Francaise',
  paysResidence: 'France',
  statut: 'non_verifie',
  niveauConfiance: 0,
  historiqueVerifications: [],
};

const identiteFatou: IdentiteVerifiee = {
  nomLegal: 'Diop',
  prenomLegal: 'Fatou',
  dateNaissance: '1993-02-14',
  nationalite: 'Senegalaise',
  paysResidence: 'Senegal',
  statut: 'en_cours',
  methodeVerification: 'parrainage',
  parrains: [
    { username: 'maxim', dateAttestation: '2026-02-10' },
    { username: 'amina.b', dateAttestation: '2026-02-12' },
  ],
  niveauConfiance: 55,
  historiqueVerifications: [],
};

const identiteAncien: IdentiteVerifiee = {
  nomLegal: 'Lefevre',
  prenomLegal: 'Pierre',
  dateNaissance: '1982-11-30',
  nationalite: 'Francaise',
  paysResidence: 'France',
  statut: 'expire',
  dateVerification: '2025-01-15T10:00:00Z',
  dateExpiration: '2026-01-15T10:00:00Z',
  methodeVerification: 'parrainage',
  parrains: [
    { username: 'maxim', dateAttestation: '2025-01-14' },
    { username: 'jp.moreau', dateAttestation: '2025-01-14' },
    { username: 'amina.b', dateAttestation: '2025-01-15' },
  ],
  niveauConfiance: 70,
  historiqueVerifications: [
    { date: '2025-01-15', methode: 'Parrainage (3/3)', statut: 'expire', details: 'Verification expiree le 15/01/2026' },
  ],
};

const identiteJP: IdentiteVerifiee = {
  nomLegal: 'Moreau',
  prenomLegal: 'Jean-Pierre',
  dateNaissance: '1975-09-12',
  nationalite: 'Suisse',
  paysResidence: 'Suisse',
  statut: 'verifie',
  dateVerification: '2025-03-10T09:00:00Z',
  dateExpiration: '2026-03-10T09:00:00Z',
  methodeVerification: 'document',
  niveauConfiance: 92,
  historiqueVerifications: [
    { date: '2025-03-10', methode: 'Document officiel', statut: 'accepte' },
  ],
};

// --- Identites publiques ---

const pubMaxim: IdentitePublique = {
  modeVisibilite: 'complet',
  prenom: 'Maxim',
  nom: 'Dassonneville',
  bio: 'Fondateur de VITA. Architecte du systeme de gouvernance mondiale.',
  paysAffiche: 'France',
  langues: ['Francais', 'Anglais'],
  centresInteret: ['Gouvernance', 'Economie', 'Technologie', 'Philosophie'],
  dateInscriptionVisible: true,
  reseauxSociaux: { github: 'maximd' },
};

const pubAmina: IdentitePublique = {
  modeVisibilite: 'complet',
  prenom: 'Amina',
  nom: 'Benali',
  bio: 'Passionnee par la democratie participative et les systemes economiques alternatifs.',
  paysAffiche: 'Maroc',
  langues: ['Francais', 'Arabe', 'Anglais'],
  centresInteret: ['Education', 'Social', 'Culture', 'Economie'],
  dateInscriptionVisible: true,
  reseauxSociaux: {},
};

const pubLucas: IdentitePublique = {
  modeVisibilite: 'pseudonyme',
  pseudonyme: 'PhoenixBleu',
  bio: 'Moderateur communautaire. Gardien du debat constructif.',
  centresInteret: ['Droit', 'Gouvernance', 'Ethique'],
  dateInscriptionVisible: false,
};

const pubSakura: IdentitePublique = {
  modeVisibilite: 'anonyme',
  dateInscriptionVisible: false,
};

const pubAlex: IdentitePublique = {
  modeVisibilite: 'complet',
  prenom: 'Alexandre',
  nom: 'Martin',
  bio: 'Etudiant en economie. Curieux du projet VITA.',
  paysAffiche: 'France',
  langues: ['Francais', 'Anglais'],
  centresInteret: ['Economie', 'Technologie'],
  dateInscriptionVisible: true,
};

const pubFatou: IdentitePublique = {
  modeVisibilite: 'complet',
  prenom: 'Fatou',
  nom: 'Diop',
  bio: 'Infirmiere passionnee par l\'acces aux soins pour tous.',
  paysAffiche: 'Senegal',
  langues: ['Francais', 'Wolof'],
  centresInteret: ['Sante', 'Social', 'Education'],
  dateInscriptionVisible: true,
};

const pubAncien: IdentitePublique = {
  modeVisibilite: 'complet',
  prenom: 'Pierre',
  nom: 'Lefevre',
  bio: 'Ancien enseignant a la retraite. Citoyen VITA depuis le debut.',
  paysAffiche: 'France',
  langues: ['Francais'],
  centresInteret: ['Education', 'Philosophie', 'Culture'],
  dateInscriptionVisible: true,
};

const pubJP: IdentitePublique = {
  modeVisibilite: 'complet',
  prenom: 'Jean-Pierre',
  nom: 'Moreau',
  bio: 'Expert-comptable. Auditeur independant du systeme VITA.',
  paysAffiche: 'Suisse',
  langues: ['Francais', 'Allemand', 'Anglais'],
  centresInteret: ['Finance', 'Audit', 'Transparence'],
  dateInscriptionVisible: true,
  reseauxSociaux: { linkedin: 'jpmoreau' },
};

// --- Identites professionnelles ---

const proMaxim: IdentiteProfessionnelle = {
  active: true,
  titre: 'Developpeur web full-stack',
  description: 'Conception et developpement d\'applications web modernes. Specialise en React, TypeScript et Rust.',
  secteur: 'Technologie',
  experience: 'Senior (5-10 ans)',
  competences: [
    { nom: 'React / Next.js', niveau: 'expert' },
    { nom: 'TypeScript', niveau: 'avance' },
    { nom: 'Rust', niveau: 'intermediaire' },
    { nom: 'PostgreSQL', niveau: 'avance' },
    { nom: 'UI/UX Design', niveau: 'intermediaire' },
  ],
  certifications: [
    { nom: 'AWS Certified Developer', organisme: 'Amazon Web Services', date: '2024-06', verifie: false },
  ],
  tarifHoraire: 1.8,
  coefficients: { formation: 0.4, penibilite: 0, responsabilite: 0.2, rarete: 0.2 },
  disponibilite: 'disponible',
  zonesIntervention: ['Paris', 'Ile-de-France', 'En ligne'],
  avis: [
    { id: 'a1', auteur: { username: 'amina.b', modeVisibilite: 'complet' }, note: 5, commentaire: 'Excellent travail, tres professionnel et reactif.', date: '2026-02-10', service: 'Developpement site web' },
    { id: 'a2', auteur: { username: 'PhoenixBleu', modeVisibilite: 'pseudonyme' }, note: 4, commentaire: 'Bon travail, quelques retards mais resultat de qualite.', date: '2026-01-28', service: 'Application mobile' },
    { id: 'a3', auteur: { username: 'jp.moreau', modeVisibilite: 'complet' }, note: 5, commentaire: 'Parfait, je recommande vivement.', date: '2026-01-15', service: 'Cours de programmation' },
  ],
  noteMoyenne: 4.7,
  nombreAvis: 3,
  realisations: [
    { titre: 'Plateforme de covoiturage local', description: 'Application web connectant les habitants d\'un quartier pour le covoiturage quotidien.', date: '2025-09' },
    { titre: 'Outil de gestion associative', description: 'Solution complete de gestion pour associations : adherents, comptabilite, evenements.', date: '2025-04' },
  ],
};

const proAmina: IdentiteProfessionnelle = {
  active: true,
  titre: 'Enseignante de francais',
  description: 'Professeure de francais langue etrangere. Cours particuliers et en groupe.',
  secteur: 'Education',
  experience: 'Confirme (3-5 ans)',
  competences: [
    { nom: 'Francais langue etrangere', niveau: 'expert' },
    { nom: 'Pedagogie', niveau: 'avance' },
    { nom: 'Redaction', niveau: 'avance' },
  ],
  tarifHoraire: 1.2,
  coefficients: { formation: 0.2, penibilite: 0, responsabilite: 0, rarete: 0 },
  disponibilite: 'disponible',
  zonesIntervention: ['En ligne', 'Casablanca'],
  avis: [
    { id: 'a4', auteur: { username: 'maxim', modeVisibilite: 'complet' }, note: 5, commentaire: 'Excellente pedagogie, tres patiente.', date: '2026-01-20', service: 'Cours de francais' },
  ],
  noteMoyenne: 5,
  nombreAvis: 1,
  realisations: [],
};

const proLucas: IdentiteProfessionnelle = {
  active: false,
  disponibilite: 'indisponible',
};

const proSakura: IdentiteProfessionnelle = {
  active: false,
  disponibilite: 'indisponible',
};

const proAlex: IdentiteProfessionnelle = {
  active: false,
  disponibilite: 'indisponible',
};

const proFatou: IdentiteProfessionnelle = {
  active: true,
  titre: 'Infirmiere',
  description: 'Soins infirmiers a domicile. Specialisee en soins palliatifs.',
  secteur: 'Sante',
  experience: 'Confirme (3-5 ans)',
  competences: [
    { nom: 'Soins infirmiers', niveau: 'expert' },
    { nom: 'Premiers secours', niveau: 'expert' },
    { nom: 'Accompagnement patient', niveau: 'avance' },
  ],
  tarifHoraire: 1.5,
  coefficients: { formation: 0.3, penibilite: 0.3, responsabilite: 0.3, rarete: 0.1 },
  disponibilite: 'disponible',
  zonesIntervention: ['Dakar', 'Thies'],
  avis: [],
  noteMoyenne: undefined,
  nombreAvis: 0,
  realisations: [],
};

const proAncien: IdentiteProfessionnelle = {
  active: false,
  disponibilite: 'indisponible',
};

const proJP: IdentiteProfessionnelle = {
  active: true,
  titre: 'Expert-comptable',
  description: 'Audit financier et conseil en comptabilite. Specialise dans les organisations a but non lucratif.',
  secteur: 'Conseil',
  experience: 'Expert (10+ ans)',
  competences: [
    { nom: 'Audit financier', niveau: 'expert' },
    { nom: 'Comptabilite', niveau: 'expert' },
    { nom: 'Droit fiscal', niveau: 'avance' },
    { nom: 'Analyse de donnees', niveau: 'intermediaire' },
  ],
  certifications: [
    { nom: 'Expert-comptable diplome', organisme: 'Ordre des experts-comptables', date: '2005-06', verifie: true },
  ],
  tarifHoraire: 2.0,
  coefficients: { formation: 0.5, penibilite: 0, responsabilite: 0.3, rarete: 0.2 },
  disponibilite: 'occupe',
  zonesIntervention: ['Geneve', 'Lausanne', 'En ligne'],
  avis: [],
  noteMoyenne: undefined,
  nombreAvis: 0,
  realisations: [
    { titre: 'Audit du systeme VITA', description: 'Premier audit independant du systeme monetaire VITA.', date: '2025-06' },
  ],
};

// --- Construction des utilisateurs ---

function buildStoredUser(
  params: Parameters<typeof buildUserFromIdentity>[0] & { passwordHash: string }
): StoredUser {
  const { passwordHash, ...userParams } = params;
  const user = buildUserFromIdentity(userParams);
  return { ...user, passwordHash };
}

export const MOCK_USERS: StoredUser[] = [
  buildStoredUser({
    id: 'usr-001-dieu',
    username: 'maxim',
    email: 'maxim@vita.world',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'dieu',
    dateInscription: '2025-01-01',
    identiteVerifiee: identiteMaxim,
    identitePublique: pubMaxim,
    identiteProfessionnelle: proMaxim,
    preferences: defaultPreferences(),
    soldeVita: 420,
    joursActifs: 420,
    propositionsCreees: 12,
    votesEffectues: 48,
    scoreReputation: 98,
  }),
  buildStoredUser({
    id: 'usr-002-citoyen',
    username: 'amina.b',
    email: 'amina@vita.world',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'citoyen',
    dateInscription: '2025-02-10',
    identiteVerifiee: identiteAmina,
    identitePublique: pubAmina,
    identiteProfessionnelle: proAmina,
    preferences: defaultPreferences(),
    soldeVita: 310,
    joursActifs: 310,
    propositionsCreees: 5,
    votesEffectues: 32,
    scoreReputation: 85,
  }),
  buildStoredUser({
    id: 'usr-003-moderateur',
    username: 'lucas.d',
    email: 'lucas@vita.world',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'moderateur',
    dateInscription: '2025-01-20',
    identiteVerifiee: identiteLucas,
    identitePublique: pubLucas,
    identiteProfessionnelle: proLucas,
    preferences: defaultPreferences(),
    soldeVita: 380,
    joursActifs: 380,
    propositionsCreees: 8,
    votesEffectues: 41,
    scoreReputation: 92,
  }),
  buildStoredUser({
    id: 'usr-004-nouveau',
    username: 'sakura.t',
    email: 'sakura@vita.world',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'nouveau',
    dateInscription: '2025-12-01',
    identiteVerifiee: identiteSakura,
    identitePublique: pubSakura,
    identiteProfessionnelle: proSakura,
    preferences: defaultPreferences(),
    soldeVita: 15,
    joursActifs: 15,
    propositionsCreees: 0,
    votesEffectues: 0,
    scoreReputation: 10,
  }),
  buildStoredUser({
    id: 'usr-005-auditeur',
    username: 'jp.moreau',
    email: 'jpmoreau@vita.world',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'auditeur',
    dateInscription: '2025-03-05',
    identiteVerifiee: identiteJP,
    identitePublique: pubJP,
    identiteProfessionnelle: proJP,
    preferences: defaultPreferences(),
    soldeVita: 290,
    joursActifs: 290,
    propositionsCreees: 2,
    votesEffectues: 18,
    scoreReputation: 88,
  }),
  buildStoredUser({
    id: 'usr-006-nouveau',
    username: 'alex_martin',
    email: 'alex@vita.world',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'nouveau',
    dateInscription: '2026-02-15',
    identiteVerifiee: identiteAlex,
    identitePublique: pubAlex,
    identiteProfessionnelle: proAlex,
    preferences: defaultPreferences(),
    soldeVita: 4,
    joursActifs: 4,
    propositionsCreees: 0,
    votesEffectues: 0,
    scoreReputation: 5,
  }),
  buildStoredUser({
    id: 'usr-007-nouveau',
    username: 'fatou_diop',
    email: 'fatou@vita.world',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'nouveau',
    dateInscription: '2026-02-05',
    identiteVerifiee: identiteFatou,
    identitePublique: pubFatou,
    identiteProfessionnelle: proFatou,
    preferences: defaultPreferences(),
    soldeVita: 14,
    joursActifs: 14,
    propositionsCreees: 0,
    votesEffectues: 0,
    scoreReputation: 15,
  }),
  buildStoredUser({
    id: 'usr-008-expire',
    username: 'ancien_citoyen',
    email: 'pierre@vita.world',
    passwordHash: DEFAULT_PASSWORD_HASH,
    role: 'citoyen',
    dateInscription: '2025-01-10',
    identiteVerifiee: identiteAncien,
    identitePublique: pubAncien,
    identiteProfessionnelle: proAncien,
    preferences: defaultPreferences(),
    soldeVita: 380,
    joursActifs: 380,
    propositionsCreees: 3,
    votesEffectues: 25,
    scoreReputation: 72,
  }),
];

// Seed localStorage si vide
export function seedMockUsers(): void {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem("vita_users");
  if (!existing) {
    localStorage.setItem("vita_users", JSON.stringify(MOCK_USERS));
  }
}

// Force re-seed (utile apres migration de schema)
export function forceSeedMockUsers(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("vita_users", JSON.stringify(MOCK_USERS));
}
