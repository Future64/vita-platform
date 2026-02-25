export const authMe = {
  id: "user-dev",
  username: "dev_user",
  email: "dev@vita.io",
  role: "referent",
  identite_publique: {
    mode_visibilite: "pseudonyme",
    prenom_affiche: "Dev",
    nom_affiche: "User",
    pseudonyme: "dev_user",
    bio: "Compte de developpement",
    photo_profil: null,
    pays_affiche: "France",
  },
  verification: {
    statut: "verifie",
    date: "2025-01-01T00:00:00Z",
    expiration: "2026-01-01T00:00:00Z",
    niveau_confiance: 3,
  },
  wallet: {
    id: "wallet-dev",
    balance: "47.50000000",
    total_received: "148.00000000",
  },
  date_inscription: "2025-01-01T00:00:00Z",
  derniere_connexion: new Date().toISOString(),
};
