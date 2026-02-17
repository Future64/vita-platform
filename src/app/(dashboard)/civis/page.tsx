"use client";

import { useState } from "react";
import {
  User,
  Wallet,
  Award,
  Activity,
  TrendingUp,
  Vote,
  GitBranch,
  Calendar,
  MapPin,
  Mail,
  Edit,
  Save,
  X,
  Plus,
  Globe,
  Check,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { StatCard } from "@/components/ui/stat-card";
import { EventTimeline } from "@/components/ui/event-timeline";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_METADATA } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const sidebarItems: SidebarItem[] = [
  { icon: User, label: "Profil", href: "/civis" },
  { icon: Wallet, label: "Portefeuille", href: "/civis/wallet" },
  { icon: Activity, label: "Activite", href: "/civis/activity" },
  { icon: Award, label: "Recompenses", href: "/civis/achievements" },
];

const recentActivity = [
  {
    date: "Aujourd'hui",
    title: "Vote sur proposition ecologique",
    description: "A vote POUR la reforme des bonus ecologiques",
    variant: "green" as const,
  },
  {
    date: "Hier",
    title: "Contribution au projet Constitution v3",
    description: "Commit: Add article 47 on AI Ethics",
    variant: "violet" as const,
  },
  {
    date: "Il y a 3j",
    title: "Nouvelle proposition creee",
    description: "Reforme du systeme de transport public",
    variant: "orange" as const,
  },
  {
    date: "Il y a 5j",
    title: "Recompense recue",
    description: "+50 Ѵ pour contribution exceptionnelle",
    variant: "cyan" as const,
  },
];

const SUGGESTED_INTERESTS = [
  "Economie",
  "Politique",
  "Ecologie",
  "Technologie",
  "Education",
  "Sante",
  "Culture",
  "Sciences",
  "Droit",
  "Philosophie",
  "Finance",
  "Art",
];

const COUNTRY_FLAGS: Record<string, string> = {
  France: "\u{1F1EB}\u{1F1F7}",
  Maroc: "\u{1F1F2}\u{1F1E6}",
  Belgique: "\u{1F1E7}\u{1F1EA}",
  Japon: "\u{1F1EF}\u{1F1F5}",
  Suisse: "\u{1F1E8}\u{1F1ED}",
  Allemagne: "\u{1F1E9}\u{1F1EA}",
  Espagne: "\u{1F1EA}\u{1F1F8}",
  Italie: "\u{1F1EE}\u{1F1F9}",
  "Etats-Unis": "\u{1F1FA}\u{1F1F8}",
  Canada: "\u{1F1E8}\u{1F1E6}",
  Bresil: "\u{1F1E7}\u{1F1F7}",
  Tunisie: "\u{1F1F9}\u{1F1F3}",
  Senegal: "\u{1F1F8}\u{1F1F3}",
};

