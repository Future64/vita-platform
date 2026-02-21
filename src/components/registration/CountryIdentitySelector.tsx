"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  getAllCountryCodes,
  COUNTRY_DISPLAY_NAMES,
} from "@/lib/identity/providers/country-map";
import { useIdentityProviders } from "@/hooks/useIdentityProviders";
import type { IdentityProviderOption } from "@/hooks/useIdentityProviders";

// ── Drapeaux emoji ───────────────────────────────────────────────

function countryFlag(code: string): string {
  const offset = 0x1f1e6 - 65;
  return String.fromCodePoint(
    code.charCodeAt(0) + offset,
    code.charCodeAt(1) + offset
  );
}

// ── Badge eIDAS ──────────────────────────────────────────────────

function AssuranceBadge({ level }: { level: string }) {
  const config: Record<string, { bg: string; label: string }> = {
    high: { bg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", label: "eIDAS eleve" },
    substantial: { bg: "bg-violet-500/20 text-violet-400 border-violet-500/30", label: "eIDAS substantiel" },
    low: { bg: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "eIDAS faible" },
  };
  const { bg, label } = config[level] || config.low;

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[0.5625rem] font-medium leading-tight", bg)}>
      {label}
    </span>
  );
}

// ── Icone de categorie ───────────────────────────────────────────

function CategoryIcon({ category }: { category: string }) {
  if (category === "state") {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21" />
      </svg>
    );
  }
  if (category === "banking") {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    );
  }
  if (category === "fallback") {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    );
  }
  return null;
}

// ── Spinner ──────────────────────────────────────────────────────

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />;
}

// ── Props ────────────────────────────────────────────────────────

interface CountryIdentitySelectorProps {
  /** Callback apres succes de la verification */
  onVerified?: () => void;
  /** Pays pre-selectionne */
  defaultCountry?: string;
  /** Desactive le composant */
  disabled?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
}

// ── Composant principal ──────────────────────────────────────────

export function CountryIdentitySelector({
  onVerified,
  defaultCountry = "",
  disabled = false,
  className,
}: CountryIdentitySelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry.toUpperCase());
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [successProvider, setSuccessProvider] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { providers, available, comingSoon, hasEid } = useIdentityProviders(selectedCountry);
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
    setSuccessProvider(null);
  }, []);

  const handleProviderClick = useCallback(
    async (entry: IdentityProviderOption) => {
      if (loadingProvider || disabled || entry.status !== "available") return;

      setLoadingProvider(entry.key);

      try {
        let endpoint: string;
        let body: Record<string, string>;

        if (entry.provider === "franceconnect") {
          endpoint = "/api/auth/authorize/fc";
          body = { callbackUrl: "/api/auth/callback/fc" };
        } else if (entry.provider === "signicat") {
          endpoint = "/api/auth/authorize/signicat";
          body = { countryCode: selectedCountry, methodId: entry.methodId || "" };
        } else {
          // Web of Trust — redirection directe vers le parrainage
          window.location.href = "/civis/verification?method=web_of_trust";
          return;
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error("Impossible d'initier la verification");
        }

        const data = await response.json();

        setSuccessProvider(entry.key);
        onVerified?.();

        // Redirection vers le provider
        window.location.href = data.authorizationUrl;
      } catch {
        setLoadingProvider(null);
      }
    },
    [loadingProvider, disabled, selectedCountry, onVerified]
  );

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

      {/* ── Selecteur de pays (searchable dropdown) ────────────── */}
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
                  setSuccessProvider(null);
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
                  {hasEidForCountry(code) && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="eID disponible" />
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Providers disponibles ──────────────────────────────── */}
      {selectedCountry && providers.length > 0 && (
        <div className="flex flex-col gap-3">
          {/* Providers disponibles */}
          {available.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[0.6875rem] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Methodes de verification
              </p>

              {available.map((entry) => (
                <ProviderButton
                  key={entry.key}
                  entry={entry}
                  loading={loadingProvider === entry.key}
                  success={successProvider === entry.key}
                  disabled={disabled || (loadingProvider !== null && loadingProvider !== entry.key)}
                  onClick={() => handleProviderClick(entry)}
                />
              ))}
            </div>
          )}

          {/* Providers a venir */}
          {comingSoon.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[0.6875rem] font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Bientot disponible
              </p>

              {comingSoon.map((entry) => (
                <ProviderButton
                  key={entry.key}
                  entry={entry}
                  loading={false}
                  success={false}
                  disabled
                  onClick={() => {}}
                />
              ))}
            </div>
          )}

          {/* Hint si pas d'eID */}
          {!hasEid && (
            <p className="rounded-lg px-3 py-2 text-center text-xs" style={{ color: "var(--text-muted)", backgroundColor: "rgba(124, 58, 237, 0.05)" }}>
              L&apos;identite numerique n&apos;est pas encore disponible pour votre pays.
              Vous pouvez utiliser le parrainage (Web of Trust) en attendant.
            </p>
          )}
        </div>
      )}

      {/* ── Etat initial (pas de pays) ─────────────────────────── */}
      {!selectedCountry && (
        <div className="flex flex-col items-center gap-3 py-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.15))" }}
          >
            <svg className="h-6 w-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
            Commencez par choisir votre pays de residence
            <br />
            pour voir les options de verification disponibles.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Sous-composant : bouton provider ─────────────────────────────

