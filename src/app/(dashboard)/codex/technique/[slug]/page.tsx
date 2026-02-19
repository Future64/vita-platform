"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  PenTool,
  Settings,
  Code,
  History,
  Clock,
  Tag,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { DashboardLayout, SidebarItem } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { TECHNICAL_DOCS, CODEX_NAVIGATION } from "@/lib/mockCodex";
import { SYSTEM_PARAMETERS } from "@/lib/mockParameters";

const sidebarItems: SidebarItem[] = [
  { icon: BookOpen, label: "Constitution", href: "/codex" },
  { icon: Settings, label: "Parametres", href: "/codex/parametres-systeme" },
  { icon: Code, label: "Documentation", href: "/codex/technique/emission-quotidienne" },
  { icon: History, label: "Registre", href: "/codex/registre" },
  { icon: PenTool, label: "Proposer", href: "/codex/amendement/nouveau" },
];

// Render content with special markers for formulas, code blocks, and warnings
function renderContent(content: string) {
  const parts: React.ReactNode[] = [];
  let remaining = content;
  let key = 0;

  while (remaining.length > 0) {
    // Check for formulas
    const formulaMatch = remaining.match(/\$\$FORMULA\$\$([\s\S]*?)\$\$END\$\$/);
    // Check for code blocks
    const codeMatch = remaining.match(/\$\$CODE\$\$([\s\S]*?)\$\$END\$\$/);
    // Check for warnings
    const warningMatch = remaining.match(/\$\$WARNING\$\$([\s\S]*?)\$\$END\$\$/);

    // Find the earliest match
    const matches = [
      formulaMatch ? { type: "formula", match: formulaMatch, index: remaining.indexOf(formulaMatch[0]) } : null,
      codeMatch ? { type: "code", match: codeMatch, index: remaining.indexOf(codeMatch[0]) } : null,
      warningMatch ? { type: "warning", match: warningMatch, index: remaining.indexOf(warningMatch[0]) } : null,
    ].filter(Boolean) as { type: string; match: RegExpMatchArray; index: number }[];

    if (matches.length === 0) {
      // No more special blocks, render rest as text
      parts.push(...renderTextBlock(remaining, key));
      break;
    }

    // Sort by index and take earliest
    matches.sort((a, b) => a.index - b.index);
    const earliest = matches[0];

    // Render text before the match
    if (earliest.index > 0) {
      parts.push(...renderTextBlock(remaining.slice(0, earliest.index), key));
      key += 100;
    }

    // Render the special block
    const innerContent = earliest.match[1].trim();

    if (earliest.type === "formula") {
      parts.push(
        <div
          key={`formula-${key++}`}
          className="my-4 p-4 rounded-lg font-mono text-sm text-center"
          style={{
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(236, 72, 153, 0.08))",
            border: "1px solid rgba(139, 92, 246, 0.2)",
          }}
        >
          <code className="text-violet-400">{innerContent}</code>
        </div>
      );
    } else if (earliest.type === "code") {
      parts.push(
        <div
          key={`code-${key++}`}
          className="my-4 rounded-lg overflow-hidden"
          style={{ backgroundColor: "var(--bg-code)", border: "1px solid var(--border)" }}
        >
          <div
            className="px-4 py-2 text-xs font-medium border-b"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            Code
          </div>
          <pre className="p-4 text-sm font-mono overflow-x-auto" style={{ color: "var(--text-secondary)" }}>
            <code>{innerContent}</code>
          </pre>
        </div>
      );
    } else if (earliest.type === "warning") {
      parts.push(
        <div
          key={`warning-${key++}`}
          className="my-4 p-4 rounded-lg flex items-start gap-3"
          style={{
            backgroundColor: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
          }}
        >
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {innerContent}
          </p>
        </div>
      );
    }

    // Move past the match
    remaining = remaining.slice(earliest.index + earliest.match[0].length);
  }

  return parts;
}

