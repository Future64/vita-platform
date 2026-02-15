"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  Send,
  QrCode,
  Calculator,
  Clock,
  PiggyBank,
  HandCoins,
  ArrowRight,
  Zap,
  GraduationCap,
  Hammer,
  Shield,
  MapPin,
  Package,
  Wrench,
  BookOpen,
  Truck,
  Stethoscope,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- Sidebar (shared with other Bourse pages) ---

const sidebarItems: SidebarItem[] = [
  { icon: Wallet, label: "Solde", href: "/bourse" },
  { icon: Send, label: "Payer", href: "/bourse/payer" },
  { icon: QrCode, label: "Recevoir", href: "/bourse/recevoir" },
  { icon: Calculator, label: "Calculateur", href: "/bourse/calculateur" },
  { icon: Clock, label: "Historique", href: "/bourse/historique" },
  { icon: PiggyBank, label: "Épargne", href: "/bourse/epargne" },
  { icon: HandCoins, label: "Crédit", href: "/bourse/credit" },
];

// --- Coefficient definitions ---

interface CoefficientStop {
  value: number;
  label: string;
}

interface CoefficientDef {
  key: string;
  name: string;
  description: string;
  icon: typeof GraduationCap;
  color: string;
  stops: CoefficientStop[];
}

const coefficients: CoefficientDef[] = [
  {
    key: "F",
    name: "Formation",
    description: "Niveau de formation requis pour le service",
    icon: GraduationCap,
    color: "violet",
    stops: [
      { value: 0, label: "Aucune" },
      { value: 0.1, label: "Expérience" },
      { value: 0.2, label: "Apprentissage" },
      { value: 0.3, label: "Formation qualifiée" },
      { value: 0.4, label: "Études longues" },
      { value: 0.5, label: "Expertise rare" },
    ],
  },
  {
    key: "P",
    name: "Pénibilité",
    description: "Difficulté physique ou conditions de travail",
    icon: Hammer,
    color: "orange",
    stops: [
      { value: 0, label: "Bureau / confort" },
      { value: 0.1, label: "Effort modéré" },
      { value: 0.2, label: "Travail physique" },
      { value: 0.3, label: "Conditions difficiles" },
      { value: 0.4, label: "Dangereux / extrême" },
    ],
  },
  {
    key: "R",
    name: "Responsabilité",
    description: "Impact potentiel sur autrui",
    icon: Shield,
    color: "pink",
    stops: [
      { value: 0, label: "Faible impact" },
      { value: 0.1, label: "Impact modéré" },
      { value: 0.2, label: "Responsabilité significative" },
      { value: 0.3, label: "Impact vital possible" },
      { value: 0.4, label: "Responsabilité vitale" },
    ],
  },
  {
    key: "L",
    name: "Rareté locale",
    description: "Disponibilité de la compétence dans la zone",
    icon: MapPin,
    color: "cyan",
    stops: [
      { value: 0, label: "Compétence courante" },
      { value: 0.1, label: "Quelques praticiens" },
      { value: 0.2, label: "Peu disponible" },
      { value: 0.3, label: "Très rare localement" },
    ],
  },
];

// --- Presets ---

interface Preset {
  name: string;
  icon: typeof Wrench;
  hours: number;
  minutes: number;
  F: number;
  P: number;
  R: number;
  L: number;
  M: number;
}

const presets: Preset[] = [
  {
    name: "Plombier 2h urgence",
    icon: Wrench,
    hours: 2,
    minutes: 0,
    F: 0.3,
    P: 0.1,
    R: 0.2,
    L: 0.2,
    M: 0.09,
  },
  {
    name: "Cours particulier 1h",
    icon: BookOpen,
    hours: 1,
    minutes: 0,
    F: 0.4,
    P: 0,
    R: 0.1,
    L: 0.1,
    M: 0,
  },
  {
    name: "Aide au déménagement 4h",
    icon: Truck,
    hours: 4,
    minutes: 0,
    F: 0,
    P: 0.3,
    R: 0.1,
    L: 0,
    M: 0,
  },
  {
    name: "Consultation médicale 30min",
    icon: Stethoscope,
    hours: 0,
    minutes: 30,
    F: 0.5,
    P: 0,
    R: 0.4,
    L: 0.2,
    M: 0,
  },
];

// --- Slider component ---

const colorMap: Record<string, { track: string; thumb: string; label: string }> = {
  violet: {
    track: "bg-violet-500",
    thumb: "border-violet-500 shadow-violet-500/30",
    label: "text-violet-400",
  },
  orange: {
    track: "bg-orange-500",
    thumb: "border-orange-500 shadow-orange-500/30",
    label: "text-orange-400",
  },
  pink: {
    track: "bg-pink-500",
    thumb: "border-pink-500 shadow-pink-500/30",
    label: "text-pink-400",
  },
  cyan: {
    track: "bg-cyan-500",
    thumb: "border-cyan-500 shadow-cyan-500/30",
    label: "text-cyan-400",
  },
};

