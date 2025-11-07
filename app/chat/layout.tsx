import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'
import { ConversationList } from '@/features/conversations/components/ConversationList'
import { ChatHeader } from '@/features/chat/components/ChatHeader'

interface ChatLayoutProps {
  children: React.ReactNode
  params?: Promise<{ id?: string }>
}

export default async function ChatLayout({ children, params }: ChatLayoutProps) {
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await params
  const activeConversationId = resolvedParams?.id

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-80 sidebar hidden lg:block">
        <ConversationList activeConversationId={activeConversationId} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <ChatHeader userEmail={user.email} />

        {/* Content */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </main>
    </div>
  )
}