// Render a text block with markdown-like formatting
function renderTextBlock(text: string, startKey: number): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const paragraphs = text.split("\n\n");

  paragraphs.forEach((para, pIdx) => {
    const trimmed = para.trim();
    if (!trimmed) return;

    // Check for table
    if (trimmed.includes("|") && trimmed.includes("---")) {
      const lines = trimmed.split("\n").filter((l) => l.trim());
      const headerLine = lines[0];
      const dataLines = lines.slice(2); // Skip header and separator
      const headers = headerLine.split("|").map((h) => h.trim()).filter(Boolean);

      parts.push(
        <div key={`table-${startKey}-${pIdx}`} className="my-4 overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className="text-left px-3 py-2 text-xs font-semibold border-b"
                    style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataLines.map((line, lIdx) => {
                const cells = line.split("|").map((c) => c.trim()).filter(Boolean);
                return (
                  <tr key={lIdx}>
                    {cells.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="px-3 py-2 text-sm border-b"
                        style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      return;
    }

    // Check for list items
    if (trimmed.match(/^(\d+\.|[-*])\s/m)) {
      const items = trimmed.split("\n").filter((l) => l.trim());
      const isOrdered = items[0]?.match(/^\d+\./);

      parts.push(
        <div key={`list-${startKey}-${pIdx}`} className="my-3">
          {isOrdered ? (
            <ol className="space-y-1.5 ml-4 list-decimal">
              {items.map((item, i) => (
                <li
                  key={i}
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {renderInlineFormatting(item.replace(/^\d+\.\s*/, ""))}
                </li>
              ))}
            </ol>
          ) : (
            <ul className="space-y-1.5 ml-4 list-disc">
              {items.map((item, i) => (
                <li
                  key={i}
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {renderInlineFormatting(item.replace(/^[-*]\s*/, ""))}
                </li>
              ))}
            </ul>
          )}
        </div>
      );
      return;
    }

    // Regular paragraph
    parts.push(
      <p
        key={`p-${startKey}-${pIdx}`}
        className="text-sm leading-relaxed my-3"
        style={{ color: "var(--text-secondary)" }}
      >
        {renderInlineFormatting(trimmed)}
      </p>
    );
  });

  return parts;
}

// Render inline formatting (bold, code, etc.)
function renderInlineFormatting(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const content = match[0];
    if (content.startsWith("**") && content.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold" style={{ color: "var(--text-primary)" }}>
          {content.slice(2, -2)}
        </strong>
      );
    } else if (content.startsWith("`") && content.endsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded text-xs font-mono"
          style={{ backgroundColor: "var(--bg-code)", color: "#8b5cf6" }}
        >
          {content.slice(1, -1)}
        </code>
      );
    }

    lastIndex = match.index + content.length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : <>{parts}</>;
}

export default function TechniqueDocPage() {
  const params = useParams();
  const slug = params.slug as string;

  const doc = useMemo(
    () => TECHNICAL_DOCS.find((d) => d.slug === slug),
    [slug]
  );

  // Get all tech docs for the sidebar navigation
  const techNavSection = CODEX_NAVIGATION.find((s) => s.type === "technique");
  const techDocLinks = techNavSection?.children || [];

  // Find associated parameters
  const associatedParams = useMemo(() => {
    if (!doc) return [];
    return SYSTEM_PARAMETERS.filter(
      (p) => p.technicalDocSection === doc.slug
    );
  }, [doc]);

  if (!doc) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Codex">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-400">Documentation introuvable</div>
          <Link href="/codex">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" />
              Retour au Codex
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const sortedSections = [...doc.sections].sort((a, b) => a.order - b.order);

  return (
    <DashboardLayout sidebarItems={sidebarItems} sidebarTitle="Codex">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <Link href="/codex">
          <Button variant="ghost" className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au Codex
          </Button>
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Code className="h-5 w-5 text-violet-500" />
              <Badge variant="violet" className="text-xs">
                <Tag className="h-3 w-3" />
                v{doc.version}
              </Badge>
              <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Mis a jour le {new Date(doc.lastUpdated).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <h1
              className="text-xl md:text-2xl font-bold text-[var(--text-primary)]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {doc.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-4">
        {/* Left: Doc navigation */}
        <div className="space-y-4 lg:col-span-1">
          {/* Table of contents */}
          <Card>
            <CardHeader>
              <CardTitle>Sommaire</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {sortedSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-violet-500 transition-all"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Other docs */}
          <Card>
            <CardHeader>
              <CardTitle>Autres documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {techDocLinks.map((link) => {
                  const isActive = link.path === `/codex/technique/${slug}`;
                  return (
                    <Link key={link.id} href={link.path}>
                      <div
                        className={`px-3 py-2 rounded-lg text-xs transition-all ${
                          isActive
                            ? "bg-violet-500/15 text-violet-500 font-semibold"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                        }`}
                      >
                        {link.title}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Content */}
        <div className="lg:col-span-3 space-y-4 md:space-y-6">
          {sortedSections.map((section) => (
            <Card key={section.id} id={section.id}>
              <CardHeader>
                <CardTitle
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  className="text-base"
                >
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderContent(section.content)}
              </CardContent>
            </Card>
          ))}

          {/* Associated parameters */}
          {associatedParams.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <Settings className="h-4 w-4 inline mr-2" />
                  Parametres associes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {associatedParams.map((param) => (
                    <Link
                      key={param.id}
                      href={`/codex/parametres-systeme/${param.id}`}
                    >
                      <div className="group flex items-center justify-between p-3.5 md:p-3 rounded-lg border border-[var(--border)] hover:border-violet-500/50 transition-all">
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-primary)]">
                            {param.name}
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            {param.description.slice(0, 80)}...
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-violet-500">
                            {String(param.currentValue)}
                            {param.unit && (
                              <span className="text-xs text-[var(--text-muted)] ml-1 font-sans">
                                {param.unit}
                              </span>
                            )}
                          </span>
                          <ChevronRight className="h-4 w-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
