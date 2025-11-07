'use client'

import { Menu } from 'lucide-react'
import { useSidebar } from '../context/SidebarContext'

export function SidebarToggle() {
  const { isOpen, toggle } = useSidebar()

  return (
    <button
      onClick={toggle}
      className="glass-hover p-2.5 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-white/10"
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      title={isOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      <Menu className="w-5 h-5 text-[var(--text-primary)]" strokeWidth={2.5} />
    </button>
  )
}
