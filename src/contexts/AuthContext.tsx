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
} from "@/types/auth";
import { hasPermission as checkPermission } from "@/lib/permissions";
import { seedMockUsers } from "@/lib/mockUsers";

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

// --- Provider ---

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);

  const activeRole: UserRole = simulatedRole ?? user?.role ?? "observateur";
  const isAuthenticated = user !== null;

  // Restore session on mount
  useEffect(() => {
    seedMockUsers();

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

    const newUser: StoredUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      prenom: data.prenom,
      nom: data.nom,
      username: data.username,
      email: data.email,
      passwordHash: data.password,
      dateNaissance: data.dateNaissance,
      pays: data.pays,
      role: "dieu", // Default: dieu (mode dev)
      dateInscription: new Date().toISOString().split("T")[0],
      preferences: defaultPreferences(),
      soldeVita: 0,
      joursActifs: 0,
      propositionsCreees: 0,
      votesEffectues: 0,
      scoreReputation: 0,
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
    // Redirect happens in the component layer, not here
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
