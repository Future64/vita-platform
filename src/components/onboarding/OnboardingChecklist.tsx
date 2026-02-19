"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Sparkles,
  RotateCcw,
  Play,
  User,
  Eye,
  Bell,
  Globe,
  BookOpen,
  GitBranch,
  FileText,
  Vote,
  MessageSquare,
  Wallet,
  Calculator,
  History,
  UserCheck,
  Compass,
  Users,
  Coins,
} from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { ONBOARDING_STEPS, CATEGORY_LABELS } from "@/lib/onboarding";
import type { OnboardingCategory } from "@/types/onboarding";
import { cn } from "@/lib/utils";

// Icon mapping
const STEP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  User,
  Eye,
  Bell,
  Globe,
  BookOpen,
  GitBranch,
  FileText,
  Vote,
  MessageSquare,
  Wallet,
  Calculator,
  History,
};

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  identite: UserCheck,
  decouverte: Compass,
  participation: Users,
  economie: Coins,
};

const CATEGORY_COLORS: Record<OnboardingCategory, string> = {
  identite: "#10b981",
  decouverte: "#3b82f6",
  participation: "#f59e0b",
  economie: "#8b5cf6",
};

export function OnboardingChecklist() {
  const {
    state,
    completedCount,
    totalSteps,
    progress,
    dismissChecklist,
    startTourGuide,
    isStepCompleted,
  } = useOnboarding();

  const [expanded, setExpanded] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("identite");

  // Don't show if dismissed or all steps completed
  if (state.dismissed || completedCount >= totalSteps) return null;

  // Group steps by category
  const categories = ["identite", "decouverte", "participation", "economie"] as const;
  const grouped = categories.map((cat) => ({
    id: cat,
    label: CATEGORY_LABELS[cat],
    steps: ONBOARDING_STEPS.filter((s) => s.category === cat),
    completed: ONBOARDING_STEPS.filter(
      (s) => s.category === cat && state.completedSteps.includes(s.id)
    ).length,
    total: ONBOARDING_STEPS.filter((s) => s.category === cat).length,
  }));

  return (
    <div
      className={cn(
        "fixed z-40 transition-all duration-300",
        // Desktop: bottom-right
        "bottom-4 right-4 md:bottom-6 md:right-6",
        // Mobile: bottom center, full width with margins
        "left-4 right-4 md:left-auto md:w-80"
      )}
    >
      <div
        className="rounded-xl border shadow-lg overflow-hidden"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 md:p-4 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-pink-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--text-primary)] truncate">
                Premiers pas
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                {completedCount}/{totalSteps} termines
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissChecklist();
              }}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)]"
              title="Masquer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
            ) : (
              <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" />
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-3 md:px-4 pb-2">
          <div className="h-1.5 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="max-h-[50vh] overflow-y-auto">
            {/* Tour guide button */}
            {!state.tourCompleted && (
              <div className="px-3 md:px-4 pb-2">
                <button
                  onClick={startTourGuide}
                  className="flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-violet-500/10 hover:border-violet-500/50"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Play className="h-4 w-4 text-violet-500" />
                  <span>Lancer la visite guidee</span>
                </button>
              </div>
            )}

            {/* Categories */}
            <div className="px-3 md:px-4 pb-3 space-y-1">
              {grouped.map((group) => {
                const CatIcon = CATEGORY_ICON_MAP[group.id];
                const isExpanded = expandedCategory === group.id;
                const catColor = CATEGORY_COLORS[group.id];
                const allDone = group.completed === group.total;

                return (
                  <div key={group.id}>
                    <button
                      onClick={() =>
                        setExpandedCategory(isExpanded ? null : group.id)
                      }
                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-[var(--bg-elevated)]"
                    >
                      <div className="flex items-center gap-2.5">
                        <span style={{ color: catColor }}>
                          <CatIcon className="h-4 w-4" />
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            allDone
                              ? "text-[var(--text-muted)]"
                              : "text-[var(--text-primary)]"
                          )}
                        >
                          {group.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--text-muted)]">
                          {group.completed}/{group.total}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                        )}
                      </div>
                    </button>

                    {/* Steps inside category */}
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-0.5">
                        {group.steps.map((step) => {
                          const done = isStepCompleted(step.id);
                          const StepIcon = STEP_ICONS[step.icone];
                          const content = (
                            <div
                              className={cn(
                                "flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                                done
                                  ? "opacity-60"
                                  : "hover:bg-[var(--bg-elevated)]"
                              )}
                            >
                              <div className="mt-0.5 shrink-0">
                                {done ? (
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                                    <Check className="h-3 w-3 text-green-500" />
                                  </div>
                                ) : StepIcon ? (
                                  <div
                                    className="flex h-5 w-5 items-center justify-center rounded-full"
                                    style={{
                                      backgroundColor: `${catColor}20`,
                                    }}
                                  >
                                    <span style={{ color: catColor }}>
                                      <StepIcon className="h-3 w-3" />
                                    </span>
                                  </div>
                                ) : (
                                  <div className="h-5 w-5 rounded-full border border-[var(--border)]" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div
                                  className={cn(
                                    "text-xs font-medium",
                                    done
                                      ? "line-through text-[var(--text-muted)]"
                                      : "text-[var(--text-primary)]"
                                  )}
                                >
                                  {step.titre}
                                </div>
                                <div className="text-[0.6875rem] text-[var(--text-muted)] leading-snug">
                                  {step.description}
                                </div>
                              </div>
                            </div>
                          );

                          if (step.lien && !done) {
                            return (
                              <Link key={step.id} href={step.lien}>
                                {content}
                              </Link>
                            );
                          }
                          return (
                            <div key={step.id}>{content}</div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Celebration overlay when all steps are completed
export function OnboardingCelebration() {
  const { completedCount, totalSteps, dismissChecklist } = useOnboarding();
  const [visible, setVisible] = useState(true);

  if (completedCount < totalSteps || !visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          setVisible(false);
          dismissChecklist();
        }}
      />
      <div
        className="relative z-10 mx-4 w-full max-w-sm rounded-2xl border p-6 text-center shadow-xl"
        style={{
          backgroundColor: "var(--bg-card)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
          Felicitations !
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Vous avez complete toutes les etapes de decouverte de VITA. Vous etes
          pret a participer pleinement a la gouvernance !
        </p>
        <button
          onClick={() => {
            setVisible(false);
            dismissChecklist();
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
        >
          C&apos;est parti !
        </button>
      </div>
    </div>
  );
}
