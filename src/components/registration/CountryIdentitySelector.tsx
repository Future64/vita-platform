"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  getAllCountryCodes,
  COUNTRY_DISPLAY_NAMES,
  hasEidProvider,
} from "@/lib/identity/providers/country-map";
import { useIdentityProviders } from "@/hooks/useIdentityProviders";
import { ProviderLogo, StripeIdentityLogo } from "@/lib/identity/provider-logos";
import { FranceConnectButton } from "./FranceConnectButton";
import { SignicatButton } from "./SignicatButton";
import { StripeIdentityButton } from "./StripeIdentityButton";

// ── Drapeaux emoji ───────────────────────────────────────────

function countryFlag(code: string): string {
  const offset = 0x1f1e6 - 65;
  return String.fromCodePoint(
    code.charCodeAt(0) + offset,
    code.charCodeAt(1) + offset
  );
}

// ── Choix de methode ─────────────────────────────────────────

type ChosenMethod = "national" | "stripe" | null;

// ── Props ────────────────────────────────────────────────────

interface CountryIdentitySelectorProps {
  /** Pays pre-selectionne */
  defaultCountry?: string;
  /** Desactive le composant */
  disabled?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
  /** URL de retour apres verification OAuth (ex: '/auth/register') */
  returnTo?: string;
}

// ── Composant principal ──────────────────────────────────────

