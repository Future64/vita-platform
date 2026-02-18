"use client";

import {
  Globe,
  Coins,
  Users,
  Vote,
  GitBranch,
  TrendingUp,
  ArrowUpDown,
  Zap,
  Timer,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatNumber } from "@/lib/format";
import { ECONOMY_DATA } from "@/lib/mockPanorama";

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

export default function EconomyPage() {
  const eco = ECONOMY_DATA;

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Panorama">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Économie
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Masse monétaire, transactions et égalité
        </p>
      </div>

      {/* ============================================
          SECTION 1 — Masse monétaire
          ============================================ */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle>Masse monétaire</CardTitle>
            <Badge variant="green">+{eco.masseMonetaire.variation30j}% / 30j</Badge>
          </div>
          <span className="text-xl font-bold text-[var(--text-primary)] font-mono">
            {formatNumber(eco.masseMonetaire.total)} Ѵ
          </span>
        </CardHeader>
        <CardContent>
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={eco.masseMonetaire.historique}>
                <defs>
                  <linearGradient id="gradMasseEco" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#gradMasseEco)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-[var(--bg-elevated)] p-4">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]">Émission quotidienne</span>
              </div>
              <span className="text-lg font-bold text-[var(--text-primary)] font-mono">
                {formatNumber(eco.masseMonetaire.emissionQuotidienne)} Ѵ
              </span>
            </div>
            <div className="rounded-lg bg-[var(--bg-elevated)] p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]">Vitesse de circulation</span>
              </div>
              <span className="text-lg font-bold text-[var(--text-primary)] font-mono">
                ×{eco.masseMonetaire.vitesseCirculation}
              </span>
            </div>
            <div className="rounded-lg bg-[var(--bg-elevated)] p-4">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpDown className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-xs text-[var(--text-muted)]">Volume moyen 24h</span>
              </div>
              <span className="text-lg font-bold text-[var(--text-primary)] font-mono">
                {formatNumber(eco.masseMonetaire.volumeMoyen24h)} Ѵ
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================
          SECTION 2 — Transactions
          ============================================ */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <Badge variant="violet">30 jours</Badge>
        </CardHeader>
        <CardContent>
          {/* Stats grid */}
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              variant="violet"
              label="Transactions / 24h"
              value={formatNumber(eco.transactions.total24h)}
            />
            <StatCard
              variant="cyan"
              label="Volume 24h"
              value={`${formatNumber(eco.transactions.volume24h)} Ѵ`}
            />
            <StatCard
              variant="green"
              label="Montant moyen"
              value={`${eco.transactions.moyenneMontant} Ѵ`}
            />
            <StatCard
              variant="pink"
              label="Temps médian"
              value={eco.transactions.tempsMedian}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Bar chart */}
            <div className="lg:col-span-2">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eco.transactions.historique}>
                    <defs>
                      <linearGradient id="gradBarEco" x1="0" y1="0" x2="0" y2="1">
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
                    <Bar dataKey="volume" fill="url(#gradBarEco)" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transaction type breakdown */}
            <div>
              <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
                Répartition par type
              </h4>
              <div className="space-y-3">
                {eco.transactions.parType.map((t) => (
                  <div key={t.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[var(--text-primary)]">{t.type}</span>
                      <span className="text-sm font-semibold text-[var(--text-primary)] font-mono">
                        {t.pourcentage}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${t.pourcentage}%`, backgroundColor: t.color }}
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
          SECTION 3 — Services les plus échangés
          ============================================ */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Services les plus échangés</CardTitle>
          <Badge variant="violet">{eco.services.length} catégories</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)" }}>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase">Service</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">Volume (Ѵ)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">Transactions</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase">Tendance</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase min-w-[120px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                {eco.services.map((s, idx) => {
                  const maxVolume = eco.services[0].volume;
                  const pct = (s.volume / maxVolume) * 100;
                  return (
                    <tr key={s.nom} className="transition-colors hover:bg-[var(--bg-card-hover)]">
                      <td className="px-4 py-3 text-xs font-mono text-[var(--text-muted)]">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{s.nom}</td>
                      <td className="px-4 py-3 text-right font-mono text-[var(--text-primary)]">
                        {formatNumber(s.volume)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[var(--text-secondary)]">
                        {formatNumber(s.transactions)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${s.tendance >= 0 ? "text-green-500" : "text-red-500"}`}>
                          <TrendingUp className={`h-3 w-3 ${s.tendance < 0 ? "rotate-180" : ""}`} />
                          {s.tendance > 0 ? "+" : ""}{s.tendance}%
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-4 py-3">
                        <div className="h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ============================================
          SECTION 4 — Égalité économique
          ============================================ */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Égalité économique</CardTitle>
          <Badge variant="green">Gini : {eco.egalite.gini}</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Gini gauge + comparison */}
            <div>
              {/* Visual Gini gauge */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[var(--text-muted)]">Égalité parfaite</span>
                  <span className="text-xs text-[var(--text-muted)]">Inégalité maximale</span>
                </div>
                <div className="relative h-4 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 overflow-hidden">
                  <div
                    className="absolute top-0 h-full w-1 bg-white shadow-lg"
                    style={{ left: `${eco.egalite.gini * 100}%` }}
                  />
                </div>
                <div className="mt-1 text-center">
                  <span className="text-2xl font-bold text-green-500 font-mono">{eco.egalite.gini}</span>
                  <span className="text-sm text-[var(--text-muted)] ml-2">/ 1.00</span>
                </div>
              </div>

              {/* Country comparison */}
              <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                Comparaison internationale
              </h4>
              <div className="space-y-2.5">
                {eco.egalite.comparaisonPays.map((c) => (
                  <div key={c.pays}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{c.drapeau}</span>
                        <span className="text-sm text-[var(--text-primary)]">{c.pays}</span>
                      </div>
                      <span className="text-sm font-mono text-[var(--text-primary)]">{c.gini}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${c.gini * 100}%`,
                          backgroundColor: c.gini <= 0.15 ? "#10b981" : c.gini <= 0.35 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wealth distribution */}
            <div>
              <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
                Distribution de la richesse
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eco.egalite.distributionRichesse} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="tranche"
                      tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                      tickLine={false}
                      axisLine={false}
                      width={70}
                    />
                    <Tooltip content={<ChartTooltip suffix="%" />} />
                    <Bar dataKey="pourcentage" radius={[0, 4, 4, 0]}>
                      {eco.egalite.distributionRichesse.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={idx <= 2 ? "#8b5cf6" : idx <= 4 ? "#a855f7" : "#c084fc"}
                          fillOpacity={0.8 - idx * 0.05}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 rounded-lg bg-[var(--bg-elevated)] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">Ratio max/min</p>
                    <p className="text-lg font-bold text-[var(--text-primary)] font-mono">
                      ×{eco.egalite.ratioMaxMin}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--text-muted)]">Patrimoine médian</p>
                    <p className="text-lg font-bold text-[var(--text-primary)] font-mono">
                      {eco.egalite.medianePatrimoine} Ѵ
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Le ratio de {eco.egalite.ratioMaxMin}× entre les plus riches et les plus pauvres est remarquablement bas comparé aux systèmes traditionnels.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
