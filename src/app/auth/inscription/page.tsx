"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

// --- Countries list ---

const COUNTRIES = [
  "Afghanistan", "Afrique du Sud", "Albanie", "Algerie", "Allemagne", "Andorre",
  "Angola", "Argentine", "Armenie", "Australie", "Autriche", "Azerbaidjan",
  "Belgique", "Benin", "Bolivie", "Bosnie-Herzegovine", "Bresil", "Bulgarie",
  "Burkina Faso", "Burundi", "Cambodge", "Cameroun", "Canada", "Cap-Vert",
  "Chili", "Chine", "Chypre", "Colombie", "Comores", "Congo", "Coree du Nord",
  "Coree du Sud", "Costa Rica", "Cote d'Ivoire", "Croatie", "Cuba", "Danemark",
  "Djibouti", "Egypte", "Emirats Arabes Unis", "Equateur", "Espagne", "Estonie",
  "Etats-Unis", "Ethiopie", "Finlande", "France", "Gabon", "Georgie", "Ghana",
  "Grece", "Guatemala", "Guinee", "Haiti", "Honduras", "Hongrie", "Inde",
  "Indonesie", "Irak", "Iran", "Irlande", "Islande", "Israel", "Italie",
  "Jamaique", "Japon", "Jordanie", "Kazakhstan", "Kenya", "Koweit",
  "Lettonie", "Liban", "Libye", "Lituanie", "Luxembourg", "Madagascar",
  "Malaisie", "Mali", "Malte", "Maroc", "Maurice", "Mauritanie", "Mexique",
  "Moldavie", "Monaco", "Mongolie", "Montenegro", "Mozambique", "Myanmar",
  "Nepal", "Nicaragua", "Niger", "Nigeria", "Norvege", "Nouvelle-Zelande",
  "Oman", "Ouganda", "Pakistan", "Palestine", "Panama", "Paraguay",
  "Pays-Bas", "Perou", "Philippines", "Pologne", "Portugal", "Qatar",
  "Republique Dominicaine", "Republique Tcheque", "Roumanie", "Royaume-Uni",
  "Russie", "Rwanda", "Senegal", "Serbie", "Singapour", "Slovaquie",
  "Slovenie", "Somalie", "Soudan", "Sri Lanka", "Suede", "Suisse",
  "Syrie", "Tanzanie", "Tchad", "Thailande", "Togo", "Tunisie", "Turquie",
  "Ukraine", "Uruguay", "Venezuela", "Vietnam", "Yemen", "Zambie", "Zimbabwe",
];

// --- Validation helpers ---

function validateUsername(value: string): string | null {
  if (value.length < 3) return "Minimum 3 caracteres";
  if (value.length > 30) return "Maximum 30 caracteres";
  if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Lettres, chiffres et underscores uniquement";
  return null;
}

function validateEmail(value: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Format email invalide";
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

function validateAge(dateStr: string): string | null {
  if (!dateStr) return "Date de naissance requise";
  const birth = new Date(dateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  if (age < 16) return "Vous devez avoir au moins 16 ans";
  return null;
}

// --- PasswordStrength component ---

function PasswordStrength({ password }: { password: string }) {
  const checks = getPasswordChecks(password);
  const strength = getPasswordStrength(checks);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{
                backgroundColor: i <= strength.level ? strength.color : "var(--bg-elevated)",
              }}
            />
          ))}
        </div>
        <span className="text-xs font-medium" style={{ color: strength.color }}>
          {strength.label}
        </span>
      </div>
      {/* Criteria */}
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-1.5 text-xs">
            {check.valid ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3" style={{ color: "var(--text-muted)" }} />
            )}
            <span style={{ color: check.valid ? "var(--text-secondary)" : "var(--text-muted)" }}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Field error ---

function FieldError({ error }: { error: string | null }) {
  if (!error) return null;
  return <p className="mt-1 text-xs text-red-400">{error}</p>;
}

// --- Main page ---

