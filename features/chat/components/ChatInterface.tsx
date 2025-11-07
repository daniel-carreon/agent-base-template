'use client'

import { useState, useEffect } from 'react'
import { useChat } from 'ai/react'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { createMessage } from '@/features/conversations/services/conversationService'
import { DEFAULT_MODEL_ID } from '@/config/models'
import type { Message as AIMessage } from 'ai'

interface ChatInterfaceProps {
  conversationId: string
  initialMessages?: AIMessage[]
}

export function ChatInterface({ conversationId, initialMessages = [] }: ChatInterfaceProps) {
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID)

  // Load selected model from localStorage
  useEffect(() => {
    const savedModelId = localStorage.getItem('selectedModelId')
    if (savedModelId) {
      setSelectedModelId(savedModelId)
    }
  }, [])

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    error,
  } = useChat({
    api: '/api/chat',
    body: {
      conversationId,
      modelId: selectedModelId,
    },
    initialMessages,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    try {
      // Save user message to Supabase first
      await createMessage({
        conversation_id: conversationId,
        role: 'user',
        content: input.trim(),
      })

      // Then send to AI
      await originalHandleSubmit(e)
    } catch (error) {
      console.error('Error submitting message:', error)
    }
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
