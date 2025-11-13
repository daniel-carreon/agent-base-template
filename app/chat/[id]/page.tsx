import { redirect } from 'next/navigation'
import { createClient } from '@/shared/lib/supabase/server'
import { ChatInterface } from '@/features/chat/components/ChatInterface'
import type { CustomMessage } from '@/features/chat/hooks/useCustomChat'

interface ChatPageProps {
  params: Promise<{ id: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
  try {
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

    // Get messages for this conversation (with error handling)
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('timestamp', { ascending: true })

    // Log error but don't fail - new conversations have no messages
    if (messagesError) {
      console.error('Error loading messages:', messagesError)
    }

    // Convert to CustomMessage format (includes thinking field)
    const initialMessages: CustomMessage[] =
      messages?.map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content || '',
        thinking: msg.thinking || undefined,
        timestamp: new Date(msg.timestamp),
      })) || []

    return <ChatInterface conversationId={id} initialMessages={initialMessages} />
  } catch (error) {
    console.error('Error in ChatPage:', error)
    // Fallback: Return empty chat interface
    const { id } = await params
    return <ChatInterface conversationId={id} initialMessages={[]} />
  }
}
