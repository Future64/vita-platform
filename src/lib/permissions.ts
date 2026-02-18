import type { UserRole, Permission } from "@/types/auth";
import type { LucideIcon } from "lucide-react";
import {
  Crown,
  Shield,
  ShieldCheck,
  Eye,
  FileSearch,
  UserCheck,
  User,
  UserPlus,
  Ban,
} from "lucide-react";

// --- Matrice de permissions par role ---

const ALL_PERMISSIONS: Permission[] = [
  'view_panorama', 'view_agora', 'view_codex', 'view_forge', 'view_civis', 'view_bourse', 'view_parametres',
  'create_proposal', 'vote_proposal', 'comment_proposal', 'moderate_proposal', 'delete_proposal',
  'edit_codex', 'propose_amendment', 'validate_amendment',
  'create_version_travail', 'create_revision', 'create_demande_integration', 'approve_demande_integration', 'integrer_version',
  'send_vita', 'receive_vita', 'view_balance', 'view_transactions', 'view_others_transactions',
  'edit_own_profile', 'view_all_profiles', 'edit_others_profile', 'verify_identity', 'suspend_user',
  'access_admin_panel', 'manage_users', 'manage_roles', 'manage_system_params', 'view_audit_logs', 'view_system_stats', 'emergency_stop',
  'simulate_roles', 'view_all_data', 'bypass_restrictions', 'access_dev_tools',
];

// Permissions de lecture sur tous les modules
const VIEW_ALL_MODULES: Permission[] = [
  'view_panorama', 'view_agora', 'view_codex', 'view_forge', 'view_civis', 'view_bourse',
];

// Permissions d'un citoyen standard
const CITOYEN_PERMISSIONS: Permission[] = [
  ...VIEW_ALL_MODULES,
  'create_proposal', 'vote_proposal', 'comment_proposal',
  'propose_amendment',
  'create_version_travail', 'create_revision', 'create_demande_integration',
  'send_vita', 'receive_vita', 'view_balance', 'view_transactions',
  'edit_own_profile',
];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  dieu: ALL_PERMISSIONS,

  super_admin: ALL_PERMISSIONS.filter(
    (p) => p !== 'simulate_roles' && p !== 'bypass_restrictions' && p !== 'access_dev_tools'
  ),

  admin: [
    ...VIEW_ALL_MODULES,
    'view_parametres',
    'create_proposal', 'vote_proposal', 'comment_proposal', 'moderate_proposal', 'delete_proposal',
    'edit_codex', 'propose_amendment', 'validate_amendment',
    'create_version_travail', 'create_revision', 'create_demande_integration', 'approve_demande_integration', 'integrer_version',
    'send_vita', 'receive_vita', 'view_balance', 'view_transactions', 'view_others_transactions',
    'edit_own_profile', 'view_all_profiles', 'edit_others_profile', 'verify_identity', 'suspend_user',
    'access_admin_panel', 'manage_users', 'manage_roles', 'manage_system_params', 'view_audit_logs', 'view_system_stats',
  ],

  moderateur: [
    ...VIEW_ALL_MODULES,
    'create_proposal', 'vote_proposal', 'comment_proposal', 'moderate_proposal', 'delete_proposal',
    'propose_amendment',
    'create_version_travail', 'create_revision', 'create_demande_integration', 'approve_demande_integration',
    'send_vita', 'receive_vita', 'view_balance', 'view_transactions',
    'edit_own_profile', 'view_all_profiles',
    'access_admin_panel', 'suspend_user', 'view_audit_logs',
  ],

  auditeur: [
    ...VIEW_ALL_MODULES,
    'view_parametres',
    'comment_proposal',
    'view_balance', 'view_transactions', 'view_others_transactions',
    'edit_own_profile', 'view_all_profiles',
    'access_admin_panel', 'view_audit_logs', 'view_system_stats',
    'receive_vita',
  ],

  delegue: [
    ...CITOYEN_PERMISSIONS,
    'approve_demande_integration',
    'validate_amendment',
    'view_all_profiles',
    'view_system_stats',
  ],

  citoyen: CITOYEN_PERMISSIONS,

  nouveau: [
    'view_panorama', 'view_agora', 'view_codex', 'view_forge', 'view_civis', 'view_bourse',
    'receive_vita',
    'view_balance', 'view_transactions',
    'edit_own_profile',
    'comment_proposal',
  ],

  observateur: [
    ...VIEW_ALL_MODULES,
    'view_balance',
    'view_transactions',
    'edit_own_profile',
  ],

  suspendu: [
    'view_panorama',
    'view_civis',
    'view_balance',
  ],
};

// --- Verification de permission ---

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

// --- Metadonnees de role ---

export interface RoleMetadata {
  key: UserRole;
  label: string;
  description: string;
  color: string;
  icon: LucideIcon;
  order: number;
}

export const ROLE_METADATA: Record<UserRole, RoleMetadata> = {
  dieu: {
    key: 'dieu',
    label: 'Dieu',
    description: 'Acces total, toutes permissions, simulation de roles',
    color: '#fbbf24',
    icon: Crown,
    order: 0,
  },
  super_admin: {
    key: 'super_admin',
    label: 'Super Admin',
    description: 'Gestion systeme complete, arret d\'urgence',
    color: '#ef4444',
    icon: Shield,
    order: 1,
  },
  admin: {
    key: 'admin',
    label: 'Administrateur',
    description: 'Gestion des utilisateurs et parametres',
    color: '#f97316',
    icon: ShieldCheck,
    order: 2,
  },
  moderateur: {
    key: 'moderateur',
    label: 'Moderateur',
    description: 'Moderation du contenu et des discussions',
    color: '#eab308',
    icon: Eye,
    order: 3,
  },
  auditeur: {
    key: 'auditeur',
    label: 'Auditeur',
    description: 'Lecture avancee, rapports et audit',
    color: '#3b82f6',
    icon: FileSearch,
    order: 4,
  },
  delegue: {
    key: 'delegue',
    label: 'Delegue',
    description: 'Droits etendus via delegation democratique',
    color: '#10b981',
    icon: UserCheck,
    order: 5,
  },
  citoyen: {
    key: 'citoyen',
    label: 'Citoyen',
    description: 'Acces standard complet, verifie',
    color: '#8b5cf6',
    icon: User,
    order: 6,
  },
  nouveau: {
    key: 'nouveau',
    label: 'Nouveau',
    description: 'Acces limite, en attente de verification',
    color: '#6b7280',
    icon: UserPlus,
    order: 7,
  },
  observateur: {
    key: 'observateur',
    label: 'Observateur',
    description: 'Lecture seule sur tous les modules',
    color: '#94a3b8',
    icon: Eye,
    order: 8,
  },
  suspendu: {
    key: 'suspendu',
    label: 'Suspendu',
    description: 'Acces minimal, compte suspendu',
    color: '#dc2626',
    icon: Ban,
    order: 9,
  },
};

// Liste ordonnee des roles pour les selectors
export const ROLES_ORDERED: UserRole[] = Object.values(ROLE_METADATA)
  .sort((a, b) => a.order - b.order)
  .map((m) => m.key);
