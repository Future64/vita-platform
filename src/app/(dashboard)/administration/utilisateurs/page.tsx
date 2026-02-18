"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  MoreVertical,
  Eye,
  Shield,
  UserX,
  UserCheck,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { formatNumber } from "@/lib/format";
import { ADMIN_USERS, USER_STATS, type AdminUser } from "@/lib/mockAdmin";
import { ROLE_METADATA } from "@/lib/permissions";
import { useToast } from "@/components/ui/Toast";

const PAGE_SIZE = 10;

const STATUT_CONFIG: Record<
  AdminUser["statut"],
  { label: string; variant: "green" | "orange" | "red" }
> = {
  actif: { label: "Actif", variant: "green" },
  en_attente: { label: "En attente", variant: "orange" },
  suspendu: { label: "Suspendu", variant: "red" },
};

export default function UtilisateursPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statutFilter, setStatutFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    let users = [...ADMIN_USERS];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.prenom.toLowerCase().includes(q) ||
          u.nom.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      users = users.filter((u) => u.role === roleFilter);
    }

    // Statut filter
    if (statutFilter !== "all") {
      users = users.filter((u) => u.statut === statutFilter);
    }

    // Sort
    switch (sort) {
      case "alpha":
        users.sort((a, b) => a.nom.localeCompare(b.nom));
        break;
      case "reputation":
        users.sort((a, b) => b.scoreReputation - a.scoreReputation);
        break;
      case "activite":
        // Sort by derniere connexion (mock: just reverse for demo)
        users.sort((a, b) => a.derniereConnexion.localeCompare(b.derniereConnexion));
        break;
      case "recent":
      default:
        users.sort((a, b) => b.dateInscription.localeCompare(a.dateInscription));
        break;
    }

    return users;
  }, [search, roleFilter, statutFilter, sort]);

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE
  );

  // Reset page when filters change
  useMemo(() => {
    setPage(0);
  }, [search, roleFilter, statutFilter, sort]);

  const selectStyle: React.CSSProperties = {
    backgroundColor: "var(--bg-elevated)",
    borderColor: "var(--border)",
    color: "var(--text-primary)",
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-violet-500" />
            <Badge variant="violet" className="text-xs">
              Utilisateurs
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Gestion des utilisateurs
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Gerer les comptes, roles et statuts des citoyens VITA
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => toast.success("Export CSV simule")}
        >
          Exporter (CSV)
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          variant="violet"
          label="Total utilisateurs"
          value={formatNumber(USER_STATS.total)}
        />
        <StatCard
          variant="green"
          label="Verifies"
          value={formatNumber(USER_STATS.verifies)}
        />
        <StatCard
          variant="orange"
          label="En attente"
          value={formatNumber(USER_STATS.enAttente)}
        />
        <StatCard
          variant="pink"
          label="Suspendus"
          value={formatNumber(USER_STATS.suspendus)}
        />
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <Input
                placeholder="Rechercher par nom, username, email..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Role filter */}
            <select
              className="h-10 rounded-lg border px-3 text-sm outline-none transition-colors focus:border-violet-500"
              style={selectStyle}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Tous les roles</option>
              {Object.entries(ROLE_METADATA).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>

            {/* Statut filter */}
            <select
              className="h-10 rounded-lg border px-3 text-sm outline-none transition-colors focus:border-violet-500"
              style={selectStyle}
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="en_attente">En attente</option>
              <option value="suspendu">Suspendu</option>
            </select>

            {/* Sort */}
            <select
              className="h-10 rounded-lg border px-3 text-sm outline-none transition-colors focus:border-violet-500"
              style={selectStyle}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="recent">Plus recents</option>
              <option value="alpha">Alphabetique</option>
              <option value="reputation">Reputation</option>
              <option value="activite">Activite</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users list */}
      <div className="space-y-2">
        {paginatedUsers.map((user) => {
          const roleMeta = ROLE_METADATA[user.role];
          const statutConf = STATUT_CONFIG[user.statut];

          return (
            <Card key={user.id}>
              <div className="p-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <Avatar size="md">
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-[var(--text-primary)]">
                        {user.prenom} {user.nom}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        @{user.username}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">
                      {user.email}
                    </div>
                  </div>

                  {/* Role badge */}
                  <Badge
                    className="text-xs hidden sm:inline-flex"
                    style={{
                      backgroundColor: `${roleMeta.color}15`,
                      color: roleMeta.color,
                    }}
                  >
                    {roleMeta.label}
                  </Badge>

                  {/* Date inscription */}
                  <div className="text-right hidden md:block">
                    <div className="text-xs text-[var(--text-muted)]">
                      Inscription
                    </div>
                    <div className="text-xs font-medium text-[var(--text-primary)]">
                      {user.dateInscription}
                    </div>
                  </div>

                  {/* Derniere connexion */}
                  <div className="text-right hidden lg:block">
                    <div className="text-xs text-[var(--text-muted)]">
                      Derniere connexion
                    </div>
                    <div className="text-xs font-medium text-[var(--text-primary)]">
                      {user.derniereConnexion}
                    </div>
                  </div>

                  {/* Statut badge */}
                  <Badge variant={statutConf.variant} className="text-xs">
                    {statutConf.label}
                  </Badge>

                  {/* Actions dropdown */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="iconSm"
                      onClick={() =>
                        setOpenMenu(openMenu === user.id ? null : user.id)
                      }
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>

                    {openMenu === user.id && (
                      <>
                        {/* Backdrop to close dropdown */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setOpenMenu(null)}
                        />
                        {/* Dropdown */}
                        <div
                          className="absolute right-0 top-full mt-1 z-50 w-52 rounded-lg border py-1 shadow-xl"
                          style={{
                            backgroundColor: "var(--bg-elevated)",
                            borderColor: "var(--border)",
                          }}
                        >
                          {/* Voir le profil */}
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5"
                            style={{ color: "var(--text-primary)" }}
                            onClick={() => {
                              toast.info(`Voir le profil de @${user.username}`);
                              setOpenMenu(null);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            Voir le profil
                          </button>

                          {/* Modifier le role */}
                          <PermissionGate permission="manage_roles" hide>
                            <button
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5"
                              style={{ color: "var(--text-primary)" }}
                              onClick={() => {
                                toast.info(
                                  `Modifier le role de @${user.username}`
                                );
                                setOpenMenu(null);
                              }}
                            >
                              <Shield className="h-4 w-4" />
                              Modifier le role
                            </button>
                          </PermissionGate>

                          {/* Verifier l'identite (only if en_attente) */}
                          {user.statut === "en_attente" && (
                            <PermissionGate permission="verify_identity" hide>
                              <button
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5"
                                style={{ color: "var(--text-primary)" }}
                                onClick={() => {
                                  toast.success(
                                    `Identite de @${user.username} verifiee`
                                  );
                                  setOpenMenu(null);
                                }}
                              >
                                <UserCheck className="h-4 w-4" />
                                Verifier l&apos;identite
                              </button>
                            </PermissionGate>
                          )}

                          {/* Separator */}
                          <div
                            className="my-1 h-px"
                            style={{ backgroundColor: "var(--border)" }}
                          />

                          {/* Suspendre */}
                          <PermissionGate permission="suspend_user" hide>
                            <button
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                              onClick={() => {
                                toast.warning(
                                  `Suspension de @${user.username} simulee`
                                );
                                setOpenMenu(null);
                              }}
                            >
                              <UserX className="h-4 w-4" />
                              Suspendre
                            </button>
                          </PermissionGate>

                          {/* Supprimer (super admin only via emergency_stop) */}
                          <PermissionGate permission="emergency_stop" hide>
                            <button
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                              onClick={() => {
                                toast.error(
                                  `Suppression de @${user.username} simulee`
                                );
                                setOpenMenu(null);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Supprimer
                            </button>
                          </PermissionGate>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
            Aucun utilisateur ne correspond a votre recherche.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-[var(--text-muted)]">
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? "s" : ""}{" "}
            — Page {page + 1} sur {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Precedent
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
