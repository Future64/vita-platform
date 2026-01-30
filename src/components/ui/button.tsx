import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:opacity-90 hover:-translate-y-0.5",
        secondary: "border",
        ghost: "",
        success: "bg-green-500 text-white hover:bg-green-600",
        danger: "bg-red-500 text-white hover:bg-red-600",
        outline: "border",
        voteFor: "border-2 border-green-500/30 text-green-500 hover:bg-green-500/10 hover:border-green-500",
        voteAgainst: "border-2 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500",
        voteAbstain: "border-2",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
        iconSm: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    // Apply CSS variable styles for certain variants
    let variantStyle: React.CSSProperties = {};
    if (variant === "secondary") {
      variantStyle = {
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-light)',
        color: 'var(--text-primary)',
      };
    } else if (variant === "ghost") {
      variantStyle = {
        color: 'var(--text-secondary)',
      };
    } else if (variant === "outline") {
      variantStyle = {
        borderColor: 'var(--border-light)',
        color: 'var(--text-primary)',
      };
    } else if (variant === "voteAbstain") {
      variantStyle = {
        borderColor: 'var(--border-light)',
        color: 'var(--text-muted)',
      };
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={{ ...variantStyle, ...style }}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
