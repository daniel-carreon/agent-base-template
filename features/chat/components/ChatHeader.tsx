'use client'

import { SidebarToggle } from '@/features/sidebar/components/SidebarToggle'

interface ChatHeaderProps {
  userEmail?: string
}

export function ChatHeader({ userEmail }: ChatHeaderProps) {
  return (
    <header className="border-b border-[var(--glass-border)] px-6 py-4 glass backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Sidebar Toggle */}
          <SidebarToggle />
        </div>
      </div>
    </header>
  )
}
