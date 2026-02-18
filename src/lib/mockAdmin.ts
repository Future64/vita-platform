// Mock data for the Administration module

import type { UserRole } from "@/types/auth";

// ============================================================
// ADMIN USERS (extended list for the users management page)
// ============================================================

export interface AdminUser {
  id: string;
  prenom: string;
  nom: string;
  username: string;
  email: string;
  role: UserRole;
  dateInscription: string;
  derniereConnexion: string;
  statut: "actif" | "en_attente" | "suspendu";
  soldeVita: number;
  scoreReputation: number;
  pays: string;
  initials: string;
}

export const ADMIN_USERS: AdminUser[] = [
  { id: "usr-001", prenom: "Maxim", nom: "Dassonneville", username: "maxim", email: "ma***@vita.world", role: "dieu", dateInscription: "2025-01-01", derniereConnexion: "il y a 2h", statut: "actif", soldeVita: 420, scoreReputation: 98, pays: "France", initials: "MD" },
  { id: "usr-002", prenom: "Amina", nom: "Benali", username: "amina.b", email: "am***@vita.world", role: "citoyen", dateInscription: "2025-02-10", derniereConnexion: "il y a 5h", statut: "actif", soldeVita: 310, scoreReputation: 85, pays: "Maroc", initials: "AB" },
  { id: "usr-003", prenom: "Lucas", nom: "Durand", username: "lucas.d", email: "lu***@vita.world", role: "moderateur", dateInscription: "2025-01-20", derniereConnexion: "il y a 1h", statut: "actif", soldeVita: 380, scoreReputation: 92, pays: "Belgique", initials: "LD" },
  { id: "usr-004", prenom: "Sakura", nom: "Tanaka", username: "sakura.t", email: "sa***@vita.world", role: "nouveau", dateInscription: "2025-12-01", derniereConnexion: "il y a 3j", statut: "en_attente", soldeVita: 15, scoreReputation: 10, pays: "Japon", initials: "ST" },
  { id: "usr-005", prenom: "Jean-Pierre", nom: "Moreau", username: "jp.moreau", email: "jp***@vita.world", role: "auditeur", dateInscription: "2025-03-05", derniereConnexion: "il y a 12h", statut: "actif", soldeVita: 290, scoreReputation: 88, pays: "Suisse", initials: "JM" },
  { id: "usr-006", prenom: "Fatou", nom: "Ndiaye", username: "fatou.sn", email: "fa***@vita.world", role: "citoyen", dateInscription: "2025-04-12", derniereConnexion: "il y a 1j", statut: "actif", soldeVita: 255, scoreReputation: 76, pays: "Senegal", initials: "FN" },
  { id: "usr-007", prenom: "Carlos", nom: "Santos", username: "carlos.sp", email: "ca***@vita.world", role: "delegue", dateInscription: "2025-02-28", derniereConnexion: "il y a 4h", statut: "actif", soldeVita: 340, scoreReputation: 91, pays: "Bresil", initials: "CS" },
  { id: "usr-008", prenom: "Priya", nom: "Sharma", username: "priya_dev", email: "pr***@vita.world", role: "citoyen", dateInscription: "2025-05-15", derniereConnexion: "il y a 6h", statut: "actif", soldeVita: 220, scoreReputation: 79, pays: "Inde", initials: "PS" },
  { id: "usr-009", prenom: "Hans", nom: "Braun", username: "hans.b", email: "ha***@vita.world", role: "citoyen", dateInscription: "2025-03-22", derniereConnexion: "il y a 2j", statut: "actif", soldeVita: 280, scoreReputation: 82, pays: "Allemagne", initials: "HB" },
  { id: "usr-010", prenom: "Lena", nom: "Mueller", username: "lena.zk", email: "le***@vita.world", role: "admin", dateInscription: "2025-01-15", derniereConnexion: "il y a 30min", statut: "actif", soldeVita: 400, scoreReputation: 95, pays: "Autriche", initials: "LM" },
  { id: "usr-011", prenom: "Yuki", nom: "Tanaka", username: "yuki.node", email: "yu***@vita.world", role: "citoyen", dateInscription: "2025-06-01", derniereConnexion: "il y a 8h", statut: "actif", soldeVita: 195, scoreReputation: 71, pays: "Japon", initials: "YT" },
  { id: "usr-012", prenom: "Omar", nom: "Al-Rashid", username: "omar.r", email: "om***@vita.world", role: "nouveau", dateInscription: "2025-12-10", derniereConnexion: "il y a 5j", statut: "en_attente", soldeVita: 8, scoreReputation: 5, pays: "Jordanie", initials: "OR" },
  { id: "usr-013", prenom: "Elena", nom: "Petrova", username: "elena.p", email: "el***@vita.world", role: "citoyen", dateInscription: "2025-07-20", derniereConnexion: "il y a 1j", statut: "actif", soldeVita: 165, scoreReputation: 68, pays: "Russie", initials: "EP" },
  { id: "usr-014", prenom: "Marco", nom: "Rossi", username: "marco.spam", email: "ma***@temp.email", role: "suspendu", dateInscription: "2025-08-05", derniereConnexion: "il y a 14j", statut: "suspendu", soldeVita: 45, scoreReputation: 12, pays: "Italie", initials: "MR" },
  { id: "usr-015", prenom: "Sophie", nom: "Chen", username: "sophie.chen", email: "so***@vita.world", role: "super_admin", dateInscription: "2025-01-10", derniereConnexion: "il y a 3h", statut: "actif", soldeVita: 410, scoreReputation: 96, pays: "Taiwan", initials: "SC" },
  { id: "usr-016", prenom: "Aisha", nom: "Mohammed", username: "aisha.m", email: "ai***@vita.world", role: "nouveau", dateInscription: "2025-12-14", derniereConnexion: "il y a 1j", statut: "en_attente", soldeVita: 3, scoreReputation: 3, pays: "Egypte", initials: "AM" },
  { id: "usr-017", prenom: "James", nom: "Wilson", username: "james.w", email: "ja***@vita.world", role: "observateur", dateInscription: "2025-09-01", derniereConnexion: "il y a 4j", statut: "actif", soldeVita: 120, scoreReputation: 55, pays: "Royaume-Uni", initials: "JW" },
  { id: "usr-018", prenom: "Maria", nom: "Garcia", username: "maria.g", email: "ma***@vita.world", role: "citoyen", dateInscription: "2025-05-28", derniereConnexion: "il y a 10h", statut: "actif", soldeVita: 210, scoreReputation: 74, pays: "Mexique", initials: "MG" },
];

