'use client'

import { useState, useCallback } from 'react'

export interface CustomMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  thinking?: string
  timestamp: Date
}

export function useCustomChat() {
  const [messages, setMessages] = useState<CustomMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const sendMessage = useCallback(
    async (
      text: string,
      options: {
        conversationId?: string
        modelId?: string
      }
    ) => {
      setError(null)
      setIsStreaming(true)

      // Add user message immediately
      const userMessage: CustomMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date(),
      }

      // 🧠 Send FULL conversation history for context (current messages + new user message)
      const messagesToSend = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      console.log('[useCustomChat] Sending', messagesToSend.length, 'messages for context')

      // Update messages state with user message
      setMessages((prev) => [...prev, userMessage])

      // Prepare assistant message
      const assistantMessageId = `assistant-${Date.now()}`
      let accumulatedContent = ''
      let accumulatedReasoning = ''

      try {
        const requestBody = {
          messages: messagesToSend,
          conversationId: options.conversationId,
          modelId: options.modelId,
        }

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error('No response body')
        }

        // Add empty assistant message that we'll update
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            thinking: '',
            timestamp: new Date(),
          },
        ])

        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim()

              if (!jsonStr) continue

              try {
                const data = JSON.parse(jsonStr)

                if (data.type === 'content' && data.delta) {
                  accumulatedContent += data.delta
                  // Update message with new content
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  )
                } else if (data.type === 'reasoning' && data.delta) {
                  accumulatedReasoning += data.delta
                  // Update message with new reasoning
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, thinking: accumulatedReasoning }
                        : msg
                    )
                  )
                } else if (data.type === 'error') {
                  throw new Error(data.error || 'Stream error')
                } else if (data.type === 'done') {
                  console.log('[useCustomChat] Stream completed')
                }
              } catch (parseError) {
                console.error('[useCustomChat] JSON parse error:', parseError)
              }
            }
          }
        }
      } catch (err) {
        console.error('[useCustomChat] Error:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsStreaming(false)
      }
    },
    []
  )

  return {
    messages,
    sendMessage,
    isStreaming,
    error,
    setMessages,
  }
}
