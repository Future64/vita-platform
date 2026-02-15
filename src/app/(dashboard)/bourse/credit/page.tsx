"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Send,
  QrCode,
  Calculator,
  Clock,
  PiggyBank,
  HandCoins,
  Info,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useVitaAccount } from "@/hooks/useVitaAccount";
import {
  getCreditEligibility,
  requestCredit,
  getCreditLoans,
} from "@/lib/vita-api";
import type { CreditEligibility, CreditLoan } from "@/types/vita";

const sidebarItems: SidebarItem[] = [
  { icon: Wallet, label: "Solde", href: "/bourse" },
  { icon: Send, label: "Payer", href: "/bourse/payer" },
  { icon: QrCode, label: "Recevoir", href: "/bourse/recevoir" },
  { icon: Calculator, label: "Calculateur", href: "/bourse/calculateur" },
  { icon: Clock, label: "Historique", href: "/bourse/historique" },
  { icon: PiggyBank, label: "Épargne", href: "/bourse/epargne" },
  { icon: HandCoins, label: "Crédit", href: "/bourse/credit" },
];

export default function CreditPage() {
  const { account, loading: accountLoading } = useVitaAccount();

  const [eligibility, setEligibility] = useState<CreditEligibility | null>(null);
  const [loans, setLoans] = useState<CreditLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [requestAmount, setRequestAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [newLoan, setNewLoan] = useState<CreditLoan | null>(null);

  async function fetchData() {
    if (!account) return;
    setLoading(true);
    setError(null);
    try {
      const [elig, loanList] = await Promise.all([
        getCreditEligibility(account.id),
        getCreditLoans(account.id),
      ]);
      setEligibility(elig);
      setLoans(loanList);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (account) fetchData();
  }, [account]);

  async function handleRequestCredit() {
    if (!account || !requestAmount) return;
    setSubmitting(true);
    setError(null);
    try {
      const loan = await requestCredit(account.id, requestAmount);
      setNewLoan(loan);
      setStep("success");
      fetchData(); // refresh
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la demande");
    } finally {
      setSubmitting(false);
    }
  }

  const activeLoan = loans.find((l) => l.status === "active");
  const pastLoans = loans.filter((l) => l.status !== "active");

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Bourse">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-pink-500">
            <HandCoins className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Crédit mutualisé
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Empruntez à taux zéro, garanti par le pot commun
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={fetchData} disabled={loading}>
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* Info banner */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-violet-500" />
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Le crédit VITA est à taux zéro
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Le remboursement est automatique via vos émissions quotidiennes (25% de votre
            1 Ѵ/jour, soit 0.25 Ѵ/jour). Le crédit est un service collectif financé
            par le pot commun, pas un business.
          </p>
        </div>
      </div>

      {/* Loading state */}
      {(accountLoading || loading) && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!accountLoading && !loading && account && eligibility && (
        <>
          {/* Eligibility card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Votre éligibilité</CardTitle>
              {eligibility.eligible ? (
                <Badge variant="green">
                  <CheckCircle2 className="h-3 w-3" />
                  Éligible
                </Badge>
              ) : (
                <Badge variant="red">
                  <XCircle className="h-3 w-3" />
                  Non éligible
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">Montant maximum</p>
                  <p className="text-xl font-bold text-[var(--text-primary)]">
                    {parseFloat(eligibility.max_amount).toFixed(3)} Ѵ
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">Taux d&apos;intérêt</p>
                  <p className="text-xl font-bold text-green-500">0%</p>
                  <p className="text-xs text-[var(--text-muted)]">Toujours</p>
                </div>
              </div>
              {eligibility.reason && (
                <p className="mt-3 text-sm text-[var(--text-muted)]">
                  {eligibility.reason}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Active loan */}
          {activeLoan && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Prêt en cours</CardTitle>
                <Badge variant="violet">Actif</Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Montant emprunté</p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">
                      {parseFloat(activeLoan.amount).toFixed(3)} Ѵ
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Restant à rembourser</p>
                    <p className="text-lg font-bold text-orange-400">
                      {parseFloat(activeLoan.remaining).toFixed(3)} Ѵ
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)] mb-1">Remboursement/jour</p>
                    <p className="text-lg font-bold text-[var(--text-secondary)]">
                      {(parseFloat(activeLoan.daily_repayment_rate) * 1).toFixed(2)} Ѵ
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                {(() => {
                  const amount = parseFloat(activeLoan.amount);
                  const remaining = parseFloat(activeLoan.remaining);
                  const repaid = amount - remaining;
                  const percent = amount > 0 ? (repaid / amount) * 100 : 0;
                  const daysLeft = remaining > 0
                    ? Math.ceil(remaining / (parseFloat(activeLoan.daily_repayment_rate) * 1))
                    : 0;
                  return (
                    <>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          {repaid.toFixed(3)} Ѵ remboursés
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {percent.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={percent} />
                      <p className="mt-2 text-xs text-[var(--text-muted)]">
                        Estimation : encore ~{daysLeft} jours de remboursement
                      </p>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Request form — only if eligible and no active loan */}
          {eligibility.eligible && !activeLoan && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Demander un crédit</CardTitle>
              </CardHeader>
              <CardContent>
                {step === "form" && (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                        Montant souhaité
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={parseFloat(eligibility.max_amount)}
                          step={0.001}
                          value={requestAmount}
                          onChange={(e) => setRequestAmount(e.target.value)}
                          placeholder="0.000"
                          className="h-10 w-full rounded-xl border bg-[var(--bg-elevated)] px-4 pr-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                          style={{ borderColor: "var(--border)" }}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-muted)]">
                          Ѵ
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                        Maximum : {parseFloat(eligibility.max_amount).toFixed(3)} Ѵ
                      </p>
                    </div>

                    {requestAmount && parseFloat(requestAmount) > 0 && (
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--text-muted)]">Taux d&apos;intérêt</span>
                          <span className="font-semibold text-green-500">0%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--text-muted)]">Remboursement quotidien</span>
                          <span className="font-medium text-[var(--text-primary)]">0.25 Ѵ/jour</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--text-muted)]">Durée estimée</span>
                          <span className="font-medium text-[var(--text-primary)]">
                            ~{Math.ceil(parseFloat(requestAmount) / 0.25)} jours
                          </span>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => setStep("confirm")}
                      disabled={
                        !requestAmount ||
                        parseFloat(requestAmount) <= 0 ||
                        parseFloat(requestAmount) > parseFloat(eligibility.max_amount)
                      }
                    >
                      Continuer
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {step === "confirm" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-center">
                      <p className="text-sm text-[var(--text-muted)] mb-1">Vous empruntez</p>
                      <p className="text-3xl font-bold text-[var(--text-primary)]">
                        {parseFloat(requestAmount).toFixed(3)} Ѵ
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-2">
                        Remboursement automatique : 0.25 Ѵ/jour sur vos émissions
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => setStep("form")}
                        disabled={submitting}
                      >
                        Retour
                      </Button>
                      <Button
                        onClick={handleRequestCredit}
                        disabled={submitting}
                        className="flex-1"
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Confirmer le crédit
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {step === "success" && newLoan && (
                  <div className="text-center space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                      <CheckCircle2 className="h-7 w-7 text-green-500" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[var(--text-primary)]">
                        Crédit accordé !
                      </p>
                      <p className="text-sm text-[var(--text-muted)] mt-1">
                        {parseFloat(newLoan.amount).toFixed(3)} Ѵ ont été ajoutés à votre solde
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setStep("form");
                        setRequestAmount("");
                        setNewLoan(null);
                      }}
                    >
                      Fermer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Past loans */}
          {pastLoans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historique des prêts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pastLoans.map((loan) => (
                    <div
                      key={loan.id}
                      className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {parseFloat(loan.amount).toFixed(3)} Ѵ
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {new Date(loan.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Badge variant={loan.status === "repaid" ? "green" : "red"}>
                        {loan.status === "repaid" ? "Remboursé" : "Défaut"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
