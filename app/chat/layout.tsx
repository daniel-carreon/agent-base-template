import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'
import { ClientLayout } from './ClientLayout'

interface ChatLayoutProps {
  children: React.ReactNode
  params?: Promise<{ id?: string }>
}

export default async function ChatLayout({ children, params }: ChatLayoutProps) {
  const supabase = await createClient()

  // Auth check - TEMPORARILY DISABLED FOR TESTING
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect('/login')
  // }

  // Mock user for testing
  const testUser = user || { email: 'test@example.com' }

  const resolvedParams = await params
  const activeConversationId = resolvedParams?.id

  return (
    <ClientLayout
      userEmail={testUser.email || 'test@example.com'}
      activeConversationId={activeConversationId}
    >
      {children}
    </ClientLayout>
  )
}
