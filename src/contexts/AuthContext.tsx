"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type {
  User,
  UserRole,
  Permission,
  UserPreferences,
  RegisterData,
  StoredUser,
  AuthSession,
  IdentitePublique,
  IdentiteProfessionnelle,
  IdentiteVerifiee,
  ModeVisibilite,
} from "@/types/auth";
import { buildUserFromIdentity } from "@/types/auth";
import { hasPermission as checkPermission } from "@/lib/permissions";
import { seedMockUsers, forceSeedMockUsers } from "@/lib/mockUsers";
import { api, ApiError } from "@/lib/api";

// --- Context type ---

type RegisterResult =
  | true
  | string
  | { needsVerification: true; email: string };

type LoginResult =
  | true
  | false
  | { needsVerification: true; email: string };

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isMockMode: boolean;
  simulatedRole: UserRole | null;
  activeRole: UserRole;
  login: (emailOrUsername: string, password: string) => Promise<LoginResult>;
  register: (data: RegisterData) => Promise<RegisterResult>;
  verifyEmail: (token: string) => Promise<true | string>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  updateIdentitePublique: (data: Partial<IdentitePublique>) => void;
  updateIdentiteProfessionnelle: (data: Partial<IdentiteProfessionnelle>) => void;
  setModeVisibilite: (mode: ModeVisibilite) => void;
  setSimulatedRole: (role: UserRole | null) => void;
  hasPermission: (permission: Permission) => boolean;
  updateVerificationStatus: (statut: IdentiteVerifiee['statut'], data?: Partial<IdentiteVerifiee>) => void;
  transitionRole: (newRole: UserRole) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Storage helpers (mock mode) ---

const STORAGE_SESSION = "vita_session";
const STORAGE_USERS = "vita_users";

function getStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]): void {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session: AuthSession | null): void {
  if (session) {
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_SESSION);
  }
}

function storedToUser(stored: StoredUser): User {
  const { passwordHash: _, ...user } = stored;
  return user;
}

// Rebuild legacy fields from identity layers
function rebuildLegacyFields(user: StoredUser): StoredUser {
  if (!user.identiteVerifiee || !user.identitePublique || !user.identiteProfessionnelle) {
    return user;
  }
  const rebuilt = buildUserFromIdentity({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    dateInscription: user.dateInscription,
    identiteVerifiee: user.identiteVerifiee,
    identitePublique: user.identitePublique,
    identiteProfessionnelle: user.identiteProfessionnelle,
    preferences: user.preferences,
    soldeVita: user.soldeVita,
    joursActifs: user.joursActifs,
    propositionsCreees: user.propositionsCreees,
    votesEffectues: user.votesEffectues,
    scoreReputation: user.scoreReputation,
  });
  return { ...rebuilt, passwordHash: user.passwordHash };
}

// --- Default preferences ---

function defaultPreferences(): UserPreferences {
  return {
    theme: "dark",
    langue: "fr",
    notifications: {
      email: true,
      push: true,
      propositions: true,
      votes: true,
      transactions: true,
      systeme: true,
    },
    confidentialite: {
      profilPublic: true,
      afficherSolde: false,
      afficherActivite: true,
      afficherReputation: true,
    },
    accessibilite: {
      tailleTexte: "normal",
      contraste: "normal",
      animationsReduites: false,
    },
  };
}

// --- Default identity structures ---

function defaultIdentiteVerifiee(data: RegisterData) {
  return {
    nomLegal: data.nom,
    prenomLegal: data.prenom,
    dateNaissance: data.dateNaissance,
    nationalite: '',
    paysResidence: data.pays,
    statut: 'non_verifie' as const,
    niveauConfiance: 0,
    historiqueVerifications: [],
  };
}

function defaultIdentitePublique(data: RegisterData) {
  const mode = data.modeVisibilite ?? 'complet';
  return {
    modeVisibilite: mode,
    prenom: mode === 'complet' ? data.prenom : undefined,
    nom: mode === 'complet' ? data.nom : undefined,
    pseudonyme: mode === 'pseudonyme' ? data.pseudonyme : undefined,
    paysAffiche: mode === 'complet' ? data.pays : undefined,
    dateInscriptionVisible: mode === 'complet',
  };
}

function defaultIdentiteProfessionnelle() {
  return {
    active: false,
    disponibilite: 'indisponible' as const,
  };
}

