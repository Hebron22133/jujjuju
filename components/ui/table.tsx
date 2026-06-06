import React from 'react'

interface TableProps {
  children: React.ReactNode
  className?: string
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  )
}

interface TableHeadProps {
  children: React.ReactNode
}

export function TableHead({ children }: TableHeadProps) {
  return (
    <thead className="bg-secondary border-b border-border">
      {children}
    </thead>
  )
}

interface TableBodyProps {
  children: React.ReactNode
}

export function TableBody({ children }: TableBodyProps) {
  return (
    <tbody>
      {children}
    </tbody>
  )
}

interface TableRowProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function TableRow({ children, onClick, className = '' }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-border hover:bg-accent/30 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  )
}

interface TableHeaderCellProps {
  children: React.ReactNode
  onClick?: () => void
  sortable?: boolean
  className?: string
}

export function TableHeaderCell({ children, onClick, sortable, className = '' }: TableHeaderCellProps) {
  return (
    <th
      onClick={onClick}
      className={`px-4 py-3 text-left font-semibold text-foreground ${sortable ? 'cursor-pointer hover:bg-border/50' : ''} ${className}`}
    >
      {children}
    </th>
  )
}

interface TableCellProps {
  children: React.ReactNode
  className?: string
}

export function TableCell({ children, className = '' }: TableCellProps) {
  return (
    <td className={`px-4 py-3 text-foreground ${className}`}>
      {children}
    </td>
  )
}
