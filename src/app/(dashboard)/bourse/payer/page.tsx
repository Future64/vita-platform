"use client";

import { useState, useMemo, Suspense } from "react";
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
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Landmark,
  Search,
  ShieldCheck,
  Check,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { cn } from "@/lib/utils";
import { MOCK_WALLET, searchUsers, type MockUser } from "@/lib/mockBourse";
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

const COMMON_POT_RATE = 0.02;

const steps = [
  { number: 1, label: "Destinataire" },
  { number: 2, label: "Montant" },
  { number: 3, label: "Confirmation" },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-0">
      {steps.map((step, i) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all",
                currentStep > step.number
                  ? "border-green-500 bg-green-500 text-white"
                  : currentStep === step.number
                    ? "border-violet-500 bg-violet-500 text-white"
                    : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-muted)]"
              )}
            >
              {currentStep > step.number ? (
                <Check className="h-5 w-5" />
              ) : (
                step.number
              )}
            </div>
            <span
              className={cn(
                "mt-1.5 text-xs font-medium",
                currentStep >= step.number
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-muted)]"
              )}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "mx-3 mb-5 h-0.5 w-12 rounded-full transition-all sm:w-20",
                currentStep > step.number
                  ? "bg-green-500"
                  : "bg-[var(--border)]"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function PayerPageContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const wallet = MOCK_WALLET;

  const [step, setStep] = useState(1);
  const [recipientQuery, setRecipientQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [amount, setAmount] = useState(searchParams.get("amount") || "");
  const [motif, setMotif] = useState("");
  const [success, setSuccess] = useState(false);

  const results = useMemo(() => searchUsers(recipientQuery), [recipientQuery]);
  const amountNum = parseFloat(amount) || 0;
  const potContribution = amountNum * COMMON_POT_RATE;
  const netAmount = amountNum - potContribution;
  const isOverHalf = amountNum > wallet.solde * 0.5;
  const potLabel = `${(COMMON_POT_RATE * 100).toFixed(0)}%`;

  const canGoStep2 = selectedUser !== null;
  const canGoStep3 = amountNum > 0 && amountNum <= wallet.solde;

  function handleConfirm() {
    setSuccess(true);
    toast.success("Transaction confirmee !");
  }

  function handleReset() {
    setStep(1);
    setRecipientQuery("");
    setSelectedUser(null);
    setAmount("");
    setMotif("");
    setSuccess(false);
  }

  // --- Success screen ---
  if (success) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Bourse">
        <div className="mx-auto max-w-lg py-12">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">
              Paiement envoyé !
            </h1>
            <p className="mb-1 text-sm text-[var(--text-secondary)]">
              {netAmount.toFixed(2)} Ѵ envoyés à {selectedUser?.nom}
            </p>
            <p className="mb-8 text-xs text-[var(--text-muted)]">
              + {potContribution.toFixed(3)} Ѵ au pot commun
            </p>

            <Card className="mb-6 text-left">
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Destinataire</span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {selectedUser?.nom} ({selectedUser?.username})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Montant brut</span>
                    <span className="font-mono font-semibold text-[var(--text-primary)]">
                      {amountNum.toFixed(3)} Ѵ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Pot commun ({potLabel})</span>
                    <span className="font-mono text-cyan-500">-{potContribution.toFixed(3)} Ѵ</span>
                  </div>
                  <div className="border-t border-[var(--border)] pt-3 flex justify-between">
                    <span className="font-semibold text-[var(--text-primary)]">Net reçu</span>
                    <span className="font-mono font-bold text-green-500">{netAmount.toFixed(3)} Ѵ</span>
                  </div>
                  {motif && (
                    <div className="border-t border-[var(--border)] pt-3">
                      <span className="text-[var(--text-muted)]">Motif : </span>
                      <span className="text-[var(--text-secondary)]">{motif}</span>
                    </div>
                  )}
                  <div className="border-t border-[var(--border)] pt-3 flex justify-between">
                    <span className="text-[var(--text-secondary)]">Nouveau solde</span>
                    <span className="font-mono font-semibold text-[var(--text-primary)]">
                      {(wallet.solde - amountNum).toFixed(3)} Ѵ
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

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Bourse">
      <div className="mx-auto max-w-lg">
        {/* Header */}
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

        {/* Stepper */}
        <StepIndicator currentStep={step} />

        {/* Step 1: Destinataire */}
        {step === 1 && (
          <div className="space-y-4">
            <Card>
              <CardContent>
                <label className="mb-3 block text-sm font-semibold text-[var(--text-primary)]">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-violet-500" />
                    Rechercher un destinataire
                  </div>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={recipientQuery}
                    onChange={(e) => {
                      setRecipientQuery(e.target.value);
                      setSelectedUser(null);
                    }}
                    placeholder="@nom ou nom complet..."
                    className="h-11 w-full rounded-xl border bg-[var(--bg-elevated)] pl-10 pr-4 text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    style={{ borderColor: "var(--border)" }}
                  />
                </div>

                {/* Search results */}
                {results.length > 0 && !selectedUser && (
                  <div className="mt-3 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
                    {results.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedUser(user);
                          setRecipientQuery(user.nom);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--bg-card-hover)]"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/15">
                          <User className="h-4 w-4 text-violet-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {user.nom}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">{user.username}</p>
                        </div>
                        {user.verifie && (
                          <ShieldCheck className="h-4 w-4 text-green-500 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected user */}
                {selectedUser && (
                  <div className="mt-3 flex items-center gap-3 rounded-xl bg-violet-500/10 border border-violet-500/20 px-4 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/15">
                      <User className="h-4 w-4 text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {selectedUser.nom}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{selectedUser.username}</p>
                    </div>
                    {selectedUser.verifie && (
                      <div className="flex items-center gap-1 text-xs text-green-500">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Vérifié
                      </div>
                    )}
                  </div>
                )}

                {recipientQuery.length > 0 && results.length === 0 && !selectedUser && (
                  <p className="mt-3 text-xs text-[var(--text-muted)]">
                    Aucun utilisateur trouvé
                  </p>
                )}
              </CardContent>
            </Card>

            <PermissionGate permission="send_vita">
              <Button
                className="w-full h-12 text-base"
                disabled={!canGoStep2}
                onClick={() => setStep(2)}
              >
                Continuer
                <ArrowRight className="h-5 w-5" />
              </Button>
            </PermissionGate>
          </div>
        )}

        {/* Step 2: Montant + Motif */}
        {step === 2 && (
          <div className="space-y-4">
            <Card>
              <CardContent>
                <label className="mb-3 block text-sm font-semibold text-[var(--text-primary)]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-green-500" />
                      Montant
                    </div>
                    <span className="text-xs font-normal text-[var(--text-muted)]">
                      Disponible : {wallet.solde.toFixed(2)} Ѵ
                    </span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="h-14 w-full rounded-xl border bg-[var(--bg-elevated)] px-4 pr-12 text-2xl font-bold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    style={{ borderColor: "var(--border)" }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-lg font-bold text-transparent">
                    Ѵ
                  </span>
                </div>

                {amountNum > wallet.solde && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    Solde insuffisant
                  </p>
                )}

                {isOverHalf && amountNum <= wallet.solde && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg bg-orange-500/10 border border-orange-500/20 px-3 py-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-400">
                      Attention : ce montant représente plus de 50% de votre solde
                    </p>
                  </div>
                )}

                {amountNum > 0 && amountNum <= wallet.solde && (
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

            <Card>
              <CardContent>
                <label className="mb-3 block text-sm font-semibold text-[var(--text-primary)]">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="h-4 w-4 text-pink-500" />
                    Motif
                    <span className="text-xs font-normal text-[var(--text-muted)]">(optionnel)</span>
                  </div>
                </label>
                <textarea
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  placeholder="Ex: Réparation vélo, cours de maths..."
                  rows={3}
                  className="w-full resize-none rounded-xl border bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  style={{ borderColor: "var(--border)" }}
                />
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <Button
                className="flex-1"
                disabled={!canGoStep3}
                onClick={() => setStep(3)}
              >
                Continuer
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <Card>
              <CardContent>
                <div className="space-y-4">
                  {/* Recipient */}
                  <div className="flex items-center gap-3 rounded-xl bg-[var(--bg-elevated)] p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/15">
                      <User className="h-5 w-5 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)]">Destinataire</p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {selectedUser?.nom} ({selectedUser?.username})
                      </p>
                    </div>
                  </div>

                  {/* Amount details */}
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
                        Montant net reçu
                      </span>
                      <span className="font-mono font-bold text-green-500">
                        {netAmount.toFixed(3)} Ѵ
                      </span>
                    </div>
                  </div>

                  {motif && (
                    <div className="rounded-lg bg-[var(--bg-elevated)] p-3">
                      <p className="text-xs text-[var(--text-muted)] mb-1">Motif</p>
                      <p className="text-sm text-[var(--text-secondary)]">{motif}</p>
                    </div>
                  )}

                  <div className="rounded-lg border border-[var(--border)] p-3 text-center">
                    <p className="text-xs text-[var(--text-muted)]">Solde après transaction</p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">
                      {(wallet.solde - amountNum).toFixed(3)} Ѵ
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4" />
                Modifier
              </Button>
              <Button className="flex-1" onClick={handleConfirm}>
                Confirmer le paiement
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
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
