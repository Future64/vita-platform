import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="hidden lg:block border-t py-4"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-center gap-3 px-4 text-xs text-[var(--text-muted)]">
        <Link href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">
          Politique de confidentialite
        </Link>
        <span aria-hidden="true">&middot;</span>
        <Link href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">
          Conditions generales
        </Link>
        <span aria-hidden="true">&middot;</span>
        <span>&copy; {new Date().getFullYear()} VITA</span>
      </div>
    </footer>
  );
}
