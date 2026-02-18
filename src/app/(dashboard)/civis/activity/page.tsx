"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  User,
  Wallet,
  Award,
  Activity,
  Vote,
  FileText,
  MessageCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Heart,
  GitCommit,
  GitPullRequest,
  CheckCircle,
  Users,
  Edit,
  Coins,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import {
  getActivities,
  groupActivitiesByDay,
  CIVIS_ACTIVITY_HEATMAP,
  ACTIVITY_TYPE_CONFIG,
  type ActivityType,
  type UserActivity,
} from "@/lib/mockCivis";

const sidebarItems: SidebarItem[] = [
  { icon: User, label: "Profil", href: "/civis" },
  { icon: Wallet, label: "Portefeuille", href: "/civis/wallet" },
  { icon: Activity, label: "Activité", href: "/civis/activity" },
  { icon: Award, label: "Récompenses", href: "/civis/achievements" },
];

type TypeFilter = "all" | "votes" | "propositions" | "transactions" | "forge" | "autres";
type PeriodFilter = "7" | "30" | "90" | "all";

const ICON_MAP: Record<string, typeof Vote> = {
  Vote,
  FileText,
  MessageCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  Users,
  Edit,
  Heart,
  GitCommit,
  GitPullRequest,
  CheckCircle,
};

function getHeatmapColor(count: number): string {
  if (count === 0) return "var(--bg-elevated)";
  if (count === 1) return "rgba(139, 92, 246, 0.2)";
  if (count === 2) return "rgba(139, 92, 246, 0.4)";
  if (count === 3) return "rgba(139, 92, 246, 0.6)";
  if (count === 4) return "rgba(139, 92, 246, 0.8)";
  return "rgba(139, 92, 246, 1)";
}

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

function filterByType(type: TypeFilter, activity: UserActivity): boolean {
  switch (type) {
    case "votes":
      return activity.type === "vote";
    case "propositions":
      return activity.type === "proposition" || activity.type === "commentaire" || activity.type === "soutien_doleance";
    case "transactions":
      return activity.type === "transaction_envoi" || activity.type === "transaction_reception" || activity.type === "emission";
    case "forge":
      return activity.type === "commit" || activity.type === "merge_request" || activity.type === "review";
    case "autres":
      return activity.type === "delegation" || activity.type === "modification_profil";
    default:
      return true;
  }
}

