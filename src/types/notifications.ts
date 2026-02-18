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
  | "bienvenue"; // Après inscription

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
