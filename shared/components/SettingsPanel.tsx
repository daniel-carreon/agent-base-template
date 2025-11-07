'use client'

import { useState } from 'react'
import { X, Settings, Moon, Sun, Bell, Trash2 } from 'lucide-react'
import { useTheme } from '@/features/theme/context/ThemeContext'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { theme, toggleTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-screen w-full md:w-[400px] glass-panel-strong z-50 animate-slide-in-left overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black/40 backdrop-blur-xl border-b border-white/10 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Configuración</h2>
          </div>

          <button
            onClick={onClose}
            className="glass-hover p-2 rounded-lg"
            aria-label="Cerrar panel"
          >
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Appearance Section */}
          <section>
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Apariencia
            </h3>

            <div className="glass p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-indigo-400" strokeWidth={2} />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-400" strokeWidth={2} />
                  )}
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Tema</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggleTheme}
                  className="glass-hover px-4 py-2 text-sm"
                >
                  Cambiar
                </button>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section>
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Notificaciones
            </h3>

            <div className="glass p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-blue-400" strokeWidth={2} />
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Notificaciones Push</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      Recibir notificaciones de nuevas respuestas
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={notifications}
                    onChange={() => setNotifications(!notifications)}
                  />
                  <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Data & Privacy Section */}
          <section>
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Datos & Privacidad
            </h3>

            <div className="space-y-3">
              <button className="glass-hover p-4 rounded-xl w-full text-left flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-400" strokeWidth={2} />
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Borrar todas las conversaciones</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      Esta acción no se puede deshacer
                    </p>
                  </div>
                </div>
              </button>

              <button className="glass-hover p-4 rounded-xl w-full text-left">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Exportar datos</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      Descargar todas tus conversaciones
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* About Section */}
          <section>
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
              Acerca de
            </h3>

            <div className="glass p-4 rounded-xl space-y-2">
              <div className="flex justify-between">
                <p className="text-[var(--text-muted)] text-sm">Versión</p>
                <p className="text-[var(--text-primary)] text-sm font-medium">1.0.0</p>
              </div>

              <div className="flex justify-between">
                <p className="text-[var(--text-muted)] text-sm">Template</p>
                <p className="text-[var(--text-primary)] text-sm font-medium">Agent Base</p>
              </div>

              <div className="divider my-3" />

              <a
                href="https://github.com/yourusername/agent-base-template"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                Ver en GitHub →
              </a>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