function filterByPeriod(period: PeriodFilter, activity: UserActivity): boolean {
  if (period === "all") return true;
  const now = new Date();
  const actDate = new Date(activity.dateIso);
  const diffDays = (now.getTime() - actDate.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= parseInt(period);
}

export default function ActivityPage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("30");
  const [visibleCount, setVisibleCount] = useState(15);

  const allActivities = useMemo(() => getActivities(), []);

  const filtered = useMemo(() => {
    return allActivities
      .filter((a) => filterByType(typeFilter, a))
      .filter((a) => filterByPeriod(periodFilter, a));
  }, [allActivities, typeFilter, periodFilter]);

  const visible = filtered.slice(0, visibleCount);
  const grouped = useMemo(() => groupActivitiesByDay(visible), [visible]);

  // Stats for this month
  const thisMonth = allActivities.filter((a) => {
    const d = new Date(a.dateIso);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const votesCount = thisMonth.filter((a) => a.type === "vote").length;
  const propsCount = thisMonth.filter((a) => a.type === "proposition").length;
  const txCount = thisMonth.filter(
    (a) => a.type === "transaction_envoi" || a.type === "transaction_reception"
  ).length;
  const commentsCount = thisMonth.filter((a) => a.type === "commentaire").length;

  // Type filter counts
  const typeCounts: Record<TypeFilter, number> = {
    all: filtered.length,
    votes: allActivities.filter((a) => filterByType("votes", a) && filterByPeriod(periodFilter, a)).length,
    propositions: allActivities.filter((a) => filterByType("propositions", a) && filterByPeriod(periodFilter, a)).length,
    transactions: allActivities.filter((a) => filterByType("transactions", a) && filterByPeriod(periodFilter, a)).length,
    forge: allActivities.filter((a) => filterByType("forge", a) && filterByPeriod(periodFilter, a)).length,
    autres: allActivities.filter((a) => filterByType("autres", a) && filterByPeriod(periodFilter, a)).length,
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Civis">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Mon activité
        </h1>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-[var(--text-muted)]">
          <span>Votes ce mois : <strong className="text-[var(--text-primary)]">{votesCount}</strong></span>
          <span>Propositions : <strong className="text-[var(--text-primary)]">{propsCount}</strong></span>
          <span>Transactions : <strong className="text-[var(--text-primary)]">{txCount}</strong></span>
          <span>Commentaires : <strong className="text-[var(--text-primary)]">{commentsCount}</strong></span>
        </div>
      </div>

      {/* Heatmap */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Graphique de contributions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-[3px] overflow-x-auto pb-1">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] mr-1 pt-0 shrink-0">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="h-[11px] w-4 flex items-center justify-end text-[9px] text-[var(--text-muted)] pr-0.5"
                >
                  {i % 2 === 0 ? label : ""}
                </div>
              ))}
            </div>
            {/* Grid */}
            {CIVIS_ACTIVITY_HEATMAP.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((count, di) => (
                  <div
                    key={di}
                    className="h-[11px] w-[11px] rounded-sm transition-colors"
                    style={{ backgroundColor: getHeatmapColor(count) }}
                    title={`${count} action${count !== 1 ? "s" : ""}`}
                  />
                ))}
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span>Moins</span>
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-[11px] w-[11px] rounded-sm"
                style={{ backgroundColor: getHeatmapColor(n) }}
              />
            ))}
            <span>Plus</span>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        {(
          [
            ["all", "Tous"],
            ["votes", "Votes"],
            ["propositions", "Propositions"],
            ["transactions", "Transactions"],
            ["forge", "Forge"],
            ["autres", "Autres"],
          ] as [TypeFilter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTypeFilter(key); setVisibleCount(15); }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              typeFilter === key
                ? "bg-violet-500/15 text-violet-500"
                : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            {label}
            <span className="text-[10px] opacity-70">{typeCounts[key]}</span>
          </button>
        ))}

        <div className="ml-auto">
          <select
            className="h-8 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-xs text-[var(--text-primary)] outline-none focus:border-violet-500"
            value={periodFilter}
            onChange={(e) => { setPeriodFilter(e.target.value as PeriodFilter); setVisibleCount(15); }}
          >
            <option value="7">7 jours</option>
            <option value="30">30 jours</option>
            <option value="90">3 mois</option>
            <option value="all">Tout</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {grouped.map((group) => (
          <div key={group.dateIso}>
            {/* Day header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <span className="text-sm font-semibold text-[var(--text-secondary)] shrink-0">
                {group.day}
              </span>
              <Badge variant="violet" className="text-xs shrink-0">
                {group.activities.length}
              </Badge>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>

            {/* Activities */}
            <div className="space-y-2 pl-4 border-l-2 border-[var(--border)] ml-2">
              {group.activities.map((activity) => {
                const config = ACTIVITY_TYPE_CONFIG[activity.type];
                const IconComponent = ICON_MAP[config.iconName] || Activity;
                const isClickable = !!activity.lien;

                const content = (
                  <div
                    className={`relative pl-5 py-1.5 ${
                      isClickable ? "cursor-pointer" : ""
                    }`}
                  >
                    {/* Timeline dot */}
                    <div
                      className="absolute left-[-9px] top-3 h-3 w-3 rounded-full border-2"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--bg-card)",
                      }}
                    />

                    <div className={`rounded-lg border border-[var(--border)] p-3 bg-[var(--bg-card)] transition-colors ${
                      isClickable ? "hover:border-violet-500/30" : ""
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 shrink-0 ${config.color}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--text-primary)]">
                            {activity.titre}
                          </p>
                          {activity.description && (
                            <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-[var(--text-muted)] shrink-0">
                          {activity.date}
                        </span>
                      </div>
                    </div>
                  </div>
                );

                return isClickable ? (
                  <Link key={activity.id} href={activity.lien!}>
                    {content}
                  </Link>
                ) : (
                  <div key={activity.id}>{content}</div>
                );
              })}
            </div>
          </div>
        ))}

        {grouped.length === 0 && (
          <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
            Aucune activité pour cette période.
          </div>
        )}

        {/* Load more */}
        {visibleCount < filtered.length && (
          <div className="flex justify-center pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setVisibleCount((prev) => prev + 10)}
            >
              Charger plus ({filtered.length - visibleCount} restantes)
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
