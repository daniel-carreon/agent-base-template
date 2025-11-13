'use client'

import { SidebarProvider, useSidebar } from '@/features/sidebar/context/SidebarContext'
import { ConversationList } from '@/features/conversations/components/ConversationList'
import { ChatHeader } from '@/features/chat/components/ChatHeader'

interface ClientLayoutContentProps {
  children: React.ReactNode
  userEmail: string
  activeConversationId?: string
}

function ClientLayoutContent({ children, userEmail, activeConversationId }: ClientLayoutContentProps) {
  const { isOpen } = useSidebar()

  return (
    <div className="flex mobile-viewport">
      {/* Sidebar - Fixed overlay en móvil, relative en desktop */}
      <aside
        className={`
          sidebar z-50 transition-all duration-300 ease-in-out
          fixed top-0 left-0 h-full
          lg:relative lg:top-auto lg:left-auto
          ${isOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full'}
          ${!isOpen ? 'lg:translate-x-0 lg:w-0' : 'lg:translate-x-0'}
          overflow-hidden
        `}
      >
        <div className="w-80 h-full overflow-x-hidden">
          <ConversationList activeConversationId={activeConversationId} userEmail={userEmail} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ChatHeader userEmail={userEmail} />

        {/* Content */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </main>
    </div>
  )
}

interface ClientLayoutProps {
  children: React.ReactNode
  userEmail: string
  activeConversationId?: string
}

export function ClientLayout({ children, userEmail, activeConversationId }: ClientLayoutProps) {
  return (
    <SidebarProvider>
      <ClientLayoutContent
        userEmail={userEmail}
        activeConversationId={activeConversationId}
      >
        {children}
      </ClientLayoutContent>
    </SidebarProvider>
  )
}