export const USER_STATS = {
  total: 1_247_893,
  verifies: 1_209_421,
  enAttente: 38_472,
  suspendus: 12,
};

// ============================================================
// SIGNALEMENTS (MODERATION)
// ============================================================

export type SignalementMotif = "hors_sujet" | "contenu_inapproprie" | "spam" | "harcelement" | "fausse_information";
export type SignalementType = "proposition" | "commentaire" | "fil_discussion" | "profil";

export interface Signalement {
  id: string;
  type: SignalementType;
  titre: string;
  extrait: string;
  nombreSignalements: number;
  premierSignalement: string;
  motifs: SignalementMotif[];
  auteurContenu: { username: string; initials: string };
  traite: boolean;
  resultat?: "masque" | "rejete" | "averti" | "suspendu";
  traiteePar?: string;
  dateTraitement?: string;
}

const MOTIF_LABELS: Record<SignalementMotif, string> = {
  hors_sujet: "Hors sujet",
  contenu_inapproprie: "Contenu inapproprie",
  spam: "Spam",
  harcelement: "Harcelement",
  fausse_information: "Fausse information",
};

export { MOTIF_LABELS };

export const SIGNALEMENTS: Signalement[] = [
  {
    id: "sig-001",
    type: "commentaire",
    titre: "Commentaire insultant dans le debat sur la duree de vote",
    extrait: "Ce message contient des attaques personnelles envers d'autres participants du debat. L'auteur utilise un langage irrespectueux et des qualificatifs degradants.",
    nombreSignalements: 7,
    premierSignalement: "il y a 4h",
    motifs: ["harcelement", "contenu_inapproprie"],
    auteurContenu: { username: "troll_42", initials: "T4" },
    traite: false,
  },
  {
    id: "sig-002",
    type: "proposition",
    titre: "Proposition publicitaire deguisee",
    extrait: "Proposition visant a integrer un service commercial dans le systeme VITA. Le texte contient des liens vers un site externe commercial.",
    nombreSignalements: 12,
    premierSignalement: "il y a 8h",
    motifs: ["spam", "hors_sujet"],
    auteurContenu: { username: "promo_user", initials: "PU" },
    traite: false,
  },
  {
    id: "sig-003",
    type: "fil_discussion",
    titre: "Fil de desinformation sur les ZK-proofs",
    extrait: "L'auteur affirme a tort que les ZK-proofs ont ete compromises et que toutes les identites sont exposees. Aucune source fiable citee.",
    nombreSignalements: 5,
    premierSignalement: "il y a 1j",
    motifs: ["fausse_information"],
    auteurContenu: { username: "crypto_fear", initials: "CF" },
    traite: false,
  },
  // Traites
  {
    id: "sig-004",
    type: "commentaire",
    titre: "Spam repetitif dans plusieurs fils",
    extrait: "Le meme message copie-colle dans 8 fils de discussion differents.",
    nombreSignalements: 15,
    premierSignalement: "il y a 2j",
    motifs: ["spam"],
    auteurContenu: { username: "marco.spam", initials: "MR" },
    traite: true,
    resultat: "suspendu",
    traiteePar: "lucas.d",
    dateTraitement: "il y a 1j",
  },
  {
    id: "sig-005",
    type: "proposition",
    titre: "Proposition jugee conforme apres examen",
    extrait: "Proposition de modification du coefficient PPA signalee comme fausse information mais jugee conforme apres verification.",
    nombreSignalements: 3,
    premierSignalement: "il y a 3j",
    motifs: ["fausse_information"],
    auteurContenu: { username: "marie.d", initials: "MD" },
    traite: true,
    resultat: "rejete",
    traiteePar: "maxim",
    dateTraitement: "il y a 2j",
  },
  {
    id: "sig-006",
    type: "commentaire",
    titre: "Contenu inapproprie masque",
    extrait: "Message contenant des propos discriminatoires a caractere ethnique.",
    nombreSignalements: 9,
    premierSignalement: "il y a 4j",
    motifs: ["harcelement", "contenu_inapproprie"],
    auteurContenu: { username: "bad_actor", initials: "BA" },
    traite: true,
    resultat: "masque",
    traiteePar: "lucas.d",
    dateTraitement: "il y a 3j",
  },
  {
    id: "sig-007",
    type: "profil",
    titre: "Profil avec bio offensante",
    extrait: "Bio du profil contenant des propos haineux et des appels a la violence.",
    nombreSignalements: 6,
    premierSignalement: "il y a 5j",
    motifs: ["contenu_inapproprie", "harcelement"],
    auteurContenu: { username: "hate_speech", initials: "HS" },
    traite: true,
    resultat: "suspendu",
    traiteePar: "lena.zk",
    dateTraitement: "il y a 4j",
  },
  {
    id: "sig-008",
    type: "commentaire",
    titre: "Avertissement envoye pour ton condescendant",
    extrait: "Commentaire juge condescendant mais pas suffisamment grave pour masquage. Avertissement envoye.",
    nombreSignalements: 2,
    premierSignalement: "il y a 6j",
    motifs: ["contenu_inapproprie"],
    auteurContenu: { username: "superior_tone", initials: "ST" },
    traite: true,
    resultat: "averti",
    traiteePar: "lucas.d",
    dateTraitement: "il y a 5j",
  },
  {
    id: "sig-009",
    type: "fil_discussion",
    titre: "Fil hors sujet dans le debat PPA",
    extrait: "Discussion sur un sujet completement different de la proposition, sans rapport avec le PPA.",
    nombreSignalements: 4,
    premierSignalement: "il y a 7j",
    motifs: ["hors_sujet"],
    auteurContenu: { username: "off_topic", initials: "OT" },
    traite: true,
    resultat: "masque",
    traiteePar: "maxim",
    dateTraitement: "il y a 6j",
  },
  {
    id: "sig-010",
    type: "proposition",
    titre: "Proposition signalement rejete — faux positif",
    extrait: "Proposition controversee mais respectant les regles. Signalements rejetes.",
    nombreSignalements: 8,
    premierSignalement: "il y a 8j",
    motifs: ["contenu_inapproprie", "fausse_information"],
    auteurContenu: { username: "controversial_but_ok", initials: "CO" },
    traite: true,
    resultat: "rejete",
    traiteePar: "lucas.d",
    dateTraitement: "il y a 7j",
  },
];

