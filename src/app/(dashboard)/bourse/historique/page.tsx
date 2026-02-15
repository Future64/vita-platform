"use client";

import { useState, useMemo } from "react";
import {
  Wallet,
  Send,
  QrCode,
  Calculator,
  Clock,
  PiggyBank,
  HandCoins,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Landmark,
  Filter,
  Search,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useVitaAccount } from "@/hooks/useVitaAccount";
import type { VitaTransaction, TransactionType } from "@/types/vita";

const sidebarItems: SidebarItem[] = [
  { icon: Wallet, label: "Solde", href: "/bourse" },
  { icon: Send, label: "Payer", href: "/bourse/payer" },
  { icon: QrCode, label: "Recevoir", href: "/bourse/recevoir" },
  { icon: Calculator, label: "Calculateur", href: "/bourse/calculateur" },
  { icon: Clock, label: "Historique", href: "/bourse/historique" },
  { icon: PiggyBank, label: "Épargne", href: "/bourse/epargne" },
  { icon: HandCoins, label: "Crédit", href: "/bourse/credit" },
];

// --- Display helpers ---

type DisplayType = "emission" | "sent" | "received" | "common_fund";

const txConfig: Record<DisplayType, { icon: typeof Sparkles; label: string; color: string; sign: "+" | "-" }> = {
  emission: { icon: Sparkles, label: "Émission", color: "green", sign: "+" },
  received: { icon: ArrowDownLeft, label: "Reçu", color: "green", sign: "+" },
  sent: { icon: ArrowUpRight, label: "Envoyé", color: "pink", sign: "-" },
  common_fund: { icon: Landmark, label: "Pot commun", color: "cyan", sign: "-" },
};

function getDisplayType(tx: VitaTransaction, accountId: string): DisplayType {
  if (tx.tx_type === "emission") return "emission";
  if (tx.tx_type === "common_fund") return "common_fund";
  if (tx.to_account_id === accountId) return "received";
  return "sent";
}

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const months = ["jan", "fév", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${month}. ${year}, ${hours}:${mins}`;
}

type FilterType = "all" | DisplayType;

// --- Balance chart from transactions ---

function buildBalanceHistory(
  transactions: VitaTransaction[],
  accountId: string,
  currentBalance: number
): { date: string; solde: number }[] {
  // Walk backward through transactions to reconstruct daily balances
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const dailyMap = new Map<string, number>();
  let runningBalance = currentBalance;
  const today = new Date().toISOString().slice(0, 10);
  dailyMap.set(today, runningBalance);

  for (const tx of sorted) {
    const dateKey = tx.created_at.slice(0, 10);
    const amount = parseFloat(tx.amount);
    const display = getDisplayType(tx, accountId);

    // Reverse the transaction to get prior balance
    if (display === "emission" || display === "received") {
      runningBalance -= amount;
    } else {
      runningBalance += amount;
    }

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, runningBalance);
    }
  }

  const entries = Array.from(dailyMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([date, solde]) => {
    const d = new Date(date);
    const day = d.getDate();
    const months = ["jan", "fév", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];
    return { date: `${day} ${months[d.getMonth()]}`, solde: Math.max(0, solde) };
  });
}

// --- Page ---

export default function HistoriquePage() {
  const { account, balance, transactions, loading } = useVitaAccount();
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const accountId = account?.id ?? "";
  const balanceNum = parseFloat(balance) || 0;

  const balanceHistory = useMemo(
    () => buildBalanceHistory(transactions, accountId, balanceNum),
    [transactions, accountId, balanceNum]
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterType !== "all") {
        const display = getDisplayType(tx, accountId);
        if (display !== filterType) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        const matchNote = tx.note?.toLowerCase().includes(s);
        const matchFrom = tx.from_account_id?.toLowerCase().includes(s);
        const matchTo = tx.to_account_id?.toLowerCase().includes(s);
        if (!matchNote && !matchFrom && !matchTo) return false;
      }
      return true;
    });
  }, [transactions, filterType, search, accountId]);

  const typeFilters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Tout" },
    { key: "emission", label: "Émissions" },
    { key: "received", label: "Reçus" },
    { key: "sent", label: "Envoyés" },
    { key: "common_fund", label: "Pot commun" },
  ];

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Bourse">
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-4" />
          <p className="text-sm text-[var(--text-muted)]">Chargement de l&apos;historique...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Bourse">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500">
          <Clock className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Historique
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            Toutes vos transactions VITA
          </p>
        </div>
      </div>

      {/* Balance chart */}
      {balanceHistory.length > 1 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Évolution du solde</CardTitle>
            <Badge variant="violet">{balanceHistory.length} jours</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={balanceHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="soldeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--text-muted)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    domain={["dataMin - 1", "dataMax + 1"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.75rem",
                      fontSize: "0.875rem",
                    }}
                    labelStyle={{ color: "var(--text-muted)" }}
                    formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(3)} Ѵ`, "Solde"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="solde"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#soldeGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilterType(f.key)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                filterType === f.key
                  ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white"
                  : "border border-[var(--border)] text-[var(--text-secondary)] hover:border-violet-500/50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="h-9 w-full rounded-lg border bg-[var(--bg-elevated)] pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 sm:w-56"
            style={{ borderColor: "var(--border)" }}
          />
        </div>
      </div>

      {/* Transaction list */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-[var(--border)]">
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center">
                <Filter className="mx-auto mb-3 h-10 w-10 text-[var(--text-muted)]" />
                <p className="text-sm text-[var(--text-muted)]">
                  Aucune transaction trouvée
                </p>
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const display = getDisplayType(tx, accountId);
                const config = txConfig[display];
                const Icon = config.icon;
                const amount = parseFloat(tx.amount);
                return (
                  <div
                    key={tx.id}
                    className="flex items-start gap-4 px-4 py-3.5 md:px-5 transition-colors hover:bg-[var(--bg-card-hover)]"
                  >
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", `bg-${config.color}-500/15`)}>
                      <Icon className={cn("h-5 w-5", `text-${config.color}-500`)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {tx.tx_type === "emission"
                            ? "Émission quotidienne"
                            : tx.note || (display === "received" ? "Paiement reçu" : display === "sent" ? "Paiement envoyé" : "Contribution pot commun")}
                        </p>
                        <Badge variant={config.color as "green" | "pink" | "cyan"} className="shrink-0">
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {tx.from_account_id && display === "received" && (
                          <span>de {tx.from_account_id.slice(0, 8)}... · </span>
                        )}
                        {tx.to_account_id && display === "sent" && (
                          <span>à {tx.to_account_id.slice(0, 8)}... · </span>
                        )}
                        {formatFullDate(tx.created_at)}
                      </p>
                      {tx.note && tx.tx_type !== "emission" && (
                        <p className="mt-1 text-xs text-[var(--text-secondary)] italic">
                          &ldquo;{tx.note}&rdquo;
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        "shrink-0 font-mono text-sm font-semibold",
                        config.sign === "+" ? "text-green-500" : "text-pink-500"
                      )}
                    >
                      {config.sign}{amount.toFixed(3)} Ѵ
                    </span>
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
