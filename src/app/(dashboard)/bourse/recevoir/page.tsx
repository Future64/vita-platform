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
  Link2,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_WALLET } from "@/lib/mockBourse";
import { useToast } from "@/components/ui/Toast";

const sidebarItems: SidebarItem[] = [
  { icon: Wallet, label: "Solde", href: "/bourse" },
  { icon: Send, label: "Payer", href: "/bourse/payer", permission: "send_vita" },
  { icon: QrCode, label: "Recevoir", href: "/bourse/recevoir", permission: "receive_vita" },
  { icon: Calculator, label: "Calculateur", href: "/bourse/calculateur" },
  { icon: Clock, label: "Historique", href: "/bourse/historique", permission: "view_transactions" },
  { icon: PiggyBank, label: "Épargne", href: "/bourse/epargne" },
  { icon: HandCoins, label: "Crédit", href: "/bourse/credit" },
];

const ACCOUNT_ID = "vita-42x7k9m2-demo";

export default function RecevoirPage() {
  const { toast } = useToast();
  const [requestedAmount, setRequestedAmount] = useState("");
  const [copied, setCopied] = useState<"id" | "link" | null>(null);

  const handleCopy = useCallback((text: string, type: "id" | "link") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.info("Copie !");
    setTimeout(() => setCopied(null), 2000);
  }, [toast]);

  const paymentLink = requestedAmount
    ? `vita://pay/${ACCOUNT_ID}?amount=${requestedAmount}`
    : `vita://pay/${ACCOUNT_ID}`;

  // Recent received transactions
  const receivedTxs = MOCK_WALLET.transactions
    .filter((tx) => tx.type === "reception")
    .slice(0, 5);

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
                <div className="mb-4 relative flex h-52 w-52 items-center justify-center rounded-2xl border-2 border-dashed border-violet-500/30 bg-[var(--bg-elevated)]">
                  <div className="text-center">
                    {/* Stylized QR placeholder */}
                    <div className="mx-auto mb-3 grid h-28 w-28 grid-cols-7 gap-0.5">
                      {Array.from({ length: 49 }).map((_, i) => {
                        const row = Math.floor(i / 7);
                        const col = i % 7;
                        // Create a QR-like pattern
                        const isCorner =
                          (row < 3 && col < 3) ||
                          (row < 3 && col > 3) ||
                          (row > 3 && col < 3);
                        const isRandom = Math.random() > 0.5;
                        const filled = isCorner || isRandom;
                        return (
                          <div
                            key={i}
                            className={`rounded-sm ${
                              filled
                                ? "bg-gradient-to-br from-violet-500 to-pink-500"
                                : "bg-[var(--bg-card)]"
                            }`}
                          />
                        );
                      })}
                    </div>
                    {requestedAmount && (
                      <p className="text-sm font-bold text-violet-500">
                        {parseFloat(requestedAmount).toFixed(2)} Ѵ
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
                      {ACCOUNT_ID}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(ACCOUNT_ID, "id")}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                    >
                      {copied === "id" ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Copy link */}
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
                  step={0.01}
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  placeholder="0.00"
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
                  receivedTxs.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-4 px-4 py-3.5 md:px-5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/15">
                        <Wallet className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {tx.contrepartie || "Anonyme"}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate">
                          {tx.motif || "Paiement reçu"}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-sm font-semibold text-green-500">
                        +{tx.montant.toFixed(2)} Ѵ
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
