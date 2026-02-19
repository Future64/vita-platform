// Mock data pour le flux de verification d'identite

import type { DemandeVerification, Parrainage, DemandeParrainage } from "@/types/verification";

// --- Demandes de verification ---

export const MOCK_DEMANDES_VERIFICATION: DemandeVerification[] = [
  {
    id: "dv-001",
    demandeurId: "usr-007-nouveau",
    demandeurUsername: "fatou_diop",
    statut: "en_cours",
    methode: "parrainage",
    dateCreation: "2026-02-08T10:00:00Z",
    dateExpiration: "2026-03-10T10:00:00Z",
    parrainagesIds: ["par-001", "par-002", "par-003"],
    niveauConfiance: 55,
  },
  {
    id: "dv-002",
    demandeurId: "usr-008-expire",
    demandeurUsername: "ancien_citoyen",
    statut: "expiree",
    methode: "parrainage",
    dateCreation: "2025-01-10T08:00:00Z",
    dateExpiration: "2025-02-09T08:00:00Z",
    parrainagesIds: [],
    niveauConfiance: 0,
  },
];

// --- Parrainages ---

export const MOCK_PARRAINAGES: Parrainage[] = [
  {
    id: "par-001",
    parrainId: "usr-001-dieu",
    parrainUsername: "maxim",
    filleulId: "usr-007-nouveau",
    filleulUsername: "fatou_diop",
    demandeVerifId: "dv-001",
    statut: "accepte",
    dateCreation: "2026-02-08T10:30:00Z",
    dateReponse: "2026-02-10T14:00:00Z",
    attestation: {
      commentaire: "Je connais Fatou via le forum VITA. Personne fiable et engagee.",
      connaitDepuis: "6 mois",
      contexte: "Communaute en ligne",
      engagement: true,
    },
  },
  {
    id: "par-002",
    parrainId: "usr-002-citoyen",
    parrainUsername: "amina.b",
    filleulId: "usr-007-nouveau",
    filleulUsername: "fatou_diop",
    demandeVerifId: "dv-001",
    statut: "accepte",
    dateCreation: "2026-02-08T10:35:00Z",
    dateReponse: "2026-02-12T09:00:00Z",
    attestation: {
      commentaire: "Fatou est une collegue infirmiere. Je la connais bien.",
      connaitDepuis: "2 ans",
      contexte: "Collegue de travail",
      engagement: true,
    },
  },
  {
    id: "par-003",
    parrainId: "usr-003-moderateur",
    parrainUsername: "lucas.d",
    filleulId: "usr-007-nouveau",
    filleulUsername: "fatou_diop",
    demandeVerifId: "dv-001",
    statut: "en_attente",
    dateCreation: "2026-02-08T10:40:00Z",
  },
];

// --- Demandes de parrainage (vue parrain) ---

export const MOCK_DEMANDES_PARRAINAGE: DemandeParrainage[] = [
  {
    id: "dp-001",
    demandeVerifId: "dv-001",
    demandeurId: "usr-007-nouveau",
    demandeurUsername: "fatou_diop",
    demandeurPrenom: "Fatou",
    parrainId: "usr-001-dieu",
    parrainUsername: "maxim",
    dateCreation: "2026-02-08T10:30:00Z",
    statut: "accepte",
    attestation: {
      commentaire: "Je connais Fatou via le forum VITA. Personne fiable et engagee.",
      connaitDepuis: "6 mois",
      contexte: "Communaute en ligne",
      engagement: true,
    },
  },
  {
    id: "dp-002",
    demandeVerifId: "dv-001",
    demandeurId: "usr-007-nouveau",
    demandeurUsername: "fatou_diop",
    demandeurPrenom: "Fatou",
    parrainId: "usr-002-citoyen",
    parrainUsername: "amina.b",
    dateCreation: "2026-02-08T10:35:00Z",
    statut: "accepte",
    attestation: {
      commentaire: "Fatou est une collegue infirmiere. Je la connais bien.",
      connaitDepuis: "2 ans",
      contexte: "Collegue de travail",
      engagement: true,
    },
  },
  {
    id: "dp-003",
    demandeVerifId: "dv-001",
    demandeurId: "usr-007-nouveau",
    demandeurUsername: "fatou_diop",
    demandeurPrenom: "Fatou",
    parrainId: "usr-003-moderateur",
    parrainUsername: "lucas.d",
    dateCreation: "2026-02-08T10:40:00Z",
    statut: "en_attente",
  },
];
