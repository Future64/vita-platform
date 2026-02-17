"use client";

import { useState, useCallback, useEffect } from "react";
import {
  User,
  Palette,
  Bell,
  Shield,
  Lock,
  Code,
  Settings,
  Save,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  Monitor,
  Sun,
  Moon,
  Globe,
  Laptop,
  Chrome,
  Smartphone,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { PermissionGate } from "@/components/auth/PermissionGate";
import type { UserPreferences } from "@/types/auth";
import { cn } from "@/lib/utils";

// ---------- Sidebar items ----------

const sidebarItems: SidebarItem[] = [
  { icon: Settings, label: "Parametres", href: "/parametres" },
];

// ---------- Tab definitions ----------

const TABS = [
  { id: "compte", label: "Compte", icon: User },
  { id: "apparence", label: "Apparence", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "confidentialite", label: "Confidentialite", icon: Shield },
  { id: "securite", label: "Securite", icon: Lock },
  { id: "avance", label: "Avance", icon: Code },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ---------- Toggle switch ----------

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
        checked
          ? "bg-gradient-to-r from-violet-500 to-pink-500"
          : "bg-[var(--bg-elevated)]",
        disabled && "cursor-not-allowed opacity-50"
      )}
      style={!checked ? { border: "1px solid var(--border)" } : undefined}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

// ---------- Section wrapper ----------

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5 md:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {description}
            </p>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

// ---------- Setting row ----------

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-[var(--text-primary)]">
          {label}
        </div>
        {description && (
          <div className="text-xs text-[var(--text-muted)] mt-0.5">
            {description}
          </div>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

// ---------- Delete Confirmation Modal ----------

function DeleteModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [password, setPassword] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-xl border p-6 shadow-xl"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border)",
        }}
      >
        <h3 className="text-lg font-semibold text-red-500 mb-2">
          Supprimer le compte
        </h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Cette action est irreversible. Toutes vos donnees seront supprimees.
          Entrez votre mot de passe pour confirmer.
        </p>
        <Input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
        />
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="danger"
            disabled={!password}
            onClick={() => {
              onConfirm();
              setPassword("");
            }}
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------- Toast ----------

function Toast({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[400] flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg bg-green-500 text-white text-sm font-medium animate-in slide-in-from-bottom-2">
      <Check className="h-4 w-4" />
      {message}
    </div>
  );
}

// ---------- Main page ----------

