"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  Coins,
  Users,
  Vote,
  GitBranch,
  Download,
  UserPlus,
  ArrowUpDown,
  FileText,
  Settings,
  Clock,
  Activity,
  Database,
  Server,
  Shield,
  CheckCircle2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { formatNumber } from "@/lib/format";
import Link from "next/link";
import {
  PANORAMA_DATA,
  ACTIVE_VOTES,
  SYSTEM_HEALTH,
  generateRandomActivity,
  type ActivityItem,
} from "@/lib/mockPanorama";
import dynamic from "next/dynamic";

const WorldActivityMap = dynamic(
  () => import("@/components/modules/panorama/WorldActivityMap"),
  { ssr: false }
);

const sidebarItems: SidebarItem[] = [
  { icon: Globe, label: "Dashboard", href: "/panorama" },
  { icon: Coins, label: "Économie", href: "/panorama/economy" },
  { icon: Users, label: "Citoyens", href: "/panorama/citizens" },
  { icon: Vote, label: "Votes", href: "/panorama/votes" },
  { icon: GitBranch, label: "Projets", href: "/forge" },
];

// Icons for activity types
const activityIcons: Record<ActivityItem["type"], { icon: typeof UserPlus; variant: string }> = {
  inscription: { icon: UserPlus, variant: "text-violet-500 bg-violet-500/15" },
  transaction: { icon: ArrowUpDown, variant: "text-green-500 bg-green-500/15" },
  vote: { icon: Vote, variant: "text-cyan-500 bg-cyan-500/15" },
  proposition: { icon: FileText, variant: "text-orange-500 bg-orange-500/15" },
  parametre: { icon: Settings, variant: "text-amber-500 bg-amber-500/15" },
};

// Custom tooltip for recharts
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

