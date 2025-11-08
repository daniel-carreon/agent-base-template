'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, User } from 'lucide-react'
import { createClient } from '@/shared/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/shared/components/Spinner'

interface UserMenuProps {
  userEmail: string
}

export function UserMenu({ userEmail }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Get first letter of email for avatar
  const initial = userEmail.charAt(0).toUpperCase()

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <div ref={menuRef} className="relative">
      {/* Avatar Button - Circular */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        title={userEmail}
      >
        {initial}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-lg shadow-xl overflow-hidden z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white font-semibold text-sm">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[var(--text-primary)] text-sm font-medium truncate">
                  {userEmail}
                </p>
                <p className="text-[var(--text-muted)] text-xs">
                  Signed in
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {/* Profile (optional - can be added later) */}
            {/* <button
              className="w-full px-4 py-2.5 text-left hover:bg-white/5 transition-colors flex items-center gap-3 text-sm"
            >
              <User className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-[var(--text-primary)]">Profile</span>
            </button> */}

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full px-4 py-2.5 text-left hover:bg-red-500/10 transition-colors flex items-center gap-3 text-sm"
            >
              {isLoggingOut ? (
                <>
                  <Spinner size="sm" />
                  <span className="text-red-400">Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">Log out</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
