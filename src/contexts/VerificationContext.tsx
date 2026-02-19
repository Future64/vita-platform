"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type {
  DemandeVerification,
  Parrainage,
  DemandeParrainage,
  AttestationParrain,
} from "@/types/verification";
import {
  PARRAINS_REQUIS,
  CONFIANCE_PAR_PARRAIN,
  DUREE_VERIFICATION_JOURS,
  DUREE_VALIDITE_JOURS,
} from "@/types/verification";
import {
  MOCK_DEMANDES_VERIFICATION,
  MOCK_PARRAINAGES,
  MOCK_DEMANDES_PARRAINAGE,
} from "@/lib/mockVerification";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";

interface VerificationContextType {
  demandes: DemandeVerification[];
  parrainages: Parrainage[];
  demandesParrainage: DemandeParrainage[];
  // Actions
  demarrerVerification: (parrainUsernames: string[]) => void;
  envoyerDemandeParrainage: (parrainUsername: string) => void;
  repondreParrainage: (demandeParrainageId: string, accepte: boolean, attestation?: AttestationParrain) => void;
  renouvelerVerification: () => void;
  // Queries
  getDemandeForUser: (userId: string) => DemandeVerification | undefined;
  getParrainagesPourDemande: (demandeId: string) => Parrainage[];
  getDemandesRecues: (parrainId: string) => DemandeParrainage[];
  getDemandesRecuesEnAttente: (parrainId: string) => DemandeParrainage[];
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

const STORAGE_KEY = "vita_verification";

function loadState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(data: {
  demandes: DemandeVerification[];
  parrainages: Parrainage[];
  demandesParrainage: DemandeParrainage[];
}) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function VerificationProvider({ children }: { children: ReactNode }) {
  const { user, updateVerificationStatus, transitionRole } = useAuth();
  const { addNotification } = useNotifications();
  const [demandes, setDemandes] = useState<DemandeVerification[]>([]);
  const [parrainages, setParrainages] = useState<Parrainage[]>([]);
  const [demandesParrainage, setDemandesParrainage] = useState<DemandeParrainage[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage or seed with mocks
  useEffect(() => {
    const stored = loadState();
    if (stored) {
      setDemandes(stored.demandes || []);
      setParrainages(stored.parrainages || []);
      setDemandesParrainage(stored.demandesParrainage || []);
    } else {
      setDemandes(MOCK_DEMANDES_VERIFICATION);
      setParrainages(MOCK_PARRAINAGES);
      setDemandesParrainage(MOCK_DEMANDES_PARRAINAGE);
    }
    setLoaded(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!loaded) return;
    saveState({ demandes, parrainages, demandesParrainage });
  }, [demandes, parrainages, demandesParrainage, loaded]);

  const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const demarrerVerification = useCallback(
    (parrainUsernames: string[]) => {
      if (!user) return;

      const demandeId = `dv-${genId()}`;
      const now = new Date().toISOString();
      const expiration = new Date(Date.now() + DUREE_VERIFICATION_JOURS * 86400000).toISOString();

      const nouveauxParrainages: Parrainage[] = parrainUsernames.map((username) => ({
        id: `par-${genId()}`,
        parrainId: "",
        parrainUsername: username,
        filleulId: user.id,
        filleulUsername: user.username,
        demandeVerifId: demandeId,
        statut: "en_attente" as const,
        dateCreation: now,
      }));

      const nouvellesDemandesParrainage: DemandeParrainage[] = parrainUsernames.map((username, i) => ({
        id: `dp-${genId()}-${i}`,
        demandeVerifId: demandeId,
        demandeurId: user.id,
        demandeurUsername: user.username,
        demandeurPrenom: user.prenom,
        parrainId: "",
        parrainUsername: username,
        dateCreation: now,
        statut: "en_attente" as const,
      }));

      const demande: DemandeVerification = {
        id: demandeId,
        demandeurId: user.id,
        demandeurUsername: user.username,
        statut: "en_cours",
        methode: "parrainage",
        dateCreation: now,
        dateExpiration: expiration,
        parrainagesIds: nouveauxParrainages.map((p) => p.id),
        niveauConfiance: 0,
      };

      setDemandes((prev) => [...prev, demande]);
      setParrainages((prev) => [...prev, ...nouveauxParrainages]);
      setDemandesParrainage((prev) => [...prev, ...nouvellesDemandesParrainage]);

      updateVerificationStatus("en_cours", {
        methodeVerification: "parrainage",
        parrains: [],
      });

      // Send notifications to sponsors
      parrainUsernames.forEach((username) => {
        addNotification({
          id: `notif-${genId()}`,
          type: "demande_parrainage",
          titre: "Demande de parrainage",
          message: `${user.prenom} ${user.nom} vous demande de parrainer sa verification d'identite.`,
          date: now,
          lue: false,
          lien: "/civis/parrainages",
          icone: "UserPlus",
          couleur: "blue",
        });
      });
    },
    [user, updateVerificationStatus, addNotification]
  );

  const envoyerDemandeParrainage = useCallback(
    (parrainUsername: string) => {
      if (!user) return;
      const activeDemande = demandes.find(
        (d) => d.demandeurId === user.id && (d.statut === "en_cours" || d.statut === "en_attente")
      );
      if (!activeDemande) return;

      const now = new Date().toISOString();
      const newParrainage: Parrainage = {
        id: `par-${genId()}`,
        parrainId: "",
        parrainUsername,
        filleulId: user.id,
        filleulUsername: user.username,
        demandeVerifId: activeDemande.id,
        statut: "en_attente",
        dateCreation: now,
      };

      const newDemande: DemandeParrainage = {
        id: `dp-${genId()}`,
        demandeVerifId: activeDemande.id,
        demandeurId: user.id,
        demandeurUsername: user.username,
        demandeurPrenom: user.prenom,
        parrainId: "",
        parrainUsername,
        dateCreation: now,
        statut: "en_attente",
      };

      setParrainages((prev) => [...prev, newParrainage]);
      setDemandesParrainage((prev) => [...prev, newDemande]);
      setDemandes((prev) =>
        prev.map((d) =>
          d.id === activeDemande.id
            ? { ...d, parrainagesIds: [...d.parrainagesIds, newParrainage.id] }
            : d
        )
      );

      addNotification({
        id: `notif-${genId()}`,
        type: "demande_parrainage",
        titre: "Demande de parrainage",
        message: `${user.prenom} vous demande de parrainer sa verification d'identite.`,
        date: now,
        lue: false,
        lien: "/civis/parrainages",
        icone: "UserPlus",
        couleur: "blue",
      });
    },
    [user, demandes, addNotification]
  );

  const repondreParrainage = useCallback(
    (demandeParrainageId: string, accepte: boolean, attestation?: AttestationParrain) => {
      if (!user) return;
      const now = new Date().toISOString();

      // Update DemandeParrainage
      setDemandesParrainage((prev) =>
        prev.map((dp) =>
          dp.id === demandeParrainageId
            ? { ...dp, statut: accepte ? "accepte" as const : "refuse" as const, attestation }
            : dp
        )
      );

      // Find the corresponding demande to update parrainage
      const dp = demandesParrainage.find((d) => d.id === demandeParrainageId);
      if (!dp) return;

      // Update Parrainage
      setParrainages((prev) =>
        prev.map((p) =>
          p.demandeVerifId === dp.demandeVerifId && p.parrainUsername === user.username
            ? { ...p, statut: accepte ? "accepte" as const : "refuse" as const, dateReponse: now, attestation }
            : p
        )
      );

      // Send notification to the demandeur
      if (accepte) {
        addNotification({
          id: `notif-${genId()}`,
          type: "attestation_recue",
          titre: "Attestation recue",
          message: `${user.prenom} a atteste votre identite.`,
          date: now,
          lue: false,
          lien: "/civis/verification",
          icone: "ShieldCheck",
          couleur: "green",
        });
      } else {
        addNotification({
          id: `notif-${genId()}`,
          type: "parrainage_refuse",
          titre: "Parrainage refuse",
          message: `${user.prenom} a refuse votre demande de parrainage.`,
          date: now,
          lue: false,
          lien: "/civis/verification",
          icone: "ShieldX",
          couleur: "red",
        });
      }

      // Check if verification is complete (3 accepted sponsors)
      if (accepte) {
        const allParrainages = parrainages.filter((p) => p.demandeVerifId === dp.demandeVerifId);
        const acceptedCount = allParrainages.filter((p) => p.statut === "accepte").length + 1; // +1 for current

        if (acceptedCount >= PARRAINS_REQUIS) {
          // Verification complete!
          const demande = demandes.find((d) => d.id === dp.demandeVerifId);
          if (demande) {
            setDemandes((prev) =>
              prev.map((d) =>
                d.id === dp.demandeVerifId
                  ? { ...d, statut: "validee" as const, niveauConfiance: CONFIANCE_PAR_PARRAIN * PARRAINS_REQUIS }
                  : d
              )
            );

            // This will be called for the filleul user, so we need to check
            // if the current logged-in user IS the filleul — but in mock mode,
            // the transition is triggered server-side. We simulate it here.
            // The actual user state update needs to happen via stored users.
            const users = JSON.parse(localStorage.getItem("vita_users") || "[]");
            const filleulIdx = users.findIndex((u: { id: string }) => u.id === demande.demandeurId);
            if (filleulIdx !== -1) {
              const verificationDate = now;
              const expirationDate = new Date(Date.now() + DUREE_VALIDITE_JOURS * 86400000).toISOString();

              // Get all accepted sponsors for the parrains array
              const acceptedParrains = allParrainages
                .filter((p) => p.statut === "accepte")
                .map((p) => ({ username: p.parrainUsername, dateAttestation: p.dateReponse || now }));
              // Add current acceptance
              acceptedParrains.push({ username: user.username, dateAttestation: now });

              users[filleulIdx].identiteVerifiee = {
                ...users[filleulIdx].identiteVerifiee,
                statut: "verifie",
                dateVerification: verificationDate,
                dateExpiration: expirationDate,
                methodeVerification: "parrainage",
                parrains: acceptedParrains,
                niveauConfiance: CONFIANCE_PAR_PARRAIN * PARRAINS_REQUIS,
                historiqueVerifications: [
                  ...users[filleulIdx].identiteVerifiee.historiqueVerifications,
                  { date: verificationDate, methode: `Parrainage (${PARRAINS_REQUIS}/${PARRAINS_REQUIS})`, statut: "accepte" },
                ],
              };
              users[filleulIdx].role = "citoyen";
              localStorage.setItem("vita_users", JSON.stringify(users));
            }

            addNotification({
              id: `notif-${genId()}`,
              type: "verification_complete",
              titre: "Verification terminee !",
              message: `La verification d'identite de ${demande.demandeurUsername} est complete. Role: citoyen.`,
              date: now,
              lue: false,
              lien: "/civis/verification",
              icone: "ShieldCheck",
              couleur: "green",
            });
          }
        } else {
          // Update confidence level
          setDemandes((prev) =>
            prev.map((d) =>
              d.id === dp.demandeVerifId
                ? { ...d, niveauConfiance: CONFIANCE_PAR_PARRAIN * acceptedCount }
                : d
            )
          );
        }
      }
    },
    [user, demandes, parrainages, demandesParrainage, addNotification]
  );

  const renouvelerVerification = useCallback(() => {
    if (!user) return;
    // Reset verification to start fresh
    updateVerificationStatus("non_verifie", {
      dateVerification: undefined,
      dateExpiration: undefined,
      parrains: [],
      niveauConfiance: 0,
    });
  }, [user, updateVerificationStatus]);

  const getDemandeForUser = useCallback(
    (userId: string) => {
      return demandes
        .filter((d) => d.demandeurId === userId)
        .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())[0];
    },
    [demandes]
  );

  const getParrainagesPourDemande = useCallback(
    (demandeId: string) => {
      return parrainages.filter((p) => p.demandeVerifId === demandeId);
    },
    [parrainages]
  );

  const getDemandesRecues = useCallback(
    (parrainId: string) => {
      // Match by username since parrainId might be empty in mock data
      const username = user?.username;
      if (!username) return [];
      return demandesParrainage.filter((dp) => dp.parrainUsername === username);
    },
    [demandesParrainage, user]
  );

  const getDemandesRecuesEnAttente = useCallback(
    (parrainId: string) => {
      const username = user?.username;
      if (!username) return [];
      return demandesParrainage.filter((dp) => dp.parrainUsername === username && dp.statut === "en_attente");
    },
    [demandesParrainage, user]
  );

  return (
    <VerificationContext.Provider
      value={{
        demandes,
        parrainages,
        demandesParrainage,
        demarrerVerification,
        envoyerDemandeParrainage,
        repondreParrainage,
        renouvelerVerification,
        getDemandeForUser,
        getParrainagesPourDemande,
        getDemandesRecues,
        getDemandesRecuesEnAttente,
      }}
    >
      {children}
    </VerificationContext.Provider>
  );
}

export function useVerification(): VerificationContextType {
  const context = useContext(VerificationContext);
  if (context === undefined) {
    throw new Error("useVerification must be used within a VerificationProvider");
  }
  return context;
}
