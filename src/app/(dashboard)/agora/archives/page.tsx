"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Flame,
  Scroll,
  FileText,
  Vote,
  Archive,
  CheckCircle2,
  XCircle,
  Settings,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/input";
import { VoteBar } from "@/components/ui/progress";
import { formatNumber } from "@/lib/format";
import {
  MOCK_PROPOSALS,
  MOCK_DOLEANCES,
  MOCK_ARCHIVES,
  type ArchivedProposal,
} from "@/lib/mockProposals";

const sidebarItems: SidebarItem[] = [
  { icon: Flame, label: "En cours", href: "/agora", badge: String(MOCK_PROPOSALS.length), badgeVariant: "pink" },
  { icon: Scroll, label: "Doleances", href: "/agora/grievances", badge: String(MOCK_DOLEANCES.filter(d => d.statut === "ouverte" || d.statut === "seuil_atteint").length), badgeVariant: "orange" },
  { icon: FileText, label: "Propositions", href: "/agora/proposals" },
  { icon: Vote, label: "Votes actifs", href: "/agora/votes", badge: "3", badgeVariant: "green" },
  { icon: Archive, label: "Archives", href: "/agora/archives" },
];

type ResultFilter = "all" | "adopte" | "rejete";
type TypeFilter = "all" | "standard" | "constitutionnel" | "modification_parametre";

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; name?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-[var(--bg-card)] px-3 py-2 shadow-lg" style={{ borderColor: "var(--border)" }}>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold text-[var(--text-primary)]">
          {p.value}%
        </p>
      ))}
    </div>
  );
}

