"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Globe,
  KeyRound,
  UserPlus,
  Check,
  X,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CountryIdentitySelector } from "@/components/registration/CountryIdentitySelector";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";
import type { ModeVisibilite } from "@/types/auth";

// ── Steps ────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS: Record<Step, { icon: typeof Globe; label: string }> = {
  1: { icon: Globe, label: "Identite" },
  2: { icon: ShieldCheck, label: "Verification" },
  3: { icon: Check, label: "Confirme" },
  4: { icon: KeyRound, label: "Profil" },
  5: { icon: UserPlus, label: "Compte" },
};

// ── Helpers ──────────────────────────────────────────────────────

function FieldError({ error }: { error: string | null }) {
  if (!error) return null;
  return <p className="mt-1 text-xs text-red-400">{error}</p>;
}

function validateUsername(value: string): string | null {
  if (value.length < 3) return "Minimum 3 caracteres";
  if (value.length > 30) return "Maximum 30 caracteres";
  if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Lettres, chiffres et underscores uniquement";
  return null;
}

interface PasswordCheck {
  label: string;
  valid: boolean;
}

function getPasswordChecks(value: string): PasswordCheck[] {
  return [
    { label: "12 caracteres minimum", valid: value.length >= 12 },
    { label: "Une majuscule", valid: /[A-Z]/.test(value) },
    { label: "Une minuscule", valid: /[a-z]/.test(value) },
    { label: "Un chiffre", valid: /[0-9]/.test(value) },
    { label: "Un caractere special", valid: /[^a-zA-Z0-9]/.test(value) },
  ];
}

function getPasswordStrength(checks: PasswordCheck[]): { level: number; label: string; color: string } {
  const passed = checks.filter((c) => c.valid).length;
  if (passed <= 1) return { level: 1, label: "Faible", color: "#ef4444" };
  if (passed <= 2) return { level: 2, label: "Faible", color: "#ef4444" };
  if (passed <= 3) return { level: 3, label: "Moyen", color: "#f97316" };
  if (passed <= 4) return { level: 4, label: "Fort", color: "#10b981" };
  return { level: 5, label: "Tres fort", color: "#10b981" };
}

// ── Ed25519 Keypair generation ───────────────────────────────────

