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

export interface User {
  id: string;
  prenom: string;
  nom: string;
  username: string;
  email: string;
  dateNaissance: string;
  pays: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  dateInscription: string;
  profession?: string;
  centresInteret?: string[];
  langues?: string[];
  siteWeb?: string;
  reseauxSociaux?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  preferences: UserPreferences;
  soldeVita: number;
  joursActifs: number;
  propositionsCreees: number;
  votesEffectues: number;
  scoreReputation: number;
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
  | 'create_branch'
  | 'create_commit'
  | 'create_merge_request'
  | 'approve_merge_request'
  | 'merge_branch'
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
}

export interface StoredUser extends User {
  passwordHash: string;
}

export interface AuthSession {
  userId: string;
  loginAt: string;
}
