'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="glass-hover px-3 py-2 flex items-center gap-2"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-yellow-400" strokeWidth={2} />
      ) : (
        <Moon className="w-4 h-4 text-indigo-400" strokeWidth={2} />
      )}
      <span className="text-sm text-[var(--text-secondary)] hidden md:inline">
        {theme === 'dark' ? 'Light' : 'Dark'}
      </span>
    </button>
  )
}