export default function ParametresPage() {
  const { user, activeRole, updateProfile, updatePreferences, logout } =
    useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("compte");
  const [hasChanges, setHasChanges] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Form state: Compte
  const [email, setEmail] = useState(user?.email ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  // Form state: Preferences (deep clone)
  const [prefs, setPrefs] = useState<UserPreferences>(
    user?.preferences ?? {
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
    }
  );

  // Re-sync form state when user changes
  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setUsername(user.username);
      setPrefs(JSON.parse(JSON.stringify(user.preferences)));
    }
  }, [user]);

  function showToast(msg: string) {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  }

  function markChanged() {
    setHasChanges(true);
  }

  function handleSave() {
    // Save email/username changes
    if (email !== user?.email || username !== user?.username) {
      updateProfile({ email, username });
    }
    // Save preferences
    updatePreferences(prefs);
    setHasChanges(false);
    showToast("Parametres sauvegardes");
  }

  function handleExportData() {
    if (!user) return;
    const data = JSON.stringify(user, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vita-export-${user.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Donnees exportees");
  }

  function handleDeleteAccount() {
    setDeleteModalOpen(false);
    logout();
    showToast("Compte supprime");
  }

  function updatePref<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) {
    setPrefs((prev) => ({ ...prev, [key]: value }));
    markChanged();
  }

  function updateNestedPref<
    K extends "notifications" | "confidentialite" | "accessibilite",
  >(group: K, key: keyof UserPreferences[K], value: UserPreferences[K][keyof UserPreferences[K]]) {
    setPrefs((prev) => ({
      ...prev,
      [group]: { ...(prev[group] as Record<string, unknown>), [key]: value },
    }));
    markChanged();
  }

  // Filter visible tabs
  const visibleTabs = TABS.filter(
    (tab) =>
      tab.id !== "avance" ||
      activeRole === "dieu" ||
      activeRole === "admin"
  );

  // ---------- Mock sessions ----------
  const mockSessions = [
    {
      browser: "Chrome 120",
      os: "macOS Sonoma",
      date: "Aujourd'hui, 14:32",
      current: true,
    },
    {
      browser: "Safari 17",
      os: "iPhone 15 Pro",
      date: "Hier, 09:15",
      current: false,
    },
    {
      browser: "Firefox 121",
      os: "Ubuntu 22.04",
      date: "Il y a 3 jours",
      current: false,
    },
  ];

  // ---------- Languages ----------
  const languages = [
    { value: "fr", label: "Francais" },
    { value: "en", label: "English" },
    { value: "es", label: "Espanol" },
    { value: "de", label: "Deutsch" },
    { value: "pt", label: "Portugues" },
    { value: "ar", label: "العربية" },
    { value: "zh", label: "中文" },
    { value: "ja", label: "日本語" },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Civis">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Parametres
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Gerez votre compte et vos preferences
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Desktop: vertical tabs on the left */}
        <div className="hidden lg:block w-56 shrink-0">
          <Card>
            <CardContent className="p-2">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      isActive
                        ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Mobile: horizontal scrollable tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 lg:hidden">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white"
                    : "text-[var(--text-secondary)]"
                )}
                style={
                  !isActive
                    ? {
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border)",
                      }
                    : undefined
                }
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content area */}
        <div className="flex-1 space-y-5">
          {/* ===== COMPTE ===== */}
          {activeTab === "compte" && (
            <>
              <SettingsSection
                title="Informations du compte"
                description="Modifiez vos informations de connexion"
              >
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        markChanged();
                      }}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                      Nom d&apos;utilisateur
                    </label>
                    <Input
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        markChanged();
                      }}
                    />
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection
                title="Changer le mot de passe"
                description="Utilisez un mot de passe fort d'au moins 12 caracteres"
              >
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <Input
                        type={showOldPwd ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Mot de passe actuel"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPwd(!showOldPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                      >
                        {showOldPwd ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPwd ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nouveau mot de passe"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPwd(!showNewPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                      >
                        {showNewPwd ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                      Confirmer le mot de passe
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmer le mot de passe"
                    />
                    {confirmPassword &&
                      newPassword !== confirmPassword && (
                        <p className="mt-1 text-xs text-red-500">
                          Les mots de passe ne correspondent pas
                        </p>
                      )}
                  </div>
                </div>
              </SettingsSection>

              <SettingsSection title="Donnees" description="Exportez ou supprimez vos donnees">
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={handleExportData}>
                    <Download className="h-4 w-4" />
                    Exporter mes donnees
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer le compte
                  </Button>
                </div>
              </SettingsSection>
            </>
          )}

          {/* ===== APPARENCE ===== */}
          {activeTab === "apparence" && (
            <>
              <SettingsSection
                title="Theme"
                description="Choisissez l'apparence de l'application"
              >
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      {
                        key: "dark",
                        label: "Sombre",
                        icon: Moon,
                        bg: "#0a0e1a",
                        fg: "#f1f5f9",
                      },
                      {
                        key: "light",
                        label: "Clair",
                        icon: Sun,
                        bg: "#f8fafc",
                        fg: "#0f172a",
                      },
                      {
                        key: "system",
                        label: "Systeme",
                        icon: Monitor,
                        bg: "linear-gradient(135deg, #0a0e1a 50%, #f8fafc 50%)",
                        fg: "#8b5cf6",
                      },
                    ] as const
                  ).map((t) => {
                    const Icon = t.icon;
                    const isActive = prefs.theme === t.key;
                    return (
                      <button
                        key={t.key}
                        onClick={() => {
                          updatePref("theme", t.key);
                          if (t.key !== "system") {
                            document.documentElement.setAttribute(
                              "data-theme",
                              t.key
                            );
                          }
                        }}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                          isActive
                            ? "border-violet-500 ring-2 ring-violet-500/30"
                            : "hover:border-[var(--border-light)]"
                        )}
                        style={{ borderColor: isActive ? undefined : "var(--border)" }}
                      >
                        <div
                          className="h-16 w-full rounded-lg border"
                          style={{
                            background: t.bg,
                            borderColor: "var(--border)",
                          }}
                        >
                          <div className="flex h-full items-center justify-center">
                            <Icon
                              className="h-6 w-6"
                              style={{ color: t.fg }}
                            />
                          </div>
                        </div>
                        <span
                          className={cn(
                            "text-xs font-medium",
                            isActive
                              ? "text-violet-500"
                              : "text-[var(--text-secondary)]"
                          )}
                        >
                          {t.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </SettingsSection>

              <SettingsSection
                title="Taille du texte"
                description="Ajustez la taille du texte"
              >
                <div className="flex gap-2">
                  {(
                    [
                      { key: "petit", label: "Petit", size: "text-xs" },
                      { key: "normal", label: "Normal", size: "text-sm" },
                      { key: "grand", label: "Grand", size: "text-base" },
                      {
                        key: "tres_grand",
                        label: "Tres grand",
                        size: "text-lg",
                      },
                    ] as const
                  ).map((s) => {
                    const isActive =
                      prefs.accessibilite.tailleTexte === s.key;
                    return (
                      <button
                        key={s.key}
                        onClick={() =>
                          updateNestedPref(
                            "accessibilite",
                            "tailleTexte",
                            s.key
                          )
                        }
                        className={cn(
                          "flex-1 rounded-lg border px-3 py-2 font-medium transition-all",
                          s.size,
                          isActive
                            ? "border-violet-500 bg-violet-500/10 text-violet-500"
                            : "text-[var(--text-secondary)] hover:border-[var(--border-light)]"
                        )}
                        style={{
                          borderColor: isActive
                            ? undefined
                            : "var(--border)",
                        }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
                <div
                  className="mt-4 rounded-lg border p-4"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--bg-elevated)",
                  }}
                >
                  <p
                    className={cn(
                      "text-[var(--text-primary)]",
                      prefs.accessibilite.tailleTexte === "petit" &&
                        "text-xs",
                      prefs.accessibilite.tailleTexte === "normal" &&
                        "text-sm",
                      prefs.accessibilite.tailleTexte === "grand" &&
                        "text-base",
                      prefs.accessibilite.tailleTexte === "tres_grand" &&
                        "text-lg"
                    )}
                  >
                    Apercu : Voici un exemple de texte avec la taille
                    selectionnee. La monnaie universelle VITA accorde 1 Ѵ
                    par jour a chaque citoyen.
                  </p>
                </div>
              </SettingsSection>

              <SettingsSection title="Accessibilite">
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  <SettingRow
                    label="Contraste eleve"
                    description="Augmenter le contraste pour une meilleure lisibilite"
                  >
                    <Toggle
                      checked={prefs.accessibilite.contraste === "eleve"}
                      onChange={(v) =>
                        updateNestedPref(
                          "accessibilite",
                          "contraste",
                          v ? "eleve" : "normal"
                        )
                      }
                    />
                  </SettingRow>
                  <SettingRow
                    label="Reduire les animations"
                    description="Minimiser les effets de mouvement"
                  >
                    <Toggle
                      checked={prefs.accessibilite.animationsReduites}
                      onChange={(v) =>
                        updateNestedPref(
                          "accessibilite",
                          "animationsReduites",
                          v
                        )
                      }
                    />
                  </SettingRow>
                </div>
              </SettingsSection>

              <SettingsSection title="Langue">
                <select
                  value={prefs.langue}
                  onChange={(e) => {
                    updatePref("langue", e.target.value);
                  }}
                  className="h-10 w-full rounded-lg border px-3 text-sm focus:border-violet-500 focus:outline-none transition-colors"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--bg-elevated)",
                    color: "var(--text-primary)",
                  }}
                >
                  {languages.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </SettingsSection>
            </>
          )}

          {/* ===== NOTIFICATIONS ===== */}
          {activeTab === "notifications" && (
            <>
              <SettingsSection
                title="Canaux"
                description="Choisissez comment recevoir vos notifications"
              >
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  <SettingRow label="Email" description="Recevoir par email">
                    <Toggle
                      checked={prefs.notifications.email}
                      onChange={(v) =>
                        updateNestedPref("notifications", "email", v)
                      }
                    />
                  </SettingRow>
                  <SettingRow
                    label="Push"
                    description="Notifications push dans le navigateur"
                  >
                    <Toggle
                      checked={prefs.notifications.push}
                      onChange={(v) =>
                        updateNestedPref("notifications", "push", v)
                      }
                    />
                  </SettingRow>
                </div>
              </SettingsSection>

              <SettingsSection
                title="Propositions"
                description="Notifications liees aux propositions et votes"
              >
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  <SettingRow
                    label="Nouvelles propositions"
                    description="Quand une nouvelle proposition est soumise"
                  >
                    <Toggle
                      checked={prefs.notifications.propositions}
                      onChange={(v) =>
                        updateNestedPref("notifications", "propositions", v)
                      }
                    />
                  </SettingRow>
                  <SettingRow
                    label="Resultats de votes"
                    description="Quand un vote est clos"
                  >
                    <Toggle
                      checked={prefs.notifications.votes}
                      onChange={(v) =>
                        updateNestedPref("notifications", "votes", v)
                      }
                    />
                  </SettingRow>
                </div>
              </SettingsSection>

              <SettingsSection
                title="Transactions"
                description="Notifications liees a votre portefeuille"
              >
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  <SettingRow
                    label="Transactions"
                    description="Receptions, envois et emission quotidienne"
                  >
                    <Toggle
                      checked={prefs.notifications.transactions}
                      onChange={(v) =>
                        updateNestedPref("notifications", "transactions", v)
                      }
                    />
                  </SettingRow>
                </div>
              </SettingsSection>

              <SettingsSection
                title="Systeme"
                description="Mises a jour, maintenance et securite"
              >
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  <SettingRow
                    label="Systeme"
                    description="Mises a jour, maintenance, alertes de securite"
                  >
                    <Toggle
                      checked={prefs.notifications.systeme}
                      onChange={(v) =>
                        updateNestedPref("notifications", "systeme", v)
                      }
                    />
                  </SettingRow>
                </div>
              </SettingsSection>
            </>
          )}

          {/* ===== CONFIDENTIALITE ===== */}
          {activeTab === "confidentialite" && (
            <SettingsSection
              title="Confidentialite du profil"
              description="Controlez ce qui est visible par les autres utilisateurs"
            >
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                <SettingRow
                  label="Profil public"
                  description="Votre profil est visible par tous les utilisateurs"
                >
                  <Toggle
                    checked={prefs.confidentialite.profilPublic}
                    onChange={(v) =>
                      updateNestedPref(
                        "confidentialite",
                        "profilPublic",
                        v
                      )
                    }
                  />
                </SettingRow>
                <SettingRow
                  label="Afficher le solde"
                  description="Votre solde en Ѵ est visible sur votre profil"
                >
                  <Toggle
                    checked={prefs.confidentialite.afficherSolde}
                    onChange={(v) =>
                      updateNestedPref(
                        "confidentialite",
                        "afficherSolde",
                        v
                      )
                    }
                  />
                </SettingRow>
                <SettingRow
                  label="Afficher l'activite"
                  description="Votre activite recente est visible"
                >
                  <Toggle
                    checked={prefs.confidentialite.afficherActivite}
                    onChange={(v) =>
                      updateNestedPref(
                        "confidentialite",
                        "afficherActivite",
                        v
                      )
                    }
                  />
                </SettingRow>
                <SettingRow
                  label="Afficher la reputation"
                  description="Votre score de reputation est visible"
                >
                  <Toggle
                    checked={prefs.confidentialite.afficherReputation}
                    onChange={(v) =>
                      updateNestedPref(
                        "confidentialite",
                        "afficherReputation",
                        v
                      )
                    }
                  />
                </SettingRow>
              </div>
            </SettingsSection>
          )}

          {/* ===== SECURITE ===== */}
          {activeTab === "securite" && (
            <>
              <SettingsSection
                title="Authentification a deux facteurs"
                description="Ajoutez une couche de securite supplementaire"
              >
                <SettingRow
                  label="2FA"
                  description="Fonctionnalite a venir"
                >
                  <Toggle checked={false} onChange={() => {}} disabled />
                </SettingRow>
              </SettingsSection>

              <SettingsSection
                title="Sessions actives"
                description="Gerez vos sessions de connexion"
              >
                <div className="space-y-3">
                  {mockSessions.map((session, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border p-3"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg"
                          style={{ backgroundColor: "var(--bg-elevated)" }}
                        >
                          {i === 0 ? (
                            <Laptop className="h-4 w-4 text-violet-500" />
                          ) : i === 1 ? (
                            <Smartphone className="h-4 w-4 text-cyan-500" />
                          ) : (
                            <Globe className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[var(--text-primary)]">
                            {session.browser}{" "}
                            {session.current && (
                              <span className="ml-1 text-xs text-green-500">
                                (actuelle)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            {session.os} — {session.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button
                    variant="danger"
                    onClick={() =>
                      showToast("Toutes les autres sessions deconnectees")
                    }
                  >
                    Deconnecter toutes les sessions
                  </Button>
                </div>
              </SettingsSection>
            </>
          )}

          {/* ===== AVANCE ===== */}
          {activeTab === "avance" && (
            <PermissionGate
              permission="access_dev_tools"
              hide
            >
              <>
                <SettingsSection
                  title="Informations techniques"
                  description="Donnees techniques de votre compte"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">
                        UUID
                      </span>
                      <span className="font-mono text-xs text-[var(--text-muted)]">
                        {user?.id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--text-secondary)]">
                        Role reel
                      </span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </SettingsSection>

                <SettingsSection
                  title="Profil JSON"
                  description="Vue brute de votre profil utilisateur"
                >
                  <div
                    className="max-h-96 overflow-auto rounded-lg p-4 font-mono text-xs leading-relaxed"
                    style={{
                      backgroundColor: "var(--bg-code)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <pre>{JSON.stringify(user, null, 2)}</pre>
                  </div>
                </SettingsSection>

                <SettingsSection title="Mode developpeur">
                  <SettingRow
                    label="Mode developpeur"
                    description="Active les outils de debug et les logs"
                  >
                    <Toggle checked={false} onChange={() => showToast("Mode dev active")} />
                  </SettingRow>
                </SettingsSection>
              </>
            </PermissionGate>
          )}
        </div>
      </div>

      {/* Sticky save bar */}
      {hasChanges && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-3 border-t px-4 py-3"
          style={{
            backgroundColor: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <span className="text-sm text-[var(--text-secondary)]">
            Modifications non sauvegardees
          </span>
          <Button variant="secondary" onClick={() => {
            if (user) {
              setEmail(user.email);
              setUsername(user.username);
              setPrefs(JSON.parse(JSON.stringify(user.preferences)));
            }
            setHasChanges(false);
          }}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4" />
            Sauvegarder
          </Button>
        </div>
      )}

      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
      />
      <Toast message={toastMsg} visible={toastVisible} />
    </DashboardLayout>
  );
}
