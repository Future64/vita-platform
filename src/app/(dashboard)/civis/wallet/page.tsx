"use client";

import {
  User,
  Wallet,
  Award,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
  TrendingUp,
  Coins
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { formatNumber } from "@/lib/format";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const sidebarItems: SidebarItem[] = [
  { icon: User, label: "Profil", href: "/civis" },
  { icon: Wallet, label: "Portefeuille", href: "/civis/wallet" },
  { icon: Activity, label: "Activité", href: "/civis/activity" },
  { icon: Award, label: "Récompenses", href: "/civis/achievements" },
];

const walletData = {
  balance: 2847,
  earned: {
    total: 3254,
    thisMonth: 420,
    lastMonth: 385,
  },
  spent: {
    total: 407,
    thisMonth: 73,
    lastMonth: 89,
  },
  pending: 125,
  breakdown: {
    basicIncome: 1000,
    ecoBonus: 250,
    contributions: 150,
    governance: 20,
  },
};

const transactions = [
  {
    id: "tx-1",
    type: "income",
    amount: 50,
    description: "Contribution exceptionnelle - Constitution v3",
    category: "contribution",
    date: "2024-01-28 14:32",
  },
  {
    id: "tx-2",
    type: "income",
    amount: 20,
    description: "Participation au vote - Réforme écologique",
    category: "governance",
    date: "2024-01-27 09:15",
  },
  {
    id: "tx-3",
    type: "expense",
    amount: -15,
    description: "Achat produits bio - Marché local",
    category: "shopping",
    date: "2024-01-26 18:45",
  },
  {
    id: "tx-4",
    type: "income",
    amount: 100,
    description: "Bonus écologique mensuel",
    category: "eco",
    date: "2024-01-25 00:01",
  },
  {
    id: "tx-5",
    type: "income",
    amount: 1000,
    description: "Revenu de base mensuel",
    category: "basic",
    date: "2024-01-25 00:00",
  },
  {
    id: "tx-6",
    type: "expense",
    amount: -30,
    description: "Transport collectif - Pass mensuel",
    category: "transport",
    date: "2024-01-24 10:20",
  },
  {
    id: "tx-7",
    type: "income",
    amount: 25,
    description: "Code review - Projet Eco Tracker",
    category: "contribution",
    date: "2024-01-23 16:50",
  },
];

const pendingTransactions = [
  {
    id: "pending-1",
    amount: 75,
    description: "Merge Request approuvée - En attente de validation",
    estimatedDate: "2024-01-30",
  },
  {
    id: "pending-2",
    amount: 50,
    description: "Bonus écologique - En cours de calcul",
    estimatedDate: "2024-02-01",
  },
];

const categoryIcons: Record<string, any> = {
  contribution: Award,
  governance: Activity,
  eco: TrendingUp,
  basic: Coins,
  shopping: ArrowDownRight,
  transport: ArrowDownRight,
};

const categoryColors: Record<string, string> = {
  contribution: "text-violet-500",
  governance: "text-cyan-500",
  eco: "text-green-500",
  basic: "text-orange-500",
  shopping: "text-pink-500",
  transport: "text-blue-500",
};

export default function WalletPage() {
  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Civis">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Mon Portefeuille
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Gérez vos Ѵ et suivez vos transactions
          </p>
        </div>
        <Button variant="secondary">
          <Download className="h-4 w-4" />
          Exporter l'historique
        </Button>
      </div>

      {/* Balance Card */}
      <Card className="mb-6 card-inverted">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm card-inverted-title opacity-80 mb-1">Solde total</div>
              <div className="text-4xl font-bold card-inverted-title">
                {formatNumber(walletData.balance)} Ѵ
              </div>
            </div>
            <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <Wallet className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div>
              <div className="text-xs card-inverted-title opacity-70 mb-1">Ce mois</div>
              <div className="text-lg font-bold text-green-400">
                +{walletData.earned.thisMonth} Ѵ
              </div>
            </div>
            <div>
              <div className="text-xs card-inverted-title opacity-70 mb-1">Dépensé</div>
              <div className="text-lg font-bold text-pink-400">
                -{walletData.spent.thisMonth} Ѵ
              </div>
            </div>
            <div>
              <div className="text-xs card-inverted-title opacity-70 mb-1">En attente</div>
              <div className="text-lg font-bold text-orange-400">
                {walletData.pending} Ѵ
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          variant="orange"
          label="Revenu de base"
          value={`${walletData.breakdown.basicIncome} Ѵ`}
        />
        <StatCard
          variant="green"
          label="Bonus écologiques"
          value={`${walletData.breakdown.ecoBonus} Ѵ`}
          trend={{ value: "+12%", direction: "up" }}
        />
        <StatCard
          variant="violet"
          label="Contributions"
          value={`${walletData.breakdown.contributions} Ѵ`}
          trend={{ value: "+8%", direction: "up" }}
        />
        <StatCard
          variant="cyan"
          label="Gouvernance"
          value={`${walletData.breakdown.governance} Ѵ`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main Content - Transactions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Toutes</TabsTrigger>
                  <TabsTrigger value="income">Revenus</TabsTrigger>
                  <TabsTrigger value="expense">Dépenses</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-2">
                  {transactions.map((tx) => {
                    const Icon = categoryIcons[tx.category] || Coins;
                    const colorClass = categoryColors[tx.category] || "text-[var(--text-muted)]";

                    return (
                      <div
                        key={tx.id}
                        className="p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`h-10 w-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center ${colorClass}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-sm text-[var(--text-primary)] mb-1">
                                {tx.description}
                              </div>
                              <div className="text-xs text-[var(--text-muted)]">
                                {tx.date}
                              </div>
                            </div>
                          </div>
                          <div className={`text-lg font-bold ${tx.type === 'income' ? 'text-green-500' : 'text-pink-500'}`}>
                            {tx.type === 'income' ? '+' : ''}{tx.amount} Ѵ
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="income" className="space-y-2">
                  {transactions.filter(tx => tx.type === 'income').map((tx) => {
                    const Icon = categoryIcons[tx.category] || Coins;
                    const colorClass = categoryColors[tx.category] || "text-[var(--text-muted)]";

                    return (
                      <div
                        key={tx.id}
                        className="p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`h-10 w-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center ${colorClass}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-sm text-[var(--text-primary)] mb-1">
                                {tx.description}
                              </div>
                              <div className="text-xs text-[var(--text-muted)]">
                                {tx.date}
                              </div>
                            </div>
                          </div>
                          <div className="text-lg font-bold text-green-500">
                            +{tx.amount} Ѵ
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="expense" className="space-y-2">
                  {transactions.filter(tx => tx.type === 'expense').map((tx) => {
                    const Icon = categoryIcons[tx.category] || Coins;
                    const colorClass = categoryColors[tx.category] || "text-[var(--text-muted)]";

                    return (
                      <div
                        key={tx.id}
                        className="p-3 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`h-10 w-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center ${colorClass}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-sm text-[var(--text-primary)] mb-1">
                                {tx.description}
                              </div>
                              <div className="text-xs text-[var(--text-muted)]">
                                {tx.date}
                              </div>
                            </div>
                          </div>
                          <div className="text-lg font-bold text-pink-500">
                            {tx.amount} Ѵ
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Pending Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Transactions en attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-lg border border-[var(--border)] bg-orange-500/5"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">
                        +{tx.amount} Ѵ
                      </div>
                      <Badge variant="orange" className="text-xs">En attente</Badge>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mb-2">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <Calendar className="h-3 w-3" />
                      Estimé: {tx.estimatedDate}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé mensuel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    Revenus
                  </div>
                  <div className="font-semibold text-green-500">
                    +{walletData.earned.thisMonth} Ѵ
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <ArrowDownRight className="h-4 w-4 text-pink-500" />
                    Dépenses
                  </div>
                  <div className="font-semibold text-pink-500">
                    -{walletData.spent.thisMonth} Ѵ
                  </div>
                </div>
                <div className="pt-3 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Solde net</span>
                    <div className="font-semibold text-lg text-[var(--text-primary)]">
                      +{walletData.earned.thisMonth - walletData.spent.thisMonth} Ѵ
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-[var(--text-muted)] mb-1">Prochain revenu de base</div>
                  <div className="font-semibold text-[var(--text-primary)]">1 Février 2024</div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)] mb-1">Calcul bonus écologiques</div>
                  <div className="font-semibold text-[var(--text-primary)]">En cours...</div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)] mb-1">Total gagné (all-time)</div>
                  <div className="font-semibold text-green-500">
                    {formatNumber(walletData.earned.total)} Ѵ
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
