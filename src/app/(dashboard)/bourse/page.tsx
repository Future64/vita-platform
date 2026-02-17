"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  Send,
  QrCode,
  Calculator,
  Clock,
  PiggyBank,
  HandCoins,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ChevronRight,
  Timer,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { MOCK_WALLET } from "@/lib/mockBourse";
import type { Transaction } from "@/types/bourse";

const sidebarItems: SidebarItem[] = [
  { icon: Wallet, label: "Solde", href: "/bourse" },
  { icon: Send, label: "Payer", href: "/bourse/payer", permission: "send_vita" },
  { icon: QrCode, label: "Recevoir", href: "/bourse/recevoir", permission: "receive_vita" },
  { icon: Calculator, label: "Calculateur", href: "/bourse/calculateur" },
  { icon: Clock, label: "Historique", href: "/bourse/historique", permission: "view_transactions" },
  { icon: PiggyBank, label: "Épargne", href: "/bourse/epargne" },
  { icon: HandCoins, label: "Crédit", href: "/bourse/credit" },
];

const quickActions = [
  {
    label: "Payer",
    description: "Envoyer des Ѵ",
    icon: Send,
    href: "/bourse/payer",
    gradient: "from-violet-500 to-purple-600",
    permission: "send_vita" as const,
  },
  {
    label: "Recevoir",
    description: "Recevoir des Ѵ",
    icon: QrCode,
    href: "/bourse/recevoir",
    gradient: "from-pink-500 to-rose-600",
    permission: "receive_vita" as const,
  },
  {
    label: "Calculateur",
    description: "Valoriser un service",
    icon: Calculator,
    href: "/bourse/calculateur",
    gradient: "from-cyan-500 to-blue-600",
    permission: undefined,
  },
];

function TransactionIcon({ tx }: { tx: Transaction }) {
  if (tx.type === "emission") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/15">
        <Sparkles className="h-5 w-5 text-green-500" />
      </div>
    );
  }
  if (tx.type === "reception") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15">
        <ArrowDownLeft className="h-5 w-5 text-violet-500" />
      </div>
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/15">
      <ArrowUpRight className="h-5 w-5 text-pink-500" />
    </div>
  );
}

function formatTxDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  return `Il y a ${diffDays}j`;
}

function useAnimatedCounter(target: number, duration: number = 1500): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}

function useCountdown(targetIso: string) {
  const [remaining, setRemaining] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    function update() {
      const diff = new Date(targetIso).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining({ h: 0, m: 0, s: 0 });
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining({ h, m, s });
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  return remaining;
}

export default function BoursePage() {
  const wallet = MOCK_WALLET;
  const animatedSolde = useAnimatedCounter(wallet.solde);
  const countdown = useCountdown(wallet.prochaineEmission);

  const recentTxs = useMemo(() => wallet.transactions.slice(0, 5), [wallet.transactions]);
  const joursDeVie = Math.floor(wallet.solde);

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Bourse">
      {/* Balance Card */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_70%)]" />
        <div className="relative z-10">
          <p className="mb-1 text-sm font-medium text-white/70">
            Solde actuel
          </p>
          <div className="flex items-baseline gap-3">
            <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-6xl">
              {animatedSolde.toFixed(2)}
            </h1>
            <span className="text-3xl font-bold text-white/80">Ѵ</span>
          </div>
          <p className="mt-2 text-sm text-white/60">
            &asymp; {joursDeVie} jours de vie
          </p>

          {/* Emission status */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {wallet.emissionAujourdHui ? (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                +1 Ѵ reçu aujourd&apos;hui
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/70">
                <Timer className="h-3.5 w-3.5" />
                Émission en attente
              </div>
            )}

            {/* Countdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/50">Prochaine émission</span>
              <div className="flex items-center gap-1 font-mono text-sm font-bold text-white">
                <span className="rounded bg-white/15 px-1.5 py-0.5">
                  {String(countdown.h).padStart(2, "0")}
                </span>
                <span className="text-white/40">:</span>
                <span className="rounded bg-white/15 px-1.5 py-0.5">
                  {String(countdown.m).padStart(2, "0")}
                </span>
                <span className="text-white/40">:</span>
                <span className="rounded bg-white/15 px-1.5 py-0.5">
                  {String(countdown.s).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          variant="green"
          label="Émissions totales"
          value={`${wallet.totalEmissions} Ѵ`}
          trend={{ value: "+1/jour", direction: "up" }}
        />
        <StatCard
          variant="violet"
          label="Total reçu"
          value={`${wallet.totalRecu.toFixed(2)} Ѵ`}
        />
        <StatCard
          variant="pink"
          label="Total envoyé"
          value={`${wallet.totalEnvoye.toFixed(2)} Ѵ`}
        />
        <StatCard
          variant="cyan"
          label="Streak émissions"
          value="42 jours"
          trend={{ value: "record", direction: "up" }}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const card = (
              <Link key={action.label} href={action.href}>
                <div className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-all hover:border-violet-500/50 hover:-translate-y-0.5 hover:shadow-lg">
                  <div
                    className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient}`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">
                    {action.label}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    {action.description}
                  </p>
                  <ChevronRight className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
                </div>
              </Link>
            );

            if (action.permission) {
              return (
                <PermissionGate key={action.label} permission={action.permission}>
                  {card}
                </PermissionGate>
              );
            }
            return card;
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Dernières transactions</CardTitle>
          <Link
            href="/bourse/historique"
            className="text-sm font-medium text-violet-500 hover:text-violet-400 transition-colors"
          >
            Voir tout
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-[var(--border)]">
            {recentTxs.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-[var(--text-muted)]">
                  Aucune transaction pour le moment
                </p>
              </div>
            ) : (
              recentTxs.map((tx) => {
                const isIncoming = tx.type === "emission" || tx.type === "reception";
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 px-4 py-3.5 md:px-5 transition-colors hover:bg-[var(--bg-card-hover)]"
                  >
                    <TransactionIcon tx={tx} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {tx.type === "emission"
                          ? "Émission quotidienne"
                          : tx.motif || (isIncoming ? "Paiement reçu" : "Paiement envoyé")}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {tx.contrepartie ? `${tx.contrepartie} · ` : ""}
                        {formatTxDate(tx.date)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-semibold font-mono ${
                          isIncoming ? "text-green-500" : "text-pink-500"
                        }`}
                      >
                        {isIncoming ? "+" : "-"}
                        {tx.montant.toFixed(2)} Ѵ
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
