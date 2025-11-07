'use client'

import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[var(--text-muted)]" strokeWidth={2} />
      </div>

      <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
        {title}
      </h3>

      <p className="text-[var(--text-secondary)] text-center max-w-md mb-6">
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="glass-hover px-6 py-3 text-[var(--text-primary)] font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
