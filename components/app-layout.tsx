'use client'

import React, { useState } from 'react'
import { Header } from '@/components/header'
import { Sidebar, SidebarToggle } from '@/components/sidebar'
import { ToastContainer, useToast } from '@/components/ui/toast'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toasts, removeToast } = useToast()

  const handleLogout = () => {
    // This would typically call an API to logout
    console.log('Logged out')
  }

  return (
    <div className="flex h-screen flex-col">
      <Header onLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 overflow-auto">
          <div className="lg:hidden flex items-center gap-2 bg-secondary border-b border-border px-4 py-3">
            <SidebarToggle onClick={() => setSidebarOpen(!sidebarOpen)} />
            <p className="text-sm text-muted-foreground">Menu</p>
          </div>
          <main className="p-6 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
