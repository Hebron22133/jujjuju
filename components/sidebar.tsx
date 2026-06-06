'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, ShoppingCart, DollarSign, Menu, X } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: <LayoutDashboard size={20} /> },
  { label: 'Users', href: '/users', icon: <Users size={20} /> },
  { label: 'Orders/Tasks', href: '/orders', icon: <ShoppingCart size={20} /> },
  { label: 'Withdrawals', href: '/withdrawals', icon: <DollarSign size={20} /> },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-50 lg:z-0 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button for mobile */}
        <div className="lg:hidden flex justify-end p-4">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-sidebar-accent rounded transition-colors"
            >
              <X size={24} className="text-sidebar-foreground" />
            </button>
          )}
        </div>

        <nav className="px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

interface SidebarToggleProps {
  onClick: () => void
}

export function SidebarToggle({ onClick }: SidebarToggleProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 hover:bg-secondary rounded transition-colors"
      aria-label="Toggle sidebar"
    >
      <Menu size={24} />
    </button>
  )
}