interface ProviderButtonProps {
  entry: IdentityProviderOption;
  loading: boolean;
  success: boolean;
  disabled: boolean;
  onClick: () => void;
}

function ProviderButton({ entry, loading, success, disabled, onClick }: ProviderButtonProps) {
  const isComingSoon = entry.status === "coming_soon";
  const isFranceConnect = entry.provider === "franceconnect";
  const isWebOfTrust = entry.category === "fallback";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isComingSoon}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl border px-4 py-3",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50",
        "disabled:cursor-not-allowed",
        isComingSoon && "opacity-50",
        success && "border-emerald-500/50 bg-emerald-500/10",
        !success && !isComingSoon && !disabled && "hover:-translate-y-0.5",
        isFranceConnect && !success
          ? "bg-[#000091]/80 border-[#000091] text-white hover:bg-[#000091]"
          : isWebOfTrust && !success
            ? "border-amber-500/30 hover:border-amber-500/50"
            : !success
              ? "border-[var(--border-subtle)] hover:border-violet-500/50"
              : "",
      )}
      style={
        !isFranceConnect && !success
          ? { backgroundColor: "var(--bg-card)" }
          : undefined
      }
    >
      {/* Icone categorie */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          isFranceConnect
            ? "bg-white/10"
            : isWebOfTrust
              ? "bg-amber-500/10"
              : "bg-violet-500/10"
        )}
      >
        {isFranceConnect ? (
          <span className="flex h-5 w-5 overflow-hidden rounded-sm" aria-hidden="true">
            <span className="h-full w-1/3 bg-[#000091]" />
            <span className="h-full w-1/3 bg-white" />
            <span className="h-full w-1/3 bg-[#E1000F]" />
          </span>
        ) : (
          <span className={cn(
            isWebOfTrust ? "text-amber-400" : "text-violet-400"
          )}>
            <CategoryIcon category={entry.category} />
          </span>
        )}
      </div>

      {/* Texte */}
      <div className="flex flex-1 flex-col items-start gap-0.5 min-w-0">
        <span
          className={cn(
            "text-sm font-semibold leading-tight",
            isFranceConnect ? "text-white" : ""
          )}
          style={!isFranceConnect ? { color: "var(--text-primary)" } : undefined}
        >
          {entry.displayName}
        </span>
        <span
          className="text-[0.6875rem] leading-tight truncate max-w-full"
          style={{ color: isFranceConnect ? "rgba(255,255,255,0.7)" : "var(--text-muted)" }}
        >
          {entry.description}
        </span>
      </div>

      {/* Droite : badge + status */}
      <div className="flex shrink-0 items-center gap-2">
        {!isWebOfTrust && <AssuranceBadge level={entry.assuranceLevel} />}

        {loading ? (
          <Spinner />
        ) : success ? (
          <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : isComingSoon ? (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[0.5625rem] font-medium" style={{ color: "var(--text-muted)" }}>
            Bientot
          </span>
        ) : (
          <svg
            className={cn(
              "h-4 w-4 transition-transform",
              !disabled && "group-hover:translate-x-0.5"
            )}
            style={{ color: isFranceConnect ? "rgba(255,255,255,0.5)" : "var(--text-muted)" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        )}
      </div>
    </button>
  );
}

// ── Helper inline (evite import circulaire) ──────────────────────

const _eidCountriesCache = new Set<string>();

function hasEidForCountry(code: string): boolean {
  if (_eidCountriesCache.size === 0) {
    // Pays connus avec eID disponible
    const eidCountries = ["FR", "DE", "BE", "DK", "NO", "SE", "FI", "EE", "LV", "LT", "IT", "NL"];
    for (const c of eidCountries) _eidCountriesCache.add(c);
  }
  return _eidCountriesCache.has(code);
}