export function CountryIdentitySelector({
  defaultCountry = "",
  disabled = false,
  className,
  returnTo,
}: CountryIdentitySelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry.toUpperCase());
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chosenMethod, setChosenMethod] = useState<ChosenMethod>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { nationalProviders, stripeProvider, hasEid } = useIdentityProviders(selectedCountry);
  const allCountries = useMemo(() => getAllCountryCodes(), []);

  // Filtre les pays par recherche
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return allCountries;
    const q = searchQuery.toLowerCase();
    return allCountries.filter((code) => {
      const name = (COUNTRY_DISPLAY_NAMES[code] || "").toLowerCase();
      return name.includes(q) || code.toLowerCase().includes(q);
    });
  }, [allCountries, searchQuery]);

  // Ferme le dropdown quand on clique a l'exterieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCountrySelect = useCallback((code: string) => {
    setSelectedCountry(code);
    setSearchQuery("");
    setIsDropdownOpen(false);
    setChosenMethod(null);
  }, []);

  const toggleMethod = useCallback((method: ChosenMethod) => {
    setChosenMethod((prev) => (prev === method ? null : method));
  }, []);

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {/* ── Titre avec gradient ────────────────────────────────── */}
      <div className="text-center">
        <h2 className="text-lg font-bold bg-gradient-to-r from-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent">
          Verification d&apos;identite
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Selectionnez votre pays pour afficher les methodes de verification disponibles
        </p>
      </div>

      {/* ── Bandeau "pourquoi verifier" ─────────────────────────── */}
      <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/15">
            <svg className="h-4 w-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-violet-400">
            Pourquoi verifier votre identite ?
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2.5">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10 mt-0.5">
              <svg className="h-3 w-3 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21" />
              </svg>
            </div>
            <p className="text-[0.6875rem] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--text-primary)" }}>Principe fondamental de VITA :</strong>{" "}
              chaque humain recoit 1 Ѵ par jour. Sans verification, une personne pourrait creer des centaines de comptes et capter injustement la richesse commune.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10 mt-0.5">
              <svg className="h-3 w-3 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <p className="text-[0.6875rem] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--text-primary)" }}>Votre identite reste privee.</strong>{" "}
              Ni votre nom, ni votre prenom, ni votre date de naissance ne sont stockes. Seule une empreinte cryptographique anonyme est conservee — mathematiquement irreversible.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10 mt-0.5">
              <svg className="h-3 w-3 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
              </svg>
            </div>
            <p className="text-[0.6875rem] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Inscrit dans la Constitution VITA :{" "}
              <em className="text-violet-400">&laquo; 1 humain = 1 compte = 1 Ѵ/jour &raquo;</em>.
              Cette regle ne souffre aucune exception.
            </p>
          </div>
        </div>
      </div>

      {/* ── Selecteur de pays (searchable dropdown) ────────────── */}
      <div>
        <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Votre pays de residence
        </p>
        <div ref={dropdownRef} className="relative">
          {/* Input de recherche / affichage du pays */}
          <div
            data-testid="country-dropdown"
            className={cn(
              "flex items-center gap-2 rounded-xl border px-3 py-2.5 cursor-pointer",
              "transition-all duration-200",
              isDropdownOpen
                ? "border-violet-500 ring-2 ring-violet-500/20"
                : "border-[var(--border-subtle)] hover:border-violet-500/50",
              disabled && "cursor-not-allowed opacity-50",
            )}
            style={{ backgroundColor: "var(--bg-card)" }}
            onClick={() => {
              if (!disabled) {
                setIsDropdownOpen(!isDropdownOpen);
                setTimeout(() => inputRef.current?.focus(), 0);
              }
            }}
          >
            {selectedCountry ? (
              <>
                <span className="text-lg leading-none" aria-hidden="true">
                  {countryFlag(selectedCountry)}
                </span>
                <span className="flex-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {COUNTRY_DISPLAY_NAMES[selectedCountry] || selectedCountry}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCountry("");
                    setSearchQuery("");
                    setChosenMethod(null);
                  }}
                  className="rounded p-0.5 transition-colors hover:bg-white/10"
                  style={{ color: "var(--text-muted)" }}
                  aria-label="Changer de pays"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <svg className="h-4 w-4 shrink-0" style={{ color: "var(--text-muted)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  ref={inputRef}
                  data-testid="country-search"
                  type="text"
                  placeholder="Rechercher un pays..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  disabled={disabled}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
                  style={{ color: "var(--text-primary)" }}
                />
              </>
            )}
            {/* Chevron */}
            <svg
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-200",
                isDropdownOpen && "rotate-180"
              )}
              style={{ color: "var(--text-muted)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Dropdown liste des pays */}
          {isDropdownOpen && (
            <div
              className={cn(
                "absolute z-50 mt-1 w-full rounded-xl border shadow-xl",
                "max-h-56 overflow-y-auto overscroll-contain"
              )}
              style={{
                backgroundColor: "var(--bg-secondary, #111118)",
                borderColor: "var(--border-subtle)",
              }}
            >
              {!selectedCountry && !searchQuery && (
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Filtrer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="sticky top-0 w-full border-b bg-transparent px-3 py-2 text-sm outline-none"
                  style={{
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                    backgroundColor: "var(--bg-secondary, #111118)",
                  }}
                />
              )}

              {filteredCountries.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  Aucun pays trouve
                </div>
              ) : (
                filteredCountries.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleCountrySelect(code)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
                      "hover:bg-violet-500/10",
                      code === selectedCountry && "bg-violet-500/20"
                    )}
                    style={{ color: "var(--text-primary)" }}
                  >
                    <span className="text-base leading-none">{countryFlag(code)}</span>
                    <span className="flex-1">{COUNTRY_DISPLAY_NAMES[code] || code}</span>
                    {/* Indicateur eID disponible */}
                    {hasEidProvider(code) && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="eID disponible" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Options de verification (cartes depliables) ─────────── */}
      {selectedCountry && (
        <div className="flex flex-col gap-3">

          {/* Option A — Service national (si disponible) */}
          {hasEid && nationalProviders.length > 0 && (
            <OptionCard
              selected={chosenMethod === "national"}
              onClick={() => toggleMethod("national")}
              recommended
              badge={
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[0.625rem] font-semibold text-emerald-400">
                  Gratuit
                </span>
              }
              logo={
                <ProviderLogo
                  provider={nationalProviders[0].provider}
                  methodId={nationalProviders[0].methodId}
                  countryCode={selectedCountry}
                  className="h-9 w-9 rounded-lg"
                />
              }
              title={nationalProviders.length === 1
                ? nationalProviders[0].displayName
                : `${nationalProviders.length} methodes disponibles`
              }
              subtitle={nationalProviders[0].description}
            >
              {/* Contenu deplie */}
              <SecurityGuarantees />

              <p
                className="mt-3 text-[0.6875rem] leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                Vous serez redirige vers le service officiel de votre pays.
                Connectez-vous avec vos identifiants habituels.
              </p>

              <div className="mt-3">
                {/* FranceConnect */}
                {nationalProviders.some((p) => p.provider === "franceconnect") && (
                  <FranceConnectButton disabled={disabled} />
                )}

                {/* Signicat providers */}
                {nationalProviders
                  .filter((p) => p.provider === "signicat")
                  .map((entry) => (
                    <div key={entry.key} className={nationalProviders.length > 1 ? "mt-2" : ""}>
                      <SignicatButton
                        countryCode={selectedCountry}
                        methodId={entry.methodId || ""}
                        displayName={entry.displayName}
                        description={entry.description}
                        assuranceLevel={entry.assuranceLevel}
                        returnTo={returnTo}
                        disabled={disabled}
                      />
                    </div>
                  ))
                }
              </div>

              {/* Note officielle */}
              <div className="mt-3">
                {nationalProviders[0].provider === "franceconnect" && (
                  <p className="text-[0.625rem] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    Service officiel du gouvernement francais —{" "}
                    <a href="https://franceconnect.gouv.fr" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                      franceconnect.gouv.fr
                    </a>
                  </p>
                )}
                {nationalProviders[0].provider === "signicat" && (
                  <p className="text-[0.625rem] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    Identite numerique nationale certifiee eIDAS — opere par{" "}
                    <a href="https://www.signicat.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                      Signicat
                    </a>
                  </p>
                )}
              </div>
            </OptionCard>
          )}

          {/* Separateur "OU" (si deux options) */}
          {hasEid && (
            <div className="flex items-center gap-3">
              <div className="h-px flex-1" style={{ backgroundColor: "var(--border-subtle)" }} />
              <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>OU</span>
              <div className="h-px flex-1" style={{ backgroundColor: "var(--border-subtle)" }} />
            </div>
          )}

          {/* Option B — Stripe Identity (toujours disponible) */}
          {stripeProvider && (
            <OptionCard
              selected={chosenMethod === "stripe"}
              onClick={() => toggleMethod("stripe")}
              recommended={false}
              badge={
                <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[0.625rem] font-semibold text-amber-400">
                  2,00 &euro;
                </span>
              }
              logo={<StripeIdentityLogo className="h-9 w-9 rounded-lg" />}
              title="Stripe Identity"
              subtitle="Scan de document d&apos;identite + selfie — Valable pour tous les pays"
            >
              {/* Explication pourquoi c'est payant */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <p className="text-xs font-semibold text-amber-400 mb-1.5">
                  Pourquoi ce service est payant ?
                </p>
                <p
                  className="text-[0.6875rem] leading-relaxed"
                  style={{ color: "var(--text-muted)" }}
                >
                  Contrairement aux services d&apos;identite nationaux finances par les Etats,
                  Stripe Identity est une entreprise privee qui facture la verification.
                  Ce montant de <strong className="text-amber-400">2,00 &euro;</strong> est
                  collecte directement par Stripe — VITA ne le percoit pas.
                </p>
                <p
                  className="mt-1.5 text-[0.6875rem] leading-relaxed italic"
                  style={{ color: "var(--text-muted)" }}
                >
                  Ce cout unique, inferieur au prix d&apos;un cafe, protege pour toujours
                  l&apos;integrite de la communaute VITA.
                </p>
              </div>

              <div className="mt-3">
                <SecurityGuarantees />
              </div>

              <div className="mt-3">
                <StripeIdentityButton
                  countryCode={selectedCountry}
                  disabled={disabled}
                />
              </div>

              <p className="mt-2 text-center text-[0.625rem]" style={{ color: "var(--text-muted)" }}>
                Opere par{" "}
                <a href="https://stripe.com/identity" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                  Stripe
                </a>
                {" "}(stripe.com/identity) — certifie SOC 2 Type II
              </p>
            </OptionCard>
          )}
        </div>
      )}
    </div>
  );
}

// ── Carte de methode depliable ───────────────────────────────

interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  recommended: boolean;
  badge: React.ReactNode;
  logo: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

function OptionCard({
  selected,
  onClick,
  recommended,
  badge,
  logo,
  title,
  subtitle,
  children,
}: OptionCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-all duration-200 backdrop-blur-sm",
        selected
          ? "border-violet-500/50 bg-violet-500/[0.06]"
          : "border-[var(--border-subtle)] hover:border-violet-500/30",
      )}
      style={!selected ? { backgroundColor: "var(--bg-card)" } : undefined}
    >
      {/* En-tete cliquable */}
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 text-left focus-visible:outline-none"
      >
        {/* Logo */}
        <div className="shrink-0">{logo}</div>

        {/* Infos */}
        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </span>
            {recommended && (
              <span className="rounded-full border border-violet-500/40 bg-violet-500/20 px-2 py-px text-[0.5625rem] font-semibold text-violet-400">
                Recommande
              </span>
            )}
          </div>
          <span
            className="text-[0.6875rem] leading-tight truncate max-w-full"
            style={{ color: "var(--text-muted)" }}
          >
            {subtitle}
          </span>
        </div>

        {/* Badge prix + chevron */}
        <div className="flex shrink-0 items-center gap-2.5">
          {badge}
          <svg
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              selected && "rotate-180"
            )}
            style={{ color: "var(--text-muted)" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Contenu deplie */}
      {selected && (
        <div
          className="mt-4 border-t pt-4"
          style={{ borderColor: "var(--border-subtle)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ── Garanties de securite reutilisables ──────────────────────

function SecurityGuarantees() {
  const items = [
    {
      icon: (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      ),
      text: "Nom, prenom, date de naissance jamais stockes",
    },
    {
      icon: (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a48.667 48.667 0 00-1.242 7.244M12 12.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      text: "Empreinte cryptographique irreversible",
    },
    {
      icon: (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      text: "Donnees jamais partagees ni vendues",
    },
    {
      icon: (
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      text: "Conforme RGPD — droit d'acces garanti",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => (
        <div
          key={item.text}
          className="flex items-start gap-2 rounded-lg border border-[var(--border-subtle)] px-2.5 py-2"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.5)" }}
        >
          <span className="mt-0.5 shrink-0 text-violet-400">{item.icon}</span>
          <span className="text-[0.625rem] leading-snug" style={{ color: "var(--text-muted)" }}>
            {item.text}
          </span>
        </div>
      ))}
    </div>
  );
}
