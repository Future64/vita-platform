"use client";

// Generateur d'avatar deterministe a partir d'un pseudo
// Utilise un hash simple pour generer des formes et couleurs SVG

const PALETTE = [
  '#8b5cf6', '#ec4899', '#06b6d4', '#10b981',
  '#f59e0b', '#ef4444', '#6366f1', '#14b8a6',
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getColorFromHash(hash: number, offset: number): string {
  return PALETTE[(hash + offset) % PALETTE.length];
}

interface AvatarGenereProps {
  pseudo: string;
  size?: number;
  className?: string;
}

export function AvatarGenere({ pseudo, size = 120, className }: AvatarGenereProps) {
  const hash = hashCode(pseudo || 'anonymous');
  const bgColor = getColorFromHash(hash, 0);
  const color1 = getColorFromHash(hash, 2);
  const color2 = getColorFromHash(hash, 4);
  const color3 = getColorFromHash(hash, 6);

  // Deterministic positions from hash
  const cx1 = 25 + (hash % 50);
  const cy1 = 25 + ((hash >> 4) % 50);
  const cx2 = 20 + ((hash >> 8) % 60);
  const cy2 = 20 + ((hash >> 12) % 60);
  const r1 = 15 + (hash % 20);
  const r2 = 10 + ((hash >> 6) % 25);
  const rotation = hash % 360;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ borderRadius: '50%' }}
    >
      <rect width="100" height="100" fill={bgColor} opacity="0.15" />
      <circle cx={cx1} cy={cy1} r={r1} fill={color1} opacity="0.6" />
      <circle cx={cx2} cy={cy2} r={r2} fill={color2} opacity="0.5" />
      <rect
        x={30 + (hash % 20)}
        y={30 + ((hash >> 3) % 20)}
        width={20 + (hash % 15)}
        height={20 + ((hash >> 5) % 15)}
        fill={color3}
        opacity="0.4"
        transform={`rotate(${rotation} 50 50)`}
        rx="4"
      />
      {/* Initials overlay */}
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize="28"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
      >
        {pseudo.slice(0, 2).toUpperCase()}
      </text>
    </svg>
  );
}
