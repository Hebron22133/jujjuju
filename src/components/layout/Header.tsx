'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface HeaderProps {
  onLogout?: () => void
}

export default function Header({ onLogout }: HeaderProps) {
  return (
    <header className="bg-primary text-primary-foreground border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-foreground rounded flex items-center justify-center font-bold text-primary">
            J
          </div>
          <div>
            <h1 className="text-xl font-bold">Jumia</h1>
            <p className="text-xs opacity-90">Admin Dashboard</p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onLogout}
          className="flex items-center gap-2"
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </header>
  )
}
