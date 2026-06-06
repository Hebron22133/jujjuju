'use client'

import React, { useEffect } from 'react'
import { X, AlertCircle, CheckCircle, InfoIcon } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastProps extends Toast {
  onClose: (id: string) => void
}

const typeConfig = {
  success: {
    bg: 'bg-success/10',
    border: 'border-success/30',
    text: 'text-success',
    icon: CheckCircle,
  },
  error: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    text: 'text-destructive',
    icon: AlertCircle,
  },
  info: {
    bg: 'bg-info/10',
    border: 'border-info/30',
    text: 'text-info',
    icon: InfoIcon,
  },
}

export function Toast({ id, message, type, onClose }: ToastProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 4000)
    return () => clearTimeout(timer)
  }, [id, onClose])

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${config.bg} ${config.border}`}>
      <Icon size={20} className={config.text} />
      <p className={`text-sm ${config.text}`}>{message}</p>
      <button
        onClick={() => onClose(id)}
        className={`ml-auto p-1 hover:bg-black/10 rounded transition-colors ${config.text}`}
      >
        <X size={16} />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  )
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}`
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, addToast, removeToast }
}
