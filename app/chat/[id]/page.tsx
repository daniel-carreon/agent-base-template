import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'
import { ChatInterface } from '@/features/chat/components/ChatInterface'
import type { Message as AIMessage } from 'ai'

interface ChatPageProps {
  params: Promise<{ id: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get conversation and verify ownership
  const { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single()

  if (!conversation || conversation.user_id !== user.id) {
    redirect('/chat')
  }

  // Get messages for this conversation
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('timestamp', { ascending: true })

  // Convert to AI SDK message format
  const initialMessages: AIMessage[] =
    messages?.map((msg) => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
      createdAt: new Date(msg.timestamp),
    })) || []

  return <ChatInterface conversationId={id} initialMessages={initialMessages} />
}
