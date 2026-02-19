import type { Notification } from "@/types/notifications";

function ago(hours: number): string {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

export const MOCK_VERIFICATION_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-verif-001",
    type: "demande_parrainage",
    titre: "Demande de parrainage",
    message: "Fatou Diop vous demande de parrainer sa verification d'identite.",
    date: ago(240),
    lue: true,
    lien: "/civis/parrainages",
    icone: "UserPlus",
    couleur: "blue",
  },
  {
    id: "notif-verif-002",
    type: "attestation_recue",
    titre: "Attestation recue",
    message: "Maxim a atteste l'identite de Fatou Diop.",
    date: ago(192),
    lue: true,
    lien: "/civis/verification",
    icone: "ShieldCheck",
    couleur: "green",
  },
  {
    id: "notif-verif-003",
    type: "attestation_recue",
    titre: "Attestation recue",
    message: "Amina a atteste l'identite de Fatou Diop.",
    date: ago(144),
    lue: true,
    lien: "/civis/verification",
    icone: "ShieldCheck",
    couleur: "green",
  },
  {
    id: "notif-verif-004",
    type: "rappel_parrainage",
    titre: "Rappel de parrainage",
    message: "Fatou Diop attend toujours votre attestation de parrainage.",
    date: ago(48),
    lue: false,
    lien: "/civis/parrainages",
    icone: "Bell",
    couleur: "orange",
  },
  {
    id: "notif-verif-005",
    type: "verification_expiration",
    titre: "Verification bientot expiree",
    message: "Votre verification d'identite expire dans 30 jours. Pensez a la renouveler.",
    date: ago(72),
    lue: false,
    lien: "/civis/verification",
    icone: "AlertTriangle",
    couleur: "orange",
  },
  {
    id: "notif-verif-006",
    type: "verification_expiree",
    titre: "Verification expiree",
    message: "Votre verification d'identite a expire. Renouvelez-la pour conserver vos acces.",
    date: ago(24),
    lue: false,
    lien: "/civis/verification",
    icone: "ShieldX",
    couleur: "red",
  },
];
