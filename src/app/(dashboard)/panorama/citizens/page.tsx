"use client";

import {
  Globe,
  Coins,
  Users,
  Vote,
  GitBranch,
  UserPlus,
  UserCheck,
  Activity,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatNumber } from "@/lib/format";
import { CITIZENS_DATA } from "@/lib/mockPanorama";

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

const HEATMAP_COLORS = [
  "var(--bg-elevated)",
  "rgba(139, 92, 246, 0.2)",
  "rgba(139, 92, 246, 0.4)",
  "rgba(139, 92, 246, 0.6)",
  "rgba(139, 92, 246, 0.85)",
];

export default function CitizensPage() {
  const cit = CITIZENS_DATA;

  // Merge total + nouveaux for combo chart
  const comboData = cit.overview.historiqueTotal.map((pt, i) => ({
    date: pt.date,
    total: pt.value,
    nouveaux: cit.overview.historiqueNouveaux[i]?.value ?? 0,
  }));

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Panorama">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Citoyens
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Démographie, contributeurs et activité communautaire
        </p>
      </div>

      {/* ============================================
          SECTION 1 — Overview
          ============================================ */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          variant="violet"
          label="Citoyens vérifiés"
          value={formatNumber(cit.overview.totalVerifies)}
          trend={{ value: `+${cit.overview.croissance30j}% / 30j`, direction: "up" }}
        />
        <StatCard
          variant="orange"
          label="En attente"
          value={formatNumber(cit.overview.enAttente)}
        />
        <StatCard
          variant="cyan"
          label="Actifs (7j)"
          value={formatNumber(cit.overview.actifs7j)}
        />
        <StatCard
          variant="green"
          label="Actifs (30j)"
          value={formatNumber(cit.overview.actifs30j)}
        />
      </div>

      {/* Growth chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Croissance des citoyens</CardTitle>
          <Badge variant="violet">30 jours</Badge>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={comboData}>
                <defs>
                  <linearGradient id="gradTotalCit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={6}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(2)}M`}
                  width={50}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1_000).toFixed(1)}k`}
                  width={45}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="total"
                  stroke="#8b5cf6"
                  fill="url(#gradTotalCit)"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="nouveaux"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center gap-6 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-sm" style={{ backgroundColor: "#8b5cf6" }} />
              Total cumulé
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded-sm" style={{ backgroundColor: "#ec4899" }} />
              Nouveaux / jour
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ============================================
          SECTION 2 — Démographie
          ============================================ */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Démographie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Age distribution - horizontal bars */}
            <div>
              <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Par tranche d&apos;âge</h4>
              <div className="space-y-3">
                {cit.demographics.parAge.map((a) => (
                  <div key={a.tranche}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[var(--text-primary)]">{a.tranche} ans</span>
                      <span className="text-sm font-mono text-[var(--text-secondary)]">{a.pourcentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                        style={{ width: `${(a.pourcentage / 34) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continent distribution - donut */}
            <div>
              <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Par continent</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cit.demographics.parContinent}
                      dataKey="pourcentage"
                      nameKey="continent"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      strokeWidth={2}
                      stroke="var(--bg-card)"
                    >
                      {cit.demographics.parContinent.map((entry) => (
                        <Cell key={entry.continent} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-[var(--bg-card)] px-3 py-2 shadow-lg" style={{ borderColor: "var(--border)" }}>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{d.continent}</p>
                            <p className="text-xs text-[var(--text-muted)]">{d.pourcentage}%</p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 justify-center">
                {cit.demographics.parContinent.map((c) => (
                  <span key={c.continent} className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.continent}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages - bars */}
            <div>
              <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Par langue</h4>
              <div className="space-y-2.5">
                {cit.demographics.parLangue.map((l) => (
                  <div key={l.langue}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[var(--text-primary)]">{l.langue}</span>
                      <span className="text-xs font-mono text-[var(--text-secondary)]">{l.pourcentage}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(l.pourcentage / 24) * 100}%`,
                          backgroundColor: "#8b5cf6",
                          opacity: 0.4 + (l.pourcentage / 24) * 0.6,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================
          SECTION 3 + 4 — Contributors + New arrivals
          ============================================ */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Top contributeurs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top contributeurs</CardTitle>
            <Badge variant="violet">{cit.topContributeurs.length} membres</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">Citoyen</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">Propositions</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">Votes</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">Réputation</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {cit.topContributeurs.map((c) => (
                    <tr
                      key={c.pseudo}
                      className="transition-colors hover:bg-[var(--bg-card-hover)]"
                      style={c.rang <= 3 ? { backgroundColor: "rgba(139, 92, 246, 0.04)" } : undefined}
                    >
                      <td className="px-4 py-3">
                        {c.rang <= 3 ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: c.rang === 1 ? "#f59e0b" : c.rang === 2 ? "#94a3b8" : "#d97706" }}
                          >
                            {c.rang}
                          </span>
                        ) : (
                          <span className="text-xs font-mono text-[var(--text-muted)] ml-1">{c.rang}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: c.couleur }}
                          >
                            {c.initiales}
                          </div>
                          <span className="font-medium text-[var(--text-primary)]">{c.pseudo}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[var(--text-secondary)]">{c.propositions}</td>
                      <td className="px-4 py-3 text-right font-mono text-[var(--text-secondary)]">{c.votes}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono font-semibold text-violet-500">{c.reputation}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Nouveaux arrivants */}
        <Card>
          <CardHeader>
            <CardTitle>Nouveaux arrivants</CardTitle>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="text-xs text-green-500 font-medium">Live</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[var(--border)]">
              {cit.nouveaux.map((n) => (
                <div key={n.pseudo} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/15">
                    <UserPlus className="h-4 w-4 text-violet-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {n.pseudo}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {n.drapeau} {n.pays}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {n.date}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================
          SECTION 5 — Activité (heatmap)
          ============================================ */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Activité communautaire</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mini stats */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-[var(--bg-elevated)] p-4">
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]">Inscriptions 24h</span>
              </div>
              <span className="text-lg font-bold text-[var(--text-primary)] font-mono">
                {formatNumber(cit.activite.inscriptions24h)}
              </span>
            </div>
            <div className="rounded-lg bg-[var(--bg-elevated)] p-4">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]">Vérifications en cours</span>
              </div>
              <span className="text-lg font-bold text-[var(--text-primary)] font-mono">
                {formatNumber(cit.activite.verificationsEnCours)}
              </span>
            </div>
            <div className="rounded-lg bg-[var(--bg-elevated)] p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]">Tx / utilisateur (moy.)</span>
              </div>
              <span className="text-lg font-bold text-[var(--text-primary)] font-mono">
                {cit.activite.txParUtilisateur}
              </span>
            </div>
          </div>

          {/* GitHub-style heatmap */}
          <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
            Carte de contributions (28 derniers jours)
          </h4>
          <div className="flex flex-wrap gap-1">
            {cit.activite.contributionMap.map((day, i) => (
              <div
                key={i}
                className="h-4 w-4 rounded-sm transition-colors"
                style={{ backgroundColor: HEATMAP_COLORS[day.level] }}
                title={`${day.date} — niveau ${day.level}`}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span>Moins</span>
            {HEATMAP_COLORS.map((color, i) => (
              <div
                key={i}
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: color }}
              />
            ))}
            <span>Plus</span>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
