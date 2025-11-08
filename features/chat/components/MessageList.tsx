'use client'

import { useEffect, useRef } from 'react'
import { Message } from './Message'
import { TypingIndicator } from '@/shared/components/TypingIndicator'
import type { UIMessage as MessageType } from '@ai-sdk/react'

interface MessageListProps {
  messages: MessageType[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 mx-auto flex items-center justify-center glass">
            <svg className="w-8 h-8 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)]">Start a conversation</h3>
          <p className="text-[var(--text-muted)] text-sm">
            Type a message below to begin chatting with your AI assistant
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((message, index) => {
          // Extract thinking from experimental_providerMetadata (Anthropic extended thinking)
          const thinking = (message as any).experimental_providerMetadata?.anthropic?.thinking

          // AI SDK 5.0: Extract content from parts array
          let content = ''
          if ((message as any).parts && Array.isArray((message as any).parts)) {
            content = (message as any).parts
              .filter((part: any) => part.type === 'text')
              .map((part: any) => part.text)
              .join('')
          } else if ((message as any).content) {
            // Fallback for old format
            content = (message as any).content
          }

          return (
            <Message
              key={message.id || index}
              role={message.role as 'user' | 'assistant' | 'system'}
              content={content}
              thinking={thinking}
              timestamp={(message as any).createdAt?.toISOString()}
            />
          )
        })}

      {isLoading && <TypingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  )
}
