'use client'

import React from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  className?: string
}

export function Modal({ isOpen, onClose, children, title, className = '' }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-card text-card-foreground rounded-lg shadow-lg max-w-md w-full mx-4 ${className}`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary rounded transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-secondary rounded transition-colors z-10"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
