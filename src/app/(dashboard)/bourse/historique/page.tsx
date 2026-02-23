"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
  Filter,
  Search,
  Download,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { MOCK_WALLET } from "@/lib/mockBourse";
import { useToast } from "@/components/ui/Toast";
import type { Transaction, TransactionType } from "@/types/bourse";

const sidebarItems: SidebarItem[] = [
  { icon: Wallet, label: "Solde", href: "/bourse" },
  { icon: Send, label: "Payer", href: "/bourse/payer", permission: "send_vita" },
  { icon: QrCode, label: "Recevoir", href: "/bourse/recevoir", permission: "receive_vita" },
  { icon: Calculator, label: "Calculateur", href: "/bourse/calculateur" },
  { icon: Clock, label: "Historique", href: "/bourse/historique", permission: "view_transactions" },
  { icon: PiggyBank, label: "Épargne", href: "/bourse/epargne" },
  { icon: HandCoins, label: "Crédit", href: "/bourse/credit" },
];

type FilterType = "all" | TransactionType;
type PeriodFilter = "1m" | "3m" | "6m" | "all";

const typeFilters: { key: FilterType; label: string }[] = [
  { key: "all", label: "Tout" },
  { key: "emission", label: "Émissions" },
  { key: "reception", label: "Reçus" },
  { key: "envoi", label: "Envoyés" },
];

const periodFilters: { key: PeriodFilter; label: string }[] = [
  { key: "1m", label: "Ce mois" },
  { key: "3m", label: "3 mois" },
  { key: "6m", label: "6 mois" },
  { key: "all", label: "Tout" },
];

const txConfig: Record<TransactionType, { icon: typeof Sparkles; label: string; color: string; sign: "+" | "-" }> = {
  emission: { icon: Sparkles, label: "Émission", color: "green", sign: "+" },
  reception: { icon: ArrowDownLeft, label: "Reçu", color: "violet", sign: "+" },
  envoi: { icon: ArrowUpRight, label: "Envoyé", color: "pink", sign: "-" },
};

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

function getPeriodStart(period: PeriodFilter): Date | null {
  if (period === "all") return null;
  const now = new Date();
  const months = period === "1m" ? 1 : period === "3m" ? 3 : 6;
  now.setMonth(now.getMonth() - months);
  return now;
}

// Map backend transaction to frontend type
function mapApiTransaction(apiTx: Record<string, unknown>): Transaction {
  const txType = String(apiTx.tx_type || apiTx.type || "");
  const fromId = apiTx.from_account_id || apiTx.from_id;

  let type: Transaction["type"] = "envoi";
  if (txType === "Emission" || txType === "emission") {
    type = "emission";
  } else if (!fromId) {
    type = "emission";
  } else {
    type = apiTx._direction === "in" ? "reception" : "envoi";
  }

  return {
    id: String(apiTx.id || ""),
    type,
    montant: Number(apiTx.amount || apiTx.net_amount || 0),
    date: String(apiTx.created_at || new Date().toISOString()),
    contrepartie: apiTx.counterpart_name ? String(apiTx.counterpart_name) : undefined,
    motif: apiTx.note ? String(apiTx.note) : undefined,
    statut: "confirmee",
  };
}

