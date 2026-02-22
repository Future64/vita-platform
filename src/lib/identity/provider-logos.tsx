// Logos SVG inline pour les services d'identite
//
// Chaque logo est un composant React SVG inline pour eviter les
// requetes reseau et garantir un rendu instantane.
//
// Les couleurs respectent les chartes graphiques officielles.

import type { IdentityProviderId } from './providers/types';

interface LogoProps {
  className?: string;
}

// ── FranceConnect ────────────────────────────────────────────

export function FranceConnectLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#000091" />
      <text x="20" y="17" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="700" fontFamily="system-ui">
        France
      </text>
      <text x="20" y="28" textAnchor="middle" fill="#C92644" fontSize="8" fontWeight="700" fontFamily="system-ui">
        Connect
      </text>
    </svg>
  );
}

// ── BankID (NO, SE, FI) ──────────────────────────────────────

export function BankIDLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#183C5E" />
      <text x="20" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="700" fontFamily="system-ui">
        BankID
      </text>
    </svg>
  );
}

// ── MitID (DK) ───────────────────────────────────────────────

export function MitIDLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#0060A9" />
      <text x="20" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="700" fontFamily="system-ui">
        MitID
      </text>
    </svg>
  );
}

// ── itsme (BE) ───────────────────────────────────────────────

export function ItsmeLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#FF6B35" />
      <text x="20" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="700" fontFamily="system-ui">
        itsme
      </text>
    </svg>
  );
}

// ── German eID (DE) ──────────────────────────────────────────

export function GermanEIDLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#1a1a1a" />
      <rect x="6" y="10" width="28" height="5" rx="1" fill="#000000" />
      <rect x="6" y="17" width="28" height="5" rx="1" fill="#DD0000" />
      <rect x="6" y="24" width="28" height="5" rx="1" fill="#FFCC00" />
      <text x="20" y="38" textAnchor="middle" fill="#FFFFFF" fontSize="6" fontWeight="700" fontFamily="system-ui">
        eID
      </text>
    </svg>
  );
}

// ── Smart-ID (EE, LV, LT) ───────────────────────────────────

export function SmartIDLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#00B2A9" />
      <text x="20" y="17" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="700" fontFamily="system-ui">
        Smart
      </text>
      <text x="20" y="27" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="700" fontFamily="system-ui">
        -ID
      </text>
    </svg>
  );
}

// ── SPID (IT) ────────────────────────────────────────────────

export function SpidLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#0066CC" />
      <text x="20" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="800" fontFamily="system-ui">
        SPID
      </text>
    </svg>
  );
}

// ── DigiD (NL) ───────────────────────────────────────────────

export function DigiDLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#154273" />
      <circle cx="20" cy="16" r="5" fill="#F08200" />
      <text x="20" y="34" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="700" fontFamily="system-ui">
        DigiD
      </text>
    </svg>
  );
}

// ── Singpass (SG) ────────────────────────────────────────────

export function SingpassLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#CC0001" />
      <text x="20" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="6" fontWeight="700" fontFamily="system-ui">
        Sing
      </text>
      <text x="20" y="27" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="700" fontFamily="system-ui">
        pass
      </text>
    </svg>
  );
}

// ── Gov.br (BR) ──────────────────────────────────────────────

export function GovBrLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#1E3A8A" />
      <rect x="8" y="12" width="24" height="16" rx="2" fill="#009C3B" />
      <polygon points="20,14 32,20 20,26 8,20" fill="#FFDF00" />
      <circle cx="20" cy="20" r="4" fill="#002776" />
      <text x="20" y="38" textAnchor="middle" fill="#FFFFFF" fontSize="5.5" fontWeight="700" fontFamily="system-ui">
        Gov.br
      </text>
    </svg>
  );
}

// ── Stripe Identity ──────────────────────────────────────────

export function StripeIdentityLogo({ className }: LogoProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#0A2540" />
      <path
        d="M18.5 14.5c0-1.5 1.2-2.1 3.2-2.1 2.8 0 6.4 0.9 9.2 2.4V7.6c-3.1-1.2-6.2-1.7-9.2-1.7C16.3 5.9 12 8.7 12 14.7c0 9.3 12.8 7.8 12.8 11.8 0 1.8-1.5 2.4-3.7 2.4-3.2 0-7.3-1.3-10.5-3.1v7.3c3.6 1.5 7.2 2.2 10.5 2.2 5.6 0 9.5-2.8 9.5-8.8C30.6 17 18.5 18.8 18.5 14.5z"
        fill="#635BFF"
        transform="scale(0.55) translate(15, 12)"
      />
    </svg>
  );
}

// ── Generic eID (fallback) ───────────────────────────────────

function countryFlag(code: string): string {
  const offset = 0x1f1e6 - 65;
  return String.fromCodePoint(
    code.charCodeAt(0) + offset,
    code.charCodeAt(1) + offset
  );
}

export function GenericEIDLogo({ className, countryCode }: LogoProps & { countryCode?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="8" fill="#374151" />
      {countryCode && (
        <text x="20" y="18" textAnchor="middle" fontSize="12" fontFamily="system-ui">
          {countryFlag(countryCode)}
        </text>
      )}
      <text x="20" y="32" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="700" fontFamily="system-ui">
        eID
      </text>
    </svg>
  );
}

// ── Mapper central ───────────────────────────────────────────

const METHOD_LOGO_MAP: Record<string, React.ComponentType<LogoProps>> = {
  nbid: BankIDLogo,
  sbid: BankIDLogo,
  fbid: BankIDLogo,
  mitid: MitIDLogo,
  itsme: ItsmeLogo,
  npa: GermanEIDLogo,
  smartid: SmartIDLogo,
  spid: SpidLogo,
  digiid: DigiDLogo,
  idin: DigiDLogo,
  singpass: SingpassLogo,
  govbr: GovBrLogo,
};

const PROVIDER_LOGO_MAP: Record<string, React.ComponentType<LogoProps>> = {
  franceconnect: FranceConnectLogo,
  stripe_identity: StripeIdentityLogo,
};

/**
 * Retourne le composant logo adapte au provider et a la methode.
 *
 * Priorite : methodId > provider > fallback generique.
 */
export function ProviderLogo({
  provider,
  methodId,
  countryCode,
  className,
}: {
  provider: IdentityProviderId;
  methodId?: string;
  countryCode?: string;
  className?: string;
}) {
  // 1. Chercher par methodId
  if (methodId && METHOD_LOGO_MAP[methodId]) {
    const Logo = METHOD_LOGO_MAP[methodId];
    return <Logo className={className} />;
  }

  // 2. Chercher par provider
  if (PROVIDER_LOGO_MAP[provider]) {
    const Logo = PROVIDER_LOGO_MAP[provider];
    return <Logo className={className} />;
  }

  // 3. Fallback generique
  return <GenericEIDLogo className={className} countryCode={countryCode} />;
}
