// Types d'authentification et de roles VITA

export type UserRole =
  | 'dieu'           // God mode — acces total, toutes permissions, peut simuler tous les roles
  | 'super_admin'    // Super-administrateur — gestion systeme
  | 'admin'          // Administrateur — gestion utilisateurs et parametres
  | 'moderateur'     // Moderateur — gestion du contenu
  | 'auditeur'       // Auditeur — lecture seule avancee, rapports
  | 'delegue'        // Delegue — droits etendus via delegation democratique
  | 'citoyen'        // Citoyen verifie — acces standard complet
  | 'nouveau'        // Nouveau — acces limite (pas encore verifie)
  | 'observateur'    // Observateur — lecture seule
  | 'suspendu';      // Suspendu — acces minimal

// --- MODE DE VISIBILITE ---
export type ModeVisibilite = 'complet' | 'pseudonyme' | 'anonyme';

// --- IDENTITE VERIFIEE (privee, jamais visible par les autres) ---
export interface IdentiteVerifiee {
  nomLegal: string;
  prenomLegal: string;
  dateNaissance: string;
  nationalite: string;
  paysResidence: string;
  statut: 'non_verifie' | 'en_cours' | 'verifie' | 'expire' | 'rejete';
  dateVerification?: string;
  dateExpiration?: string;
  methodeVerification?: 'parrainage' | 'zkp' | 'document';
  parrains?: { username: string; dateAttestation: string }[];
  niveauConfiance: number; // 0-100
  historiqueVerifications: {
    date: string;
    methode: string;
    statut: 'accepte' | 'rejete' | 'expire';
    details?: string;
  }[];
}

// --- IDENTITE PUBLIQUE (ce que les autres voient) ---
export interface IdentitePublique {
  modeVisibilite: ModeVisibilite;
  // Mode complet
  prenom?: string;
  nom?: string;
  photoProfil?: string;
  // Mode pseudonyme
  pseudonyme?: string;
  avatarGenere?: string;
  // Commun
  bio?: string;
  paysAffiche?: string;
  langues?: string[];
  centresInteret?: string[];
  dateInscriptionVisible: boolean;
  siteWeb?: string;
  reseauxSociaux?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    mastodon?: string;
    autre?: string;
  };
}

// --- IDENTITE PROFESSIONNELLE (optionnelle) ---
export interface IdentiteProfessionnelle {
  active: boolean;
  titre?: string;
  description?: string;
  secteur?: string;
  experience?: string;
  competences?: {
    nom: string;
    niveau: 'debutant' | 'intermediaire' | 'avance' | 'expert';
  }[];
  certifications?: {
    nom: string;
    organisme?: string;
    date?: string;
    verifie: boolean;
  }[];
  tarifHoraire?: number;
  coefficients?: {
    formation: number;
    penibilite: number;
    responsabilite: number;
    rarete: number;
  };
  disponibilite: 'disponible' | 'occupe' | 'indisponible';
  zonesIntervention?: string[];
  avis?: {
    id: string;
    auteur: { username: string; modeVisibilite: ModeVisibilite };
    note: number;
    commentaire: string;
    date: string;
    service: string;
  }[];
  noteMoyenne?: number;
  nombreAvis?: number;
  realisations?: {
    titre: string;
    description: string;
    date?: string;
    lien?: string;
  }[];
}

