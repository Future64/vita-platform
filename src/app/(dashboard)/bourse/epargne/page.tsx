"use client";

import { useState } from "react";
import {
  Wallet,
  Send,
  QrCode,
  Calculator,
  Clock,
  PiggyBank,
  HandCoins,
  Plus,
  Target,
  ArrowRight,
  Info,
  Sparkles,
  Plane,
  Laptop,
  Home,
  X,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const sidebarItems: SidebarItem[] = [
  { icon: Wallet, label: "Solde", href: "/bourse" },
  { icon: Send, label: "Payer", href: "/bourse/payer" },
  { icon: QrCode, label: "Recevoir", href: "/bourse/recevoir" },
  { icon: Calculator, label: "Calculateur", href: "/bourse/calculateur" },
  { icon: Clock, label: "Historique", href: "/bourse/historique" },
  { icon: PiggyBank, label: "Épargne", href: "/bourse/epargne" },
  { icon: HandCoins, label: "Crédit", href: "/bourse/credit" },
];

// --- Mock data ---

const MOCK_BALANCE = 127.285;
const DAILY_SAVINGS_RATE = 0.8; // estimated Ѵ saved per day on average

interface SavingsGoal {
  id: string;
  name: string;
  description: string;
  icon: typeof Target;
  target: number;
  saved: number;
  color: "violet" | "pink" | "cyan" | "green" | "orange";
}

const initialGoals: SavingsGoal[] = [
  {
    id: "1",
    name: "Voyage",
    description: "Économiser pour un voyage en train",
    icon: Plane,
    target: 30,
    saved: 18.5,
    color: "cyan",
  },
  {
    id: "2",
    name: "Ordinateur portable",
    description: "Contribution pour un PC reconditionné",
    icon: Laptop,
    target: 50,
    saved: 12.0,
    color: "violet",
  },
  {
    id: "3",
    name: "Réparations maison",
    description: "Matériaux pour réparation du toit",
    icon: Home,
    target: 20,
    saved: 20.0,
    color: "green",
  },
];

export default function EpargnePage() {
  const [goals, setGoals] = useState<SavingsGoal[]>(initialGoals);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [transferGoalId, setTransferGoalId] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState("");

  const totalSaved = goals.reduce((sum, g) => sum + g.saved, 0);

  function handleCreate() {
    if (!newName || !newTarget) return;
    const goal: SavingsGoal = {
      id: Date.now().toString(),
      name: newName,
      description: newDescription,
      icon: Target,
      target: parseFloat(newTarget),
      saved: 0,
      color: (["violet", "pink", "cyan", "orange"] as const)[goals.length % 4],
    };
    setGoals([...goals, goal]);
    setNewName("");
    setNewTarget("");
    setNewDescription("");
    setShowCreate(false);
  }

  function handleTransfer(goalId: string) {
    const amt = parseFloat(transferAmount) || 0;
    if (amt <= 0) return;
    setGoals(goals.map((g) =>
      g.id === goalId
        ? { ...g, saved: Math.min(g.saved + amt, g.target) }
        : g
    ));
    setTransferAmount("");
    setTransferGoalId(null);
  }

  function daysToGoal(goal: SavingsGoal): string {
    const remaining = goal.target - goal.saved;
    if (remaining <= 0) return "Objectif atteint !";
    const days = Math.ceil(remaining / DAILY_SAVINGS_RATE);
    if (days === 1) return "~1 jour";
    if (days < 30) return `~${days} jours`;
    const months = Math.round(days / 30);
    return months === 1 ? "~1 mois" : `~${months} mois`;
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Bourse">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-cyan-500">
            <PiggyBank className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Épargne
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Définissez vos objectifs et suivez vos progrès
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          Nouvel objectif
        </Button>
      </div>

      {/* Info banner */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-cyan-500" />
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            L&apos;épargne dans VITA ne génère pas d&apos;intérêts
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            La monnaie VITA est ancrée à l&apos;existence humaine, pas au capital. L&apos;épargne est un outil
            d&apos;organisation personnelle, pas un moyen d&apos;accumulation.
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <p className="text-xs text-[var(--text-muted)] mb-1">Total épargné</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">{totalSaved.toFixed(3)} Ѵ</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
          <p className="text-xs text-[var(--text-muted)] mb-1">Objectifs actifs</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">
            {goals.filter((g) => g.saved < g.target).length}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 col-span-2 md:col-span-1">
          <p className="text-xs text-[var(--text-muted)] mb-1">Solde disponible</p>
          <p className="text-xl font-bold text-violet-500">{MOCK_BALANCE.toFixed(3)} Ѵ</p>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Créer un objectif</CardTitle>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
            >
              <X className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                  Nom de l&apos;objectif
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Voyage, Matériel..."
                  className="h-10 w-full rounded-xl border bg-[var(--bg-elevated)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                  Montant cible
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={0.001}
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="0.000"
                    className="h-10 w-full rounded-xl border bg-[var(--bg-elevated)] px-4 pr-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    style={{ borderColor: "var(--border)" }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-muted)]">
                    Ѵ
                  </span>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                  Description <span className="text-xs font-normal text-[var(--text-muted)]">(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Pourquoi cet objectif ?"
                  className="h-10 w-full rounded-xl border bg-[var(--bg-elevated)] px-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
              <Button onClick={handleCreate} disabled={!newName || !newTarget}>
                Créer l&apos;objectif
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals list */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const Icon = goal.icon;
          const percent = Math.min((goal.saved / goal.target) * 100, 100);
          const isComplete = goal.saved >= goal.target;
          const isTransferring = transferGoalId === goal.id;

          return (
            <Card key={goal.id}>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                      `bg-${goal.color}-500/15`
                    )}
                  >
                    <Icon className={cn("h-6 w-6", `text-${goal.color}-500`)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-[var(--text-primary)] truncate">
                        {goal.name}
                      </h3>
                      {isComplete && (
                        <Badge variant="green">
                          <Sparkles className="h-3 w-3" />
                          Atteint
                        </Badge>
                      )}
                    </div>
                    {goal.description && (
                      <p className="text-xs text-[var(--text-muted)] mb-3">
                        {goal.description}
                      </p>
                    )}

                    {/* Progress */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          {goal.saved.toFixed(3)} Ѵ
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          sur {goal.target.toFixed(3)} Ѵ
                        </span>
                      </div>
                      <Progress
                        value={percent}
                        variant={isComplete ? "green" : undefined}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[var(--text-muted)]">
                        {isComplete ? (
                          <span className="text-green-500 font-medium">Objectif atteint !</span>
                        ) : (
                          <>
                            À votre rythme actuel : <span className="font-medium text-[var(--text-secondary)]">{daysToGoal(goal)}</span>
                          </>
                        )}
                      </p>
                      <span className="text-xs font-semibold text-[var(--text-secondary)]">
                        {percent.toFixed(0)}%
                      </span>
                    </div>

                    {/* Transfer section */}
                    {!isComplete && (
                      <div className="mt-3">
                        {isTransferring ? (
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <input
                                type="number"
                                min={0}
                                step={0.001}
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                placeholder="Montant"
                                className="h-9 w-full rounded-lg border bg-[var(--bg-elevated)] px-3 pr-8 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                                style={{ borderColor: "var(--border)" }}
                                autoFocus
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">
                                Ѵ
                              </span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleTransfer(goal.id)}
                              disabled={!transferAmount || parseFloat(transferAmount) <= 0}
                            >
                              Transférer
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setTransferGoalId(null); setTransferAmount(""); }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setTransferGoalId(goal.id)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Transférer vers cet objectif
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
