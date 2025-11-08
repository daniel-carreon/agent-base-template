'use client'

import { useState, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { createMessage } from '@/features/conversations/services/conversationService'
import { DEFAULT_MODEL_ID } from '@/config/models'
import type { UIMessage as AIMessage } from '@ai-sdk/react'

interface ChatInterfaceProps {
  conversationId: string
  initialMessages?: AIMessage[]
}

export function ChatInterface({ conversationId, initialMessages = [] }: ChatInterfaceProps) {
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID)
  const [input, setInput] = useState('')

  // Load selected model from localStorage
  useEffect(() => {
    const savedModelId = localStorage.getItem('selectedModelId')
    if (savedModelId) {
      setSelectedModelId(savedModelId)
    }
  }, [])

  // AI SDK 5.0 modern pattern - no more handleInputChange from hook
  const {
    messages,
    sendMessage,
    status,
    error,
  } = useChat({
    api: '/api/chat',
    body: {
      conversationId,
      modelId: selectedModelId,
    },
    initialMessages,
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input?.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('') // Clear input immediately

    try {
      // TEMPORARILY DISABLED FOR TESTING - Save user message to Supabase first
      // await createMessage({
      //   conversation_id: conversationId,
      //   role: 'user',
      //   content: userMessage,
      // })

      // Send to AI using new sendMessage API (AI SDK 5.0)
      sendMessage({ text: userMessage })
    } catch (error) {
      console.error('Error submitting message:', error)
      setInput(userMessage) // Restore input on error
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 m-6 mb-0">
          <p className="text-red-400 text-sm">
            ⚠️ Error: {error.message}
          </p>
        </div>
      )}

      <MessageList messages={messages} isLoading={isLoading} />

      <ChatInput
        input={input}
        isLoading={isLoading}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