// --- TYPE USER COMPLET ---
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  dateInscription: string;
  // Les 3 couches d'identite
  identiteVerifiee: IdentiteVerifiee;
  identitePublique: IdentitePublique;
  identiteProfessionnelle: IdentiteProfessionnelle;
  // Preferences
  preferences: UserPreferences;
  // Stats VITA
  soldeVita: number;
  joursActifs: number;
  propositionsCreees: number;
  votesEffectues: number;
  scoreReputation: number;

  // Champs legacy — aliases pour compatibilite
  // Ces champs sont derives des nouvelles structures
  prenom: string;
  nom: string;
  pays: string;
  dateNaissance: string;
  avatar?: string;
  bio?: string;
  profession?: string;
  centresInteret?: string[];
  langues?: string[];
  siteWeb?: string;
  reseauxSociaux?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  langue: string;
  notifications: {
    email: boolean;
    push: boolean;
    propositions: boolean;
    votes: boolean;
    transactions: boolean;
    systeme: boolean;
  };
  confidentialite: {
    profilPublic: boolean;
    afficherSolde: boolean;
    afficherActivite: boolean;
    afficherReputation: boolean;
  };
  accessibilite: {
    tailleTexte: 'petit' | 'normal' | 'grand' | 'tres_grand';
    contraste: 'normal' | 'eleve';
    animationsReduites: boolean;
  };
}

export type Permission =
  // Modules — lecture
  | 'view_panorama'
  | 'view_agora'
  | 'view_codex'
  | 'view_forge'
  | 'view_civis'
  | 'view_bourse'
  | 'view_parametres'
  // Agora — propositions
  | 'create_proposal'
  | 'vote_proposal'
  | 'comment_proposal'
  | 'moderate_proposal'
  | 'delete_proposal'
  // Codex — constitution
  | 'edit_codex'
  | 'propose_amendment'
  | 'validate_amendment'
  // Forge — versioning legislatif
  | 'create_version_travail'
  | 'create_revision'
  | 'create_demande_integration'
  | 'approve_demande_integration'
  | 'integrer_version'
  // Bourse — transactions
  | 'send_vita'
  | 'receive_vita'
  | 'view_balance'
  | 'view_transactions'
  | 'view_others_transactions'
  // Civis — profils
  | 'edit_own_profile'
  | 'view_all_profiles'
  | 'edit_others_profile'
  | 'verify_identity'
  | 'suspend_user'
  // Administration
  | 'access_admin_panel'
  | 'manage_users'
  | 'manage_roles'
  | 'manage_system_params'
  | 'view_audit_logs'
  | 'view_system_stats'
  | 'emergency_stop'
  // Dieu
  | 'simulate_roles'
  | 'view_all_data'
  | 'bypass_restrictions'
  | 'access_dev_tools';

export interface RegisterData {
  prenom: string;
  nom: string;
  username: string;
  email: string;
  password: string;
  dateNaissance: string;
  pays: string;
  modeVisibilite?: ModeVisibilite;
  pseudonyme?: string;
}

export interface StoredUser extends User {
  passwordHash: string;
}

export interface AuthSession {
  userId: string;
  loginAt: string;
}

// --- Helpers pour construire un User avec les champs legacy ---
export function buildUserFromIdentity(params: {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  dateInscription: string;
  identiteVerifiee: IdentiteVerifiee;
  identitePublique: IdentitePublique;
  identiteProfessionnelle: IdentiteProfessionnelle;
  preferences: UserPreferences;
  soldeVita: number;
  joursActifs: number;
  propositionsCreees: number;
  votesEffectues: number;
  scoreReputation: number;
}): User {
  const p = params;
  return {
    ...p,
    // Champs legacy derives
    prenom: p.identitePublique.prenom ?? p.identiteVerifiee.prenomLegal,
    nom: p.identitePublique.nom ?? p.identiteVerifiee.nomLegal,
    pays: p.identitePublique.paysAffiche ?? p.identiteVerifiee.paysResidence,
    dateNaissance: p.identiteVerifiee.dateNaissance,
    avatar: p.identitePublique.photoProfil,
    bio: p.identitePublique.bio,
    profession: p.identiteProfessionnelle.titre,
    centresInteret: p.identitePublique.centresInteret,
    langues: p.identitePublique.langues,
    siteWeb: p.identitePublique.siteWeb,
    reseauxSociaux: p.identitePublique.reseauxSociaux ? {
      twitter: p.identitePublique.reseauxSociaux.twitter,
      github: p.identitePublique.reseauxSociaux.github,
      linkedin: p.identitePublique.reseauxSociaux.linkedin,
    } : undefined,
  };
}
