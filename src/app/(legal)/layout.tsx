import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-base)" }}>
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 text-sm font-extrabold text-white">
              Ѵ
            </div>
            <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-xl font-bold text-transparent">
              VITA
            </span>
          </Link>
          <Link
            href="/auth/connexion"
            className="text-sm font-medium text-violet-500 hover:underline"
          >
            Connexion
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t py-6" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-4 px-4 text-xs text-[var(--text-muted)]">
          <Link href="/privacy" className="hover:text-[var(--text-secondary)]">Politique de confidentialite</Link>
          <span>|</span>
          <Link href="/terms" className="hover:text-[var(--text-secondary)]">Conditions generales</Link>
          <span>|</span>
          <span>&copy; {new Date().getFullYear()} VITA</span>
        </div>
      </footer>
    </div>
  );
}
