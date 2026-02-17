"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  Send,
  QrCode,
  Calculator,
  Clock,
  PiggyBank,
  HandCoins,
  User,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Landmark,
  Loader2,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { cn } from "@/lib/utils";
import { useVitaAccount } from "@/hooks/useVitaAccount";
import { transfer, ApiError } from "@/lib/vita-api";
import type { TransferResult } from "@/types/vita";

const sidebarItems: SidebarItem[] = [
  { icon: Wallet, label: "Solde", href: "/bourse" },
  { icon: Send, label: "Payer", href: "/bourse/payer" },
  { icon: QrCode, label: "Recevoir", href: "/bourse/recevoir" },
  { icon: Calculator, label: "Calculateur", href: "/bourse/calculateur" },
  { icon: Clock, label: "Historique", href: "/bourse/historique" },
  { icon: PiggyBank, label: "Épargne", href: "/bourse/epargne" },
  { icon: HandCoins, label: "Crédit", href: "/bourse/credit" },
];

const COMMON_POT_RATE = 0.02; // 2% — matches backend

function PayerPageContent() {
  const searchParams = useSearchParams();
  const { account, balance, refresh } = useVitaAccount();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [result, setResult] = useState<TransferResult | null>(null);

  const balanceNum = parseFloat(balance) || 0;

  useEffect(() => {
    const paramAmount = searchParams.get("amount");
    if (paramAmount) {
      setAmount(paramAmount);
    }
  }, [searchParams]);

  const amountNum = parseFloat(amount) || 0;
  const potContribution = amountNum * COMMON_POT_RATE;
  const netAmount = amountNum - potContribution;
  const isValid = recipient.trim().length > 0 && amountNum > 0 && amountNum <= balanceNum;

  const handleConfirm = useCallback(async () => {
    if (!account) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await transfer(account.id, recipient.trim(), amount, note || undefined);
      setResult(res);
      await refresh();
      setStep("success");
    } catch (err) {
      if (err instanceof ApiError) {
        setSendError(err.message);
      } else {
        setSendError("Erreur de connexion au serveur");
      }
      setStep("form");
    } finally {
      setSending(false);
    }
  }, [account, recipient, amount, note, refresh]);

  const handleReset = useCallback(() => {
    setRecipient("");
    setAmount("");
    setNote("");
    setResult(null);
    setSendError(null);
    setStep("form");
  }, []);

  const potLabel = `${(COMMON_POT_RATE * 100).toFixed(0)}%`;

  // --- Success screen ---
  if (step === "success" && result) {
    const resAmount = parseFloat(result.amount);
    const resNet = parseFloat(result.net_amount);
    const resPot = parseFloat(result.common_fund_contribution);
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Bourse">
        <div className="mx-auto max-w-lg py-12">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">
              Paiement envoyé
            </h1>
            <p className="mb-1 text-sm text-[var(--text-secondary)]">
              {resNet.toFixed(3)} Ѵ envoyés à {recipient}
            </p>
            <p className="mb-8 text-xs text-[var(--text-muted)]">
              + {resPot.toFixed(3)} Ѵ au pot commun
            </p>

            <Card className="mb-6 text-left">
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Destinataire</span>
                    <span className="font-medium text-[var(--text-primary)]">{recipient}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Montant brut</span>
                    <span className="font-mono font-semibold text-[var(--text-primary)]">{resAmount.toFixed(3)} Ѵ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Pot commun ({potLabel})</span>
                    <span className="font-mono text-cyan-500">-{resPot.toFixed(3)} Ѵ</span>
                  </div>
                  <div className="border-t border-[var(--border)] pt-3 flex justify-between">
                    <span className="font-semibold text-[var(--text-primary)]">Net reçu</span>
                    <span className="font-mono font-bold text-green-500">{resNet.toFixed(3)} Ѵ</span>
                  </div>
                  {note && (
                    <div className="border-t border-[var(--border)] pt-3">
                      <span className="text-[var(--text-muted)]">Note : </span>
                      <span className="text-[var(--text-secondary)]">{note}</span>
                    </div>
                  )}
                  <div className="border-t border-[var(--border)] pt-3 flex justify-between">
                    <span className="text-[var(--text-secondary)]">Nouveau solde</span>
                    <span className="font-mono font-semibold text-[var(--text-primary)]">
                      {parseFloat(result.new_sender_balance).toFixed(3)} Ѵ
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={handleReset}>
                Nouveau paiement
              </Button>
              <Link href="/bourse" className="flex-1">
                <Button variant="primary" className="w-full">
                  Retour au solde
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // --- Confirm screen ---
  if (step === "confirm") {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Bourse">
        <div className="mx-auto max-w-lg">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <Send className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                Confirmer le paiement
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                Vérifiez les détails avant d&apos;envoyer
              </p>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl bg-[var(--bg-elevated)] p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/15">
                    <User className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">Destinataire</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{recipient}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Montant brut</span>
                    <span className="font-mono font-semibold text-[var(--text-primary)]">
                      {amountNum.toFixed(3)} Ѵ
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                      <Landmark className="h-3.5 w-3.5 text-cyan-500" />
                      Contribution pot commun ({potLabel})
                    </span>
                    <span className="font-mono text-cyan-500">
                      -{potContribution.toFixed(3)} Ѵ
                    </span>
                  </div>
                  <div className="border-t border-[var(--border)] pt-3 flex justify-between">
                    <span className="font-semibold text-[var(--text-primary)]">
                      Montant net reçu par le destinataire
                    </span>
                    <span className="font-mono font-bold text-green-500">
                      {netAmount.toFixed(3)} Ѵ
                    </span>
                  </div>
                </div>

                {note && (
                  <div className="rounded-lg bg-[var(--bg-elevated)] p-3">
                    <p className="text-xs text-[var(--text-muted)] mb-1">Note</p>
                    <p className="text-sm text-[var(--text-secondary)]">{note}</p>
                  </div>
                )}

                <div className="rounded-lg border border-[var(--border)] p-3 text-center">
                  <p className="text-xs text-[var(--text-muted)]">Solde après transaction</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">
                    {(balanceNum - amountNum).toFixed(3)} Ѵ
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setStep("form")}>
              Modifier
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirm}
              disabled={sending}
            >
              {sending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi...
                </span>
              ) : (
                <>
                  Confirmer le paiement
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // --- Form screen ---
  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Bourse">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Send className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Envoyer des Ѵ
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Payer un service ou transférer à un autre utilisateur
            </p>
          </div>
        </div>

        {sendError && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {sendError}
          </div>
        )}

        <div className="space-y-5">
          {/* Recipient */}
          <Card>
            <CardContent>
              <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-violet-500" />
                  Destinataire (ID du compte)
                </div>
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="UUID du compte destinataire"
                className="h-11 w-full rounded-xl border bg-[var(--bg-elevated)] px-4 text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                style={{ borderColor: "var(--border)" }}
              />
            </CardContent>
          </Card>

          {/* Amount */}
          <Card>
            <CardContent>
              <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-green-500" />
                    Montant
                  </div>
                  <span className="text-xs font-normal text-[var(--text-muted)]">
                    Disponible : {balanceNum.toFixed(3)} Ѵ
                  </span>
                </div>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={0.001}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.000"
                  className="h-14 w-full rounded-xl border bg-[var(--bg-elevated)] px-4 pr-12 text-2xl font-bold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  style={{ borderColor: "var(--border)" }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-lg font-bold text-transparent">
                  Ѵ
                </span>
              </div>

              {amountNum > balanceNum && (
                <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  Solde insuffisant
                </p>
              )}

              {amountNum > 0 && amountNum <= balanceNum && (
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Contribution pot commun ({potLabel})</span>
                    <span className="text-cyan-500">-{potContribution.toFixed(3)} Ѵ</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Le destinataire recevra</span>
                    <span className="font-semibold text-green-500">{netAmount.toFixed(3)} Ѵ</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Note */}
          <Card>
            <CardContent>
              <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-pink-500" />
                  Note
                  <span className="text-xs font-normal text-[var(--text-muted)]">(optionnel)</span>
                </div>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Message au destinataire..."
                rows={3}
                className="w-full resize-none rounded-xl border bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                style={{ borderColor: "var(--border)" }}
              />
            </CardContent>
          </Card>

          <PermissionGate permission="send_vita">
            <Button
              className="w-full h-12 text-base"
              disabled={!isValid}
              onClick={() => setStep("confirm")}
            >
              Continuer
              <ArrowRight className="h-5 w-5" />
            </Button>
          </PermissionGate>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function PayerPage() {
  return (
    <Suspense>
      <PayerPageContent />
    </Suspense>
  );
}
