import type { OnboardingStep, TourStep } from "@/types/onboarding";

// ============================================================
// ONBOARDING STEPS — 12 etapes regroupees en 4 categories
// ============================================================

export const ONBOARDING_STEPS: OnboardingStep[] = [
  // --- Identite (3 etapes) ---
  {
    id: "completer-profil",
    category: "identite",
    titre: "Completer votre profil",
    description: "Ajoutez votre nom, photo et bio sur votre page Civis",
    lien: "/civis",
    icone: "User",
    ordre: 1,
  },
  {
    id: "choisir-visibilite",
    category: "identite",
    titre: "Choisir votre visibilite",
    description: "Definissez si vous etes visible, pseudonyme ou anonyme",
    lien: "/parametres",
    icone: "Eye",
    ordre: 2,
  },
  {
    id: "configurer-notifications",
    category: "identite",
    titre: "Configurer les notifications",
    description: "Choisissez quelles notifications vous souhaitez recevoir",
    lien: "/parametres",
    icone: "Bell",
    ordre: 3,
  },

  // --- Decouverte (3 etapes) ---
  {
    id: "visiter-panorama",
    category: "decouverte",
    titre: "Decouvrir le Panorama",
    description: "Consultez le tableau de bord global de VITA",
    lien: "/panorama",
    icone: "Globe",
    ordre: 4,
  },
  {
    id: "explorer-codex",
    category: "decouverte",
    titre: "Explorer le Codex",
    description: "Decouvrez la constitution et les regles de VITA",
    lien: "/codex",
    icone: "BookOpen",
    ordre: 5,
  },
  {
    id: "visiter-forge",
    category: "decouverte",
    titre: "Visiter la Forge",
    description: "Explorez les projets de redaction collaborative",
    lien: "/forge",
    icone: "GitBranch",
    ordre: 6,
  },

  // --- Participation (3 etapes) ---
  {
    id: "lire-proposition",
    category: "participation",
    titre: "Lire une proposition",
    description: "Consultez une proposition de loi en Agora",
    lien: "/agora",
    icone: "FileText",
    ordre: 7,
  },
  {
    id: "premier-vote",
    category: "participation",
    titre: "Voter pour la premiere fois",
    description: "Exprimez votre voix sur une proposition active",
    action: "voter",
    icone: "Vote",
    ordre: 8,
  },
  {
    id: "premier-commentaire",
    category: "participation",
    titre: "Participer a un debat",
    description: "Laissez un commentaire sur une proposition",
    action: "commenter",
    icone: "MessageSquare",
    ordre: 9,
  },

  // --- Economie (3 etapes) ---
  {
    id: "consulter-solde",
    category: "economie",
    titre: "Consulter votre solde",
    description: "Decouvrez votre portefeuille et l'emission quotidienne",
    lien: "/bourse",
    icone: "Wallet",
    ordre: 10,
  },
  {
    id: "utiliser-calculateur",
    category: "economie",
    titre: "Utiliser le calculateur",
    description: "Calculez la valorisation d'un service avec la formule VITA",
    lien: "/bourse/calculateur",
    icone: "Calculator",
    ordre: 11,
  },
  {
    id: "explorer-historique",
    category: "economie",
    titre: "Explorer l'historique",
    description: "Consultez l'historique de vos transactions",
    lien: "/bourse/historique",
    icone: "History",
    ordre: 12,
  },
];

// ============================================================
// TOUR STEPS — 8 etapes du guide interactif
// ============================================================

export const TOUR_STEPS: TourStep[] = [
  {
    id: "tour-sidebar",
    target: "sidebar",
    titre: "La barre laterale",
    description:
      "Naviguez entre les sous-pages de chaque module. Vous pouvez la replier pour gagner de l'espace.",
    position: "right",
  },
  {
    id: "tour-panorama",
    target: "panorama",
    titre: "Panorama",
    description:
      "Votre tableau de bord. Consultez les statistiques globales de VITA en temps reel.",
    position: "right",
  },
  {
    id: "tour-agora",
    target: "agora",
    titre: "Agora",
    description:
      "L'espace democratique. Proposez, debattez et votez sur les decisions collectives.",
    position: "right",
  },
  {
    id: "tour-codex",
    target: "codex",
    titre: "Codex",
    description:
      "La constitution de VITA. Consultez les regles immuables et les parametres modifiables par vote.",
    position: "right",
  },
  {
    id: "tour-bourse",
    target: "bourse",
    titre: "Bourse",
    description:
      "Votre portefeuille VITA. Envoyez, recevez, et gerez vos Ѵ au quotidien.",
    position: "right",
  },
  {
    id: "tour-recherche",
    target: "recherche",
    titre: "Recherche globale",
    description:
      "Trouvez rapidement n'importe quel element : propositions, citoyens, parametres... Utilisez Ctrl+K.",
    position: "bottom",
  },
  {
    id: "tour-theme",
    target: "theme",
    titre: "Theme clair / sombre",
    description:
      "Basculez entre le theme clair et le theme sombre selon vos preferences.",
    position: "bottom",
  },
  {
    id: "tour-profil",
    target: "profil",
    titre: "Votre profil",
    description:
      "Accedez a vos parametres, votre profil Civis, et deconnectez-vous depuis ce menu.",
    position: "bottom",
  },
];

// ============================================================
// CATEGORY LABELS
// ============================================================

export const CATEGORY_LABELS: Record<string, string> = {
  identite: "Identite",
  decouverte: "Decouverte",
  participation: "Participation",
  economie: "Economie",
};

export const CATEGORY_ICONS: Record<string, string> = {
  identite: "UserCheck",
  decouverte: "Compass",
  participation: "Users",
  economie: "Coins",
};
