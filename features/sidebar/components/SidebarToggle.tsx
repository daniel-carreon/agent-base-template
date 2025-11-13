'use client'

import { Menu } from 'lucide-react'
import { useSidebar } from '../context/SidebarContext'
import { useEffect } from 'react'

export function SidebarToggle() {
  const { isOpen, toggle, close } = useSidebar()

  // 🎯 MOBILE-FIRST: Event listeners para mejorar UX en móvil
  // - Click outside cierra sidebar
  // - Escape key cierra sidebar
  // - Scroll prevention cuando sidebar abierto
  // Ref: arbrain/LeftSidebarMenu.tsx:86-135
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element

      // No cerrar si el clic es en el botón hamburger mismo
      const isHamburgerButton = target.closest('[aria-label="Close sidebar"], [aria-label="Open sidebar"]')

      // Solo aplicar en mobile (cuando sidebar es overlay)
      const isMobileViewport = window.innerWidth < 1024

      if (isOpen && isMobileViewport && !isHamburgerButton) {
        close()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        close()
      }
    }

    if (isOpen) {
      // Agregar delay para evitar que el clic del botón cierre inmediatamente el sidebar
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)

      // Prevenir scroll del body cuando el sidebar está abierto (mobile)
      const isMobileViewport = window.innerWidth < 1024
      if (isMobileViewport) {
        document.body.style.overflow = 'hidden'
      }

      document.addEventListener('keydown', handleEscape)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = 'unset'
      }
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, close])

  return (
    <>
      {/* 🎨 OVERLAY: Visible solo en mobile (lg:hidden)
          Backdrop blur premium para UX moderna
          Ref: arbrain/LeftSidebarMenu.tsx:140-149 */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden'
          onClick={close}
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        />
      )}

      {/* 🔘 HAMBURGER TOGGLE BUTTON */}
      <button
        onClick={toggle}
        className="glass-hover p-2.5 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-white/10 relative z-50"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
        title={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <Menu className="w-5 h-5 text-[var(--text-primary)]" strokeWidth={2} />
      </button>
    </>
  )
}
