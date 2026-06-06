import React from 'react'

type BadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info' | 'active' | 'inactive'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-secondary text-secondary-foreground',
  success: 'bg-success/20 text-success',
  danger: 'bg-destructive/20 text-destructive',
  warning: 'bg-warning/20 text-warning',
  info: 'bg-info/20 text-info',
  active: 'bg-success/20 text-success',
  inactive: 'bg-muted/50 text-muted-foreground',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}
