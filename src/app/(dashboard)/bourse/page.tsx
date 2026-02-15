"use client";

import { useState, useEffect } from "react";
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
  Flame,
  ChevronRight,
  Loader2,
  WifiOff,
  UserPlus,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { useVitaAccount } from "@/hooks/useVitaAccount";
import type { VitaTransaction } from "@/types/vita";

const sidebarItems: SidebarItem[] = [
  { icon: Wallet, label: "Solde", href: "/bourse" },
  { icon: Send, label: "Payer", href: "/bourse/payer" },
  { icon: QrCode, label: "Recevoir", href: "/bourse/recevoir" },
  { icon: Calculator, label: "Calculateur", href: "/bourse/calculateur" },
  { icon: Clock, label: "Historique", href: "/bourse/historique" },
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
  },
  {
    label: "Recevoir",
    description: "Recevoir des Ѵ",
    icon: QrCode,
    href: "/bourse/recevoir",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    label: "Calculateur",
    description: "Valoriser un service",
    icon: Calculator,
    href: "/bourse/calculateur",
    gradient: "from-cyan-500 to-blue-600",
  },
];

function TransactionIcon({ tx, accountId }: { tx: VitaTransaction; accountId: string }) {
  if (tx.tx_type === "emission") {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/15">
        <Sparkles className="h-5 w-5 text-green-500" />
      </div>
    );
  }
  const isIncoming = tx.to_account_id === accountId;
  if (isIncoming) {
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

export default function BoursePage() {
  const { account, balance, transactions, emissions, loading, error, connected, setup, claim } =
    useVitaAccount();
  const [emissionAnimating, setEmissionAnimating] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [setupName, setSetupName] = useState("");

  const balanceNum = parseFloat(balance) || 0;
  const daysSinceJoin = account
    ? Math.floor((Date.now() - new Date(account.created_at).getTime()) / 86400000) + 1
    : 0;
  const emissionCount = emissions.length;

  // Check if today's emission was already claimed
  const todayStr = new Date().toISOString().slice(0, 10);
  const emittedToday = emissions.some((e) => e.emission_date === todayStr);

  useEffect(() => {
    if (emittedToday) {
      const timer = setTimeout(() => setEmissionAnimating(true), 500);
      return () => clearTimeout(timer);
    }
  }, [emittedToday]);

  const handleClaim = async () => {
    setClaiming(true);
    await claim();
    setClaiming(false);
  };

  const recentTxs = transactions.slice(0, 5);

  // --- Loading state ---
  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Bourse">
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-4" />
          <p className="text-sm text-[var(--text-muted)]">Chargement du portefeuille...</p>
        </div>
      </DashboardLayout>
    );
  }

  // --- No account / offline ---
  if (!account) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Bourse">
        <div className="mx-auto max-w-md py-12">
          <div className="text-center">
            {!connected ? (
              <>
                <WifiOff className="mx-auto mb-4 h-12 w-12 text-[var(--text-muted)]" />
                <h2 className="mb-2 text-xl font-bold text-[var(--text-primary)]">
                  Backend non disponible
                </h2>
                <p className="mb-6 text-sm text-[var(--text-muted)]">
                  Lancez le serveur Rust avec <code className="font-mono text-violet-500">cargo run</code> dans{" "}
                  <code className="font-mono text-violet-500">services/vita-core/</code>
                </p>
              </>
            ) : (
              <>
                <UserPlus className="mx-auto mb-4 h-12 w-12 text-violet-500" />
                <h2 className="mb-2 text-xl font-bold text-[var(--text-primary)]">
                  Bienvenue dans VITA
                </h2>
                <p className="mb-6 text-sm text-[var(--text-muted)]">
                  Créez votre compte pour recevoir 1 Ѵ par jour
                </p>
              </>
            )}

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {connected && (
              <Card className="text-left mb-4">
                <CardContent>
                  <label className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                    Votre nom (optionnel)
                  </label>
                  <input
                    type="text"
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                    placeholder="Ex: Marie Dupont"
                    className="mb-4 h-11 w-full rounded-xl border bg-[var(--bg-elevated)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    style={{ borderColor: "var(--border)" }}
                  />
                  <Button className="w-full" onClick={() => setup(setupName || undefined)}>
                    <UserPlus className="h-4 w-4" />
                    Créer mon compte VITA
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // --- Main dashboard ---
  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Bourse">
      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Header: Balance */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-[var(--text-muted)]">
              Solde actuel
            </p>
            <div className="flex items-baseline gap-3">
              <h1 className="text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
                {balanceNum.toFixed(3)}
              </h1>
              <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-3xl font-bold text-transparent">
                Ѵ
              </span>
            </div>
            {emittedToday ? (
              <div
                className={`mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-3 py-1 text-sm font-medium text-green-500 transition-all duration-700 ${
                  emissionAnimating
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                +1 Ѵ reçu aujourd&apos;hui
              </div>
            ) : account.verified ? (
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={handleClaim}
                disabled={claiming}
              >
                {claiming ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-green-500" />
                )}
                Réclamer +1 Ѵ
              </Button>
            ) : null}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-[var(--text-muted)]">Membre depuis</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">
                Jour {daysSinceJoin}
              </p>
            </div>
            <div className="h-10 w-px bg-[var(--border)]" />
            <div className="text-right">
              <p className="text-xs text-[var(--text-muted)]">Émissions</p>
              <p className="flex items-center gap-1 text-lg font-bold text-orange-500">
                <Flame className="h-4 w-4" />
                {emissionCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          variant="violet"
          label="Solde"
          value={`${balanceNum.toFixed(3)} Ѵ`}
        />
        <StatCard
          variant="green"
          label="Émissions totales"
          value={`${emissionCount} Ѵ`}
          trend={{ value: "+1/jour", direction: "up" }}
        />
        <StatCard
          variant="pink"
          label="Reçu total"
          value={`${parseFloat(account.total_received || "0").toFixed(3)} Ѵ`}
        />
        <StatCard
          variant="cyan"
          label="Vérifié"
          value={account.verified ? "Oui" : "Non"}
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
            return (
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
                const isIncoming =
                  tx.tx_type === "emission" || tx.to_account_id === account.id;
                const amount = parseFloat(tx.amount);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 px-4 py-3.5 md:px-5 transition-colors hover:bg-[var(--bg-card-hover)]"
                  >
                    <TransactionIcon tx={tx} accountId={account.id} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {tx.tx_type === "emission"
                          ? "Émission quotidienne"
                          : tx.note || (isIncoming ? "Paiement reçu" : "Paiement envoyé")}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatTxDate(tx.created_at)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-semibold ${
                          isIncoming ? "text-green-500" : "text-pink-500"
                        }`}
                      >
                        {isIncoming ? "+" : "-"}
                        {amount.toFixed(3)} Ѵ
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
