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
import { api, ApiError } from "@/lib/api";

interface VerificationContextType {
  demandes: DemandeVerification[];
  parrainages: Parrainage[];
  demandesParrainage: DemandeParrainage[];
  isLoading: boolean;
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

// --- Helper: check if error is a network error ---

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  if (err instanceof ApiError && err.status === 0) return true;
  return false;
}

// --- Helper: map backend demande to local type ---

function mapApiDemande(apiDemande: Record<string, unknown>): DemandeVerification {
  return {
    id: String(apiDemande.id || ""),
    demandeurId: String(apiDemande.demandeur_id || ""),
    demandeurUsername: String(apiDemande.demandeur_username || ""),
    statut: String(apiDemande.statut || "en_attente") as DemandeVerification["statut"],
    methode: String(apiDemande.methode || "parrainage") as DemandeVerification["methode"],
    dateCreation: String(apiDemande.date_creation || new Date().toISOString()),
    dateExpiration: String(apiDemande.date_expiration || ""),
    parrainagesIds: Array.isArray(apiDemande.parrainages_ids) ? apiDemande.parrainages_ids.map(String) : [],
    niveauConfiance: Number(apiDemande.niveau_confiance || 0),
  };
}

// --- Helper: map backend parrainage to local type ---

function mapApiParrainage(apiP: Record<string, unknown>): Parrainage {
  return {
    id: String(apiP.id || ""),
    parrainId: String(apiP.parrain_id || ""),
    parrainUsername: String(apiP.parrain_username || ""),
    filleulId: String(apiP.filleul_id || ""),
    filleulUsername: String(apiP.filleul_username || ""),
    demandeVerifId: String(apiP.demande_verif_id || apiP.demande_id || ""),
    statut: String(apiP.statut || "en_attente") as Parrainage["statut"],
    dateCreation: String(apiP.date_creation || new Date().toISOString()),
    dateReponse: apiP.date_reponse ? String(apiP.date_reponse) : undefined,
    attestation: apiP.attestation as AttestationParrain | undefined,
  };
}

// --- Helper: map backend demande parrainage to local type ---

function mapApiDemandeParrainage(apiDp: Record<string, unknown>): DemandeParrainage {
  return {
    id: String(apiDp.id || ""),
    demandeVerifId: String(apiDp.demande_verif_id || apiDp.demande_id || ""),
    demandeurId: String(apiDp.demandeur_id || ""),
    demandeurUsername: String(apiDp.demandeur_username || ""),
    demandeurPrenom: String(apiDp.demandeur_prenom || ""),
    parrainId: String(apiDp.parrain_id || ""),
    parrainUsername: String(apiDp.parrain_username || ""),
    dateCreation: String(apiDp.date_creation || new Date().toISOString()),
    statut: String(apiDp.statut || "en_attente") as DemandeParrainage["statut"],
    attestation: apiDp.attestation as AttestationParrain | undefined,
  };
}

