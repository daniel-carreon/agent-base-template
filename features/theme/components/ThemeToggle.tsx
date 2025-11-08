'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full glass-hover flex items-center justify-center"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-400" strokeWidth={2} />
      ) : (
        <Moon className="w-5 h-5 text-indigo-400" strokeWidth={2} />
      )}
    </button>
  )
}
