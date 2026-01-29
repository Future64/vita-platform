import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface TimelineStep {
  icon: LucideIcon;
  label: string;
  state: "completed" | "active" | "pending";
}

interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export function Timeline({ steps, className }: TimelineProps) {
  return (
    <div className={cn("flex items-start overflow-x-auto pb-2", className)}>
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="flex flex-1 items-start">
            {/* Step */}
            <div className="flex flex-col items-center text-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  step.state === "completed" && "bg-green-500/15 text-green-500",
                  step.state === "active" && "bg-gradient-to-br from-violet-500 to-pink-500 text-white",
                  step.state === "pending" && "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="mt-2 text-[0.6875rem] font-medium text-[var(--text-secondary)]">
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {!isLast && (
              <div
                className={cn(
                  "mx-2 mt-5 h-0.5 flex-1 rounded-full",
                  step.state === "completed" && "bg-green-500",
                  step.state === "active" && "bg-gradient-to-r from-violet-500 to-pink-500",
                  step.state === "pending" && "bg-[var(--bg-elevated)]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
