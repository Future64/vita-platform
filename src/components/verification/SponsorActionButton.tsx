"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ShieldOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Types ────────────────────────────────────────────────────────

export type SponsorAction = "accept" | "refuse" | "revoke";

export interface SponsorActionButtonProps {
  action: SponsorAction;
  onClick: () => void | Promise<void>;
  size?: "sm" | "default";
  disabled?: boolean;
  /** Show confirmation dialog before executing */
  requireConfirmation?: boolean;
  /** Custom confirmation message */
  confirmMessage?: string;
}

// ── Config ───────────────────────────────────────────────────────

const ACTION_CONFIG: Record<
  SponsorAction,
  {
    icon: typeof CheckCircle2;
    label: string;
    shortLabel: string;
    variant: "primary" | "ghost" | "danger";
    confirmDefault: string;
  }
> = {
  accept: {
    icon: CheckCircle2,
    label: "Attester",
    shortLabel: "Attester",
    variant: "primary",
    confirmDefault: "",
  },
  refuse: {
    icon: XCircle,
    label: "Refuser",
    shortLabel: "Refuser",
    variant: "ghost",
    confirmDefault: "",
  },
  revoke: {
    icon: ShieldOff,
    label: "Revoquer",
    shortLabel: "Revoquer",
    variant: "danger",
    confirmDefault:
      "Etes-vous sur de vouloir revoquer cette attestation ? Si le demandeur passe en dessous du seuil requis, sa verification sera invalidee.",
  },
};

// ── Component ────────────────────────────────────────────────────

export function SponsorActionButton({
  action,
  onClick,
  size = "default",
  disabled = false,
  requireConfirmation,
  confirmMessage,
}: SponsorActionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const config = ACTION_CONFIG[action];
  const Icon = config.icon;
  const needsConfirm =
    requireConfirmation !== undefined
      ? requireConfirmation
      : action === "revoke";

  const handleClick = async () => {
    if (needsConfirm && !showConfirm) {
      setShowConfirm(true);
      return;
    }

    setLoading(true);
    setShowConfirm(false);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  // Confirmation state
  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2">
        <p
          className="text-xs"
          style={{ color: "var(--text-secondary)" }}
        >
          {confirmMessage || config.confirmDefault}
        </p>
        <div className="flex gap-2">
          <Button
            variant={action === "revoke" ? "danger" : config.variant}
            size="sm"
            onClick={handleClick}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Icon className="h-3.5 w-3.5" />
            )}
            <span className="ml-1">Confirmer</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Annuler
          </Button>
        </div>
      </div>
    );
  }

  // Default button
  if (size === "sm") {
    return (
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
        style={{
          color:
            action === "accept"
              ? "rgb(34, 197, 94)"
              : action === "revoke"
              ? "rgb(245, 158, 11)"
              : "var(--text-muted)",
          backgroundColor:
            action === "accept"
              ? "rgba(34, 197, 94, 0.1)"
              : action === "revoke"
              ? "rgba(245, 158, 11, 0.1)"
              : "transparent",
        }}
      >
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Icon className="h-3 w-3" />
        )}
        {config.shortLabel}
      </button>
    );
  }

  return (
    <Button
      variant={config.variant}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      <span className="ml-1.5">{config.label}</span>
    </Button>
  );
}