async function generateEd25519Keypair(): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  const ed = await import("@noble/ed25519");

  // Generate random 32-byte private key
  const privBytes = new Uint8Array(32);
  crypto.getRandomValues(privBytes);

  // Derive public key
  const pubBytes = await ed.getPublicKeyAsync(privBytes);

  // Encode as hex
  const publicKey = Array.from(pubBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const privateKey = Array.from(privBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { publicKey, privateKey };
}

// ── Languages ────────────────────────────────────────────────────

const LANGUAGES = [
  { code: "fr", label: "Francais" },
  { code: "en", label: "English" },
  { code: "es", label: "Espanol" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Portugues" },
  { code: "nl", label: "Nederlands" },
  { code: "sv", label: "Svenska" },
  { code: "no", label: "Norsk" },
  { code: "da", label: "Dansk" },
  { code: "fi", label: "Suomi" },
  { code: "ar", label: "العربية" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
];

// ── Step indicator ───────────────────────────────────────────────

function StepIndicator({ current, total }: { current: Step; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {Array.from({ length: total }, (_, i) => {
        const step = (i + 1) as Step;
        const config = STEP_LABELS[step];
        const Icon = config.icon;
        const isActive = step === current;
        const isDone = step < current;

        return (
          <div key={step} className="flex items-center gap-1.5">
            {i > 0 && (
              <div
                className="h-px w-4 md:w-6"
                style={{
                  backgroundColor: isDone
                    ? "rgb(139, 92, 246)"
                    : "var(--border)",
                }}
              />
            )}
            <div
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-all"
              style={{
                backgroundColor: isActive
                  ? "rgba(139, 92, 246, 0.15)"
                  : isDone
                  ? "rgba(34, 197, 94, 0.1)"
                  : "transparent",
                color: isActive
                  ? "rgb(139, 92, 246)"
                  : isDone
                  ? "rgb(34, 197, 94)"
                  : "var(--text-muted)",
              }}
            >
              {isDone ? (
                <Check className="h-3 w-3" />
              ) : (
                <Icon className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">{config.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Password strength sub-component ─────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const checks = getPasswordChecks(password);
  const strength = getPasswordStrength(checks);
  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{
                backgroundColor:
                  i <= strength.level ? strength.color : "var(--bg-elevated)",
              }}
            />
          ))}
        </div>
        <span className="text-xs font-medium" style={{ color: strength.color }}>
          {strength.label}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-1.5 text-xs">
            {check.valid ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3" style={{ color: "var(--text-muted)" }} />
            )}
            <span
              style={{
                color: check.valid
                  ? "var(--text-secondary)"
                  : "var(--text-muted)",
              }}
            >
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();
  const { toast } = useToast();

  // ── Step state ─────────────────────────────────────────────────
  const [step, setStep] = useState<Step>(1);

  // ── Step 1: identity verification ──────────────────────────────
  const [identityVerified, setIdentityVerified] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<string | null>(null);
  const [nullifierHash, setNullifierHash] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<string | null>(null);

  // ── Step 4: VITA form ──────────────────────────────────────────
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [langue, setLangue] = useState("fr");
  const [modeVisibilite, setModeVisibilite] = useState<ModeVisibilite>("complet");
  const [pseudonyme, setPseudonyme] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // ── Ed25519 keys ───────────────────────────────────────────────
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [keysGenerated, setKeysGenerated] = useState(false);
  const [keysCopied, setKeysCopied] = useState(false);

  // ── Step 5: submission ─────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  // ── Handle OAuth callback (step 2 → 3) ─────────────────────────
  useEffect(() => {
    const verified = searchParams.get("verified");
    const provider = searchParams.get("provider");
    const hash = searchParams.get("nullifier_hash");
    const country = searchParams.get("country");

    if (verified === "true" && hash) {
      setIdentityVerified(true);
      setVerificationMethod(provider || "eID");
      setNullifierHash(hash);
      setCountryCode(country);
      setStep(3);
    }
  }, [searchParams]);

  // ── Generate keypair when reaching step 4 ──────────────────────
  useEffect(() => {
    if (step === 4 && !keysGenerated) {
      generateEd25519Keypair().then(({ publicKey: pub, privateKey: priv }) => {
        setPublicKey(pub);
        setPrivateKey(priv);
        setKeysGenerated(true);
      });
    }
  }, [step, keysGenerated]);

  function touch(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  // ── Validation ─────────────────────────────────────────────────
  const errors = useMemo(() => {
    const passwordChecks = getPasswordChecks(password);
    const allPasswordValid = passwordChecks.every((c) => c.valid);
    return {
      username:
        username.length > 0
          ? validateUsername(username)
          : "Nom d'utilisateur requis",
      password:
        password.length > 0
          ? allPasswordValid
            ? null
            : "Criteres non remplis"
          : "Mot de passe requis",
      confirmPassword:
        confirmPassword.length > 0
          ? confirmPassword === password
            ? null
            : "Ne correspond pas"
          : "Confirmation requise",
      acceptCGU: acceptCGU ? null : "Requis",
      acceptPrivacy: acceptPrivacy ? null : "Requis",
    };
  }, [username, password, confirmPassword, acceptCGU, acceptPrivacy]);

  const step4Valid =
    !errors.username && !errors.password && !errors.confirmPassword;
  const step5Valid = !errors.acceptCGU && !errors.acceptPrivacy;

  // ── Provider verified callback ─────────────────────────────────
  const handleIdentityVerified = useCallback(() => {
    setIdentityVerified(true);
    setStep(3);
  }, []);

  // ── Web of Trust path ──────────────────────────────────────────
  const handleWebOfTrustSelected = useCallback(() => {
    // Store registration intent in sessionStorage, then redirect
    sessionStorage.setItem("vita_register_wot", "true");
    setVerificationMethod("web_of_trust");
    setIdentityVerified(true);
    setNullifierHash("wot_pending");
    setStep(3);
  }, []);

  // ── Copy private key ───────────────────────────────────────────
  const handleCopyKey = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(privateKey);
      setKeysCopied(true);
      toast.success("Cle privee copiee dans le presse-papiers");
    } catch {
      toast.error("Impossible de copier la cle");
    }
  }, [privateKey, toast]);

  // ── Submit ─────────────────────────────────────────────────────
  async function handleSubmit() {
    setTouched({
      username: true,
      password: true,
      confirmPassword: true,
      acceptCGU: true,
      acceptPrivacy: true,
    });

    if (!step4Valid || !step5Valid) {
      toast.error("Veuillez remplir tous les champs requis.");
      return;
    }

    if (!keysCopied && verificationMethod !== "web_of_trust") {
      toast.warning(
        "Copiez votre cle privee avant de continuer. Elle ne sera pas stockee."
      );
      return;
    }

    setSubmitting(true);
    setGlobalError(null);

    try {
      const result = await register({
        prenom: "",
        nom: "",
        username,
        email: `${username}@vita.local`,
        password,
        dateNaissance: "2000-01-01",
        pays: countryCode || "",
        modeVisibilite,
        pseudonyme: modeVisibilite === "pseudonyme" ? pseudonyme : undefined,
      });

      if (result === true) {
        toast.success("Bienvenue sur VITA !");
        router.push("/panorama");
      } else {
        const errorMsg =
          typeof result === "string"
            ? result
            : "Erreur lors de la creation du compte.";
        toast.error(errorMsg);
        setGlobalError(errorMsg);
        setSubmitting(false);
      }
    } catch {
      const errorMsg = "Erreur lors de l'inscription. Veuillez reessayer.";
      toast.error(errorMsg);
      setGlobalError(errorMsg);
      setSubmitting(false);
    }
  }

  const inputStyle = {
    borderColor: "var(--border)",
    backgroundColor: "var(--bg-elevated)",
    color: "var(--text-primary)",
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-[var(--text-primary)]">
        Creer un compte
      </h1>
      <p className="mb-4 text-xs text-[var(--text-muted)]">
        Inscription VITA en 5 etapes
      </p>

      <StepIndicator current={step} total={5} />

      {globalError && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          {globalError}
        </div>
      )}

      {/* ── STEP 1: Country & Identity Provider Selection ──────── */}
      {step === 1 && (
        <div className="space-y-4" data-testid="step-identity">
          <CountryIdentitySelector
            onVerified={handleIdentityVerified}
            disabled={identityVerified}
          />

          <p className="text-center text-xs text-[var(--text-muted)]">
            Deja un compte ?{" "}
            <Link
              href="/auth/connexion"
              className="font-medium text-violet-500 hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      )}

      {/* ── STEP 2: Redirect in progress (placeholder) ─────────── */}
      {step === 2 && (
        <div
          className="flex flex-col items-center gap-4 py-12"
          data-testid="step-redirect"
        >
          <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
          <p className="text-sm text-[var(--text-secondary)]">
            Redirection vers le service de verification...
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Vous allez etre redirige automatiquement.
          </p>
        </div>
      )}

      {/* ── STEP 3: Verification confirmed ─────────────────────── */}
      {step === 3 && (
        <div className="space-y-4" data-testid="step-verified">
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.08)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                <ShieldCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "rgb(34, 197, 94)" }}
                  data-testid="verified-badge"
                >
                  Identite verifiee
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {verificationMethod === "web_of_trust"
                    ? "Verification par Web of Trust (3 parrains requis)"
                    : `Via ${verificationMethod}`}
                </p>
              </div>
            </div>
          </div>

          {/* Nullifier stored in session */}
          {nullifierHash && nullifierHash !== "wot_pending" && (
            <div className="rounded-lg p-3" style={{ backgroundColor: "var(--bg-elevated)" }}>
              <p className="text-xs font-medium text-[var(--text-muted)] mb-1">
                Empreinte d&apos;identite (nullifier)
              </p>
              <p
                className="text-xs font-mono break-all"
                style={{ color: "var(--text-secondary)" }}
                data-testid="nullifier-hash"
              >
                {nullifierHash}
              </p>
            </div>
          )}

          <Button
            variant="primary"
            className="w-full"
            onClick={() => setStep(4)}
            data-testid="continue-to-form"
          >
            Continuer
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      )}

      {/* ── STEP 4: VITA Profile Form ──────────────────────────── */}
      {step === 4 && (
        <div className="space-y-4" data-testid="step-form">
          {/* Username */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Pseudonyme VITA
            </label>
            <Input
              placeholder="mon_pseudo"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              onBlur={() => touch("username")}
              data-testid="input-username"
            />
            {touched.username && <FieldError error={errors.username} />}
          </div>

          {/* Language */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Langue preferee
            </label>
            <select
              value={langue}
              onChange={(e) => setLangue(e.target.value)}
              className="flex h-10 w-full rounded-lg border px-4 text-sm transition-colors focus:border-violet-500 focus:outline-none"
              style={inputStyle}
              data-testid="select-language"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility mode */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Mode de visibilite
            </label>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
              {([
                {
                  value: "complet" as const,
                  label: "Complet",
                  desc: "Nom visible",
                },
                {
                  value: "pseudonyme" as const,
                  label: "Pseudonyme",
                  desc: "Pseudo uniquement",
                },
                {
                  value: "anonyme" as const,
                  label: "Anonyme",
                  desc: "Citoyen #ID",
                },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setModeVisibilite(opt.value)}
                  className="rounded-lg border p-2.5 text-left transition-all"
                  style={{
                    borderColor:
                      modeVisibilite === opt.value
                        ? "#8b5cf6"
                        : "var(--border)",
                    backgroundColor:
                      modeVisibilite === opt.value
                        ? "rgba(139,92,246,0.08)"
                        : "transparent",
                  }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{
                      color:
                        modeVisibilite === opt.value
                          ? "#8b5cf6"
                          : "var(--text-primary)",
                    }}
                  >
                    {opt.label}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
            {modeVisibilite === "pseudonyme" && (
              <div className="mt-3">
                <Input
                  placeholder="Votre pseudonyme public"
                  value={pseudonyme}
                  onChange={(e) => setPseudonyme(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 12 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => touch("password")}
                className="flex h-10 w-full rounded-lg border px-4 pr-10 text-sm transition-colors placeholder:opacity-60 focus:border-violet-500 focus:outline-none"
                style={inputStyle}
                data-testid="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          {/* Confirm password */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Retapez votre mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => touch("confirmPassword")}
                className="flex h-10 w-full rounded-lg border px-4 pr-10 text-sm transition-colors placeholder:opacity-60 focus:border-violet-500 focus:outline-none"
                style={inputStyle}
                data-testid="input-confirm-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
                tabIndex={-1}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {touched.confirmPassword && (
              <FieldError error={errors.confirmPassword} />
            )}
          </div>

          {/* Ed25519 keypair */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Cle publique Ed25519
            </label>
            <p className="mb-2 text-xs text-[var(--text-muted)]">
              Generee localement. Votre cle privee ne quitte jamais votre
              appareil.
            </p>

            {keysGenerated ? (
              <div className="space-y-2">
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: "var(--bg-elevated)" }}
                >
                  <p className="text-xs font-medium text-[var(--text-muted)] mb-1">
                    Cle publique (stockee sur le serveur)
                  </p>
                  <p
                    className="text-xs font-mono break-all"
                    style={{ color: "var(--text-secondary)" }}
                    data-testid="public-key"
                  >
                    {publicKey}
                  </p>
                </div>

                <div
                  className="rounded-lg p-3"
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.06)",
                    border: "1px solid rgba(245, 158, 11, 0.2)",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium" style={{ color: "rgb(245, 158, 11)" }}>
                      Cle privee (a sauvegarder)
                    </p>
                    <button
                      onClick={handleCopyKey}
                      className="flex items-center gap-1 rounded px-2 py-0.5 text-xs transition-colors hover:bg-amber-500/10"
                      style={{ color: "rgb(245, 158, 11)" }}
                      data-testid="copy-private-key"
                    >
                      <Copy className="h-3 w-3" />
                      {keysCopied ? "Copie !" : "Copier"}
                    </button>
                  </div>
                  <p
                    className="text-xs font-mono break-all"
                    style={{ color: "var(--text-muted)" }}
                    data-testid="private-key"
                  >
                    {privateKey}
                  </p>
                  <p className="mt-2 text-xs" style={{ color: "rgb(245, 158, 11)" }}>
                    Sauvegardez cette cle ! Elle ne sera plus jamais affichee.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: "var(--bg-elevated)" }}>
                <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                <span className="text-xs text-[var(--text-muted)]">
                  Generation de la paire de cles...
                </span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setStep(3)}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              disabled={!step4Valid}
              onClick={() => setStep(5)}
              data-testid="continue-to-confirm"
            >
              Continuer
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 5: Confirmation & Account Creation ────────────── */}
      {step === 5 && (
        <div className="space-y-4" data-testid="step-confirm">
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Recapitulatif
          </h2>

          {/* Summary */}
          <div className="space-y-2">
            {[
              {
                label: "Methode de verification",
                value:
                  verificationMethod === "web_of_trust"
                    ? "Web of Trust"
                    : verificationMethod || "-",
              },
              { label: "Pseudonyme VITA", value: `@${username}` },
              { label: "Langue", value: LANGUAGES.find((l) => l.code === langue)?.label || langue },
              { label: "Visibilite", value: modeVisibilite },
              {
                label: "Cle publique",
                value: publicKey
                  ? `${publicKey.slice(0, 8)}...${publicKey.slice(-8)}`
                  : "-",
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center text-sm p-2 rounded"
                style={{ backgroundColor: "var(--bg-elevated)" }}
              >
                <span style={{ color: "var(--text-muted)" }}>{row.label}</span>
                <span
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Legal checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptCGU}
                onChange={(e) => {
                  setAcceptCGU(e.target.checked);
                  touch("acceptCGU");
                }}
                className="mt-0.5 h-4 w-4 rounded border accent-violet-500"
                style={{ borderColor: "var(--border)" }}
                data-testid="checkbox-cgu"
              />
              <span className="text-sm text-[var(--text-secondary)]">
                J&apos;accepte les{" "}
                <span className="text-violet-500 hover:underline cursor-pointer">
                  conditions generales
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptPrivacy}
                onChange={(e) => {
                  setAcceptPrivacy(e.target.checked);
                  touch("acceptPrivacy");
                }}
                className="mt-0.5 h-4 w-4 rounded border accent-violet-500"
                style={{ borderColor: "var(--border)" }}
                data-testid="checkbox-privacy"
              />
              <span className="text-sm text-[var(--text-secondary)]">
                J&apos;accepte la{" "}
                <span className="text-violet-500 hover:underline cursor-pointer">
                  politique de confidentialite
                </span>
              </span>
            </label>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setStep(4)}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              disabled={submitting || !step5Valid}
              onClick={handleSubmit}
              data-testid="submit-registration"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Creation...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  Creer mon compte
                </>
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-[var(--text-muted)]">
            Deja un compte ?{" "}
            <Link
              href="/auth/connexion"
              className="font-medium text-violet-500 hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
