export const fr = {
  // Navigation
  "nav.agora": "Agora",
  "nav.forge": "Forge",
  "nav.codex": "Codex",
  "nav.civis": "Civis",
  "nav.bourse": "Bourse",
  "nav.panorama": "Panorama",
  "nav.notifications": "Notifications",
  "nav.settings": "Parametres",
  "nav.logout": "Se deconnecter",
  "nav.profile": "Mon profil",
  "nav.openMenu": "Ouvrir le menu",
  "nav.closeMenu": "Fermer le menu",
  "nav.userMenu": "Menu utilisateur",

  // Sidebar
  "sidebar.menu": "Menu",

  // Theme
  "theme.light": "Theme clair",
  "theme.dark": "Theme sombre",

  // Common
  "common.loading": "Chargement...",
  "common.error": "Erreur",
  "common.save": "Enregistrer",
  "common.cancel": "Annuler",
  "common.delete": "Supprimer",
  "common.search": "Rechercher",
  "common.noResults": "Aucun resultat",
  "common.seeAll": "Voir tout",
} as const;

export type TranslationKey = keyof typeof fr;
