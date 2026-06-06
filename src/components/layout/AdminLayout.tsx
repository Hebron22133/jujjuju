'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from './Header'
import Sidebar from './Sidebar'
import { ToastContainer, useToast } from '../ui/toast'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toasts, removeToast } = useToast()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <Header onLogout={handleLogout} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 overflow-auto">
          <div className="lg:hidden flex items-center gap-2 bg-secondary border-b border-border px-4 py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-secondary rounded"
            >
              ☰
            </button>
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
