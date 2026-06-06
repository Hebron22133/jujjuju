import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const variantStyles = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/80',
  outline: 'border border-border bg-background hover:bg-muted',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-muted hover:text-foreground',
  destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  link: 'text-primary underline-offset-4 hover:underline',
}

const sizeStyles = {
  default: 'h-8 px-2.5 py-1 text-sm',
  sm: 'h-7 px-2 py-1 text-xs',
  lg: 'h-9 px-4 py-2 text-base',
  icon: 'h-8 w-8',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