export default function InscriptionPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [pays, setPays] = useState("");
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function touch(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  // Errors
  const errors = useMemo(() => {
    const passwordChecks = getPasswordChecks(password);
    const allPasswordValid = passwordChecks.every((c) => c.valid);
    return {
      prenom: prenom.length > 0 ? null : "Prenom requis",
      nom: nom.length > 0 ? null : "Nom requis",
      username: username.length > 0 ? validateUsername(username) : "Nom d'utilisateur requis",
      email: email.length > 0 ? validateEmail(email) : "Email requis",
      password: password.length > 0 ? (allPasswordValid ? null : "Le mot de passe ne respecte pas tous les criteres") : "Mot de passe requis",
      confirmPassword: confirmPassword.length > 0
        ? (confirmPassword === password ? null : "Les mots de passe ne correspondent pas")
        : "Confirmation requise",
      dateNaissance: dateNaissance ? validateAge(dateNaissance) : "Date de naissance requise",
      pays: pays ? null : "Pays requis",
      acceptCGU: acceptCGU ? null : "Vous devez accepter les conditions",
      acceptPrivacy: acceptPrivacy ? null : "Vous devez accepter la politique de confidentialite",
    };
  }, [prenom, nom, username, email, password, confirmPassword, dateNaissance, pays, acceptCGU, acceptPrivacy]);

  const isValid = Object.values(errors).every((e) => e === null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Touch all fields to show errors
    setTouched({
      prenom: true, nom: true, username: true, email: true,
      password: true, confirmPassword: true, dateNaissance: true,
      pays: true, acceptCGU: true, acceptPrivacy: true,
    });

    if (!isValid) return;

    setSubmitting(true);
    setGlobalError(null);

    const success = register({
      prenom,
      nom,
      username,
      email,
      password,
      dateNaissance,
      pays,
    });

    if (success) {
      router.push("/panorama");
    } else {
      setGlobalError("Un compte avec cet email ou ce nom d'utilisateur existe deja.");
      setSubmitting(false);
    }
  }

  const inputStyle = {
    borderColor: "var(--border)",
    backgroundColor: "var(--bg-elevated)",
    color: "var(--text-primary)",
  };

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-[var(--text-primary)]">
        Creer un compte
      </h1>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        Rejoignez la communaute VITA
      </p>

      {globalError && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Prenom + Nom */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Prenom
            </label>
            <Input
              placeholder="Jean"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              onBlur={() => touch("prenom")}
            />
            {touched.prenom && <FieldError error={errors.prenom} />}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
              Nom
            </label>
            <Input
              placeholder="Dupont"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              onBlur={() => touch("nom")}
            />
            {touched.nom && <FieldError error={errors.nom} />}
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
            Nom d&apos;utilisateur
          </label>
          <Input
            placeholder="jean_dupont"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            onBlur={() => touch("username")}
          />
          {touched.username && <FieldError error={errors.username} />}
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
            Email
          </label>
          <Input
            type="email"
            placeholder="jean@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => touch("email")}
          />
          {touched.email && <FieldError error={errors.email} />}
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
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {touched.confirmPassword && <FieldError error={errors.confirmPassword} />}
        </div>

        {/* Date de naissance */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
            Date de naissance
          </label>
          <input
            type="date"
            value={dateNaissance}
            onChange={(e) => setDateNaissance(e.target.value)}
            onBlur={() => touch("dateNaissance")}
            className="flex h-10 w-full rounded-lg border px-4 text-sm transition-colors focus:border-violet-500 focus:outline-none"
            style={inputStyle}
          />
          {touched.dateNaissance && <FieldError error={errors.dateNaissance} />}
        </div>

        {/* Pays */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
            Pays de residence
          </label>
          <select
            value={pays}
            onChange={(e) => setPays(e.target.value)}
            onBlur={() => touch("pays")}
            className="flex h-10 w-full rounded-lg border px-4 text-sm transition-colors focus:border-violet-500 focus:outline-none"
            style={inputStyle}
          >
            <option value="">Selectionnez un pays...</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {touched.pays && <FieldError error={errors.pays} />}
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptCGU}
              onChange={(e) => { setAcceptCGU(e.target.checked); touch("acceptCGU"); }}
              className="mt-0.5 h-4 w-4 rounded border accent-violet-500"
              style={{ borderColor: "var(--border)" }}
            />
            <span className="text-sm text-[var(--text-secondary)]">
              J&apos;accepte les{" "}
              <span className="text-violet-500 hover:underline cursor-pointer">
                conditions generales d&apos;utilisation
              </span>
            </span>
          </label>
          {touched.acceptCGU && <FieldError error={errors.acceptCGU} />}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptPrivacy}
              onChange={(e) => { setAcceptPrivacy(e.target.checked); touch("acceptPrivacy"); }}
              className="mt-0.5 h-4 w-4 rounded border accent-violet-500"
              style={{ borderColor: "var(--border)" }}
            />
            <span className="text-sm text-[var(--text-secondary)]">
              J&apos;accepte la{" "}
              <span className="text-violet-500 hover:underline cursor-pointer">
                politique de confidentialite
              </span>
            </span>
          </label>
          {touched.acceptPrivacy && <FieldError error={errors.acceptPrivacy} />}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          size="lg"
          disabled={submitting}
        >
          {submitting ? "Creation en cours..." : "S'inscrire"}
        </Button>
      </form>

      {/* Link to login */}
      <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
        Deja un compte ?{" "}
        <Link href="/auth/connexion" className="font-medium text-violet-500 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
