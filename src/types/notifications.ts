// Types pour le système de notifications VITA

export type NotificationType =
  | "vote_ouvert" // Un nouveau vote est ouvert
  | "vote_resultat" // Un vote auquel j'ai participé est clos
  | "vita_recu" // J'ai reçu des Ѵ
  | "emission_quotidienne" // Émission quotidienne créditée
  | "proposition_commentee" // Quelqu'un a commenté ma proposition
  | "di_approuvee" // Ma demande d'intégration a été approuvée
  | "role_change" // Mon rôle a changé
  | "parametre_modifie" // Un paramètre système a été modifié
  | "systeme" // Notification système (maintenance, mise à jour)
  | "bienvenue" // Après inscription
  // Verification d'identite
  | "demande_parrainage" // Quelqu'un me demande de le parrainer
  | "rappel_parrainage" // Rappel pour une demande de parrainage en attente
  | "attestation_recue" // Un parrain a atteste mon identite
  | "verification_complete" // Ma verification est terminee (3/3)
  | "parrainage_refuse" // Un parrain a refuse ma demande
  | "demande_expiree" // Ma demande de verification a expire
  | "verification_expiration" // Ma verification expire bientot
  | "verification_expiree"; // Ma verification a expire

export interface Notification {
  id: string;
  type: NotificationType;
  titre: string;
  message: string;
  date: string; // ISO string
  lue: boolean;
  lien?: string; // Route vers la page concernée
  icone: string; // Nom de l'icône lucide-react
  couleur: string; // Couleur de l'icône (tailwind color name)
}
