"use client";

import { useState, useMemo } from "react";
import {
  User,
  Wallet,
  Award,
  Activity,
  Lock,
  Sparkles,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  getRecompenses,
  CATEGORIE_RECOMPENSE_LABELS,
  CATEGORIE_RECOMPENSE_COLORS,
  type RecompenseCategorie,
  type Recompense,
} from "@/lib/mockCivis";

const sidebarItems: SidebarItem[] = [
  { icon: User, label: "Profil", href: "/civis" },
  { icon: Wallet, label: "Portefeuille", href: "/civis/wallet" },
  { icon: Activity, label: "Activité", href: "/civis/activity" },
  { icon: Award, label: "Récompenses", href: "/civis/achievements" },
];

type StatusFilter = "all" | "obtained" | "in_progress" | "locked";
type CategorieFilter = "all" | RecompenseCategorie;

const NIVEAU_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  argent: "#C0C0C0",
  or: "#FFD700",
};

function getStatus(r: Recompense): "obtained" | "in_progress" | "locked" {
  if (r.dateObtention) return "obtained";
  if (r.progression && r.progression.actuel > 0) return "in_progress";
  return "locked";
}

export default function AchievementsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categorieFilter, setCategorieFilter] = useState<CategorieFilter>("all");

  const allRecompenses = useMemo(() => getRecompenses(), []);

  const filtered = useMemo(() => {
    let result = [...allRecompenses];

    if (statusFilter !== "all") {
      result = result.filter((r) => getStatus(r) === statusFilter);
    }
    if (categorieFilter !== "all") {
      result = result.filter((r) => r.categorie === categorieFilter);
    }

    return result;
  }, [allRecompenses, statusFilter, categorieFilter]);

  const obtainedCount = allRecompenses.filter((r) => r.dateObtention).length;
  const rareObtained = allRecompenses.filter((r) => r.dateObtention && r.rare).length;
  const progressPct = Math.round((obtainedCount / allRecompenses.length) * 100);

  // Closest to completion (in_progress, sorted by %)
  const closestToCompletion = allRecompenses
    .filter((r) => !r.dateObtention && r.progression && r.progression.actuel > 0)
    .sort((a, b) => {
      const pctA = a.progression!.actuel / a.progression!.objectif;
      const pctB = b.progression!.actuel / b.progression!.objectif;
      return pctB - pctA;
    })
    .slice(0, 3);

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Civis">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Récompenses
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          {obtainedCount} récompenses obtenues sur {allRecompenses.length} · {rareObtained} récompense{rareObtained > 1 ? "s" : ""} rare{rareObtained > 1 ? "s" : ""}
        </p>
        {/* Global progress bar */}
        <div className="mt-3 max-w-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[var(--text-muted)]">Progression globale</span>
            <span className="text-xs font-semibold text-violet-500">{progressPct}%</span>
          </div>
          <Progress value={progressPct} />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {obtainedCount}/{allRecompenses.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <select
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="all">Toutes</option>
          <option value="obtained">Obtenues</option>
          <option value="in_progress">En cours</option>
          <option value="locked">Non débloquées</option>
        </select>
        <select
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500"
          value={categorieFilter}
          onChange={(e) => setCategorieFilter(e.target.value as CategorieFilter)}
        >
          <option value="all">Toutes catégories</option>
          {Object.entries(CATEGORIE_RECOMPENSE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {filtered.map((recompense) => {
          const status = getStatus(recompense);
          const catColor = CATEGORIE_RECOMPENSE_COLORS[recompense.categorie];
          const isObtained = status === "obtained";
          const isInProgress = status === "in_progress";
          const isLocked = status === "locked";
          const progressionPct = recompense.progression
            ? Math.round((recompense.progression.actuel / recompense.progression.objectif) * 100)
            : 0;

          return (
            <Card
              key={recompense.id}
              className="relative overflow-hidden transition-all"
              style={{
                borderColor: isObtained
                  ? recompense.rare
                    ? "#FFD700"
                    : catColor
                  : undefined,
                opacity: isLocked ? 0.5 : 1,
                boxShadow: recompense.rare && isObtained
                  ? `0 0 20px ${catColor}20, 0 0 40px ${catColor}10`
                  : undefined,
              }}
            >
              {/* Rare badge */}
              {recompense.rare && isObtained && (
                <div className="absolute top-2 right-2">
                  <Badge className="text-[10px] bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    <Sparkles className="h-3 w-3" />
                    Rare
                  </Badge>
                </div>
              )}

              <div className="p-5 text-center">
                {/* Icon */}
                <div
                  className={`text-5xl mb-3 ${isLocked ? "grayscale opacity-30" : ""} ${
                    isInProgress ? "opacity-50" : ""
                  }`}
                >
                  {recompense.icone}
                </div>

                {/* Niveau star */}
                {recompense.niveau && isObtained && (
                  <div className="flex justify-center mb-1">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${NIVEAU_COLORS[recompense.niveau]}20`,
                        color: NIVEAU_COLORS[recompense.niveau],
                      }}
                    >
                      {recompense.niveau.charAt(0).toUpperCase() + recompense.niveau.slice(1)}
                    </span>
                  </div>
                )}

                {/* Name */}
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                  {recompense.nom}
                </h3>

                {/* Description */}
                <p className="text-xs text-[var(--text-muted)] mb-2">
                  {isLocked && !recompense.progression
                    ? "???"
                    : recompense.description}
                </p>

                {/* Category badge */}
                <div className="mb-2">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: `${catColor}15`,
                      color: catColor,
                    }}
                  >
                    {CATEGORIE_RECOMPENSE_LABELS[recompense.categorie]}
                  </span>
                </div>

                {/* Status-specific content */}
                {isObtained && (
                  <p className="text-xs text-green-500">
                    Obtenue le {recompense.dateObtention}
                  </p>
                )}

                {isInProgress && recompense.progression && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {recompense.progression.actuel}/{recompense.progression.objectif} {recompense.progression.unite}
                      </span>
                      <span className="text-[10px] font-semibold text-violet-500">
                        {progressionPct}%
                      </span>
                    </div>
                    <Progress value={progressionPct} />
                  </div>
                )}

                {isLocked && recompense.progression && (
                  <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]">
                    <Lock className="h-3 w-3" />
                    <span>
                      {recompense.progression.objectif} {recompense.progression.unite}
                    </span>
                  </div>
                )}

                {isLocked && !recompense.progression && (
                  <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]">
                    <Lock className="h-3 w-3" />
                    <span>Non débloquée</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-32 text-[var(--text-muted)]">
            Aucune récompense ne correspond aux filtres.
          </div>
        )}
      </div>

      {/* Next achievements */}
      {closestToCompletion.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Prochaines récompenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {closestToCompletion.map((r) => {
                const pct = Math.round(
                  (r.progression!.actuel / r.progression!.objectif) * 100
                );
                const remaining = r.progression!.objectif - r.progression!.actuel;

                return (
                  <div key={r.id} className="flex items-center gap-4">
                    <span className="text-3xl shrink-0">{r.icone}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                          {r.nom}
                        </h4>
                        <span className="text-xs font-semibold text-violet-500">
                          {pct}%
                        </span>
                      </div>
                      <Progress value={pct} className="mb-1" />
                      <p className="text-xs text-[var(--text-muted)]">
                        Plus que {remaining} {r.progression!.unite} !
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
