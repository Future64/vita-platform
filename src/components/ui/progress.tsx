import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const progressVariants = cva(
  "h-full rounded-full transition-all",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-violet-500 to-pink-500",
        cyan: "bg-gradient-to-r from-cyan-500 to-blue-500",
        green: "bg-gradient-to-r from-green-500 to-cyan-500",
        orange: "bg-gradient-to-r from-orange-500 to-pink-500",
        red: "bg-red-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-1.5 w-full overflow-hidden rounded-full bg-elevated",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(progressVariants({ variant }))}
      style={{ width: `${value || 0}%` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

// VoteBar component for showing vote distribution
interface VoteBarProps {
  votesFor: number
  votesAgainst: number
  votesAbstain?: number
  className?: string
}

const VoteBar = ({ votesFor, votesAgainst, votesAbstain = 0, className }: VoteBarProps) => {
  const total = votesFor + votesAgainst + votesAbstain
  const forPercent = total > 0 ? (votesFor / total) * 100 : 0
  const againstPercent = total > 0 ? (votesAgainst / total) * 100 : 0

  return (
    <div className={cn("flex h-1.5 w-full overflow-hidden rounded-full bg-elevated", className)}>
      <div 
        className="h-full bg-green-500 transition-all" 
        style={{ width: `${forPercent}%` }} 
      />
      <div 
        className="h-full bg-red-500 transition-all" 
        style={{ width: `${againstPercent}%` }} 
      />
    </div>
  )
}

export { Progress, VoteBar }
