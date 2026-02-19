"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  SearchX,
  Clock,
  Trash2,
  BarChart3,
  Vote,
  BookOpen,
  Hammer,
  User,
  Wallet,
  Calculator,
  Bell,
  Settings,
  Shield,
  FileText,
  Scroll,
  SlidersHorizontal,
  Archive,
  History,
  GitBranch,
  GitMerge,
  GitCommit,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { search, getQuickAccessPages } from "@/lib/searchIndex";
import type { SearchResult, SearchResultType } from "@/types/search";

// ============================================================
// ICON MAP
// ============================================================

const ICON_MAP: Record<string, LucideIcon> = {
  BarChart3,
  Vote,
  BookOpen,
  Hammer,
  User,
  Wallet,
  Calculator,
  Bell,
  Settings,
  Shield,
  FileText,
  Scroll,
  SlidersHorizontal,
  Archive,
  History,
  GitBranch,
  GitMerge,
  GitCommit,
  Search,
};

// ============================================================
// FILTER CHIPS
// ============================================================

const FILTER_OPTIONS: { label: string; value: SearchResultType | "all" }[] = [
  { label: "Tous", value: "all" },
  { label: "Pages", value: "page" },
  { label: "Propositions", value: "proposition" },
  { label: "Citoyens", value: "citoyen" },
  { label: "Parametres", value: "parametre" },
  { label: "Documentation", value: "documentation" },
  { label: "Doleances", value: "doleance" },
  { label: "Forge", value: "revision" },
];

// ============================================================
// TYPE LABELS for group headers
// ============================================================

const TYPE_LABELS: Record<SearchResultType, { label: string; icon: LucideIcon }> = {
  page: { label: "Pages", icon: BarChart3 },
  proposition: { label: "Propositions", icon: FileText },
  doleance: { label: "Doleances", icon: Scroll },
  citoyen: { label: "Citoyens", icon: User },
  parametre: { label: "Parametres", icon: SlidersHorizontal },
  documentation: { label: "Documentation", icon: BookOpen },
  revision: { label: "Revisions", icon: GitBranch },
  demande_integration: { label: "Demandes d'integration", icon: GitMerge },
  transaction: { label: "Transactions", icon: Wallet },
  recompense: { label: "Recompenses", icon: Shield },
};

// ============================================================
// DISPLAY ORDER for result groups
// ============================================================

const TYPE_ORDER: SearchResultType[] = [
  "page",
  "proposition",
  "doleance",
  "citoyen",
  "parametre",
  "documentation",
  "revision",
  "demande_integration",
  "transaction",
  "recompense",
];

// ============================================================
// LOCAL STORAGE for recent searches
// ============================================================

const RECENT_SEARCHES_KEY = "vita_recent_searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string): void {
  const recent = getRecentSearches().filter((q) => q !== query);
  recent.unshift(query);
  localStorage.setItem(
    RECENT_SEARCHES_KEY,
    JSON.stringify(recent.slice(0, MAX_RECENT))
  );
}

function clearRecentSearches(): void {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

// ============================================================
// HIGHLIGHT — wrap matched substring in <mark>
// ============================================================

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const normText = normalize(text);
  const normQuery = normalize(query.trim());
  const idx = normText.indexOf(normQuery);

  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.trim().length);
  const after = text.slice(idx + query.trim().length);

  return (
    <>
      {before}
      <mark className="bg-violet-500/25 text-[var(--text-primary)] rounded-sm px-0.5">
        {match}
      </mark>
      {after}
    </>
  );
}