// --- Helper: check if error is a network error ---

function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) return true; // fetch network failure
  if (err instanceof ApiError && err.status === 0) return true;
  return false;
}

// --- Provider ---

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(false);
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);
  const mockWarningShown = useRef(false);

  const activeRole: UserRole = simulatedRole ?? user?.role ?? "observateur";
  const isAuthenticated = user !== null;

  // Show mock mode warning once
  const activateMockMode = useCallback(() => {
    setIsMockMode(true);
    if (!mockWarningShown.current) {
      mockWarningShown.current = true;
      console.warn("[VITA] Backend indisponible, mode mock active");
    }
  }, []);

  // Try to convert API profile to local User
  function apiProfileToUser(profile: Awaited<ReturnType<typeof api.getMe>>): User {
    const verif = profile.verification;
    const pub_ = profile.identite_publique;

    const identiteVerifiee: IdentiteVerifiee = {
      nomLegal: pub_.prenom_affiche || '',
      prenomLegal: pub_.nom_affiche || '',
      dateNaissance: '',
      nationalite: '',
      paysResidence: pub_.pays_affiche || '',
      statut: (verif.statut || 'non_verifie') as IdentiteVerifiee['statut'],
      niveauConfiance: verif.niveau_confiance || 0,
      historiqueVerifications: [],
      ...(verif.date ? { dateVerification: verif.date } : {}),
      ...(verif.expiration ? { dateExpiration: verif.expiration } : {}),
    };

    const identitePublique: IdentitePublique = {
      modeVisibilite: (pub_.mode_visibilite || 'complet') as ModeVisibilite,
      prenom: pub_.prenom_affiche,
      nom: pub_.nom_affiche,
      pseudonyme: pub_.pseudonyme,
      bio: pub_.bio,
      photoProfil: pub_.photo_profil,
      paysAffiche: pub_.pays_affiche,
      dateInscriptionVisible: true,
    };

    const identiteProfessionnelle: IdentiteProfessionnelle = {
      active: false,
      disponibilite: 'indisponible',
    };

    return buildUserFromIdentity({
      id: profile.id,
      username: profile.username,
      email: profile.email,
      role: (profile.role || 'nouveau') as UserRole,
      dateInscription: profile.date_inscription || new Date().toISOString().split('T')[0],
      identiteVerifiee,
      identitePublique,
      identiteProfessionnelle,
      preferences: defaultPreferences(),
      soldeVita: profile.wallet ? parseFloat(profile.wallet.balance) : 0,
      joursActifs: 0,
      propositionsCreees: 0,
      votesEffectues: 0,
      scoreReputation: 0,
    });
  }

  // Restore session on mount — try API first, fallback to mock
  useEffect(() => {
    async function init() {
      // Check if we have a JWT token
      const token = api.getToken();
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(apiProfileToUser(profile));
          setIsLoading(false);
          return;
        } catch (err) {
          if (isNetworkError(err)) {
            activateMockMode();
            // Fall through to mock init
          } else {
            // Token invalid — clear and fall through
            api.clearTokens();
          }
        }
      }

      // Mock mode init
      const existingUsers = getStoredUsers();
      if (existingUsers.length > 0 && !existingUsers[0].identitePublique) {
        forceSeedMockUsers();
        saveSession(null);
      } else {
        seedMockUsers();
      }

      const session = getSession();
      if (session) {
        const users = getStoredUsers();
        const found = users.find((u) => u.id === session.userId);
        if (found) {
          setUser(storedToUser(found));
        } else {
          saveSession(null);
        }
      }
      setIsLoading(false);
    }

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Login: try API, fallback to mock ---

  const login = useCallback(async (emailOrUsername: string, password: string): Promise<LoginResult> => {
    if (!isMockMode) {
      try {
        const result = await api.login({
          username_or_email: emailOrUsername,
          password,
        });
        api.setToken(result.access_token);
        if (typeof window !== "undefined" && result.refresh_token) {
          localStorage.setItem("vita_refresh_token", result.refresh_token);
        }
        // Fetch full profile
        const profile = await api.getMe();
        setUser(apiProfileToUser(profile));
        setSimulatedRole(null);
        return true;
      } catch (err) {
        if (isNetworkError(err)) {
          activateMockMode();
          // Fall through to mock login
        } else if (err instanceof ApiError) {
          // Check for email_not_verified response (403)
          try {
            const parsed = JSON.parse(err.message);
            if (parsed.error === "email_not_verified" && parsed.email) {
              return { needsVerification: true, email: parsed.email };
            }
          } catch {
            // Not JSON — regular auth error
          }
          return false;
        } else {
          return false;
        }
      }
    }

    // Mock login
    const users = getStoredUsers();
    const found = users.find(
      (u) =>
        (u.email === emailOrUsername || u.username === emailOrUsername) &&
        u.passwordHash === password
    );
    if (!found) return false;

    const session: AuthSession = {
      userId: found.id,
      loginAt: new Date().toISOString(),
    };
    saveSession(session);
    setUser(storedToUser(found));
    setSimulatedRole(null);
    return true;
  }, [isMockMode, activateMockMode]);

  // --- Register: try API, fallback to mock ---

  const register = useCallback(async (data: RegisterData): Promise<RegisterResult> => {
    if (!isMockMode) {
      try {
        const result = await api.register({
          username: data.username,
          email: data.email,
          password: data.password,
          prenom: data.prenom,
          nom: data.nom,
          date_naissance: data.dateNaissance,
          pays: data.pays,
          mode_visibilite: data.modeVisibilite,
          pseudonyme: data.pseudonyme,
          nullifier_hash: data.nullifierHash,
        });
        // Backend now returns { message: "verification_email_sent", email, user_id }
        if (result.message === "verification_email_sent") {
          return { needsVerification: true, email: result.email };
        }
        return true;
      } catch (err) {
        if (isNetworkError(err)) {
          activateMockMode();
          // Fall through to mock register
        } else {
          // Return the backend error message so the UI can display it
          if (err instanceof ApiError) {
            try {
              const parsed = JSON.parse(err.message);
              return parsed.error || parsed.message || err.message;
            } catch {
              return err.message || "Erreur lors de l'inscription";
            }
          }
          return "Erreur lors de l'inscription";
        }
      }
    }

    // Mock register — no email verification, direct login
    const users = getStoredUsers();
    if (users.some((u) => u.email === data.email || u.username === data.username)) {
      return "Email ou username deja utilise";
    }

    const identiteVerifiee = defaultIdentiteVerifiee(data);
    const identitePublique = defaultIdentitePublique(data);
    const identiteProfessionnelle = defaultIdentiteProfessionnelle();

    const newUserBase = buildUserFromIdentity({
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      username: data.username,
      email: data.email,
      role: "nouveau",
      dateInscription: new Date().toISOString().split("T")[0],
      identiteVerifiee,
      identitePublique,
      identiteProfessionnelle,
      preferences: defaultPreferences(),
      soldeVita: 0,
      joursActifs: 0,
      propositionsCreees: 0,
      votesEffectues: 0,
      scoreReputation: 0,
    });

    const newUser: StoredUser = {
      ...newUserBase,
      passwordHash: data.password,
    };

    users.push(newUser);
    saveStoredUsers(users);

    const session: AuthSession = {
      userId: newUser.id,
      loginAt: new Date().toISOString(),
    };
    saveSession(session);
    setUser(storedToUser(newUser));
    return true;
  }, [isMockMode, activateMockMode]);

  // --- Verify email ---

  const verifyEmail = useCallback(async (token: string): Promise<true | string> => {
    try {
      const result = await api.verifyEmail(token);
      api.setToken(result.access_token);
      if (typeof window !== "undefined" && result.refresh_token) {
        localStorage.setItem("vita_refresh_token", result.refresh_token);
      }
      // Fetch full profile
      const profile = await api.getMe();
      setUser(apiProfileToUser(profile));
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        try {
          const parsed = JSON.parse(err.message);
          return parsed.error || parsed.message || err.message;
        } catch {
          return err.message || "Erreur lors de la verification";
        }
      }
      return "Erreur lors de la verification";
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Logout ---

  const logout = useCallback(() => {
    if (!isMockMode) {
      api.logout().catch(() => {});
    }
    api.clearTokens();
    saveSession(null);
    setUser(null);
    setSimulatedRole(null);
  }, [isMockMode]);

  // --- Refresh user from API ---

  const refreshUser = useCallback(async () => {
    if (isMockMode) return;
    try {
      const profile = await api.getMe();
      setUser(apiProfileToUser(profile));
    } catch (err) {
      if (isNetworkError(err)) {
        activateMockMode();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMockMode, activateMockMode]);

  // --- Local profile updates (mock mode or local state) ---

  const updateProfile = useCallback(
    (data: Partial<User>) => {
      if (!user) return;
      if (!isMockMode) {
        // Fire-and-forget API update
        api.updateProfile(data as Record<string, unknown>).catch(() => {});
      }
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx === -1) {
        // Not in mock storage — just update local state
        setUser((prev) => prev ? { ...prev, ...data, id: prev.id, role: prev.role } : prev);
        return;
      }
      const updated = { ...users[idx], ...data, id: user.id, role: users[idx].role };
      users[idx] = updated;
      saveStoredUsers(users);
      setUser(storedToUser(updated));
    },
    [user, isMockMode]
  );

  const updatePreferences = useCallback(
    (prefs: Partial<UserPreferences>) => {
      if (!user) return;
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx === -1) {
        setUser((prev) =>
          prev ? { ...prev, preferences: { ...prev.preferences, ...prefs } } : prev
        );
        return;
      }
      users[idx].preferences = { ...users[idx].preferences, ...prefs };
      saveStoredUsers(users);
      setUser(storedToUser(users[idx]));
    },
    [user]
  );

  const updateIdentitePublique = useCallback(
    (data: Partial<IdentitePublique>) => {
      if (!user) return;
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx === -1) {
        setUser((prev) =>
          prev ? { ...prev, identitePublique: { ...prev.identitePublique, ...data } } : prev
        );
        return;
      }
      users[idx].identitePublique = { ...users[idx].identitePublique, ...data };
      users[idx] = rebuildLegacyFields(users[idx]);
      saveStoredUsers(users);
      setUser(storedToUser(users[idx]));
    },
    [user]
  );

  const updateIdentiteProfessionnelle = useCallback(
    (data: Partial<IdentiteProfessionnelle>) => {
      if (!user) return;
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx === -1) {
        setUser((prev) =>
          prev
            ? { ...prev, identiteProfessionnelle: { ...prev.identiteProfessionnelle, ...data } }
            : prev
        );
        return;
      }
      users[idx].identiteProfessionnelle = { ...users[idx].identiteProfessionnelle, ...data };
      users[idx] = rebuildLegacyFields(users[idx]);
      saveStoredUsers(users);
      setUser(storedToUser(users[idx]));
    },
    [user]
  );

  const setModeVisibiliteFn = useCallback(
    (mode: ModeVisibilite) => {
      if (!user) return;
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx === -1) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                identitePublique: { ...prev.identitePublique, modeVisibilite: mode },
              }
            : prev
        );
        return;
      }
      users[idx].identitePublique = { ...users[idx].identitePublique, modeVisibilite: mode };
      users[idx] = rebuildLegacyFields(users[idx]);
      saveStoredUsers(users);
      setUser(storedToUser(users[idx]));
    },
    [user]
  );

  const updateVerificationStatus = useCallback(
    (statut: IdentiteVerifiee['statut'], data?: Partial<IdentiteVerifiee>) => {
      if (!user) return;
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx === -1) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                identiteVerifiee: { ...prev.identiteVerifiee, ...data, statut },
              }
            : prev
        );
        return;
      }
      users[idx].identiteVerifiee = {
        ...users[idx].identiteVerifiee,
        ...data,
        statut,
      };
      users[idx] = rebuildLegacyFields(users[idx]);
      saveStoredUsers(users);
      setUser(storedToUser(users[idx]));
    },
    [user]
  );

  const transitionRole = useCallback(
    (newRole: UserRole) => {
      if (!user) return;
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx === -1) {
        setUser((prev) => (prev ? { ...prev, role: newRole } : prev));
        return;
      }
      users[idx].role = newRole;
      saveStoredUsers(users);
      setUser(storedToUser(users[idx]));
    },
    [user]
  );

  const hasPermissionFn = useCallback(
    (permission: Permission): boolean => {
      return checkPermission(activeRole, permission);
    },
    [activeRole]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isMockMode,
        simulatedRole,
        activeRole,
        login,
        register,
        verifyEmail,
        logout,
        updateProfile,
        updatePreferences,
        updateIdentitePublique,
        updateIdentiteProfessionnelle,
        setModeVisibilite: setModeVisibiliteFn,
        setSimulatedRole,
        hasPermission: hasPermissionFn,
        updateVerificationStatus,
        transitionRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// --- Hook ---

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
