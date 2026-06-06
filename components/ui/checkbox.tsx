import React from 'react'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          ref={ref}
          type="checkbox"
          className="w-4 h-4 border border-border rounded bg-card text-primary cursor-pointer focus:ring-2 focus:ring-primary"
          {...props}
        />
        {label && (
          <label className="ml-2 text-sm text-foreground cursor-pointer">
            {label}
          </label>
        )}
      </div>
    )
  },
)

Checkbox.displayName = 'Checkbox'
