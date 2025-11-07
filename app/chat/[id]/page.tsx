import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'
import { ChatInterface } from '@/features/chat/components/ChatInterface'
import type { UIMessage as AIMessage } from '@ai-sdk/react'

interface ChatPageProps {
  params: Promise<{ id: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Auth check - TEMPORARILY DISABLED FOR TESTING
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // if (!user) {
  //   redirect('/login')
  // }

  // Mock user for testing
  const testUser = user || { id: 'test-user-id' }

  // Get conversation and verify ownership - DISABLED FOR TESTING
  // const { data: conversation } = await supabase
  //   .from('conversations')
  //   .select('*')
  //   .eq('id', id)
  //   .single()

  // if (!conversation || conversation.user_id !== testUser.id) {
  //   redirect('/chat')
  // }

  // Get messages for this conversation
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('timestamp', { ascending: true })

  // Convert to AI SDK message format
  const initialMessages =
    messages?.map((msg) => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      createdAt: new Date(msg.timestamp),
    })) || []

  return <ChatInterface conversationId={id} initialMessages={initialMessages as any} />
}