// ============================================================
// COMPONENT
// ============================================================

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<SearchResultType | "all">("all");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Debounced query
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Load recent searches on open
  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
      setQuery("");
      setDebouncedQuery("");
      setActiveFilter("all");
      setSelectedIndex(-1);
      // Focus input after render
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Search results
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const filters =
      activeFilter === "all"
        ? undefined
        : activeFilter === "revision"
          ? (["revision", "demande_integration"] as SearchResultType[])
          : ([activeFilter] as SearchResultType[]);
    return search(debouncedQuery, filters);
  }, [debouncedQuery, activeFilter]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: { type: SearchResultType; items: SearchResult[] }[] = [];
    const grouped = new Map<SearchResultType, SearchResult[]>();

    for (const r of results) {
      if (!grouped.has(r.type)) grouped.set(r.type, []);
      grouped.get(r.type)!.push(r);
    }

    for (const type of TYPE_ORDER) {
      const items = grouped.get(type);
      if (items && items.length > 0) {
        groups.push({ type, items });
      }
    }

    return groups;
  }, [results]);

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => results, [results]);

  // Quick access pages
  const quickAccess = useMemo(() => getQuickAccessPages(), []);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [debouncedQuery, activeFilter]);

  // Navigate to result
  const navigateTo = useCallback(
    (result: SearchResult) => {
      if (query.trim()) {
        saveRecentSearch(query.trim());
      }
      router.push(result.lien);
      onClose();
    },
    [router, onClose, query]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < flatResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        const result = flatResults[selectedIndex];
        if (result) navigateTo(result);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [flatResults, selectedIndex, navigateTo, onClose]
  );

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const el = listRef.current.querySelector(
        `[data-search-index="${selectedIndex}"]`
      );
      if (el) {
        el.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (!open) return null;

  const hasQuery = debouncedQuery.trim().length > 0;

  // Compute index offsets for grouped display
  let globalIndex = 0;

  return (
    <div className="fixed inset-0 z-[60]" onKeyDown={handleKeyDown}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm backdrop-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-start justify-center pt-[8vh] md:pt-[15vh] px-3 md:px-4">
        <div
          className="search-modal-enter w-full max-w-xl overflow-hidden rounded-xl border shadow-2xl"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--bg-card)",
          }}
        >
          {/* Header / Input */}
          <div
            className="flex items-center gap-3 border-b px-4 py-3"
            style={{ borderColor: "var(--border)" }}
          >
            <Search className="h-5 w-5 shrink-0 text-[var(--text-muted)]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher dans VITA..."
              className="flex-1 bg-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="flex h-6 w-6 items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-7 items-center rounded border border-[var(--border)] px-2 text-[0.6875rem] text-[var(--text-muted)]"
            >
              Esc
            </button>
          </div>

          {/* Filter chips */}
          {hasQuery && (
            <div
              className="flex gap-1.5 overflow-x-auto scrollbar-hide border-b px-4 py-2"
              style={{ borderColor: "var(--border)" }}
            >
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setActiveFilter(opt.value)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    activeFilter === opt.value
                      ? "bg-violet-500 text-white"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Results area */}
          <div
            ref={listRef}
            className="max-h-[60vh] overflow-y-auto"
            role="listbox"
          >
            {/* Empty state — no query */}
            {!hasQuery && (
              <div className="p-4">
                {/* Quick access */}
                <div className="mb-4">
                  <div className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Acces rapide
                  </div>
                  <div className="grid grid-cols-2 xs:grid-cols-3 gap-1.5">
                    {quickAccess.map((page) => {
                      const Icon = ICON_MAP[page.icone] || Search;
                      return (
                        <button
                          key={page.id}
                          onClick={() => navigateTo(page)}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                        >
                          <Icon
                            className="h-4 w-4 shrink-0"
                            style={{ color: page.couleur }}
                          />
                          <span className="truncate">{page.titre}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Recent searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Recherches recentes
                      </span>
                      <button
                        onClick={() => {
                          clearRecentSearches();
                          setRecentSearches([]);
                        }}
                        className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        <Trash2 className="h-3 w-3" />
                        Effacer
                      </button>
                    </div>
                    <div className="space-y-0.5">
                      {recentSearches.map((q) => (
                        <button
                          key={q}
                          onClick={() => setQuery(q)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                        >
                          <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No results */}
            {hasQuery && results.length === 0 && (
              <div className="flex flex-col items-center justify-center px-4 py-10">
                <SearchX className="mb-3 h-10 w-10 text-[var(--text-muted)]" />
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Aucun resultat pour &laquo;{debouncedQuery}&raquo;
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Essayez avec d&apos;autres mots-cles ou verifiez l&apos;orthographe
                </p>
              </div>
            )}

            {/* Grouped results */}
            {hasQuery &&
              groupedResults.map((group) => {
                const typeMeta = TYPE_LABELS[group.type];
                const GroupIcon = typeMeta.icon;
                const startIndex = globalIndex;

                return (
                  <div key={group.type}>
                    {/* Group header */}
                    <div
                      className="sticky top-0 flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[var(--text-muted)]"
                      style={{ backgroundColor: "var(--bg-card)" }}
                    >
                      <GroupIcon className="h-3.5 w-3.5" />
                      {typeMeta.label} ({group.items.length})
                    </div>

                    {/* Group items */}
                    {group.items.map((result) => {
                      const idx = globalIndex++;
                      const Icon = ICON_MAP[result.icone] || Search;
                      const isSelected = idx === selectedIndex;

                      return (
                        <button
                          key={result.id}
                          data-search-index={idx}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => navigateTo(result)}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                            isSelected
                              ? "bg-violet-500/10"
                              : "hover:bg-[var(--bg-elevated)]"
                          )}
                        >
                          {/* Icon */}
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                            style={{
                              backgroundColor: `${result.couleur}15`,
                            }}
                          >
                            <Icon
                              className="h-4 w-4"
                              style={{ color: result.couleur }}
                            />
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-[var(--text-primary)]">
                              {highlightMatch(result.titre, debouncedQuery)}
                            </div>
                            {result.description && (
                              <div className="truncate text-xs text-[var(--text-muted)]">
                                {result.description}
                              </div>
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="flex shrink-0 items-center gap-2">
                            {result.metadata?.statut && (
                              <span className="rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[0.625rem] font-medium text-[var(--text-secondary)]">
                                {result.metadata.statut}
                              </span>
                            )}
                            {result.metadata?.auteur && (
                              <span className="hidden sm:inline text-[0.625rem] text-[var(--text-muted)]">
                                {result.metadata.auteur}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}

            {/* Reset globalIndex for re-render correctness — this is a render-time counter */}
            {(() => {
              globalIndex = 0;
              return null;
            })()}
          </div>

          {/* Footer — keyboard shortcuts */}
          <div
            className="flex items-center gap-4 border-t px-4 py-2"
            style={{ borderColor: "var(--border)" }}
          >
            <span className="flex items-center gap-1.5 text-[0.625rem] text-[var(--text-muted)]">
              <kbd className="rounded border border-[var(--border)] px-1 py-0.5 text-[0.5625rem] font-mono">
                ↑↓
              </kbd>
              Naviguer
            </span>
            <span className="flex items-center gap-1.5 text-[0.625rem] text-[var(--text-muted)]">
              <kbd className="rounded border border-[var(--border)] px-1 py-0.5 text-[0.5625rem] font-mono">
                Enter
              </kbd>
              Ouvrir
            </span>
            <span className="flex items-center gap-1.5 text-[0.625rem] text-[var(--text-muted)]">
              <kbd className="rounded border border-[var(--border)] px-1 py-0.5 text-[0.5625rem] font-mono">
                Esc
              </kbd>
              Fermer
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
