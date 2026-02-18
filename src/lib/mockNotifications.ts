import type { Notification, NotificationType } from "@/types/notifications";

// Helper: date relative à maintenant
function ago(hours: number): string {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-001",
    type: "bienvenue",
    titre: "Bienvenue sur VITA !",
    message:
      "Votre compte a été créé avec succès. Explorez le Panorama pour découvrir l'état du système.",
    date: ago(168), // 7 jours
    lue: true,
    lien: "/panorama",
    icone: "Sparkles",
    couleur: "violet",
  },
  {
    id: "notif-002",
    type: "emission_quotidienne",
    titre: "Émission quotidienne",
    message: "Vous avez reçu 1 Ѵ au titre de l'émission quotidienne universelle.",
    date: ago(2),
    lue: false,
    lien: "/bourse",
    icone: "Coins",
    couleur: "green",
  },
  {
    id: "notif-003",
    type: "vote_ouvert",
    titre: "Nouveau vote : Durée de vote 14j → 21j",
    message:
      "Une proposition de modification de la durée de vote standard est ouverte au vote. Participez !",
    date: ago(5),
    lue: false,
    lien: "/agora/prop-agora-115",
    icone: "Vote",
    couleur: "cyan",
  },
  {
    id: "notif-004",
    type: "vita_recu",
    titre: "Transaction reçue : 15 Ѵ",
    message: "Vous avez reçu 15 Ѵ de Marie D. pour « Consultation design ».",
    date: ago(8),
    lue: false,
    lien: "/bourse/historique",
    icone: "ArrowDownLeft",
    couleur: "green",
  },
  {
    id: "notif-005",
    type: "proposition_commentee",
    titre: "Nouveau commentaire",
    message:
      'Lucas T. a commenté votre proposition « Revision du coefficient PPA » : "Excellente initiative..."',
    date: ago(12),
    lue: true,
    lien: "/agora/1",
    icone: "MessageSquare",
    couleur: "blue",
  },
  {
    id: "notif-006",
    type: "vote_resultat",
    titre: "Résultat de vote : Fonds urgence climatique",
    message:
      "La proposition « Fonds urgence climatique » a été adoptée avec 67% de voix favorables.",
    date: ago(24),
    lue: true,
    lien: "/agora/2",
    icone: "CheckCircle2",
    couleur: "green",
  },
  {
    id: "notif-007",
    type: "di_approuvee",
    titre: "Demande d'intégration approuvée",
    message:
      'Votre DI « Clarification Art. 3 - Vie privée » sur constitution-v3 a été approuvée par 4 relecteurs.',
    date: ago(28),
    lue: false,
    lien: "/forge/project/constitution-v3/mr/mr-001",
    icone: "GitMerge",
    couleur: "violet",
  },
  {
    id: "notif-008",
    type: "parametre_modifie",
    titre: "Paramètre modifié",
    message:
      "Le paramètre « Quorum minimal » a été mis à jour de 20% à 25% suite au vote collectif.",
    date: ago(48),
    lue: true,
    lien: "/codex/parametres-systeme",
    icone: "SlidersHorizontal",
    couleur: "orange",
  },
  {
    id: "notif-009",
    type: "role_change",
    titre: "Rôle mis à jour",
    message:
      "Votre rôle a été modifié de « Nouveau » à « Citoyen vérifié ». Vous avez maintenant accès à toutes les fonctionnalités.",
    date: ago(72),
    lue: true,
    lien: "/civis",
    icone: "ShieldCheck",
    couleur: "violet",
  },
  {
    id: "notif-010",
    type: "systeme",
    titre: "Maintenance planifiée",
    message:
      "Une maintenance est prévue le 20 décembre de 2h à 4h UTC. Le service sera temporairement indisponible.",
    date: ago(96),
    lue: true,
    icone: "Wrench",
    couleur: "orange",
  },
  {
    id: "notif-011",
    type: "vote_ouvert",
    titre: "Nouveau vote : Contribution pot commun",
    message:
      "La proposition d'augmentation de la contribution au pot commun de 2% à 3% est en délibération.",
    date: ago(3),
    lue: false,
    lien: "/agora/prop-agora-118",
    icone: "Vote",
    couleur: "cyan",
  },
  {
    id: "notif-012",
    type: "emission_quotidienne",
    titre: "Émission quotidienne",
    message: "Vous avez reçu 1 Ѵ au titre de l'émission quotidienne universelle.",
    date: ago(26),
    lue: true,
    lien: "/bourse",
    icone: "Coins",
    couleur: "green",
  },
  {
    id: "notif-013",
    type: "proposition_commentee",
    titre: "Réponse à votre commentaire",
    message:
      'Ahmed K. a répondu à votre commentaire sur « Délai de carence 7j → 14j » : "Merci pour cette analyse..."',
    date: ago(6),
    lue: false,
    lien: "/agora/prop-agora-120",
    icone: "MessageSquare",
    couleur: "blue",
  },
  {
    id: "notif-014",
    type: "systeme",
    titre: "Mise à jour du système",
    message:
      "VITA v0.4.2 est disponible. Nouvelles fonctionnalités : module Forge amélioré et notifications en temps réel.",
    date: ago(120),
    lue: true,
    icone: "Rocket",
    couleur: "violet",
  },
  {
    id: "notif-015",
    type: "vita_recu",
    titre: "Transaction reçue : 3.5 Ѵ",
    message: "Vous avez reçu 3.5 Ѵ de Sophie C. pour « Relecture document ».",
    date: ago(36),
    lue: true,
    lien: "/bourse/historique",
    icone: "ArrowDownLeft",
    couleur: "green",
  },
];

// Templates for random notification generation
const RANDOM_TEMPLATES: {
  type: NotificationType;
  titre: string;
  message: string;
  lien?: string;
  icone: string;
  couleur: string;
}[] = [
  {
    type: "emission_quotidienne",
    titre: "Émission quotidienne",
    message: "Vous avez reçu 1 Ѵ au titre de l'émission quotidienne universelle.",
    lien: "/bourse",
    icone: "Coins",
    couleur: "green",
  },
  {
    type: "vita_recu",
    titre: "Transaction reçue : 8 Ѵ",
    message: 'Vous avez reçu 8 Ѵ de Jean M. pour « Travail collaboratif ».',
    lien: "/bourse/historique",
    icone: "ArrowDownLeft",
    couleur: "green",
  },
  {
    type: "vote_ouvert",
    titre: "Nouveau vote disponible",
    message: "Une nouvelle proposition a été soumise au vote dans l'Agora.",
    lien: "/agora",
    icone: "Vote",
    couleur: "cyan",
  },
  {
    type: "proposition_commentee",
    titre: "Nouveau commentaire",
    message: "Quelqu'un a commenté une proposition que vous suivez.",
    lien: "/agora",
    icone: "MessageSquare",
    couleur: "blue",
  },
  {
    type: "systeme",
    titre: "Info système",
    message: "Le taux de couverture mondial a dépassé 0.015% — nouveau record !",
    lien: "/panorama",
    icone: "TrendingUp",
    couleur: "green",
  },
];

export function generateRandomNotification(): Notification {
  const template =
    RANDOM_TEMPLATES[Math.floor(Math.random() * RANDOM_TEMPLATES.length)];
  return {
    ...template,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    date: new Date().toISOString(),
    lue: false,
  };
}