// ============================================================
// AUDIT LOGS
// ============================================================

export type AuditSeverity = "info" | "warning" | "critique";
export type AuditCategory = "authentification" | "transaction" | "vote" | "administration" | "systeme";

export interface AuditLog {
  id: string;
  horodatage: string;
  horodatageIso: string;
  severite: AuditSeverity;
  categorie: AuditCategory;
  acteur: string;
  action: string;
  details: string;
  hashRef: string;
  ip?: string;
  userAgent?: string;
  donneeAvant?: string;
  donneeApres?: string;
  hashPrecedent?: string;
}

export const AUDIT_LOGS: AuditLog[] = [
  { id: "log-001", horodatage: "15 dec. 2025, 14:32:01", horodatageIso: "2025-12-15T14:32:01Z", severite: "info", categorie: "authentification", acteur: "@maxim", action: "Connexion reussie", details: "Connexion reussie depuis 192.168.1.xxx", hashRef: "a3f7b2c1", ip: "192.168.1.xxx", userAgent: "Firefox 130, macOS" },
  { id: "log-002", horodatage: "15 dec. 2025, 14:15:22", horodatageIso: "2025-12-15T14:15:22Z", severite: "warning", categorie: "authentification", acteur: "@inconnu", action: "Tentative de connexion echouee", details: "Tentative de connexion echouee pour @inconnu — 3eme tentative", hashRef: "b8e4d1f9", ip: "203.0.113.xxx", hashPrecedent: "a3f7b2c1" },
  { id: "log-003", horodatage: "15 dec. 2025, 13:45:10", horodatageIso: "2025-12-15T13:45:10Z", severite: "info", categorie: "administration", acteur: "@maxim", action: "Modification de role", details: "Modification du role de @sakura.t : nouveau → citoyen", hashRef: "c2a9e5d3", donneeAvant: "role: nouveau", donneeApres: "role: citoyen", hashPrecedent: "b8e4d1f9" },
  { id: "log-004", horodatage: "15 dec. 2025, 12:30:45", horodatageIso: "2025-12-15T12:30:45Z", severite: "warning", categorie: "administration", acteur: "@lucas.d", action: "Suspension d'utilisateur", details: "Suspension de @marco.spam par @lucas.d — Motif : spam repete", hashRef: "d7f3b8a2", donneeAvant: "statut: actif", donneeApres: "statut: suspendu", hashPrecedent: "c2a9e5d3" },
  { id: "log-005", horodatage: "15 dec. 2025, 10:05:33", horodatageIso: "2025-12-15T10:05:33Z", severite: "info", categorie: "administration", acteur: "@maxim", action: "Proposition de modification parametre", details: "Proposition de modification du parametre 'Duree des votes' — 14j → 21j", hashRef: "e1c6d4f7", hashPrecedent: "d7f3b8a2" },
  { id: "log-006", horodatage: "15 dec. 2025, 08:00:12", horodatageIso: "2025-12-15T08:00:12Z", severite: "info", categorie: "vote", acteur: "Systeme", action: "Vote cloture", details: "Vote cloture : proposition #247 adoptee (67% pour, quorum atteint)", hashRef: "f4a2b7e8", hashPrecedent: "e1c6d4f7" },
  { id: "log-007", horodatage: "15 dec. 2025, 00:03:47", horodatageIso: "2025-12-15T00:03:47Z", severite: "info", categorie: "systeme", acteur: "Systeme", action: "Emission quotidienne", details: "Emission quotidienne : 1 247 893 V distribues a 1 247 893 citoyens — Duree : 12.3s", hashRef: "a9d5c3b1", hashPrecedent: "f4a2b7e8" },
  { id: "log-008", horodatage: "14 dec. 2025, 23:58:00", horodatageIso: "2025-12-14T23:58:00Z", severite: "critique", categorie: "systeme", acteur: "Systeme", action: "Erreur de distribution", details: "Erreur de distribution pour 3 comptes — nouvelle tentative programmee a 00:10 UTC", hashRef: "b2e8f1a4", hashPrecedent: "a9d5c3b1" },
  { id: "log-009", horodatage: "14 dec. 2025, 22:15:30", horodatageIso: "2025-12-14T22:15:30Z", severite: "info", categorie: "transaction", acteur: "@amina.b", action: "Transaction sortante", details: "Envoi de 5.00 V de @amina.b a @fatou.sn — Memo : Merci pour le cours", hashRef: "c5f2a7d9", hashPrecedent: "b2e8f1a4" },
  { id: "log-010", horodatage: "14 dec. 2025, 20:45:00", horodatageIso: "2025-12-14T20:45:00Z", severite: "info", categorie: "vote", acteur: "@carlos.sp", action: "Vote enregistre", details: "Vote 'pour' sur proposition #248 (Revision coefficient PPA)", hashRef: "d8a1c4e6", hashPrecedent: "c5f2a7d9" },
  { id: "log-011", horodatage: "14 dec. 2025, 18:20:15", horodatageIso: "2025-12-14T18:20:15Z", severite: "info", categorie: "administration", acteur: "@lena.zk", action: "Verification d'identite", details: "Identite de @omar.r verifiee avec succes via ZK-proof", hashRef: "e3b7f2a8", hashPrecedent: "d8a1c4e6" },
  { id: "log-012", horodatage: "14 dec. 2025, 16:10:45", horodatageIso: "2025-12-14T16:10:45Z", severite: "info", categorie: "administration", acteur: "@lucas.d", action: "Contenu masque", details: "Commentaire sig-006 masque pour contenu discriminatoire", hashRef: "f6c4d1a3", hashPrecedent: "e3b7f2a8" },
  { id: "log-013", horodatage: "14 dec. 2025, 14:55:20", horodatageIso: "2025-12-14T14:55:20Z", severite: "warning", categorie: "authentification", acteur: "@suspicious_ip", action: "Tentative de connexion bloquee", details: "IP bloquee apres 5 tentatives echouees consecutives — 45.33.xxx.xxx", hashRef: "a1d8e5b2", ip: "45.33.xxx.xxx", hashPrecedent: "f6c4d1a3" },
  { id: "log-014", horodatage: "14 dec. 2025, 12:00:00", horodatageIso: "2025-12-14T12:00:00Z", severite: "info", categorie: "systeme", acteur: "Systeme", action: "Sauvegarde completee", details: "Sauvegarde de la base de donnees completee — 12.4 GB — Duree : 4min 23s", hashRef: "b4f2c8d7", hashPrecedent: "a1d8e5b2" },
  { id: "log-015", horodatage: "14 dec. 2025, 10:30:00", horodatageIso: "2025-12-14T10:30:00Z", severite: "info", categorie: "vote", acteur: "Systeme", action: "Vote ouvert", details: "Vote ouvert pour proposition #249 — Duree : 14 jours — Quorum : 25%", hashRef: "c7a3d5e1", hashPrecedent: "b4f2c8d7" },
  { id: "log-016", horodatage: "13 dec. 2025, 23:45:00", horodatageIso: "2025-12-13T23:45:00Z", severite: "info", categorie: "systeme", acteur: "Systeme", action: "Emission quotidienne", details: "Emission quotidienne : 1 247 890 V distribues — Duree : 11.8s", hashRef: "d2e6f4a9", hashPrecedent: "c7a3d5e1" },
  { id: "log-017", horodatage: "13 dec. 2025, 20:00:00", horodatageIso: "2025-12-13T20:00:00Z", severite: "info", categorie: "transaction", acteur: "@hans.b", action: "Transaction sortante", details: "Envoi de 12.50 V de @hans.b a @priya_dev — Memo : Contribution au projet", hashRef: "e5a1b8c3", hashPrecedent: "d2e6f4a9" },
  { id: "log-018", horodatage: "13 dec. 2025, 15:30:22", horodatageIso: "2025-12-13T15:30:22Z", severite: "info", categorie: "administration", acteur: "@sophie.chen", action: "Cache vide", details: "Cache de l'application vide manuellement par @sophie.chen", hashRef: "f8c3d7e2", hashPrecedent: "e5a1b8c3" },
  { id: "log-019", horodatage: "13 dec. 2025, 10:15:00", horodatageIso: "2025-12-13T10:15:00Z", severite: "warning", categorie: "systeme", acteur: "Systeme", action: "Latence elevee", details: "Latence API elevee detectee : 245ms (seuil : 200ms) — Duree : 15 min", hashRef: "a4b9c1d6", hashPrecedent: "f8c3d7e2" },
  { id: "log-020", horodatage: "12 dec. 2025, 22:00:00", horodatageIso: "2025-12-12T22:00:00Z", severite: "info", categorie: "systeme", acteur: "Systeme", action: "Maintenance planifiee", details: "Maintenance planifiee completee — Duree : 4 min — Mise a jour v2.14.1", hashRef: "b7d2e4f8", hashPrecedent: "a4b9c1d6" },
];