export function VerificationProvider({ children }: { children: ReactNode }) {
  const { user, isMockMode, updateVerificationStatus, transitionRole } = useAuth();
  const { addNotification } = useNotifications();
  const [demandes, setDemandes] = useState<DemandeVerification[]>([]);
  const [parrainages, setParrainages] = useState<Parrainage[]>([]);
  const [demandesParrainage, setDemandesParrainage] = useState<DemandeParrainage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data: try API first, fallback to localStorage/mock
  useEffect(() => {
    async function init() {
      if (!user) {
        setIsLoading(false);
        setLoaded(true);
        return;
      }

      // Try real API if not in mock mode
      if (!isMockMode) {
        try {
          // Only fetch parrainages for verified users (endpoint requires verified status)
          const isVerified = user.identiteVerifiee?.statut === "verifie";
          const [apiDemande, apiParrainages] = await Promise.all([
            api.getDemandeActive().catch(() => null),
            isVerified ? api.getParrainagesRecus().catch(() => []) : Promise.resolve([]),
          ]);

          const loadedDemandes: DemandeVerification[] = [];
          if (apiDemande && typeof apiDemande === "object") {
            loadedDemandes.push(mapApiDemande(apiDemande as Record<string, unknown>));
          }

          const loadedParrainages: Parrainage[] = Array.isArray(apiParrainages)
            ? (apiParrainages as Record<string, unknown>[]).map(mapApiParrainage)
            : [];

          // Received sponsorship requests (as sponsor)
          const loadedDemandesP: DemandeParrainage[] = Array.isArray(apiParrainages)
            ? (apiParrainages as Record<string, unknown>[]).map(mapApiDemandeParrainage)
            : [];

          setDemandes(loadedDemandes);
          setParrainages(loadedParrainages);
          setDemandesParrainage(loadedDemandesP);
          setLoaded(true);
          setIsLoading(false);
          return;
        } catch (err) {
          if (!isNetworkError(err)) {
            // API reachable but returned error — still use API data
            setLoaded(true);
            setIsLoading(false);
            return;
          }
          // Network error — fall through to mock
        }
      }

      // Mock mode: load from localStorage or seed with mocks
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
      setIsLoading(false);
    }

    init();
  }, [user, isMockMode]);

  // Persist to localStorage (mock mode only)
  useEffect(() => {
    if (!loaded || !isMockMode) return;
    saveState({ demandes, parrainages, demandesParrainage });
  }, [demandes, parrainages, demandesParrainage, loaded, isMockMode]);

  const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const demarrerVerification = useCallback(
    async (parrainUsernames: string[]) => {
      if (!user) return;

      // Try real API first
      if (!isMockMode) {
        try {
          // Search for parrain user IDs
          const parrainIds: string[] = [];
          for (const username of parrainUsernames) {
            const results = await api.searchParrains(username) as Array<{ id: string }>;
            if (results.length > 0) {
              parrainIds.push(results[0].id);
            }
          }

          const result = await api.createDemandeVerification({
            parrains: parrainIds,
            message: undefined,
          }) as Record<string, unknown>;

          if (result) {
            setDemandes((prev) => [...prev, mapApiDemande(result)]);
          }

          // Invite each sponsor
          for (const parrainId of parrainIds) {
            await api.inviterParrain({ parrain_id: parrainId }).catch(() => {});
          }

          return;
        } catch (err) {
          if (!isNetworkError(err)) return;
          // Fall through to mock
        }
      }

      // Mock mode
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
        methodeVerification: "document",
        parrains: [],
      });

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
    [user, isMockMode, updateVerificationStatus, addNotification]
  );

  const envoyerDemandeParrainage = useCallback(
    async (parrainUsername: string) => {
      if (!user) return;

      // Try real API first
      if (!isMockMode) {
        try {
          const results = await api.searchParrains(parrainUsername) as Array<{ id: string }>;
          if (results.length > 0) {
            await api.inviterParrain({ parrain_id: results[0].id });
          }
          return;
        } catch (err) {
          if (!isNetworkError(err)) return;
          // Fall through to mock
        }
      }

      // Mock mode
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
    [user, isMockMode, demandes, addNotification]
  );

  const repondreParrainage = useCallback(
    async (demandeParrainageId: string, accepte: boolean, attestation?: AttestationParrain) => {
      if (!user) return;
      const now = new Date().toISOString();

      // Try real API first
      if (!isMockMode) {
        try {
          if (accepte) {
            await api.attester(demandeParrainageId, {
              lien: attestation?.contexte || "Parrainage VITA",
              commentaire: attestation?.commentaire,
            });
          } else {
            await api.refuserParrainage(demandeParrainageId, {
              motif: "Refuse par le parrain",
            });
          }
          // Reload data from API
          const [apiDemande, apiParrainages] = await Promise.all([
            api.getDemandeActive().catch(() => null),
            api.getParrainagesRecus().catch(() => []),
          ]);
          if (apiDemande && typeof apiDemande === "object") {
            setDemandes([mapApiDemande(apiDemande as Record<string, unknown>)]);
          }
          if (Array.isArray(apiParrainages)) {
            setParrainages((apiParrainages as Record<string, unknown>[]).map(mapApiParrainage));
            setDemandesParrainage((apiParrainages as Record<string, unknown>[]).map(mapApiDemandeParrainage));
          }
          return;
        } catch (err) {
          if (!isNetworkError(err)) return;
          // Fall through to mock
        }
      }

      // Mock mode
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

            const users = JSON.parse(localStorage.getItem("vita_users") || "[]");
            const filleulIdx = users.findIndex((u: { id: string }) => u.id === demande.demandeurId);
            if (filleulIdx !== -1) {
              const verificationDate = now;
              const expirationDate = new Date(Date.now() + DUREE_VALIDITE_JOURS * 86400000).toISOString();

              const acceptedParrains = allParrainages
                .filter((p) => p.statut === "accepte")
                .map((p) => ({ username: p.parrainUsername, dateAttestation: p.dateReponse || now }));
              acceptedParrains.push({ username: user.username, dateAttestation: now });

              users[filleulIdx].identiteVerifiee = {
                ...users[filleulIdx].identiteVerifiee,
                statut: "verifie",
                dateVerification: verificationDate,
                dateExpiration: expirationDate,
                methodeVerification: "document",
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
    [user, isMockMode, demandes, parrainages, demandesParrainage, addNotification]
  );

  const renouvelerVerification = useCallback(async () => {
    if (!user) return;

    // Try real API: cancel existing demande and start fresh
    if (!isMockMode) {
      try {
        await api.annulerDemande();
      } catch {
        // Ignore — may not have an active demande
      }
    }

    // Reset verification to start fresh
    updateVerificationStatus("non_verifie", {
      dateVerification: undefined,
      dateExpiration: undefined,
      parrains: [],
      niveauConfiance: 0,
    });
  }, [user, isMockMode, updateVerificationStatus]);

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
        isLoading,
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
