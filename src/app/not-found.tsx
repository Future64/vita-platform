import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ backgroundColor: "var(--bg-base)" }}>
      <h1 className="mb-2 bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-8xl font-extrabold text-transparent sm:text-9xl">
        404
      </h1>
      <p className="mb-1 text-lg font-semibold text-[var(--text-primary)]">
        Page introuvable
      </p>
      <p className="mb-8 text-sm text-[var(--text-muted)]">
        Cette page n&apos;existe pas ou a ete deplacee.
      </p>
      <Link
        href="/panorama"
        className="rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Retour au Panorama
      </Link>
    </div>
  );
}
