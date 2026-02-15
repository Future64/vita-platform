"use client";

import { useState, useCallback } from "react";
import {
  Wallet,
  Send,
  QrCode,
  Calculator,
  Clock,
  PiggyBank,
  HandCoins,
  Copy,
  Check,
  ArrowDownLeft,
  Link2,
  Loader2,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

function formatTxDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) {
    return `Aujourd'hui, ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  }
  if (diffDays === 1) return "Hier";
  return `Il y a ${diffDays}j`;
}

export default function RecevoirPage() {
  const { account, transactions, loading } = useVitaAccount();
  const [requestedAmount, setRequestedAmount] = useState("");
  const [copied, setCopied] = useState<"id" | "link" | null>(null);

  const handleCopy = useCallback((text: string, type: "id" | "link") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const accountId = account?.id ?? "";
  const displayName = account?.display_name ?? "";

  const paymentLink = requestedAmount
    ? `vita://pay/${accountId}?amount=${requestedAmount}`
    : `vita://pay/${accountId}`;

  // Filter received transactions
  const receivedTxs = transactions.filter(
    (tx) => tx.tx_type !== "emission" && tx.to_account_id === accountId
  ).slice(0, 5);

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Bourse">
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-4" />
          <p className="text-sm text-[var(--text-muted)]">Chargement...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Bourse">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600">
            <QrCode className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Recevoir des Ѵ
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Partagez votre QR code ou votre identifiant
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* QR Code */}
          <Card>
            <CardContent>
              <div className="flex flex-col items-center py-4">
                {/* QR placeholder */}
                <div className="mb-4 flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--bg-elevated)]">
                  <div className="text-center">
                    <QrCode className="mx-auto mb-2 h-16 w-16 text-[var(--text-muted)]" />
                    <p className="text-xs text-[var(--text-muted)]">QR Code</p>
                    {requestedAmount && (
                      <p className="mt-1 text-sm font-bold text-violet-500">
                        {parseFloat(requestedAmount).toFixed(3)} Ѵ
                      </p>
                    )}
                  </div>
                </div>

                {/* Account ID */}
                <div className="mb-4 w-full">
                  <p className="mb-1 text-center text-xs text-[var(--text-muted)]">
                    Votre identifiant
                  </p>
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-[var(--bg-elevated)] px-4 py-2.5">
                    <span className="font-mono text-sm font-semibold text-[var(--text-primary)] truncate">
                      {accountId || "—"}
                    </span>
                    {accountId && (
                      <button
                        type="button"
                        onClick={() => handleCopy(accountId, "id")}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                      >
                        {copied === "id" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                  {displayName && (
                    <p className="mt-1 text-center text-xs text-[var(--text-muted)]">
                      {displayName}
                    </p>
                  )}
                </div>

                {/* Copy link */}
                {accountId && (
                  <Button
                    variant="secondary"
                    onClick={() => handleCopy(paymentLink, "link")}
                    className="w-full"
                  >
                    {copied === "link" ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        Lien copié !
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4" />
                        Copier le lien de paiement
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Requested amount */}
          <Card>
            <CardHeader>
              <CardTitle>Montant demandé</CardTitle>
              <Badge variant="outline">Optionnel</Badge>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-xs text-[var(--text-muted)]">
                Pré-remplissez le montant pour que le payeur n&apos;ait pas à le saisir
              </p>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={0.001}
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  placeholder="0.000"
                  className="h-11 w-full rounded-xl border bg-[var(--bg-elevated)] px-4 pr-10 text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  style={{ borderColor: "var(--border)" }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-muted)]">
                  Ѵ
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Recent received */}
          <Card>
            <CardHeader>
              <CardTitle>Derniers paiements reçus</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--border)]">
                {receivedTxs.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-[var(--text-muted)]">
                      Aucun paiement reçu pour le moment
                    </p>
                  </div>
                ) : (
                  receivedTxs.map((tx) => {
                    const amount = parseFloat(tx.net_amount);
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-4 px-4 py-3.5 md:px-5"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/15">
                          <ArrowDownLeft className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {tx.from_account_id
                              ? tx.from_account_id.slice(0, 8) + "..."
                              : "Inconnu"}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] truncate">
                            {tx.note ? `${tx.note} · ` : ""}{formatTxDate(tx.created_at)}
                          </p>
                        </div>
                        <span className="shrink-0 font-mono text-sm font-semibold text-green-500">
                          +{amount.toFixed(3)} Ѵ
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
