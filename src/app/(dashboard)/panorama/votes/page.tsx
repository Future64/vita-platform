"use client";

import {
  Globe,
  Coins,
  Users,
  Vote,
  GitBranch,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { formatNumber } from "@/lib/format";
import { VOTES_DATA } from "@/lib/mockPanorama";

const sidebarItems: SidebarItem[] = [
  { icon: Globe, label: "Dashboard", href: "/panorama" },
  { icon: Coins, label: "Économie", href: "/panorama/economy" },
  { icon: Users, label: "Citoyens", href: "/panorama/citizens" },
  { icon: Vote, label: "Votes", href: "/panorama/votes" },
  { icon: GitBranch, label: "Projets", href: "/forge" },
];

function ChartTooltip({ active, payload, label, suffix }: {
  active?: boolean;
  payload?: { value: number; name?: string }[];
  label?: string;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-[var(--bg-card)] px-3 py-2 shadow-lg" style={{ borderColor: "var(--border)" }}>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-semibold text-[var(--text-primary)]">
          {formatNumber(Math.round(p.value))}{suffix ?? ""}
        </p>
      ))}
    </div>
  );
}

export default function VotesPage() {
  const vd = VOTES_DATA;

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Panorama">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Votes
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Gouvernance participative et résultats des scrutins
        </p>
      </div>

      {/* ============================================
          SECTION 1 — Overview
          ============================================ */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          variant="violet"
          label="Votes actifs"
          value={vd.overview.votesActifs}
        />
        <StatCard
          variant="cyan"
          label="Votants uniques"
          value={formatNumber(vd.overview.totalVotants)}
        />
        <StatCard
          variant="green"
          label="Taux de participation"
          value={`${vd.overview.tauxParticipation}%`}
          trend={{ value: "Au-dessus du quorum", direction: "up" }}
        />
        <StatCard
          variant="orange"
          label="Propositions en attente"
          value={vd.overview.propositionsEnAttente}
        />
      </div>

      {/* Participation chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Taux de participation</CardTitle>
          <Badge variant="cyan">30 jours</Badge>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vd.overview.historiqueParticipation}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={6}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                  domain={[50, 75]}
                  width={40}
                />
                <Tooltip content={<ChartTooltip suffix="%" />} />
                <ReferenceLine
                  y={50}
                  stroke="var(--text-muted)"
                  strokeDasharray="6 4"
                  strokeOpacity={0.5}
                  label={{
                    value: "Quorum 50%",
                    position: "insideTopLeft",
                    fill: "var(--text-muted)",
                    fontSize: 10,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#06b6d4" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ============================================
          SECTION 2 — Votes en cours
          ============================================ */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Votes en cours</CardTitle>
          <Badge variant="violet">{vd.enCours.length} actifs</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[var(--border)]">
            {vd.enCours.map((v) => {
              const total = v.pour + v.contre + v.abstention;
              const pourPct = total > 0 ? (v.pour / total) * 100 : 0;
              const contrePct = total > 0 ? (v.contre / total) * 100 : 0;
              const abstPct = total > 0 ? (v.abstention / total) * 100 : 0;
              const quorumPct = Math.min((v.totalVotants / v.quorum) * 100, 100);
              const quorumAtteint = v.totalVotants >= v.quorum;

              return (
                <div key={v.id} className="px-4 py-4 md:px-5">
                  {/* Title + badge + time */}
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                          {v.titre}
                        </h4>
                        <Badge variant={v.typeBadge} className="shrink-0">{v.type}</Badge>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-1">{v.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <Clock className="h-3 w-3" />
                        {v.tempsRestant}
                      </span>
                      <PermissionGate permission="vote_proposal" hide>
                        <Button variant="primary" size="sm">
                          Voter
                        </Button>
                      </PermissionGate>
                    </div>
                  </div>

                  {/* Three-color progress bar */}
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)] mb-2">
                    <div className="h-full bg-green-500" style={{ width: `${pourPct}%` }} />
                    <div className="h-full bg-red-500" style={{ width: `${contrePct}%` }} />
                    <div className="h-full" style={{ width: `${abstPct}%`, backgroundColor: "var(--text-muted)" }} />
                  </div>

                  {/* Stats row */}
                  <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-green-500 font-medium">
                        {Math.round(pourPct)}% pour
                      </span>
                      <span className="text-red-500 font-medium">
                        {Math.round(contrePct)}% contre
                      </span>
                      <span className="text-[var(--text-muted)]">
                        {Math.round(abstPct)}% abstention
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--text-muted)]">
                        {formatNumber(v.totalVotants)} / {formatNumber(v.quorum)} votants
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${quorumPct}%`,
                              backgroundColor: quorumAtteint ? "#10b981" : "#f59e0b",
                            }}
                          />
                        </div>
                        {quorumAtteint ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <span className="text-[0.625rem] text-orange-500">{Math.round(quorumPct)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ============================================
          SECTION 3 — Derniers résultats
          ============================================ */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Derniers résultats</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[var(--border)]">
            {vd.resultats.map((r) => {
              const isAdopte = r.resultat === "adopte";
              const pourPct = r.totalVotants > 0 ? Math.round((r.pour / r.totalVotants) * 100) : 0;

              return (
                <div
                  key={r.id}
                  className="px-4 py-3.5 md:px-5"
                  style={{ borderLeft: `3px solid ${isAdopte ? "#10b981" : "#ef4444"}` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {r.titre}
                      </h4>
                      <Badge variant={r.typeBadge} className="shrink-0">{r.type}</Badge>
                    </div>
                    <Badge
                      variant={isAdopte ? "green" : "red"}
                      className="shrink-0 ml-2"
                    >
                      {isAdopte ? (
                        <><CheckCircle2 className="h-3 w-3 mr-0.5" /> Adopté</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-0.5" /> Rejeté</>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>
                      <span className={isAdopte ? "text-green-500" : "text-red-500"}>
                        {pourPct}% pour
                      </span>
                      {" · "}
                      {formatNumber(r.totalVotants)} votants
                    </span>
                    <span>{r.dateFin}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ============================================
          SECTION 4 — Statistiques
          ============================================ */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Statistiques des votes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Type distribution donut */}
            <div>
              <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
                Répartition par type
              </h4>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vd.statistiques.parType}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      strokeWidth={2}
                      stroke="var(--bg-card)"
                    >
                      {vd.statistiques.parType.map((entry) => (
                        <Cell key={entry.type} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-[var(--bg-card)] px-3 py-2 shadow-lg" style={{ borderColor: "var(--border)" }}>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{d.type}</p>
                            <p className="text-xs text-[var(--text-muted)]">{d.count} propositions</p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 justify-center">
                {vd.statistiques.parType.map((t) => (
                  <span key={t.type} className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.type} ({t.count})
                  </span>
                ))}
              </div>
            </div>

            {/* Day-of-week participation */}
            <div>
              <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
                Participation par jour
              </h4>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vd.statistiques.parJour}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                    <XAxis
                      dataKey="jour"
                      tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}%`}
                      domain={[0, 100]}
                      width={40}
                    />
                    <Tooltip content={<ChartTooltip suffix="%" />} />
                    <Bar dataKey="participation" radius={[4, 4, 0, 0]}>
                      {vd.statistiques.parJour.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={entry.participation >= 65 ? "#8b5cf6" : entry.participation >= 50 ? "#a855f7" : "#c084fc"}
                          fillOpacity={0.7 + (entry.participation / 100) * 0.3}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 text-xs text-[var(--text-muted)]">
                La participation est plus élevée en début de semaine. Le mercredi est le jour le plus actif avec {vd.statistiques.parJour[2].participation}% de participation moyenne.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
