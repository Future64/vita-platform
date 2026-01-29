import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-violet-500/15 text-violet-500",
        violet: "bg-violet-500/15 text-violet-500",
        pink: "bg-pink-500/15 text-pink-500",
        cyan: "bg-cyan-500/15 text-cyan-500",
        blue: "bg-blue-500/15 text-blue-500",
        green: "bg-green-500/15 text-green-500",
        orange: "bg-orange-500/15 text-orange-500",
        red: "bg-red-500/15 text-red-500",
        yellow: "bg-yellow-500/15 text-yellow-500",
        outline: "border border-border-light text-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
