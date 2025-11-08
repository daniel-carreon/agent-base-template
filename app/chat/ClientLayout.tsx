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
    <div className="flex h-screen">
      {/* Sidebar with smooth transitions */}
      <aside
        className={`sidebar transition-all duration-300 ease-in-out ${
          isOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0'
        } overflow-hidden`}
      >
        <div className="w-80 h-full">
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
