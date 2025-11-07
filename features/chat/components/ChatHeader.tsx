'use client'

import { Bot } from 'lucide-react'
import { ModelSelector } from './ModelSelector'
import { ThemeToggle } from '@/features/theme/components/ThemeToggle'

interface ChatHeaderProps {
  userEmail?: string
}

export function ChatHeader({ userEmail }: ChatHeaderProps) {
  return (
    <header className="border-b border-[var(--glass-border)] p-6 glass backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white dark:text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">Agente Base</h1>
              <p className="text-[var(--text-muted)] text-xs">
                Plantilla reutilizable para agentes AI
              </p>
            </div>
          </div>

          {/* Model Selector */}
          <ModelSelector />
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile */}
          <div className="flex items-center gap-3 glass px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              <span className="text-white dark:text-white text-sm font-medium">
                {userEmail?.[0].toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-[var(--text-secondary)] text-sm hidden xl:block">
              {userEmail}
            </span>
          </div>

          {/* Logout Button */}
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="glass-hover px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
