"use client";

import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";

interface VoteButtonsProps {
  onVote?: (vote: "for" | "against" | "abstain") => void;
  showAbstain?: boolean;
  className?: string;
}

export function VoteButtons({ onVote, showAbstain = true, className }: VoteButtonsProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-2">
        <button
          onClick={() => onVote?.("for")}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-green-500/30 px-4 py-3 text-sm font-semibold text-green-500 transition-all hover:border-green-500 hover:bg-green-500/10"
        >
          <ThumbsUp className="h-[1.125rem] w-[1.125rem]" />
          Pour
        </button>
        <button
          onClick={() => onVote?.("against")}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-red-500/30 px-4 py-3 text-sm font-semibold text-red-500 transition-all hover:border-red-500 hover:bg-red-500/10"
        >
          <ThumbsDown className="h-[1.125rem] w-[1.125rem]" />
          Contre
        </button>
      </div>
      {showAbstain && (
        <button
          onClick={() => onVote?.("abstain")}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--border-light)] px-4 py-3 text-sm font-semibold text-[var(--text-muted)] transition-all hover:bg-[var(--bg-elevated)]"
        >
          <Minus className="h-[1.125rem] w-[1.125rem]" />
          Abstention
        </button>
      )}
    </div>
  );
}