export default function ArchivesPage() {
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const filteredArchives = useMemo(() => {
    let result = [...MOCK_ARCHIVES];

    if (resultFilter !== "all") {
      result = result.filter((a) => a.resultat === resultFilter);
    }
    if (typeFilter !== "all") {
      result = result.filter((a) => (a.type || "standard") === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
      );
    }

    return result;
  }, [search, resultFilter, typeFilter]);

  // Stats
  const totalArchives = MOCK_ARCHIVES.length;
  const totalAdopte = MOCK_ARCHIVES.filter((a) => a.resultat === "adopte").length;
  const totalRejete = MOCK_ARCHIVES.filter((a) => a.resultat === "rejete").length;
  const tauxAdoption = Math.round((totalAdopte / totalArchives) * 100);

  // Donut data
  const donutData = [
    { name: "Adoptées", value: totalAdopte, color: "#10b981" },
    { name: "Rejetées", value: totalRejete, color: "#ef4444" },
  ];

  // Adoption rate by type
  const typeStats = [
    {
      type: "Standard",
      taux: Math.round(
        (MOCK_ARCHIVES.filter((a) => !a.type && a.resultat === "adopte").length /
          Math.max(MOCK_ARCHIVES.filter((a) => !a.type).length, 1)) * 100
      ),
    },
    {
      type: "Paramètre",
      taux: Math.round(
        (MOCK_ARCHIVES.filter((a) => a.type === "modification_parametre" && a.resultat === "adopte").length /
          Math.max(MOCK_ARCHIVES.filter((a) => a.type === "modification_parametre").length, 1)) * 100
      ),
    },
    {
      type: "Constitutionnel",
      taux: Math.round(
        (MOCK_ARCHIVES.filter((a) => a.type === "constitutionnel" && a.resultat === "adopte").length /
          Math.max(MOCK_ARCHIVES.filter((a) => a.type === "constitutionnel").length, 1)) * 100
      ),
    },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Agora">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Archives
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {totalArchives} propositions votées ces 30 derniers jours — {tauxAdoption}% adoptées
        </p>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-3">
        <SearchInput
          placeholder="Rechercher..."
          className="max-w-xs flex-1"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
        <select
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500"
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value as ResultFilter)}
        >
          <option value="all">Tous résultats</option>
          <option value="adopte">Adoptés</option>
          <option value="rejete">Rejetés</option>
        </select>
        <select
          className="h-10 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 pr-8 text-sm text-[var(--text-primary)] outline-none focus:border-violet-500"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
        >
          <option value="all">Tous types</option>
          <option value="standard">Standard</option>
          <option value="constitutionnel">Constitutionnel</option>
          <option value="modification_parametre">Paramètre système</option>
        </select>
      </div>

      {/* Archives list */}
      <div className="mb-6 space-y-3">
        {filteredArchives.map((arch) => {
          const isAdopte = arch.resultat === "adopte";
          const forPct = arch.totalVotes > 0 ? Math.round((arch.votesFor / arch.totalVotes) * 100) : 0;
          const againstPct = arch.totalVotes > 0 ? Math.round((arch.votesAgainst / arch.totalVotes) * 100) : 0;

          return (
            <Card
              key={arch.id}
              className="overflow-hidden"
              style={{ borderLeftWidth: "3px", borderLeftColor: isAdopte ? "#10b981" : "#ef4444" }}
            >
              <div className="p-4 md:p-5">
                {/* Top row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {arch.title}
                    </h3>
                    <Badge variant={arch.domainColor} className="shrink-0">{arch.domain}</Badge>
                    {arch.type === "modification_parametre" && (
                      <Badge className="text-xs bg-orange-500/15 text-orange-500 shrink-0">
                        <Settings className="h-3 w-3" />
                        Paramètre
                      </Badge>
                    )}
                    {arch.type === "constitutionnel" && (
                      <Badge variant="violet" className="shrink-0">
                        Constitutionnel
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={isAdopte ? "green" : "red"}>
                      {isAdopte ? (
                        <><CheckCircle2 className="h-3 w-3 mr-0.5" /> Adopté</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-0.5" /> Rejeté</>
                      )}
                    </Badge>
                    {arch.type === "modification_parametre" && isAdopte && (
                      <Badge variant={arch.applique ? "green" : "yellow"} className="text-xs">
                        {arch.applique ? "Appliqué ✓" : "En attente"}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mb-2">
                  {arch.description}
                </p>

                {/* Vote bar */}
                <VoteBar
                  votesFor={arch.votesFor}
                  votesAgainst={arch.votesAgainst}
                  votesAbstain={arch.votesAbstain}
                  className="mb-2"
                />

                {/* Stats row */}
                <div className="flex flex-wrap items-center justify-between text-xs text-[var(--text-muted)]">
                  <div className="flex items-center gap-3">
                    <span>
                      <span className={isAdopte ? "text-green-500" : "text-red-500"}>{forPct}% pour</span>
                      {" · "}
                      {againstPct}% contre
                    </span>
                    <span>Participation : {arch.participation}%</span>
                    <span>{formatNumber(arch.totalVotes)} votants</span>
                  </div>
                  <span>{arch.dateFin}</span>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredArchives.length === 0 && (
          <div className="flex items-center justify-center h-32 text-[var(--text-muted)]">
            Aucune proposition archivée ne correspond à votre recherche.
          </div>
        )}
      </div>

      {/* Statistics section */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques des votes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Donut chart */}
            <div>
              <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
                Résultats globaux
              </h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      strokeWidth={2}
                      stroke="var(--bg-card)"
                    >
                      {donutData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-[var(--bg-card)] px-3 py-2 shadow-lg" style={{ borderColor: "var(--border)" }}>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{d.name}</p>
                            <p className="text-xs text-[var(--text-muted)]">{d.value} propositions</p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex justify-center gap-6">
                <span className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                  <span className="h-3 w-3 rounded-full bg-green-500" />
                  Adoptées ({totalAdopte})
                </span>
                <span className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                  <span className="h-3 w-3 rounded-full bg-red-500" />
                  Rejetées ({totalRejete})
                </span>
              </div>
            </div>

            {/* Adoption rate by type - horizontal bars */}
            <div>
              <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
                Taux d&apos;adoption par type
              </h4>
              <div className="space-y-4">
                {typeStats.map((t) => (
                  <div key={t.type}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-[var(--text-primary)]">{t.type}</span>
                      <span className="text-sm font-mono font-semibold text-[var(--text-primary)]">
                        {t.taux}%
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all"
                        style={{ width: `${t.taux}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg bg-[var(--bg-elevated)] p-4">
                <p className="text-xs text-[var(--text-muted)]">
                  Le taux d&apos;adoption global est de <span className="font-semibold text-[var(--text-primary)]">{tauxAdoption}%</span>.
                  Les propositions constitutionnelles ont le taux d&apos;adoption le plus élevé, reflétant un consensus fort sur les valeurs fondamentales du système.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
