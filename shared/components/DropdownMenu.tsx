'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'

interface DropdownMenuItem {
  label: string
  icon: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
  show?: boolean
}

interface DropdownMenuProps {
  items: DropdownMenuItem[]
  trigger?: React.ReactNode
  align?: 'left' | 'right'
}

export function DropdownMenu({ items, trigger, align = 'right' }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const handleItemClick = (item: DropdownMenuItem, e: React.MouseEvent) => {
    e.stopPropagation()
    item.onClick()
    setIsOpen(false)
  }

  // Filter visible items
  const visibleItems = items.filter((item) => item.show !== false)

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        className="glass-hover p-1.5 w-7 h-7 flex items-center justify-center transition-all hover:bg-white/10"
        title="Options"
        aria-label="Open menu"
        aria-expanded={isOpen}
      >
        {trigger || <MoreVertical className="w-4 h-4 text-[var(--text-muted)]" />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute top-full mt-1 ${
            align === 'right' ? 'right-0' : 'left-0'
          } min-w-[160px] glass-strong border border-white/10 rounded-lg shadow-xl z-[100] py-1 animate-fade-in`}
          role="menu"
          style={{ backdropFilter: 'blur(16px)' }}
        >
          {visibleItems.map((item, index) => (
            <button
              key={index}
              onClick={(e) => handleItemClick(item, e)}
              className={`w-full px-3 py-2 flex items-center gap-3 transition-colors text-left ${
                item.variant === 'danger'
                  ? 'hover:bg-red-500/10 text-red-400'
                  : 'hover:bg-white/5 text-[var(--text-primary)]'
              }`}
              role="menuitem"
            >
              <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
