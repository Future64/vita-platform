"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ForgeComparaisonFile, ForgeComparaisonLine } from "@/lib/mockForge";
import { FileText, Plus, Minus, Columns2, Rows3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ViewMode = "unified" | "split";

interface ComparaisonViewerProps {
  files: ForgeComparaisonFile[];
  className?: string;
}

export function ComparaisonViewer({ files, className }: ComparaisonViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("unified");
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(
    new Set(files.map((f) => f.filePath))
  );

  const toggleFile = (filePath: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(filePath)) {
        next.delete(filePath);
      } else {
        next.add(filePath);
      }
      return next;
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* View mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <span>{files.length} fichier{files.length > 1 ? "s" : ""} modifié{files.length > 1 ? "s" : ""}</span>
          <span className="text-green-500">
            +{files.reduce((s, f) => s + f.additions, 0)}
          </span>
          <span className="text-pink-500">
            -{files.reduce((s, f) => s + f.deletions, 0)}
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-[var(--bg-elevated)] p-1">
          <button
            type="button"
            onClick={() => setViewMode("unified")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              viewMode === "unified"
                ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            )}
          >
            <Rows3 className="h-3.5 w-3.5" />
            Unifié
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              viewMode === "split"
                ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            )}
          >
            <Columns2 className="h-3.5 w-3.5" />
            Côte à côte
          </button>
        </div>
      </div>

      {/* File diffs */}
      {files.map((file) => (
        <div
          key={file.filePath}
          className="overflow-hidden rounded-xl border border-[var(--border)]"
        >
          {/* File header */}
          <button
            type="button"
            onClick={() => toggleFile(file.filePath)}
            className="flex w-full items-center gap-3 bg-[var(--bg-elevated)] px-4 py-3 text-left transition-colors hover:bg-[var(--bg-card-hover)]"
          >
            <FileText className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <span className="flex-1 truncate font-mono text-sm text-[var(--text-primary)]">
              {file.filePath}
            </span>
            <Badge
              variant={
                file.type === "add"
                  ? "green"
                  : file.type === "delete"
                  ? "red"
                  : "violet"
              }
              className="text-xs"
            >
              {file.type === "add"
                ? "Nouveau"
                : file.type === "delete"
                ? "Supprimé"
                : "Modifié"}
            </Badge>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-0.5 text-green-500">
                <Plus className="h-3 w-3" />
                {file.additions}
              </span>
              <span className="flex items-center gap-0.5 text-pink-500">
                <Minus className="h-3 w-3" />
                {file.deletions}
              </span>
            </div>
          </button>

          {/* Diff content */}
          {expandedFiles.has(file.filePath) && (
            <div className="overflow-x-auto">
              {viewMode === "unified" ? (
                <UnifiedDiff lines={file.lines} />
              ) : (
                <SplitDiff lines={file.lines} />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Unified diff view
function UnifiedDiff({ lines }: { lines: ForgeComparaisonLine[] }) {
  return (
    <table className="w-full border-collapse font-mono text-xs">
      <tbody>
        {lines.map((line, i) => (
          <tr
            key={i}
            className={cn(
              line.type === "add" && "bg-green-500/8",
              line.type === "remove" && "bg-pink-500/8"
            )}
          >
            <td className="w-12 select-none border-r border-[var(--border)] px-2 py-0.5 text-right text-[var(--text-muted)]">
              {line.lineOld ?? ""}
            </td>
            <td className="w-12 select-none border-r border-[var(--border)] px-2 py-0.5 text-right text-[var(--text-muted)]">
              {line.lineNew ?? ""}
            </td>
            <td className="w-5 select-none px-1 py-0.5 text-center">
              {line.type === "add" && (
                <span className="text-green-500">+</span>
              )}
              {line.type === "remove" && (
                <span className="text-pink-500">−</span>
              )}
            </td>
            <td className="whitespace-pre px-3 py-0.5">
              <span
                className={cn(
                  "text-[var(--text-secondary)]",
                  line.type === "add" && "text-green-400",
                  line.type === "remove" && "text-pink-400"
                )}
              >
                {line.content}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Split (side-by-side) diff view
function SplitDiff({ lines }: { lines: ForgeComparaisonLine[] }) {
  // Build paired rows: left (old) and right (new)
  const pairs: { left: ForgeComparaisonLine | null; right: ForgeComparaisonLine | null }[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.type === "context") {
      pairs.push({ left: line, right: line });
      i++;
    } else if (line.type === "remove") {
      // Check if next line is an add (paired change)
      const nextLine = lines[i + 1];
      if (nextLine && nextLine.type === "add") {
        pairs.push({ left: line, right: nextLine });
        i += 2;
      } else {
        pairs.push({ left: line, right: null });
        i++;
      }
    } else if (line.type === "add") {
      pairs.push({ left: null, right: line });
      i++;
    } else {
      i++;
    }
  }

  return (
    <table className="w-full border-collapse font-mono text-xs">
      <tbody>
        {pairs.map((pair, idx) => (
          <tr key={idx}>
            {/* Left side (old) */}
            <td
              className={cn(
                "w-10 select-none border-r border-[var(--border)] px-2 py-0.5 text-right text-[var(--text-muted)]",
                pair.left?.type === "remove" && "bg-pink-500/8"
              )}
            >
              {pair.left?.lineOld ?? ""}
            </td>
            <td
              className={cn(
                "w-[50%] whitespace-pre border-r border-[var(--border)] px-3 py-0.5",
                pair.left?.type === "remove" && "bg-pink-500/8",
                !pair.left && "bg-[var(--bg-elevated)]"
              )}
            >
              {pair.left && (
                <span
                  className={cn(
                    "text-[var(--text-secondary)]",
                    pair.left.type === "remove" && "text-pink-400"
                  )}
                >
                  {pair.left.type === "remove" && (
                    <span className="mr-1 text-pink-500">−</span>
                  )}
                  {pair.left.content}
                </span>
              )}
            </td>

            {/* Right side (new) */}
            <td
              className={cn(
                "w-10 select-none border-r border-[var(--border)] px-2 py-0.5 text-right text-[var(--text-muted)]",
                pair.right?.type === "add" && "bg-green-500/8"
              )}
            >
              {pair.right?.lineNew ?? ""}
            </td>
            <td
              className={cn(
                "w-[50%] whitespace-pre px-3 py-0.5",
                pair.right?.type === "add" && "bg-green-500/8",
                !pair.right && "bg-[var(--bg-elevated)]"
              )}
            >
              {pair.right && (
                <span
                  className={cn(
                    "text-[var(--text-secondary)]",
                    pair.right.type === "add" && "text-green-400"
                  )}
                >
                  {pair.right.type === "add" && (
                    <span className="mr-1 text-green-500">+</span>
                  )}
                  {pair.right.content}
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
