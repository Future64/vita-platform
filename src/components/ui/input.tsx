import * as React from "react"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, style, ...props }, ref) => {
    const inputStyle = {
      borderColor: 'var(--border)',
      backgroundColor: 'var(--bg-elevated)',
      color: 'var(--text-primary)',
      ...style
    };

    if (icon) {
      return (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
            {icon}
          </span>
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-lg border pl-10 pr-4 text-sm focus:border-violet-500 focus:outline-none transition-colors placeholder:opacity-60",
              className
            )}
            style={inputStyle}
            ref={ref}
            {...props}
          />
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border px-4 text-sm focus:border-violet-500 focus:outline-none transition-colors placeholder:opacity-60",
          className
        )}
        style={inputStyle}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

const SearchInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'icon'>>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        icon={<Search className="h-4 w-4" />}
        className={className}
        {...props}
      />
    )
  }
)
SearchInput.displayName = "SearchInput"

export { Input, SearchInput }
