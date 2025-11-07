'use client'

import { AlertTriangle, Trash2, Info, X } from 'lucide-react'
import { Spinner } from './Spinner'

type ModalType = 'delete' | 'warning' | 'info'

interface ConfirmationModalProps {
  isOpen: boolean
  type: ModalType
  title: string
  message: string
  secondaryMessage?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const modalConfig = {
  delete: {
    icon: Trash2,
    iconBg: 'bg-red-500/10',
    iconBorder: 'border-red-500/20',
    iconColor: 'text-red-500',
    confirmBg: 'bg-gradient-to-r from-red-500 to-red-600',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-yellow-500/10',
    iconBorder: 'border-yellow-500/20',
    iconColor: 'text-yellow-500',
    confirmBg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-500/10',
    iconBorder: 'border-blue-500/20',
    iconColor: 'text-blue-500',
    confirmBg: 'bg-gradient-to-r from-blue-500 to-blue-600',
  },
}

export function ConfirmationModal({
  isOpen,
  type,
  title,
  message,
  secondaryMessage,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const config = modalConfig[type]
  const Icon = config.icon

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="glass-panel-strong p-6 rounded-2xl max-w-sm w-full mx-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Icon */}
        <div className="text-center mb-4">
          <div
            className={`w-12 h-12 rounded-full ${config.iconBg} border ${config.iconBorder} flex items-center justify-center mx-auto mb-3`}
          >
            <Icon className={`w-6 h-6 ${config.iconColor}`} strokeWidth={2} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
        </div>

        {/* Message */}
        <p className="text-sm text-[var(--text-secondary)] mb-2 text-center">{message}</p>
        {secondaryMessage && (
          <p className="text-xs text-[var(--text-muted)] text-center">{secondaryMessage}</p>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} disabled={isLoading} className="flex-1 glass-hover py-2.5">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 ${config.confirmBg} text-white py-2.5 rounded-lg font-medium transition-opacity disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" />
                <span>Procesando...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 glass-hover rounded-lg"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
      </div>
    </div>
  )
}