function CoefficientSlider({
  def,
  value,
  onChange,
}: {
  def: CoefficientDef;
  value: number;
  onChange: (v: number) => void;
}) {
  const Icon = def.icon;
  const colors = colorMap[def.color];
  const maxVal = def.stops[def.stops.length - 1].value;
  const currentStop = def.stops.reduce((closest, stop) =>
    Math.abs(stop.value - value) < Math.abs(closest.value - value) ? stop : closest
  );
  const percent = maxVal > 0 ? (value / maxVal) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", `bg-${def.color}-500/15`)}>
            <Icon className={cn("h-4 w-4", `text-${def.color}-500`)} />
          </div>
          <div>
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {def.key} — {def.name}
            </span>
            <p className="text-xs text-[var(--text-muted)]">{def.description}</p>
          </div>
        </div>
        <Badge variant={def.color as "violet" | "pink" | "cyan" | "orange"}>
          {value.toFixed(1)}
        </Badge>
      </div>

      {/* Slider track */}
      <div className="relative px-1">
        <div className="relative h-2 rounded-full bg-[var(--bg-elevated)]">
          <div
            className={cn("absolute left-0 top-0 h-full rounded-full transition-all duration-150", colors.track)}
            style={{ width: `${percent}%` }}
          />
          {/* Tick marks */}
          <div className="absolute inset-0 flex items-center">
            {def.stops.map((stop) => {
              const pos = maxVal > 0 ? (stop.value / maxVal) * 100 : 0;
              return (
                <button
                  key={stop.value}
                  type="button"
                  onClick={() => onChange(stop.value)}
                  className="absolute -translate-x-1/2"
                  style={{ left: `${pos}%` }}
                  title={stop.label}
                >
                  <div
                    className={cn(
                      "h-3 w-3 rounded-full border-2 transition-all",
                      stop.value <= value
                        ? `${colors.thumb} bg-[var(--bg-card)]`
                        : "border-[var(--border)] bg-[var(--bg-elevated)]"
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>
        {/* Native range input (invisible, on top for drag) */}
        <input
          type="range"
          min={0}
          max={maxVal * 10}
          step={1}
          value={value * 10}
          onChange={(e) => {
            const raw = parseInt(e.target.value) / 10;
            // Snap to nearest stop
            const snapped = def.stops.reduce((closest, stop) =>
              Math.abs(stop.value - raw) < Math.abs(closest.value - raw) ? stop : closest
            );
            onChange(snapped.value);
          }}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>

      {/* Label */}
      <p className={cn("text-xs font-medium", colors.label)}>
        {currentStop.label}
      </p>
    </div>
  );
}

// --- Main page ---

export default function CalculateurPage() {
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [F, setF] = useState(0);
  const [P, setP] = useState(0);
  const [R, setR] = useState(0);
  const [L, setL] = useState(0);
  const [M, setM] = useState(0);

  const setters: Record<string, (v: number) => void> = { F: setF, P: setP, R: setR, L: setL };
  const values: Record<string, number> = { F, P, R, L };

  // T in fraction of day (16h working day)
  const T = useMemo(() => (hours + minutes / 60) / 16, [hours, minutes]);

  // V = T × (1 + F + P + R + L) + M
  const multiplier = 1 + F + P + R + L;
  const V = T * multiplier + M;

  // Life-time equivalent
  const lifeFraction = useMemo(() => {
    if (V < 0.001) return "< 1 minute de vie";
    if (V < 0.0625) {
      const mins = Math.round(V * 16 * 60);
      return `${mins} min de vie`;
    }
    if (V < 1) {
      const fraction = V;
      if (fraction <= 0.125) return `~${Math.round(fraction * 16)}h de vie`;
      return `~${fraction.toFixed(1)} jour de vie`;
    }
    return `~${V.toFixed(1)} jours de vie`;
  }, [V]);

  function applyPreset(preset: Preset) {
    setHours(preset.hours);
    setMinutes(preset.minutes);
    setF(preset.F);
    setP(preset.P);
    setR(preset.R);
    setL(preset.L);
    setM(preset.M);
  }

  function computePresetValue(preset: Preset): number {
    const pT = (preset.hours + preset.minutes / 60) / 16;
    return pT * (1 + preset.F + preset.P + preset.R + preset.L) + preset.M;
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Bourse">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              Calculateur de valorisation
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              V = T &times; (1 + F + P + R + L) + M
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Controls */}
        <div className="lg:col-span-2 space-y-5">
          {/* Time input */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  T — Temps d&apos;exécution
                </div>
              </CardTitle>
              <Badge variant="green">{T.toFixed(4)} Ѵ</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                    Heures
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={16}
                      step={1}
                      value={hours}
                      onChange={(e) => setHours(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--bg-elevated)] accent-green-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500"
                    />
                    <span className="w-10 text-right text-sm font-bold text-[var(--text-primary)]">
                      {hours}h
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-xs font-medium text-[var(--text-muted)]">
                    Minutes
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={55}
                      step={5}
                      value={minutes}
                      onChange={(e) => setMinutes(parseInt(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--bg-elevated)] accent-green-500 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500"
                    />
                    <span className="w-14 text-right text-sm font-bold text-[var(--text-primary)]">
                      {minutes}min
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-[var(--text-muted)]">
                Base : 1 journée de 16h = 1 Ѵ &mdash; soit 1h = 0.0625 Ѵ
              </p>
            </CardContent>
          </Card>

          {/* Coefficient sliders */}
          <Card>
            <CardHeader>
              <CardTitle>Coefficients</CardTitle>
              <Badge variant="violet">&times;{multiplier.toFixed(1)}</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {coefficients.map((def) => (
                  <CoefficientSlider
                    key={def.key}
                    def={def}
                    value={values[def.key]}
                    onChange={setters[def.key]}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Materials input */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-orange-500" />
                  M — Matériaux
                </div>
              </CardTitle>
              <Badge variant="orange">{M.toFixed(3)} Ѵ</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min={0}
                    step={0.001}
                    value={M || ""}
                    onChange={(e) => setM(parseFloat(e.target.value) || 0)}
                    placeholder="0.000"
                    className="h-11 w-full rounded-xl border bg-[var(--bg-elevated)] px-4 pr-10 text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    style={{ borderColor: "var(--border)" }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-muted)]">
                    Ѵ
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                Coût des matériaux consommés pendant le service (pièces, fournitures, etc.)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right: Result + Presets */}
        <div className="space-y-5">
          {/* Result */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-violet-500/10 via-pink-500/5 to-transparent p-5 md:p-6">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Valeur du service
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
                  {V.toFixed(3)}
                </span>
                <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-2xl font-bold text-transparent">
                  Ѵ
                </span>
              </div>

              {/* Life equivalent */}
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-3 py-1 text-sm font-medium text-violet-400">
                <Zap className="h-3.5 w-3.5" />
                {lifeFraction}
              </div>
            </div>

            <CardContent>
              {/* Formula breakdown */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Détail du calcul
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Base temps (T)</span>
                    <span className="font-mono font-semibold text-[var(--text-primary)]">
                      {T.toFixed(4)} Ѵ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Multiplicateur</span>
                    <span className="font-mono font-semibold text-[var(--text-primary)]">
                      &times;{multiplier.toFixed(1)}
                    </span>
                  </div>
                  <div className="border-t border-[var(--border)] pt-2">
                    <div className="flex justify-between text-xs text-[var(--text-muted)]">
                      <span>F (Formation)</span>
                      <span>+{F.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[var(--text-muted)]">
                      <span>P (Pénibilité)</span>
                      <span>+{P.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[var(--text-muted)]">
                      <span>R (Responsabilité)</span>
                      <span>+{R.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[var(--text-muted)]">
                      <span>L (Rareté locale)</span>
                      <span>+{L.toFixed(1)}</span>
                    </div>
                  </div>
                  {M > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Matériaux (M)</span>
                      <span className="font-mono font-semibold text-[var(--text-primary)]">
                        +{M.toFixed(3)} Ѵ
                      </span>
                    </div>
                  )}
                  <div className="border-t border-[var(--border)] pt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-[var(--text-primary)]">Total</span>
                      <span className="font-mono font-bold text-violet-500">
                        {V.toFixed(3)} Ѵ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link href={`/bourse/payer?amount=${V.toFixed(3)}`} className="mt-5 block">
                <Button className="w-full">
                  Créer un paiement de {V.toFixed(3)} Ѵ
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Presets */}
          <Card>
            <CardHeader>
              <CardTitle>Exemples courants</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[var(--border)]">
                {presets.map((preset) => {
                  const Icon = preset.icon;
                  const pV = computePresetValue(preset);
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="flex w-full items-center gap-3 px-4 py-3.5 md:px-5 text-left transition-colors hover:bg-[var(--bg-card-hover)]"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-elevated)]">
                        <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {preset.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {preset.hours > 0 ? `${preset.hours}h` : ""}
                          {preset.minutes > 0 ? `${preset.minutes}min` : ""}
                          {" · "}F:{preset.F} P:{preset.P} R:{preset.R} L:{preset.L}
                          {preset.M > 0 ? ` · M:${preset.M}` : ""}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-sm font-bold text-violet-500">
                        {pV.toFixed(3)} Ѵ
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Formula reminder */}
          <Card>
            <CardContent>
              <div className="rounded-lg bg-[var(--bg-elevated)] p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Formule VITA
                </p>
                <p className="font-mono text-sm font-bold text-[var(--text-primary)]">
                  V = T &times; (1 + F + P + R + L) + M
                </p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Multiplicateur total : 1.0 &agrave; 2.6 (écart max entre services).
                  Les plages de coefficients sont définies par vote collectif en Agora.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