export const AUDIT_STATS = {
  totalSemaine: 1_247,
  integrite: true as boolean,
  derniereVerification: "il y a 2h",
  totalEntrees: 52_341,
};

// ============================================================
// SYSTEM STATS
// ============================================================

export const SYSTEM_STATUS = {
  global: "operationnel" as "operationnel" | "degrade" | "maintenance",
  api: {
    statut: "operationnel" as const,
    tempsReponseMoyen: 42,
    requetesParMinute: 12_345,
    erreurs5xx: 0,
    sparkline: [38, 42, 45, 40, 38, 35, 42, 48, 44, 40, 38, 42, 39, 41, 43, 42, 40, 38, 42, 44, 46, 42, 40, 38],
  },
  baseDeDonnees: {
    statut: "operationnel" as const,
    connexionsActives: 23,
    connexionsMax: 100,
    taille: "12.4 GB",
    derniereSauvegarde: "il y a 2h",
    prochaineSauvegarde: "dans 4h",
  },
  fileEmission: {
    statut: "complete" as const,
    emissionsAujourdhui: 1_247_893,
    emissionsTotal: 1_247_893,
    derniereEmission: "00:03:47 UTC",
    dureeEmission: "12.3s",
    prochaineEmission: "dans 9h 23m",
  },
  stockage: {
    utilise: 67,
    total: "500 GB",
    logs: "8.2 GB",
    transactions: "3.1 GB",
    identites: "1.2 GB",
  },
  reseau: {
    latenceMoyenne: 23,
    bandePassante: 234,
    bandePassanteMax: 1000,
    certificatSSL: "Valide",
    expirationSSL: "247 jours",
  },
  cache: {
    hitRate: 94.2,
    memoire: "2.1 GB",
    memoireMax: "8 GB",
    entrees: 123_456,
  },
  uptime: {
    pct30j: 99.97,
    dernierIncident: "il y a 12 jours",
    raisonIncident: "maintenance planifiee",
    dureeIncident: "4 min",
    barres: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 99.8, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100],
  },
};

// ============================================================
// RECENT ADMIN ACTIONS
// ============================================================

export interface AdminAction {
  id: string;
  acteur: string;
  action: string;
  date: string;
  type: "verification" | "moderation" | "parametre" | "role" | "systeme";
}

export const RECENT_ADMIN_ACTIONS: AdminAction[] = [
  { id: "act-1", acteur: "@lena.zk", action: "a verifie l'identite de @omar.r", date: "il y a 2h", type: "verification" },
  { id: "act-2", acteur: "@lucas.d", action: "a masque un commentaire pour contenu inapproprie", date: "il y a 5h", type: "moderation" },
  { id: "act-3", acteur: "@maxim", action: "a propose la modification du parametre 'Duree des votes'", date: "hier", type: "parametre" },
  { id: "act-4", acteur: "@sophie.chen", action: "a change le role de @fatou.sn : citoyen → delegue", date: "il y a 2j", type: "role" },
  { id: "act-5", acteur: "@lucas.d", action: "a suspendu @marco.spam pour spam repete", date: "il y a 3j", type: "moderation" },
];

// ============================================================
// MODERATION STATS
// ============================================================

export const MODERATION_STATS = {
  enAttente: 3,
  traitesSemaine: 7,
  traitesMois: 23,
};
