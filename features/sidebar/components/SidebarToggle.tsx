'use client'

import { useSidebar } from '../context/SidebarContext'

export function SidebarToggle() {
  const { isOpen, toggle } = useSidebar()

  return (
    <button
      onClick={toggle}
      className="glass-hover p-2 flex items-center justify-center transition-all duration-200"
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      <div className="w-6 h-5 flex flex-col justify-between">
        {/* Top line */}
        <span
          className={`block h-0.5 bg-[var(--text-primary)] transition-all duration-300 ease-in-out ${
            isOpen ? 'rotate-45 translate-y-2' : 'rotate-0'
          }`}
        />
        {/* Middle line */}
        <span
          className={`block h-0.5 bg-[var(--text-primary)] transition-all duration-300 ease-in-out ${
            isOpen ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {/* Bottom line */}
        <span
          className={`block h-0.5 bg-[var(--text-primary)] transition-all duration-300 ease-in-out ${
            isOpen ? '-rotate-45 -translate-y-2' : 'rotate-0'
          }`}
        />
      </div>
    </button>
  )
}
