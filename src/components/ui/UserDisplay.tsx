"use client";

import type { IdentitePublique } from "@/types/auth";
import { AvatarGenere } from "@/components/modules/civis/AvatarGenere";
import { ShieldCheck } from "lucide-react";

interface UserDisplayProps {
  user: {
    id: string;
    username: string;
    identitePublique: IdentitePublique;
  };
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

const SIZES = {
  sm: { avatar: 32, text: 'text-sm', subtext: 'text-xs' },
  md: { avatar: 40, text: 'text-sm', subtext: 'text-xs' },
  lg: { avatar: 48, text: 'text-base', subtext: 'text-sm' },
};

export function UserDisplay({ user, size = 'md', showBadge }: UserDisplayProps) {
  const s = SIZES[size];
  const mode = user.identitePublique.modeVisibilite;
  const pub = user.identitePublique;

  // Determine display name and avatar
  let displayName: string;
  let avatar: React.ReactNode;

  switch (mode) {
    case 'complet': {
      const prenom = pub.prenom || '';
      const nom = pub.nom || '';
      displayName = `${prenom} ${nom}`.trim() || user.username;
      const initials = prenom && nom
        ? `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
        : user.username.slice(0, 2).toUpperCase();

      if (pub.photoProfil) {
        avatar = (
          <img
            src={pub.photoProfil}
            alt={displayName}
            className="rounded-full object-cover"
            style={{ width: s.avatar, height: s.avatar }}
          />
        );
      } else {
        avatar = (
          <div
            className="flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 text-white font-semibold"
            style={{ width: s.avatar, height: s.avatar, fontSize: s.avatar * 0.35 }}
          >
            {initials}
          </div>
        );
      }
      break;
    }
    case 'pseudonyme': {
      displayName = pub.pseudonyme || user.username;
      avatar = <AvatarGenere pseudo={displayName} size={s.avatar} />;
      break;
    }
    case 'anonyme': {
      const shortId = user.id.slice(-6);
      displayName = `Citoyen #${shortId}`;
      avatar = (
        <div
          className="flex items-center justify-center rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)]"
          style={{ width: s.avatar, height: s.avatar }}
        >
          <svg width={s.avatar * 0.5} height={s.avatar * 0.5} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      );
      break;
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="shrink-0">{avatar}</div>
      <div className="min-w-0">
        <div className={`font-medium text-[var(--text-primary)] truncate ${s.text} flex items-center gap-1`}>
          {displayName}
          {showBadge && (
            <ShieldCheck className="h-3.5 w-3.5 text-green-500 shrink-0" />
          )}
        </div>
        {mode === 'complet' && (
          <div className={`text-[var(--text-muted)] truncate ${s.subtext}`}>
            @{user.username}
          </div>
        )}
      </div>
    </div>
  );
}
