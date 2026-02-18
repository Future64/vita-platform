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
  User,
  UserRole,
  Permission,
  UserPreferences,
  RegisterData,
  StoredUser,
  AuthSession,
  IdentitePublique,
  IdentiteProfessionnelle,
  ModeVisibilite,
} from "@/types/auth";
import { buildUserFromIdentity } from "@/types/auth";
import { hasPermission as checkPermission } from "@/lib/permissions";
import { seedMockUsers, forceSeedMockUsers } from "@/lib/mockUsers";

// --- Context type ---

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  simulatedRole: UserRole | null;
  activeRole: UserRole;
  login: (emailOrUsername: string, password: string) => boolean;
  register: (data: RegisterData) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  updateIdentitePublique: (data: Partial<IdentitePublique>) => void;
  updateIdentiteProfessionnelle: (data: Partial<IdentiteProfessionnelle>) => void;
  setModeVisibilite: (mode: ModeVisibilite) => void;
  setSimulatedRole: (role: UserRole | null) => void;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Storage helpers ---

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

// --- Provider ---

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);

  const activeRole: UserRole = simulatedRole ?? user?.role ?? "observateur";
  const isAuthenticated = user !== null;

  // Restore session on mount
  useEffect(() => {
    // Migrate: if stored users lack identity structures, force reseed
    const existingUsers = getStoredUsers();
    if (existingUsers.length > 0 && !existingUsers[0].identitePublique) {
      forceSeedMockUsers();
      // Clear stale session since user data has changed
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
  }, []);

  const login = useCallback((emailOrUsername: string, password: string): boolean => {
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
  }, []);

  const register = useCallback((data: RegisterData): boolean => {
    const users = getStoredUsers();

    // Check for duplicates
    if (users.some((u) => u.email === data.email || u.username === data.username)) {
      return false;
    }

    const identiteVerifiee = defaultIdentiteVerifiee(data);
    const identitePublique = defaultIdentitePublique(data);
    const identiteProfessionnelle = defaultIdentiteProfessionnelle();

    const newUserBase = buildUserFromIdentity({
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      username: data.username,
      email: data.email,
      role: "dieu", // Default: dieu (mode dev)
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
  }, []);

  const logout = useCallback(() => {
    saveSession(null);
    setUser(null);
    setSimulatedRole(null);
  }, []);

  const updateProfile = useCallback(
    (data: Partial<User>) => {
      if (!user) return;
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx === -1) return;

      const updated = { ...users[idx], ...data, id: user.id, role: users[idx].role };
      users[idx] = updated;
      saveStoredUsers(users);
      setUser(storedToUser(updated));
    },
    [user]
  );

  const updatePreferences = useCallback(
    (prefs: Partial<UserPreferences>) => {
      if (!user) return;
      const users = getStoredUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx === -1) return;

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
      if (idx === -1) return;

      users[idx].identitePublique = { ...users[idx].identitePublique, ...data };
      // Rebuild legacy fields
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
      if (idx === -1) return;

      users[idx].identiteProfessionnelle = { ...users[idx].identiteProfessionnelle, ...data };
      // Rebuild legacy fields
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
      if (idx === -1) return;

      users[idx].identitePublique = { ...users[idx].identitePublique, modeVisibilite: mode };
      // Rebuild legacy fields
      users[idx] = rebuildLegacyFields(users[idx]);
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
        simulatedRole,
        activeRole,
        login,
        register,
        logout,
        updateProfile,
        updatePreferences,
        updateIdentitePublique,
        updateIdentiteProfessionnelle,
        setModeVisibilite: setModeVisibiliteFn,
        setSimulatedRole,
        hasPermission: hasPermissionFn,
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