export default function PanoramaPage() {
  const d = PANORAMA_DATA;

  // Live activity feed with 30s auto-update
  const [activities, setActivities] = useState<ActivityItem[]>(d.activiteRecente);
  const [visibleCount, setVisibleCount] = useState(0);

  // Staggered animation on mount
  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= 10) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Auto-add random activity every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities((prev) => [generateRandomActivity(), ...prev].slice(0, 15));
      setVisibleCount((prev) => prev + 1);
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const equalityScore = (1 - d.indiceGini).toFixed(2);

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Panorama">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Dashboard Global
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Temps réel — {formatNumber(d.utilisateursVerifies)} citoyens vérifiés
          </p>
        </div>
        <Button variant="secondary">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* ============================================
          SECTION 1 — Indicateurs clés
          ============================================ */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          variant="violet"
          label="Population vérifiée"
          value={formatNumber(d.utilisateursVerifies)}
          trend={{ value: `${d.tauxAdoption.toFixed(3)}% monde`, direction: "up" }}
        />
        <StatCard
          variant="cyan"
          label="Masse monétaire"
          value={`${formatNumber(d.masseMonetaireTotal)} Ѵ`}
          trend={{ value: `+${formatNumber(d.emissionsAujourdHui)} Ѵ/j`, direction: "up" }}
        />
        <StatCard
          variant="green"
          label="Transactions / jour"
          value={formatNumber(d.transactionsAujourdHui)}
          trend={{ value: `Vol: ${formatNumber(d.volumeTransactions)} Ѵ`, direction: "up" }}
        />
        <StatCard
          variant="pink"
          label="Indice d'égalité"
          value={equalityScore}
          trend={{ value: `Ratio max/min : ${d.ratioMaxMin}`, direction: "up" }}
        />
      </div>

      {/* ============================================
          SECTION 2 — Graphiques
          ============================================ */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Croissance des utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle>Croissance des utilisateurs</CardTitle>
            <Badge variant="violet">30 jours</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.historiqueUtilisateurs}>
                  <defs>
                    <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="gradStrokeUsers" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
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
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1_000_000).toFixed(2)}M`}
                    width={50}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="url(#gradStrokeUsers)"
                    fill="url(#gradUsers)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Volume de transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Volume de transactions</CardTitle>
            <Badge variant="green">30 jours</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={d.historiqueTransactions}>
                  <defs>
                    <linearGradient id="gradBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity={0.6} />
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
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
                    width={50}
                  />
                  <Tooltip content={<ChartTooltip suffix=" Ѵ" />} />
                  <Bar dataKey="volume" fill="url(#gradBar)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Taux de participation */}
        <Card>
          <CardHeader>
            <CardTitle>Taux de participation aux votes</CardTitle>
            <Badge variant="cyan">30 jours</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={d.historiqueParticipation}>
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

        {/* Masse monétaire */}
        <Card>
          <CardHeader>
            <CardTitle>Masse monétaire</CardTitle>
            <Badge variant="green">30 jours</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.historiqueMasseMonetaire}>
                  <defs>
                    <linearGradient id="gradMasse" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.05} />
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
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                    width={40}
                  />
                  <Tooltip content={<ChartTooltip suffix=" Ѵ" />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    fill="url(#gradMasse)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================
          SECTION 2b — Activité mondiale (carte)
          ============================================ */}
      <Card className="mb-6 overflow-hidden">
        <CardHeader>
          <CardTitle>Activite mondiale</CardTitle>
          <span className="text-xs text-[var(--text-muted)]">
            {d.topPays.length > 0 ? `${47} pays actifs` : ""} — {formatNumber(d.utilisateursVerifies)} citoyens verifies
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[350px] sm:h-[400px] md:h-[450px]">
            <WorldActivityMap />
          </div>
        </CardContent>
      </Card>

      {/* ============================================
          SECTION 3 + 4 + 5 — Three columns
          ============================================ */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* SECTION 3 — Gouvernance en direct */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Votes en cours</CardTitle>
            <Link href="/agora">
              <Button variant="ghost" size="sm" className="text-violet-500">
                Voir tout
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[var(--border)]">
              {ACTIVE_VOTES.map((vote) => {
                const pourcent = vote.totalVotes > 0
                  ? Math.round((vote.votePour / vote.totalVotes) * 100)
                  : 0;
                return (
                  <Link key={vote.id} href="/agora">
                    <div className="px-4 py-3.5 transition-colors hover:bg-[var(--bg-card-hover)] cursor-pointer">
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-sm font-medium text-[var(--text-primary)] truncate pr-2">
                          {vote.titre}
                        </h4>
                        <Badge variant={vote.domaineBadge} className="text-xs shrink-0">
                          {vote.domaine}
                        </Badge>
                      </div>
                      {/* Vote bar */}
                      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)] mb-1.5">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{
                            width: `${(vote.votePour / vote.totalVotes) * 100}%`,
                          }}
                        />
                        <div
                          className="h-full bg-pink-500 transition-all"
                          style={{
                            width: `${(vote.voteContre / vote.totalVotes) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                        <span>
                          <span className="text-green-500">{pourcent}% pour</span>
                          {" · "}
                          {formatNumber(vote.totalVotes)} votes
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {vote.tempsRestant}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4 — Activité récente */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Fil d&apos;activité</CardTitle>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="text-xs text-green-500 font-medium">Live</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[var(--border)] max-h-[420px] overflow-y-auto">
              {activities.slice(0, 10).map((item, idx) => {
                const config = activityIcons[item.type];
                const Icon = config.icon;
                const isVisible = idx < visibleCount;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 px-4 py-3 transition-all"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? "translateY(0)" : "translateY(8px)",
                      transition: `opacity 0.3s ease ${idx * 0.05}s, transform 0.3s ease ${idx * 0.05}s`,
                    }}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.variant}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {item.titre}
                      </p>
                      {item.details && (
                        <p className="text-xs text-[var(--text-muted)] truncate">
                          {item.details}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-[var(--text-muted)] whitespace-nowrap">
                      {item.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* SECTION 5 — Répartition mondiale (top 10) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Répartition mondiale</CardTitle>
            <Badge variant="violet">{d.topPays.length} pays</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[var(--border)]">
              {d.topPays.map((pays, idx) => {
                const maxUsers = d.topPays[0].utilisateurs;
                const pct = (pays.utilisateurs / maxUsers) * 100;
                return (
                  <div key={pays.pays} className="px-4 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[var(--text-muted)] w-4">
                          {idx + 1}
                        </span>
                        <span className="text-base">{pays.drapeau}</span>
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {pays.pays}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-[var(--text-primary)] font-mono">
                        {formatNumber(pays.utilisateurs)}
                      </span>
                    </div>
                    <div className="ml-10 h-1 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============================================
          SECTION 6 — Métriques système (admin only)
          ============================================ */}
      <PermissionGate permission="view_system_stats" hide>
        <Card>
          <CardHeader>
            <CardTitle>
              <Activity className="h-4 w-4 inline mr-2" />
              Santé du système
            </CardTitle>
            <Badge variant="green">Opérationnel</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* API Response */}
              <div className="rounded-lg bg-[var(--bg-elevated)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-xs text-[var(--text-muted)]">Temps API</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[var(--text-primary)] font-mono">
                    {SYSTEM_HEALTH.apiResponseMs}ms
                  </span>
                  <Badge variant="green" className="text-xs">OK</Badge>
                </div>
              </div>

              {/* Database */}
              <div className="rounded-lg bg-[var(--bg-elevated)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-xs text-[var(--text-muted)]">Base de données</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[var(--text-primary)]">
                    Opérationnelle
                  </span>
                  <Badge variant="green" className="text-xs">OK</Badge>
                </div>
              </div>

              {/* Emission Queue */}
              <div className="rounded-lg bg-[var(--bg-elevated)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-xs text-[var(--text-muted)]">File d&apos;émission</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[var(--text-primary)] font-mono">
                    100%
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {formatNumber(SYSTEM_HEALTH.emissionQueue.processed)} / {formatNumber(SYSTEM_HEALTH.emissionQueue.total)}
                </p>
              </div>

              {/* Backup */}
              <div className="rounded-lg bg-[var(--bg-elevated)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-xs text-[var(--text-muted)]">Dernière sauvegarde</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[var(--text-primary)]">
                    {SYSTEM_HEALTH.lastBackup}
                  </span>
                </div>
              </div>

              {/* Uptime */}
              <div className="rounded-lg bg-[var(--bg-elevated)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-[var(--text-muted)]" />
                  <span className="text-xs text-[var(--text-muted)]">Uptime (30j)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[var(--text-primary)] font-mono">
                    {SYSTEM_HEALTH.uptime30j}%
                  </span>
                  <Badge variant="green" className="text-xs">Excellent</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PermissionGate>
    </DashboardLayout>
  );
}