export default function HistoriquePage() {
  const { toast } = useToast();
  const { user, isMockMode } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_WALLET.transactions);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [search, setSearch] = useState("");

  // Fetch transactions from API
  useEffect(() => {
    async function fetchTransactions() {
      if (!user || isMockMode) {
        setTransactions(MOCK_WALLET.transactions);
        setIsLoading(false);
        return;
      }

      try {
        const txData = await api.getTransactions(user.id, 100, 0);
        if (Array.isArray(txData)) {
          setTransactions(txData.map((tx) => mapApiTransaction(tx as Record<string, unknown>)));
        }
      } catch {
        setTransactions(MOCK_WALLET.transactions);
      }
      setIsLoading(false);
    }

    fetchTransactions();
  }, [user, isMockMode]);

  const filteredTransactions = useMemo(() => {
    const periodStart = getPeriodStart(periodFilter);

    return transactions.filter((tx) => {
      if (filterType !== "all" && tx.type !== filterType) return false;
      if (periodStart && new Date(tx.date) < periodStart) return false;
      if (search) {
        const s = search.toLowerCase();
        const matchMotif = tx.motif?.toLowerCase().includes(s);
        const matchContrepartie = tx.contrepartie?.toLowerCase().includes(s);
        if (!matchMotif && !matchContrepartie) return false;
      }
      return true;
    });
  }, [transactions, filterType, periodFilter, search]);

  // Financial summary
  const summary = useMemo(() => {
    const recu = filteredTransactions
      .filter((tx) => tx.type === "reception")
      .reduce((sum, tx) => sum + tx.montant, 0);
    const envoye = filteredTransactions
      .filter((tx) => tx.type === "envoi")
      .reduce((sum, tx) => sum + tx.montant, 0);
    const emissions = filteredTransactions
      .filter((tx) => tx.type === "emission")
      .reduce((sum, tx) => sum + tx.montant, 0);
    return { recu, envoye, emissions, soldeNet: recu + emissions - envoye };
  }, [filteredTransactions]);

  const handleExportCSV = useCallback(() => {
    const headers = ["Date", "Type", "Montant", "Contrepartie", "Motif", "Statut"];
    const rows = filteredTransactions.map((tx) => [
      new Date(tx.date).toISOString(),
      tx.type,
      tx.montant.toFixed(3),
      tx.contrepartie || "",
      tx.motif || "",
      tx.statut,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vita-historique-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Historique exporte");
  }, [filteredTransactions, toast]);

  if (isLoading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Bourse">
        <div className="flex h-64 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Bourse">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Historique
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExportCSV}>
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Exporter CSV</span>
        </Button>
      </div>

      {/* Financial Summary */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <p className="text-xs text-[var(--text-muted)]">Émissions</p>
          <p className="mt-1 text-lg font-bold text-green-500">+{summary.emissions.toFixed(2)} Ѵ</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <p className="text-xs text-[var(--text-muted)]">Reçu</p>
          <p className="mt-1 text-lg font-bold text-violet-500">+{summary.recu.toFixed(2)} Ѵ</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <p className="text-xs text-[var(--text-muted)]">Envoyé</p>
          <p className="mt-1 text-lg font-bold text-pink-500">-{summary.envoye.toFixed(2)} Ѵ</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--text-muted)]">Solde net</p>
            {summary.soldeNet >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-pink-500" />
            )}
          </div>
          <p className={cn("mt-1 text-lg font-bold", summary.soldeNet >= 0 ? "text-green-500" : "text-pink-500")}>
            {summary.soldeNet >= 0 ? "+" : ""}{summary.soldeNet.toFixed(2)} Ѵ
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Type filters */}
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

          {/* Search */}
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

        {/* Period filters */}
        <div className="flex gap-2">
          {periodFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setPeriodFilter(f.key)}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-medium transition-all",
                periodFilter === f.key
                  ? "bg-violet-500/15 text-violet-500"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction list — desktop table */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Description</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Contrepartie</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <Filter className="mx-auto mb-3 h-10 w-10 text-[var(--text-muted)]" />
                      <p className="text-sm text-[var(--text-muted)]">Aucune transaction trouvée</p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const config = txConfig[tx.type];
                    const Icon = config.icon;
                    const isIncoming = tx.type === "emission" || tx.type === "reception";
                    return (
                      <tr key={tx.id} className="transition-colors hover:bg-[var(--bg-card-hover)]">
                        <td className="whitespace-nowrap px-5 py-3.5 text-sm text-[var(--text-secondary)]">
                          {formatFullDate(tx.date)}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", `bg-${config.color}-500/15`)}>
                              <Icon className={cn("h-3.5 w-3.5", `text-${config.color}-500`)} />
                            </div>
                            <Badge variant={config.color as "green" | "violet" | "pink"}>
                              {config.label}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[var(--text-primary)]">
                          {tx.type === "emission"
                            ? "Émission quotidienne"
                            : tx.motif || (isIncoming ? "Paiement reçu" : "Paiement envoyé")}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[var(--text-secondary)]">
                          {tx.contrepartie || "—"}
                        </td>
                        <td className={cn("whitespace-nowrap px-5 py-3.5 text-right font-mono text-sm font-semibold", config.sign === "+" ? "text-green-500" : "text-pink-500")}>
                          {config.sign}{tx.montant.toFixed(2)} Ѵ
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Transaction list — mobile cards */}
      <div className="md:hidden">
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-[var(--border)]">
              {filteredTransactions.length === 0 ? (
                <div className="py-12 text-center">
                  <Filter className="mx-auto mb-3 h-10 w-10 text-[var(--text-muted)]" />
                  <p className="text-sm text-[var(--text-muted)]">Aucune transaction trouvée</p>
                </div>
              ) : (
                filteredTransactions.map((tx) => {
                  const config = txConfig[tx.type];
                  const Icon = config.icon;
                  const isIncoming = tx.type === "emission" || tx.type === "reception";
                  return (
                    <div
                      key={tx.id}
                      className="flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--bg-card-hover)]"
                    >
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", `bg-${config.color}-500/15`)}>
                        <Icon className={cn("h-5 w-5", `text-${config.color}-500`)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {tx.type === "emission"
                            ? "Émission quotidienne"
                            : tx.motif || (isIncoming ? "Paiement reçu" : "Paiement envoyé")}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          {tx.contrepartie ? `${tx.contrepartie} · ` : ""}
                          {formatFullDate(tx.date)}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 font-mono text-sm font-semibold",
                          config.sign === "+" ? "text-green-500" : "text-pink-500"
                        )}
                      >
                        {config.sign}{tx.montant.toFixed(2)} Ѵ
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