export default function CivisProfilePage() {
  const { user, activeRole, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editPrenom, setEditPrenom] = useState(user?.prenom ?? "");
  const [editNom, setEditNom] = useState(user?.nom ?? "");
  const [editBio, setEditBio] = useState(user?.bio ?? "");
  const [editProfession, setEditProfession] = useState(
    user?.profession ?? ""
  );
  const [editSiteWeb, setEditSiteWeb] = useState(user?.siteWeb ?? "");
  const [editReseaux, setEditReseaux] = useState(
    user?.reseauxSociaux ?? {}
  );

  // Interests
  const [interests, setInterests] = useState<string[]>(
    user?.centresInteret ?? []
  );
  const [showInterestSuggestions, setShowInterestSuggestions] = useState(false);

  const roleMeta = ROLE_METADATA[activeRole];
  const countryFlag = user?.pays ? COUNTRY_FLAGS[user.pays] ?? "\u{1F30D}" : "\u{1F30D}";

  function startEditing() {
    setEditPrenom(user?.prenom ?? "");
    setEditNom(user?.nom ?? "");
    setEditBio(user?.bio ?? "");
    setEditProfession(user?.profession ?? "");
    setEditSiteWeb(user?.siteWeb ?? "");
    setEditReseaux(user?.reseauxSociaux ?? {});
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
  }

  function saveProfile() {
    updateProfile({
      prenom: editPrenom,
      nom: editNom,
      bio: editBio,
      profession: editProfession,
      siteWeb: editSiteWeb,
      reseauxSociaux: editReseaux,
      centresInteret: interests,
    });
    setIsEditing(false);
  }

  function addInterest(interest: string) {
    if (!interests.includes(interest)) {
      const updated = [...interests, interest];
      setInterests(updated);
      updateProfile({ centresInteret: updated });
    }
    setShowInterestSuggestions(false);
  }

  function removeInterest(interest: string) {
    const updated = interests.filter((i) => i !== interest);
    setInterests(updated);
    updateProfile({ centresInteret: updated });
  }

  const initials = user
    ? `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase()
    : "??";

  if (!user) return null;

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Civis">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {/* Avatar 120px */}
            <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-3xl font-bold text-white">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                {user.prenom} {user.nom}
              </h1>
              <p className="text-sm text-[var(--text-muted)] mb-2">
                @{user.username}
              </p>
              {/* Role badge */}
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{
                    backgroundColor: `${roleMeta.color}20`,
                    color: roleMeta.color,
                  }}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: roleMeta.color }}
                  />
                  {roleMeta.label}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Membre depuis {user.dateInscription}
                </span>
                <span className="flex items-center gap-1">
                  {countryFlag} {user.pays}
                </span>
              </div>
            </div>
          </div>
          {!isEditing && (
            <PermissionGate permission="edit_own_profile">
              <Button variant="secondary" onClick={startEditing}>
                <Edit className="h-4 w-4" />
                Modifier le profil
              </Button>
            </PermissionGate>
          )}
          {isEditing && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={cancelEditing}>
                <X className="h-4 w-4" />
                Annuler
              </Button>
              <Button onClick={saveProfile}>
                <Save className="h-4 w-4" />
                Sauvegarder
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Solde VITA card */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] mb-1">
                Solde VITA
              </p>
              <p className="text-3xl font-bold font-mono text-[var(--text-primary)]">
                {formatNumber(user.soldeVita)}{" "}
                <span className="text-violet-500">Ѵ</span>
              </p>
            </div>
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))",
              }}
            >
              <Wallet className="h-7 w-7 text-violet-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          variant="violet"
          label="Jours actifs"
          value={user.joursActifs.toString()}
        />
        <StatCard
          variant="cyan"
          label="Propositions"
          value={user.propositionsCreees.toString()}
        />
        <StatCard
          variant="green"
          label="Votes"
          value={user.votesEffectues.toString()}
        />
        <StatCard
          variant="orange"
          label="Reputation"
          value={user.scoreReputation.toString()}
          trend={{ value: "+5", direction: "up" }}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal info card */}
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                        Prenom
                      </label>
                      <Input
                        value={editPrenom}
                        onChange={(e) => setEditPrenom(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                        Nom
                      </label>
                      <Input
                        value={editNom}
                        onChange={(e) => setEditNom(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-[var(--text-muted)]">
                      <span>Bio</span>
                      <span>{editBio.length}/200</span>
                    </label>
                    <textarea
                      value={editBio}
                      onChange={(e) =>
                        setEditBio(e.target.value.slice(0, 200))
                      }
                      maxLength={200}
                      rows={3}
                      className="w-full resize-none rounded-lg border px-4 py-3 text-sm transition-colors focus:border-violet-500 focus:outline-none placeholder:opacity-60"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--bg-elevated)",
                        color: "var(--text-primary)",
                      }}
                      placeholder="Parlez de vous..."
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                      Profession
                    </label>
                    <Input
                      value={editProfession}
                      onChange={(e) => setEditProfession(e.target.value)}
                      placeholder="Votre profession"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                      Site web
                    </label>
                    <Input
                      value={editSiteWeb}
                      onChange={(e) => setEditSiteWeb(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                        Twitter / X
                      </label>
                      <Input
                        value={editReseaux.twitter ?? ""}
                        onChange={(e) =>
                          setEditReseaux({
                            ...editReseaux,
                            twitter: e.target.value,
                          })
                        }
                        placeholder="@handle"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                        GitHub
                      </label>
                      <Input
                        value={editReseaux.github ?? ""}
                        onChange={(e) =>
                          setEditReseaux({
                            ...editReseaux,
                            github: e.target.value,
                          })
                        }
                        placeholder="username"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                        LinkedIn
                      </label>
                      <Input
                        value={editReseaux.linkedin ?? ""}
                        onChange={(e) =>
                          setEditReseaux({
                            ...editReseaux,
                            linkedin: e.target.value,
                          })
                        }
                        placeholder="username"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.bio && (
                    <p className="text-sm text-[var(--text-secondary)]">
                      {user.bio}
                    </p>
                  )}
                  <div className="space-y-2">
                    {user.profession && (
                      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <Award className="h-4 w-4" />
                        {user.profession}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                    {user.siteWeb && (
                      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <Globe className="h-4 w-4" />
                        {user.siteWeb}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interests card */}
          <Card>
            <CardHeader>
              <CardTitle>Centres d&apos;interet</CardTitle>
              <PermissionGate permission="edit_own_profile" hide>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setShowInterestSuggestions(!showInterestSuggestions)
                  }
                >
                  <Plus className="h-4 w-4" />
                  Ajouter
                </Button>
              </PermissionGate>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => removeInterest(interest)}
                    className="group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all hover:opacity-80"
                    style={{
                      backgroundColor: "rgba(139, 92, 246, 0.12)",
                      color: "#8b5cf6",
                    }}
                    title="Cliquer pour retirer"
                  >
                    {interest}
                    <X className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
                {interests.length === 0 && (
                  <p className="text-sm text-[var(--text-muted)]">
                    Aucun centre d&apos;interet selectionne
                  </p>
                )}
              </div>

              {showInterestSuggestions && (
                <div
                  className="mt-4 rounded-lg border p-3"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--bg-elevated)",
                  }}
                >
                  <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">
                    Suggestions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_INTERESTS.filter(
                      (s) => !interests.includes(s)
                    ).map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => addInterest(suggestion)}
                        className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all hover:border-violet-500 hover:text-violet-500"
                        style={{
                          borderColor: "var(--border)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <Plus className="h-3 w-3" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Activite recente</CardTitle>
              <Button variant="ghost" size="sm" className="text-violet-500">
                Voir tout
              </Button>
            </CardHeader>
            <CardContent>
              <EventTimeline events={recentActivity} />
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Reputation Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Niveau de reputation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-secondary)]">
                    Niveau {Math.floor(user.scoreReputation / 100)}
                  </span>
                  <span className="text-sm font-semibold text-violet-500">
                    {user.scoreReputation} / {(Math.floor(user.scoreReputation / 100) + 1) * 100}
                  </span>
                </div>
                <Progress
                  value={
                    (user.scoreReputation %
                      100)
                  }
                />
                <p className="text-xs text-[var(--text-muted)]">
                  Plus que{" "}
                  {(Math.floor(user.scoreReputation / 100) + 1) * 100 -
                    user.scoreReputation}{" "}
                  points pour le niveau suivant
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Cette semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Vote className="h-4 w-4" />
                    Votes
                  </div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    {user.votesEffectues > 0 ? Math.min(user.votesEffectues, 12) : 0}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <GitBranch className="h-4 w-4" />
                    Contributions
                  </div>
                  <div className="font-semibold text-[var(--text-primary)]">
                    {user.propositionsCreees > 0 ? Math.min(user.propositionsCreees, 5) : 0}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <TrendingUp className="h-4 w-4" />
                    Ѵ gagnes
                  </div>
                  <div className="font-semibold text-green-500">
                    +{user.joursActifs > 7 ? 7 : user.joursActifs} Ѵ
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          {user.langues && user.langues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Langues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.langues.map((lang) => (
                    <span
                      key={lang}
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: "rgba(139, 92, 246, 0.12)",
                        color: "#8b5cf6",
                      }}
                    >
                      {lang.toUpperCase()}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
