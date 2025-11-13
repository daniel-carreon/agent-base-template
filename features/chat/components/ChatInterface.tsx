'use client'

import { useState, useEffect } from 'react'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { DEFAULT_MODEL_ID } from '@/config/models'
import { useCustomChat } from '../hooks/useCustomChat'
import type { CustomMessage } from '../hooks/useCustomChat'

interface ChatInterfaceProps {
  conversationId: string
  initialMessages?: CustomMessage[]
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

  // Use custom chat hook that supports reasoning extraction
  const { messages, sendMessage, isStreaming, error, setMessages } = useCustomChat()

  // Set initial messages after hook initialization
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages)
    }
  }, [initialMessages, setMessages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input?.trim() || isStreaming) return

    const userMessage = input.trim()
    setInput('') // Clear input immediately

    try {
      // Send message with custom hook
      await sendMessage(userMessage, {
        conversationId,
        modelId: selectedModelId,
      })
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

      <MessageList messages={messages} isLoading={isStreaming} />

      <ChatInput
        input={input}
        isLoading={isStreaming}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
